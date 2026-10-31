import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, Paperclip, PenSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Callout } from "@/components/shared/callout";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { MAIL_PAGE_SIZE, folderLabel } from "@/lib/mail";
import { formatDateTime } from "@/lib/format";
import { requireStaffPage } from "@/lib/server/auth";
import { getMailAccount } from "@/lib/server/mail/config";
import { listFolders, listMessages, withImap, type FolderWithCounts, type MessageSummary } from "@/lib/server/mail/imap";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Messagerie" };
export const dynamic = "force-dynamic";

function mailHref(params: Record<string, string | number | null | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v != null && v !== "") sp.set(k, String(v));
  const qs = sp.toString();
  return qs ? `/mail?${qs}` : "/mail";
}

export default async function MailPage({ searchParams }: { searchParams: Promise<{ folder?: string; page?: string; q?: string; sent?: string }> }) {
  await requireStaffPage("/mail");
  const sp = await searchParams;
  const folder = sp.folder || "INBOX";
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim().slice(0, 200) || null;

  const account = await getMailAccount().catch(() => null);
  if (!account) {
    return (
      <div className="space-y-6">
        <PageHeader title="Messagerie" />
        <EmptyState
          icon={<Inbox className="h-6 w-6" />}
          title="Boîte mail non configurée"
          description="Renseignez le serveur IMAP/SMTP et le mot de passe de la boîte (OVH) dans les paramètres."
          action={
            <Button asChild>
              <Link href="/settings#messagerie">Configurer la boîte mail</Link>
            </Button>
          }
        />
      </div>
    );
  }

  let folders: FolderWithCounts[] = [];
  let messages: MessageSummary[] = [];
  let total = 0;
  let error: string | null = null;
  try {
    await withImap(async (client) => {
      folders = await listFolders(client);
      ({ messages, total } = await listMessages(client, folder, { page, q }));
    });
  } catch (err) {
    console.error("[mail] list failed:", (err as Error).message);
    error = /auth|credentials|login/i.test((err as Error).message)
      ? "Connexion refusée par le serveur mail : vérifiez l'identifiant et le mot de passe dans Paramètres → Messagerie."
      : "Le serveur mail ne répond pas. Réessayez dans un instant.";
  }
  const current = folders.find((f) => f.path === folder);
  const pages = Math.max(1, Math.ceil(total / MAIL_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messagerie"
        description={account.email}
        actions={
          <Button asChild>
            <Link href="/mail/compose">
              <PenSquare className="h-4 w-4" aria-hidden="true" /> Nouveau message
            </Link>
          </Button>
        }
      />
      {sp.sent === "1" && <Callout tone="success">Message envoyé.</Callout>}
      {error && <Callout tone="destructive">{error}</Callout>}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Dossiers" className="space-y-1">
          {folders.map((f) => (
            <Link
              key={f.path}
              href={mailHref({ folder: f.path })}
              aria-current={f.path === folder ? "page" : undefined}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted",
                f.path === folder && "bg-muted font-medium",
              )}
            >
              <span className="truncate">{folderLabel(f)}</span>
              {!!f.unseen && <span className="ml-2 rounded-full bg-primary px-2 text-xs text-primary-foreground tabular-nums">{f.unseen}</span>}
            </Link>
          ))}
        </nav>

        <div className="min-w-0 space-y-3">
          <form action="/mail" className="flex gap-2" role="search">
            <input type="hidden" name="folder" value={folder} />
            <Input name="q" defaultValue={q ?? ""} placeholder="Rechercher (objet, expéditeur, destinataire)" aria-label="Rechercher" />
            <Button type="submit" variant="outline" size="icon" aria-label="Rechercher">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <Card className="overflow-hidden">
            {messages.length === 0 ? (
              <EmptyState icon={<Inbox className="h-6 w-6" />} title={q ? "Aucun résultat" : `${current ? folderLabel(current) : folder} : aucun message`} />
            ) : (
              <ul className="divide-y">
                {messages.map((m) => (
                  <li key={m.uid}>
                    <Link
                      href={`/mail/message?folder=${encodeURIComponent(folder)}&uid=${m.uid}`}
                      className={cn("grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 px-4 py-3 text-sm hover:bg-muted/50", !m.seen && "bg-primary/5")}
                    >
                      <span className={cn("truncate", !m.seen && "font-semibold")}>
                        {current?.specialUse === "\\Sent" || current?.specialUse === "\\Drafts"
                          ? `À : ${m.to.map((a) => a.name || a.address).join(", ") || "—"}`
                          : m.from?.name || m.from?.address || "—"}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">{formatDateTime(m.date)}</span>
                      <span className={cn("col-span-2 flex items-center gap-1.5 truncate text-muted-foreground", !m.seen && "text-foreground")}>
                        {m.hasAttachments && <Paperclip className="h-3.5 w-3.5 shrink-0" aria-label="Pièce jointe" />}
                        <span className="truncate">{m.subject}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {pages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {page} / {pages} · {total} messages
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={mailHref({ folder, q, page: page - 1 })}>Plus récents</Link>
                  </Button>
                )}
                {page < pages && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={mailHref({ folder, q, page: page + 1 })}>Plus anciens</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
