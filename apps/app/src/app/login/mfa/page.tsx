import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";
import { MfaForm } from "./mfa-form";

export const metadata: Metadata = { title: "Double authentification" };

/**
 * Second factor (TOTP): code entry when a factor is enrolled, enrollment
 * otherwise. Staff are sent here until their session is aal2 (0004_staff_mfa).
 */
export default async function MfaPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);

  const [{ data: aal }, { data: factors }, { data: staffPending }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
    supabase.rpc("staff_mfa_pending"),
  ]);
  if (aal?.currentLevel === "aal2") redirect(next);

  const factorId = factors?.totp?.[0]?.id ?? null;
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-transparent px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Image src="/logo.svg" alt="Agenfy" width={140} height={45} className="h-10 w-auto" priority />
        </Link>
        <Card className="border-border/60">
          <CardContent className="p-8">
            <h1 className="mb-1 text-center text-xl font-bold">Double authentification</h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              {factorId ? "Saisissez le code affiché dans votre application d'authentification." : user.email}
            </p>
            <MfaForm factorId={factorId} next={next} required={staffPending === true} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
