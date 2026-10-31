/**
 * Blog articles managed in console.agenfy.fr (table `blog_posts`, migration
 * 0303) — pure helpers: row mapping, merge with the static articles of
 * `blog-posts.tsx`, reading time, image URLs. Fetching lives in `blog.ts`.
 */
import type { ReactNode } from "react";
import type { BlogPost } from "./blog-posts";

export type BlogCategory = BlogPost["category"];
export const BLOG_CATEGORIES: readonly BlogCategory[] = ["Data", "IA", "Cloud", "Conseil", "Tech"];
export const BLOG_IMAGES_BUCKET = "blog-images";

/** Columns read by the public site (anon key; RLS = published and dated in the past). */
export const BLOG_ROW_COLUMNS =
  "slug, title, excerpt, category, author_slug, content_md, cover_image_path, cover_image_alt, published_at, updated_at, featured, reading_minutes, seo_title, seo_description, focus_keyword, canonical_url, og_image_path, noindex";

export interface BlogRow {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  author_slug: string;
  content_md: string | null;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  published_at: string;
  updated_at: string | null;
  featured: boolean | null;
  reading_minutes: number | null;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  og_image_path: string | null;
  noindex: boolean | null;
}

export interface BlogImage {
  url: string;
  alt: string;
}

/** Everything a list, a feed or the sitemap needs (serializable). */
export interface BlogSummary {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  authorSlug: string;
  readTime: string;
  /** Publication date, ISO `YYYY-MM-DD` (Paris). */
  date: string;
  /** Last update, ISO `YYYY-MM-DD`, only when after `date`. */
  updated?: string;
  featured: boolean;
  noindex: boolean;
  cover?: BlogImage;
}

export interface BlogSeo {
  title?: string;
  description?: string;
  keywords?: string[];
  /** Absolute canonical URL when the article first appeared elsewhere. */
  canonical?: string;
  ogImage?: string;
}

export type BlogBody = { kind: "react"; content: ReactNode } | { kind: "markdown"; markdown: string };

export interface BlogArticle extends BlogSummary {
  source: "static" | "cms";
  body: BlogBody;
  seo: BlogSeo;
}

export function toSummary(a: BlogArticle): BlogSummary {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    authorSlug: a.authorSlug,
    readTime: a.readTime,
    date: a.date,
    ...(a.updated ? { updated: a.updated } : {}),
    featured: a.featured,
    noindex: a.noindex,
    ...(a.cover ? { cover: a.cover } : {}),
  };
}

export function staticToArticle(p: BlogPost): BlogArticle {
  return {
    source: "static",
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    authorSlug: p.authorSlug,
    readTime: p.readTime,
    date: p.date,
    ...(p.updated ? { updated: p.updated } : {}),
    featured: p.featured,
    noindex: false,
    body: { kind: "react", content: p.content },
    seo: {},
  };
}

/** ISO timestamp → `YYYY-MM-DD` in Paris time. */
export function parisDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(iso),
  );
}

/** Word count of Markdown (syntax stripped), for the reading time. */
export function markdownWordCount(md: string): number {
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|~-]+/g, " ")
    .trim();
  return text ? text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0;
}

export function readingMinutes(md: string): number {
  return Math.max(1, Math.round(markdownWordCount(md) / 220));
}

export function blogImageUrl(supabaseUrl: string, path: string): string {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${BLOG_IMAGES_BUCKET}/${encoded}`;
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Database row → article. Invalid rows (unknown category, bad slug, no date) are dropped (null). */
export function rowToArticle(row: BlogRow, supabaseUrl: string): BlogArticle | null {
  if (!SLUG_RE.test(row.slug) || !row.published_at || !row.title?.trim()) return null;
  if (!(BLOG_CATEGORIES as readonly string[]).includes(row.category)) return null;
  const content = row.content_md ?? "";
  const date = parisDate(row.published_at);
  const updated = row.updated_at ? parisDate(row.updated_at) : undefined;
  const cover = row.cover_image_path
    ? { url: blogImageUrl(supabaseUrl, row.cover_image_path), alt: row.cover_image_alt ?? "" }
    : undefined;
  const ogImage = row.og_image_path ? blogImageUrl(supabaseUrl, row.og_image_path) : cover?.url;
  return {
    source: "cms",
    slug: row.slug,
    title: row.title.trim(),
    excerpt: row.excerpt?.trim() ?? "",
    category: row.category as BlogCategory,
    authorSlug: row.author_slug,
    readTime: `${row.reading_minutes ?? readingMinutes(content)} min`,
    date,
    ...(updated && updated > date ? { updated } : {}),
    featured: !!row.featured,
    noindex: !!row.noindex,
    ...(cover ? { cover } : {}),
    body: { kind: "markdown", markdown: content },
    seo: {
      ...(row.seo_title?.trim() ? { title: row.seo_title.trim() } : {}),
      ...(row.seo_description?.trim() ? { description: row.seo_description.trim() } : {}),
      ...(row.focus_keyword?.trim() ? { keywords: [row.focus_keyword.trim()] } : {}),
      ...(row.canonical_url ? { canonical: row.canonical_url } : {}),
      ...(ogImage ? { ogImage } : {}),
    },
  };
}

/** Static + database articles; the database wins on a slug conflict. Most recent first. */
export function mergeArticles(staticArticles: BlogArticle[], cmsArticles: BlogArticle[]): BlogArticle[] {
  const bySlug = new Map<string, BlogArticle>();
  for (const a of staticArticles) bySlug.set(a.slug, a);
  for (const a of cmsArticles) bySlug.set(a.slug, a);
  return [...bySlug.values()].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "fr"));
}

/** Same category first, then the rest, most recent first, excluding `slug`. */
export function relatedArticles<T extends BlogSummary>(all: T[], current: BlogSummary, limit = 3): T[] {
  const others = all.filter((p) => p.slug !== current.slug);
  const same = others.filter((p) => p.category === current.category);
  const rest = others.filter((p) => p.category !== current.category);
  return [...same, ...rest].slice(0, limit);
}
