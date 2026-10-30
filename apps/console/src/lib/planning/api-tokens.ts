/**
 * Personal staff API tokens for the MCP server `agenfy-console` (/api/mcp).
 * Adapted from Hasfy Console (prefix `hcp_` → `acp_`).
 *
 * Format: `acp_` + 43 base64url chars (256 bits). Storage: SHA-256 hex only
 * (staff_api_tokens, migration 0103). A 256-bit random token needs no slow
 * hash (no dictionary possible); hashing only makes a table leak useless.
 */
import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { canWrite, isStaffRole, type StaffRole } from "@/lib/access-control";

export const TOKEN_PREFIX = "acp_";
export const TOKEN_RE = /^acp_[A-Za-z0-9_-]{43}$/;

export const API_TOKEN_SCOPES = ["console:read", "console:write"] as const;
export type ApiTokenScope = (typeof API_TOKEN_SCOPES)[number];
export const WRITE_SCOPES: readonly ApiTokenScope[] = ["console:write"];

export const MAX_ACTIVE_TOKENS_PER_USER = 20;

export const createApiTokenSchema = z.object({
  name: z.string().trim().min(1, { error: "Nom requis" }).max(80),
  scopes: z
    .array(z.enum(API_TOKEN_SCOPES))
    .min(1, { error: "Au moins un scope" })
    .transform((s) => [...new Set(s)]),
  /** null = no expiry */
  expires_in_days: z.number().int().min(1).max(365).nullable(),
});

export interface ApiTokenRow {
  id: string;
  name: string;
  token_prefix: string;
  scopes: ApiTokenScope[];
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
}

export const API_TOKEN_PUBLIC_COLUMNS = "id, name, token_prefix, scopes, created_at, last_used_at, expires_at, revoked_at";

export function generateApiToken(): { token: string; hash: string; prefix: string } {
  const token = TOKEN_PREFIX + randomBytes(32).toString("base64url");
  return { token, hash: hashApiToken(token), prefix: token.slice(0, 12) };
}

export function hashApiToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function extractBearer(header: string | null): string | null {
  if (!header) return null;
  const m = /^Bearer\s+(\S+)\s*$/i.exec(header);
  if (!m) return null;
  return TOKEN_RE.test(m[1]) ? m[1] : null;
}

export interface TokenPrincipal {
  tokenId: string;
  userId: string;
  scopes: ApiTokenScope[];
  role: StaffRole;
}

/** Effective scopes for the owner's CURRENT role: write dropped for readonly. */
export function boundScopesByRole(scopes: readonly string[], role: string | null | undefined): ApiTokenScope[] {
  if (!isStaffRole(role)) return [];
  return scopes.filter((s): s is ApiTokenScope => {
    if (!(API_TOKEN_SCOPES as readonly string[]).includes(s)) return false;
    if ((WRITE_SCOPES as readonly string[]).includes(s)) return canWrite(role);
    return true;
  });
}

/**
 * Validate a token (format, known hash, not revoked, not expired) AND that its
 * owner is still non-suspended staff. `admin` = service_role client. Returns
 * null without detail on failure (no oracle).
 */
export async function authenticateApiToken(admin: SupabaseClient, token: string): Promise<TokenPrincipal | null> {
  if (!TOKEN_RE.test(token)) return null;
  const { data: row, error } = await admin
    .from("staff_api_tokens")
    .select("id, user_id, scopes, expires_at, revoked_at, last_used_at")
    .eq("token_hash", hashApiToken(token))
    .maybeSingle();
  if (error || !row) return null;
  if (row.revoked_at) return null;
  if (row.expires_at && Date.parse(row.expires_at) <= Date.now()) return null;

  // Same rule as public.is_staff(): allowlisted and not suspended.
  const { data: staff } = await admin.from("staff").select("role, suspended").eq("user_id", row.user_id).maybeSingle();
  if (!staff || staff.suspended || !isStaffRole(staff.role)) return null;

  if (!row.last_used_at || Date.now() - Date.parse(row.last_used_at) > 60_000) {
    await admin.from("staff_api_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", row.id);
  }

  const scopes = boundScopesByRole((row.scopes ?? []) as string[], staff.role);
  if (scopes.length === 0) return null;
  return { tokenId: row.id as string, userId: row.user_id as string, scopes, role: staff.role };
}
