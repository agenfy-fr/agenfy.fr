import type { Metadata } from "next";
import Link from "next/link";
import { ListTodo } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, DataTableHead, Td, Th, Tr } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { TASK_PRIORITY_META, TASK_STATUSES, TASK_STATUS_META, formatTaskKey, metaOf } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { requireStaffPage } from "@/lib/server/auth";
import { displayName, getStaffDirectory } from "@/lib/server/directory";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tâches" };

const SCOPES = [
  { value: "mine", label: "Mes tâches" },
  { value: "open", label: "Toutes (en cours)" },
  { value: "all", label: "Toutes" },
] as const;

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ scope?: string }> }) {
  const { supabase, user } = await requireStaffPage("/tasks");
  const { scope: rawScope } = await searchParams;
  const scope = SCOPES.some((s) => s.value === rawScope) ? rawScope! : "mine";

  let q = supabase
    .from("project_tasks")
    .select("id, number, title, status, priority, due_date, assignee_id, agent_assignee, project_id, projects(code, name)")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(300);
  if (scope === "mine") q = q.eq("assignee_id", user.id).neq("status", "done");
  if (scope === "open") q = q.neq("status", "done");
  const [{ data }, staff] = await Promise.all([q, getStaffDirectory(supabase)]);
  const staffById = new Map(staff.map((s) => [s.id, s]));
  const tasks = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tâches"
        description="Toutes les tâches des projets clients. Créez et organisez-les depuis chaque projet (ou via le serveur MCP)."
        actions={
          <nav aria-label="Filtre" className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
            {SCOPES.map((s) => (
              <Link
                key={s.value}
                href={`/tasks?scope=${s.value}`}
                aria-current={scope === s.value ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1",
                  scope === s.value ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
              </Link>
            ))}
          </nav>
        }
      />
      <Card className="overflow-hidden">
        {tasks.length === 0 ? (
          <EmptyState icon={<ListTodo className="h-6 w-6" />} title="Aucune tâche" />
        ) : (
          <DataTable label="Liste des tâches">
            <DataTableHead>
              <tr>
                <Th>Clé</Th>
                <Th>Titre</Th>
                <Th>Projet</Th>
                <Th>Statut</Th>
                <Th>Priorité</Th>
                <Th>Assignée</Th>
                <Th>Échéance</Th>
              </tr>
            </DataTableHead>
            <tbody>
              {[...tasks]
                .sort((a, b) => TASK_STATUSES.indexOf(a.status) - TASK_STATUSES.indexOf(b.status))
                .map((t) => {
                  const project = t.projects as unknown as { code: string; name: string } | null;
                  return (
                    <Tr key={t.id}>
                      <Td className="whitespace-nowrap font-mono text-xs text-muted-foreground">{formatTaskKey(project?.code, t.number)}</Td>
                      <Td>
                        <Link href={`/projects/${t.project_id}`} className="hover:underline">
                          {t.title}
                        </Link>
                      </Td>
                      <Td muted>{project?.name}</Td>
                      <Td>
                        <StatusBadge size="sm" {...metaOf(TASK_STATUS_META, t.status)} />
                      </Td>
                      <Td>
                        <StatusBadge size="sm" {...metaOf(TASK_PRIORITY_META, t.priority)} />
                      </Td>
                      <Td muted>{t.assignee_id ? displayName(staffById.get(t.assignee_id)) : (t.agent_assignee ?? "—")}</Td>
                      <Td muted>{formatDate(t.due_date)}</Td>
                    </Tr>
                  );
                })}
            </tbody>
          </DataTable>
        )}
      </Card>
    </div>
  );
}
