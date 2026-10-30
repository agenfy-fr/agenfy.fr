/**
 * Supabase public configuration, read lazily at request time so that
 * `next build` succeeds without any environment variable (no client is ever
 * created at module load).
 *
 * Same Supabase project as apps/web and apps/app. The anon key name matches
 * apps/web (`NEXT_PUBLIC_SUPABASE_ANON_KEY`); the newer
 * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is accepted as well.
 */
/**
 * Read an env var at RUNTIME. `process.env.NEXT_PUBLIC_*` written literally is
 * inlined by Next.js at build time (also in server bundles), which would bake
 * "undefined" into an env-less build. Only server code reads these values
 * (there is no browser Supabase client), so a dynamic lookup is enough.
 */
export function runtimeEnv(name: string): string | undefined {
  const value = process.env[name];
  return value === "" ? undefined : value;
}

export interface SupabasePublicEnv {
  url: string;
  key: string;
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = runtimeEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = runtimeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ?? runtimeEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) return null;
  return { url, key };
}

export class MissingSupabaseEnvError extends Error {
  constructor() {
    super(
      "Configuration Supabase manquante : définir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY (voir apps/console/.env.example).",
    );
    this.name = "MissingSupabaseEnvError";
  }
}

export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const env = getSupabasePublicEnv();
  if (!env) throw new MissingSupabaseEnvError();
  return env;
}

/** Cookie hardening shared by every Supabase client (AUTH-02 in Hasfy Console). */
export const SUPABASE_COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};
