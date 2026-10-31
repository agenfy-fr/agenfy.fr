"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Mail, Phone, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionButton, ActionForm } from "@/components/shared/action-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { Field, FormGrid } from "@/components/shared/field";
import { LEAD_PRIORITIES, LEAD_STATUSES, LEAD_STATUS_META, type LeadStatus } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { toast } from "@/lib/toast";
import type { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";
import { convertLead, createLead, setLeadStatus, updateLead } from "./actions";

const PRIORITY_VARIANT = { Haute: "destructive", Moyenne: "caution", Basse: "neutral" } as const;

export function NewLeadButton() {
  return (
    <FormDialog trigger={<><Plus className="h-4 w-4" aria-hidden="true" /> Nouveau lead</>} title="Nouveau lead" action={createLead} submitLabel="Créer">
      <FormGrid>
        <Field label="Nom" htmlFor="lead-name">
          <Input id="lead-name" name="name" required />
        </Field>
        <Field label="Entreprise" htmlFor="lead-company">
          <Input id="lead-company" name="company" />
        </Field>
        <Field label="E-mail" htmlFor="lead-email">
          <Input id="lead-email" name="email" type="email" required />
        </Field>
        <Field label="Téléphone" htmlFor="lead-phone">
          <Input id="lead-phone" name="phone" />
        </Field>
        <Field label="Service" htmlFor="lead-service">
          <Input id="lead-service" name="service" placeholder="Conseil IA, agents, formation…" />
        </Field>
        <Field label="Priorité" htmlFor="lead-priority">
          <NativeSelect id="lead-priority" name="priority" defaultValue="Moyenne">
            {LEAD_PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </NativeSelect>
        </Field>
      </FormGrid>
      <Field label="Source" htmlFor="lead-source">
        <Input id="lead-source" name="source" placeholder="Salon, recommandation, LinkedIn…" />
      </Field>
      <Field label="Besoin exprimé" htmlFor="lead-message">
        <Textarea id="lead-message" name="message" rows={3} />
      </Field>
    </FormDialog>
  );
}

export function LeadsBoard({ leads, canEdit }: { leads: Lead[]; canEdit: boolean }) {
  const [optimistic, moveLead] = useOptimistic(leads, (state, { id, status }: { id: string; status: LeadStatus }) =>
    state.map((l) => (l.id === id ? { ...l, status } : l)),
  );
  const [, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = optimistic.find((l) => l.id === openId) ?? null;

  const move = (id: string, status: LeadStatus) => {
    const lead = optimistic.find((l) => l.id === id);
    if (!lead || lead.status === status) return;
    startTransition(async () => {
      moveLead({ id, status });
      const res = await setLeadStatus(id, status);
      if (!res.ok) toast.error(res.error);
    });
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2" role="list" aria-label="Colonnes du pipeline">
        {LEAD_STATUSES.map((status) => {
          const items = optimistic.filter((l) => l.status === status);
          return (
            <section
              key={status}
              role="listitem"
              aria-label={`${LEAD_STATUS_META[status].label} (${items.length})`}
              onDragOver={(e) => {
                if (!canEdit) return;
                e.preventDefault();
                setDragOver(status);
              }}
              onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const id = e.dataTransfer.getData("text/plain");
                if (id) move(id, status);
              }}
              className={cn(
                "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/40 transition-colors",
                dragOver === status && "border-primary bg-primary/5",
              )}
            >
              <header className="flex items-center justify-between px-3 py-2.5">
                <StatusBadge {...LEAD_STATUS_META[status]} showDot />
                <span className="text-xs tabular-nums text-muted-foreground">{items.length}</span>
              </header>
              <ul className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                {items.map((lead) => (
                  <li key={lead.id}>
                    <button
                      type="button"
                      draggable={canEdit}
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", lead.id)}
                      onClick={() => setOpenId(lead.id)}
                      className="w-full rounded-lg border bg-background p-3 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-snug">{lead.name}</span>
                        <StatusBadge size="sm" label={lead.priority} variant={PRIORITY_VARIANT[lead.priority] ?? "neutral"} />
                      </div>
                      {lead.company && <p className="mt-0.5 truncate text-xs text-muted-foreground">{lead.company}</p>}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="truncate">{lead.service ?? lead.source ?? "—"}</span>
                        <span className="shrink-0">{formatDate(lead.created_at)}</span>
                      </div>
                      {lead.organization_id && <p className="mt-1 text-[11px] font-medium text-primary">Client créé</p>}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpenId(null)}>
        {open && <LeadDetails lead={open} canEdit={canEdit} onMove={move} onClose={() => setOpenId(null)} />}
      </Dialog>
    </>
  );
}

function LeadDetails({
  lead,
  canEdit,
  onMove,
  onClose,
}: {
  lead: Lead;
  canEdit: boolean;
  onMove: (id: string, status: LeadStatus) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{lead.name}</DialogTitle>
        <DialogDescription>
          Reçu le {formatDate(lead.created_at)}
          {lead.source ? ` · ${lead.source}` : ""}
        </DialogDescription>
      </DialogHeader>
      <dl className="grid gap-2 text-sm">
        {lead.company && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <dt className="sr-only">Entreprise</dt>
            <dd>{lead.company}</dd>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <dt className="sr-only">E-mail</dt>
          <dd>
            <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
              {lead.email}
            </a>
          </dd>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <dt className="sr-only">Téléphone</dt>
            <dd>{lead.phone}</dd>
          </div>
        )}
        {lead.service && (
          <div>
            <dt className="text-xs text-muted-foreground">Service</dt>
            <dd>{lead.service}</dd>
          </div>
        )}
        {lead.message && (
          <div>
            <dt className="text-xs text-muted-foreground">Message</dt>
            <dd className="whitespace-pre-wrap rounded-md bg-muted/60 p-3">{lead.message}</dd>
          </div>
        )}
      </dl>

      {canEdit ? (
        <ActionForm action={updateLead.bind(null, lead.id)} className="space-y-3" onSuccess={onClose}>
          <FormGrid>
            <Field label="Statut" htmlFor="lead-status">
              <NativeSelect
                id="lead-status"
                name="status"
                defaultValue={lead.status}
                onChange={(e) => onMove(lead.id, e.target.value as LeadStatus)}
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Priorité" htmlFor="lead-prio">
              <NativeSelect id="lead-prio" name="priority" defaultValue={lead.priority}>
                {LEAD_PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </NativeSelect>
            </Field>
          </FormGrid>
          <Field label="Notes internes" htmlFor="lead-notes">
            <Textarea id="lead-notes" name="notes" rows={4} defaultValue={lead.notes ?? ""} />
          </Field>
        </ActionForm>
      ) : (
        lead.notes && <p className="whitespace-pre-wrap text-sm">{lead.notes}</p>
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
        {lead.organization_id ? (
          <Button asChild variant="outline">
            <Link href={`/clients/${lead.organization_id}`}>Voir la fiche client</Link>
          </Button>
        ) : (
          canEdit && (
            <ActionButton
              action={() => convertLead(lead.id)}
              confirm={`Créer l'organisation cliente « ${lead.company || lead.name} » (avec ${lead.name} comme contact, sans invitation) et marquer le lead comme gagné ?`}
              onSuccess={(data) => {
                if (data) router.push(`/clients/${data.organizationId}?tab=contacts`);
              }}
            >
              Convertir en client
            </ActionButton>
          )
        )}
      </div>
    </DialogContent>
  );
}
