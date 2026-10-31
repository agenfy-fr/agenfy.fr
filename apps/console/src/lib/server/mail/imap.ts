/**
 * IMAP access (imapflow) for the console mailbox. One short-lived connection
 * per request (serverless): withImap() connects, runs, logs out.
 *
 * Callers MUST have checked owner/admin rights first (requireStaffPage("/mail")
 * or requireStaffRole([])): the mailbox is shared and not RLS-protected.
 */
import "server-only";
import { ImapFlow, type FetchMessageObject, type MessageStructureObject } from "imapflow";
import { simpleParser, type AddressObject } from "mailparser";
import { MAIL_PAGE_SIZE, sortFolders, type MailAddress, type MailFolder } from "@/lib/mail";
import { getMailAccount, type MailAccount } from "./config";

export class MailNotConfiguredError extends Error {
  constructor() {
    super("Boîte mail non configurée : renseignez-la dans Paramètres → Messagerie.");
    this.name = "MailNotConfiguredError";
  }
}

export function createImapClient(account: Pick<MailAccount, "imap" | "username" | "password">): ImapFlow {
  const client = new ImapFlow({
    host: account.imap.host,
    port: account.imap.port,
    secure: account.imap.secure,
    auth: { user: account.username, pass: account.password },
    logger: false,
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 60_000,
  });
  // Socket errors after logout must not crash the function.
  client.on("error", (err: Error) => console.error("[mail] imap error:", err.message));
  return client;
}

export async function withImap<T>(fn: (client: ImapFlow, account: MailAccount) => Promise<T>): Promise<T> {
  const account = await getMailAccount();
  if (!account) throw new MailNotConfiguredError();
  const client = createImapClient(account);
  await client.connect();
  try {
    return await fn(client, account);
  } finally {
    await client.logout().catch(() => client.close());
  }
}

// --- Folders -----------------------------------------------------------------------

export interface FolderWithCounts extends MailFolder {
  unseen: number | null;
}

export async function listFolders(client: ImapFlow): Promise<FolderWithCounts[]> {
  const list = await client.list({ statusQuery: { unseen: true } });
  const folders = list
    .filter((f) => !f.flags.has("\\Noselect") && !f.flags.has("\\NonExistent"))
    .map((f) => ({
      path: f.path,
      name: f.name,
      specialUse: f.specialUse ?? null,
      unseen: f.status?.unseen ?? null,
    }));
  return sortFolders(folders);
}

async function findSpecialFolder(client: ImapFlow, use: "\\Sent" | "\\Trash"): Promise<string | null> {
  const list = await client.list();
  return list.find((f) => f.specialUse === use)?.path ?? null;
}

// --- Message list ------------------------------------------------------------------

export interface MessageSummary {
  uid: number;
  subject: string;
  from: MailAddress | null;
  to: MailAddress[];
  date: string | null;
  seen: boolean;
  flagged: boolean;
  answered: boolean;
  hasAttachments: boolean;
}

function toMailAddresses(list: { name?: string; address?: string }[] | undefined): MailAddress[] {
  return (list ?? []).filter((a) => !!a.address).map((a) => ({ name: a.name?.trim() || null, address: a.address! }));
}

function hasAttachment(node: MessageStructureObject | undefined): boolean {
  if (!node) return false;
  if (node.disposition?.toLowerCase() === "attachment") return true;
  return (node.childNodes ?? []).some(hasAttachment);
}

function toSummary(m: FetchMessageObject): MessageSummary {
  const date = m.envelope?.date ?? m.internalDate ?? null;
  return {
    uid: m.uid,
    subject: m.envelope?.subject?.trim() || "(sans objet)",
    from: toMailAddresses(m.envelope?.from)[0] ?? null,
    to: toMailAddresses(m.envelope?.to),
    date: date ? new Date(date).toISOString() : null,
    seen: m.flags?.has("\\Seen") ?? false,
    flagged: m.flags?.has("\\Flagged") ?? false,
    answered: m.flags?.has("\\Answered") ?? false,
    hasAttachments: hasAttachment(m.bodyStructure),
  };
}

const SUMMARY_QUERY = { uid: true, envelope: true, flags: true, internalDate: true, bodyStructure: true } as const;

