import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { REQUEST_CATEGORY_LABELS, REQUEST_STATUS_META, metaOf, type RequestCategory } from "@/lib/domain";
import { formatDateTime } from "@/lib/format";
import { PORTAL_PROJECT_STATUSES, portalScope } from "@/lib/server/portal";
import { NewRequestForm } from "./request-forms";

export const metadata: Metadata = { title: "Demandes" };

export default async function PortalRequestsPage() {
  const { supabase, orgIds } = await portalScope();
  const [requests, orgs, projects] = await Promise.all([
    supabase
      .from("client_requests")
      .select("id, subject, category, status, created_at, updated_at")
      .in("organization_id", orgIds)
      .order("updated_at", { ascending: false }),
    supabase.from("organizations").select("id, name").in("id", orgIds).order("name"),
    supabase
      .from("projects")
      .select("id, name, organization_id")
      .in("organization_id", orgIds)
      .in("status", PORTAL_PROJECT_STATUSES)
      .order("name"),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Vos demandes</h2>
        {(requests.data ?? []).length === 0 ? (
          <EmptyState icon={<LifeBuoy className="h-6 w-6" />} title="Aucune demande" description="Posez une question ou signalez un besoin à l'équipe Agenfy." />
        ) : (
          <ul className="divide-y rounded-xl border">
            {(requests.data ?? []).map((r) => (
              <li key={r.id}>
                <Link href={`/portal/requests/${r.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/40">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{r.subject}</span>
                    <span className="text-xs text-muted-foreground">
                      {REQUEST_CATEGORY_LABELS[r.category as RequestCategory]} · mise à jour {formatDateTime(r.updated_at)}
                    </span>
                  </span>
                  <StatusBadge size="sm" {...metaOf(REQUEST_STATUS_META, r.status)} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Nouvelle demande</CardTitle>
          <CardDescription>L&apos;équipe Agenfy vous répond ici, dans votre espace.</CardDescription>
        </CardHeader>
        <CardContent>
          <NewRequestForm organizations={orgs.data ?? []} projects={projects.data ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
