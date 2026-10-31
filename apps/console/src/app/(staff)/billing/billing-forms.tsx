"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { ActionButton, ActionForm } from "@/components/shared/action-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { Field, FormGrid } from "@/components/shared/field";
import { computeTotals } from "@/lib/billing";
import { DEFAULT_VAT_RATE } from "@/lib/domain";
import { formatCents, centsToInput, parseEurosToCents } from "@/lib/format";
import type { BillingLine, Invoice } from "@/lib/types";
import {
  addBillingLine,
  createBillingDocument,
  deleteBillingLine,
  deleteDraft,
  deleteShineInvoice,
  recordShineInvoice,
  setBillingStatus,
  updateBillingHeader,
  updateShineInvoice,
} from "./actions";

type Kind = "quote" | "invoice";

export function NewBillingButton({
  kind,
  organizations,
  projects,
}: {
  kind: Kind;
  organizations: { id: string; name: string }[];
  projects: { id: string; name: string; organization_id: string }[];
}) {
  const [orgId, setOrgId] = useState("");
  return (
    <FormDialog
      trigger={<><Plus className="h-4 w-4" aria-hidden="true" /> {kind === "quote" ? "Nouveau devis" : "Nouvelle facture"}</>}
      title={kind === "quote" ? "Nouveau devis" : "Nouvelle facture"}
      description="Créé en brouillon : ajoutez ensuite les lignes."
      action={createBillingDocument.bind(null, kind)}
      submitLabel="Créer le brouillon"
    >
      <Field label="Client" htmlFor="b-org">
        <NativeSelect id="b-org" name="organization_id" required value={orgId} onChange={(e) => setOrgId(e.target.value)}>
          <option value="" disabled>
            Choisir un client…
          </option>
          {organizations.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Projet (optionnel)" htmlFor="b-project">
        <NativeSelect id="b-project" name="project_id" defaultValue="">
          <option value="">—</option>
          {projects
            .filter((p) => p.organization_id === orgId)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </NativeSelect>
      </Field>
      <Field label="Objet" htmlFor="b-title">
        <Input id="b-title" name="title" required placeholder="Accompagnement IA — phase 1" />
      </Field>
    </FormDialog>
  );
}

export function BillingHeaderForm({
  kind,
  doc,
  projects,
}: {
  kind: Kind;
  doc: { id: string; title: string; project_id: string | null; vat_rate: number; notes: string | null; issue_date: string | null; valid_until?: string | null; due_date?: string | null };
  projects: { id: string; name: string }[];
}) {
  return (
    <ActionForm action={updateBillingHeader.bind(null, kind, doc.id)} className="space-y-4">
      <Field label="Objet" htmlFor="h-title">
        <Input id="h-title" name="title" defaultValue={doc.title} required />
      </Field>
      <FormGrid>
        <Field label="Projet" htmlFor="h-project">
          <NativeSelect id="h-project" name="project_id" defaultValue={doc.project_id ?? ""}>
            <option value="">—</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="TVA (%)" htmlFor="h-vat">
          <Input id="h-vat" name="vat_rate" type="number" step="0.1" min={0} max={100} defaultValue={doc.vat_rate ?? DEFAULT_VAT_RATE} />
        </Field>
        <Field label="Date d'émission" htmlFor="h-issue" hint="Vide = date du jour à l'émission.">
          <Input id="h-issue" name="issue_date" type="date" defaultValue={doc.issue_date ?? ""} />
        </Field>
        {kind === "quote" ? (
          <Field label="Valable jusqu'au" htmlFor="h-valid">
            <Input id="h-valid" name="valid_until" type="date" defaultValue={doc.valid_until ?? ""} />
          </Field>
        ) : (
          <Field label="Échéance de paiement" htmlFor="h-due">
            <Input id="h-due" name="due_date" type="date" defaultValue={doc.due_date ?? ""} />
          </Field>
        )}
      </FormGrid>
      <Field label="Conditions / mentions (visibles du client)" htmlFor="h-notes">
        <Textarea id="h-notes" name="notes" rows={3} defaultValue={doc.notes ?? ""} />
      </Field>
    </ActionForm>
  );
}

export function LinesEditor({ kind, docId, lines, vatRate }: { kind: Kind; docId: string; lines: BillingLine[]; vatRate: number }) {
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const draftLine = { quantity: Number(qty.replace(",", ".")) || 0, unit_price_cents: parseEurosToCents(price) ?? 0 };
  const preview = computeTotals([...lines.map((l) => ({ quantity: Number(l.quantity), unit_price_cents: Number(l.unit_price_cents) })), draftLine], vatRate);

  return (
    <div className="space-y-3">
      <ul className="divide-y rounded-lg border">
        {lines.length === 0 && <li className="p-3 text-sm text-muted-foreground">Aucune ligne.</li>}
        {lines.map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span className="min-w-0 flex-1 whitespace-pre-wrap">{l.description}</span>
            <span className="w-16 text-right tabular-nums">{Number(l.quantity).toLocaleString("fr-FR")}</span>
            <span className="w-28 text-right tabular-nums">{formatCents(l.unit_price_cents)}</span>
            <span className="w-28 text-right font-medium tabular-nums">{formatCents(l.total_cents)}</span>
            <ActionButton size="icon" variant="ghost" aria-label="Supprimer la ligne" action={() => deleteBillingLine(kind, docId, l.id)}>
              <Trash2 className="h-4 w-4" />
            </ActionButton>
          </li>
        ))}
      </ul>
      <ActionForm
        action={addBillingLine.bind(null, kind, docId)}
        resetOnSuccess
        onSuccess={() => {
          setQty("1");
          setPrice("");
        }}
        submitLabel="Ajouter la ligne"
        submitProps={{ size: "sm", variant: "outline" }}
        className="space-y-3 rounded-lg border border-dashed p-3"
      >
        <Field label="Désignation" htmlFor="l-desc">
          <Textarea id="l-desc" name="description" rows={2} required />
        </Field>
        <FormGrid>
          <Field label="Quantité" htmlFor="l-qty">
            <Input id="l-qty" name="quantity" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} required />
          </Field>
          <Field label="Prix unitaire HT (€)" htmlFor="l-price">
            <Input id="l-price" name="unit_price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="850,00" />
          </Field>
        </FormGrid>
      </ActionForm>
      <p className="text-right text-xs text-muted-foreground">
        Aperçu avec la ligne en cours : {formatCents(preview.subtotal_cents)} HT · {formatCents(preview.total_cents)} TTC
      </p>
    </div>
  );
}