/** Newest first, MAIL_PAGE_SIZE per page. `q` searches subject, sender and recipient. */
export async function listMessages(
  client: ImapFlow,
  folder: string,
  { page = 1, q }: { page?: number; q?: string | null } = {},
): Promise<{ messages: MessageSummary[]; total: number }> {
  const lock = await client.getMailboxLock(folder, { readOnly: true });
  try {
    const out: MessageSummary[] = [];
    let total = 0;
    if (q) {
      const found = await client.search({ or: [{ subject: q }, { from: q }, { to: q }] }, { uid: true });
      const uids = (Array.isArray(found) ? found : []).sort((a, b) => b - a);
      total = uids.length;
      const slice = uids.slice((page - 1) * MAIL_PAGE_SIZE, page * MAIL_PAGE_SIZE);
      if (slice.length > 0) {
        for await (const m of client.fetch(slice.join(","), SUMMARY_QUERY, { uid: true })) out.push(toSummary(m));
      }
    } else {
      total = client.mailbox ? client.mailbox.exists : 0;
      const end = total - (page - 1) * MAIL_PAGE_SIZE;
      if (end >= 1) {
        const start = Math.max(1, end - MAIL_PAGE_SIZE + 1);
        for await (const m of client.fetch(`${start}:${end}`, SUMMARY_QUERY)) out.push(toSummary(m));
      }
    }
    out.sort((a, b) => b.uid - a.uid);
    return { messages: out, total };
  } finally {
    lock.release();
  }
}

// --- Single message ----------------------------------------------------------------

export interface MessageAttachment {
  index: number;
  filename: string;
  contentType: string;
  size: number;
  cid: string | null;
  inline: boolean;
}

export interface FullMessage {
  uid: number;
  folder: string;
  subject: string;
  from: MailAddress[];
  to: MailAddress[];
  cc: MailAddress[];
  replyTo: MailAddress[];
  date: Date | null;
  messageId: string | null;
  references: string[];
  text: string;
  html: string | null;
  attachments: MessageAttachment[];
  /** Raw attachment contents, same order as `attachments` (server only). */
  contents: Buffer[];
}

function addressesOf(field: AddressObject | AddressObject[] | undefined): MailAddress[] {
  const list = Array.isArray(field) ? field : field ? [field] : [];
  return list.flatMap((a) =>
    a.value.filter((v) => !!v.address).map((v) => ({ name: v.name?.trim() || null, address: v.address! })),
  );
}

/** Fetch and parse one message. `markSeen` sets \Seen (opening a message reads it). */
export async function getMessage(client: ImapFlow, folder: string, uid: number, { markSeen = false } = {}): Promise<FullMessage | null> {
  const lock = await client.getMailboxLock(folder, { readOnly: !markSeen });
  try {
    const raw = await client.fetchOne(String(uid), { uid: true, source: true, flags: true }, { uid: true });
    if (!raw || !raw.source) return null;
    if (markSeen && !raw.flags?.has("\\Seen")) await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
    const parsed = await simpleParser(raw.source, { skipImageLinks: true });
    const refs = parsed.references;
    return {
      uid,
      folder,
      subject: parsed.subject?.trim() || "(sans objet)",
      from: addressesOf(parsed.from),
      to: addressesOf(parsed.to),
      cc: addressesOf(parsed.cc),
      replyTo: addressesOf(parsed.replyTo),
      date: parsed.date ?? null,
      messageId: parsed.messageId ?? null,
      references: Array.isArray(refs) ? refs : refs ? [refs] : [],
      text: parsed.text ?? "",
      html: typeof parsed.html === "string" ? parsed.html : null,
      attachments: parsed.attachments.map((a, index) => ({
        index,
        filename: a.filename || `piece-jointe-${index + 1}`,
        contentType: a.contentType || "application/octet-stream",
        size: a.size ?? a.content.length,
        cid: a.cid ?? null,
        inline: a.contentDisposition === "inline" && !!a.cid,
      })),
      contents: parsed.attachments.map((a) => a.content),
    };
  } finally {
    lock.release();
  }
}

export async function setSeen(client: ImapFlow, folder: string, uid: number, seen: boolean): Promise<void> {
  const lock = await client.getMailboxLock(folder);
  try {
    if (seen) await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
    else await client.messageFlagsRemove(String(uid), ["\\Seen"], { uid: true });
  } finally {
    lock.release();
  }
}

export async function markAnswered(client: ImapFlow, folder: string, uid: number): Promise<void> {
  const lock = await client.getMailboxLock(folder);
  try {
    await client.messageFlagsAdd(String(uid), ["\\Answered"], { uid: true });
  } finally {
    lock.release();
  }
}

/** Move to the Trash folder; a message already in the Trash is deleted for good. */
export async function trashMessage(client: ImapFlow, folder: string, uid: number): Promise<"trashed" | "deleted"> {
  const trash = await findSpecialFolder(client, "\\Trash");
  const lock = await client.getMailboxLock(folder);
  try {
    if (trash && trash !== folder) {
      await client.messageMove(String(uid), trash, { uid: true });
      return "trashed";
    }
    await client.messageDelete(String(uid), { uid: true });
    return "deleted";
  } finally {
    lock.release();
  }
}

/** Keep a copy of a sent message in the Sent folder (SMTP does not do it). */
export async function appendToSent(client: ImapFlow, raw: Buffer): Promise<boolean> {
  const sent = await findSpecialFolder(client, "\\Sent");
  if (!sent) return false;
  await client.append(sent, raw, ["\\Seen"]);
  return true;
}
