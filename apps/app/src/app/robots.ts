import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.agenfy.fr").replace(/\/$/, "");

// Only the public catalogue is indexable; the LMS itself is private (noindex by default).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/$", "/catalogue/"],
        disallow: ["/dashboard", "/learn", "/manager", "/staff", "/compte", "/reclamation", "/login", "/auth", "/verify"],
      },
    ],
    host: base,
  };
}
