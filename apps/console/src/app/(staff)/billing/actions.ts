"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { BILLING_WRITE_ROLES } from "@/lib/access-control";
import {
  MAX_UPLOAD_BYTES,
  billingCreateSchema,
  billingHeaderSchema,
  billingLineSchema,
  invoiceStatusSchema,
  quoteStatusSchema,
  shineInvoiceSchema,
  uuid,
} from "@/lib/schemas";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaffRole } from "@/lib/server/auth";
import { DOCUMENTS_BUCKET, safeFileName } from "@/lib/server/storage";

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

// --- Invoices issued in Shine (0301): recorded here, PDF attached as a client document ---

type StaffClient = Awaited<ReturnType<typeof requireStaffRole>>["supabase"];

function pdfFrom(formData: FormData): File | null {
  const file = formData.get("pdf");
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) throw new ActionError("PDF trop volumineux (4 Mo maximum).");
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new ActionError("Le fichier doit être un PDF.");
  return file;
}

/** Upload the Shine PDF and create its client document (visible to the client). */
async function attachInvoicePdf(supabase: StaffClient, userId: string, orgId: string, projectId: string | null, number: string, file: File): Promise<string> {
  const path = `${orgId}/${randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, file, { contentType: "application/pdf", upsert: false });
  if (error) {
    console.error("[billing] pdf upload failed:", error.message);
    throw new ActionError("Téléversement du PDF impossible.");
  }
  const { data, error: docError } = await supabase
    .from("client_documents")
    .insert({
      organization_id: orgId,
      project_id: projectId,
      title: `Facture ${number}`,
      kind: "invoice",
      storage_path: path,
      file_name: file.name,
      mime_type: "application/pdf",
      size_bytes: file.size,
      client_visible: true,
      uploaded_by: userId,
    })
    .select("id")
    .single();
  if (docError) {
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([path]);
    check({ data: null, error: docError });
  }
  return (data as { id: string }).id;
}

async function removeInvoicePdf(supabase: StaffClient, documentId: string | null) {
  if (!documentId) return;
  const doc = check(await supabase.from("client_documents").select("id, storage_path").eq("id", documentId).maybeSingle());
  if (!doc) return;
  check(await supabase.from("client_documents").delete().eq("id", doc.id));
  if (doc.storage_path) await supabase.storage.from(DOCUMENTS_BUCKET).remove([doc.storage_path]);
}

function shineRow(input: ReturnType<typeof shineInvoiceSchema.parse>) {
  return {
    organization_id: input.organization_id,
    project_id: input.project_id,
    quote_id: input.quote_id,
    number: input.number,
    title: input.title,
    issue_date: input.issue_date,
    due_date: input.due_date,
    subtotal_cents: input.subtotal,
    vat_cents: input.vat,
    vat_rate: input.subtotal > 0 ? Math.round((input.vat / input.subtotal) * 10000) / 100 : 0,
    status: input.status,
    paid_at: input.paid_at,
    notes: input.notes,
  };
}

export async function recordShineInvoice(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const res = await runAction(async () => {
    const { supabase, user } = await requireStaffRole(BILLING_WRITE_ROLES);
    const file = pdfFrom(formData);
    const raw = formToObject(formData);
    delete raw.pdf;
    const input = shineInvoiceSchema.parse(raw);
    const documentId = file ? await attachInvoicePdf(supabase, user.id, input.organization_id, input.project_id, input.number, file) : null;
    const { data, error } = await supabase
      .from("invoices")
      .insert({ ...shineRow(input), source: "shine", document_id: documentId })
      .select("id")
      .single();
    if (error) {
      await removeInvoicePdf(supabase, documentId);
      if (error.code === "23505") throw new ActionError("Ce numéro de facture est déjà enregistré.");
      check({ data: null, error });
    }
    revalidateBilling("invoice");
    revalidatePath(`/clients/${input.organization_id}`);
    return (data as { id: string }).id;
  });
  if (res.ok && res.data) redirect(`/billing/invoices/${res.data}`);
  return res.ok ? { ok: true } : res;
}

export async function updateShineInvoice(docId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase, user } = await requireStaffRole(BILLING_WRITE_ROLES);
    const id = uuid.parse(docId);
    const current = check(
      await supabase.from("invoices").select("id, organization_id, document_id").eq("id", id).eq("source", "shine").maybeSingle(),
    ) as { id: string; organization_id: string; document_id: string | null } | null;
    if (!current) throw new ActionError("Facture introuvable.");
    const file = pdfFrom(formData);
    const raw = formToObject(formData);
    delete raw.pdf;
    const input = shineInvoiceSchema.parse({ ...raw, organization_id: current.organization_id });
    const documentId = file ? await attachInvoicePdf(supabase, user.id, current.organization_id, input.project_id, input.number, file) : current.document_id;
    const { organization_id: _org, ...patch } = shineRow(input);
    const { error } = await supabase.from("invoices").update({ ...patch, document_id: documentId }).eq("id", id);
    if (error) {
      if (file) await removeInvoicePdf(supabase, documentId);
      if (error.code === "23505") throw new ActionError("Ce numéro de facture est déjà enregistré.");
      check({ data: null, error });
    }
    if (file && current.document_id) await removeInvoicePdf(supabase, current.document_id);
    revalidateBilling("invoice", id);
    revalidatePath(`/clients/${current.organization_id}`);
    return undefined;
  }, "Facture mise à jour.");
}

/** A Shine record mirrors a document that lives in Shine: it can be deleted here. */
export async function deleteShineInvoice(docId: string): Promise<ActionResult> {
  const res = await runAction(async () => {
    const { supabase } = await requireStaffRole(BILLING_WRITE_ROLES);
    const id = uuid.parse(docId);
    const row = check(
      await supabase.from("invoices").delete().eq("id", id).eq("source", "shine").select("id, organization_id, document_id").maybeSingle(),
    ) as { id: string; organization_id: string; document_id: string | null } | null;
    if (!row) throw new ActionError("Facture introuvable.");
    await removeInvoicePdf(supabase, row.document_id);
    revalidateBilling("invoice");
    revalidatePath(`/clients/${row.organization_id}`);
    return undefined;
  });
  if (res.ok) redirect("/billing/invoices");
  return res;
}
