"use client";

import { Crown, GraduationCap, Pencil, Plus, Send, Trash2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { ActionButton, ActionForm } from "@/components/shared/action-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { Field, FormGrid } from "@/components/shared/field";
import { ORG_ROLE_LABELS, PORTAL_ORG_ROLES } from "@/lib/access-control";
import { ORG_SIZE_BANDS, ORG_STATUSES, ORG_STATUS_META } from "@/lib/domain";
import { toast } from "@/lib/toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Organization, OrganizationContact, OrganizationInternal, StaffMember } from "@/lib/types";
import {
  createContact,
  createOrganization,
  deleteContact,
  grantTrainingAccess,
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
      {contact.email && !hasAccess && <InviteContactDialog orgId={orgId} contactId={contact.id} label={label} email={contact.email} />}
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
        {PORTAL_ORG_ROLES.map((r) => (
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
        confirm={`Retirer l'accès de ${label} à l'espace client ? S'il suit une formation de ce client, il garde uniquement l'accès à ses formations. Sinon, si l'invitation n'a jamais été utilisée, le compte est aussi supprimé et le lien reçu par e-mail ne fonctionne plus. Aucun e-mail envoyé.`}
        action={() => removeMemberAccess(orgId, userId)}
        onSuccess={(result) => {
          if (result === "deleted") toast.info("Invitation inutilisée : le compte a été supprimé, le lien envoyé ne fonctionne plus.");
          if (result === "learner") toast.info("La personne garde l'accès à ses formations (app.agenfy.fr), sans espace client.");
        }}
      >
        <Trash2 className="h-4 w-4" />
      </ActionButton>
    </div>
  );
}

/** Explicit portal invitation of a contact (console.agenfy.fr): the ONLY e-mail to a contact for the portal. */
export function InviteContactDialog({ orgId, contactId, label, email }: { orgId: string; contactId: string; label: string; email: string }) {
  return (
    <FormDialog
      trigger={<><Send className="h-4 w-4" aria-hidden="true" /> Ouvrir l&apos;espace client</>}
      triggerProps={{ size: "sm", variant: "outline" }}
      title={`Inviter ${label} à l'espace client`}
      description={`Un e-mail d'invitation à console.agenfy.fr va être envoyé à ${email} (sauf si un compte existe déjà : aucun e-mail dans ce cas). La personne verra les projets, documents et factures de ce client.`}
      action={inviteContact.bind(null, orgId, contactId)}
      submitLabel="Envoyer l'invitation"
    >
      <Field label="Rôle dans l'espace client" htmlFor={`inv-role-${contactId}`}>
        <NativeSelect id={`inv-role-${contactId}`} name="role" defaultValue="member">
          {PORTAL_ORG_ROLES.map((r) => (
            <option key={r} value={r}>
              {ORG_ROLE_LABELS[r]}
            </option>
          ))}
        </NativeSelect>
      </Field>
    </FormDialog>
  );
}

/** Learner (training only) → portal, with an existing account: no e-mail. */
export function OpenPortalForAccountDialog({ orgId, userId, label }: { orgId: string; userId: string; label: string }) {
  return (
    <FormDialog
      trigger={<><Send className="h-4 w-4" aria-hidden="true" /> Ouvrir l&apos;espace client</>}
      triggerProps={{ size: "sm", variant: "outline" }}
      title={`Ouvrir l'espace client à ${label}`}
      description="La personne a déjà un compte : aucun e-mail n'est envoyé. Elle se connecte à console.agenfy.fr avec ses identifiants habituels et verra les projets, documents et factures de ce client. Ses formations restent accessibles."
      action={async (_prev: unknown, formData: FormData) => updateMemberRole(orgId, userId, String(formData.get("role") ?? ""))}
      submitLabel="Ouvrir l'accès"
    >
      <Field label="Rôle dans l'espace client" htmlFor={`open-role-${userId}`}>
        <NativeSelect id={`open-role-${userId}`} name="role" defaultValue="member">
          {PORTAL_ORG_ROLES.map((r) => (
            <option key={r} value={r}>
              {ORG_ROLE_LABELS[r]}
            </option>
          ))}
        </NativeSelect>
      </Field>
    </FormDialog>
  );
}

export function PromoteResponsableButton({ orgId, userId, label }: { orgId: string; userId: string; label: string }) {
  return (
    <ActionButton
      size="sm"
      variant="ghost"
      title="Promouvoir responsable"
      confirm={`Faire de ${label} un responsable du client ? Il accède à l'espace client (projets, documents, factures) et suit les formations de l'équipe sur app.agenfy.fr. Aucun e-mail envoyé.`}
      action={() => updateMemberRole(orgId, userId, "owner")}
    >
      <Crown className="h-4 w-4" aria-hidden="true" /> Promouvoir responsable
    </ActionButton>
  );
}

/**
 * Give access to one or more published courses on app.agenfy.fr. The dialog
 * states who receives an e-mail: nobody when the person already has an
 * account, otherwise ONE invitation to the training platform.
 */
export function GrantTrainingDialog({
  orgId,
  contactId,
  userId,
  label,
  email,
  hasAccount,
  courses,
}: {
  orgId: string;
  contactId: string | null;
  userId: string | null;
  label: string;
  email: string | null;
  hasAccount: boolean;
  courses: { id: string; title: string }[];
}) {
  const p = userId ?? contactId ?? "x";
  const description = hasAccount
    ? `${label} a déjà un compte : aucun e-mail n'est envoyé. Les formations apparaissent sur son espace formation (app.agenfy.fr).`
    : `Un e-mail d'invitation à l'espace formation (app.agenfy.fr) va être envoyé à ${email} pour créer son mot de passe (aucun e-mail si un compte existe déjà avec cette adresse). Aucun accès à l'espace client n'est ouvert.`;
  return (
    <FormDialog<"invited" | "existing">
      trigger={<><GraduationCap className="h-4 w-4" aria-hidden="true" /> Donner accès à des formations</>}
      triggerProps={{ size: "sm", variant: "outline", disabled: courses.length === 0 }}
      title={`Formations de ${label}`}
      description={description}
      action={grantTrainingAccess.bind(null, orgId, { contactId, userId })}
      submitLabel={hasAccount ? "Donner l'accès" : "Donner l'accès et envoyer l'invitation"}
      onSuccess={(result) => {
        if (result === "invited") toast.info(`Invitation envoyée à ${email}.`);
      }}
    >
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Formations publiées</legend>
        {courses.map((c) => (
          <div key={c.id} className="flex items-center gap-2">
            <Checkbox id={`grant-${p}-${c.id}`} name="course_ids" value={c.id} />
            <Label htmlFor={`grant-${p}-${c.id}`} className="font-normal">
              {c.title}
            </Label>
          </div>
        ))}
      </fieldset>
    </FormDialog>
  );
}

/** Learner without active training: detach the account from this client (no e-mail). */
export function DetachLearnerButton({ orgId, userId, label }: { orgId: string; userId: string; label: string }) {
  return (
    <ActionButton
      size="sm"
      variant="ghost"
      title="Détacher du client"
      confirm={`Détacher ${label} de ce client ? Ses inscriptions annulées restent dans l'historique. Aucun e-mail envoyé.`}
      action={() => removeMemberAccess(orgId, userId)}
      onSuccess={(result) => {
        if (result === "deleted") toast.info("Invitation inutilisée : le compte a été supprimé, le lien envoyé ne fonctionne plus.");
      }}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" /> Détacher
    </ActionButton>
  );
}
