"use client";

import { Pencil, Plus, Send, Trash2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { ActionButton, ActionForm } from "@/components/shared/action-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { Field, FormGrid } from "@/components/shared/field";
import { ORG_ROLES, ORG_ROLE_LABELS } from "@/lib/access-control";
import { ORG_SIZE_BANDS, ORG_STATUSES, ORG_STATUS_META } from "@/lib/domain";
import { toast } from "@/lib/toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Organization, OrganizationContact, OrganizationInternal, StaffMember } from "@/lib/types";
import {
  createContact,
  createOrganization,
  deleteContact,
  inviteContact,
  removeMemberAccess,
  updateContact,
  updateMemberRole,
  updateOrganization,
  updateOrganizationInternal,
} from "./actions";

function OrganizationFields({ org }: { org?: Organization }) {
  return (
    <>
      <Field label="Nom" htmlFor="org-name">
        <Input id="org-name" name="name" defaultValue={org?.name} required />
      </Field>
      <FormGrid>
        <Field label="SIREN" htmlFor="org-siren">
          <Input id="org-siren" name="siren" defaultValue={org?.siren ?? ""} inputMode="numeric" />
        </Field>
        <Field label="Site web" htmlFor="org-website">
          <Input id="org-website" name="website" defaultValue={org?.website ?? ""} />
        </Field>
        <Field label="Secteur" htmlFor="org-sector">
          <Input id="org-sector" name="sector" defaultValue={org?.sector ?? ""} />
        </Field>
        <Field label="Effectif" htmlFor="org-size">
          <NativeSelect id="org-size" name="size_band" defaultValue={org?.size_band ?? ""}>
            <option value="">—</option>
            {ORG_SIZE_BANDS.map((b) => (
              <option key={b} value={b}>
                {b} salariés
              </option>
            ))}
          </NativeSelect>
        </Field>
      </FormGrid>
    </>
  );
}

export function NewClientButton() {
  return (
    <FormDialog trigger={<><Plus className="h-4 w-4" aria-hidden="true" /> Nouveau client</>} title="Nouveau client" action={createOrganization} submitLabel="Créer">
      <OrganizationFields />
    </FormDialog>
  );
}

export function OrganizationForm({ org, canEdit }: { org: Organization; canEdit: boolean }) {
  return (
    <ActionForm action={updateOrganization.bind(null, org.id)} className="space-y-4" hideSubmit={!canEdit}>
      <fieldset disabled={!canEdit} className="space-y-4">
        <OrganizationFields org={org} />
      </fieldset>
    </ActionForm>
  );
}

export function InternalForm({
  orgId,
  internal,
  staff,
  canEdit,
}: {
  orgId: string;
  internal: OrganizationInternal | null;
  staff: StaffMember[];
  canEdit: boolean;
}) {
  return (
    <ActionForm action={updateOrganizationInternal.bind(null, orgId)} className="space-y-4" hideSubmit={!canEdit}>
      <fieldset disabled={!canEdit} className="space-y-4">
        <FormGrid>
          <Field label="Statut" htmlFor="int-status">
            <NativeSelect id="int-status" name="status" defaultValue={internal?.status ?? "active"}>
              {ORG_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORG_STATUS_META[s].label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Responsable de compte" htmlFor="int-manager">
            <NativeSelect id="int-manager" name="account_manager_id" defaultValue={internal?.account_manager_id ?? ""}>
              <option value="">—</option>
              {staff
                .filter((s) => !s.suspended)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.email}
                  </option>
                ))}
            </NativeSelect>
          </Field>
        </FormGrid>
        <Field label="Notes internes" htmlFor="int-notes" hint="Jamais visibles par le client.">
          <Textarea id="int-notes" name="internal_notes" rows={5} defaultValue={internal?.internal_notes ?? ""} />
        </Field>
      </fieldset>
    </ActionForm>
  );
}

