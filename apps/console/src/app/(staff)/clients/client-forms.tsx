"use client";

import { Plus, Trash2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { ActionButton, ActionForm } from "@/components/shared/action-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { Field, FormGrid } from "@/components/shared/field";
import { ORG_ROLES, ORG_ROLE_LABELS } from "@/lib/access-control";
import { ORG_SIZE_BANDS, ORG_STATUSES, ORG_STATUS_META } from "@/lib/domain";
import { toast } from "@/lib/toast";
import type { Organization, OrganizationInternal, StaffMember } from "@/lib/types";
import {
  createOrganization,
  inviteMember,
  removeMember,
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

export function InviteMemberButton({ orgId, defaultEmail }: { orgId: string; defaultEmail?: string }) {
  return (
    <FormDialog
      trigger={<><UserPlus className="h-4 w-4" aria-hidden="true" /> Inviter un contact</>}
      triggerProps={{ size: "sm", variant: "outline" }}
      title="Inviter un contact client"
      description="Le contact reçoit un e-mail d'invitation et accède uniquement aux données de cette organisation."
      action={inviteMember.bind(null, orgId)}
      submitLabel="Inviter"
    >
      <Field label="E-mail" htmlFor="inv-email">
        <Input id="inv-email" name="email" type="email" defaultValue={defaultEmail} required />
      </Field>
      <FormGrid>
        <Field label="Nom complet" htmlFor="inv-name">
          <Input id="inv-name" name="full_name" />
        </Field>
        <Field label="Rôle" htmlFor="inv-role">
          <NativeSelect id="inv-role" name="role" defaultValue="member">
            {ORG_ROLES.map((r) => (
              <option key={r} value={r}>
                {ORG_ROLE_LABELS[r]}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </FormGrid>
    </FormDialog>
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
        confirm={`Retirer l'accès de ${label} à cette organisation ? (le compte n'est pas supprimé)`}
        action={() => removeMember(orgId, userId)}
      >
        <Trash2 className="h-4 w-4" />
      </ActionButton>
    </div>
  );
}
