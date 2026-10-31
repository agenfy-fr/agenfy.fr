"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MAX_MAIL_ATTACHMENTS_BYTES, isImplicitTls, parseAddressList } from "@/lib/mail";
import { composeSchema, mailSettingsSchema } from "@/lib/schemas";
import { ActionError, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaffRole } from "@/lib/server/auth";
import { getMailAccount } from "@/lib/server/mail/config";
import { MailKeyMissingError, encryptSecret } from "@/lib/server/mail/crypto";
import { MailNotConfiguredError, getMessage, setSeen, trashMessage, withImap } from "@/lib/server/mail/imap";
import { sendMail, testMailAccount } from "@/lib/server/mail/send";
import { createAdminClient } from "@/lib/supabase/admin";

/** Mailbox = owner/admin only (requireStaffRole([]) = admin roles, aal2 via is_staff()). */
const requireMailAdmin = () => requireStaffRole([]);

function mailError(err: unknown): never {
  if (err instanceof MailNotConfiguredError || err instanceof MailKeyMissingError || err instanceof ActionError) throw err;
  const message = (err as Error)?.message ?? "";
  console.error("[mail] action failed:", message);
  if (/auth|credentials|login/i.test(message)) throw new ActionError("Connexion refusée par le serveur mail : vérifiez l'identifiant et le mot de passe.");
  throw new ActionError("Le serveur mail ne répond pas. Réessayez dans un instant.");
}

export async function sendMailAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const res = await runAction(async () => {
    await requireMailAdmin();
    const files = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);
    const raw = formToObject(formData);
    delete raw.attachments;
    const input = composeSchema.parse(raw);

    const to = parseAddressList(input.to);
    const cc = parseAddressList(input.cc);
    const bcc = parseAddressList(input.bcc);
    if (!to || to.length === 0) throw new ActionError("Destinataire invalide.");
    if (!cc || !bcc) throw new ActionError("Adresse en copie invalide.");
    if (to.length + cc.length + bcc.length > 50) throw new ActionError("50 destinataires maximum.");

    const account = await getMailAccount();
    if (!account) throw new MailNotConfiguredError();

    const attachments: { filename: string; contentType: string; content: Buffer }[] = await Promise.all(
      files.map(async (f) => ({ filename: f.name, contentType: f.type || "application/octet-stream", content: Buffer.from(await f.arrayBuffer()) })),
    );
    // Forward: re-attach the original files (fetched server side, not re-uploaded).
    const forwardFolder = formData.get("forward_folder");
    const forwardUid = Number(formData.get("forward_uid"));
    if (typeof forwardFolder === "string" && forwardFolder && Number.isInteger(forwardUid) && forwardUid > 0) {
      const original = await withImap((client) => getMessage(client, forwardFolder, forwardUid)).catch(mailError);
      for (const a of original?.attachments ?? []) {
        if (a.inline) continue;
        attachments.push({ filename: a.filename, contentType: a.contentType, content: original!.contents[a.index]! });
      }
    }
    if (attachments.reduce((n, a) => n + a.content.length, 0) > MAX_MAIL_ATTACHMENTS_BYTES) {
      throw new ActionError("Pièces jointes trop lourdes (4 Mo au total).");
    }

    await sendMail(account, {
      to,
      cc,
      bcc,
      subject: input.subject,
      text: input.body,
      inReplyTo: input.in_reply_to,
      references: input.references ? input.references.split(/\s+/).filter(Boolean) : [],
      attachments,
      answered: input.reply_folder && input.reply_uid ? { folder: input.reply_folder, uid: input.reply_uid } : null,
    }).catch(mailError);
    revalidatePath("/mail");
    return undefined;
  }, "Message envoyé.");
  if (res.ok) redirect("/mail?sent=1");
  return res;
}

export async function markUnreadAction(folder: string, uid: number): Promise<ActionResult> {
  const res = await runAction(async () => {
    await requireMailAdmin();
    await withImap((client) => setSeen(client, folder, uid, false)).catch(mailError);
    revalidatePath("/mail");
    return undefined;
  }, "Marqué comme non lu.");
  if (res.ok) redirect(`/mail?folder=${encodeURIComponent(folder)}`);
  return res;
}

export async function trashMessageAction(folder: string, uid: number): Promise<ActionResult> {
  const res = await runAction(async () => {
    await requireMailAdmin();
    const result = await withImap((client) => trashMessage(client, folder, uid)).catch(mailError);
    revalidatePath("/mail");
    return result;
  }, "Message supprimé.");
  if (res.ok) redirect(`/mail?folder=${encodeURIComponent(folder)}`);
  return res.ok ? { ok: true } : res;
}

// --- Settings (Paramètres → Messagerie) -------------------------------------------

async function storedRow() {
  const { data } = await createAdminClient().from("mail_accounts").select("id, password_encrypted").order("created_at").limit(1).maybeSingle();
  return data as { id: string; password_encrypted: string } | null;
}

export async function saveMailSettings(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { user } = await requireMailAdmin();
    const input = mailSettingsSchema.parse(formToObject(formData));
    const existing = await storedRow();
    if (!existing && !input.password) throw new ActionError("Mot de passe obligatoire pour la première configuration.");
    const row = {
      email: input.email.toLowerCase(),
      display_name: input.display_name,
      username: input.username ?? input.email.toLowerCase(),
      imap_host: input.imap_host.toLowerCase(),
      imap_port: input.imap_port,
      smtp_host: input.smtp_host.toLowerCase(),
      smtp_port: input.smtp_port,
      signature: input.signature,
      updated_by: user.id,
      ...(input.password ? { password_encrypted: encryptSecret(input.password) } : {}),
    };
    const admin = createAdminClient();
    const { error } = existing
      ? await admin.from("mail_accounts").update(row).eq("id", existing.id)
      : await admin.from("mail_accounts").insert(row);
    if (error) {
      console.error("[mail] settings save failed:", error.code, error.message);
      throw new ActionError(error.code === "42P01" || error.code === "PGRST205" ? "Migration 0302 non appliquée." : "Enregistrement impossible.");
    }
    revalidatePath("/settings");
    revalidatePath("/mail");
    return undefined;
  }, "Boîte mail enregistrée.");
}

/** Test with the submitted values (stored password if the field is empty). */
export async function testMailSettings(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requireMailAdmin();
    const input = mailSettingsSchema.parse(formToObject(formData));
    const password = input.password ?? (await getMailAccount())?.password;
    if (!password) throw new ActionError("Saisissez le mot de passe pour tester.");
    try {
      await testMailAccount({
        username: input.username ?? input.email,
        password,
        imap: { host: input.imap_host, port: input.imap_port, secure: isImplicitTls(input.imap_port) },
        smtp: { host: input.smtp_host, port: input.smtp_port, secure: isImplicitTls(input.smtp_port) },
      });
    } catch (err) {
      throw new ActionError(`Échec : ${(err as Error).message}`);
    }
    return undefined;
  }, "Connexion IMAP et SMTP réussie.");
}

export async function deleteMailSettings(): Promise<ActionResult> {
  return runAction(async () => {
    await requireMailAdmin();
    const existing = await storedRow();
    if (existing) await createAdminClient().from("mail_accounts").delete().eq("id", existing.id);
    revalidatePath("/settings");
    revalidatePath("/mail");
    return undefined;
  }, "Configuration supprimée (le mot de passe chiffré est effacé).");
}
