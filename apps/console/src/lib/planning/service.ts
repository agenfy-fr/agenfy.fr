/**
 * Planning — data access shared by:
 *   - the UI server actions (session client → staff RLS applies),
 *   - the MCP server (/api/mcp, service_role client authenticated upstream
 *     by a personal API token, see ./api-tokens.ts).
 *
 * SCOPE: this module only reads/writes projects (read), project_milestones
 * (read), project_tasks and project_task_comments. That bounds what an MCP
 * token can do even with a service_role client.
 *
 * Invariants live in the database (0100: numbering, organization inheritance,
 * milestone ↔ project consistency); checks here only produce readable errors.
 */
import "server-only";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { formatTaskKey, parseTaskKey } from "@/lib/domain";
import { UUID_RE } from "@/lib/schemas";
import type { Project, Task } from "@/lib/types";
import type { CreateTaskData, UpdateTaskData } from "./schemas";

export type PlanningErrorCode = "NOT_FOUND" | "VALIDATION" | "CONFLICT" | "DB";

export class PlanningError extends Error {
  constructor(
    message: string,
    public readonly code: PlanningErrorCode,
    public readonly status: number,
  ) {
    super(message);
    this.name = "PlanningError";
  }
}

const notFound = (what: string) => new PlanningError(`${what} introuvable`, "NOT_FOUND", 404);
const invalid = (msg: string) => new PlanningError(msg, "VALIDATION", 400);

export function mapDbError(error: PostgrestError): PlanningError {
  switch (error.code) {
    case "23514":
      if (/schedule_range_check/.test(error.message)) return invalid("La date de début doit précéder l'échéance");
      return invalid(/[àéèêç]/.test(error.message) ? error.message : "Valeur refusée par une contrainte de la base");
    case "23503":
      return invalid("Référence invalide (projet, jalon ou membre inexistant)");
    case "23505":
      return new PlanningError("Conflit : cette valeur existe déjà", "CONFLICT", 409);
    case "23502":
      return invalid("Champ obligatoire manquant");
    case "22P02":
      return invalid("Format de valeur invalide");
    case "42501":
      return new PlanningError("Action non autorisée pour votre rôle", "VALIDATION", 403);
    default:
      console.error("[planning] DB error", error.code, error.message);
      return new PlanningError("Erreur base de données", "DB", 500);
  }
}

type Db = SupabaseClient;

export const TASK_COLUMNS =
  "id, organization_id, project_id, milestone_id, number, title, description, type, status, priority, assignee_id, reporter_id, start_date, due_date, estimate_hours, labels, order_index, client_visible, agent_assignee, completed_at, created_at, updated_at";

export const PROJECT_COLUMNS =
  "id, organization_id, code, name, description, status, progress, start_date, end_date, budget_cents, owner_id, next_steps, created_at, updated_at";

export type ProjectRef = Pick<Project, "id" | "code" | "name" | "organization_id" | "status">;

export async function listProjects(db: Db, opts: { includeClosed?: boolean } = {}): Promise<ProjectRef[]> {
  let q = db.from("projects").select("id, code, name, organization_id, status").order("name");
  if (!opts.includeClosed) q = q.in("status", ["draft", "active", "on_hold"]);
  const { data, error } = await q;
  if (error) throw mapDbError(error);
  return (data ?? []) as ProjectRef[];
}

/** Project by UUID or by code ("ACME", case-insensitive). */
export async function resolveProject(db: Db, ref: string): Promise<ProjectRef> {
  const q = db.from("projects").select("id, code, name, organization_id, status");
  const trimmed = ref.trim();
  const { data, error } = UUID_RE.test(trimmed)
    ? await q.eq("id", trimmed).maybeSingle()
    : await q.eq("code", trimmed.toUpperCase()).maybeSingle();
  if (error) throw mapDbError(error);
  if (!data) throw notFound(`Projet « ${ref} »`);
  return data as ProjectRef;
}

