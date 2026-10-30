import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbLabel } from "@/components/nav/breadcrumb-label";
import { BillingDocumentView } from "@/components/shared/billing-document";
import { UUID_RE } from "@/lib/schemas";
import { getBillingIssuer } from "@/lib/server/issuer";
import { PORTAL_INVOICE_STATUSES, PORTAL_QUOTE_STATUSES, portalScope } from "@/lib/server/portal";
import type { BillingLine, Invoice, Quote } from "@/lib/types";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Document" };

export default async function PortalBillingDocumentPage({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  if ((kind !== "quote" && kind !== "invoice") || !UUID_RE.test(id)) notFound();
  const { supabase, orgIds } = await portalScope();

  const table = kind === "quote" ? "quotes" : "invoices";
  const statuses = kind === "quote" ? PORTAL_QUOTE_STATUSES : PORTAL_INVOICE_STATUSES;
  const { data } = await supabase
    .from(table)
    .select("*, organizations(name, siren)")
    .eq("id", id)
    .in("organization_id", orgIds)
    .in("status", statuses)
    .maybeSingle();
  if (!data) notFound();
  const raw = data as (Quote | Invoice) & { organizations: { name: string; siren: string | null } | null };

  const { data: lines } = await supabase
    .from(kind === "quote" ? "quote_lines" : "invoice_lines")
    .select("id, position, description, quantity, unit_price_cents, total_cents")
    .eq(kind === "quote" ? "quote_id" : "invoice_id", id)
    .order("position");

  return (
    <div className="space-y-4">
      <BreadcrumbLabel label={raw.number ?? "Document"} />
      <div className="flex justify-end print:hidden">
        <PrintButton />
      </div>
      <BillingDocumentView
        doc={{ ...raw, kind } as (Quote & { kind: "quote" }) | (Invoice & { kind: "invoice" })}
        lines={(lines ?? []) as BillingLine[]}
        issuer={getBillingIssuer()}
        client={{ name: raw.organizations?.name ?? "—", siren: raw.organizations?.siren }}
      />
    </div>
  );
}
