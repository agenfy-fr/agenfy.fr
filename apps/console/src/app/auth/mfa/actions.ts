"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/access-control";
import { normalizeTotpCode } from "@/lib/mfa";

export type EnrollResult = { factorId: string; qrCode: string; secret: string } | { error: string };
export type VerifyState = { error?: string } | null;

/**
 * Starts a TOTP enrollment for the signed-in user. Leftover unverified factors
 * (abandoned attempts) are removed first so the friendly name stays unique.
 */
export async function startTotpEnrollment(): Promise<EnrollResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expirée : reconnectez-vous." };

  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const factor of factors?.all ?? []) {
    if (factor.factor_type === "totp" && factor.status === "unverified") {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    issuer: "Agenfy",
    friendlyName: `Application d'authentification ${new Date().toISOString().slice(0, 16)}`,
  });
  if (error || !data) {
    console.error("[mfa] enroll failed:", error?.status, error?.message);
    return { error: "Impossible de générer le QR code. Réessayez dans quelques minutes." };
  }
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

const verifySchema = z.object({ factorId: z.uuid() });

/** Verifies a TOTP code: completes an enrollment or upgrades the session to aal2. */
export async function verifyTotp(_prev: VerifyState, formData: FormData): Promise<VerifyState> {
  const parsed = verifySchema.safeParse({ factorId: formData.get("factorId") });
  const code = normalizeTotpCode(formData.get("code"));
  if (!parsed.success) return { error: "Facteur inconnu : rechargez la page." };
  if (!code) return { error: "Saisissez les 6 chiffres affichés dans votre application." };

  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: parsed.data.factorId, code });
  if (error) return { error: "Code incorrect ou expiré. Utilisez le code affiché en ce moment." };

  redirect(safeNextPath(String(formData.get("next") ?? "")) ?? "/");
}
