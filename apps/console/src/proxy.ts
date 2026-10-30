/**
 * Next.js 16 Proxy (formerly Middleware): rate limiting, Supabase session
 * refresh + optimistic login redirect, per-request CSP nonce.
 *
 * Not an authorization layer: (staff)/(portal) layouts, server actions and RLS
 * do the real checks.
 */
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/client-ip";
import { applyCspToRequestHeaders, createCspContext, setCspResponseHeaders } from "@/lib/csp";

const RATE_LIMIT_RULES: Array<{ matches: (path: string, method: string) => boolean; group: string; limit: number; windowMs: number }> = [
  {
    // Login / magic link (server actions POST on /auth/login): slows down
    // credential stuffing and email bombing.
    matches: (p, m) => m === "POST" && p.startsWith("/auth/"),
    group: "auth",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  },
  {
    // MCP server (Bearer token): generous for agents, bounds token stuffing.
    matches: (p) => p === "/api/mcp",
    group: "mcp",
    limit: 300,
    windowMs: 60 * 1000,
  },
];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  for (const rule of RATE_LIMIT_RULES) {
    if (!rule.matches(path, request.method)) continue;
    const r = checkRateLimit(`${rule.group}:${getClientIp(request)}`, rule.limit, rule.windowMs);
    if (!r.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": Math.ceil((r.resetAt - Date.now()) / 1000).toString() } },
      );
    }
    break;
  }

  const csp = createCspContext();
  const requestHeaders = applyCspToRequestHeaders(new Headers(request.headers), csp);
  const response = await updateSession(request, requestHeaders);
  setCspResponseHeaders(response.headers, csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
