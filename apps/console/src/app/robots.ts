import type { MetadataRoute } from "next";

/** Private back-office + client portal: never indexed. */
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
