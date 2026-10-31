import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCents, formatDate } from "@/lib/format";
import type { Invoice } from "@/lib/types";

/** Invoice issued in Shine: key figures + link to the Shine PDF (staff and portal). */
export function ShineInvoiceSummary({ invoice, clientName }: { invoice: Invoice; clientName: string }) {
  const rows: [string, string][] = [
    ["Client", clientName],
    ["Objet", invoice.title],
    ["Émise le", formatDate(invoice.issue_date)],
    ["Échéance", formatDate(invoice.due_date)],
    ...(invoice.paid_at ? ([["Payée le", formatDate(invoice.paid_at)]] as [string, string][]) : []),
    ["Montant HT", formatCents(invoice.subtotal_cents)],
    ["TVA", formatCents(invoice.vat_cents)],
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Facture {invoice.number}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted-foreground">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <dt className="font-medium">Total TTC</dt>
          <dd className="font-semibold tabular-nums">{formatCents(invoice.total_cents)}</dd>
        </dl>
        {invoice.document_id ? (
          <Button asChild variant="outline">
            <a href={`/api/documents/${invoice.document_id}`} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" aria-hidden="true" /> Télécharger la facture (PDF)
            </a>
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">PDF non joint.</p>
        )}
      </CardContent>
    </Card>
  );
}
