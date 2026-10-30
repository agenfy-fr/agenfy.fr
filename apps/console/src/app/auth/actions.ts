"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/access-control";
import { siteOrigin } from "@/lib/server/site";

export type LoginState = { error?: string; info?: string } | null;

const emailSchema = z.email({ error: "Adresse e-mail invalide." }).max(320);

const passwordLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Mot de passe requis." }).max(200),
});

export async function signInWithPassword(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = passwordLoginSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Identifiants invalides." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Same message whatever the cause: no account enumeration.
    return { error: "E-mail ou mot de passe incorrect." };
  }
  redirect(safeNextPath(String(formData.get("next") ?? "")) ?? "/");
}

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) return { error: "Adresse e-mail invalide." };

  const next = safeNextPath(String(formData.get("next") ?? ""));
  const callback = new URL("/auth/callback", await siteOrigin());
  if (next) callback.searchParams.set("next", next);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      // Accounts are created by invitation only (staff or client invite).
      shouldCreateUser: false,
      emailRedirectTo: callback.toString(),
    },
  });
  if (error && error.status !== 400 && error.status !== 422) {
    console.error("[auth] magic link failed:", error.status, error.message);
    return { error: "Envoi impossible pour le moment. Réessayez dans quelques minutes." };
  }
  // Same answer whether the account exists or not.
  return { info: "Si un compte existe pour cette adresse, un lien de connexion vient d'être envoyé." };
}

const sessionTokensSchema = z.object({
  access_token: z.string().min(20).max(8192),
  refresh_token: z.string().min(1).max(8192),
});

/**
 * Fallback for e-mail links that return tokens in the URL fragment (implicit
 * flow, e.g. the default invitation template): /auth/confirm posts them here
 * and the session cookie is set server-side. Supabase validates the JWT.
 */
export async function setSessionFromTokens(input: { access_token: string; refresh_token: string }): Promise<{ ok: boolean }> {
  const parsed = sessionTokensSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase.auth.setSession(parsed.data);
  return { ok: !error };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
