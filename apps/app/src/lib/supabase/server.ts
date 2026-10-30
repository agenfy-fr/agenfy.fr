import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv, requireSupabaseEnv } from "./env";

/** Cookie-bound client (acts as the signed-in user, RLS applies). */
export async function createClient() {
  // Read cookies first: it opts the route into dynamic rendering, so the env
  // check below never runs during `next build` prerendering.
  const cookieStore = await cookies();
  const { url, anonKey } = requireSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy refreshes the session instead.
        }
      },
    },
  });
}

/** Anonymous client (public catalogue, certificate verification). null if not configured. */
export function createPublicClient() {
  const env = getSupabaseEnv();
  if (!env) return null;
  return createPlainClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
