import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbLabel } from "@/components/nav/breadcrumb-label";
import { StatusBadge } from "@/components/shared/status-badge";
import { BillingDocumentView } from "@/components/shared/billing-document";
import { BILLING_WRITE_ROLES, canWriteDomain } from "@/lib/access-control";
import { INVOICE_STATUS_META, QUOTE_STATUS_META, metaOf } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { UUID_RE } from "@/lib/schemas";
import { requireStaffPage } from "@/lib/server/auth";
import { getBillingIssuer } from "@/lib/server/issuer";
import type { BillingLine, Invoice, Quote } from "@/lib/types";
import { BillingHeaderForm, BillingStatusActions, LinesEditor } from "./billing-forms";

/** Shared editor/preview for a quote or an invoice. */
export async function BillingEditor({ kind, id }: { kind: "quote" | "invoice"; id: string }) {
  if (!UUID_RE.test(id)) notFound();
  const { supabase, role } = await requireStaffPage("/billing");
  const table = kind === "quote" ? "quotes" : "invoices";
  const linesTable = kind === "quote" ? "quote_lines" : "invoice_lines";
  const fk = kind === "quote" ? "quote_id" : "invoice_id";

  const [docRes, linesRes] = await Promise.all([
    supabase.from(table).select("*, organizations(name, siren)").eq("id", id).maybeSingle(),
    supabase.from(linesTable).select("id, position, description, quantity, unit_price_cents, total_cents").eq(fk, id).order("position"),
  ]);
  const raw = docRes.data as ((Quote | Invoice) & { organizations: { name: string; siren: string | null } | null }) | null;
  if (!raw) notFound();
  const { data: projects } = await supabase.from("projects").select("id, name").eq("organization_id", raw.organization_id).order("name");
  const lines = (linesRes.data ?? []) as BillingLine[];
  const doc = { ...raw, kind } as (Quote & { kind: "quote" }) | (Invoice & { kind: "invoice" });
  const meta = kind === "quote" ? QUOTE_STATUS_META : INVOICE_STATUS_META;
  const canEdit = canWriteDomain(role, BILLING_WRITE_ROLES);
  const isDraft = doc.status === "draft";

  return (
    <div className="space-y-6">
      <BreadcrumbLabel label={doc.number ?? "Brouillon"} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge {...metaOf(meta, doc.status)} showDot />
          <Link href={`/clients/${doc.organization_id}`} className="text-primary hover:underline">
            {raw.organizations?.name}
          </Link>
          {doc.kind === "invoice" && doc.paid_at && <span className="text-muted-foreground">Payée le {formatDate(doc.paid_at)}</span>}
          {doc.kind === "invoice" && doc.quote_id && (
            <Link href={`/billing/quotes/${doc.quote_id}`} className="text-muted-foreground hover:underline">
              Devis d&apos;origine
            </Link>
          )}
        </div>
        {canEdit && <BillingStatusActions kind={kind} docId={doc.id} status={doc.status} />}
      </div>

      {isDraft && canEdit ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">En-tête</CardTitle>
            </CardHeader>
            <CardContent>
              <BillingHeaderForm
                kind={kind}
                doc={{
                  id: doc.id,
                  title: doc.title,
                  project_id: doc.project_id,
                  vat_rate: Number(doc.vat_rate),
                  notes: doc.notes,
                  issue_date: doc.issue_date,
                  valid_until: doc.kind === "quote" ? doc.valid_until : undefined,
                  due_date: doc.kind === "invoice" ? doc.due_date : undefined,
                }}
                projects={projects ?? []}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lignes</CardTitle>
            </CardHeader>
            <CardContent>
              <LinesEditor kind={kind} docId={doc.id} lines={lines} vatRate={Number(doc.vat_rate)} />
            </CardContent>
          </Card>
        </div>
      ) : null}

      <BillingDocumentView doc={doc} lines={lines} issuer={getBillingIssuer()} client={{ name: raw.organizations?.name ?? "—", siren: raw.organizations?.siren }} />
    </div>
  );
}
