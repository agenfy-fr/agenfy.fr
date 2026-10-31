"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TRAINING_WRITE_ROLES } from "@/lib/access-control";
import { slugify } from "@/lib/format";
import {
  contactSchema,
  grantTrainingSchema,
  inviteContactSchema,
  orgRoleSchema,
  organizationInternalSchema,
  organizationSchema,
  uuid,
} from "@/lib/schemas";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaffRole, requireStaffWriter } from "@/lib/server/auth";
import { siteOrigin, trainingAppOrigin } from "@/lib/server/site";
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
      if (count) throw new ActionError("Ce contact a un compte rattaché à ce client (espace client ou formation) : retirez d'abord ses accès (onglet Accès).");
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
    if (memberError?.code === "23505") {
      // Employee with training access only: open the portal with the chosen role.
      check(
        await supabase
          .from("organization_members")
          .update({ role })
          .eq("organization_id", id)
          .eq("user_id", userId)
          .eq("role", "learner"),
      );
    }
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
 * Remove a portal access. A person who still follows a training of this
 * client stays attached as `learner` (training only, no portal). Otherwise
 * the membership is deleted and, if the account was only invited (never
 * signed in) and has no other role (staff, other client, learner), the auth
 * account is deleted too, so the e-mailed invitation link stops working.
 */
export async function removeMemberAccess(orgId: string, userId: string): Promise<ActionResult<"deleted" | "kept" | "learner">> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const id = uuid.parse(orgId);
    const uid = uuid.parse(userId);

    const { count: activeTraining } = await supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", id)
      .eq("user_id", uid)
      .neq("status", "cancelled");
    if (activeTraining) {
      check(await supabase.from("organization_members").update({ role: "learner" }).eq("organization_id", id).eq("user_id", uid));
      revalidatePath(`/clients/${id}`);
      return "learner" as const;
    }

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
    let result: "deleted" | "kept" | "learner" = "kept";
    if (neverUsed && otherRoles === 0) {
      const { error: delError } = await admin.auth.admin.deleteUser(uid);
      if (delError) console.error("[clients] delete invited user failed:", delError.message);
      else result = "deleted";
    }
    revalidatePath(`/clients/${id}`);
    return result;
  }, "Accès retiré.");
}

/**
 * Change the role of an existing account in this client (no e-mail sent):
 * learner → member/manager/owner opens the client portal, owner = responsable.
 */
export async function updateMemberRole(orgId: string, userId: string, role: string): Promise<ActionResult> {
  const nextRole = orgRoleSchema.safeParse(role);
  return runAction(
    async () => {
      const { supabase } = await requireStaffWriter();
      if (!nextRole.success) throw new ActionError("Rôle inconnu.");
      const rows = check(
        await supabase
          .from("organization_members")
          .update({ role: nextRole.data })
          .eq("organization_id", uuid.parse(orgId))
          .eq("user_id", uuid.parse(userId))
          .select("user_id"),
      );
      if (!rows?.length) throw new ActionError("Cette personne n'a pas de compte rattaché à ce client.");
      revalidatePath(`/clients/${orgId}`);
      return undefined;
    },
    nextRole.success && nextRole.data === "learner"
      ? "Accès à l'espace client retiré : formation uniquement."
      : "Rôle mis à jour (aucun e-mail envoyé).",
  );
}

/**
 * Give a person of this client access to one or more PUBLISHED courses on
 * app.agenfy.fr (enroll_by_email, staff session). A person without account
 * receives ONE invitation e-mail whose link opens the training platform
 * (redirect to the app origin, not the console); an existing account
 * receives nothing. New people join the client as `learner` (training only,
 * no portal — 0304). Target: an address-book contact or an existing account.
 */
