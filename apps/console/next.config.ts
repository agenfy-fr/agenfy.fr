import type { NextConfig } from "next";

/**
 * Security headers for every route. The CSP is NOT set here: it carries a
 * per-request nonce, so it is built in src/lib/csp.ts and set by src/proxy.ts.
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Document uploads (lib/schemas.ts MAX_UPLOAD_BYTES = 4 MB + multipart overhead).
    serverActions: { bodySizeLimit: "4.4mb" },
  },
  async headers() {
    return [
      // Everything but the e-mail body, which is framed by /mail/message and
      // carries its own CSP (frame-ancestors 'self', sandbox).
      { source: "/:path((?!api/mail/body$).*)", headers: SECURITY_HEADERS },
      { source: "/api/mail/body", headers: SECURITY_HEADERS.filter((h) => h.key !== "X-Frame-Options") },
    ];
  },
};

export default nextConfig;
