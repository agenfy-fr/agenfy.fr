/**
 * Mailbox helpers shared by the server (IMAP/SMTP) and the UI: folder labels
 * and ordering, reply/forward subjects and quoting, address parsing.
 * Pure module (no server import): unit-tested in test/lib/mail.test.ts.
 */

export const MAIL_PAGE_SIZE = 50;

/** Attachments sent from the console go through a server action (Vercel body cap). */
export const MAX_MAIL_ATTACHMENTS_BYTES = 4 * 1024 * 1024;

export interface MailAddress {
  name: string | null;
  address: string;
}

export interface MailFolder {
  path: string;
  name: string;
  specialUse: string | null;
}

const SPECIAL_USE_LABELS: Record<string, string> = {
  "\\Inbox": "Boîte de réception",
  "\\Sent": "Envoyés",
  "\\Drafts": "Brouillons",
  "\\Junk": "Indésirables",
  "\\Trash": "Corbeille",
  "\\Archive": "Archives",
};

const SPECIAL_USE_ORDER = ["\\Inbox", "\\Sent", "\\Drafts", "\\Archive", "\\Junk", "\\Trash"];

export function folderLabel(folder: Pick<MailFolder, "name" | "specialUse" | "path">): string {
  if (folder.path.toUpperCase() === "INBOX") return SPECIAL_USE_LABELS["\\Inbox"]!;
  return (folder.specialUse && SPECIAL_USE_LABELS[folder.specialUse]) || folder.name;
}

/** Inbox first, then special folders in a fixed order, then the rest alphabetically. */
export function sortFolders<F extends MailFolder>(folders: F[]): F[] {
  const rank = (f: F) => {
    if (f.path.toUpperCase() === "INBOX") return 0;
    const i = f.specialUse ? SPECIAL_USE_ORDER.indexOf(f.specialUse) : -1;
    return i >= 0 ? i + 1 : SPECIAL_USE_ORDER.length + 1;
  };
  return [...folders].sort((a, b) => rank(a) - rank(b) || a.path.localeCompare(b.path, "fr"));
}

const PREFIX_RE = /^\s*((re|tr|fwd?|aw|wg)\s*(\[\d+\])?\s*:\s*)+/i;

export function replySubject(subject: string | null | undefined): string {
  const base = (subject ?? "").replace(PREFIX_RE, "").trim();
  return base ? `Re: ${base}` : "Re:";
}

export function forwardSubject(subject: string | null | undefined): string {
  const base = (subject ?? "").replace(PREFIX_RE, "").trim();
  return base ? `Tr: ${base}` : "Tr:";
}

export function formatAddress(a: MailAddress): string {
  return a.name ? `${a.name} <${a.address}>` : a.address;
}

export function formatAddressList(list: MailAddress[] | null | undefined): string {
  return (list ?? []).map(formatAddress).join(", ");
}

