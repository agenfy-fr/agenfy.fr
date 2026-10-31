import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, DataTableHead, Td, Th, Tr } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ORG_ROLE_LABELS, TRAINING_WRITE_ROLES, canWriteDomain, type OrgRole } from "@/lib/access-control";
import { metaOf } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { UUID_RE } from "@/lib/schemas";
import { requireStaffPage } from "@/lib/server/auth";
import { displayName, getUserDirectory } from "@/lib/server/directory";
import { ENROLLMENT_STATUSES, ENROLLMENT_STATUS_META } from "@/lib/training";
import { EnrollmentStatusButton } from "../training-forms";

export const metadata: Metadata = { title: "Accès formation" };

interface Row {
  id: string;
  user_id: string;
  course_id: string;
  organization_id: string | null;
  status: string;
  progress_percent: number;
  created_at: string;
  completed_at: string | null;
  courses: { title: string } | null;
  organizations: { name: string } | null;
}

/** Every learner across clients: who can open which course on app.agenfy.fr. */
export default async function TrainingAccessPage({ searchParams }: { searchParams: Promise<{ course?: string; status?: string }> }) {
  const { supabase, role } = await requireStaffPage("/training/access");
  const { course, status } = await searchParams;
  const courseFilter = course && UUID_RE.test(course) ? course : null;
  const statusFilter = (ENROLLMENT_STATUSES as readonly string[]).includes(status ?? "") ? status! : null;

  let query = supabase
    .from("enrollments")
    .select("id, user_id, course_id, organization_id, status, progress_percent, created_at, completed_at, courses(title), organizations(name)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (courseFilter) query = query.eq("course_id", courseFilter);
  if (statusFilter) query = query.eq("status", statusFilter);

  const [{ data }, { data: courses }, { data: memberships }] = await Promise.all([
    query,
    supabase.from("courses").select("id, title").order("title"),
    supabase.from("organization_members").select("organization_id, user_id, role"),
  ]);
  const rows = (data ?? []) as unknown as Row[];
  const users = await getUserDirectory(supabase, rows.map((r) => r.user_id));
  const roleOf = new Map(((memberships ?? []) as { organization_id: string; user_id: string; role: OrgRole }[]).map((m) => [`${m.organization_id}:${m.user_id}`, m.role]));
  const canEdit = canWriteDomain(role, TRAINING_WRITE_ROLES);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accès formation"
        description="Toutes les inscriptions, tous clients confondus. Pour donner accès à une formation, ouvrez la fiche client → onglet Accès."
      />
      <form className="flex flex-wrap items-end gap-2" method="get">
        <NativeSelect name="course" defaultValue={courseFilter ?? ""} aria-label="Formation" className="h-9 w-64">
          <option value="">Toutes les formations</option>
          {(courses ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect name="status" defaultValue={statusFilter ?? ""} aria-label="Statut" className="h-9 w-44">
          <option value="">Tous les statuts</option>
          {ENROLLMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ENROLLMENT_STATUS_META[s].label}
            </option>
          ))}
        </NativeSelect>
        <Button type="submit" variant="outline" size="sm">
          Filtrer
        </Button>
      </form>
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={<KeyRound className="h-6 w-6" />} title="Aucune inscription" />
        ) : (
          <DataTable label="Inscriptions aux formations">
            <DataTableHead>
              <tr>
                <Th>Apprenant</Th>
                <Th>Client</Th>
                <Th>Formation</Th>
                <Th>Statut</Th>
                <Th numeric>Progression</Th>
                <Th>Inscrit le</Th>
                {canEdit && <Th>Accès</Th>}
              </tr>
            </DataTableHead>
            <tbody>
              {rows.map((r) => {
                const u = users.get(r.user_id);
                const label = displayName(u, r.user_id);
                const orgRole = r.organization_id ? roleOf.get(`${r.organization_id}:${r.user_id}`) : undefined;
                return (
                  <Tr key={r.id}>
                    <Td>
                      <p className="font-medium">{label}</p>
                      {u?.email && u.email !== label && <p className="text-xs text-muted-foreground">{u.email}</p>}
                    </Td>
                    <Td>
                      {r.organization_id ? (
                        <>
                          <Link href={`/clients/${r.organization_id}?tab=access`} className="hover:underline">
                            {r.organizations?.name ?? "Client"}
                          </Link>
                          {orgRole && <p className="text-xs text-muted-foreground">{ORG_ROLE_LABELS[orgRole] ?? orgRole}</p>}
                        </>
                      ) : (
                        <span className="text-muted-foreground">Individuel</span>
                      )}
                    </Td>
                    <Td>
                      <Link href={`/training/${r.course_id}`} className="hover:underline">
                        {r.courses?.title ?? "Formation"}
                      </Link>
                    </Td>
                    <Td>
                      <StatusBadge size="sm" {...metaOf(ENROLLMENT_STATUS_META, r.status)} />
                    </Td>
                    <Td numeric>{r.progress_percent} %</Td>
                    <Td muted>{formatDate(r.created_at)}</Td>
                    {canEdit && (
                      <Td>
                        <EnrollmentStatusButton enrollmentId={r.id} status={r.status} label={label} />
                      </Td>
                    )}
                  </Tr>
                );
              })}
            </tbody>
          </DataTable>
        )}
      </Card>
    </div>
  );
}
