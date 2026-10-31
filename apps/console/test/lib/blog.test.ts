import { describe, expect, it } from "vitest";
import {
  analyzeSeo,
  blogImageUrl,
  blogSlug,
  containsKeyword,
  displayStatus,
  firstParagraph,
  isValidSlug,
  isoToParisLocal,
  markdownToPlainText,
  parisLocalToIso,
  readingMinutes,
  seoScore,
  truncateForSnippet,
  wordCount,
} from "@/lib/blog";
import { normalizeLinkHref } from "@/components/editor/markdown-utils";
import { canAccessRoute, canWriteDomain, BLOG_WRITE_ROLES } from "@/lib/access-control";
import { blogPostSchema } from "@/lib/schemas";

const ARTICLE = `![Schéma](https://x.supabase.co/a.png)

## Pourquoi

Les **agents IA** changent la façon dont les PME [automatisent](https://exemple.fr) leurs tâches.

- point un
- point deux

| A | B |
|---|---|
| 1 | 2 |
`;

describe("slugs", () => {
  it("builds a URL slug from a French title", () => {
    expect(blogSlug("Agents IA : le guide 2026 pour les PME !")).toBe("agents-ia-le-guide-2026-pour-les-pme");
    expect(blogSlug("Éléments à connaître")).toBe("elements-a-connaitre");
    expect(blogSlug("!!!")).toBe("article");
  });
  it("validates slugs like the database CHECK", () => {
    expect(isValidSlug("agents-ia-pme")).toBe(true);
    expect(isValidSlug("Agents-IA")).toBe(false);
    expect(isValidSlug("double--tiret")).toBe(false);
    expect(isValidSlug("-debut")).toBe(false);
    expect(isValidSlug("")).toBe(false);
    expect(isValidSlug("a".repeat(121))).toBe(false);
  });
});

