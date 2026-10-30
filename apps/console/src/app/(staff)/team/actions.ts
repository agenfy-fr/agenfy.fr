"use server";

import { revalidatePath } from "next/cache";
import { inviteStaffSchema, staffUpdateSchema, uuid } from "@/lib/schemas";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaffRole } from "@/lib/server/auth";
import { siteOrigin } from "@/lib/server/site";
import { createAdminClient } from "@/lib/supabase/admin";

/** Owner/admin only (requireStaffRole([]) = admin roles). Only an owner grants or edits "owner". */
export async function inviteStaff(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase, role } = await requireStaffRole([]);
    const input = inviteStaffSchema.parse(formToObject(formData));
    if (input.role === "owner" && role !== "owner") throw new ActionError("Seul un propriétaire peut nommer un propriétaire.");

    const admin = createAdminClient();
    const redirectTo = new URL("/auth/callback", await siteOrigin());
    redirectTo.searchParams.set("next", "/account?welcome=1");
    const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
      redirectTo: redirectTo.toString(),
      data: input.full_name ? { full_name: input.full_name } : undefined,
    });
    let userId = data?.user?.id ?? null;
    if (error) {
      // Existing account (e.g. a learner of app.agenfy.fr): promote it.
      const target = input.email.toLowerCase();
      for (let page = 1; page <= 20 && !userId; page++) {
        const { data: list } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        userId = list?.users.find((u) => u.email?.toLowerCase() === target)?.id ?? null;
        if (!list || list.users.length < 200) break;
      }
      if (!userId) throw new ActionError("Invitation impossible pour cette adresse.");
    }

    const { error: insertError } = await supabase.from("staff").insert({ user_id: userId, role: input.role });
    if (insertError?.code === "23505") throw new ActionError("Cette personne fait déjà partie de l'équipe.");
    check({ data: null, error: insertError });
    revalidatePath("/team");
    return undefined;
  }, "Invitation envoyée.");
}

export async function updateStaffMember(userId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase, user, role } = await requireStaffRole([]);
    const id = uuid.parse(userId);
    if (id === user.id) throw new ActionError("Vous ne pouvez pas modifier votre propre rôle.");
    const input = staffUpdateSchema.parse(formToObject(formData));
    const current = check(await supabase.from("staff").select("role").eq("user_id", id).maybeSingle());
    if (!current) throw new ActionError("Membre introuvable.");
    if ((current.role === "owner" || input.role === "owner") && role !== "owner") {
      throw new ActionError("Seul un propriétaire peut modifier un propriétaire.");
    }
    check(await supabase.from("staff").update({ role: input.role, suspended: input.suspended }).eq("user_id", id));
    revalidatePath("/team");
    return undefined;
  }, "Membre mis à jour.");
}
