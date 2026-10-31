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
import { NewBillingButton, ShineInvoiceButton } from "./billing-forms";

/** Shared list page for quotes and invoices (server component). */
export async function BillingList({ kind }: { kind: "quote" | "invoice" }) {
  const { supabase, role } = await requireStaffPage("/billing");
  const table = kind === "quote" ? "quotes" : "invoices";
  const [{ data }, orgs, projects] = await Promise.all([
    supabase
      .from(table)
      .select(kind === "quote" ? "id, number, title, status, total_cents, issue_date, created_at, organizations(name)" : "id, number, title, status, total_cents, issue_date, created_at, source, organizations(name)")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("organizations").select("id, name").order("name"),
    supabase.from("projects").select("id, name, organization_id").order("name"),
  ]);
  const rows = (data ?? []) as unknown as {
    id: string;
    number: string | null;
    title: string;
    status: string;
    total_cents: number;
    issue_date: string | null;
    created_at: string;
    source?: "console" | "shine";
    organizations: { name: string } | null;
  }[];
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
            : "Les factures sont créées et envoyées depuis Shine, puis enregistrées ici avec leur PDF (suivi des paiements, espace client, tableau de bord)."
        }
        actions={
          !canEdit ? null : kind === "quote" ? (
            <NewBillingButton kind={kind} organizations={orgs.data ?? []} projects={projects.data ?? []} />
          ) : (
            <ShineInvoiceButton organizations={orgs.data ?? []} projects={projects.data ?? []} />
          )
        }
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
                    {r.source === "shine" && <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-sans text-[10px] text-muted-foreground">Shine</span>}
                  </Td>
                  <Td>
                    <Link href={`${base}/${r.id}`} className="hover:underline">
                      {r.title}
                    </Link>
                  </Td>
                  <Td muted>{r.organizations?.name}</Td>
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
