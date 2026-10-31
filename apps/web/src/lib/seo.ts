import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/site";

interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
  noIndex?: boolean;
  /** Absolute canonical URL when it differs from `path` (article first published elsewhere). */
  canonical?: string;
}

// Every page calls this so canonical, Open Graph and Twitter can never drift apart.
export function buildMetadata({
  title,
  description,
  path,
  ogImage = "/og-image.jpg",
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  keywords,
  noIndex = false,
  canonical,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonical ?? url },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(type === "article" ? { publishedTime, modifiedTime, authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE.name}`,
      description,
      images: [ogImage],
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
