/**
 * Send from the console mailbox (SMTP, nodemailer), then keep a copy in the
 * IMAP Sent folder. The message is built once (MailComposer) so the copy is
 * byte-identical to what was sent.
 */
import "server-only";
import nodemailer from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer";
import { formatAddress, type MailAddress } from "@/lib/mail";
import type { MailAccount } from "./config";
import { appendToSent, createImapClient, markAnswered } from "./imap";

export interface OutgoingMail {
  to: MailAddress[];
  cc: MailAddress[];
  bcc: MailAddress[];
  subject: string;
  text: string;
  inReplyTo?: string | null;
  references?: string[];
  attachments?: { filename: string; contentType: string; content: Buffer }[];
  /** Original message to flag \Answered after a reply. */
  answered?: { folder: string; uid: number } | null;
}

export function createSmtpTransport(account: Pick<MailAccount, "smtp" | "username" | "password">) {
  return nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    requireTLS: !account.smtp.secure,
    auth: { user: account.username, pass: account.password },
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 60_000,
  });
}

export async function sendMail(account: MailAccount, mail: OutgoingMail): Promise<{ savedToSent: boolean }> {
  const from = formatAddress({ name: account.displayName, address: account.email });
  const raw = await new MailComposer({
    from,
    to: mail.to.map(formatAddress),
    cc: mail.cc.map(formatAddress),
    bcc: mail.bcc.map(formatAddress),
    subject: mail.subject,
    text: mail.text,
    inReplyTo: mail.inReplyTo ?? undefined,
    references: mail.references?.length ? mail.references : undefined,
    attachments: mail.attachments,
  })
    .compile()
    .build();

  const recipients = [...mail.to, ...mail.cc, ...mail.bcc].map((a) => a.address);
  await createSmtpTransport(account).sendMail({ envelope: { from: account.email, to: recipients }, raw });

  // Best effort: the mail is sent even if the copy or the flag fails.
  let savedToSent = false;
  const client = createImapClient(account);
  try {
    await client.connect();
    savedToSent = await appendToSent(client, raw);
    if (mail.answered) await markAnswered(client, mail.answered.folder, mail.answered.uid);
  } catch (err) {
    console.error("[mail] post-send IMAP step failed:", (err as Error).message);
  } finally {
    await client.logout().catch(() => client.close());
  }
  return { savedToSent };
}

/** Connection test for the settings form: IMAP login + SMTP handshake. */
export async function testMailAccount(account: Pick<MailAccount, "imap" | "smtp" | "username" | "password">): Promise<void> {
  const client = createImapClient(account);
  try {
    await client.connect();
  } catch (err) {
    throw new Error(`IMAP (${account.imap.host}:${account.imap.port}) : ${(err as Error).message}`);
  } finally {
    await client.logout().catch(() => client.close());
  }
  try {
    await createSmtpTransport(account).verify();
  } catch (err) {
    throw new Error(`SMTP (${account.smtp.host}:${account.smtp.port}) : ${(err as Error).message}`);
  }
}
