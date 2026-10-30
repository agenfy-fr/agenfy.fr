import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { PROJECT_STATUS_META, metaOf } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { PORTAL_PROJECT_STATUSES, portalScope } from "@/lib/server/portal";

export const metadata: Metadata = { title: "Projets" };

export default async function PortalProjectsPage() {
  const { supabase, orgIds } = await portalScope();
  const { data } = await supabase
    .from("projects")
    .select("id, name, status, progress, start_date, end_date, organizations(name)")
    .in("organization_id", orgIds)
    .in("status", PORTAL_PROJECT_STATUSES)
    .order("start_date", { ascending: false, nullsFirst: false });
  const projects = data ?? [];

  if (projects.length === 0) {
    return <EmptyState icon={<FolderKanban className="h-6 w-6" />} title="Aucun projet pour le moment" />;
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {projects.map((p) => (
        <li key={p.id}>
          <Link href={`/portal/projects/${p.id}`} className="block rounded-xl border p-5 transition-colors hover:bg-muted/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-medium">{p.name}</h2>
                {orgIds.length > 1 && <p className="text-xs text-muted-foreground">{(p.organizations as unknown as { name: string } | null)?.name}</p>}
              </div>
              <StatusBadge size="sm" {...metaOf(PROJECT_STATUS_META, p.status)} />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-brand-accent" style={{ width: `${p.progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {p.progress} % · {formatDate(p.start_date)} → {formatDate(p.end_date)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
