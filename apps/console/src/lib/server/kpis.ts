import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { LEAD_STATUSES, OPEN_LEAD_STATUSES, type LeadStatus } from "@/lib/domain";
import { startOfMonthIso, startOfYearDate } from "@/lib/format";

export interface DashboardKpis {
  leadsThisMonth: number;
  pipeline: Record<LeadStatus, number>;
  openPipeline: number;
  activeProjects: number;
  /** Issued (sent + paid) invoices of the current calendar year, TTC and HT. */
  invoicedYearCents: number;
  invoicedYearHtCents: number;
  paidYearCents: number;
  outstandingCents: number;
  openRequests: number;
}

/** Staff dashboard KPIs (also exposed through the MCP tool `dashboard_kpis`). */
export async function loadDashboardKpis(db: SupabaseClient, now: Date = new Date()): Promise<DashboardKpis> {
  const [monthLeads, leads, projects, invoices, requests] = await Promise.all([
    db.from("leads").select("id", { count: "exact", head: true }).gte("created_at", startOfMonthIso(now)),
    db.from("leads").select("status"),
    db.from("projects").select("id", { count: "exact", head: true }).eq("status", "active"),
    db
      .from("invoices")
      .select("status, subtotal_cents, total_cents, issue_date")
      .in("status", ["sent", "paid"]),
    db.from("client_requests").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
  ]);

  const pipeline = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
  for (const row of (leads.data ?? []) as { status: LeadStatus }[]) {
    if (row.status in pipeline) pipeline[row.status] += 1;
  }

  const yearStart = startOfYearDate(now);
  let invoicedYear = 0;
  let invoicedYearHt = 0;
  let paidYear = 0;
  let outstanding = 0;
  for (const inv of (invoices.data ?? []) as { status: string; subtotal_cents: number; total_cents: number; issue_date: string | null }[]) {
    const thisYear = !!inv.issue_date && inv.issue_date >= yearStart;
    if (thisYear) {
      invoicedYear += Number(inv.total_cents);
      invoicedYearHt += Number(inv.subtotal_cents);
      if (inv.status === "paid") paidYear += Number(inv.total_cents);
    }
    if (inv.status === "sent") outstanding += Number(inv.total_cents);
  }

  return {
    leadsThisMonth: monthLeads.count ?? 0,
    pipeline,
    openPipeline: OPEN_LEAD_STATUSES.reduce((sum, s) => sum + pipeline[s], 0),
    activeProjects: projects.count ?? 0,
    invoicedYearCents: invoicedYear,
    invoicedYearHtCents: invoicedYearHt,
    paidYearCents: paidYear,
    outstandingCents: outstanding,
    openRequests: requests.count ?? 0,
  };
}
