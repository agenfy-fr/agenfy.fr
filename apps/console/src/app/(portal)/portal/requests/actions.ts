"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clientRequestSchema, reqText, uuid } from "@/lib/schemas";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { getSession, requireMemberOf, UnauthorizedError } from "@/lib/server/auth";

/** Client opens a request for one of THEIR organizations (RLS re-checks membership + status). */
export async function createClientRequest(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const res = await runAction(async () => {
    const input = clientRequestSchema.parse(formToObject(formData));
    const { supabase, user } = await requireMemberOf(input.organization_id);
    if (input.project_id) {
      const project = check(
        await supabase
          .from("projects")
          .select("id")
          .eq("id", input.project_id)
          .eq("organization_id", input.organization_id)
          .neq("status", "draft")
          .maybeSingle(),
      );
      if (!project) throw new ActionError("Projet introuvable.");
    }
    const row = check(
      await supabase
        .from("client_requests")
        .insert({ ...input, created_by: user.id, status: "open" })
        .select("id")
        .single(),
    ) as { id: string };
    revalidatePath("/portal", "layout");
    revalidatePath("/requests");
    return row.id;
  });
  if (res.ok && res.data) redirect(`/portal/requests/${res.data}`);
  return res.ok ? { ok: true } : res;
}

/** Client reply on a request of their organization (never internal). */
export async function postClientMessage(requestId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const session = await getSession();
    if (!session) throw new UnauthorizedError();
    const id = uuid.parse(requestId);
    const body = reqText(10000, "Le message").parse(formData.get("body") ?? "");
    const orgIds = session.access.memberships.map((m) => m.organization_id);
    const request = check(
      await session.supabase.from("client_requests").select("id, organization_id, status").eq("id", id).in("organization_id", orgIds).maybeSingle(),
    );
    if (!request) throw new ActionError("Demande introuvable.");
    await requireMemberOf(request.organization_id);
    check(
      await session.supabase.from("client_request_messages").insert({ request_id: id, author_id: session.user.id, body, internal: false }),
    );
    revalidatePath(`/portal/requests/${id}`);
    revalidatePath(`/requests/${id}`);
    return undefined;
  }, "Message envoyé.");
}
