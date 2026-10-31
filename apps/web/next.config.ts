import type { NextConfig } from "next";

/** Supabase Storage host serving the console's blog images (bucket `blog-images`). */
function supabaseImagePatterns(): NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> {
  const pathname = "/storage/v1/object/public/blog-images/**";
  const patterns = [{ protocol: "https" as const, hostname: "*.supabase.co", pathname }];
  try {
    const host = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;
    if (host && !host.endsWith(".supabase.co")) patterns.push({ protocol: "https" as const, hostname: host, pathname });
  } catch {
    // Invalid URL: keep the default pattern.
  }
  return patterns;
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  images: { remotePatterns: supabaseImagePatterns() },

  async redirects() {
    return [
      // IA-first repositioning: strategy consulting now lives under the AI audit offer.
      { source: "/services/conseil", destination: "/services/audit-strategie-ia", permanent: true },
      { source: "/cas-clients", destination: "/etudes-de-cas", permanent: true },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
