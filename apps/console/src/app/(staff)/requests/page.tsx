import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, DataTableHead, Td, Th, Tr } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { REQUEST_CATEGORY_LABELS, REQUEST_STATUS_META, metaOf, type RequestCategory } from "@/lib/domain";
import { formatDateTime } from "@/lib/format";
import { requireStaffPage } from "@/lib/server/auth";
import { displayName, getStaffDirectory } from "@/lib/server/directory";

export const metadata: Metadata = { title: "Demandes clients" };

export default async function RequestsPage() {
  const { supabase } = await requireStaffPage("/requests");
  const [{ data }, staff] = await Promise.all([
    supabase
      .from("client_requests")
      .select("id, subject, category, status, priority, assignee_id, created_at, organizations(name)")
      .order("created_at", { ascending: false })
      .limit(300),
    getStaffDirectory(supabase),
  ]);
  const staffById = new Map(staff.map((s) => [s.id, s]));
  const order = ["open", "in_progress", "resolved", "closed"];
  const rows = [...(data ?? [])].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

  return (
    <div className="space-y-6">
      <PageHeader title="Demandes clients" description="Questions, évolutions et anomalies remontées depuis l'espace client." />
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={<Inbox className="h-6 w-6" />} title="Aucune demande" />
        ) : (
          <DataTable label="Liste des demandes">
            <DataTableHead>
              <tr>
                <Th>Objet</Th>
                <Th>Client</Th>
                <Th>Catégorie</Th>
                <Th>Statut</Th>
                <Th>Assignée</Th>
                <Th>Reçue le</Th>
              </tr>
            </DataTableHead>
            <tbody>
              {rows.map((r) => (
                <Tr key={r.id}>
                  <Td>
                    <Link href={`/requests/${r.id}`} className="font-medium hover:underline">
                      {r.subject}
                    </Link>
                    {r.priority === "high" && <StatusBadge size="sm" variant="destructive" label="Haute" className="ml-2" />}
                  </Td>
                  <Td muted>{(r.organizations as unknown as { name: string } | null)?.name}</Td>
                  <Td muted>{REQUEST_CATEGORY_LABELS[r.category as RequestCategory] ?? r.category}</Td>
                  <Td>
                    <StatusBadge size="sm" {...metaOf(REQUEST_STATUS_META, r.status)} />
                  </Td>
                  <Td muted>{r.assignee_id ? displayName(staffById.get(r.assignee_id)) : "—"}</Td>
                  <Td muted>{formatDateTime(r.created_at)}</Td>
                </Tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </Card>
    </div>
  );
}
