/**
 * Server-side authentication and authorization helpers.
 *
 *  - Pages (Server Components): `requireStaffPage()` / `requireMemberPage()`
 *    redirect (login, portal, /unauthorized) instead of throwing.
 *  - Server actions / route handlers: `requireStaff()` / `requireStaffWriter()`
 *    / `requireStaffRole()` throw UnauthorizedError / ForbiddenError, turned
 *    into an error result by `runAction()` (lib/server/actions.ts).
 *
 * The staff role comes from public.staff_role() (0003: allowlist, suspended
 * accounts excluded) — never from user-editable metadata. Fail closed.
 * Staff privileges also require a session that passed 2FA (0004_staff_mfa):
 * until then `mfaPending` is true and pages redirect to /auth/mfa.
 */
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  canAccessRoute,
  canWrite,
  canWriteDomain,
  decideArea,
  isStaffRole,
  type AccessContext,
  type Membership,
  type StaffRole,
} from "@/lib/access-control";

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message = "Session expirée : reconnectez-vous.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Action non autorisée pour votre rôle.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export interface Session {
  supabase: SupabaseClient;
  user: User;
  access: AccessContext;
  /** Active staff member whose session has not passed the second factor yet. */
  mfaPending: boolean;
}

export const MFA_PATH = "/auth/mfa";

function mfaRedirect(next?: string): never {
  redirect(next ? `${MFA_PATH}?next=${encodeURIComponent(next)}` : MFA_PATH);
}

/** Load the current session + access context (memoized per request). */
export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const [roleRes, membersRes] = await Promise.all([
    supabase.rpc("staff_role"),
    supabase.from("organization_members").select("organization_id, role").eq("user_id", user.id),
  ]);

  // Fail closed: an RPC error means "not staff", a query error "no membership".
  const staffRole = !roleRes.error && isStaffRole(roleRes.data) ? (roleRes.data as StaffRole) : null;
  const memberships = membersRes.error ? [] : ((membersRes.data ?? []) as Membership[]);
  let mfaPending = false;
  if (!staffRole) {
    const pending = await supabase.rpc("staff_mfa_pending");
    mfaPending = !pending.error && pending.data === true;
  }

  return {
    supabase,
    user,
    access: { userId: user.id, email: user.email ?? null, staffRole, memberships },
    mfaPending,
  };
});

// --- Pages ------------------------------------------------------------------------

export interface StaffSession extends Session {
  role: StaffRole;
}

/** Staff area guard. `pathname` applies ROLE_ACCESS (e.g. "/billing"). */
export async function requireStaffPage(pathname?: string): Promise<StaffSession> {
  const session = await getSession();
  if (session?.mfaPending) mfaRedirect(pathname);
  const decision = decideArea("staff", session?.access ?? null, pathname);
  if (!decision.allow) redirect(decision.redirect);
  return { ...session!, role: session!.access.staffRole! };
}

/** Client portal guard: at least one organization membership. */
export async function requireMemberPage(): Promise<Session> {
  const session = await getSession();
  const decision = decideArea("portal", session?.access ?? null);
  if (!decision.allow && session?.mfaPending) mfaRedirect("/portal");
  if (!decision.allow) redirect(decision.redirect);
  return session!;
}

// --- Actions / route handlers -------------------------------------------------------

export async function requireStaff(): Promise<StaffSession> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  const role = session.access.staffRole;
  if (!role) {
    throw new ForbiddenError(
      session.mfaPending ? "Double authentification requise : validez votre code." : "Réservé à l'équipe Agenfy.",
    );
  }
  return { ...session, role };
}

/** Staff with a write-capable role (everything but readonly). */
export async function requireStaffWriter(): Promise<StaffSession> {
  const session = await requireStaff();
  if (!canWrite(session.role)) throw new ForbiddenError("Votre rôle est en lecture seule.");
  return session;
}

/** Staff writer whose role is in `roles` (owner/admin implicit). */
export async function requireStaffRole(roles: readonly StaffRole[]): Promise<StaffSession> {
  const session = await requireStaff();
  if (!canWriteDomain(session.role, roles)) throw new ForbiddenError();
  return session;
}

/** Staff allowed to open a section (ROLE_ACCESS), e.g. for read-only route handlers. */
export async function requireStaffSection(pathname: string): Promise<StaffSession> {
  const session = await requireStaff();
  if (!canAccessRoute(session.role, pathname)) throw new ForbiddenError();
  return session;
}

/** Signed-in user who is a member of `organizationId` (portal actions). */
export async function requireMemberOf(organizationId: string): Promise<Session> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  if (!session.access.memberships.some((m) => m.organization_id === organizationId)) {
    throw new ForbiddenError("Vous n'êtes pas membre de cette organisation.");
  }
  return session;
}
