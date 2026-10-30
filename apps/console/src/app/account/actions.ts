"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession, UnauthorizedError } from "@/lib/server/auth";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { PASSWORD_MAX_LENGTH, passwordProblem } from "@/lib/mfa";

const profileSchema = z.object({
  full_name: z.string().trim().min(1, { error: "Nom requis." }).max(120),
  phone: z.string().trim().max(40).optional(),
  job_title: z.string().trim().max(120).optional(),
});

/** Any signed-in user (staff or client) edits their own profile (RLS: id = auth.uid()). */
export async function updateOwnProfile(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const session = await getSession();
    if (!session) throw new UnauthorizedError();
    const input = profileSchema.parse(formToObject(formData));
    check(
      await session.supabase
        .from("profiles")
        .update({ full_name: input.full_name, phone: input.phone ?? null, job_title: input.job_title ?? null })
        .eq("id", session.user.id),
    );
    revalidatePath("/", "layout");
    return undefined;
  }, "Profil mis à jour.");
}

const passwordSchema = z
  .object({
    password: z.string().max(PASSWORD_MAX_LENGTH * 4),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { error: "Les mots de passe ne correspondent pas.", path: ["confirm"] });

export async function updateOwnPassword(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const session = await getSession();
    if (!session) throw new UnauthorizedError();
    const input = passwordSchema.parse({ password: formData.get("password"), confirm: formData.get("confirm") });
    const problem = passwordProblem(input.password, session.user.email);
    if (problem) throw new ActionError(problem);
    // With a second factor enrolled, the password only changes from a 2FA-verified session.
    const { data: aal } = await session.supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      throw new ActionError("Validez d'abord votre code de double authentification.");
    }
    const { error } = await session.supabase.auth.updateUser({ password: input.password });
    if (error) {
      if (/weak|pwned|leaked/i.test(error.message)) throw new ActionError("Mot de passe trop faible ou déjà exposé dans une fuite de données.");
      if (/same/i.test(error.message)) throw new ActionError("Choisissez un mot de passe différent de l'actuel.");
      if (/reauth/i.test(error.message)) throw new ActionError("Reconnectez-vous puis réessayez (sécurité).");
      throw new ActionError("Mise à jour impossible.");
    }
    return undefined;
  }, "Mot de passe enregistré.");
}
