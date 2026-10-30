"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Eye, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActionButton, ActionForm } from "@/components/shared/action-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { Field, FormGrid } from "@/components/shared/field";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_META,
  TASK_STATUSES,
  TASK_STATUS_META,
  TASK_TYPES,
  TASK_TYPE_LABELS,
  formatTaskKey,
  type TaskStatus,
} from "@/lib/domain";
import { formatDate, formatDateTime } from "@/lib/format";
import { toast } from "@/lib/toast";
import type { Milestone, StaffMember, Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { addTask, commentTask, editTask, removeTask, setTaskStatus } from "./actions";

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}

function TaskFields({ task, staff, milestones }: { task?: Task; staff: StaffMember[]; milestones: Milestone[] }) {
  return (
    <>
      <Field label="Titre" htmlFor="t-title">
        <Input id="t-title" name="title" defaultValue={task?.title} required />
      </Field>
      <FormGrid>
        <Field label="Statut" htmlFor="t-status">
          <NativeSelect id="t-status" name="status" defaultValue={task?.status ?? "backlog"}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_META[s].label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Priorité" htmlFor="t-priority">
          <NativeSelect id="t-priority" name="priority" defaultValue={task?.priority ?? "medium"}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {TASK_PRIORITY_META[p].label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Type" htmlFor="t-type">
          <NativeSelect id="t-type" name="type" defaultValue={task?.type ?? "task"}>
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>
                {TASK_TYPE_LABELS[t]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Assignée à" htmlFor="t-assignee">
          <NativeSelect id="t-assignee" name="assignee_id" defaultValue={task?.assignee_id ?? ""}>
            <option value="">—</option>
            {staff
              .filter((s) => !s.suspended)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.email}
                </option>
              ))}
          </NativeSelect>
        </Field>
        <Field label="Jalon" htmlFor="t-milestone">
          <NativeSelect id="t-milestone" name="milestone_id" defaultValue={task?.milestone_id ?? ""}>
            <option value="">—</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Échéance" htmlFor="t-due">
          <Input id="t-due" name="due_date" type="date" defaultValue={task?.due_date ?? ""} />
        </Field>
      </FormGrid>
      <Field label="Description (Markdown)" htmlFor="t-desc">
        <Textarea id="t-desc" name="description" rows={4} defaultValue={task?.description ?? ""} />
      </Field>
      <div className="flex items-center gap-2">
        <Checkbox id="t-visible" name="client_visible" defaultChecked={task?.client_visible ?? false} />
        <Label htmlFor="t-visible" className="font-normal">
          Visible par le client (titre, statut, description et échéance)
        </Label>
      </div>
    </>
  );
}

