import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, DataTableHead, Td, Th, Tr } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { STAFF_ROLE_LABELS, isAdminRole } from "@/lib/access-control";
import { formatDate } from "@/lib/format";
import { requireStaffPage } from "@/lib/server/auth";
import { getStaffDirectory } from "@/lib/server/directory";
import { InviteStaffButton, StaffRowForm } from "./team-forms";

export const metadata: Metadata = { title: "Équipe" };

export default async function TeamPage() {
  const { supabase, user, role } = await requireStaffPage("/team");
  const staff = await getStaffDirectory(supabase);
  const isAdmin = isAdminRole(role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Équipe Agenfy"
        description="Accès au back-office. Lecture seule : consultation sans modification. Commercial : leads et facturation. Consultant : clients, projets, leads."
        actions={isAdmin ? <InviteStaffButton canGrantOwner={role === "owner"} /> : null}
      />
      <Card className="overflow-hidden">
        <DataTable label="Membres de l'équipe">
          <DataTableHead>
            <tr>
              <Th>Nom</Th>
              <Th>E-mail</Th>
              <Th>Rôle</Th>
              <Th>Depuis</Th>
            </tr>
          </DataTableHead>
          <tbody>
            {staff.map((s) => (
              <Tr key={s.id}>
                <Td className="font-medium">
                  {s.full_name || "—"}
                  {s.id === user.id && <span className="ml-2 text-xs text-muted-foreground">(vous)</span>}
                </Td>
                <Td muted>{s.email}</Td>
                <Td>
                  {isAdmin && s.id !== user.id && (s.role !== "owner" || role === "owner") ? (
                    <StaffRowForm member={s} canGrantOwner={role === "owner"} />
                  ) : (
                    <span className="flex items-center gap-2">
                      <StatusBadge size="sm" label={STAFF_ROLE_LABELS[s.role]} variant={isAdminRole(s.role) ? "purple" : "neutral"} />
                      {s.suspended && <StatusBadge size="sm" variant="destructive" label="Suspendu" />}
                    </span>
                  )}
                </Td>
                <Td muted>{formatDate(s.created_at)}</Td>
              </Tr>
            ))}
          </tbody>
        </DataTable>
      </Card>
    </div>
  );
}
