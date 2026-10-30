import { describe, expect, it } from "vitest";
import { createTaskSchema, updateTaskSchema } from "@/lib/planning/schemas";
import { PlanningError, addComment, createTask, listTasks, resolveTask, updateTask } from "@/lib/planning/service";
import {
  MILESTONE_ACME,
  MILESTONE_OTHER,
  ORG_ACME,
  PROJECT_ACME,
  PROJECT_OTHER,
  USER_EVAN,
  createFakeSupabase,
  seedPlanning,
} from "../helpers/fake-supabase";

function setup() {
  const db = seedPlanning();
  return { db, client: createFakeSupabase(db) as never };
}

describe("planning service (project_tasks)", () => {
  it("creates a task numbered per project and inherits the organization", async () => {
    const { client } = setup();
    const task = await createTask(client, createTaskSchema.parse({ project_id: PROJECT_ACME, title: "Atelier cadrage" }), USER_EVAN);
    expect(task.number).toBe(7);
    expect(task.organization_id).toBe(ORG_ACME);
    expect(task.client_visible).toBe(false);
    expect(task.status).toBe("backlog");
    const second = await createTask(client, createTaskSchema.parse({ project_id: PROJECT_ACME, title: "POC" }), USER_EVAN);
    expect(second.number).toBe(8);
  });

  it("resolves tasks by key and by UUID", async () => {
    const { client } = setup();
    const task = await createTask(client, createTaskSchema.parse({ project_id: PROJECT_ACME, title: "T" }), null);
    expect((await resolveTask(client, "ACME-007")).id).toBe(task.id);
    expect((await resolveTask(client, "acme-7")).id).toBe(task.id);
    expect((await resolveTask(client, task.id)).title).toBe("T");
    await expect(resolveTask(client, "ACME-999")).rejects.toBeInstanceOf(PlanningError);
    await expect(resolveTask(client, "nope")).rejects.toThrow(/invalide/);
  });

  it("refuses a milestone of another project", async () => {
    const { client } = setup();
    await expect(
      createTask(client, createTaskSchema.parse({ project_id: PROJECT_ACME, title: "T", milestone_id: MILESTONE_OTHER }), null),
    ).rejects.toThrow(/autre projet/);
    const ok = await createTask(client, createTaskSchema.parse({ project_id: PROJECT_ACME, title: "T", milestone_id: MILESTONE_ACME }), null);
    expect(ok.milestone_id).toBe(MILESTONE_ACME);
  });

  it("updates and filters tasks", async () => {
    const { client } = setup();
    const a = await createTask(client, createTaskSchema.parse({ project_id: PROJECT_ACME, title: "A", assignee_id: USER_EVAN }), null);
    await createTask(client, createTaskSchema.parse({ project_id: PROJECT_OTHER, title: "B" }), null);
    const updated = await updateTask(client, "ACME-007", updateTaskSchema.parse({ status: "done", client_visible: true }));
    expect(updated.status).toBe("done");
    expect(updated.client_visible).toBe(true);

    expect((await listTasks(client, { project_id: PROJECT_ACME })).items.map((t) => t.id)).toEqual([a.id]);
    expect((await listTasks(client, { assignee_id: USER_EVAN })).items).toHaveLength(1);
    expect((await listTasks(client, { status: ["backlog"] })).items.map((t) => t.title)).toEqual(["B"]);
  });

  it("validates schedule order and unknown fields", () => {
    expect(createTaskSchema.safeParse({ project_id: PROJECT_ACME, title: "T", start_date: "2026-02-01", due_date: "2026-01-01" }).success).toBe(false);
    expect(updateTaskSchema.safeParse({ organization_id: ORG_ACME }).success).toBe(false);
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
  });

  it("adds internal comments", async () => {
    const { client, db } = setup();
    const task = await createTask(client, createTaskSchema.parse({ project_id: PROJECT_ACME, title: "T" }), null);
    const c = await addComment(client, "ACME-007", "RAS", USER_EVAN);
    expect(c.task_id).toBe(task.id);
    expect(db.tables.project_task_comments).toHaveLength(1);
  });
});
