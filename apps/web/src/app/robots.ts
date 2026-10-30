import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// AI crawlers are explicitly welcome: being read is a prerequisite for being cited (GEO).
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "Googlebot",
];

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", "/admin/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: AI_CRAWLERS, allow: "/", disallow },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
