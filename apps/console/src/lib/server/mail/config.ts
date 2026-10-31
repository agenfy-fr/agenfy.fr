/**
 * Mailbox configuration: the `mail_accounts` row (Paramètres → Messagerie,
 * password encrypted) wins; otherwise the MAIL_* environment variables:
 *
 *   MAIL_ADDRESS, MAIL_USERNAME (default = MAIL_ADDRESS), MAIL_PASSWORD,
 *   MAIL_IMAP_HOST, MAIL_IMAP_PORT (993), MAIL_SMTP_HOST, MAIL_SMTP_PORT (465),
 *   MAIL_DISPLAY_NAME.
 *
 * Read with the service role, only after an owner/admin check by the caller.
 */
import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { runtimeEnv } from "@/lib/supabase/env";
import { isImplicitTls } from "@/lib/mail";
import { decryptSecret } from "./crypto";

export interface MailServer {
  host: string;
  port: number;
  secure: boolean;
}

export interface MailAccount {
  source: "settings" | "env";
  email: string;
  displayName: string | null;
  username: string;
  password: string;
  imap: MailServer;
  smtp: MailServer;
  signature: string | null;
}

/** Public part of the settings (never the password). */
export interface MailSettingsView {
  source: "settings" | "env" | null;
  email: string | null;
  display_name: string | null;
  username: string | null;
  imap_host: string | null;
  imap_port: number | null;
  smtp_host: string | null;
  smtp_port: number | null;
  signature: string | null;
  updated_at: string | null;
}

interface MailAccountRow {
  email: string;
  display_name: string | null;
  imap_host: string;
  imap_port: number;
  smtp_host: string;
  smtp_port: number;
  username: string;
  password_encrypted: string;
  signature: string | null;
  updated_at: string;
}

const server = (host: string, port: number): MailServer => ({ host, port, secure: isImplicitTls(port) });

async function readRow(): Promise<MailAccountRow | null> {
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return null; // no service role (local dev): MAIL_* env only
  }
  const { data, error } = await admin
    .from("mail_accounts")
    .select("email, display_name, imap_host, imap_port, smtp_host, smtp_port, username, password_encrypted, signature, updated_at")
    .order("created_at")
    .limit(1)
    .maybeSingle();
  // Table missing (migration 0302 not applied yet): behave as "not configured".
  if (error) {
    if (error.code !== "42P01" && error.code !== "PGRST205") console.error("[mail] settings read failed:", error.code, error.message);
    return null;
  }
  return data as MailAccountRow | null;
}

function fromEnv(): MailAccount | null {
  const email = runtimeEnv("MAIL_ADDRESS");
  const password = runtimeEnv("MAIL_PASSWORD");
  const imapHost = runtimeEnv("MAIL_IMAP_HOST");
  const smtpHost = runtimeEnv("MAIL_SMTP_HOST");
  if (!email || !password || !imapHost || !smtpHost) return null;
  return {
    source: "env",
    email,
    displayName: runtimeEnv("MAIL_DISPLAY_NAME") ?? null,
    username: runtimeEnv("MAIL_USERNAME") ?? email,
    password,
    imap: server(imapHost, Number(runtimeEnv("MAIL_IMAP_PORT") ?? 993)),
    smtp: server(smtpHost, Number(runtimeEnv("MAIL_SMTP_PORT") ?? 465)),
    signature: null,
  };
}

/** Full account with the decrypted password, or null when nothing is configured. */
export const getMailAccount = cache(async (): Promise<MailAccount | null> => {
  const row = await readRow();
  if (row) {
    return {
      source: "settings",
      email: row.email,
      displayName: row.display_name,
      username: row.username,
      password: decryptSecret(row.password_encrypted),
      imap: server(row.imap_host, row.imap_port),
      smtp: server(row.smtp_host, row.smtp_port),
      signature: row.signature,
    };
  }
  return fromEnv();
});

export async function getMailSettingsView(): Promise<MailSettingsView> {
  const row = await readRow();
  if (row) {
    return {
      source: "settings",
      email: row.email,
      display_name: row.display_name,
      username: row.username,
      imap_host: row.imap_host,
      imap_port: row.imap_port,
      smtp_host: row.smtp_host,
      smtp_port: row.smtp_port,
      signature: row.signature,
      updated_at: row.updated_at,
    };
  }
  const env = fromEnv();
  return {
    source: env ? "env" : null,
    email: env?.email ?? null,
    display_name: env?.displayName ?? null,
    username: env?.username ?? null,
    imap_host: env?.imap.host ?? null,
    imap_port: env?.imap.port ?? null,
    smtp_host: env?.smtp.host ?? null,
    smtp_port: env?.smtp.port ?? null,
    signature: null,
    updated_at: null,
  };
}
