/**
 * Content Security Policy — Agenfy Console (adapted from Hasfy Console).
 *
 * Per-request, nonce-based policy built here and attached by src/proxy.ts:
 *  1. proxy.ts calls createCspContext() once per request;
 *  2. applyCspToRequestHeaders() puts the policy on the *request* headers
 *     (`Content-Security-Policy`) plus `x-nonce`: Next.js reads the nonce and
 *     stamps its own inline scripts; the root layout passes it to next-themes;
 *  3. setCspResponseHeaders() sends the same policy to the browser.
 *
 * script-src: 'nonce-…' + 'strict-dynamic', no 'unsafe-inline';
 * 'unsafe-eval' only under `next dev`. style-src keeps 'unsafe-inline'
 * (Radix positioning styles, next-themes) — a much weaker primitive.
 *
 * connect-src is derived from NEXT_PUBLIC_SUPABASE_URL at request time
 * (REST, Auth, Storage, Realtime websocket) — read with a dynamic key so the
 * value is not inlined at build time.
 */

export const CSP_HEADER = "Content-Security-Policy";

/** 128-bit random nonce, base64 (Web Crypto). */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/** "https://xyz.supabase.co" → "https://xyz.supabase.co wss://xyz.supabase.co" */
export function supabaseConnectSources(url: string | undefined): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    const ws = u.protocol === "https:" ? "wss:" : "ws:";
    return `${u.origin} ${ws}//${u.host}`;
  } catch {
    return "";
  }
}

export interface BuildCspOptions {
  isDev?: boolean;
  supabaseUrl?: string;
}

export function buildCSP(nonce: string, opts: BuildCspOptions = {}): string {
  if (!nonce) throw new Error("buildCSP: nonce is required");
  const isDev = opts.isDev ?? process.env.NODE_ENV === "development";
  const supabase = supabaseConnectSources(opts.supabaseUrl ?? process.env["NEXT_PUBLIC_SUPABASE_URL"]);

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${supabase.split(" ")[0] ?? ""}`.trim(),
    "font-src 'self' data:",
    `connect-src 'self' ${supabase}`.trim(),
    "frame-src 'none'",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ");
}

export interface CspContext {
  nonce: string;
  policy: string;
}

export function createCspContext(nonce: string = generateNonce()): CspContext {
  return { nonce, policy: buildCSP(nonce) };
}

export function applyCspToRequestHeaders(headers: Headers, ctx: CspContext): Headers {
  headers.set("x-nonce", ctx.nonce);
  headers.set(CSP_HEADER, ctx.policy);
  return headers;
}

export function setCspResponseHeaders(headers: Headers, ctx: CspContext): void {
  headers.set(CSP_HEADER, ctx.policy);
}
