/**
 * /api/mcp — MCP server "agenfy-console" (Streamable HTTP, stateless, JSON
 * responses). See apps/console/README.md for Claude Code registration.
 *
 * Auth: `Authorization: Bearer acp_…` — personal API token created in
 * Paramètres → Jetons d'API (SHA-256 in DB, revocable, scopes console:read /
 * console:write, owner must be non-suspended staff). No session cookie here.
 * Every tool call is audited in console_mcp_audit. Rate-limited in proxy.ts.
 */
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/server/client-ip";
import { authenticateApiToken, extractBearer } from "@/lib/planning/api-tokens";
import { buildMcpServer, MCP_SERVER_NAME } from "@/lib/mcp/server";
import type { ConsoleMcpContext } from "@/lib/mcp/core";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1_000_000;

function jsonRpcError(status: number, message: string, headers: Record<string, string> = {}): Response {
  return Response.json(
    { jsonrpc: "2.0", error: { code: -32001, message }, id: null },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
}

function unauthorized(): Response {
  return jsonRpcError(401, "Jeton d'API manquant, invalide, expiré ou révoqué", {
    "WWW-Authenticate": `Bearer realm="${MCP_SERVER_NAME}"`,
  });
}

function baseUrl(): string {
  return (process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://console.agenfy.fr").replace(/\/+$/, "");
}

export async function POST(request: Request): Promise<Response> {
  const token = extractBearer(request.headers.get("authorization"));
  if (!token) return unauthorized();

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) return jsonRpcError(413, "Requête trop volumineuse");

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[mcp] admin client unavailable:", err);
    return jsonRpcError(503, "Service indisponible");
  }

  const principal = await authenticateApiToken(admin, token);
  if (!principal) return unauthorized();

  const ip = getClientIp(request);
  const audit: ConsoleMcpContext["audit"] = async ({ tool, targetId, ok, error }) => {
    const { error: auditError } = await admin.from("console_mcp_audit").insert({
      token_id: principal.tokenId,
      user_id: principal.userId,
      tool,
      target_id: targetId ?? null,
      ok,
      error: error ?? null,
      ip,
    });
    if (auditError) console.error("[mcp] audit insert failed:", auditError.message);
  };
  const ctx: ConsoleMcpContext = { db: admin, principal, baseUrl: baseUrl(), audit };
  const server = buildMcpServer(ctx);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);
    return await transport.handleRequest(request, {
      authInfo: { token, clientId: principal.tokenId, scopes: principal.scopes },
    });
  } catch (err) {
    console.error("[mcp] request failed:", err);
    return jsonRpcError(500, "Erreur interne");
  } finally {
    void server.close().catch(() => undefined);
  }
}

function methodNotAllowed(): Response {
  return jsonRpcError(405, "Méthode non autorisée (serveur MCP stateless : POST uniquement)", { Allow: "POST" });
}

export const GET = methodNotAllowed;
export const DELETE = methodNotAllowed;
