/**
 * MCP server `agenfy-console` — clients, projects, planning tasks, leads and
 * KPIs for Claude Code and any Streamable HTTP MCP client.
 *
 * Built per request (stateless) for a principal already authenticated by a
 * personal API token (see /api/mcp). The service_role client bypasses RLS, so
 * every tool is bounded by: token scopes (console:read / console:write), the
 * owner's current staff role (ROLE_ACCESS / write roles) and the explicit
 * table list of each tool. Billing and client-portal data are not exposed.
 */
import "server-only";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { LEAD_WRITE_ROLES } from "@/lib/access-control";
import { LEAD_STATUSES, PROJECT_STATUSES, TASK_PRIORITIES, TASK_STATUSES, TASK_TYPES, formatTaskKey } from "@/lib/domain";
import { loadDashboardKpis } from "@/lib/server/kpis";
import { ilikeTerm } from "@/lib/search";
import { UUID_RE } from "@/lib/schemas";
import { commentSchema, createTaskSchema, updateTaskSchema } from "@/lib/planning/schemas";
import {
  PROJECT_COLUMNS,
  addComment,
  createTask,
  listComments,
  listTasks,
  resolveProject,
  resolveTask,
  updateTask,
} from "@/lib/planning/service";
import type { Task } from "@/lib/types";
import { ToolError, dbCheck, defineTool, page, pageInput, type ConsoleMcpContext } from "./core";

export const MCP_SERVER_NAME = "agenfy-console";
export const MCP_SERVER_VERSION = "0.1.0";

const INSTRUCTIONS = `Agenfy Console — clients, projets, tâches (planning), leads.
- Les tâches sont identifiées par une clé "<CODE PROJET>-<NNN>" (ex. ACME-007) ou par UUID.
- Projets : code (ex. ACME) ou UUID. Une tâche appartient toujours à un projet client.
- Statuts de tâche : backlog, in_progress, review, done. Priorités : urgent, high, medium, low.
- assignee : "me" (propriétaire du jeton), un UUID de membre de l'équipe, ou null.
- client_visible = true rend la tâche visible du client dans son portail : ne jamais y mettre d'information interne.
- Les commentaires de tâche sont internes (jamais visibles du client).`;

const READ = { scopes: ["console:read"] } as const;
const WRITE = { scopes: ["console:write"], write: true } as const;

const projectRef = z.string().min(1).max(64).describe("Code projet (ex. ACME) ou UUID");
const taskRef = z.string().min(1).max(64).describe("Clé de tâche (ex. ACME-007) ou UUID");
const assigneeRef = z.string().max(64).nullable().describe('"me", UUID d\'un membre de l\'équipe, ou null');

