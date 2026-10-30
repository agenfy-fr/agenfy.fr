import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { Notice, PageTitle } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { requireViewer } from "@/lib/auth";
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from "@/lib/mfa";
import { createClient } from "@/lib/supabase/server";
import { updatePassword, updateProfile } from "./actions";

export const metadata: Metadata = { title: "Mon compte" };

const ERRORS: Record<string, string> = {
  name: "Indiquez votre prénom et votre nom (3 à 120 caractères).",
  save: "L'enregistrement a échoué. Réessayez.",
  "password-policy": `Mot de passe trop simple. ${PASSWORD_HINT} Il ne doit pas contenir votre adresse e-mail.`,
  "password-leaked": "Ce mot de passe est trop faible ou figure dans une fuite de données connue. Choisissez-en un autre.",
  "password-match": "Les deux mots de passe ne correspondent pas.",
  password: "Le mot de passe n'a pas pu être modifié.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; welcome?: string }>;
}) {
  const { error, saved, welcome } = await searchParams;
  const viewer = await requireViewer("/compte");
  const supabase = await createClient();
  const [{ data: profile }, { data: factors }] = await Promise.all([
    supabase.from("profiles").select("full_name, job_title").eq("id", viewer.id).maybeSingle(),
    supabase.auth.mfa.listFactors(),
  ]);
  const mfaEnabled = (factors?.totp?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle title="Mon compte" description={viewer.email} />
      {welcome && (
        <Notice tone="success" className="mb-6">
          Bienvenue ! Vérifiez votre nom (il figurera sur votre attestation) et choisissez un mot de passe si vous
          souhaitez vous connecter sans lien magique.
        </Notice>
      )}
      {error && ERRORS[error] && (
        <Notice tone="error" className="mb-6">
          {ERRORS[error]}
        </Notice>
      )}
      {saved && (
        <Notice tone="success" className="mb-6">
          Modifications enregistrées.
        </Notice>
      )}

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Profil</h2>
        <form action={updateProfile} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="full_name" className="text-sm font-medium">
              Prénom et nom
            </label>
            <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} required minLength={3} maxLength={120} autoComplete="name" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="job_title" className="text-sm font-medium">
              Fonction
            </label>
            <Input id="job_title" name="job_title" defaultValue={profile?.job_title ?? ""} maxLength={120} autoComplete="organization-title" />
          </div>
          <SubmitButton className="rounded-full">Enregistrer</SubmitButton>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Mot de passe</h2>
        <form action={updatePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Nouveau mot de passe
            </label>
            <Input id="password" name="password" type="password" minLength={PASSWORD_MIN_LENGTH} required autoComplete="new-password" aria-describedby="password-hint" />
            <p id="password-hint" className="text-xs text-muted-foreground">
              {PASSWORD_HINT}
            </p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="text-sm font-medium">
              Confirmation
            </label>
            <Input id="confirm" name="confirm" type="password" minLength={PASSWORD_MIN_LENGTH} required autoComplete="new-password" />
          </div>
          <SubmitButton className="rounded-full" variant="outline">
            Définir le mot de passe
          </SubmitButton>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-6">
        <h2 className="mb-2 font-semibold">Double authentification</h2>
        {mfaEnabled ? (
          <p className="text-sm text-muted-foreground">
            Activée : un code de votre application d&apos;authentification est demandé à chaque connexion.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {viewer.staffRole
                ? "Obligatoire pour l'équipe Agenfy."
                : "Recommandée : ajoute un code à usage unique en plus du mot de passe ou du lien magique."}
            </p>
            <Link
              href="/login/mfa?next=/compte"
              className="inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium hover:bg-muted"
            >
              Activer la double authentification
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
