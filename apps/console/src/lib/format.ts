/** Formatting helpers (fr-FR). Pure. */

const EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const EUR_ROUND = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const DATE = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Paris" });
const DATE_TIME = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

export function formatCents(cents: number | null | undefined, opts: { round?: boolean } = {}): string {
  if (cents == null) return "—";
  return (opts.round ? EUR_ROUND : EUR).format(cents / 100);
}

/** "1 234,56" / "1234.5" / "1 234 €" → 123456 cents; null if not a valid amount. */
export function parseEurosToCents(input: string | null | undefined): number | null {
  if (input == null) return null;
  const normalized = input.replace(/[\s  €]/g, "").replace(",", ".");
  if (normalized === "" || !/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [int, dec = ""] = normalized.split(".");
  return Number.parseInt(int, 10) * 100 + Number.parseInt((dec + "00").slice(0, 2), 10);
}

/** 123456 → "1234,56" (form input value). */
export function centsToInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  const abs = Math.abs(cents);
  return `${cents < 0 ? "-" : ""}${Math.floor(abs / 100)},${String(abs % 100).padStart(2, "0")}`;
}

/** Accepts "YYYY-MM-DD" (calendar date, no TZ shift) or an ISO timestamp. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00Z`) : new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : DATE.format(d);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : DATE_TIME.format(d);
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

export function initials(name: string | null | undefined, email?: string | null): string {
  const src = name?.trim() || email || "?";
  const parts = src.split(/[\s@._-]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : src.slice(0, 2)).toUpperCase();
}

/** "Client Démo SAS" → "client-demo-sas" */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** First day of the current month (UTC midnight), as an ISO timestamp. */
export function startOfMonthIso(now: Date = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export function startOfYearDate(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-01-01`;
}
