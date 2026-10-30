import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/access-control";
import { AuthCard } from "../auth-card";
import { MfaForm } from "./mfa-form";

export const metadata: Metadata = { title: "Double authentification" };

/**
 * Second factor (TOTP): code entry when a factor is enrolled, enrollment
 * otherwise. Staff are sent here until their session is aal2 (0004_staff_mfa).
 */
export default async function MfaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : "") ?? "/";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?next=${encodeURIComponent("/auth/mfa")}`);

  const [{ data: aal }, { data: factors }, { data: staffPending }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
    supabase.rpc("staff_mfa_pending"),
  ]);
  if (aal?.currentLevel === "aal2") redirect(next);

  const factorId = factors?.totp?.[0]?.id ?? null;
  return (
    <AuthCard
      title="Double authentification"
      description={factorId ? "Saisissez le code affiché dans votre application d'authentification." : user.email ?? undefined}
    >
      <MfaForm factorId={factorId} next={next} required={staffPending === true} />
    </AuthCard>
  );
}
