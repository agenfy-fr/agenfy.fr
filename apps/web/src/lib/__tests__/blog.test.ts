import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  blogImageUrl,
  markdownWordCount,
  mergeArticles,
  parisDate,
  readingMinutes,
  relatedArticles,
  rowToArticle,
  type BlogArticle,
  type BlogRow,
} from "../blog-cms";
import { isAuthorizedBearer, parseSlugs } from "../revalidate-auth";
import { MarkdownContent } from "@/components/blog/MarkdownContent";

const SUPABASE = "https://abc.supabase.co";

const row = (over: Partial<BlogRow> = {}): BlogRow => ({
  slug: "agents-ia-pme",
  title: "Agents IA en PME",
  excerpt: "Le guide.",
  category: "IA",
  author_slug: "evan-masse",
  content_md: "## Intro\n\nUn deux trois.",
  cover_image_path: "posts/2026/10/cover.webp",
  cover_image_alt: "Schéma",
  published_at: "2026-10-30T23:30:00Z",
  updated_at: "2026-10-30T23:45:00Z",
  featured: false,
  reading_minutes: null,
  seo_title: null,
  seo_description: "Description SEO",
  focus_keyword: "agents IA",
  canonical_url: null,
  og_image_path: null,
  noindex: false,
  ...over,
});

const article = (slug: string, date: string, extra: Partial<BlogArticle> = {}): BlogArticle => ({
  source: "static",
  slug,
  title: slug,
  excerpt: "",
  category: "IA",
  authorSlug: "evan-masse",
  readTime: "5 min",
  date,
  featured: false,
  noindex: false,
  body: { kind: "react", content: null },
  seo: {},
  ...extra,
});

describe("rowToArticle", () => {
  it("maps a database row (Paris date, image URLs, SEO fallbacks)", () => {
    const a = rowToArticle(row(), SUPABASE)!;
    expect(a.source).toBe("cms");
    expect(a.date).toBe("2026-10-31"); // 23:30 UTC = 00:30 in Paris
    expect(a.updated).toBeUndefined(); // same day
    expect(a.readTime).toBe("1 min");
    expect(a.cover).toEqual({ url: `${SUPABASE}/storage/v1/object/public/blog-images/posts/2026/10/cover.webp`, alt: "Schéma" });
    expect(a.seo).toEqual({ description: "Description SEO", keywords: ["agents IA"], ogImage: a.cover!.url });
    expect(a.body).toEqual({ kind: "markdown", markdown: "## Intro\n\nUn deux trois." });
  });
  it("prefers the OG image, keeps canonical / noindex / reading time", () => {
    const a = rowToArticle(
      row({ og_image_path: "posts/og.png", canonical_url: "https://medium.com/x", noindex: true, reading_minutes: 12, updated_at: "2026-11-05T10:00:00Z" }),
      SUPABASE,
    )!;
    expect(a.seo.ogImage).toBe(`${SUPABASE}/storage/v1/object/public/blog-images/posts/og.png`);
    expect(a.seo.canonical).toBe("https://medium.com/x");
    expect(a.noindex).toBe(true);
    expect(a.readTime).toBe("12 min");
    expect(a.updated).toBe("2026-11-05");
  });
  it("drops invalid rows", () => {
    expect(rowToArticle(row({ category: "Sport" }), SUPABASE)).toBeNull();
    expect(rowToArticle(row({ slug: "Bad Slug" }), SUPABASE)).toBeNull();
    expect(rowToArticle(row({ title: "  " }), SUPABASE)).toBeNull();
  });
});

describe("merge", () => {
  it("lets the database win on a slug conflict and sorts by date", () => {
    const merged = mergeArticles(
      [article("a", "2026-01-01"), article("b", "2026-03-01")],
      [article("a", "2026-02-01", { source: "cms", title: "A (console)" }), article("c", "2026-04-01", { source: "cms" })],
    );
    expect(merged.map((m) => m.slug)).toEqual(["c", "b", "a"]);
    expect(merged.find((m) => m.slug === "a")?.title).toBe("A (console)");
  });
  it("suggests related articles of the same category first", () => {
    const all = [
      article("x", "2026-05-01", { category: "Cloud" }),
      article("y", "2026-04-01"),
      article("cur", "2026-03-01"),
      article("z", "2026-02-01"),
    ];
    expect(relatedArticles(all, all[2]!, 2).map((p) => p.slug)).toEqual(["y", "z"]);
  });
});

describe("helpers", () => {
  it("counts words and reading time", () => {
    expect(markdownWordCount("## Titre\n\n**Gras** et [lien](https://x.fr) ![img](a.png)\n\n- a")).toBe(5);
    expect(readingMinutes(Array(660).fill("mot").join(" "))).toBe(3);
  });
  it("formats Paris dates and image URLs", () => {
    expect(parisDate("2026-06-30T22:30:00Z")).toBe("2026-07-01");
    expect(blogImageUrl(`${SUPABASE}/`, "posts/a b.png")).toBe(`${SUPABASE}/storage/v1/object/public/blog-images/posts/a%20b.png`);
  });
});

describe("revalidation auth", () => {
  it("requires the exact bearer secret", () => {
    expect(isAuthorizedBearer("Bearer s3cret", "s3cret")).toBe(true);
    expect(isAuthorizedBearer("Bearer wrong", "s3cret")).toBe(false);
    expect(isAuthorizedBearer("s3cret", "s3cret")).toBe(false);
    expect(isAuthorizedBearer(null, "s3cret")).toBe(false);
    expect(isAuthorizedBearer("Bearer ", undefined)).toBe(false);
  });
  it("keeps only valid slugs", () => {
    expect(parseSlugs({ slugs: ["ok-slug", "ok-slug", "../etc", 3, "Bad"] })).toEqual(["ok-slug"]);
    expect(parseSlugs(null)).toEqual([]);
  });
});

describe("MarkdownContent", () => {
  const html = (md: string) => renderToStaticMarkup(createElement(MarkdownContent, { markdown: md }));

  it("renders with the blog typography", () => {
    const out = html("## Section\n\nTexte **gras**.\n\n| A | B |\n|---|---|\n| 1 | 2 |");
    expect(out).toContain('<h2 class="text-2xl font-bold text-foreground mt-12 mb-4">Section</h2>');
    expect(out).toContain('<strong class="text-foreground font-semibold">gras</strong>');
    expect(out).toContain("<table");
  });
  it("drops raw HTML and unsafe links", () => {
    const out = html('<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n[clic](javascript:alert(1)) ![x](javascript:alert(2))');
    expect(out).not.toContain("<script");
    expect(out).not.toContain("onerror");
    expect(out).not.toContain("javascript:");
  });
  it("opens external links in a new tab and demotes H1", () => {
    const out = html("# Titre\n\n[site](https://exemple.fr) [interne](/blog/x)");
    expect(out).not.toContain("<h1");
    expect(out).toContain('href="https://exemple.fr" target="_blank" rel="noopener noreferrer"');
    expect(out).toMatch(/href="\/blog\/x" class=/);
  });
});
