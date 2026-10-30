"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { MILESTONE_STATUSES, TASK_STATUSES } from "@/lib/domain";
import { milestoneSchema, optText, projectCreateSchema, projectUpdateSchema, uuid } from "@/lib/schemas";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaffWriter } from "@/lib/server/auth";
import { PlanningError, addComment, createTask, deleteTask, updateTask } from "@/lib/planning/service";
import { commentSchema, createTaskSchema, updateTaskSchema } from "@/lib/planning/schemas";

function revalidateProject(projectId: string, orgId?: string) {
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath("/tasks");
  if (orgId) revalidatePath(`/clients/${orgId}`);
  revalidatePath("/portal", "layout");
}

/** PlanningError → ActionError (readable message). */
async function planning<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof PlanningError) throw new ActionError(err.message);
    throw err;
  }
}

export async function createProject(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const res = await runAction(async () => {
    const { supabase, user } = await requireStaffWriter();
    const input = projectCreateSchema.parse(formToObject(formData));
    const { data, error } = await supabase
      .from("projects")
      .insert({
        organization_id: input.organization_id,
        code: input.code,
        name: input.name,
        description: input.description,
        status: input.status,
        start_date: input.start_date,
        end_date: input.end_date,
        budget_cents: input.budget,
        owner_id: input.owner_id ?? user.id,
      })
      .select("id")
      .single();
    if (error?.code === "23505") throw new ActionError(`Le code projet « ${input.code} » est déjà utilisé.`);
    const project = check({ data, error }) as { id: string };
    revalidateProject(project.id, input.organization_id);
    return project.id;
  });
  if (res.ok && res.data) redirect(`/projects/${res.data}`);
  return res.ok ? { ok: true } : res;
}

export async function updateProject(projectId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const id = uuid.parse(projectId);
    const { budget, ...input } = projectUpdateSchema.parse(formToObject(formData));
    const row = check(
      await supabase.from("projects").update({ ...input, budget_cents: budget }).eq("id", id).select("organization_id").maybeSingle(),
    );
    if (!row) throw new ActionError("Projet introuvable.");
    revalidateProject(id, row.organization_id);
    return undefined;
  }, "Projet mis à jour.");
}

export async function updateProjectInternal(projectId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase, user } = await requireStaffWriter();
    const id = uuid.parse(projectId);
    const notes = optText(50000).parse(formData.get("internal_notes") ?? undefined);
    check(await supabase.from("project_internal").upsert({ project_id: id, internal_notes: notes, updated_by: user.id }));
    revalidatePath(`/projects/${id}`);
    return undefined;
  }, "Notes internes enregistrées.");
}

// --- Milestones ------------------------------------------------------------------------

export async function addMilestone(projectId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const id = uuid.parse(projectId);
    const input = milestoneSchema.parse(formToObject(formData));
    const { count } = await supabase.from("project_milestones").select("id", { count: "exact", head: true }).eq("project_id", id);
    check(
      await supabase.from("project_milestones").insert({
        ...input,
        project_id: id, // organization_id is derived from the project by trigger
        position: count ?? 0,
        completed_at: input.status === "done" ? new Date().toISOString() : null,
      }),
    );
    revalidateProject(id);
    return undefined;
  }, "Jalon ajouté.");
}

export async function setMilestoneStatus(milestoneId: string, status: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const next = z.enum(MILESTONE_STATUSES).parse(status);
    const row = check(
      await supabase
        .from("project_milestones")
        .update({ status: next, completed_at: next === "done" ? new Date().toISOString() : null })
        .eq("id", uuid.parse(milestoneId))
        .select("project_id")
        .maybeSingle(),
    );
    if (!row) throw new ActionError("Jalon introuvable.");
    revalidateProject(row.project_id);
    return undefined;
  }, "Jalon mis à jour.");
}

export async function deleteMilestone(milestoneId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const row = check(
      await supabase.from("project_milestones").delete().eq("id", uuid.parse(milestoneId)).select("project_id").maybeSingle(),
    );
    if (row) revalidateProject(row.project_id);
    return undefined;
  }, "Jalon supprimé.");
}

// --- Tasks (planning module) -------------------------------------------------------------

const taskFormSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  priority: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  assignee_id: z.string().optional(),
  milestone_id: z.string().optional(),
  due_date: z.string().optional(),
  client_visible: z.string().optional(),
});

export async function addTask(projectId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase, user } = await requireStaffWriter();
    const f = taskFormSchema.parse(formToObject(formData));
    const input = createTaskSchema.parse({
      project_id: uuid.parse(projectId),
      title: f.title,
      description: f.description ?? null,
      priority: f.priority,
      type: f.type,
      status: f.status,
      assignee_id: f.assignee_id ?? null,
      milestone_id: f.milestone_id ?? null,
      due_date: f.due_date ?? null,
      client_visible: f.client_visible === "on",
    });
    await planning(() => createTask(supabase, input, user.id));
    revalidateProject(projectId);
    return undefined;
  }, "Tâche créée.");
}

export async function editTask(taskId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const f = taskFormSchema.parse(formToObject(formData));
    const patch = updateTaskSchema.parse({
      title: f.title,
      description: f.description ?? null,
      priority: f.priority,
      type: f.type,
      status: f.status,
      assignee_id: f.assignee_id ?? null,
      milestone_id: f.milestone_id ?? null,
      due_date: f.due_date ?? null,
      client_visible: f.client_visible === "on",
    });
    const task = await planning(() => updateTask(supabase, uuid.parse(taskId), patch));
    revalidateProject(task.project_id);
    return undefined;
  }, "Tâche mise à jour.");
}

export async function setTaskStatus(taskId: string, status: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const next = z.enum(TASK_STATUSES).parse(status);
    const task = await planning(() => updateTask(supabase, uuid.parse(taskId), { status: next }));
    revalidateProject(task.project_id);
    return undefined;
  });
}

export async function removeTask(taskId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const id = uuid.parse(taskId);
    const { data } = await supabase.from("project_tasks").select("project_id").eq("id", id).maybeSingle();
    await planning(() => deleteTask(supabase, id));
    if (data) revalidateProject(data.project_id);
    return undefined;
  }, "Tâche supprimée.");
}

export async function commentTask(taskId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase, user } = await requireStaffWriter();
    const { body } = commentSchema.parse({ body: formData.get("body") ?? "" });
    const comment = await planning(() => addComment(supabase, uuid.parse(taskId), body, user.id));
    const { data } = await supabase.from("project_tasks").select("project_id").eq("id", comment.task_id).maybeSingle();
    if (data) revalidatePath(`/projects/${data.project_id}`);
    return undefined;
  }, "Commentaire ajouté.");
}
