import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/**
 * Service-role client. Server only, used exclusively to send invitations to
 * learners who don't have an account yet. Returns null when the key is absent.
 */
export function createAdminClient() {
  const env = getSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env || !serviceKey) return null;
  return createClient(env.url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
