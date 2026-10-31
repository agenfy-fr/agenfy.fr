import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { BreadcrumbLabel } from "@/components/nav/breadcrumb-label";
import { DocumentsPanel } from "@/components/staff/documents-panel";
import { ORG_ROLE_LABELS, TRAINING_WRITE_ROLES, canAccessRoute, canWrite, canWriteDomain, isPortalRole, type OrgRole } from "@/lib/access-control";
import { buildAccessPeople, grantableCourseIds, type AccessEnrollmentInput } from "@/lib/client-access";
import { ENROLLMENT_STATUS_META } from "@/lib/training";
import { INVOICE_STATUS_META, PROJECT_STATUS_META, REQUEST_STATUS_META, metaOf } from "@/lib/domain";
import { formatCents } from "@/lib/format";
import { UUID_RE } from "@/lib/schemas";
import { requireStaffPage } from "@/lib/server/auth";
import { getStaffDirectory, getUserDirectory } from "@/lib/server/directory";
import type { ClientDocument, Organization, OrganizationContact, OrganizationInternal, OrganizationMember, Project } from "@/lib/types";
import { NewProjectButton } from "../../projects/project-forms";
import {
  ContactActions,
  DetachLearnerButton,
  GrantTrainingDialog,
  InternalForm,
  InviteContactDialog,
  MemberControls,
  NewContactButton,
  OpenPortalForAccountDialog,
  OrganizationForm,
  PromoteResponsableButton,
} from "../client-forms";
import { EnrollmentStatusButton } from "../../training/training-forms";

export const metadata: Metadata = { title: "Fiche client" };