describe("markdown helpers", () => {
  it("extracts plain text", () => {
    const text = markdownToPlainText(ARTICLE);
    expect(text).toContain("Les agents IA changent la façon dont les PME automatisent leurs tâches.");
    expect(text).not.toMatch(/[*#|[\]]/);
    expect(text).not.toContain("supabase");
  });
  it("finds the first prose paragraph (skips images, headings)", () => {
    expect(firstParagraph(ARTICLE)).toBe("Les agents IA changent la façon dont les PME automatisent leurs tâches.");
    expect(firstParagraph("## Titre\n\n- liste")).toBe("");
  });
  it("counts words and reading time", () => {
    expect(wordCount("un deux **trois**")).toBe(3);
    expect(readingMinutes("")).toBe(1);
    expect(readingMinutes(Array(1100).fill("mot").join(" "))).toBe(5);
  });
});

describe("SEO checks", () => {
  const base = {
    title: "Agents IA en PME : par où commencer en 2026",
    slug: "agents-ia-pme",
    excerpt: "Guide pratique pour déployer des agents IA dans une PME : cas d'usage, coûts, sécurité des données et erreurs à éviter, étape par étape.",
    contentMd: ARTICLE,
    focusKeyword: "agents IA",
  };

  it("matches keywords without accents, case or punctuation", () => {
    expect(containsKeyword("Les Agents-IA en entreprise", "agents ia")).toBe(true);
    expect(containsKeyword("Élaboration", "elaboration")).toBe(true);
    expect(containsKeyword("magents iak", "agents ia")).toBe(false);
  });

  it("passes the keyword checks when the keyword is everywhere", () => {
    const checks = analyzeSeo(base);
    const byId = Object.fromEntries(checks.map((c) => [c.id, c.level]));
    expect(byId["kw-title"]).toBe("good");
    expect(byId["kw-description"]).toBe("good");
    expect(byId["kw-intro"]).toBe("good");
    expect(byId["kw-slug"]).toBe("good");
    expect(byId["alt"]).toBeUndefined();
  });

  it("flags missing keyword, short content, missing alt text", () => {
    const checks = analyzeSeo({ ...base, slug: "guide", contentMd: "Intro sans rien.\n\n![](x.png)", seoTitle: "Guide complet" });
    const byId = Object.fromEntries(checks.map((c) => [c.id, c.level]));
    expect(byId["kw-title"]).toBe("bad");
    expect(byId["kw-intro"]).toBe("bad");
    expect(byId["kw-slug"]).toBe("warn");
    expect(byId["length"]).toBe("warn");
    expect(byId["alt"]).toBe("warn");
    expect(byId["headings"]).toBe("warn");
  });

  it("uses the SEO fields over title / excerpt and checks lengths", () => {
    const long = analyzeSeo({ ...base, seoDescription: "x".repeat(200) });
    expect(long.find((c) => c.id === "description")?.level).toBe("warn");
    const missing = analyzeSeo({ ...base, excerpt: "", seoDescription: "" });
    expect(missing.find((c) => c.id === "description")?.level).toBe("bad");
    expect(analyzeSeo({ ...base, focusKeyword: "" }).find((c) => c.id === "keyword")?.level).toBe("warn");
  });

  it("scores between 0 and 100", () => {
    expect(seoScore([])).toBe(0);
    expect(seoScore([{ id: "a", level: "good", message: "" }, { id: "b", level: "warn", message: "" }])).toBe(75);
  });

  it("truncates like a search snippet", () => {
    expect(truncateForSnippet("court", 60)).toBe("court");
    const t = truncateForSnippet("un titre beaucoup trop long pour tenir dans un résultat de recherche Google", 40);
    expect(t.length).toBeLessThanOrEqual(42);
    expect(t.endsWith("…")).toBe(true);
  });
});

describe("publication dates (Europe/Paris)", () => {
  it("converts Paris wall-clock time to UTC across DST", () => {
    expect(parisLocalToIso("2026-07-01T09:30")).toBe("2026-07-01T07:30:00.000Z"); // CEST
    expect(parisLocalToIso("2026-12-01T09:30")).toBe("2026-12-01T08:30:00.000Z"); // CET
    expect(parisLocalToIso("pas une date")).toBeNull();
  });
  it("round-trips for datetime-local inputs", () => {
    expect(isoToParisLocal("2026-07-01T07:30:00.000Z")).toBe("2026-07-01T09:30");
    expect(isoToParisLocal(parisLocalToIso("2026-03-29T12:00"))).toBe("2026-03-29T12:00");
    expect(isoToParisLocal(null)).toBe("");
  });
  it("derives the display status", () => {
    const now = new Date("2026-10-31T12:00:00Z");
    expect(displayStatus("published", "2026-10-30T00:00:00Z", now)).toBe("published");
    expect(displayStatus("published", "2026-11-02T00:00:00Z", now)).toBe("scheduled");
    expect(displayStatus("draft", null, now)).toBe("draft");
    expect(displayStatus("archived", "2026-01-01T00:00:00Z", now)).toBe("archived");
  });
});

describe("images and links", () => {
  it("builds public Storage URLs", () => {
    expect(blogImageUrl("https://abc.supabase.co/", "posts/2026/10/a b.webp")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/blog-images/posts/2026/10/a%20b.webp",
    );
  });
  it("normalizes links typed in the editor and refuses dangerous schemes", () => {
    expect(normalizeLinkHref("exemple.fr/page")).toBe("https://exemple.fr/page");
    expect(normalizeLinkHref("https://agenfy.fr")).toBe("https://agenfy.fr");
    expect(normalizeLinkHref("/blog/x")).toBe("/blog/x");
    expect(normalizeLinkHref("mailto:contact@agenfy.fr")).toBe("mailto:contact@agenfy.fr");
    expect(normalizeLinkHref("javascript:alert(1)")).toBeNull();
    expect(normalizeLinkHref("//evil.test")).toBeNull();
    expect(normalizeLinkHref("  ")).toBeNull();
  });
});

describe("blog access and form schema", () => {
  it("restricts the section and writes to marketing roles", () => {
    expect(canAccessRoute("sales", "/blog/abc")).toBe(true);
    expect(canAccessRoute("readonly", "/blog")).toBe(true);
    expect(canAccessRoute("trainer", "/blog")).toBe(false);
    expect(canWriteDomain("consultant", BLOG_WRITE_ROLES)).toBe(true);
    expect(canWriteDomain("readonly", BLOG_WRITE_ROLES)).toBe(false);
    expect(canWriteDomain("owner", BLOG_WRITE_ROLES)).toBe(true);
  });

  const form = {
    title: "Titre",
    slug: "titre",
    category: "IA",
    author_slug: "evan-masse",
    published_at: "2026-11-02T09:00",
    featured: "on",
    intent: "publish",
  };
  it("parses the edit form (Paris date → UTC, checkboxes, defaults)", () => {
    const v = blogPostSchema.parse(form);
    expect(v.published_at).toBe("2026-11-02T08:00:00.000Z");
    expect(v.featured).toBe(true);
    expect(v.noindex).toBe(false);
    expect(v.content_md).toBe("");
    expect(v.intent).toBe("publish");
    expect(v.canonical_url).toBeNull();
  });
  it("rejects invalid slug, category, canonical and image paths", () => {
    expect(() => blogPostSchema.parse({ ...form, slug: "Mauvais Slug" })).toThrow();
    expect(() => blogPostSchema.parse({ ...form, category: "Sport" })).toThrow();
    expect(() => blogPostSchema.parse({ ...form, canonical_url: "http://x.fr" })).toThrow();
    expect(() => blogPostSchema.parse({ ...form, cover_image_path: "../secret" })).toThrow();
  });
});

describe("checkbox helper", () => {
  it("treats an absent (unchecked) box as false", async () => {
    const { checkbox } = await import("@/lib/schemas");
    const { z } = await import("zod");
    expect(z.object({ c: checkbox }).parse({})).toEqual({ c: false });
    expect(z.object({ c: checkbox }).parse({ c: "on" })).toEqual({ c: true });
  });
});
