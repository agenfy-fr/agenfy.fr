import "server-only";
import { PUBLIC_SITE_URL, blogImageUrl } from "@/lib/blog";
import { runtimeEnv } from "@/lib/supabase/env";

/** Public URL of a `blog-images` object (null when Supabase is not configured). */
export function blogImagePublicUrl(path: string | null | undefined): string | null {
  const supabaseUrl = runtimeEnv("NEXT_PUBLIC_SUPABASE_URL");
  if (!path || !supabaseUrl) return null;
  return blogImageUrl(supabaseUrl, path);
}

export function publicSiteUrl(): string {
  return (runtimeEnv("WEB_SITE_URL") ?? PUBLIC_SITE_URL).replace(/\/+$/, "");
}

/**
 * Ask www.agenfy.fr to refresh its blog pages right away (POST /api/revalidate,
 * shared secret REVALIDATE_SECRET). Optional: without the secret, or if the
 * site does not answer, the site picks the change up within 5 minutes (ISR).
 * Never throws.
 */
export async function revalidateWebsiteBlog(slugs: (string | null | undefined)[]): Promise<void> {
  const secret = runtimeEnv("REVALIDATE_SECRET");
  if (!secret) return;
  try {
    const res = await fetch(`${publicSiteUrl()}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
      body: JSON.stringify({ slugs: [...new Set(slugs.filter(Boolean))] }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.warn("[blog] website revalidation answered", res.status);
  } catch (err) {
    console.warn("[blog] website revalidation failed:", err instanceof Error ? err.message : err);
  }
}
