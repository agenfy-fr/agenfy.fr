/**
 * Access control — single source of truth for:
 *   - where a signed-in user lands (staff back-office vs client portal),
 *   - server page guards (lib/server/auth.ts),
 *   - navigation filtering (sidebar + command palette),
 *   - write permissions checked by server actions and the MCP server.
 *
 * Mirrors the SQL helpers (0003 + 0100/0101): is_staff(), staff_role(),
 * staff_can_write(), staff_has_role(), is_org_member(). The database stays the
 * source of truth (RLS); these checks give readable errors and hide UI.
 *
 * Pure module (no server import): usable client-side and in unit tests.
 */

export const STAFF_ROLES = ["owner", "admin", "consultant", "sales", "trainer", "readonly"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const ORG_ROLES = ["owner", "manager", "member"] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  owner: "Propriétaire",
  admin: "Administrateur",
  consultant: "Consultant",
  sales: "Commercial",
  trainer: "Formateur",
  readonly: "Lecture seule",
};

export const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Responsable",
  manager: "Gestionnaire",
  member: "Membre",
};

/** Roles that pass everywhere. */
export const ADMIN_ROLES: readonly StaffRole[] = ["owner", "admin"];

/** Route prefix → staff roles allowed (owner/admin implicit). Absent = all staff. */
export const ROLE_ACCESS = {
  "/leads": ["sales", "consultant", "readonly"],
  "/billing": ["sales", "readonly"],
  // Shared company mailbox: owner/admin only.
  "/mail": [],
  // Blog of www.agenfy.fr (0303): marketing roles; readonly can review.
  "/blog": ["consultant", "sales", "readonly"],
} as const satisfies Record<string, readonly StaffRole[]>;

export type ProtectedRoute = keyof typeof ROLE_ACCESS;

/** Write permissions per domain (owner/admin implicit, readonly never). */
export const LEAD_WRITE_ROLES: readonly StaffRole[] = ["sales", "consultant"];
export const BILLING_WRITE_ROLES: readonly StaffRole[] = ["sales"];
/** Mirror of staff_has_role(array['consultant', 'sales']) in 0303_blog_posts.sql. */
export const BLOG_WRITE_ROLES: readonly StaffRole[] = ["consultant", "sales"];

export function isStaffRole(role: unknown): role is StaffRole {
  return typeof role === "string" && (STAFF_ROLES as readonly string[]).includes(role);
}

export function isAdminRole(role: string | null | undefined): boolean {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}

/** Is `role` owner/admin or in `roles`? */
export function hasRole(role: string | null | undefined, roles: readonly string[]): boolean {
  if (!role || !isStaffRole(role)) return false;
  return isAdminRole(role) || roles.includes(role);
}

/** Mirror of public.staff_can_write(): any known staff role except readonly. Fail closed. */
export function canWrite(role: string | null | undefined): boolean {
  return isStaffRole(role) && role !== "readonly";
}

/** Write access to a domain = common write floor + domain roles. */
export function canWriteDomain(role: string | null | undefined, roles: readonly StaffRole[]): boolean {
  return canWrite(role) && hasRole(role, roles);
}

function matchPrefix(pathname: string): ProtectedRoute | null {
  let best: ProtectedRoute | null = null;
  for (const prefix of Object.keys(ROLE_ACCESS) as ProtectedRoute[]) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (!best || prefix.length > best.length) best = prefix;
    }
  }
  return best;
}

/** Can staff role `role` open `pathname`? (query string ignored) */
export function canAccessRoute(role: string | null | undefined, pathname: string): boolean {
  if (!isStaffRole(role)) return false;
  const path = pathname.split(/[?#]/)[0] ?? pathname;
  const prefix = matchPrefix(path);
  if (!prefix) return true;
  return hasRole(role, ROLE_ACCESS[prefix]);
}

export function filterNavForRole<I extends { href: string }, G extends { items: I[] }>(
  groups: G[],
  role: string | null | undefined,
): G[] {
  return groups
    .map((g) => ({ ...g, items: g.items.filter((item) => canAccessRoute(role, item.href)) }))
    .filter((g) => g.items.length > 0);
}

// --- Areas: staff back-office vs client portal ---------------------------------

export interface Membership {
  organization_id: string;
  role: OrgRole;
}

export interface AccessContext {
  userId: string;
  email: string | null;
  /** Current staff role (null when not staff or suspended — staff_role()). */
  staffRole: StaffRole | null;
  memberships: Membership[];
}

export type Area = "staff" | "portal";

export const STAFF_HOME = "/dashboard";
export const PORTAL_HOME = "/portal";
export const UNAUTHORIZED_PATH = "/unauthorized";
export const LOGIN_PATH = "/auth/login";

export function isStaff(ctx: Pick<AccessContext, "staffRole"> | null): boolean {
  return !!ctx && isStaffRole(ctx.staffRole);
}

export function isMember(ctx: Pick<AccessContext, "memberships"> | null): boolean {
  return !!ctx && ctx.memberships.length > 0;
}

/** Landing page after sign-in. Staff win over membership. */
export function resolveHome(ctx: AccessContext | null): string {
  if (!ctx) return LOGIN_PATH;
  if (isStaff(ctx)) return STAFF_HOME;
  if (isMember(ctx)) return PORTAL_HOME;
  return UNAUTHORIZED_PATH;
}

export type AreaDecision = { allow: true } | { allow: false; redirect: string };

/**
 * Guard for a route group: `(staff)` requires a non-suspended staff role,
 * `(portal)` requires at least one organization membership. Optional
 * `pathname` applies ROLE_ACCESS inside the staff area.
 */
export function decideArea(area: Area, ctx: AccessContext | null, pathname?: string): AreaDecision {
  if (!ctx) return { allow: false, redirect: LOGIN_PATH };
  if (area === "staff") {
    if (!isStaff(ctx)) return { allow: false, redirect: resolveHome(ctx) };
    if (pathname && !canAccessRoute(ctx.staffRole, pathname)) return { allow: false, redirect: STAFF_HOME };
    return { allow: true };
  }
  if (!isMember(ctx)) return { allow: false, redirect: resolveHome(ctx) };
  return { allow: true };
}

/** Is `next` a safe same-origin path to redirect to after login? */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  if (next.startsWith("/auth/")) return null;
  return next;
}
