import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { runtimeEnv } from "./env";

/**
 * Service-role Supabase client (bypasses RLS).
 *
 * USAGE RULES:
 *   - Server only, and only AFTER the caller has been authenticated and
 *     authorized (requireStaff / requireStaffRole / API token).
 *   - Used for: auth.admin.* (invitations), staff_api_tokens and the MCP
 *     server. Everything else goes through the user's session client.
 *   - Never return raw secret columns (token_hash…) to the browser.
 */
let cached: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  const url = runtimeEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = runtimeEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("[supabase/admin] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.");
  }
  cached ??= createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
