"use server";

import { revalidatePath } from "next/cache";
import { LEAD_WRITE_ROLES } from "@/lib/access-control";
import { slugify } from "@/lib/format";
import { leadSchema, leadStatusSchema, leadUpdateSchema, uuid } from "@/lib/schemas";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaffRole } from "@/lib/server/auth";
import type { Lead } from "@/lib/types";

export async function createLead(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffRole(LEAD_WRITE_ROLES);
    const input = leadSchema.parse(formToObject(formData));
    check(await supabase.from("leads").insert({ ...input, source: input.source ?? "Saisie manuelle" }));
    revalidatePath("/leads");
    return undefined;
  }, "Lead créé.");
}

export async function setLeadStatus(leadId: string, status: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffRole(LEAD_WRITE_ROLES);
    const id = uuid.parse(leadId);
    const next = leadStatusSchema.parse(status);
    const row = check(await supabase.from("leads").update({ status: next }).eq("id", id).select("id").maybeSingle());
    if (!row) throw new ActionError("Lead introuvable.");
    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return undefined;
  }, "Statut mis à jour.");
}

export async function updateLead(leadId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffRole(LEAD_WRITE_ROLES);
    const id = uuid.parse(leadId);
    const input = leadUpdateSchema.parse(formToObject(formData));
    check(await supabase.from("leads").update(input).eq("id", id));
    revalidatePath("/leads");
    return undefined;
  }, "Lead mis à jour.");
}

/** Pick a free organization slug: "acme", then "acme-2", "acme-3"… */
async function freeSlug(supabase: Awaited<ReturnType<typeof requireStaffRole>>["supabase"], base: string): Promise<string> {
  const root = slugify(base) || "client";
  const { data } = await supabase.from("organizations").select("slug").like("slug", `${root}%`);
  const taken = new Set((data ?? []).map((r) => r.slug as string));
  if (!taken.has(root)) return root;
  for (let i = 2; i < 1000; i++) if (!taken.has(`${root}-${i}`)) return `${root}-${i}`;
  return `${root}-${Date.now()}`;
}

/**
 * Lead → client organization: creates the organization (+ CRM row linked to
 * the lead), marks the lead "Gagné". The contact can then be invited to the
 * portal from the client page (pre-filled e-mail).
 */
export async function convertLead(leadId: string): Promise<ActionResult<{ organizationId: string; email: string }>> {
  return runAction(async () => {
    const { supabase, user } = await requireStaffRole(LEAD_WRITE_ROLES);
    const id = uuid.parse(leadId);
    const lead = check(await supabase.from("leads").select("*").eq("id", id).maybeSingle()) as Lead | null;
    if (!lead) throw new ActionError("Lead introuvable.");
    if (lead.organization_id) throw new ActionError("Ce lead est déjà converti.");

    const name = lead.company?.trim() || lead.name;
    const org = check(
      await supabase
        .from("organizations")
        .insert({ name, slug: await freeSlug(supabase, name) })
        .select("id")
        .single(),
    ) as { id: string };

    check(
      await supabase.from("organization_internal").insert({
        organization_id: org.id,
        status: "active",
        account_manager_id: user.id,
        source_lead_id: lead.id,
        internal_notes: lead.message ? `Message initial (${lead.service ?? "formulaire"}) :\n${lead.message}` : null,
      }),
    );
    check(
      await supabase
        .from("leads")
        .update({ status: "Gagné", organization_id: org.id, converted_at: new Date().toISOString() })
        .eq("id", lead.id),
    );
    revalidatePath("/leads");
    revalidatePath("/clients");
    return { organizationId: org.id, email: lead.email };
  }, "Lead converti en client.");
}
