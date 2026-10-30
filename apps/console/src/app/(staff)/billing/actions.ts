"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { BILLING_WRITE_ROLES } from "@/lib/access-control";
import { billingCreateSchema, billingHeaderSchema, billingLineSchema, invoiceStatusSchema, quoteStatusSchema, uuid } from "@/lib/schemas";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaffRole } from "@/lib/server/auth";

const kindSchema = z.enum(["quote", "invoice"]);
type Kind = z.infer<typeof kindSchema>;

const TABLE: Record<Kind, { doc: "quotes" | "invoices"; lines: "quote_lines" | "invoice_lines"; fk: "quote_id" | "invoice_id"; path: string }> = {
  quote: { doc: "quotes", lines: "quote_lines", fk: "quote_id", path: "/billing/quotes" },
  invoice: { doc: "invoices", lines: "invoice_lines", fk: "invoice_id", path: "/billing/invoices" },
};

function revalidateBilling(kind: Kind, id?: string) {
  revalidatePath(TABLE[kind].path);
  if (id) revalidatePath(`${TABLE[kind].path}/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/portal", "layout");
}

export async function createBillingDocument(kindRaw: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const kind = kindSchema.parse(kindRaw);
  const res = await runAction(async () => {
    const { supabase } = await requireStaffRole(BILLING_WRITE_ROLES);
    const input = billingCreateSchema.parse(formToObject(formData));
    const row = check(await supabase.from(TABLE[kind].doc).insert(input).select("id").single()) as { id: string };
    revalidateBilling(kind);
    return row.id;
  });
  if (res.ok && res.data) redirect(`${TABLE[kind].path}/${res.data}`);
  return res.ok ? { ok: true } : res;
}

export async function updateBillingHeader(kindRaw: string, docId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const kind = kindSchema.parse(kindRaw);
    const { supabase } = await requireStaffRole(BILLING_WRITE_ROLES);
    const id = uuid.parse(docId);
    const input = billingHeaderSchema.parse(formToObject(formData));
    const patch =
      kind === "quote"
        ? { title: input.title, project_id: input.project_id, vat_rate: input.vat_rate, notes: input.notes, issue_date: input.issue_date, valid_until: input.valid_until }
        : { title: input.title, project_id: input.project_id, vat_rate: input.vat_rate, notes: input.notes, issue_date: input.issue_date, due_date: input.due_date };
    check(await supabase.from(TABLE[kind].doc).update(patch).eq("id", id).eq("status", "draft"));
    revalidateBilling(kind, id);
    return undefined;
  }, "Document mis à jour.");
}

export async function addBillingLine(kindRaw: string, docId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const kind = kindSchema.parse(kindRaw);
    const { supabase } = await requireStaffRole(BILLING_WRITE_ROLES);
    const id = uuid.parse(docId);
    const input = billingLineSchema.parse(formToObject(formData));
    const { count } = await supabase.from(TABLE[kind].lines).select("id", { count: "exact", head: true }).eq(TABLE[kind].fk, id);
    check(
      await supabase.from(TABLE[kind].lines).insert({
        [TABLE[kind].fk]: id,
        position: count ?? 0,
        description: input.description,
        quantity: input.quantity,
        unit_price_cents: input.unit_price,
      }),
    );
    revalidateBilling(kind, id);
    return undefined;
  }, "Ligne ajoutée.");
}

export async function deleteBillingLine(kindRaw: string, docId: string, lineId: string): Promise<ActionResult> {
  return runAction(async () => {
    const kind = kindSchema.parse(kindRaw);
    const { supabase } = await requireStaffRole(BILLING_WRITE_ROLES);
    check(await supabase.from(TABLE[kind].lines).delete().eq("id", uuid.parse(lineId)).eq(TABLE[kind].fk, uuid.parse(docId)));
    revalidateBilling(kind, docId);
    return undefined;
  }, "Ligne supprimée.");
}

/** Status transitions. Leaving `draft` assigns the legal number (DB trigger) and freezes the document. */
export async function setBillingStatus(kindRaw: string, docId: string, statusRaw: string): Promise<ActionResult> {
  return runAction(async () => {
    const kind = kindSchema.parse(kindRaw);
    const { supabase } = await requireStaffRole(BILLING_WRITE_ROLES);
    const id = uuid.parse(docId);
    const status = kind === "quote" ? quoteStatusSchema.parse(statusRaw) : invoiceStatusSchema.parse(statusRaw);

    const current = check(
      await supabase.from(TABLE[kind].doc).select("status, subtotal_cents").eq("id", id).maybeSingle(),
    ) as { status: string; subtotal_cents: number } | null;
    if (!current) throw new ActionError("Document introuvable.");
    if (current.status === "draft" && status !== "draft" && Number(current.subtotal_cents) <= 0) {
      throw new ActionError("Ajoutez au moins une ligne avant d'émettre le document.");
    }
    const patch: Record<string, unknown> = { status };
    if (kind === "invoice" && status === "paid") patch.paid_at = new Date().toISOString().slice(0, 10);
    check(await supabase.from(TABLE[kind].doc).update(patch).eq("id", id));
    revalidateBilling(kind, id);
    return undefined;
  }, "Statut mis à jour.");
}

export async function deleteDraft(kindRaw: string, docId: string): Promise<ActionResult> {
  const kind = kindSchema.parse(kindRaw);
  const res = await runAction(async () => {
    const { supabase } = await requireStaffRole(BILLING_WRITE_ROLES);
    const row = check(
      await supabase.from(TABLE[kind].doc).delete().eq("id", uuid.parse(docId)).eq("status", "draft").select("id").maybeSingle(),
    );
    if (!row) throw new ActionError("Seul un brouillon peut être supprimé.");
    revalidateBilling(kind);
    return undefined;
  });
  if (res.ok) redirect(TABLE[kind].path);
  return res;
}

/** Draft invoice pre-filled from a quote (same client, project, VAT and lines). */
export async function invoiceFromQuote(quoteId: string): Promise<ActionResult> {
  const res = await runAction(async () => {
    const { supabase } = await requireStaffRole(BILLING_WRITE_ROLES);
    const id = uuid.parse(quoteId);
    const quote = check(
      await supabase.from("quotes").select("id, organization_id, project_id, title, vat_rate, notes, status").eq("id", id).maybeSingle(),
    );
    if (!quote) throw new ActionError("Devis introuvable.");
    const lines = check(await supabase.from("quote_lines").select("position, description, quantity, unit_price_cents").eq("quote_id", id).order("position")) ?? [];
    const invoice = check(
      await supabase
        .from("invoices")
        .insert({
          organization_id: quote.organization_id,
          project_id: quote.project_id,
          quote_id: quote.id,
          title: quote.title,
          vat_rate: quote.vat_rate,
          notes: quote.notes,
        })
        .select("id")
        .single(),
    ) as { id: string };
    if (lines.length > 0) {
      check(await supabase.from("invoice_lines").insert(lines.map((l) => ({ ...l, invoice_id: invoice.id }))));
    }
    revalidateBilling("invoice");
    return invoice.id;
  });
  if (res.ok && res.data) redirect(`/billing/invoices/${res.data}`);
  return res.ok ? { ok: true } : res;
}