export function buildMcpServer(ctx: ConsoleMcpContext): McpServer {
  const { db, principal } = ctx;
  const server = new McpServer({ name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION }, { instructions: INSTRUCTIONS });

  const resolveAssignee = (ref: string | null | undefined): string | null | undefined => {
    if (ref === undefined) return undefined;
    if (ref === null) return null;
    if (ref === "me") return principal.userId;
    if (UUID_RE.test(ref)) return ref;
    throw new ToolError(`Assignee invalide : « ${ref} » (attendu : "me", UUID ou null)`);
  };

  const codes = new Map<string, string>();
  const keyOf = async (t: Pick<Task, "project_id" | "number">) => {
    if (!codes.has(t.project_id)) {
      const { data } = await db.from("projects").select("code").eq("id", t.project_id).maybeSingle();
      codes.set(t.project_id, (data?.code as string | undefined) ?? "?");
    }
    return formatTaskKey(codes.get(t.project_id), t.number);
  };
  const withKey = async (t: Task) => ({ key: await keyOf(t), url: `${ctx.baseUrl}/projects/${t.project_id}`, ...t });

  // --- Clients ----------------------------------------------------------------------
  defineTool(server, ctx, "list_clients", {
    title: "Lister les clients",
    description: "Organisations clientes (recherche par nom).",
    input: { q: z.string().max(100).optional().describe("Recherche par nom"), ...pageInput },
    access: READ,
    handler: async ({ q, limit, offset }) => {
      let query = db.from("organizations").select("id, name, slug, sector, website, created_at", { count: "exact" });
      if (q) query = query.ilike("name", ilikeTerm(q));
      const res = await query.order("name").range(offset, offset + limit - 1);
      const rows = dbCheck(res, "organizations") ?? [];
      return { result: page(rows, res.count ?? null, limit, offset) };
    },
  });

  defineTool(server, ctx, "get_client", {
    title: "Fiche client",
    description: "Organisation, données CRM internes et projets.",
    input: { client: z.string().min(1).max(100).describe("UUID ou slug de l'organisation") },
    access: READ,
    handler: async ({ client }) => {
      const q = db.from("organizations").select("id, name, slug, siren, website, sector, size_band, created_at");
      const org = dbCheck(UUID_RE.test(client) ? await q.eq("id", client).maybeSingle() : await q.eq("slug", client).maybeSingle(), "organization");
      if (!org) throw new ToolError(`Client « ${client} » introuvable`);
      const [internal, projects] = await Promise.all([
        db.from("organization_internal").select("status, account_manager_id, internal_notes").eq("organization_id", org.id).maybeSingle(),
        db.from("projects").select("id, code, name, status, progress, start_date, end_date").eq("organization_id", org.id).order("created_at"),
      ]);
      return {
        result: { ...org, internal: dbCheck(internal, "organization_internal"), projects: dbCheck(projects, "projects") },
        targetId: org.id,
      };
    },
  });

  // --- Projects -------------------------------------------------------------------------
  defineTool(server, ctx, "list_projects", {
    title: "Lister les projets",
    description: "Projets clients avec leur code (préfixe des clés de tâche).",
    input: {
      client: z.string().regex(UUID_RE).optional().describe("UUID d'organisation"),
      status: z.array(z.enum(PROJECT_STATUSES)).optional(),
      ...pageInput,
    },
    access: READ,
    handler: async ({ client, status, limit, offset }) => {
      let q = db.from("projects").select("id, organization_id, code, name, status, progress, start_date, end_date, owner_id", { count: "exact" });
      if (client) q = q.eq("organization_id", client);
      if (status?.length) q = q.in("status", status);
      const res = await q.order("name").range(offset, offset + limit - 1);
      return { result: page(dbCheck(res, "projects") ?? [], res.count ?? null, limit, offset) };
    },
  });

  defineTool(server, ctx, "get_project", {
    title: "Détail d'un projet",
    description: "Projet, jalons et répartition des tâches par statut.",
    input: { project: projectRef },
    access: READ,
    handler: async ({ project }) => {
      const ref = await resolveProject(db, project);
      const [full, milestones, tasks] = await Promise.all([
        db.from("projects").select(PROJECT_COLUMNS).eq("id", ref.id).single(),
        db.from("project_milestones").select("id, title, status, due_date, client_visible").eq("project_id", ref.id).order("position"),
        db.from("project_tasks").select("status").eq("project_id", ref.id),
      ]);
      const counts: Record<string, number> = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0]));
      for (const t of (dbCheck(tasks, "tasks") ?? []) as { status: string }[]) counts[t.status] = (counts[t.status] ?? 0) + 1;
      return {
        result: { ...dbCheck(full, "project"), milestones: dbCheck(milestones, "milestones"), task_counts: counts },
        targetId: ref.id,
      };
    },
  });

  defineTool(server, ctx, "update_project", {
    title: "Mettre à jour un projet",
    description: "Avancement (0-100), statut, prochaines étapes (visibles du client).",
    input: {
      project: projectRef,
      progress: z.number().int().min(0).max(100).optional(),
      status: z.enum(PROJECT_STATUSES).optional(),
      next_steps: z.string().max(5000).nullable().optional(),
    },
    access: WRITE,
    handler: async ({ project, ...patch }) => {
      const ref = await resolveProject(db, project);
      const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
      if (Object.keys(clean).length === 0) throw new ToolError("Aucun champ à mettre à jour");
      const res = await db.from("projects").update(clean).eq("id", ref.id).select(PROJECT_COLUMNS).single();
      return { result: dbCheck(res, "project"), targetId: ref.id };
    },
  });

  // --- Tasks ----------------------------------------------------------------------------
  defineTool(server, ctx, "list_tasks", {
    title: "Lister les tâches",
    description: "Tâches filtrées par projet, statut, assignee.",
    input: {
      project: projectRef.optional(),
      status: z.array(z.enum(TASK_STATUSES)).optional(),
      assignee: assigneeRef.optional(),
      ...pageInput,
    },
    access: READ,
    handler: async ({ project, status, assignee, limit, offset }) => {
      const p = project ? await resolveProject(db, project) : null;
      const { items, total } = await listTasks(db, {
        project_id: p?.id,
        status,
        assignee_id: resolveAssignee(assignee),
        limit,
        offset,
      });
      return { result: page(await Promise.all(items.map(withKey)), total, limit, offset) };
    },
  });

  defineTool(server, ctx, "get_task", {
    title: "Détail d'une tâche",
    description: "Tâche et commentaires internes.",
    input: { task: taskRef },
    access: READ,
    handler: async ({ task }) => {
      const t = await resolveTask(db, task);
      return { result: { ...(await withKey(t)), comments: await listComments(db, t.id) }, targetId: t.id };
    },
  });

  defineTool(server, ctx, "create_task", {
    title: "Créer une tâche",
    description: "Crée une tâche dans un projet client (Markdown accepté en description).",
    input: {
      project: projectRef,
      title: z.string().min(1).max(500),
      description: z.string().max(50_000).optional(),
      type: z.enum(TASK_TYPES).optional(),
      status: z.enum(TASK_STATUSES).optional(),
      priority: z.enum(TASK_PRIORITIES).optional(),
      assignee: assigneeRef.optional(),
      due_date: z.string().optional().describe("AAAA-MM-JJ"),
      client_visible: z.boolean().optional().describe("Visible du client dans son portail (défaut false)"),
    },
    access: WRITE,
    handler: async ({ project, assignee, ...rest }) => {
      const p = await resolveProject(db, project);
      const input = createTaskSchema.parse({ ...rest, project_id: p.id, assignee_id: resolveAssignee(assignee) });
      const created = await createTask(db, input, principal.userId);
      return { result: await withKey(created), targetId: created.id };
    },
  });

  defineTool(server, ctx, "update_task", {
    title: "Mettre à jour une tâche",
    description: "Modifie statut, priorité, assignee, dates, visibilité client…",
    input: {
      task: taskRef,
      title: z.string().min(1).max(500).optional(),
      description: z.string().max(50_000).nullable().optional(),
      status: z.enum(TASK_STATUSES).optional(),
      priority: z.enum(TASK_PRIORITIES).optional(),
      type: z.enum(TASK_TYPES).optional(),
      assignee: assigneeRef.optional(),
      due_date: z.string().nullable().optional(),
      client_visible: z.boolean().optional(),
    },
    access: WRITE,
    idempotent: true,
    handler: async ({ task, assignee, ...rest }) => {
      const patch = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
      const assigneeId = resolveAssignee(assignee);
      if (assigneeId !== undefined) patch.assignee_id = assigneeId;
      const updated = await updateTask(db, task, updateTaskSchema.parse(patch));
      return { result: await withKey(updated), targetId: updated.id };
    },
  });

  defineTool(server, ctx, "add_task_comment", {
    title: "Commenter une tâche",
    description: "Ajoute un commentaire interne (jamais visible du client).",
    input: { task: taskRef, body: z.string().min(1).max(20_000) },
    access: WRITE,
    handler: async ({ task, body }) => {
      const parsed = commentSchema.parse({ body });
      const comment = await addComment(db, task, parsed.body, principal.userId);
      return { result: comment, targetId: comment.task_id };
    },
  });

  // --- Leads ----------------------------------------------------------------------------
  defineTool(server, ctx, "list_leads", {
    title: "Lister les leads",
    description: "Leads issus du formulaire www.agenfy.fr et saisis à la main.",
    input: { status: z.array(z.enum(LEAD_STATUSES)).optional(), ...pageInput },
    access: { ...READ, section: "/leads" },
    handler: async ({ status, limit, offset }) => {
      let q = db
        .from("leads")
        .select("id, name, company, email, service, source, priority, status, created_at, organization_id", { count: "exact" });
      if (status?.length) q = q.in("status", status);
      const res = await q.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
      return { result: page(dbCheck(res, "leads") ?? [], res.count ?? null, limit, offset) };
    },
  });

  defineTool(server, ctx, "update_lead_status", {
    title: "Changer le statut d'un lead",
    description: "Déplace un lead dans le pipeline (Nouveau → … → Gagné / Perdu).",
    input: { lead: z.string().regex(UUID_RE), status: z.enum(LEAD_STATUSES) },
    access: { ...WRITE, section: "/leads", roles: LEAD_WRITE_ROLES },
    handler: async ({ lead, status }) => {
      const res = await db.from("leads").update({ status }).eq("id", lead).select("id, name, status").maybeSingle();
      const row = dbCheck(res, "lead");
      if (!row) throw new ToolError("Lead introuvable");
      return { result: row, targetId: lead };
    },
  });

  // --- Dashboard ------------------------------------------------------------------------
  defineTool(server, ctx, "dashboard_kpis", {
    title: "KPI du tableau de bord",
    description: "Leads du mois, pipeline, projets actifs, CA facturé de l'année (centimes).",
    access: READ,
    handler: async () => ({ result: await loadDashboardKpis(db) }),
  });

  return server;
}
