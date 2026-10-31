/**
 * Blog (www.agenfy.fr/blog) — pure helpers shared by the console editor, the
 * server actions and the unit tests: slugs, Markdown → text, reading time,
 * SEO checks, Paris-time conversion for scheduling, public image URLs.
 *
 * Values mirror migration 0303_blog_posts.sql: change both together.
 * Pure module (no server import): usable client-side.
 */
import { slugify } from "./format";

/** Public site serving the blog. */
export const PUBLIC_SITE_URL = "https://www.agenfy.fr";
export const BLOG_IMAGES_BUCKET = "blog-images";

/** Same categories as BlogPost["category"] in apps/web (CHECK constraint in 0303). */
export const BLOG_CATEGORIES = ["IA", "Data", "Cloud", "Conseil", "Tech"] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/** Keys of AUTHORS in apps/web/src/lib/site.ts. */
export const BLOG_AUTHORS = [{ slug: "evan-masse", name: "Evan Massé" }] as const;

/** Upload limit: Vercel caps request bodies at 4.5 MB (bucket allows 5 MB). */
export const MAX_BLOG_IMAGE_BYTES = 4 * 1024 * 1024;
export const BLOG_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"] as const;

/** Google truncates around these lengths (≈ 600 px title, ≈ 920 px description). */
export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MIN = 120;
export const SEO_DESCRIPTION_MAX = 160;

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const SLUG_MAX = 120;

export function isValidSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= SLUG_MAX && SLUG_RE.test(slug);
}

/** Title → URL slug ("Agents IA : le guide" → "agents-ia-le-guide"). */
export function blogSlug(title: string): string {
  return slugify(title) || "article";
}

// --- Markdown → text --------------------------------------------------------------

