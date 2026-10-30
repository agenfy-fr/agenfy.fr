/**
 * Shared base of the `agenfy-console` MCP tools (adapted from Hasfy Console):
 * access control (token scope + owner role), audit, error translation,
 * pagination helpers.
 */
import "server-only";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z, type ZodRawShape } from "zod";
import { canAccessRoute, canWrite, hasRole, type StaffRole } from "@/lib/access-control";
import type { ApiTokenScope, TokenPrincipal } from "@/lib/planning/api-tokens";
import { PlanningError } from "@/lib/planning/service";
import { UUID_RE } from "@/lib/schemas";

export interface ConsoleMcpContext {
  db: SupabaseClient;
  principal: TokenPrincipal;
  baseUrl: string;
  audit: (entry: { tool: string; targetId?: string | null; ok: boolean; error?: string | null }) => Promise<void>;
}

/** Business error whose message can be returned as is. */
export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}

export interface ToolAccess {
  /** All these scopes are required. */
  scopes: readonly ApiTokenScope[];
  /** Console section (ROLE_ACCESS) the owner's role must be able to open. */
  section?: `/${string}`;
  /** Extra roles required (owner/admin implicit). */
  roles?: readonly StaffRole[];
  /** Write tool: refused to readonly even with the scope. */
  write?: boolean;
}

/** Reason for refusal, or null if granted. Pure (unit-tested). */
export function accessDenied(principal: Pick<TokenPrincipal, "scopes" | "role">, access: ToolAccess): string | null {
  const missing = access.scopes.filter((s) => !principal.scopes.includes(s));
  if (missing.length > 0) return `Ce jeton n'a pas le scope ${missing.join(" + ")}.`;
  const role = principal.role ?? null;
  if (access.section && !canAccessRoute(role, access.section)) return `Votre rôle n'a pas accès à ${access.section}.`;
  if (access.roles && !hasRole(role, access.roles)) return "Votre rôle ne permet pas cette action.";
  if (access.write && !canWrite(role)) return "Votre rôle est en lecture seule.";
  return null;
}

export function ok(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export function fail(message: string): CallToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

function errorMessage(err: unknown): { message: string; expected: boolean } {
  if (err instanceof ToolError || err instanceof PlanningError) return { message: err.message, expected: true };
  if (err instanceof z.ZodError) {
    return { message: err.issues.map((i) => `${i.path.join(".") || "input"}: ${i.message}`).join("; "), expected: true };
  }
  return { message: "Erreur interne", expected: false };
}

export const READ_HINTS = { readOnlyHint: true, destructiveHint: false, openWorldHint: false } as const;
export const WRITE_HINTS = { readOnlyHint: false, destructiveHint: false, openWorldHint: false } as const;

interface ToolDef<S extends ZodRawShape> {
  title: string;
  description: string;
  input?: S;
  access: ToolAccess;
  idempotent?: boolean;
  handler: (args: z.output<z.ZodObject<S>>) => Promise<{ result: unknown; targetId?: string | null }>;
}

/**
 * Register a tool — only if the token/role can use it (inaccessible tools are
 * not listed). The check is replayed at call time (defense in depth) and
 * every call is audited.
 */
export function defineTool<S extends ZodRawShape>(server: McpServer, ctx: ConsoleMcpContext, name: string, def: ToolDef<S>): void {
  if (accessDenied(ctx.principal, def.access)) return;
  const annotations = {
    ...(def.access.write ? WRITE_HINTS : READ_HINTS),
    ...(def.idempotent ? { idempotentHint: true } : {}),
  };
  const cb = async (args: unknown): Promise<CallToolResult> => runTool(ctx, name, def.access, () => def.handler(args as never));
  if (def.input) {
    server.registerTool(name, { title: def.title, description: def.description, inputSchema: def.input, annotations }, cb as never);
  } else {
    server.registerTool(name, { title: def.title, description: def.description, annotations }, (() => cb({})) as never);
  }
}

export async function runTool(
  ctx: ConsoleMcpContext,
  tool: string,
  access: ToolAccess,
  fn: () => Promise<{ result: unknown; targetId?: string | null }>,
): Promise<CallToolResult> {
  const denied = accessDenied(ctx.principal, access);
  if (denied) {
    await ctx.audit({ tool, ok: false, error: denied });
    return fail(denied);
  }
  try {
    const { result, targetId } = await fn();
    await ctx.audit({ tool, targetId: targetId && UUID_RE.test(targetId) ? targetId : null, ok: true });
    return ok(result);
  } catch (err) {
    const { message, expected } = errorMessage(err);
    if (!expected) console.error(`[mcp:${tool}]`, err);
    await ctx.audit({ tool, ok: false, error: message.slice(0, 500) });
    return fail(message);
  }
}

export const pageInput = {
  limit: z.number().int().min(1).max(100).default(25).describe("Taille de page (1-100, défaut 25)"),
  offset: z.number().int().min(0).max(10_000).default(0).describe("Décalage (pagination)"),
};

export function page<T>(items: T[], total: number | null, limit: number, offset: number) {
  const hasMore = total != null ? offset + items.length < total : items.length === limit;
  return { items, total, limit, offset, next_offset: hasMore ? offset + items.length : null };
}

/** Readable ToolError from a PostgREST result. */
export function dbCheck<T>(res: { data: T; error: unknown }, what: string): T {
  if (res.error) {
    console.error(`[mcp] ${what}:`, res.error);
    throw new ToolError(`Lecture/écriture impossible (${what}).`);
  }
  return res.data;
}
