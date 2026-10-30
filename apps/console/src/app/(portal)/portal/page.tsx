import type { Metadata } from "next";
import Link from "next/link";
import { FileText, FolderKanban, LifeBuoy, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { KpiCard, KpiGrid } from "@/components/shared/kpi-card";
import { PROJECT_STATUS_META, REQUEST_STATUS_META, metaOf } from "@/lib/domain";
import { formatCents, formatDate } from "@/lib/format";
import { PORTAL_PROJECT_STATUSES, portalScope } from "@/lib/server/portal";
import type { Project } from "@/lib/types";

export const metadata: Metadata = { title: "Mon espace" };

export default async function PortalHome() {
  const { supabase, orgIds, user } = await portalScope();

  const [projectsRes, milestonesRes, docsRes, requestsRes, invoicesRes, profileRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status, progress, next_steps, end_date")
      .in("organization_id", orgIds)
      .in("status", PORTAL_PROJECT_STATUSES)
      .order("status")
      .order("name"),
    supabase
      .from("project_milestones")
      .select("id, project_id, title, due_date, status")
      .in("organization_id", orgIds)
      .eq("client_visible", true)
      .neq("status", "done")
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("client_documents")
      .select("id, title, created_at")
      .in("organization_id", orgIds)
      .eq("client_visible", true)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("client_requests")
      .select("id, subject, status, updated_at")
      .in("organization_id", orgIds)
      .in("status", ["open", "in_progress"])
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase.from("invoices").select("total_cents").in("organization_id", orgIds).eq("status", "sent"),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  const projects = (projectsRes.data ?? []) as Pick<Project, "id" | "name" | "status" | "progress" | "next_steps" | "end_date">[];
  const nextMilestone = new Map<string, { title: string; due_date: string | null }>();
  for (const m of milestonesRes.data ?? []) if (!nextMilestone.has(m.project_id)) nextMilestone.set(m.project_id, m);
  const unpaid = (invoicesRes.data ?? []).reduce((s, i) => s + Number(i.total_cents), 0);
  const firstName = profileRes.data?.full_name?.split(" ")[0];

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Bonjour{firstName ? ` ${firstName}` : ""}, voici l&apos;état de vos projets avec Agenfy.
      </p>
      <KpiGrid>
        <KpiCard label="Projets en cours" value={projects.filter((p) => p.status === "active").length} icon={<FolderKanban />} />
        <KpiCard label="Documents" value={(docsRes.data ?? []).length} icon={<FileText />} hint="5 derniers partagés" />
        <KpiCard label="Demandes ouvertes" value={(requestsRes.data ?? []).length} icon={<LifeBuoy />} />
        <KpiCard label="À régler" value={formatCents(unpaid)} icon={<Receipt />} tone={unpaid > 0 ? "warn" : "default"} />
      </KpiGrid>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Vos projets</h2>
        {projects.length === 0 ? (
          <EmptyState icon={<FolderKanban className="h-6 w-6" />} title="Aucun projet pour le moment" description="Vos projets apparaîtront ici dès leur démarrage." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p) => {
              const next = nextMilestone.get(p.id);
              return (
                <Link key={p.id} href={`/portal/projects/${p.id}`} className="rounded-xl border p-5 transition-colors hover:bg-muted/40">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium">{p.name}</h3>
                    <StatusBadge size="sm" {...metaOf(PROJECT_STATUS_META, p.status)} />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div
                      className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuenow={p.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Avancement de ${p.name}`}
                    >
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-brand-accent" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-sm tabular-nums">{p.progress} %</span>
                  </div>
                  {next && (
                    <p className="mt-3 text-sm">
                      <span className="text-muted-foreground">Prochain jalon : </span>
                      {next.title}
                      {next.due_date && <span className="text-muted-foreground"> · {formatDate(next.due_date)}</span>}
                    </p>
                  )}
                  {p.next_steps && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.next_steps}</p>}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Derniers documents</CardTitle>
            <Link href="/portal/documents" className="text-xs text-primary hover:underline">
              Tout voir
            </Link>
          </CardHeader>
          <CardContent>
            {(docsRes.data ?? []).length === 0 ? (
              <EmptyState title="Aucun document partagé" className="p-4" />
            ) : (
              <ul className="divide-y text-sm">
                {(docsRes.data ?? []).map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-2">
                    <a href={`/api/documents/${d.id}`} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                      {d.title}
                    </a>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(d.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Demandes en cours</CardTitle>
            <Link href="/portal/requests" className="text-xs text-primary hover:underline">
              Nouvelle demande
            </Link>
          </CardHeader>
          <CardContent>
            {(requestsRes.data ?? []).length === 0 ? (
              <EmptyState title="Aucune demande en cours" className="p-4" />
            ) : (
              <ul className="divide-y text-sm">
                {(requestsRes.data ?? []).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                    <Link href={`/portal/requests/${r.id}`} className="truncate hover:underline">
                      {r.subject}
                    </Link>
                    <StatusBadge size="sm" {...metaOf(REQUEST_STATUS_META, r.status)} />
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