/** Task by UUID or by key ("ACME-007"). */
export async function resolveTask(db: Db, ref: string): Promise<Task> {
  const trimmed = ref.trim();
  if (UUID_RE.test(trimmed)) {
    const { data, error } = await db.from("project_tasks").select(TASK_COLUMNS).eq("id", trimmed).maybeSingle();
    if (error) throw mapDbError(error);
    if (!data) throw notFound(`Tâche ${trimmed}`);
    return data as Task;
  }
  const key = parseTaskKey(trimmed);
  if (!key) throw invalid(`Référence de tâche invalide : « ${ref} » (attendu : UUID ou clé type ACME-007)`);
  const project = await resolveProject(db, key.code);
  const { data, error } = await db
    .from("project_tasks")
    .select(TASK_COLUMNS)
    .eq("project_id", project.id)
    .eq("number", key.number)
    .maybeSingle();
  if (error) throw mapDbError(error);
  if (!data) throw notFound(`Tâche ${formatTaskKey(key.code, key.number)}`);
  return data as Task;
}

export interface TaskFilters {
  project_id?: string;
  organization_id?: string;
  status?: readonly string[];
  assignee_id?: string | null;
  limit?: number;
  offset?: number;
}

export async function listTasks(db: Db, f: TaskFilters = {}): Promise<{ items: Task[]; total: number | null }> {
  const limit = Math.min(f.limit ?? 100, 500);
  const offset = f.offset ?? 0;
  let q = db.from("project_tasks").select(TASK_COLUMNS, { count: "exact" });
  if (f.project_id) q = q.eq("project_id", f.project_id);
  if (f.organization_id) q = q.eq("organization_id", f.organization_id);
  if (f.status?.length) q = q.in("status", [...f.status]);
  if (f.assignee_id !== undefined) q = f.assignee_id === null ? q.is("assignee_id", null) : q.eq("assignee_id", f.assignee_id);
  const { data, error, count } = await q
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);
  if (error) throw mapDbError(error);
  return { items: (data ?? []) as Task[], total: count ?? null };
}

async function assertMilestoneInProject(db: Db, milestoneId: string | null | undefined, projectId: string) {
  if (!milestoneId) return;
  const { data, error } = await db.from("project_milestones").select("id, project_id").eq("id", milestoneId).maybeSingle();
  if (error) throw mapDbError(error);
  if (!data) throw notFound("Jalon");
  if (data.project_id !== projectId) throw invalid("Le jalon appartient à un autre projet");
}

export async function createTask(db: Db, input: CreateTaskData, reporterId: string | null): Promise<Task> {
  const project = await resolveProject(db, input.project_id);
  await assertMilestoneInProject(db, input.milestone_id, project.id);
  const { data, error } = await db
    .from("project_tasks")
    .insert({
      project_id: project.id,
      // organization_id and number are set by the project_tasks_guard trigger.
      organization_id: project.organization_id,
      number: 0,
      title: input.title,
      description: input.description ?? null,
      type: input.type,
      status: input.status,
      priority: input.priority,
      assignee_id: input.assignee_id ?? null,
      reporter_id: reporterId,
      milestone_id: input.milestone_id ?? null,
      start_date: input.start_date ?? null,
      due_date: input.due_date ?? null,
      estimate_hours: input.estimate_hours ?? null,
      labels: input.labels,
      client_visible: input.client_visible,
    })
    .select(TASK_COLUMNS)
    .single();
  if (error) throw mapDbError(error);
  return data as Task;
}

export async function updateTask(db: Db, ref: string, patch: UpdateTaskData): Promise<Task> {
  const current = await resolveTask(db, ref);
  if (patch.milestone_id) await assertMilestoneInProject(db, patch.milestone_id, current.project_id);
  const { data, error } = await db.from("project_tasks").update(patch).eq("id", current.id).select(TASK_COLUMNS).single();
  if (error) throw mapDbError(error);
  return data as Task;
}

export async function deleteTask(db: Db, ref: string): Promise<void> {
  const current = await resolveTask(db, ref);
  const { error } = await db.from("project_tasks").delete().eq("id", current.id);
  if (error) throw mapDbError(error);
}

export async function addComment(db: Db, taskRef: string, body: string, authorId: string | null) {
  const task = await resolveTask(db, taskRef);
  const { data, error } = await db
    .from("project_task_comments")
    .insert({ task_id: task.id, body, author_id: authorId })
    .select("id, task_id, author_id, body, created_at")
    .single();
  if (error) throw mapDbError(error);
  return data as { id: string; task_id: string; author_id: string | null; body: string; created_at: string };
}

export async function listComments(db: Db, taskId: string) {
  const { data, error } = await db
    .from("project_task_comments")
    .select("id, task_id, author_id, body, created_at")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  if (error) throw mapDbError(error);
  return (data ?? []) as { id: string; task_id: string; author_id: string | null; body: string; created_at: string }[];
}
