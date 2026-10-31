import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Callout } from "@/components/shared/callout";
import { formatAddress, formatAddressList, forwardBlock, forwardSubject, quoteForReply, replyAllRecipients, replySubject } from "@/lib/mail";
import { requireStaffPage } from "@/lib/server/auth";
import { getMailAccount } from "@/lib/server/mail/config";
import { getMessage, withImap, type FullMessage } from "@/lib/server/mail/imap";
import { ComposeForm, type ComposeDefaults } from "./compose-form";

export const metadata: Metadata = { title: "Nouveau message" };
export const dynamic = "force-dynamic";

const TITLES = { new: "Nouveau message", reply: "Répondre", replyall: "Répondre à tous", forward: "Transférer" } as const;

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; folder?: string; uid?: string; to?: string }>;
}) {
  await requireStaffPage("/mail");
  const sp = await searchParams;
  const mode = sp.mode === "reply" || sp.mode === "replyall" || sp.mode === "forward" ? sp.mode : "new";
  const account = await getMailAccount().catch(() => null);
  if (!account) return <Callout tone="warning">Boîte mail non configurée : Paramètres → Messagerie.</Callout>;

  const signature = account.signature ? `\n\n-- \n${account.signature}` : "";
  const defaults: ComposeDefaults = {
    to: sp.to ?? "",
    cc: "",
    subject: "",
    body: signature,
    inReplyTo: null,
    references: null,
    reply: null,
    forward: null,
  };

  if (mode !== "new" && sp.folder && Number(sp.uid) > 0) {
    const uid = Number(sp.uid);
    let original: FullMessage | null = null;
    try {
      original = await withImap((client) => getMessage(client, sp.folder!, uid));
    } catch (err) {
      console.error("[mail] compose fetch failed:", (err as Error).message);
    }
    if (!original) return <Callout tone="destructive">Message d&apos;origine introuvable.</Callout>;
    const from = formatAddressList(original.from);
    if (mode === "forward") {
      defaults.subject = forwardSubject(original.subject);
      defaults.body = `${signature}${forwardBlock({ from, to: formatAddressList(original.to), date: original.date, subject: original.subject, text: original.text })}`;
      defaults.forward = { folder: sp.folder, uid, attachments: original.attachments.filter((a) => !a.inline).map((a) => a.filename) };
    } else {
      const recipients =
        mode === "replyall"
          ? replyAllRecipients(account.email, original)
          : { to: original.replyTo.length ? original.replyTo : original.from, cc: [] };
      defaults.to = recipients.to.map(formatAddress).join(", ");
      defaults.cc = recipients.cc.map(formatAddress).join(", ");
      defaults.subject = replySubject(original.subject);
      defaults.body = `${signature}${quoteForReply({ from, date: original.date, text: original.text })}`;
      defaults.inReplyTo = original.messageId;
      defaults.references = [...original.references, original.messageId].filter(Boolean).join(" ") || null;
      defaults.reply = { folder: sp.folder, uid };
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle className="text-base">{TITLES[mode]}</CardTitle>
      </CardHeader>
      <CardContent>
        <ComposeForm from={formatAddress({ name: account.displayName, address: account.email })} defaults={defaults} />
      </CardContent>
    </Card>
  );
}
