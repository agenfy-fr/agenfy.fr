import Link from "next/link";
import { Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, DataTableHead, Td, Th, Tr } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { BILLING_WRITE_ROLES, canWriteDomain } from "@/lib/access-control";
import { INVOICE_STATUS_META, QUOTE_STATUS_META, metaOf } from "@/lib/domain";
import { formatCents, formatDate } from "@/lib/format";
import { requireStaffPage } from "@/lib/server/auth";
import { NewBillingButton } from "./billing-forms";

/** Shared list page for quotes and invoices (server component). */
export async function BillingList({ kind }: { kind: "quote" | "invoice" }) {
  const { supabase, role } = await requireStaffPage("/billing");
  const table = kind === "quote" ? "quotes" : "invoices";
  const [{ data }, orgs, projects] = await Promise.all([
    supabase
      .from(table)
      .select("id, number, title, status, total_cents, issue_date, created_at, organizations(name)")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("organizations").select("id, name").order("name"),
    supabase.from("projects").select("id, name, organization_id").order("name"),
  ]);
  const rows = data ?? [];
  const meta = kind === "quote" ? QUOTE_STATUS_META : INVOICE_STATUS_META;
  const base = kind === "quote" ? "/billing/quotes" : "/billing/invoices";
  const canEdit = canWriteDomain(role, BILLING_WRITE_ROLES);

  return (
    <div className="space-y-6">
      <PageHeader
        title={kind === "quote" ? "Devis" : "Factures"}
        description={
          kind === "quote"
            ? "Numérotation DEV-AAAA-NNNN attribuée à l'envoi. Un devis accepté peut être transformé en facture."
            : "Numérotation continue FAC-AAAA-NNNN attribuée à l'émission. Une facture émise ne peut plus être modifiée (annulez-la puis refaites-la)."
        }
        actions={canEdit ? <NewBillingButton kind={kind} organizations={orgs.data ?? []} projects={projects.data ?? []} /> : null}
      />
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={<Receipt className="h-6 w-6" />} title={kind === "quote" ? "Aucun devis" : "Aucune facture"} />
        ) : (
          <DataTable label={kind === "quote" ? "Liste des devis" : "Liste des factures"}>
            <DataTableHead>
              <tr>
                <Th>Numéro</Th>
                <Th>Objet</Th>
                <Th>Client</Th>
                <Th>Statut</Th>
                <Th>Date</Th>
                <Th numeric>Total TTC</Th>
              </tr>
            </DataTableHead>
            <tbody>
              {rows.map((r) => (
                <Tr key={r.id}>
                  <Td className="whitespace-nowrap font-mono text-xs">
                    <Link href={`${base}/${r.id}`} className="hover:underline">
                      {r.number ?? "Brouillon"}
                    </Link>
                  </Td>
                  <Td>
                    <Link href={`${base}/${r.id}`} className="hover:underline">
                      {r.title}
                    </Link>
                  </Td>
                  <Td muted>{(r.organizations as unknown as { name: string } | null)?.name}</Td>
                  <Td>
                    <StatusBadge size="sm" {...metaOf(meta, r.status)} />
                  </Td>
                  <Td muted>{formatDate(r.issue_date ?? r.created_at)}</Td>
                  <Td numeric>{formatCents(r.total_cents)}</Td>
                </Tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </Card>
    </div>
  );
}
