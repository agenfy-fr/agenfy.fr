import { createHash, timingSafeEqual } from "node:crypto";

/** Constant-time check of `Authorization: Bearer <secret>`. Empty secret = always refused. */
export function isAuthorizedBearer(header: string | null, secret: string | undefined): boolean {
  if (!secret || !header?.startsWith("Bearer ")) return false;
  const digest = (v: string) => createHash("sha256").update(v).digest();
  return timingSafeEqual(digest(header.slice("Bearer ".length).trim()), digest(secret));
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Valid, de-duplicated slugs from an untrusted JSON body (max 20). */
export function parseSlugs(body: unknown): string[] {
  const raw = (body as { slugs?: unknown } | null)?.slugs;
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((s): s is string => typeof s === "string" && s.length <= 120 && SLUG_RE.test(s)))].slice(0, 20);
}
