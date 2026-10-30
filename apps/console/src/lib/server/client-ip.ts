/**
 * Client IP resolution behind our proxies.
 *
 * Behind a proxy chain (Vercel / load balancer) the LEFTMOST X-Forwarded-For
 * entry and X-Real-IP can be forged by the client; each trusted proxy APPENDS
 * the address it saw, so the rightmost non-trusted hop is the client.
 *
 * So the client is the rightmost X-Forwarded-For hop that is not one of our
 * own proxies. Our proxies / LB / pods only ever have non-public addresses
 * (RFC1918, CGNAT, loopback, …), plus anything listed in TRUSTED_PROXY_IPS
 * (comma-separated exact IPs, e.g. a public LB VIP). Entries to the left of
 * the first untrusted hop are never looked at.
 *
 * Runtime-agnostic (no `node:` imports): used from route handlers and the
 * /api/v1 middleware alike.
 *
 * @module lib/server/client-ip (copied from Hasfy Console)
 */

import { ipVersion, isNonPublicIp } from "@/lib/server/net-ip";

/** Normalise one X-Forwarded-For entry (strip port / brackets); null if not an IP. */
function normaliseHop(raw: string): string | null {
  let s = raw.trim().toLowerCase();
  if (!s) return null;
  // [v6]:port or [v6]
  const bracket = /^\[([^\]]+)\](?::\d+)?$/.exec(s);
  if (bracket) s = bracket[1];
  // v4:port
  const v4port = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/.exec(s);
  if (v4port) s = v4port[1];
  return ipVersion(s) === 0 ? null : s;
}

function trustedProxyIps(): Set<string> {
  const raw = process.env.TRUSTED_PROXY_IPS ?? "";
  return new Set(
    raw
      .split(",")
      .map((x) => normaliseHop(x))
      .filter((x): x is string => x !== null),
  );
}

function isTrustedHop(ip: string, extra: Set<string>): boolean {
  return isNonPublicIp(ip) || extra.has(ip);
}

/**
 * Resolve the client IP from raw header values. Returns "unknown" when no
 * usable address is present.
 */
export function clientIpFromHeaderValues(
  xForwardedFor: string | null | undefined,
  xRealIp: string | null | undefined,
): string {
  const hops = (xForwardedFor ?? "").split(",").map((h) => h.trim()).filter(Boolean);
  if (hops.length > 0) {
    const extra = trustedProxyIps();
    let innermostTrusted: string | null = null;
    for (let i = hops.length - 1; i >= 0; i--) {
      const ip = normaliseHop(hops[i]);
      // A non-IP hop can only come from the client side of the chain: stop.
      if (ip === null) break;
      if (!isTrustedHop(ip, extra)) return ip;
      innermostTrusted = ip;
    }
    // Every inspected hop is one of ours (in-cluster caller): report the
    // farthest one we could vouch for.
    if (innermostTrusted) return innermostTrusted;
  }
  // No X-Forwarded-For at all: only possible on a direct, unproxied socket.
  const real = xRealIp ? normaliseHop(xRealIp) : null;
  return real ?? "unknown";
}

/** Resolve the client IP of a request (see module docs for the trust model). */
export function getClientIp(req: { headers: Pick<Headers, "get"> }): string {
  return clientIpFromHeaderValues(
    req.headers.get("x-forwarded-for"),
    req.headers.get("x-real-ip"),
  );
}
