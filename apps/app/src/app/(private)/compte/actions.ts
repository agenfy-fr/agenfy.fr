"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { passwordProblem } from "@/lib/mfa";

export async function updateProfile(formData: FormData) {
  const viewer = await requireViewer("/compte");
  const fullName = String(formData.get("full_name") ?? "").trim().replace(/\s+/g, " ");
  const jobTitle = String(formData.get("job_title") ?? "").trim();
  if (fullName.length < 3 || fullName.length > 120) redirect("/compte?error=name");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, job_title: jobTitle.slice(0, 120) || null })
    .eq("id", viewer.id);
  if (error) redirect("/compte?error=save");
  revalidatePath("/", "layout");
  redirect("/compte?saved=profile");
}

export async function updatePassword(formData: FormData) {
  const viewer = await requireViewer("/compte");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (passwordProblem(password, viewer.email)) redirect("/compte?error=password-policy");
  if (password !== confirm) redirect("/compte?error=password-match");

  const supabase = await createClient();
  // With a second factor enrolled, the password only changes from a 2FA-verified session.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") redirect("/login/mfa?next=/compte");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(/weak|pwned|leaked/i.test(error.message) ? "/compte?error=password-leaked" : "/compte?error=password");
  redirect("/compte?saved=password");
}
