/** Pure helpers of the Markdown editor (unit-tested). */

/**
 * Normalize a link typed by a human: "exemple.fr/page" → "https://exemple.fr/page".
 * Keeps https/http/mailto, site-relative paths and anchors; refuses any other
 * scheme (javascript:, data:…). Empty → null (= remove the link).
 */
export function normalizeLinkHref(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v) || v.startsWith("//")) return null;
  return `https://${v}`;
}
