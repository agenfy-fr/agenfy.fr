import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { safeNext } from "@/lib/safe-next";
import { sendMagicLink, signInWithPassword } from "./actions";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; next?: string; mode?: string }>;
}) {
  const { error, sent, next: rawNext, mode } = await searchParams;
  const next = safeNext(rawNext);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-transparent px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Image src="/logo.svg" alt="Agenfy" width={140} height={45} className="h-10 w-auto" priority />
        </Link>

        <Card className="border-border/60">
          <CardContent className="p-8">
            <h1 className="mb-1 text-center text-xl font-bold">Espace formation</h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Connectez-vous avec l&apos;adresse utilisée pour votre inscription.
            </p>

            {error && (
              <Notice tone="error" className="mb-4">
                {error}
              </Notice>
            )}
            {sent && (
              <Notice tone="success" className="mb-4">
                Si un compte existe pour cette adresse, un lien de connexion vient de vous être envoyé. Pensez à
                vérifier vos indésirables.
              </Notice>
            )}

            <form action={sendMagicLink} className="space-y-3">
              <input type="hidden" name="next" value={next} />
              <label htmlFor="magic-email" className="text-sm font-medium">
                Email
              </label>
              <Input id="magic-email" name="email" type="email" autoComplete="email" required />
              <SubmitButton className="w-full rounded-full gradient-btn border-0 text-white" pendingLabel="Envoi du lien…">
                Recevoir un lien de connexion
              </SubmitButton>
            </form>

            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">ou</span>
              <Separator className="flex-1" />
            </div>

            <details open={mode === "password"} className="group">
              <summary className="cursor-pointer list-none text-center text-sm font-medium text-primary hover:underline">
                Se connecter avec un mot de passe
              </summary>
              <form action={signInWithPassword} className="mt-4 space-y-3">
                <input type="hidden" name="next" value={next} />
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input id="email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium">
                    Mot de passe
                  </label>
                  <Input id="password" name="password" type="password" autoComplete="current-password" required />
                </div>
                <SubmitButton className="w-full rounded-full" variant="outline" pendingLabel="Connexion…">
                  Se connecter
                </SubmitButton>
              </form>
            </details>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Pas encore de compte ? Les accès sont créés par Agenfy lors de votre inscription à une formation.{" "}
          <a href="mailto:contact@agenfy.fr" className="underline hover:text-foreground">
            Nous contacter
          </a>
        </p>
      </div>
    </main>
  );
}
