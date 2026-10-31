import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Forward, ImageIcon, Reply, ReplyAll } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BreadcrumbLabel } from "@/components/nav/breadcrumb-label";
import { Callout } from "@/components/shared/callout";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatAddressList } from "@/lib/mail";
import { formatBytes, formatDateTime } from "@/lib/format";
import { requireStaffPage } from "@/lib/server/auth";
import { getMessage, withImap, type FullMessage } from "@/lib/server/mail/imap";
import { MessageActions } from "./message-actions";

export const metadata: Metadata = { title: "Message" };
export const dynamic = "force-dynamic";

export default async function MailMessagePage({ searchParams }: { searchParams: Promise<{ folder?: string; uid?: string; images?: string }> }) {
  const { supabase } = await requireStaffPage("/mail");
  const sp = await searchParams;
  const folder = sp.folder ?? "";
  const uid = Number(sp.uid);
  if (!folder || !Number.isInteger(uid) || uid <= 0) notFound();

  let msg: FullMessage | null = null;
  let error = false;
  try {
    msg = await withImap((client) => getMessage(client, folder, uid, { markSeen: true }));
  } catch (err) {
    console.error("[mail] read failed:", (err as Error).message);
    error = true;
  }
  if (error) return <Callout tone="destructive">Le serveur mail ne répond pas. Réessayez dans un instant.</Callout>;
  if (!msg) notFound();

  // Known client contacts among the participants → link to the client file.
  const emails = [...msg.from, ...msg.to, ...msg.cc].map((a) => a.address.toLowerCase());
  const { data: contacts } = await supabase
    .from("organization_contacts")
    .select("organization_id, email, organizations(name)")
    .in("email", emails.slice(0, 50));
  const clients = new Map<string, string>();
  for (const c of (contacts ?? []) as unknown as { organization_id: string; organizations: { name: string } | null }[]) {
    clients.set(c.organization_id, c.organizations?.name ?? "Client");
  }

  const ref = `folder=${encodeURIComponent(folder)}&uid=${uid}`;
  const images = sp.images === "1";
  const attachments = msg.attachments.filter((a) => !a.inline);

  return (
    <div className="space-y-4">
      <BreadcrumbLabel label={msg.subject} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/mail?folder=${encodeURIComponent(folder)}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={`/mail/compose?mode=reply&${ref}`}>
              <Reply className="h-4 w-4" aria-hidden="true" /> Répondre
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/mail/compose?mode=replyall&${ref}`}>
              <ReplyAll className="h-4 w-4" aria-hidden="true" /> Répondre à tous
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/mail/compose?mode=forward&${ref}`}>
              <Forward className="h-4 w-4" aria-hidden="true" /> Transférer
            </Link>
          </Button>
          <MessageActions folder={folder} uid={uid} />
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <h2 className="text-lg font-semibold">{msg.subject}</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-muted-foreground">De</dt>
            <dd className="break-all">{formatAddressList(msg.from)}</dd>
            <dt className="text-muted-foreground">À</dt>
            <dd className="break-all">{formatAddressList(msg.to) || "—"}</dd>
            {msg.cc.length > 0 && (
              <>
                <dt className="text-muted-foreground">Cc</dt>
                <dd className="break-all">{formatAddressList(msg.cc)}</dd>
              </>
            )}
            <dt className="text-muted-foreground">Date</dt>
            <dd>{formatDateTime(msg.date?.toISOString() ?? null)}</dd>
          </dl>
          {clients.size > 0 && (
            <div className="flex flex-wrap gap-2">
              {[...clients].map(([id, name]) => (
                <Link key={id} href={`/clients/${id}?tab=contacts`}>
                  <StatusBadge size="sm" variant="purple" label={`Client : ${name}`} />
                </Link>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {msg.html && !images && (
            <div className="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              <span>Images distantes bloquées (protection contre le pistage).</span>
              <Link href={`/mail/message?${ref}&images=1`} className="inline-flex items-center gap-1 text-primary hover:underline">
                <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" /> Afficher les images
              </Link>
            </div>
          )}
          <iframe
            src={`/api/mail/body?${ref}${images ? "&images=1" : ""}`}
            title="Contenu du message"
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            className="h-[65vh] w-full rounded-lg border bg-white"
          />
          {attachments.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {attachments.map((a) => (
                <li key={a.index}>
                  <a
                    href={`/api/mail/attachment?${ref}&i=${a.index}`}
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span className="max-w-[16rem] truncate">{a.filename}</span>
                    <span className="text-xs text-muted-foreground">{formatBytes(a.size)}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