/** Plain text of a Markdown document (approximation good enough for counts and checks). */
export function markdownToPlainText(md: string): string {
  return md
    .replace(/\r\n?/g, "\n")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*([-*+]|\d+[.)])\s+/gm, "")
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/gm, " ")
    .replace(/\|/g, " ")
    .replace(/(\*\*|__|\*|_|~~|`)/g, "")
    .replace(/\\([\\`*_{}[\]()#+\-.!|])/g, "$1")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** First prose paragraph (headings, images, lists, quotes, tables and code skipped). */
export function firstParagraph(md: string): string {
  const blocks = md
    .replace(/\r\n?/g, "\n")
    .replace(/```[\s\S]*?```/g, "")
    .split(/\n\s*\n/);
  for (const block of blocks) {
    const b = block.trim();
    if (!b) continue;
    if (/^(#{1,6}\s|!\[|[-*+]\s|\d+[.)]\s|>|\||<|-{3,}$|\*{3,}$)/.test(b)) continue;
    const text = markdownToPlainText(b);
    if (text) return text;
  }
  return "";
}

export function wordCount(md: string): number {
  const text = markdownToPlainText(md);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

/** Reading time in minutes (≈ 220 words per minute), at least 1. */
export function readingMinutes(md: string, wordsPerMinute = 220): number {
  return Math.max(1, Math.round(wordCount(md) / wordsPerMinute));
}

// --- SEO --------------------------------------------------------------------------

/** Lowercase, accents removed, punctuation collapsed: "Agents IA" matches "agents-ia". */
export function normalizeForMatch(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function containsKeyword(text: string, keyword: string): boolean {
  const k = normalizeForMatch(keyword);
  if (!k) return false;
  return ` ${normalizeForMatch(text)} `.includes(` ${k} `);
}

export type SeoLevel = "good" | "warn" | "bad";
export interface SeoCheck {
  id: string;
  level: SeoLevel;
  message: string;
}

export interface SeoInput {
  title: string;
  slug: string;
  excerpt: string;
  contentMd: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  focusKeyword?: string | null;
  coverImagePath?: string | null;
  coverImageAlt?: string | null;
}

/** Effective title / description, as used by the site when the SEO fields are empty. */
export function effectiveSeo(input: Pick<SeoInput, "title" | "excerpt" | "seoTitle" | "seoDescription">) {
  return {
    title: input.seoTitle?.trim() || input.title.trim(),
    description: input.seoDescription?.trim() || input.excerpt.trim(),
  };
}

export function analyzeSeo(input: SeoInput): SeoCheck[] {
  const checks: SeoCheck[] = [];
  const { title, description } = effectiveSeo(input);
  // The site appends " | Agenfy" to the <title>.
  const fullTitleLength = title.length + " | Agenfy".length;

  if (!title) checks.push({ id: "title", level: "bad", message: "Titre manquant." });
  else if (fullTitleLength > SEO_TITLE_MAX + 10)
    checks.push({ id: "title", level: "warn", message: `Titre SEO long (${title.length} car.) : il sera tronqué par Google.` });
  else if (title.length < 25)
    checks.push({ id: "title", level: "warn", message: "Titre SEO court : visez 40 à 60 caractères." });
  else checks.push({ id: "title", level: "good", message: "Longueur du titre SEO correcte." });

  if (!description) checks.push({ id: "description", level: "bad", message: "Méta-description manquante (ni description SEO ni chapô)." });
  else if (description.length < SEO_DESCRIPTION_MIN)
    checks.push({ id: "description", level: "warn", message: `Méta-description courte (${description.length} car.) : visez ${SEO_DESCRIPTION_MIN} à ${SEO_DESCRIPTION_MAX}.` });
  else if (description.length > SEO_DESCRIPTION_MAX)
    checks.push({ id: "description", level: "warn", message: `Méta-description longue (${description.length} car.) : elle sera tronquée.` });
  else checks.push({ id: "description", level: "good", message: "Longueur de la méta-description correcte." });

  const words = wordCount(input.contentMd);
  if (words < 300) checks.push({ id: "length", level: "warn", message: `Contenu court (${words} mots) : visez au moins 600 mots.` });
  else checks.push({ id: "length", level: "good", message: `${words} mots.` });

  if (!/^#{2,3}\s/m.test(input.contentMd))
    checks.push({ id: "headings", level: "warn", message: "Aucun intertitre (H2/H3) : structurez l'article." });

  const images = [...input.contentMd.matchAll(/!\[([^\]]*)\]\([^)]*\)/g)];
  if (images.some((m) => !m[1]?.trim()))
    checks.push({ id: "alt", level: "warn", message: "Une image du contenu n'a pas de texte alternatif." });
  if (input.coverImagePath && !input.coverImageAlt?.trim())
    checks.push({ id: "cover-alt", level: "warn", message: "Ajoutez un texte alternatif à l'image de couverture." });

  const keyword = input.focusKeyword?.trim();
  if (!keyword) {
    checks.push({ id: "keyword", level: "warn", message: "Aucun mot-clé principal défini." });
    return checks;
  }
  const kw = (id: string, ok: boolean, present: string, missing: string, missingLevel: SeoLevel = "bad") =>
    checks.push({ id, level: ok ? "good" : missingLevel, message: ok ? present : missing });
  kw("kw-title", containsKeyword(title, keyword), "Mot-clé présent dans le titre SEO.", "Mot-clé absent du titre SEO.");
  kw("kw-description", containsKeyword(description, keyword), "Mot-clé présent dans la méta-description.", "Mot-clé absent de la méta-description.");
  kw("kw-intro", containsKeyword(firstParagraph(input.contentMd), keyword), "Mot-clé présent dans le premier paragraphe.", "Mot-clé absent du premier paragraphe.");
  kw("kw-slug", containsKeyword(input.slug, keyword), "Mot-clé présent dans l'URL.", "Mot-clé absent de l'URL (slug).", "warn");
  const headings = [...input.contentMd.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1] ?? "");
  kw("kw-headings", headings.some((h) => containsKeyword(h, keyword)), "Mot-clé présent dans un intertitre.", "Mot-clé absent des intertitres.", "warn");
  return checks;
}

/** Overall score 0-100 (good = 1, warn = 0.5, bad = 0). */
export function seoScore(checks: SeoCheck[]): number {
  if (checks.length === 0) return 0;
  const points = checks.reduce((sum, c) => sum + (c.level === "good" ? 1 : c.level === "warn" ? 0.5 : 0), 0);
  return Math.round((points / checks.length) * 100);
}

/** Google shows "www.agenfy.fr › blog › slug". */
export function snippetBreadcrumb(slug: string): string {
  return `www.agenfy.fr › blog › ${slug || "…"}`;
}

/** Cut like Google: on a word boundary, with an ellipsis. */
export function truncateForSnippet(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()} …`;
}

// --- Status & dates ------------------------------------------------------------------

export const BLOG_STATUSES = ["draft", "published", "archived"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];
/** Display status: a published post dated in the future is "scheduled". */
export type BlogDisplayStatus = BlogStatus | "scheduled";

export function displayStatus(status: string, publishedAt: string | null, now: Date = new Date()): BlogDisplayStatus {
  if (status === "published") return publishedAt && Date.parse(publishedAt) > now.getTime() ? "scheduled" : "published";
  return status === "archived" ? "archived" : "draft";
}

const PARIS = "Europe/Paris";

/** Offset (ms) between Paris wall-clock time and UTC at instant `utcMs`. */
function parisOffsetMs(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: PARIS,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const wall = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return wall - Math.floor(utcMs / 1000) * 1000;
}

/** "2026-11-02T09:30" (Paris wall-clock, <input type="datetime-local">) → ISO UTC. */
export function parisLocalToIso(local: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(local.trim());
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  const guess = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s ?? 0));
  if (Number.isNaN(guess)) return null;
  let utc = guess - parisOffsetMs(guess);
  // Second pass for instants right next to a DST change.
  utc = guess - parisOffsetMs(utc);
  return new Date(utc).toISOString();
}

/** ISO timestamp → "YYYY-MM-DDTHH:mm" in Paris time (for datetime-local inputs). */
export function isoToParisLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  return new Date(t + parisOffsetMs(t)).toISOString().slice(0, 16);
}

// --- Images ---------------------------------------------------------------------------

/** Public URL of an object of the `blog-images` bucket. */
export function blogImageUrl(supabaseUrl: string, path: string): string {
  const base = supabaseUrl.replace(/\/+$/, "");
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${BLOG_IMAGES_BUCKET}/${encoded}`;
}

export function isAllowedBlogImageType(type: string): boolean {
  return (BLOG_IMAGE_TYPES as readonly string[]).includes(type);
}

// --- Records -----------------------------------------------------------------------------

/** Columns of public.blog_posts edited in the console. */
export interface BlogPostRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  author_slug: string;
  content_md: string;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  status: BlogStatus;
  published_at: string | null;
  featured: boolean;
  reading_minutes: number | null;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  og_image_path: string | null;
  noindex: boolean;
  created_at: string;
  updated_at: string;
}

export const BLOG_POST_COLUMNS =
  "id, slug, title, excerpt, category, author_slug, content_md, cover_image_path, cover_image_alt, status, published_at, featured, reading_minutes, seo_title, seo_description, focus_keyword, canonical_url, og_image_path, noindex, created_at, updated_at";
