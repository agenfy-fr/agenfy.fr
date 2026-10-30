/**
 * Pure IP address parsing + classification helpers.
 *
 * Copied from Hasfy-App lib/net/ip.ts (keep both in sync). Used by the SSRF
 * guard (src/lib/server/ssrf-guard.ts). Deliberately free of `node:` imports.
 *
 * "Non-public" means any address an outbound request from our cluster must
 * never reach, and any address that can only be one of our own proxies/pods:
 *   IPv4: 0.0.0.0/8, 10/8, 100.64/10 (CGNAT), 127/8, 169.254/16 (link-local +
 *         cloud metadata), 172.16/12, 192.0.0/24, 192.0.2/24, 192.168/16,
 *         198.18/15, 198.51.100/24, 203.0.113/24, 224/4 (multicast),
 *         240/4 (reserved + broadcast)
 *   IPv6: ::, ::1, fc00::/7 (ULA), fe80::/10 (link-local), fec0::/10,
 *         ff00::/8 (multicast), 2001:db8::/32, 100::/64, 2001::/32 (Teredo),
 *         64:ff9b:1::/48, and every form embedding an IPv4 address
 *         (::ffff:a.b.c.d mapped, ::a.b.c.d compatible, 64:ff9b::/96 NAT64,
 *         2002::/16 6to4) when the embedded IPv4 is non-public.
 *
 * @module lib/server/net-ip
 */

/** Parse a dotted-quad IPv4 address. Returns null when not strictly valid. */
export function parseIPv4(input: string): number[] | null {
  const parts = input.split(".");
  if (parts.length !== 4) return null;
  const out: number[] = [];
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const n = Number(p);
    if (n > 255) return null;
    out.push(n);
  }
  return out;
}

/**
 * Parse an IPv6 address (with optional surrounding brackets, zone id and
 * embedded dotted IPv4 tail) into 8 16-bit groups. Returns null when invalid.
 */
export function parseIPv6(input: string): number[] | null {
  let s = input.trim();
  if (s.startsWith("[") && s.endsWith("]")) s = s.slice(1, -1);
  const zone = s.indexOf("%");
  if (zone !== -1) s = s.slice(0, zone);
  if (!s.includes(":")) return null;

  // Embedded IPv4 tail (e.g. ::ffff:127.0.0.1) → two hex groups.
  const lastColon = s.lastIndexOf(":");
  const tail = s.slice(lastColon + 1);
  if (tail.includes(".")) {
    const v4 = parseIPv4(tail);
    if (!v4) return null;
    const hi = ((v4[0] << 8) | v4[1]).toString(16);
    const lo = ((v4[2] << 8) | v4[3]).toString(16);
    s = `${s.slice(0, lastColon + 1)}${hi}:${lo}`;
  }

  const doubleColon = s.indexOf("::");
  if (doubleColon !== s.lastIndexOf("::")) return null;

  const parseGroups = (part: string): number[] | null => {
    if (part === "") return [];
    const groups: number[] = [];
    for (const g of part.split(":")) {
      if (!/^[0-9a-f]{1,4}$/i.test(g)) return null;
      groups.push(Number.parseInt(g, 16));
    }
    return groups;
  };

  if (doubleColon === -1) {
    const groups = parseGroups(s);
    return groups && groups.length === 8 ? groups : null;
  }

  const head = parseGroups(s.slice(0, doubleColon));
  const rest = parseGroups(s.slice(doubleColon + 2));
  if (!head || !rest) return null;
  const missing = 8 - head.length - rest.length;
  if (missing < 1) return null;
  return [...head, ...new Array<number>(missing).fill(0), ...rest];
}

/** 0 when not an IP, 4 or 6 otherwise (brackets accepted for IPv6). */
export function ipVersion(input: string): 0 | 4 | 6 {
  if (parseIPv4(input)) return 4;
  if (parseIPv6(input)) return 6;
  return 0;
}