export function TaskBoard({
  projectId,
  projectCode,
  tasks,
  staff,
  milestones,
  comments,
  canEdit,
}: {
  projectId: string;
  projectCode: string;
  tasks: Task[];
  staff: StaffMember[];
  milestones: Milestone[];
  comments: TaskComment[];
  canEdit: boolean;
}) {
  const [optimistic, moveTask] = useOptimistic(tasks, (state, { id, status }: { id: string; status: TaskStatus }) =>
    state.map((t) => (t.id === id ? { ...t, status } : t)),
  );
  const [, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = optimistic.find((t) => t.id === openId) ?? null;
  const staffById = new Map(staff.map((s) => [s.id, s]));

  const move = (id: string, status: TaskStatus) => {
    const task = optimistic.find((t) => t.id === id);
    if (!task || task.status === status) return;
    startTransition(async () => {
      moveTask({ id, status });
      const res = await setTaskStatus(id, status);
      if (!res.ok) toast.error(res.error);
    });
  };

  return (
    <div className="space-y-3">
      {canEdit && (
        <div className="flex justify-end">
          <FormDialog
            trigger={<><Plus className="h-4 w-4" aria-hidden="true" /> Nouvelle tâche</>}
            triggerProps={{ size: "sm" }}
            title="Nouvelle tâche"
            action={addTask.bind(null, projectId)}
            submitLabel="Créer"
            wide
          >
            <TaskFields staff={staff} milestones={milestones} />
          </FormDialog>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {TASK_STATUSES.map((status) => {
          const items = optimistic.filter((t) => t.status === status);
          return (
            <section
              key={status}
              aria-label={`${TASK_STATUS_META[status].label} (${items.length})`}
              onDragOver={(e) => {
                if (!canEdit) return;
                e.preventDefault();
                setDragOver(status);
              }}
              onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const id = e.dataTransfer.getData("text/plain");
                if (id) move(id, status);
              }}
              className={cn("flex min-h-32 flex-col rounded-xl border bg-muted/40", dragOver === status && "border-primary bg-primary/5")}
            >
              <header className="flex items-center justify-between px-3 py-2">
                <StatusBadge size="sm" {...TASK_STATUS_META[status]} showDot />
                <span className="text-xs tabular-nums text-muted-foreground">{items.length}</span>
              </header>
              <ul className="flex flex-col gap-2 px-2 pb-2">
                {items.map((t) => {
                  const assignee = t.assignee_id ? staffById.get(t.assignee_id) : null;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        draggable={canEdit}
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                        onClick={() => setOpenId(t.id)}
                        className="w-full rounded-lg border bg-background p-2.5 text-left text-sm shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                          <span className="font-mono">{formatTaskKey(projectCode, t.number)}</span>
                          <span className="flex items-center gap-1">
                            {t.client_visible && <Eye className="h-3 w-3" aria-label="Visible client" />}
                            <StatusBadge size="sm" {...TASK_PRIORITY_META[t.priority]} />
                          </span>
                        </div>
                        <p className="mt-1 font-medium leading-snug">{t.title}</p>
                        <p className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                          <span className="truncate">{assignee ? assignee.full_name || assignee.email : t.agent_assignee ?? "Non assignée"}</span>
                          {t.due_date && <span>{formatDate(t.due_date)}</span>}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpenId(null)}>
        {open && (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                <span className="mr-2 font-mono text-sm text-muted-foreground">{formatTaskKey(projectCode, open.number)}</span>
                {open.title}
              </DialogTitle>
              <DialogDescription>
                Créée le {formatDate(open.created_at)}
                {open.completed_at && ` · terminée le ${formatDate(open.completed_at)}`}
              </DialogDescription>
            </DialogHeader>
            {canEdit ? (
              <ActionForm action={editTask.bind(null, open.id)} className="space-y-4" onSuccess={() => setOpenId(null)}>
                <TaskFields task={open} staff={staff} milestones={milestones} />
              </ActionForm>
            ) : (
              <p className="whitespace-pre-wrap text-sm">{open.description ?? "Pas de description."}</p>
            )}

            <section className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-semibold">Commentaires internes</h3>
              <ul className="space-y-2">
                {comments
                  .filter((c) => c.task_id === open.id)
                  .map((c) => {
                    const author = c.author_id ? staffById.get(c.author_id) : null;
                    return (
                      <li key={c.id} className="rounded-md bg-muted/60 p-2 text-sm">
                        <p className="text-xs text-muted-foreground">
                          {author ? author.full_name || author.email : "—"} · {formatDateTime(c.created_at)}
                        </p>
                        <p className="whitespace-pre-wrap">{c.body}</p>
                      </li>
                    );
                  })}
              </ul>
              {canEdit && (
                <ActionForm action={commentTask.bind(null, open.id)} resetOnSuccess submitLabel="Commenter" submitProps={{ size: "sm", variant: "outline" }}>
                  <Label htmlFor="t-comment" className="sr-only">
                    Commentaire
                  </Label>
                  <Textarea id="t-comment" name="body" rows={2} placeholder="Commentaire interne (jamais visible du client)" required />
                </ActionForm>
              )}
            </section>

            {canEdit && (
              <div className="flex justify-start border-t pt-4">
                <ActionButton
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  confirm="Supprimer définitivement cette tâche ?"
                  action={() => removeTask(open.id)}
                  onSuccess={() => setOpenId(null)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer la tâche
                </ActionButton>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
