/**
 * Blog data for every page (index, article, sitemap, llms.txt, home, author):
 * static articles from `blog-posts.tsx` merged with the articles published
 * from console.agenfy.fr (Supabase `blog_posts`, read with the ANON key only).
 *
 * Caching: the Supabase request is cached by Next.js for BLOG_REVALIDATE_SECONDS
 * under the tag BLOG_CACHE_TAG; the console purges it after a publish through
 * POST /api/revalidate (REVALIDATE_SECRET). Without Supabase env vars (local,
 * preview, CI build) only the static articles are served.
 */
import { createClient } from "@supabase/supabase-js";
import { blogPosts } from "./blog-posts";
import {
  BLOG_ROW_COLUMNS,
  mergeArticles,
  rowToArticle,
  staticToArticle,
  toSummary,
  type BlogArticle,
  type BlogRow,
  type BlogSummary,
} from "./blog-cms";

export const BLOG_CACHE_TAG = "blog";
export const BLOG_REVALIDATE_SECONDS = 300;

/** Runtime lookup: a literal `process.env.NEXT_PUBLIC_*` would be frozen at build time. */
function env(name: string): string | undefined {
  const v = process.env[name];
  return v ? v : undefined;
}

const STATIC_ARTICLES: BlogArticle[] = blogPosts.map(staticToArticle);

async function fetchCmsArticles(): Promise<BlogArticle[]> {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !key) return [];

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { revalidate: BLOG_REVALIDATE_SECONDS, tags: [BLOG_CACHE_TAG] } }),
    },
  });
  // RLS only returns published articles whose date is reached (no `now` in the
  // URL, so the cached response stays shareable).
  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_ROW_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1000);

  if (error) {
    // At build time, never fail the deploy: ship the static articles. At
    // runtime, throw so ISR keeps serving the last good page.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn("[blog] Supabase unavailable during build, static articles only:", error.message);
      return [];
    }
    throw new Error(`[blog] Supabase error: ${error.message}`);
  }
  return ((data ?? []) as BlogRow[]).map((row) => rowToArticle(row, url)).filter((a): a is BlogArticle => a !== null);
}

/** Every article (static + console), most recent first. Includes noindex ones. */
export async function getAllArticles(): Promise<BlogArticle[]> {
  return mergeArticles(STATIC_ARTICLES, await fetchCmsArticles());
}

export async function getAllBlogSummaries(): Promise<BlogSummary[]> {
  return (await getAllArticles()).map(toSummary);
}

/** Articles meant for indexes (sitemap, llms.txt, related links): noindex excluded. */
export async function getIndexableSummaries(): Promise<BlogSummary[]> {
  return (await getAllBlogSummaries()).filter((p) => !p.noindex);
}

export async function getArticle(slug: string): Promise<BlogArticle | undefined> {
  return (await getAllArticles()).find((a) => a.slug === slug);
}

export async function getSummariesByAuthor(authorSlug: string): Promise<BlogSummary[]> {
  return (await getIndexableSummaries()).filter((p) => p.authorSlug === authorSlug);
}
