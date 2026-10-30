"use client";

import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ActionForm } from "@/components/shared/action-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { Field, FormGrid } from "@/components/shared/field";
import { STAFF_ROLES, STAFF_ROLE_LABELS } from "@/lib/access-control";
import type { StaffMember } from "@/lib/types";
import { inviteStaff, updateStaffMember } from "./actions";

function RoleOptions({ canGrantOwner }: { canGrantOwner: boolean }) {
  return (
    <>
      {STAFF_ROLES.filter((r) => canGrantOwner || r !== "owner").map((r) => (
        <option key={r} value={r}>
          {STAFF_ROLE_LABELS[r]}
        </option>
      ))}
    </>
  );
}

export function InviteStaffButton({ canGrantOwner }: { canGrantOwner: boolean }) {
  return (
    <FormDialog
      trigger={<><UserPlus className="h-4 w-4" aria-hidden="true" /> Inviter</>}
      title="Inviter un membre de l'équipe"
      description="La personne reçoit un e-mail d'invitation pour accéder au back-office."
      action={inviteStaff}
      submitLabel="Inviter"
    >
      <Field label="E-mail" htmlFor="st-email">
        <Input id="st-email" name="email" type="email" required />
      </Field>
      <FormGrid>
        <Field label="Nom complet" htmlFor="st-name">
          <Input id="st-name" name="full_name" />
        </Field>
        <Field label="Rôle" htmlFor="st-role">
          <NativeSelect id="st-role" name="role" defaultValue="consultant">
            <RoleOptions canGrantOwner={canGrantOwner} />
          </NativeSelect>
        </Field>
      </FormGrid>
    </FormDialog>
  );
}

export function StaffRowForm({ member, canGrantOwner }: { member: StaffMember; canGrantOwner: boolean }) {
  return (
    <ActionForm
      action={updateStaffMember.bind(null, member.id)}
      className="flex flex-wrap items-center gap-3"
      submitLabel="OK"
      submitProps={{ size: "sm", variant: "outline" }}
    >
      <NativeSelect name="role" aria-label={`Rôle de ${member.full_name || member.email}`} className="h-8 w-40" defaultValue={member.role}>
        <RoleOptions canGrantOwner={canGrantOwner} />
      </NativeSelect>
      <div className="flex items-center gap-1.5">
        <Checkbox id={`susp-${member.id}`} name="suspended" defaultChecked={member.suspended} />
        <Label htmlFor={`susp-${member.id}`} className="text-xs font-normal">
          Suspendu
        </Label>
      </div>
    </ActionForm>
  );
}
