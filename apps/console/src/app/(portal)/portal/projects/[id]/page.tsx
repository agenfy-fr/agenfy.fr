import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, CircleDot, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbLabel } from "@/components/nav/breadcrumb-label";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { DOCUMENT_KIND_LABELS, PROJECT_STATUS_META, TASK_STATUS_META, metaOf } from "@/lib/domain";
import { formatCents, formatDate } from "@/lib/format";
import { UUID_RE } from "@/lib/schemas";
import { PORTAL_PROJECT_STATUSES, portalScope } from "@/lib/server/portal";
import type { ClientDocument, Milestone } from "@/lib/types";

export const metadata: Metadata = { title: "Projet" };

const MILESTONE_ICON = { done: CheckCircle2, in_progress: CircleDot, planned: Circle } as const;

export default async function PortalProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase, orgIds } = await portalScope();

  // Explicit columns: never select internal fields, even if RLS would allow it.
  const { data: project } = await supabase
    .from("projects")
    .select("id, organization_id, name, description, status, progress, start_date, end_date, budget_cents, next_steps")
    .eq("id", id)
    .in("organization_id", orgIds)
    .in("status", PORTAL_PROJECT_STATUSES)
    .maybeSingle();
  if (!project) notFound();

  const [milestonesRes, tasksRes, docsRes] = await Promise.all([
    supabase
      .from("project_milestones")
      .select("id, title, description, status, due_date, position")
      .eq("project_id", id)
      .eq("client_visible", true)
      .order("position"),
    supabase
      .from("project_tasks")
      .select("id, title, status, due_date")
      .eq("project_id", id)
      .eq("client_visible", true)
      .neq("status", "done")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(20),
    supabase
      .from("client_documents")
      .select("id, title, kind, created_at, external_url")
      .eq("project_id", id)
      .eq("client_visible", true)
      .order("created_at", { ascending: false }),
  ]);
  const milestones = (milestonesRes.data ?? []) as Milestone[];
  const docs = (docsRes.data ?? []) as ClientDocument[];

  return (
    <div className="space-y-6">
      <BreadcrumbLabel label={project.name} />
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge {...metaOf(PROJECT_STATUS_META, project.status)} showDot />
        <span className="text-sm text-muted-foreground">
          {formatDate(project.start_date)} → {formatDate(project.end_date)}
          {project.budget_cents != null && ` · budget ${formatCents(project.budget_cents, { round: true })} HT`}
        </span>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-3">
            <div
              className="h-3 flex-1 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={project.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Avancement du projet"
            >
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-brand-accent" style={{ width: `${project.progress}%` }} />
            </div>
            <span className="text-lg font-semibold tabular-nums">{project.progress} %</span>
          </div>
          {project.description && <p className="whitespace-pre-wrap text-sm">{project.description}</p>}
          {project.next_steps && (
            <div className="rounded-lg bg-primary/5 p-4 text-sm">
              <p className="mb-1 font-medium">Prochaines étapes</p>
              <p className="whitespace-pre-wrap">{project.next_steps}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jalons</CardTitle>
          </CardHeader>
          <CardContent>
            {milestones.length === 0 ? (
              <EmptyState title="Jalons à venir" className="p-4" />
            ) : (
              <ol className="space-y-3">
                {milestones.map((m) => {
                  const Icon = MILESTONE_ICON[m.status] ?? Circle;
                  return (
                    <li key={m.id} className="flex gap-3 text-sm">
                      <Icon
                        className={m.status === "done" ? "mt-0.5 h-4 w-4 text-emerald-600" : m.status === "in_progress" ? "mt-0.5 h-4 w-4 text-primary" : "mt-0.5 h-4 w-4 text-muted-foreground"}
                        aria-label={m.status === "done" ? "Terminé" : m.status === "in_progress" ? "En cours" : "À venir"}
                      />
                      <div>
                        <p className="font-medium">{m.title}</p>
                        {m.due_date && <p className="text-xs text-muted-foreground">{formatDate(m.due_date)}</p>}
                        {m.description && <p className="mt-1 text-muted-foreground">{m.description}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">En cours chez Agenfy</CardTitle>
          </CardHeader>
          <CardContent>
            {(tasksRes.data ?? []).length === 0 ? (
              <EmptyState title="Rien à signaler pour le moment" className="p-4" />
            ) : (
              <ul className="divide-y text-sm">
                {(tasksRes.data ?? []).map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-2">
                    <span>{t.title}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      {t.due_date && <span className="text-xs text-muted-foreground">{formatDate(t.due_date)}</span>}
                      <StatusBadge size="sm" {...metaOf(TASK_STATUS_META, t.status)} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Livrables</CardTitle>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <EmptyState icon={<FileText className="h-6 w-6" />} title="Aucun livrable pour le moment" className="p-4" />
          ) : (
            <ul className="divide-y text-sm">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2">
                  <a href={`/api/documents/${d.id}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                    {d.title}
                  </a>
                  <span className="text-xs text-muted-foreground">
                    {DOCUMENT_KIND_LABELS[d.kind]} · {formatDate(d.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
