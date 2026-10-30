import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Callout } from "@/components/shared/callout";
import { DataTable, DataTableHead, Td, Th, Tr } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { STAFF_ROLE_LABELS, canWrite } from "@/lib/access-control";
import { formatDate, formatDateTime } from "@/lib/format";
import { API_TOKEN_PUBLIC_COLUMNS, type ApiTokenRow } from "@/lib/planning/api-tokens";
import { requireStaffPage } from "@/lib/server/auth";
import { siteOrigin } from "@/lib/server/site";
import { createAdminClient } from "@/lib/supabase/admin";
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
