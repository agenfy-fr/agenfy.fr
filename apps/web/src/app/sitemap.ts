import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { OFFERS } from "@/lib/offers";
import { COURSES } from "@/lib/courses";
import { SITE, AUTHORS } from "@/lib/site";
import { GLOSSARY, glossaryPath } from "@/lib/glossary";

type Entry = MetadataRoute.Sitemap[number];

const page = (path: string, priority: number, changeFrequency: Entry["changeFrequency"] = "monthly"): Entry => ({
  url: `${SITE.url}${path === "/" ? "" : path}`,
  lastModified: new Date(),
  changeFrequency,
  priority,
});

// Illustrative case studies (/etudes-de-cas) are noindex and deliberately left out.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    page("/", 1, "weekly"),
    page("/services", 0.9),
    ...OFFERS.filter((o) => o.path.startsWith("/services/")).map((o) => page(o.path, 0.9)),
    page("/formations", 0.9),
    ...COURSES.map((c) => page(c.path, 0.8)),
    page("/diagnostic-ia", 0.8),
    page("/a-propos", 0.7),
    page("/methodologie", 0.7),
    page("/comparatifs", 0.6),
    page("/comparatifs/chatgpt-claude-copilot-mistral-entreprise", 0.8),
    page("/comparatifs/agence-ia-esn-freelance", 0.7),
    page("/glossaire", 0.7),
    ...GLOSSARY.map((t) => page(glossaryPath(t.slug), 0.6)),
    ...Object.keys(AUTHORS).map((slug) => page(`/auteurs/${slug}`, 0.5)),
    page("/blog", 0.7, "weekly"),
    page("/contact", 0.6),
    ...blogPosts.map((post) => ({
      url: `${SITE.url}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    page("/mentions-legales", 0.2, "yearly"),
    page("/cgv", 0.2, "yearly"),
    page("/politique-confidentialite", 0.2, "yearly"),
  ];
}
