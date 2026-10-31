import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isLearnerOnly, resolveHome, UNAUTHORIZED_PATH } from "@/lib/access-control";
import { getSession } from "@/lib/server/auth";
import { trainingAppOrigin } from "@/lib/server/site";
import { signOut } from "@/app/auth/actions";
import { AuthCard } from "@/app/auth/auth-card";

export const metadata: Metadata = { title: "Accès non autorisé" };

/**
 * Signed-in account that is neither staff nor portal member of a client
 * organization. Employees with training access only (role `learner`, or an
 * enrollment without organization) are pointed to app.agenfy.fr.
 */
export default async function UnauthorizedPage() {
  const session = await getSession();
  const home = resolveHome(session?.access ?? null);
  if (home !== UNAUTHORIZED_PATH) redirect(home);

  let learner = isLearnerOnly(session?.access ?? null);
  if (!learner && session) {
    const { count } = await session.supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .neq("status", "cancelled");
    learner = (count ?? 0) > 0;
  }

  if (learner) {
    const appUrl = trainingAppOrigin();
    return (
      <AuthCard title="Votre espace formation">
        <div className="space-y-4 text-sm">
          <p>
            Le compte <strong className="break-all">{session?.access.email}</strong> donne accès aux formations Agenfy, pas à
            l&apos;espace client de la console.
          </p>
          <p className="text-muted-foreground">
            Vos formations, leçons et attestations se trouvent sur l&apos;espace formation. Connectez-vous avec la même
            adresse e-mail.
          </p>
          <Button asChild className="w-full">
            <a href={`${appUrl}/dashboard`}>Ouvrir l&apos;espace formation</a>
          </Button>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full">
              Se déconnecter
            </Button>
          </form>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Accès non autorisé">
      <div className="space-y-4 text-sm">
        <p>
          Le compte <strong className="break-all">{session?.access.email}</strong> n&apos;est rattaché ni à l&apos;équipe
          Agenfy ni à une organisation cliente.
        </p>
        <p className="text-muted-foreground">
          Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez votre interlocuteur Agenfy pour recevoir une
          invitation.
        </p>
        <form action={signOut}>
          <Button type="submit" variant="outline" className="w-full">
            Se déconnecter
          </Button>
        </form>
      </div>
    </AuthCard>
  );
}
