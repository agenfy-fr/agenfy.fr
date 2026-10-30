"use client";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ActionForm } from "@/components/shared/action-form";
import { Field, FormGrid } from "@/components/shared/field";
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from "@/lib/mfa";
import { updateOwnPassword, updateOwnProfile } from "./actions";

export function AccountForms({ profile }: { profile: { full_name: string; phone: string; job_title: string } }) {
  return (
    <div className="space-y-6">
      <ActionForm action={updateOwnProfile} className="space-y-4">
        <Field label="Nom complet" htmlFor="full_name">
          <Input id="full_name" name="full_name" defaultValue={profile.full_name} required autoComplete="name" />
        </Field>
        <FormGrid>
          <Field label="Téléphone" htmlFor="phone">
            <Input id="phone" name="phone" defaultValue={profile.phone} autoComplete="tel" />
          </Field>
          <Field label="Fonction" htmlFor="job_title">
            <Input id="job_title" name="job_title" defaultValue={profile.job_title} autoComplete="organization-title" />
          </Field>
        </FormGrid>
      </ActionForm>
      <Separator />
      <ActionForm action={updateOwnPassword} className="space-y-4" resetOnSuccess submitLabel="Définir le mot de passe">
        <h2 className="text-sm font-semibold">Mot de passe</h2>
        <FormGrid>
          <Field label="Nouveau mot de passe" htmlFor="password" hint={PASSWORD_HINT}>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required />
          </Field>
          <Field label="Confirmation" htmlFor="confirm">
            <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required />
          </Field>
        </FormGrid>
      </ActionForm>
    </div>
  );
}
