import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resolveHome, UNAUTHORIZED_PATH } from "@/lib/access-control";
import { getSession } from "@/lib/server/auth";
import { signOut } from "@/app/auth/actions";
import { AuthCard } from "@/app/auth/auth-card";

export const metadata: Metadata = { title: "Accès non autorisé" };

/** Signed-in account that is neither staff nor member of a client organization. */
export default async function UnauthorizedPage() {
  const session = await getSession();
  const home = resolveHome(session?.access ?? null);
  if (home !== UNAUTHORIZED_PATH) redirect(home);

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
