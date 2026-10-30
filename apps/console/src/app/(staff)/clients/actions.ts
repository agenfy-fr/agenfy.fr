"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ORG_ROLES } from "@/lib/access-control";
import { slugify } from "@/lib/format";
import { inviteMemberSchema, organizationInternalSchema, organizationSchema, uuid } from "@/lib/schemas";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaffWriter } from "@/lib/server/auth";
import { siteOrigin } from "@/lib/server/site";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createOrganization(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const res = await runAction(async () => {
    const { supabase, user } = await requireStaffWriter();
    const input = organizationSchema.parse(formToObject(formData));
    const base = slugify(input.name) || "client";
    const { data: taken } = await supabase.from("organizations").select("slug").like("slug", `${base}%`);
    const slugs = new Set((taken ?? []).map((r) => r.slug as string));
    let slug = base;
    for (let i = 2; slugs.has(slug); i++) slug = `${base}-${i}`;

    const org = check(await supabase.from("organizations").insert({ ...input, slug }).select("id").single()) as { id: string };
    check(await supabase.from("organization_internal").insert({ organization_id: org.id, account_manager_id: user.id }));
    revalidatePath("/clients");
    return org.id;
  });
  if (res.ok && res.data) redirect(`/clients/${res.data}`);
  return res.ok ? { ok: true } : res;
}

export async function updateOrganization(orgId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const id = uuid.parse(orgId);
    const input = organizationSchema.parse(formToObject(formData));
    check(await supabase.from("organizations").update(input).eq("id", id));
    revalidatePath(`/clients/${id}`);
    return undefined;
  }, "Fiche client mise à jour.");
}

export async function updateOrganizationInternal(orgId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const id = uuid.parse(orgId);
    const input = organizationInternalSchema.parse(formToObject(formData));
    check(await supabase.from("organization_internal").upsert({ organization_id: id, ...input }));
    revalidatePath(`/clients/${id}`);
    revalidatePath("/clients");
    return undefined;
  }, "Informations internes enregistrées.");
}

/** Find an existing auth user by e-mail (service role; small user base → paginated scan). */
async function findUserIdByEmail(admin: ReturnType<typeof createAdminClient>, email: string): Promise<string | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new ActionError("Recherche du compte impossible.");
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit.id;
    if (data.users.length < 200) break;
  }
  return null;
}

/**
 * Invite a client contact: creates the auth account by e-mail invitation
 * (auth.admin.inviteUserByEmail, server-side service role) or reuses an
 * existing account, then adds the membership with the staff session (RLS).
 */
export async function inviteMember(
  orgId: string,
  _prev: ActionResult<"existing" | "invited"> | null,
  formData: FormData,
): Promise<ActionResult<"existing" | "invited">> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const id = uuid.parse(orgId);
    const input = inviteMemberSchema.parse(formToObject(formData));
    const org = check(await supabase.from("organizations").select("id, name").eq("id", id).maybeSingle());
    if (!org) throw new ActionError("Organisation introuvable.");

    const admin = createAdminClient();
    const redirectTo = new URL("/auth/callback", await siteOrigin());
    redirectTo.searchParams.set("next", "/account?welcome=1");
    const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
      redirectTo: redirectTo.toString(),
      data: input.full_name ? { full_name: input.full_name } : undefined,
    });

    let userId = invited?.user?.id ?? null;
    let existing = false;
    if (error) {
      // Already registered (staff, member of another org, learner…): reuse it.
      userId = await findUserIdByEmail(admin, input.email);
      existing = true;
      if (!userId) {
        console.error("[clients] invite failed:", error.status, error.message);
        throw new ActionError("Invitation impossible pour cette adresse.");
      }
    }

    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({ organization_id: id, user_id: userId, role: input.role });
    if (memberError?.code === "23505") throw new ActionError("Ce contact est déjà membre de l'organisation.");
    check({ data: null, error: memberError });

    revalidatePath(`/clients/${id}`);
    return existing ? ("existing" as const) : ("invited" as const);
  }, "Contact ajouté. S'il n'avait pas de compte, il a reçu une invitation par e-mail.");
}

export async function updateMemberRole(orgId: string, userId: string, role: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const nextRole = z.enum(ORG_ROLES).parse(role);
    check(
      await supabase
        .from("organization_members")
        .update({ role: nextRole })
        .eq("organization_id", uuid.parse(orgId))
        .eq("user_id", uuid.parse(userId)),
    );
    revalidatePath(`/clients/${orgId}`);
    return undefined;
  }, "Rôle mis à jour.");
}

export async function removeMember(orgId: string, userId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    check(
      await supabase
        .from("organization_members")
        .delete()
        .eq("organization_id", uuid.parse(orgId))
        .eq("user_id", uuid.parse(userId)),
    );
    revalidatePath(`/clients/${orgId}`);
    return undefined;
  }, "Accès retiré.");
}
