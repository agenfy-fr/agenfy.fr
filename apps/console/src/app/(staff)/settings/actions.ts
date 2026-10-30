"use server";

import { revalidatePath } from "next/cache";
import { canWrite } from "@/lib/access-control";
import {
  MAX_ACTIVE_TOKENS_PER_USER,
  WRITE_SCOPES,
  createApiTokenSchema,
  generateApiToken,
} from "@/lib/planning/api-tokens";
import { uuid } from "@/lib/schemas";
import { ActionError, check, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaff } from "@/lib/server/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Personal API token for the MCP server. staff_api_tokens has no RLS policy
 * for users: the service role is used AFTER requireStaff(), and every query
 * is scoped to the caller's user_id. The clear token is returned once.
 */
export async function createApiToken(
  _prev: ActionResult<{ token: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ token: string }>> {
  return runAction(async () => {
    const { user, role } = await requireStaff();
    const expires = String(formData.get("expires_in_days") ?? "");
    const input = createApiTokenSchema.parse({
      name: formData.get("name") ?? "",
      scopes: formData.getAll("scopes").map(String),
      expires_in_days: expires ? Number(expires) : null,
    });
    if (!canWrite(role) && input.scopes.some((s) => WRITE_SCOPES.includes(s))) {
      throw new ActionError("Votre rôle est en lecture seule : scope console:write indisponible.");
    }

    const admin = createAdminClient();
    const { count } = await admin
      .from("staff_api_tokens")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("revoked_at", null);
    if ((count ?? 0) >= MAX_ACTIVE_TOKENS_PER_USER) throw new ActionError(`${MAX_ACTIVE_TOKENS_PER_USER} jetons actifs maximum.`);

    const { token, hash, prefix } = generateApiToken();
    check(
      await admin.from("staff_api_tokens").insert({
        user_id: user.id,
        name: input.name,
        token_hash: hash,
        token_prefix: prefix,
        scopes: input.scopes,
        expires_at: input.expires_in_days ? new Date(Date.now() + input.expires_in_days * 86_400_000).toISOString() : null,
      }),
    );
    revalidatePath("/settings");
    return { token };
  }, "Jeton créé : copiez-le maintenant, il ne sera plus affiché.");
}

export async function revokeApiToken(tokenId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { user } = await requireStaff();
    const admin = createAdminClient();
    const row = check(
      await admin
        .from("staff_api_tokens")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", uuid.parse(tokenId))
        .eq("user_id", user.id)
        .is("revoked_at", null)
        .select("id")
        .maybeSingle(),
    );
    if (!row) throw new ActionError("Jeton introuvable ou déjà révoqué.");
    revalidatePath("/settings");
    return undefined;
  }, "Jeton révoqué.");
}