const EMAIL_RE = /^[^@\s<>",;]+@[^@\s<>",;]+\.[^@\s<>",;]+$/;

/**
 * "Jean <jean@x.fr>, marie@y.fr; paul@z.fr" → addresses. Returns null if any
 * entry is not a valid address (the form shows an error instead of guessing).
 */
export function parseAddressList(input: string | null | undefined): MailAddress[] | null {
  const parts = (input ?? "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: MailAddress[] = [];
  for (const part of parts) {
    const m = /^(.*)<([^<>]+)>$/.exec(part);
    const address = (m ? m[2]! : part).trim();
    const name = m ? m[1]!.trim().replace(/^"|"$/g, "").trim() || null : null;
    if (!EMAIL_RE.test(address) || address.length > 320) return null;
    out.push({ name, address });
  }
  return out;
}

/** Plain-text quote of the original message for a reply. */
export function quoteForReply(original: { from: string; date: Date | null; text: string }): string {
  const when = original.date
    ? original.date.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" })
    : "";
  const header = `Le ${when}, ${original.from} a écrit :`;
  const quoted = original.text
    .replace(/\r\n/g, "\n")
    .trimEnd()
    .split("\n")
    .map((l) => (l.startsWith(">") ? `>${l}` : `> ${l}`))
    .join("\n");
  return `\n\n${header}\n${quoted}`;
}

export function forwardBlock(original: { from: string; to: string; date: Date | null; subject: string; text: string }): string {
  const when = original.date ? original.date.toLocaleString("fr-FR", { timeZone: "Europe/Paris" }) : "";
  return [
    "",
    "",
    "-------- Message transféré --------",
    `De : ${original.from}`,
    `Date : ${when}`,
    `Objet : ${original.subject}`,
    `À : ${original.to}`,
    "",
    original.text.replace(/\r\n/g, "\n").trimEnd(),
  ].join("\n");
}

/** Reply-all recipients: original sender + To + Cc, minus our own address, deduplicated. */
export function replyAllRecipients(
  self: string,
  msg: { from: MailAddress[]; replyTo: MailAddress[]; to: MailAddress[]; cc: MailAddress[] },
): { to: MailAddress[]; cc: MailAddress[] } {
  const me = self.toLowerCase();
  const seen = new Set<string>([me]);
  const take = (list: MailAddress[]) =>
    list.filter((a) => {
      const k = a.address.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  const to = take(msg.replyTo.length ? msg.replyTo : msg.from);
  const cc = take([...msg.to, ...msg.cc]);
  return { to, cc };
}

/** Port convention: 993/465 = implicit TLS, others (143/587) = STARTTLS. */
export function isImplicitTls(port: number): boolean {
  return port === 993 || port === 465;
}

/** Known OVH presets (mailbox offers), shown in the settings form. */
export const OVH_MAIL_PRESETS = [
  { id: "mxplan", label: "OVH MX Plan (ssl0.ovh.net)", imap_host: "ssl0.ovh.net", imap_port: 993, smtp_host: "ssl0.ovh.net", smtp_port: 465 },
  { id: "emailpro", label: "OVH E-mail Pro (pro*.mail.ovh.net)", imap_host: "pro1.mail.ovh.net", imap_port: 993, smtp_host: "pro1.mail.ovh.net", smtp_port: 587 },
  { id: "exchange", label: "OVH Exchange (ex*.mail.ovh.net)", imap_host: "ex5.mail.ovh.net", imap_port: 993, smtp_host: "ex5.mail.ovh.net", smtp_port: 587 },
] as const;

// --- Message body rendering (served by /api/mail/body inside a sandboxed iframe) ---

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/**
 * Policy of the message document itself: no script, no network except images
 * when the user asked for them, no forms, links open outside the sandbox.
 */
export function mailBodyCsp(allowRemoteImages: boolean): string {
  return [
    "default-src 'none'",
    `img-src data:${allowRemoteImages ? " https: http:" : ""}`,
    "style-src 'unsafe-inline'",
    "font-src data:",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'self'",
    "sandbox allow-popups allow-popups-to-escape-sandbox",
  ].join("; ");
}

export interface InlinePart {
  cid: string;
  contentType: string;
  base64: string;
}

/** HTML (or plain text) → standalone document; inline cid: images become data: URIs. */
export function renderMailDocument(html: string | null, text: string, inline: InlinePart[] = []): string {
  let body = html ?? `<pre style="white-space:pre-wrap;font-family:inherit;margin:0">${escapeHtml(text)}</pre>`;
  for (const part of inline) {
    if (!/^image\//i.test(part.contentType)) continue;
    body = body.split(`cid:${part.cid}`).join(`data:${part.contentType};base64,${part.base64}`);
  }
  return [
    "<!doctype html><html><head><meta charset=\"utf-8\">",
    '<base target="_blank">',
    "<style>html{color-scheme:light}body{margin:16px;font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111;background:#fff;overflow-wrap:anywhere}img{max-width:100%;height:auto}blockquote{margin:0 0 0 .5em;padding-left:.75em;border-left:3px solid #ddd;color:#555}</style>",
    "</head><body>",
    body,
    "</body></html>",
  ].join("");
}

/** Attachments are always downloaded, never rendered on the console origin. */
export function attachmentContentType(contentType: string): string {
  return /^(image\/(png|jpeg|gif|webp)|application\/pdf)$/i.test(contentType) ? contentType.toLowerCase() : "application/octet-stream";
}

/** RFC 5987 Content-Disposition for any file name. */
export function contentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
