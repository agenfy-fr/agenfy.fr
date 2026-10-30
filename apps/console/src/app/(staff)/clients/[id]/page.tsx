import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { BreadcrumbLabel } from "@/components/nav/breadcrumb-label";
import { DocumentsPanel } from "@/components/staff/documents-panel";
import { ORG_ROLE_LABELS, canAccessRoute, canWrite, type OrgRole } from "@/lib/access-control";
import { INVOICE_STATUS_META, PROJECT_STATUS_META, REQUEST_STATUS_META, metaOf } from "@/lib/domain";
import { formatCents, formatDate } from "@/lib/format";
import { UUID_RE } from "@/lib/schemas";
import { requireStaffPage } from "@/lib/server/auth";
import { displayName, getStaffDirectory, getUserDirectory } from "@/lib/server/directory";
import type { ClientDocument, Organization, OrganizationInternal, OrganizationMember, Project } from "@/lib/types";
import { NewProjectButton } from "../../projects/project-forms";
import { InternalForm, InviteMemberButton, MemberControls, OrganizationForm } from "../client-forms";

export const metadata: Metadata = { title: "Fiche client" };

export default async function ClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase, role } = await requireStaffPage("/clients");
  const { invite } = await searchParams;

  const [orgRes, internalRes, membersRes, projectsRes, docsRes, requestsRes, invoicesRes, staff] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", id).maybeSingle(),
    supabase.from("organization_internal").select("*").eq("organization_id", id).maybeSingle(),
    supabase.from("organization_members").select("*").eq("organization_id", id).order("created_at"),
    supabase.from("projects").select("*").eq("organization_id", id).order("created_at", { ascending: false }),
    supabase.from("client_documents").select("*").eq("organization_id", id).order("created_at", { ascending: false }),
    supabase.from("client_requests").select("id, subject, status, created_at").eq("organization_id", id).order("created_at", { ascending: false }).limit(20),
    canAccessRoute(role, "/billing")
      ? supabase.from("invoices").select("id, number, title, status, total_cents, issue_date").eq("organization_id", id).order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
    getStaffDirectory(supabase),
  ]);

  const org = orgRes.data as Organization | null;
  if (!org) notFound();
  const members = (membersRes.data ?? []) as OrganizationMember[];
  const projects = (projectsRes.data ?? []) as Project[];
  const users = await getUserDirectory(supabase, members.map((m) => m.user_id));
  const canEdit = canWrite(role);

  return (
    <div className="space-y-6">
      <BreadcrumbLabel label={org.name} />
      <Tabs defaultValue={invite ? "contacts" : "overview"}>
        <TabsList>
          <TabsTrigger value="overview">Fiche</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({members.length})</TabsTrigger>
          <TabsTrigger value="projects">Projets ({projects.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Demandes & factures</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations</CardTitle>
              <CardDescription>Visibles par les contacts du client.</CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationForm org={org} canEdit={canEdit} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suivi interne</CardTitle>
              <CardDescription>Réservé à l&apos;équipe Agenfy.</CardDescription>
            </CardHeader>
            <CardContent>
              <InternalForm orgId={org.id} internal={internalRes.data as OrganizationInternal | null} staff={staff} canEdit={canEdit} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">Accès à l&apos;espace client</CardTitle>
                <CardDescription>Ces personnes voient les projets actifs, jalons, documents et factures de {org.name}.</CardDescription>
              </div>
              {canEdit && <InviteMemberButton orgId={org.id} defaultEmail={invite} />}
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <EmptyState title="Aucun contact" description="Invitez un contact pour lui ouvrir l'espace client." className="p-4" />
              ) : (
                <ul className="divide-y">
                  {members.map((m) => {
                    const u = users.get(m.user_id);
                    const label = displayName(u, m.user_id);
                    return (
                      <li key={m.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">
                            {u?.email} · depuis le {formatDate(m.created_at)}
                          </p>
                        </div>
                        {canEdit ? (
                          <MemberControls orgId={org.id} userId={m.user_id} role={m.role} label={label} />
                        ) : (
                          <StatusBadge size="sm" label={ORG_ROLE_LABELS[m.role as OrgRole] ?? m.role} />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-4 space-y-3">
          {canEdit && (
            <div className="flex justify-end">
              <NewProjectButton fixedOrganizationId={org.id} staff={staff} />
            </div>
          )}
          {projects.length === 0 ? (
            <EmptyState title="Aucun projet" className="p-4" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {projects.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="rounded-xl border p-4 transition-colors hover:bg-muted/40">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{p.code}</p>
                    </div>
                    <StatusBadge size="sm" {...metaOf(PROJECT_STATUS_META, p.status)} />
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-label={`Avancement ${p.progress} %`}>
                    <div className="h-full bg-primary" style={{ width: `${p.progress}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <DocumentsPanel
            organizationId={org.id}
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
            documents={(docsRes.data ?? []) as ClientDocument[]}
            canEdit={canEdit}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-4 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Demandes</CardTitle>
            </CardHeader>
            <CardContent>
              {(requestsRes.data ?? []).length === 0 ? (
                <EmptyState title="Aucune demande" className="p-4" />
              ) : (
                <ul className="divide-y text-sm">
                  {(requestsRes.data ?? []).map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                      <Link href={`/requests/${r.id}`} className="truncate hover:underline">
                        {r.subject}
                      </Link>
                      <StatusBadge size="sm" {...metaOf(REQUEST_STATUS_META, r.status)} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          {invoicesRes.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Factures</CardTitle>
              </CardHeader>
              <CardContent>
                {invoicesRes.data.length === 0 ? (
                  <EmptyState title="Aucune facture" className="p-4" />
                ) : (
                  <ul className="divide-y text-sm">
                    {invoicesRes.data.map((inv) => (
                      <li key={inv.id} className="flex items-center justify-between gap-3 py-2">
                        <Link href={`/billing/invoices/${inv.id}`} className="truncate hover:underline">
                          {inv.number ?? "Brouillon"} · {inv.title}
                        </Link>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="tabular-nums">{formatCents(inv.total_cents)}</span>
                          <StatusBadge size="sm" {...metaOf(INVOICE_STATUS_META, inv.status)} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