export default async function ClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase, role } = await requireStaffPage("/clients");
  const { tab } = await searchParams;

  const [orgRes, internalRes, membersRes, contactsRes, projectsRes, docsRes, requestsRes, invoicesRes, staff, enrollRes, coursesRes] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", id).maybeSingle(),
    supabase.from("organization_internal").select("*").eq("organization_id", id).maybeSingle(),
    supabase.from("organization_members").select("*").eq("organization_id", id).order("created_at"),
    supabase.from("organization_contacts").select("*").eq("organization_id", id).order("is_primary", { ascending: false }).order("created_at"),
    supabase.from("projects").select("*").eq("organization_id", id).order("created_at", { ascending: false }),
    supabase.from("client_documents").select("*").eq("organization_id", id).order("created_at", { ascending: false }),
    supabase.from("client_requests").select("id, subject, status, created_at").eq("organization_id", id).order("created_at", { ascending: false }).limit(20),
    canAccessRoute(role, "/billing")
      ? supabase.from("invoices").select("id, number, title, status, total_cents, issue_date").eq("organization_id", id).order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
    getStaffDirectory(supabase),
    supabase
      .from("enrollments")
      .select("id, user_id, course_id, status, progress_percent, courses(title)")
      .eq("organization_id", id)
      .order("created_at"),
    supabase.from("courses").select("id, title").eq("status", "published").order("title"),
  ]);

  const org = orgRes.data as Organization | null;
  if (!org) notFound();
  const members = (membersRes.data ?? []) as OrganizationMember[];
  const contacts = (contactsRes.data ?? []) as OrganizationContact[];
  const memberIds = new Set(members.filter((m) => isPortalRole(m.role)).map((m) => m.user_id));
  const learnerIds = new Set(members.filter((m) => m.role === "learner").map((m) => m.user_id));
  const projects = (projectsRes.data ?? []) as Project[];
  const enrollments: AccessEnrollmentInput[] = (
    (enrollRes.data ?? []) as unknown as (Omit<AccessEnrollmentInput, "course_title"> & { courses: { title: string } | null })[]
  ).map(({ courses, ...e }) => ({ ...e, course_title: courses?.title ?? "Formation" }));
  const users = await getUserDirectory(supabase, [...members.map((m) => m.user_id), ...enrollments.map((e) => e.user_id)]);
  const canEdit = canWrite(role);
  const canTrain = canWriteDomain(role, TRAINING_WRITE_ROLES);
  const people = buildAccessPeople(contacts, members, enrollments, users);
  const publishedCourses = (coursesRes.data ?? []) as { id: string; title: string }[];
  const portalCount = people.filter((p) => p.portalAccess).length;
  const learnerCount = people.filter((p) => p.enrollments.some((e) => e.status !== "cancelled")).length;

  return (
    <div className="space-y-6">
      <BreadcrumbLabel label={org.name} />
      <Tabs defaultValue={tab === "contacts" || tab === "access" ? tab : "overview"}>
        <TabsList>
          <TabsTrigger value="overview">Fiche</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="access">Accès ({people.length})</TabsTrigger>
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

        <TabsContent value="contacts" className="mt-4 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">Contacts</CardTitle>
                <CardDescription>Carnet d&apos;adresses du client. Ajouter un contact n&apos;envoie aucun e-mail.</CardDescription>
              </div>
              {canEdit && <NewContactButton orgId={org.id} />}
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <EmptyState title="Aucun contact" description="Ajoutez les interlocuteurs du client (sans invitation)." className="p-4" />
              ) : (
                <ul className="divide-y">
                  {contacts.map((c) => {
                    const hasAccess = !!c.user_id && memberIds.has(c.user_id);
                    return (
                      <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                        <div className="min-w-0 space-y-0.5">
                          <p className="flex flex-wrap items-center gap-2 font-medium">
                            {c.full_name || c.email}
                            {c.is_primary && <StatusBadge size="sm" label="Principal" variant="purple" />}
                            <StatusBadge
                              size="sm"
                              label={hasAccess ? "Accès espace client" : c.user_id && learnerIds.has(c.user_id) ? "Formation uniquement" : "Sans accès"}
                              variant={hasAccess ? "success" : c.user_id && learnerIds.has(c.user_id) ? "info" : "neutral"}
                            />
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {[c.job_title, c.email, c.phone].filter(Boolean).join(" · ")}
                          </p>
                          {c.email && (
                            <Link href={`/mail/compose?to=${encodeURIComponent(c.email)}`} className="text-xs text-primary hover:underline">
                              Écrire depuis la messagerie
                            </Link>
                          )}
                        </div>
                        {canEdit && <ContactActions orgId={org.id} contact={c} hasAccess={hasAccess} />}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="access" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">Accès des personnes du client</CardTitle>
                <CardDescription>
                  Espace client (console.agenfy.fr) : responsables et membres voient projets, documents et factures. Formation
                  (app.agenfy.fr) : les salariés n&apos;accèdent qu&apos;aux formations attribuées. Ajouter un salarié comme contact
                  n&apos;envoie rien ; chaque e-mail est annoncé avant envoi. {portalCount} accès espace client · {learnerCount} en
                  formation.
                </CardDescription>
              </div>
              {canEdit && <NewContactButton orgId={org.id} />}
            </CardHeader>
            <CardContent>
              {people.length === 0 ? (
                <EmptyState title="Personne pour l'instant" description="Ajoutez le responsable et les salariés comme contacts." className="p-4" />
              ) : (
                <ul className="divide-y">
                  {people.map((p) => {
                    const grantable = new Set(grantableCourseIds(p, publishedCourses.map((c) => c.id)));
                    return (
                      <li key={p.key} className="grid gap-3 py-4 text-sm lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.4fr)]">
                        <div className="min-w-0 space-y-0.5">
                          <p className="flex flex-wrap items-center gap-2 font-medium">
                            {p.name}
                            {p.isPrimary && <StatusBadge size="sm" label="Principal" variant="purple" />}
                          </p>
                          <p className="break-all text-xs text-muted-foreground">
                            {[p.jobTitle, p.email].filter(Boolean).join(" · ") || "Sans e-mail"}
                          </p>
                          {!p.userId && <p className="text-xs text-muted-foreground">Contact sans compte</p>}
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Espace client</p>
                          {p.portalAccess && p.userId ? (
                            canEdit ? (
                              <MemberControls orgId={org.id} userId={p.userId} role={p.role!} label={p.name} />
                            ) : (
                              <StatusBadge size="sm" variant="success" label={ORG_ROLE_LABELS[p.role as OrgRole] ?? String(p.role)} />
                            )
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge size="sm" label="Non" />
                              {canEdit && p.userId && p.role === "learner" && (
                                <>
                                  <OpenPortalForAccountDialog orgId={org.id} userId={p.userId} label={p.name} />
                                  <PromoteResponsableButton orgId={org.id} userId={p.userId} label={p.name} />
                                  {!p.enrollments.some((e) => e.status !== "cancelled") && (
                                    <DetachLearnerButton orgId={org.id} userId={p.userId} label={p.name} />
                                  )}
                                </>
                              )}
                              {canEdit && !p.role && p.contactId && p.email && (
                                <InviteContactDialog orgId={org.id} contactId={p.contactId} label={p.name} email={p.email} />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Formations (app.agenfy.fr)</p>
                          {p.enrollments.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Aucune formation.</p>
                          ) : (
                            <ul className="space-y-1.5">
                              {p.enrollments.map((e) => (
                                <li key={e.id} className="flex flex-wrap items-center gap-2">
                                  <span className="min-w-0 truncate">{e.course_title}</span>
                                  <StatusBadge size="sm" {...metaOf(ENROLLMENT_STATUS_META, e.status)} />
                                  <span className="text-xs tabular-nums text-muted-foreground">{e.progress_percent} %</span>
                                  {canTrain && <EnrollmentStatusButton enrollmentId={e.id} status={e.status} label={p.name} />}
                                </li>
                              ))}
                            </ul>
                          )}
                          {canTrain && (p.email || p.userId) && (
                            <GrantTrainingDialog
                              orgId={org.id}
                              contactId={p.contactId}
                              userId={p.userId}
                              label={p.name}
                              email={p.email}
                              hasAccount={!!p.userId}
                              courses={publishedCourses.filter((c) => grantable.has(c.id))}
                            />
                          )}
                          {canTrain && !p.email && !p.userId && (
                            <p className="text-xs text-muted-foreground">Ajoutez un e-mail au contact pour lui ouvrir des formations.</p>
                          )}
                        </div>
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
