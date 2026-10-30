"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { appUrl } from "@/lib/supabase/env";
import { safeNext } from "@/lib/safe-next";

function back(params: Record<string, string>): never {
  redirect(`/login?${new URLSearchParams(params).toString()}`);
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) back({ error: "Email et mot de passe requis.", next });

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) back({ error: "Identifiants incorrects.", next, mode: "password" });

  redirect(next);
}

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const next = safeNext(formData.get("next"));
  if (!email) back({ error: "Indiquez votre adresse e-mail.", next });

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Accounts are created by Agenfy when enrolling a learner (no self sign-up).
      shouldCreateUser: false,
      emailRedirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  // Same message whether or not the account exists (no user enumeration).
  if (error && error.status !== 400 && error.status !== 422) {
    back({ error: "L'envoi du lien a échoué. Réessayez dans quelques minutes.", next });
  }
  back({ sent: "1", next });
}
