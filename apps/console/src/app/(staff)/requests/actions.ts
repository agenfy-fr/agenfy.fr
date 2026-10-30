"use server";

import { revalidatePath } from "next/cache";
import { requestMessageSchema, requestStaffUpdateSchema, uuid } from "@/lib/schemas";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaffWriter } from "@/lib/server/auth";

export async function updateRequest(requestId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const id = uuid.parse(requestId);
    const input = requestStaffUpdateSchema.parse(formToObject(formData));
    const row = check(await supabase.from("client_requests").update(input).eq("id", id).select("id").maybeSingle());
    if (!row) throw new ActionError("Demande introuvable.");
    revalidatePath(`/requests/${id}`);
    revalidatePath("/requests");
    revalidatePath("/portal", "layout");
    return undefined;
  }, "Demande mise à jour.");
}

/** Staff reply: public (visible in the portal) or internal note. */
export async function replyToRequest(requestId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase, user } = await requireStaffWriter();
    const id = uuid.parse(requestId);
    const input = requestMessageSchema.parse(formToObject(formData));
    check(
      await supabase.from("client_request_messages").insert({
        request_id: id,
        author_id: user.id,
        body: input.body,
        internal: input.internal,
      }),
    );
    // First public answer moves an open request to "in progress".
    if (!input.internal) {
      await supabase.from("client_requests").update({ status: "in_progress" }).eq("id", id).eq("status", "open");
    }
    revalidatePath(`/requests/${id}`);
    revalidatePath("/portal", "layout");
    return undefined;
  }, "Message envoyé.");
}
