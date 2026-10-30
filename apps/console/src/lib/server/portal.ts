import "server-only";
import { requireMemberPage, type Session } from "./auth";

export interface PortalScope extends Session {
  /** Organizations the user is a member of. */
  orgIds: string[];
}

/**
 * Portal data access. RLS already restricts clients to their organizations
 * and client-visible rows, but a user can be BOTH staff and client member:
 * RLS would then grant staff-wide reads. Every portal query therefore also
 * filters explicitly on `orgIds` and on visibility (non-draft,
 * client_visible, non-internal) — the portal never relies on the role.
 */
export async function portalScope(): Promise<PortalScope> {
  const session = await requireMemberPage();
  return { ...session, orgIds: session.access.memberships.map((m) => m.organization_id) };
}

/** Project statuses shown to clients (drafts are staff-only). */
export const PORTAL_PROJECT_STATUSES = ["active", "on_hold", "completed", "cancelled"] as const;
export const PORTAL_QUOTE_STATUSES = ["sent", "accepted", "declined", "expired"] as const;
export const PORTAL_INVOICE_STATUSES = ["sent", "paid", "cancelled"] as const;
