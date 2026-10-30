/**
 * Planning — task validation shared by the UI (server actions) and the MCP
 * server. Adapted from Hasfy Console (src/lib/planning/schemas.ts): issues are
 * now tasks of a client project (`project_tasks`, migration 0100).
 */
import { z } from "zod";
import { TASK_PRIORITIES, TASK_STATUSES, TASK_TYPES } from "@/lib/domain";
import { UUID_RE } from "@/lib/schemas";

export const MAX_TITLE = 500;
export const MAX_DESCRIPTION = 50_000;
export const MAX_LABELS = 20;

/** Agent identity (project_tasks.agent_assignee CHECK). */
export const AGENT_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._@:/-]{0,79}$/;

const uuid = z.string().regex(UUID_RE, { error: "Identifiant invalide" });

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date attendue au format AAAA-MM-JJ" })
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), { error: "Date invalide" });

export const labelsSchema = z
  .array(z.string().trim().min(1).max(40))
  .max(MAX_LABELS)
  .transform((labels) => {
    const seen = new Set<string>();
    return labels.filter((l) => {
      const k = l.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  });

function scheduleInOrder(v: { start_date?: string | null; due_date?: string | null }): boolean {
  return !v.start_date || !v.due_date || v.start_date <= v.due_date;
}
const SCHEDULE_ORDER_ERROR = { error: "La date de début doit précéder l'échéance", path: ["start_date"] };

const taskFields = {
  title: z.string().trim().min(1, { error: "Le titre est obligatoire" }).max(MAX_TITLE),
  description: z
    .string()
    .max(MAX_DESCRIPTION)
    .transform((s) => (s.trim() === "" ? null : s))
    .nullable(),
  type: z.enum(TASK_TYPES),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  assignee_id: uuid.nullable(),
  milestone_id: uuid.nullable(),
  start_date: isoDate.nullable(),
  due_date: isoDate.nullable(),
  estimate_hours: z.number().min(0).max(9999).nullable(),
  labels: labelsSchema,
  client_visible: z.boolean(),
  agent_assignee: z.string().trim().regex(AGENT_NAME_RE, { error: "Identité d'agent invalide" }).nullable(),
};

export const createTaskSchema = z
  .object({
    project_id: uuid,
    title: taskFields.title,
    description: taskFields.description.optional(),
    type: taskFields.type.default("task"),
    status: taskFields.status.default("backlog"),
    priority: taskFields.priority.default("medium"),
    assignee_id: taskFields.assignee_id.optional(),
    milestone_id: taskFields.milestone_id.optional(),
    start_date: taskFields.start_date.optional(),
    due_date: taskFields.due_date.optional(),
    estimate_hours: taskFields.estimate_hours.optional(),
    labels: labelsSchema.default([]),
    client_visible: taskFields.client_visible.default(false),
  })
  .refine(scheduleInOrder, SCHEDULE_ORDER_ERROR);
export type CreateTaskInput = z.input<typeof createTaskSchema>;
export type CreateTaskData = z.output<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({ ...taskFields, order_index: z.number().int().min(0).max(1_000_000) })
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, { error: "Aucun champ à mettre à jour" })
  .refine(scheduleInOrder, SCHEDULE_ORDER_ERROR);
export type UpdateTaskData = z.output<typeof updateTaskSchema>;

export const commentSchema = z.object({
  body: z.string().trim().min(1, { error: "Commentaire vide" }).max(20_000),
});
