import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, DataTableHead, Td, Th, Tr } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { canWrite } from "@/lib/access-control";
import { ORG_STATUS_META, metaOf } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { requireStaffPage } from "@/lib/server/auth";
import { NewClientButton } from "./client-forms";

export const metadata: Metadata = { title: "Clients" };

interface Row {
  id: string;
  name: string;
  sector: string | null;
  created_at: string;
  organization_internal: { status: string } | null;
  projects: { status: string }[];
  organization_members: { user_id: string }[];
}

export default async function ClientsPage() {
  const { supabase, role } = await requireStaffPage("/clients");
  const { data } = await supabase
    .from("organizations")
    .select("id, name, sector, created_at, organization_internal(status), projects(status), organization_members(user_id)")
    .order("name");
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organisations clientes"
        description="Chaque client dispose d'un espace sécurisé où ses contacts suivent leurs projets, documents et factures."
        actions={canWrite(role) ? <NewClientButton /> : null}
      />
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={<Building2 className="h-6 w-6" />} title="Aucun client" description="Créez un client ou convertissez un lead gagné." />
        ) : (
          <DataTable label="Liste des clients">
            <DataTableHead>
              <tr>
                <Th>Client</Th>
                <Th>Statut</Th>
                <Th>Secteur</Th>
                <Th numeric>Projets actifs</Th>
                <Th numeric>Contacts</Th>
                <Th>Créé le</Th>
              </tr>
            </DataTableHead>
            <tbody>
              {rows.map((r) => {
                const internal = Array.isArray(r.organization_internal) ? r.organization_internal[0] : r.organization_internal;
                return (
                  <Tr key={r.id}>
                    <Td>
                      <Link href={`/clients/${r.id}`} className="font-medium hover:underline">
                        {r.name}
                      </Link>
                    </Td>
                    <Td>
                      <StatusBadge size="sm" {...metaOf(ORG_STATUS_META, internal?.status ?? "active")} />
                    </Td>
                    <Td muted>{r.sector ?? "—"}</Td>
                    <Td numeric>{r.projects.filter((p) => p.status === "active").length}</Td>
                    <Td numeric>{r.organization_members.length}</Td>
                    <Td muted>{formatDate(r.created_at)}</Td>
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