function ContactFields({ contact }: { contact?: OrganizationContact }) {
  const p = contact?.id ?? "new";
  return (
    <>
      <FormGrid>
        <Field label="Nom complet" htmlFor={`ct-name-${p}`}>
          <Input id={`ct-name-${p}`} name="full_name" defaultValue={contact?.full_name ?? ""} />
        </Field>
        <Field label="Fonction" htmlFor={`ct-job-${p}`}>
          <Input id={`ct-job-${p}`} name="job_title" defaultValue={contact?.job_title ?? ""} />
        </Field>
        <Field label="E-mail" htmlFor={`ct-email-${p}`}>
          <Input id={`ct-email-${p}`} name="email" type="email" defaultValue={contact?.email ?? ""} />
        </Field>
        <Field label="Téléphone" htmlFor={`ct-phone-${p}`}>
          <Input id={`ct-phone-${p}`} name="phone" type="tel" defaultValue={contact?.phone ?? ""} />
        </Field>
      </FormGrid>
      <Field label="Notes internes" htmlFor={`ct-notes-${p}`}>
        <Textarea id={`ct-notes-${p}`} name="notes" rows={3} defaultValue={contact?.notes ?? ""} />
      </Field>
      <div className="flex items-center gap-2">
        <Checkbox id={`ct-primary-${p}`} name="is_primary" defaultChecked={contact?.is_primary ?? false} />
        <Label htmlFor={`ct-primary-${p}`} className="font-normal">
          Contact principal
        </Label>
      </div>
    </>
  );
}

/** Address book entry: nothing is e-mailed. */
export function NewContactButton({ orgId }: { orgId: string }) {
  return (
    <FormDialog
      trigger={<><UserPlus className="h-4 w-4" aria-hidden="true" /> Ajouter un contact</>}
      triggerProps={{ size: "sm" }}
      title="Ajouter un contact"
      description="Fiche contact uniquement : aucun e-mail n'est envoyé et aucun accès n'est ouvert."
      action={createContact.bind(null, orgId)}
      submitLabel="Ajouter"
    >
      <ContactFields />
    </FormDialog>
  );
}

export function ContactActions({ orgId, contact, hasAccess }: { orgId: string; contact: OrganizationContact; hasAccess: boolean }) {
  const label = contact.full_name || contact.email || "ce contact";
  return (
    <div className="flex items-center gap-1">
      {contact.email && !hasAccess && (
        <FormDialog
          trigger={<><Send className="h-4 w-4" aria-hidden="true" /> Ouvrir l&apos;espace client</>}
          triggerProps={{ size: "sm", variant: "outline" }}
          title={`Inviter ${label} à l'espace client`}
          description={`Un e-mail d'invitation va être envoyé à ${contact.email} (sauf si un compte existe déjà). Le contact verra les projets, documents et factures de ce client.`}
          action={inviteContact.bind(null, orgId, contact.id)}
          submitLabel="Envoyer l'invitation"
        >
          <Field label="Rôle dans l'espace client" htmlFor={`inv-role-${contact.id}`}>
            <NativeSelect id={`inv-role-${contact.id}`} name="role" defaultValue="member">
              {ORG_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ORG_ROLE_LABELS[r]}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </FormDialog>
      )}
      <FormDialog
        trigger={<Pencil className="h-4 w-4" aria-hidden="true" />}
        triggerProps={{ size: "icon", variant: "ghost", title: "Modifier", "aria-label": `Modifier ${label}` }}
        title="Modifier le contact"
        action={updateContact.bind(null, orgId, contact.id)}
        submitLabel="Enregistrer"
      >
        <ContactFields contact={contact} />
      </FormDialog>
      <ActionButton
        size="icon"
        variant="ghost"
        aria-label={`Supprimer ${label}`}
        title="Supprimer le contact"
        confirm={`Supprimer la fiche de ${label} ? (aucun e-mail n'est envoyé)`}
        action={() => deleteContact(orgId, contact.id)}
      >
        <Trash2 className="h-4 w-4" />
      </ActionButton>
    </div>
  );
}

export function MemberControls({ orgId, userId, role, label }: { orgId: string; userId: string; role: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <NativeSelect
        aria-label={`Rôle de ${label}`}
        className="h-8 w-36"
        defaultValue={role}
        onChange={async (e) => {
          const res = await updateMemberRole(orgId, userId, e.target.value);
          if (res.ok) toast.success(res.message ?? "Rôle mis à jour.");
          else toast.error(res.error);
        }}
      >
        {ORG_ROLES.map((r) => (
          <option key={r} value={r}>
            {ORG_ROLE_LABELS[r]}
          </option>
        ))}
      </NativeSelect>
      <ActionButton
        size="icon"
        variant="ghost"
        aria-label={`Retirer l'accès de ${label}`}
        title="Retirer l'accès"
        confirm={`Retirer l'accès de ${label} à l'espace client ? Si l'invitation n'a jamais été utilisée, le compte est aussi supprimé et le lien reçu par e-mail ne fonctionne plus.`}
        action={() => removeMemberAccess(orgId, userId)}
        onSuccess={(result) => {
          if (result === "deleted") toast.info("Invitation inutilisée : le compte a été supprimé, le lien envoyé ne fonctionne plus.");
        }}
      >
        <Trash2 className="h-4 w-4" />
      </ActionButton>
    </div>
  );
}
