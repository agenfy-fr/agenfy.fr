"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ORG_ROLES } from "@/lib/access-control";
import { slugify } from "@/lib/format";
import { contactSchema, inviteContactSchema, organizationInternalSchema, organizationSchema, uuid } from "@/lib/schemas";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaffWriter } from "@/lib/server/auth";
import { siteOrigin } from "@/lib/server/site";
import type { User } from "@supabase/supabase-js";
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

// --- Contacts (address book): adding, editing or deleting a contact sends nothing ---

export async function createContact(orgId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const id = uuid.parse(orgId);
    const input = contactSchema.parse(formToObject(formData));
    const { error } = await supabase.from("organization_contacts").insert({ organization_id: id, ...input });
    if (error?.code === "23505") throw new ActionError("Un contact avec cet e-mail existe déjà pour ce client.");
    check({ data: null, error });
    revalidatePath(`/clients/${id}`);
    return undefined;
  }, "Contact ajouté (aucun e-mail envoyé).");
}

export async function updateContact(orgId: string, contactId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const id = uuid.parse(orgId);
    const input = contactSchema.parse(formToObject(formData));
    const { error } = await supabase
      .from("organization_contacts")
      .update(input)
      .eq("id", uuid.parse(contactId))
      .eq("organization_id", id);
    if (error?.code === "23505") throw new ActionError("Un contact avec cet e-mail existe déjà pour ce client.");
    check({ data: null, error });
    revalidatePath(`/clients/${id}`);
    return undefined;
  }, "Contact mis à jour.");
}

export async function deleteContact(orgId: string, contactId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const id = uuid.parse(orgId);
    const contact = check(
      await supabase.from("organization_contacts").select("id, user_id").eq("id", uuid.parse(contactId)).eq("organization_id", id).maybeSingle(),
    );
    if (!contact) throw new ActionError("Contact introuvable.");
    if (contact.user_id) {
      const { count } = await supabase
        .from("organization_members")
        .select("user_id", { count: "exact", head: true })
        .eq("organization_id", id)
        .eq("user_id", contact.user_id);
      if (count) throw new ActionError("Ce contact a accès à l'espace client : retirez d'abord son accès.");
    }
    check(await supabase.from("organization_contacts").delete().eq("id", contact.id));
    revalidatePath(`/clients/${id}`);
    return undefined;
  }, "Contact supprimé.");
}

/** Find an existing auth user by e-mail (service role; small user base → paginated scan). */
async function findUserByEmail(admin: ReturnType<typeof createAdminClient>, email: string): Promise<User | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new ActionError("Recherche du compte impossible.");
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

/**
 * Explicit portal invitation of a contact: creates the auth account by e-mail
 * invitation (auth.admin.inviteUserByEmail, service role) or reuses an
 * existing account, then adds the membership with the staff session (RLS).
 * The ONLY place that e-mails a client contact.
 */
export async function inviteContact(
  orgId: string,
  contactId: string,
  _prev: ActionResult<"existing" | "invited"> | null,
  formData: FormData,
): Promise<ActionResult<"existing" | "invited">> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const id = uuid.parse(orgId);
    const { role } = inviteContactSchema.parse(formToObject(formData));
    const contact = check(
      await supabase
        .from("organization_contacts")
        .select("id, email, full_name")
        .eq("id", uuid.parse(contactId))
        .eq("organization_id", id)
        .maybeSingle(),
    );
    if (!contact) throw new ActionError("Contact introuvable.");
    if (!contact.email) throw new ActionError("Ajoutez d'abord une adresse e-mail à ce contact.");

    const admin = createAdminClient();
    const redirectTo = new URL("/auth/callback", await siteOrigin());
    redirectTo.searchParams.set("next", "/account?welcome=1");
    const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(contact.email, {
      redirectTo: redirectTo.toString(),
      data: contact.full_name ? { full_name: contact.full_name } : undefined,
    });

    let userId = invited?.user?.id ?? null;
    let existing = false;
    if (error) {
      // Already registered (staff, member of another org, learner…): reuse it.
      userId = (await findUserByEmail(admin, contact.email))?.id ?? null;
      existing = true;
      if (!userId) {
        console.error("[clients] invite failed:", error.status, error.message);
        throw new ActionError("Invitation impossible pour cette adresse.");
      }
    }

    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({ organization_id: id, user_id: userId, role });
    if (memberError && memberError.code !== "23505") check({ data: null, error: memberError });
    check(
      await supabase
        .from("organization_contacts")
        .update({ user_id: userId, invited_at: new Date().toISOString() })
        .eq("id", contact.id),
    );

    revalidatePath(`/clients/${id}`);
    return existing ? ("existing" as const) : ("invited" as const);
  }, "Accès ouvert. Un nouveau compte reçoit un e-mail d'invitation ; un compte existant n'en reçoit pas.");
}

/**
 * Remove a portal access. If the account was only invited (never signed in)
 * and has no other role (staff, other client, learner), the auth account is
 * deleted too, so the e-mailed invitation link stops working.
 */
export async function removeMemberAccess(orgId: string, userId: string): Promise<ActionResult<"deleted" | "kept">> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const id = uuid.parse(orgId);
    const uid = uuid.parse(userId);
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(uid);
    if (error || !data.user) throw new ActionError("Compte introuvable.");

    check(await supabase.from("organization_members").delete().eq("organization_id", id).eq("user_id", uid));
    check(await supabase.from("organization_contacts").update({ user_id: null, invited_at: null }).eq("organization_id", id).eq("user_id", uid));

    const [otherOrgs, staffRow, enrollments] = await Promise.all([
      admin.from("organization_members").select("user_id", { count: "exact", head: true }).eq("user_id", uid),
      admin.from("staff").select("user_id", { count: "exact", head: true }).eq("user_id", uid),
      admin.from("enrollments").select("user_id", { count: "exact", head: true }).eq("user_id", uid),
    ]);
    const neverUsed = !data.user.last_sign_in_at || !data.user.email_confirmed_at;
    const otherRoles = (otherOrgs.count ?? 0) + (staffRow.count ?? 0) + (enrollments.count ?? 0);
    let result: "deleted" | "kept" = "kept";
    if (neverUsed && otherRoles === 0) {
      const { error: delError } = await admin.auth.admin.deleteUser(uid);
      if (delError) console.error("[clients] delete invited user failed:", delError.message);
      else result = "deleted";
    }
    revalidatePath(`/clients/${id}`);
    return result;
  }, "Accès retiré.");
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