export async function grantTrainingAccess(
  orgId: string,
  target: { contactId?: string | null; userId?: string | null },
  _prev: ActionResult<"invited" | "existing"> | null,
  formData: FormData,
): Promise<ActionResult<"invited" | "existing">> {
  return runAction(async () => {
    const { supabase } = await requireStaffRole(TRAINING_WRITE_ROLES);
    const id = uuid.parse(orgId);
    const { course_ids } = grantTrainingSchema.parse(formToObject(formData));

    const { data: courses } = await supabase.from("courses").select("id, status").in("id", course_ids);
    if ((courses ?? []).length !== course_ids.length || (courses ?? []).some((c) => c.status !== "published")) {
      throw new ActionError("Seules les formations publiées peuvent être attribuées.");
    }

    // Service role only when needed (account lookup / invitation).
    const admin = () => createAdminClient();
    let contact: { id: string; email: string | null; full_name: string | null; user_id: string | null } | null = null;
    let email: string | null = null;
    if (target.contactId) {
      contact = check(
        await supabase
          .from("organization_contacts")
          .select("id, email, full_name, user_id")
          .eq("id", uuid.parse(target.contactId))
          .eq("organization_id", id)
          .maybeSingle(),
      );
      if (!contact) throw new ActionError("Contact introuvable.");
      email = contact.email;
    }
    if (!email && (target.userId || contact?.user_id)) {
      const { data } = await admin().auth.admin.getUserById(uuid.parse(target.userId ?? contact!.user_id));
      email = data.user?.email ?? null;
    }
    if (!email) throw new ActionError("Ajoutez d'abord une adresse e-mail à cette personne.");

    const enroll = (courseId: string) =>
      supabase.rpc("enroll_by_email", { p_email: email, p_course: courseId, p_organization: id, p_cohort: null });

    let invited = false;
    let enrollmentId: string | null = null;
    for (const courseId of course_ids) {
      let res = await enroll(courseId);
      if (res.error?.message?.includes("user_not_found") && !invited) {
        const redirectTo = new URL("/auth/callback", trainingAppOrigin());
        redirectTo.searchParams.set("next", "/compte?welcome=1");
        const { error } = await admin().auth.admin.inviteUserByEmail(email, {
          redirectTo: redirectTo.toString(),
          data: contact?.full_name ? { full_name: contact.full_name } : undefined,
        });
        if (error) {
          console.error("[clients] training invite failed:", error.status, error.message);
          throw new ActionError("Invitation impossible pour cette adresse.");
        }
        invited = true;
        res = await enroll(courseId);
      }
      if (res.error) {
        console.error("[clients] enroll_by_email:", res.error.code, res.error.message);
        throw new ActionError(res.error.code === "42501" ? "Action non autorisée pour votre rôle." : "Inscription impossible.");
      }
      enrollmentId = res.data as string;
    }

    // Keep the address book complete: link the contact to the account, or
    // create a contact for an account that had none (nothing is sent).
    const row = enrollmentId
      ? (check(await supabase.from("enrollments").select("user_id").eq("id", enrollmentId).maybeSingle()) as { user_id: string } | null)
      : null;
    if (row) {
      if (contact && !contact.user_id) {
        check(await supabase.from("organization_contacts").update({ user_id: row.user_id }).eq("id", contact.id));
      } else if (!contact) {
        const [byUser, byEmail] = await Promise.all([
          supabase.from("organization_contacts").select("id", { count: "exact", head: true }).eq("organization_id", id).eq("user_id", row.user_id),
          supabase.from("organization_contacts").select("id", { count: "exact", head: true }).eq("organization_id", id).eq("email", email.toLowerCase()),
        ]);
        if (!byUser.count && !byEmail.count) {
          const { error } = await supabase
            .from("organization_contacts")
            .insert({ organization_id: id, email: email.toLowerCase(), user_id: row.user_id });
          if (error && error.code !== "23505") console.error("[clients] contact for learner:", error.message);
        }
      }
    }

    revalidatePath(`/clients/${id}`);
    revalidatePath("/training/access");
    return invited ? ("invited" as const) : ("existing" as const);
  }, "Accès aux formations ouvert.");
}