/** True when the IPv4 address (as 4 octets) is in a non-public range. */
function isNonPublicIPv4Octets([a, b, c]: number[]): boolean {
  switch (a) {
    case 0: // 0.0.0.0/8 "this network"
    case 10: // 10/8 RFC1918
    case 127: // loopback
      return true;
    case 100: // 100.64/10 CGNAT
      return b >= 64 && b <= 127;
    case 169: // 169.254/16 link-local + cloud metadata
      return b === 254;
    case 172: // 172.16/12 RFC1918
      return b >= 16 && b <= 31;
    case 192:
      return (
        b === 168 || // 192.168/16 RFC1918
        (b === 0 && (c === 0 || c === 2)) // 192.0.0/24 IETF, 192.0.2/24 TEST-NET-1
      );
    case 198:
      return b === 18 || b === 19 || (b === 51 && c === 100); // benchmarking, TEST-NET-2
    case 203:
      return b === 0 && c === 113; // TEST-NET-3
    default:
      return a >= 224; // multicast, reserved, broadcast
  }
}

function embeddedIPv4(g: number[]): number[] {
  return [g[6] >> 8, g[6] & 0xff, g[7] >> 8, g[7] & 0xff];
}

/**
 * For IPv6 forms that embed an IPv4 address (IPv4-compatible ::a.b.c.d,
 * IPv4-mapped ::ffff:a.b.c.d, NAT64 64:ff9b::/96, 6to4 2002::/16), return
 * the embedded IPv4 octets; null otherwise.
 */
function embeddedIPv4Of(g: number[]): number[] | null {
  const zeros = (from: number, to: number) => g.slice(from, to).every((x) => x === 0);
  if (zeros(0, 6)) return embeddedIPv4(g); // ::a.b.c.d (deprecated compatible)
  if (zeros(0, 5) && g[5] === 0xffff) return embeddedIPv4(g); // ::ffff:a.b.c.d
  if (g[0] === 0x64 && g[1] === 0xff9b && zeros(2, 6)) return embeddedIPv4(g); // NAT64
  if (g[0] === 0x2002) return [g[1] >> 8, g[1] & 0xff, g[2] >> 8, g[2] & 0xff]; // 6to4
  return null;
}

/** True for fixed non-public IPv6 prefixes (ULA, link-local, multicast, …). */
function isReservedIPv6Prefix(g: number[]): boolean {
  const top = g[0];
  return (
    (g[0] === 0x64 && g[1] === 0xff9b && g[2] === 1) || // 64:ff9b:1::/48 local-use NAT64
    (g[0] === 0x2001 && g[1] === 0) || // 2001::/32 Teredo
    (g[0] === 0x2001 && g[1] === 0xdb8) || // 2001:db8::/32 documentation
    (g[0] === 0x100 && g[1] === 0 && g[2] === 0 && g[3] === 0) || // 100::/64 discard
    (top & 0xfe00) === 0xfc00 || // fc00::/7 ULA
    (top & 0xffc0) === 0xfe80 || // fe80::/10 link-local
    (top & 0xffc0) === 0xfec0 || // fec0::/10 site-local (deprecated)
    (top & 0xff00) === 0xff00 // ff00::/8 multicast
  );
}

/** True when the IPv6 address (as 8 groups) is in a non-public range. */
function isNonPublicIPv6Groups(g: number[]): boolean {
  // :: (unspecified) and ::1 (loopback)
  if (g.slice(0, 7).every((x) => x === 0) && g[7] <= 1) return true;
  const v4 = embeddedIPv4Of(g);
  if (v4) return isNonPublicIPv4Octets(v4);
  return isReservedIPv6Prefix(g);
}

/**
 * True when `input` is an IP literal in a non-public (private, loopback,
 * link-local, reserved, …) range. Anything that does not parse as an IP is
 * reported as non-public too: callers use this as a deny check, so it must
 * fail closed.
 */
export function isNonPublicIp(input: string): boolean {
  const v4 = parseIPv4(input);
  if (v4) return isNonPublicIPv4Octets(v4);
  const v6 = parseIPv6(input);
  if (v6) return isNonPublicIPv6Groups(v6);
  return true;
}
