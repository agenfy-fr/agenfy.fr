/**
 * Mailbox password encryption at rest (AES-256-GCM).
 *
 * Key: MAIL_ENCRYPTION_KEY (Vercel env, server only). Any string works: it is
 * hashed to 32 bytes (a random 32-byte base64 value is recommended:
 * `openssl rand -base64 32`). Changing the key makes stored passwords
 * unreadable: re-enter the password in Paramètres → Messagerie.
 *
 * Format: "v1:<iv b64>:<tag b64>:<ciphertext b64>".
 */
import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { runtimeEnv } from "@/lib/supabase/env";

export class MailKeyMissingError extends Error {
  constructor() {
    super("MAIL_ENCRYPTION_KEY manquante : ajoutez-la dans les variables d'environnement Vercel du projet console.");
    this.name = "MailKeyMissingError";
  }
}

function key(): Buffer {
  const raw = runtimeEnv("MAIL_ENCRYPTION_KEY");
  if (!raw) throw new MailKeyMissingError();
  return createHash("sha256").update(raw, "utf8").digest();
}

export function hasMailKey(): boolean {
  return !!runtimeEnv("MAIL_ENCRYPTION_KEY");
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64"), cipher.getAuthTag().toString("base64"), data.toString("base64")].join(":");
}

export function decryptSecret(payload: string): string {
  const [version, iv, tag, data] = payload.split(":");
  if (version !== "v1" || !iv || !tag || !data) throw new Error("Format de secret inconnu.");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
}
