import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Callout } from "@/components/shared/callout";
import { DataTable, DataTableHead, Td, Th, Tr } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { STAFF_ROLE_LABELS, canWrite, isAdminRole } from "@/lib/access-control";
import { formatDate, formatDateTime } from "@/lib/format";
import { API_TOKEN_PUBLIC_COLUMNS, type ApiTokenRow } from "@/lib/planning/api-tokens";
import { requireStaffPage } from "@/lib/server/auth";
import { siteOrigin } from "@/lib/server/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMailSettingsView } from "@/lib/server/mail/config";
import { hasMailKey } from "@/lib/server/mail/crypto";
import { MailSettingsForm } from "./mail-settings-form";
import { NewTokenForm, RevokeTokenButton } from "./token-forms";

export const metadata: Metadata = { title: "Paramètres" };

function isExpired(t: ApiTokenRow): boolean {
  return !!t.expires_at && Date.parse(t.expires_at) <= Date.now();
}

export default async function SettingsPage() {
  const { user, role } = await requireStaffPage("/settings");

  let tokens: ApiTokenRow[] = [];
  let tokensError = false;
  try {
    const { data, error } = await createAdminClient()
      .from("staff_api_tokens")
      .select(API_TOKEN_PUBLIC_COLUMNS)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    tokens = (data ?? []) as ApiTokenRow[];
  } catch {
    tokensError = true;
  }
  const mcpUrl = `${await siteOrigin()}/api/mcp`;
  const mail = isAdminRole(role) ? await getMailSettingsView().catch(() => null) : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Mon compte</CardTitle>
          <CardDescription>
            {user.email} · {STAFF_ROLE_LABELS[role]}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <Link href="/account" className="text-primary hover:underline">
            Modifier mon profil et mon mot de passe
          </Link>
        </CardContent>
      </Card>

      {mail && (
        <Card id="messagerie" className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Messagerie</CardTitle>
            <CardDescription>
              Boîte mail de l&apos;entreprise (OVH : IMAP/SMTP) consultable dans Messagerie, réservée aux propriétaires et administrateurs.
              Si vous changez le mot de passe chez OVH, mettez-le à jour ici.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasMailKey() && (
              <Callout tone="warning">
                MAIL_ENCRYPTION_KEY n&apos;est pas configurée sur le serveur : impossible d&apos;enregistrer un mot de passe chiffré.
              </Callout>
            )}
            {mail.source === "env" && (
              <Callout tone="info">Boîte actuellement configurée par les variables MAIL_* de Vercel. Enregistrer ce formulaire la remplace.</Callout>
            )}
            <MailSettingsForm
              initial={{
                stored: mail.source === "settings",
                email: mail.email ?? "contact@agenfy.fr",
                display_name: mail.display_name ?? "Agenfy",
                username: mail.username ?? "",
                imap_host: mail.imap_host ?? "ssl0.ovh.net",
                imap_port: mail.imap_port ?? 993,
                smtp_host: mail.smtp_host ?? "ssl0.ovh.net",
                smtp_port: mail.smtp_port ?? 465,
                signature: mail.signature ?? "",
              }}
            />
            {mail.updated_at && <p className="text-xs text-muted-foreground">Mis à jour le {formatDateTime(mail.updated_at)}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Jetons d&apos;API (serveur MCP)</CardTitle>
          <CardDescription>
            Pour connecter Claude Code (ou tout client MCP) au serveur <code>agenfy-console</code> : clients, projets, tâches, leads, KPI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
            {`claude mcp add --transport http agenfy-console ${mcpUrl} \\\n  --header "Authorization: Bearer acp_…"`}
          </pre>
          {tokensError ? (
            <Callout tone="warning">Jetons indisponibles : SUPABASE_SERVICE_ROLE_KEY n&apos;est pas configurée côté serveur.</Callout>
          ) : (
            <>
              <NewTokenForm canWrite={canWrite(role)} />
              {tokens.length > 0 && (
                <DataTable label="Mes jetons" maxHeight={null}>
                  <DataTableHead>
                    <tr>
                      <Th>Nom</Th>
                      <Th>Préfixe</Th>
                      <Th>Scopes</Th>
                      <Th>Dernière utilisation</Th>
                      <Th>Expiration</Th>
                      <Th>
                        <span className="sr-only">Actions</span>
                      </Th>
                    </tr>
                  </DataTableHead>
                  <tbody>
                    {tokens.map((t) => {
                      const expired = isExpired(t);
                      return (
                        <Tr key={t.id}>
                          <Td className="font-medium">{t.name}</Td>
                          <Td className="font-mono text-xs">{t.token_prefix}…</Td>
                          <Td className="text-xs">{t.scopes.join(", ")}</Td>
                          <Td muted>{formatDateTime(t.last_used_at)}</Td>
                          <Td muted>{t.expires_at ? formatDate(t.expires_at) : "Jamais"}</Td>
                          <Td>
                            {t.revoked_at ? (
                              <StatusBadge size="sm" label="Révoqué" variant="neutral" />
                            ) : expired ? (
                              <StatusBadge size="sm" label="Expiré" variant="caution" />
                            ) : (
                              <RevokeTokenButton id={t.id} name={t.name} />
                            )}
                          </Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </DataTable>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
