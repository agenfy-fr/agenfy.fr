import Image from "next/image";
import { formatCents, formatDate } from "@/lib/format";
import type { BillingIssuer } from "@/lib/server/issuer";
import type { BillingLine, Invoice, Quote } from "@/lib/types";

type Doc = (Quote & { kind: "quote" }) | (Invoice & { kind: "invoice" });

/** Printable quote / invoice (staff preview and client portal). */
export function BillingDocumentView({
  doc,
  lines,
  issuer,
  client,
}: {
  doc: Doc;
  lines: BillingLine[];
  issuer: BillingIssuer;
  client: { name: string; siren?: string | null };
}) {
  const label = doc.kind === "quote" ? "Devis" : "Facture";
  return (
    <article className="mx-auto max-w-3xl rounded-xl border bg-background p-8 text-sm shadow-sm print:border-0 print:shadow-none">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Image src="/agenfy-logo.svg" alt="" width={28} height={28} />
            <span className="text-lg font-semibold">{issuer.brand}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {issuer.brand} est une marque de {issuer.legalName}
            {issuer.address && <><br />{issuer.address}</>}
            {issuer.siren && <><br />SIREN {issuer.siren}</>}
            {issuer.vatNumber && <><br />TVA {issuer.vatNumber}</>}
            {issuer.email && <><br />{issuer.email}</>}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold">
            {label} {doc.number ?? "(brouillon)"}
          </p>
          <p className="text-xs text-muted-foreground">
            {doc.issue_date ? `Émis le ${formatDate(doc.issue_date)}` : "Non émis"}
            {doc.kind === "quote" && doc.valid_until && <><br />Valable jusqu&apos;au {formatDate(doc.valid_until)}</>}
            {doc.kind === "invoice" && doc.due_date && <><br />Échéance {formatDate(doc.due_date)}</>}
          </p>
        </div>
      </header>

      <section className="mt-8">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Client</p>
        <p className="font-medium">{client.name}</p>
        {client.siren && <p className="text-xs text-muted-foreground">SIREN {client.siren}</p>}
      </section>

      <h2 className="mt-6 font-medium">{doc.title}</h2>

      <table className="mt-3 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th scope="col" className="py-2 font-medium">Désignation</th>
            <th scope="col" className="py-2 text-right font-medium">Qté</th>
            <th scope="col" className="py-2 text-right font-medium">PU HT</th>
            <th scope="col" className="py-2 text-right font-medium">Total HT</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.id} className="border-b align-top">
              <td className="whitespace-pre-wrap py-2 pr-4">{l.description}</td>
              <td className="py-2 text-right tabular-nums">{Number(l.quantity).toLocaleString("fr-FR")}</td>
              <td className="py-2 text-right tabular-nums">{formatCents(l.unit_price_cents)}</td>
              <td className="py-2 text-right tabular-nums">{formatCents(l.total_cents)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="ml-auto mt-4 w-64 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Total HT</dt>
          <dd className="tabular-nums">{formatCents(doc.subtotal_cents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">TVA {Number(doc.vat_rate).toLocaleString("fr-FR")} %</dt>
          <dd className="tabular-nums">{formatCents(doc.vat_cents)}</dd>
        </div>
        <div className="flex justify-between border-t pt-1 font-semibold">
          <dt>Total TTC</dt>
          <dd className="tabular-nums">{formatCents(doc.total_cents)}</dd>
        </div>
      </dl>

      {(doc.notes || (doc.kind === "invoice" && (issuer.paymentTerms || issuer.iban))) && (
        <footer className="mt-8 space-y-2 border-t pt-4 text-xs text-muted-foreground">
          {doc.notes && <p className="whitespace-pre-wrap">{doc.notes}</p>}
          {doc.kind === "invoice" && issuer.paymentTerms && <p>{issuer.paymentTerms}</p>}
          {doc.kind === "invoice" && issuer.iban && <p>Règlement par virement — IBAN {issuer.iban}</p>}
        </footer>
      )}
    </article>
  );
}
