import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Callout } from "@/components/shared/callout";
import { getSession } from "@/lib/server/auth";
import { resolveHome } from "@/lib/access-control";
import { AccountForms } from "./account-forms";

export const metadata: Metadata = { title: "Mon compte" };

/** Profile + password for any signed-in user (staff or client). Invitation landing page. */
export default async function AccountPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/auth/login?next=/account");
  const { welcome } = await searchParams;
  const { data: profile } = await session.supabase
    .from("profiles")
    .select("full_name, phone, job_title")
    .eq("id", session.user.id)
    .maybeSingle();
  const { data: factors } = await session.supabase.auth.mfa.listFactors();
  const mfaEnabled = (factors?.totp?.length ?? 0) > 0;
  const isStaffMember = session.access.staffRole !== null || session.mfaPending;
  const home = resolveHome(session.access);

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <Link href={home} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Mon compte</h1>
        {welcome && (
          <Callout tone="info" title="Bienvenue sur Agenfy">
            Complétez votre nom et choisissez un mot de passe : vous pourrez ensuite vous connecter avec votre e-mail et ce
            mot de passe, ou par lien magique.
          </Callout>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil</CardTitle>
            <CardDescription>{session.user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <AccountForms
              profile={{
                full_name: profile?.full_name ?? "",
                phone: profile?.phone ?? "",
                job_title: profile?.job_title ?? "",
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {mfaEnabled ? (
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-amber-600" aria-hidden="true" />
              )}
              Double authentification
            </CardTitle>
            <CardDescription>
              {mfaEnabled
                ? "Activée : un code de votre application d'authentification est demandé à chaque connexion."
                : isStaffMember
                  ? "Obligatoire pour l'équipe Agenfy."
                  : "Recommandée : ajoute un code à usage unique en plus du mot de passe."}
            </CardDescription>
          </CardHeader>
          {!mfaEnabled && (
            <CardContent>
              <Button asChild>
                <Link href="/auth/mfa?next=/account">Activer la double authentification</Link>
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
