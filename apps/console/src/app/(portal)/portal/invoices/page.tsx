import type { Metadata } from "next";
import Link from "next/link";
import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, DataTableHead, Td, Th, Tr } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { INVOICE_STATUS_META, QUOTE_STATUS_META, metaOf } from "@/lib/domain";
import { formatCents, formatDate } from "@/lib/format";
import { PORTAL_INVOICE_STATUSES, PORTAL_QUOTE_STATUSES, portalScope } from "@/lib/server/portal";

export const metadata: Metadata = { title: "Factures & devis" };

export default async function PortalInvoicesPage() {
  const { supabase, orgIds } = await portalScope();
  const [invoices, quotes] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, number, title, status, issue_date, due_date, total_cents")
      .in("organization_id", orgIds)
      .in("status", PORTAL_INVOICE_STATUSES)
      .order("issue_date", { ascending: false }),
    supabase
      .from("quotes")
      .select("id, number, title, status, issue_date, valid_until, total_cents")
      .in("organization_id", orgIds)
      .in("status", PORTAL_QUOTE_STATUSES)
      .order("issue_date", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Factures</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(invoices.data ?? []).length === 0 ? (
            <EmptyState icon={<Receipt className="h-6 w-6" />} title="Aucune facture" />
          ) : (
            <DataTable label="Factures" maxHeight={null}>
              <DataTableHead>
                <tr>
                  <Th>Numéro</Th>
                  <Th>Objet</Th>
                  <Th>Émise le</Th>
                  <Th>Échéance</Th>
                  <Th>Statut</Th>
                  <Th numeric>Total TTC</Th>
                </tr>
              </DataTableHead>
              <tbody>
                {(invoices.data ?? []).map((i) => (
                  <Tr key={i.id}>
                    <Td className="font-mono text-xs">
                      <Link href={`/portal/invoices/invoice/${i.id}`} className="hover:underline">
                        {i.number}
                      </Link>
                    </Td>
                    <Td>{i.title}</Td>
                    <Td muted>{formatDate(i.issue_date)}</Td>
                    <Td muted>{formatDate(i.due_date)}</Td>
                    <Td>
                      <StatusBadge size="sm" {...metaOf(INVOICE_STATUS_META, i.status)} />
                    </Td>
                    <Td numeric>{formatCents(i.total_cents)}</Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Devis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(quotes.data ?? []).length === 0 ? (
            <EmptyState title="Aucun devis" />
          ) : (
            <DataTable label="Devis" maxHeight={null}>
              <DataTableHead>
                <tr>
                  <Th>Numéro</Th>
                  <Th>Objet</Th>
                  <Th>Émis le</Th>
                  <Th>Valable jusqu&apos;au</Th>
                  <Th>Statut</Th>
                  <Th numeric>Total TTC</Th>
                </tr>
              </DataTableHead>
              <tbody>
                {(quotes.data ?? []).map((q) => (
                  <Tr key={q.id}>
                    <Td className="font-mono text-xs">
                      <Link href={`/portal/invoices/quote/${q.id}`} className="hover:underline">
                        {q.number}
                      </Link>
                    </Td>
                    <Td>{q.title}</Td>
                    <Td muted>{formatDate(q.issue_date)}</Td>
                    <Td muted>{formatDate(q.valid_until)}</Td>
                    <Td>
                      <StatusBadge size="sm" {...metaOf(QUOTE_STATUS_META, q.status)} />
                    </Td>
                    <Td numeric>{formatCents(q.total_cents)}</Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
