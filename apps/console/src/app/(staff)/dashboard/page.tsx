import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Inbox, Magnet, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard, KpiGrid } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { canAccessRoute } from "@/lib/access-control";
import { LEAD_STATUSES, LEAD_STATUS_META, TASK_STATUS_META, formatTaskKey, metaOf } from "@/lib/domain";
import { formatCents, formatDate } from "@/lib/format";
import { requireStaffPage } from "@/lib/server/auth";
import { loadDashboardKpis } from "@/lib/server/kpis";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const { supabase, user, role } = await requireStaffPage("/dashboard");
  const showLeads = canAccessRoute(role, "/leads");
  const showBilling = canAccessRoute(role, "/billing");

  const [kpis, recentLeads, myTasks, openRequests] = await Promise.all([
    loadDashboardKpis(supabase),
    showLeads
      ? supabase.from("leads").select("id, name, company, status, created_at").order("created_at", { ascending: false }).limit(5)
      : Promise.resolve({ data: [] as { id: string; name: string; company: string | null; status: string; created_at: string }[] }),
    supabase
      .from("project_tasks")
      .select("id, number, title, status, due_date, project_id, projects(code)")
      .eq("assignee_id", user.id)
      .neq("status", "done")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(6),
    supabase
      .from("client_requests")
      .select("id, subject, status, created_at, organizations(name)")
      .in("status", ["open", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const maxPipeline = Math.max(1, ...LEAD_STATUSES.map((s) => kpis.pipeline[s]));

  return (
    <div className="space-y-6">
      <KpiGrid>
        {showLeads && <KpiCard label="Leads du mois" value={kpis.leadsThisMonth} icon={<Magnet />} hint={`${kpis.openPipeline} dans le pipeline`} />}
        <KpiCard label="Projets actifs" value={kpis.activeProjects} icon={<FolderKanban />} />
        {showBilling && (
          <KpiCard
            label="CA facturé (année, TTC)"
            value={formatCents(kpis.invoicedYearCents, { round: true })}
            icon={<Receipt />}
            hint={`${formatCents(kpis.invoicedYearHtCents, { round: true })} HT · ${formatCents(kpis.paidYearCents, { round: true })} encaissés`}
          />
        )}
        <KpiCard label="Demandes clients ouvertes" value={kpis.openRequests} icon={<Inbox />} tone={kpis.openRequests > 0 ? "warn" : "default"} />
      </KpiGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        {showLeads && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pipeline commercial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {LEAD_STATUSES.map((s) => (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 text-muted-foreground">{LEAD_STATUS_META[s].label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(kpis.pipeline[s] / maxPipeline) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right tabular-nums">{kpis.pipeline[s]}</span>
                </div>
              ))}
              {showBilling && kpis.outstandingCents > 0 && (
                <p className="pt-2 text-xs text-muted-foreground">
                  Factures émises non payées : <strong>{formatCents(kpis.outstandingCents)}</strong>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mes tâches</CardTitle>
          </CardHeader>
          <CardContent>
            {(myTasks.data ?? []).length === 0 ? (
              <EmptyState title="Aucune tâche assignée" className="p-4" />
            ) : (
              <ul className="divide-y">
                {(myTasks.data ?? []).map((t) => {
                  const code = (t.projects as unknown as { code: string } | null)?.code;
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <Link href={`/projects/${t.project_id}`} className="min-w-0 truncate hover:underline">
                        <span className="mr-2 font-mono text-xs text-muted-foreground">{formatTaskKey(code, t.number)}</span>
                        {t.title}
                      </Link>
                      <span className="flex shrink-0 items-center gap-2">
                        {t.due_date && <span className="text-xs text-muted-foreground">{formatDate(t.due_date)}</span>}
                        <StatusBadge size="sm" {...metaOf(TASK_STATUS_META, t.status)} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {showLeads && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Derniers leads</CardTitle>
              <Link href="/leads" className="text-xs text-primary hover:underline">
                Voir le pipeline
              </Link>
            </CardHeader>
            <CardContent>
              {(recentLeads.data ?? []).length === 0 ? (
                <EmptyState title="Aucun lead pour le moment" className="p-4" />
              ) : (
                <ul className="divide-y">
                  {(recentLeads.data ?? []).map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="min-w-0 truncate">
                        {l.name}
                        {l.company && <span className="text-muted-foreground"> · {l.company}</span>}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-muted-foreground">{formatDate(l.created_at)}</span>
                        <StatusBadge size="sm" {...metaOf(LEAD_STATUS_META, l.status)} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Demandes clients</CardTitle>
            <Link href="/requests" className="text-xs text-primary hover:underline">
              Tout voir
            </Link>
          </CardHeader>
          <CardContent>
            {(openRequests.data ?? []).length === 0 ? (
              <EmptyState title="Aucune demande ouverte" className="p-4" />
            ) : (
              <ul className="divide-y">
                {(openRequests.data ?? []).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <Link href={`/requests/${r.id}`} className="min-w-0 truncate hover:underline">
                      {r.subject}
                      <span className="text-muted-foreground"> · {(r.organizations as unknown as { name: string } | null)?.name}</span>
                    </Link>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
