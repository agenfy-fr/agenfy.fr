import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { LEAD_WRITE_ROLES, canWriteDomain } from "@/lib/access-control";
import { requireStaffPage } from "@/lib/server/auth";
import type { Lead } from "@/lib/types";
import { LeadsBoard, NewLeadButton } from "./leads-board";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage() {
  const { supabase, role } = await requireStaffPage("/leads");
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500);
  const canEdit = canWriteDomain(role, LEAD_WRITE_ROLES);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <PageHeader
        title="Pipeline commercial"
        description="Leads reçus via le formulaire de www.agenfy.fr ou saisis à la main. Glissez une carte pour changer son statut."
        actions={canEdit ? <NewLeadButton /> : null}
      />
      {error ? (
        <p className="text-sm text-destructive">Impossible de charger les leads.</p>
      ) : (
        <LeadsBoard leads={(data ?? []) as Lead[]} canEdit={canEdit} />
      )}
    </div>
  );
}
