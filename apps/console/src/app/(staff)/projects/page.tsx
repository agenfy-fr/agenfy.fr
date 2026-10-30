import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, DataTableHead, Td, Th, Tr } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { canWrite } from "@/lib/access-control";
import { PROJECT_STATUS_META, metaOf } from "@/lib/domain";
import { formatCents, formatDate } from "@/lib/format";
import { requireStaffPage } from "@/lib/server/auth";
import { displayName, getStaffDirectory } from "@/lib/server/directory";
import { NewProjectButton } from "./project-forms";

export const metadata: Metadata = { title: "Projets" };

export default async function ProjectsPage() {
  const { supabase, role } = await requireStaffPage("/projects");
  const [projectsRes, orgsRes, staff] = await Promise.all([
    supabase
      .from("projects")
      .select("id, code, name, status, progress, end_date, budget_cents, owner_id, organizations(name)")
      .order("status")
      .order("name"),
    supabase.from("organizations").select("id, name").order("name"),
    getStaffDirectory(supabase),
  ]);
  const staffById = new Map(staff.map((s) => [s.id, s]));
  const projects = projectsRes.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projets clients"
        description="Statut, avancement et responsable de chaque mission."
        actions={canWrite(role) ? <NewProjectButton organizations={orgsRes.data ?? []} staff={staff} /> : null}
      />
      <Card className="overflow-hidden">
        {projects.length === 0 ? (
          <EmptyState icon={<FolderKanban className="h-6 w-6" />} title="Aucun projet" />
        ) : (
          <DataTable label="Liste des projets">
            <DataTableHead>
              <tr>
                <Th>Projet</Th>
                <Th>Client</Th>
                <Th>Statut</Th>
                <Th>Avancement</Th>
                <Th>Responsable</Th>
                <Th>Fin prévue</Th>
                <Th numeric>Budget HT</Th>
              </tr>
            </DataTableHead>
            <tbody>
              {projects.map((p) => (
                <Tr key={p.id}>
                  <Td>
                    <Link href={`/projects/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">{p.code}</span>
                  </Td>
                  <Td muted>{(p.organizations as unknown as { name: string } | null)?.name}</Td>
                  <Td>
                    <StatusBadge size="sm" {...metaOf(PROJECT_STATUS_META, p.status)} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                        <div className="h-full bg-primary" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xs tabular-nums">{p.progress} %</span>
                    </div>
                  </Td>
                  <Td muted>{displayName(p.owner_id ? staffById.get(p.owner_id) : null)}</Td>
                  <Td muted>{formatDate(p.end_date)}</Td>
                  <Td numeric>{formatCents(p.budget_cents, { round: true })}</Td>
                </Tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </Card>
    </div>
  );
}