export function BillingStatusActions({ kind, docId, status }: { kind: Kind; docId: string; status: string }) {
  const issue = (
    <ActionButton
      confirm={
        kind === "invoice"
          ? "Émettre la facture ? Un numéro définitif est attribué et la facture ne pourra plus être modifiée."
          : "Marquer le devis comme envoyé ? Un numéro est attribué et le devis devient visible par le client."
      }
      action={() => setBillingStatus(kind, docId, "sent")}
    >
      {kind === "invoice" ? "Émettre la facture" : "Marquer comme envoyé"}
    </ActionButton>
  );
  return (
    <div className="flex flex-wrap gap-2">
      {status === "draft" && (
        <>
          {issue}
          <ActionButton variant="ghost" className="text-destructive" confirm="Supprimer ce brouillon ?" action={() => deleteDraft(kind, docId)}>
            Supprimer le brouillon
          </ActionButton>
        </>
      )}
      {kind === "quote" && status === "sent" && (
        <>
          <ActionButton variant="outline" action={() => setBillingStatus(kind, docId, "accepted")}>
            Accepté
          </ActionButton>
          <ActionButton variant="outline" action={() => setBillingStatus(kind, docId, "declined")}>
            Refusé
          </ActionButton>
          <ActionButton variant="ghost" action={() => setBillingStatus(kind, docId, "expired")}>
            Expiré
          </ActionButton>
        </>
      )}
      {kind === "invoice" && status === "sent" && (
        <>
          <ActionButton confirm="Marquer la facture comme payée (date du jour) ?" action={() => setBillingStatus(kind, docId, "paid")}>
            Marquer payée
          </ActionButton>
          <ActionButton variant="ghost" className="text-destructive" confirm="Annuler cette facture ? (elle reste numérotée, à compenser par un avoir si nécessaire)" action={() => setBillingStatus(kind, docId, "cancelled")}>
            Annuler
          </ActionButton>
        </>
      )}
    </div>
  );
}

// --- Invoices issued in Shine --------------------------------------------------------

export interface ShineDefaults {
  organization_id?: string;
  project_id?: string | null;
  quote_id?: string | null;
  title?: string;
  subtotal_cents?: number;
  vat_cents?: number;
}

const today = () => new Date().toISOString().slice(0, 10);

function ShineInvoiceFields({ invoice, defaults }: { invoice?: Invoice; defaults?: ShineDefaults }) {
  const [status, setStatus] = useState<string>(invoice?.status ?? "sent");
  const [subtotal, setSubtotal] = useState(centsToInput(invoice?.subtotal_cents ?? defaults?.subtotal_cents));
  const [vat, setVat] = useState(centsToInput(invoice?.vat_cents ?? defaults?.vat_cents));
  const total = (parseEurosToCents(subtotal) ?? 0) + (parseEurosToCents(vat) ?? 0);
  const p = invoice?.id ?? "new";
  return (
    <>
      <FormGrid>
        <Field label="N° de facture Shine" htmlFor={`s-number-${p}`}>
          <Input id={`s-number-${p}`} name="number" required defaultValue={invoice?.number ?? ""} placeholder="F-2026-0001" />
        </Field>
        <Field label="Date d'émission" htmlFor={`s-issue-${p}`}>
          <Input id={`s-issue-${p}`} name="issue_date" type="date" required defaultValue={invoice?.issue_date ?? today()} />
        </Field>
      </FormGrid>
      <Field label="Objet" htmlFor={`s-title-${p}`}>
        <Input id={`s-title-${p}`} name="title" required defaultValue={invoice?.title ?? defaults?.title ?? ""} />
      </Field>
      <FormGrid>
        <Field label="Montant HT (€)" htmlFor={`s-sub-${p}`}>
          <Input id={`s-sub-${p}`} name="subtotal" inputMode="decimal" required value={subtotal} onChange={(e) => setSubtotal(e.target.value)} placeholder="1 500,00" />
        </Field>
        <Field label="TVA (€)" htmlFor={`s-vat-${p}`} hint={`Total TTC : ${formatCents(total)}`}>
          <Input id={`s-vat-${p}`} name="vat" inputMode="decimal" required value={vat} onChange={(e) => setVat(e.target.value)} placeholder="300,00" />
        </Field>
        <Field label="Échéance" htmlFor={`s-due-${p}`}>
          <Input id={`s-due-${p}`} name="due_date" type="date" defaultValue={invoice?.due_date ?? ""} />
        </Field>
        <Field label="Statut" htmlFor={`s-status-${p}`}>
          <NativeSelect id={`s-status-${p}`} name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="sent">Envoyée</option>
            <option value="paid">Payée</option>
            <option value="cancelled">Annulée</option>
          </NativeSelect>
        </Field>
        {status === "paid" && (
          <Field label="Payée le" htmlFor={`s-paid-${p}`}>
            <Input id={`s-paid-${p}`} name="paid_at" type="date" defaultValue={invoice?.paid_at ?? today()} />
          </Field>
        )}
      </FormGrid>
      <Field
        label={invoice?.document_id ? "Remplacer le PDF (optionnel)" : "PDF de la facture (export Shine)"}
        htmlFor={`s-pdf-${p}`}
        hint="4 Mo max. Visible par le client dans son espace."
      >
        <Input id={`s-pdf-${p}`} name="pdf" type="file" accept="application/pdf,.pdf" />
      </Field>
      <Field label="Notes internes" htmlFor={`s-notes-${p}`}>
        <Textarea id={`s-notes-${p}`} name="notes" rows={2} defaultValue={invoice?.notes ?? ""} />
      </Field>
    </>
  );
}

/** Record an invoice already issued in Shine (number, amounts, PDF). */
export function ShineInvoiceButton({
  organizations,
  projects,
  defaults,
  label = "Enregistrer une facture Shine",
  variant = "default",
}: {
  organizations: { id: string; name: string }[];
  projects: { id: string; name: string; organization_id: string }[];
  defaults?: ShineDefaults;
  label?: string;
  variant?: "default" | "secondary" | "outline";
}) {
  const [orgId, setOrgId] = useState(defaults?.organization_id ?? "");
  const fixedOrg = !!defaults?.organization_id;
  return (
    <FormDialog
      trigger={<><Plus className="h-4 w-4" aria-hidden="true" /> {label}</>}
      triggerProps={{ variant }}
      title="Facture émise dans Shine"
      description="Créez et envoyez la facture dans Shine, puis reportez-la ici avec son PDF : elle apparaîtra dans le suivi et dans l'espace client."
      action={recordShineInvoice}
      submitLabel="Enregistrer"
      wide
    >
      {defaults?.quote_id && <input type="hidden" name="quote_id" value={defaults.quote_id} />}
      {fixedOrg ? (
        <>
          <input type="hidden" name="organization_id" value={orgId} />
          {defaults?.project_id && <input type="hidden" name="project_id" value={defaults.project_id} />}
        </>
      ) : (
        <FormGrid>
          <Field label="Client" htmlFor="s-org">
            <NativeSelect id="s-org" name="organization_id" required value={orgId} onChange={(e) => setOrgId(e.target.value)}>
              <option value="" disabled>
                Choisir un client…
              </option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Projet (optionnel)" htmlFor="s-project">
            <NativeSelect id="s-project" name="project_id" defaultValue="">
              <option value="">—</option>
              {projects
                .filter((p) => p.organization_id === orgId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </NativeSelect>
          </Field>
        </FormGrid>
      )}
      <ShineInvoiceFields defaults={defaults} />
    </FormDialog>
  );
}

export function ShineInvoiceEditForm({ invoice, projects }: { invoice: Invoice; projects: { id: string; name: string }[] }) {
  return (
    <ActionForm action={updateShineInvoice.bind(null, invoice.id)} className="space-y-4">
      {invoice.quote_id && <input type="hidden" name="quote_id" value={invoice.quote_id} />}
      <Field label="Projet" htmlFor="s-project-edit">
        <NativeSelect id="s-project-edit" name="project_id" defaultValue={invoice.project_id ?? ""}>
          <option value="">—</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <ShineInvoiceFields invoice={invoice} />
      <div className="flex justify-end">
        <ActionButton
          variant="ghost"
          className="text-destructive"
          confirm="Supprimer cet enregistrement et son PDF de la console ? (la facture reste dans Shine)"
          action={() => deleteShineInvoice(invoice.id)}
        >
          Supprimer l&apos;enregistrement
        </ActionButton>
      </div>
    </ActionForm>
  );
}
