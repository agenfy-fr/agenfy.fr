/**
 * Client "Accès" view: every person linked to a client organization, merged
 * from the address book (organization_contacts), the accounts
 * (organization_members, any role) and the training enrollments of the
 * organization. Pure module (unit-tested).
 */
import { isPortalRole, type OrgRole } from "./access-control";

export interface AccessContactInput {
  id: string;
  full_name: string | null;
  email: string | null;
  job_title: string | null;
  is_primary: boolean;
  user_id: string | null;
}

export interface AccessMemberInput {
  user_id: string;
  role: OrgRole;
  created_at: string;
}

export interface AccessEnrollmentInput {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  status: "active" | "completed" | "cancelled";
  progress_percent: number;
}

export interface AccessPerson {
  /** Stable key: user id when an account exists, else `contact:<id>`. */
  key: string;
  contactId: string | null;
  userId: string | null;
  name: string;
  email: string | null;
  jobTitle: string | null;
  isPrimary: boolean;
  /** organization_members.role, null = no account attached to this client. */
  role: OrgRole | null;
  portalAccess: boolean;
  enrollments: AccessEnrollmentInput[];
}

export function buildAccessPeople(
  contacts: AccessContactInput[],
  members: AccessMemberInput[],
  enrollments: AccessEnrollmentInput[],
  directory: Map<string, { email: string | null; full_name: string | null }>,
): AccessPerson[] {
  const byKey = new Map<string, AccessPerson>();
  const blank = (key: string): AccessPerson => ({
    key,
    contactId: null,
    userId: null,
    name: "",
    email: null,
    jobTitle: null,
    isPrimary: false,
    role: null,
    portalAccess: false,
    enrollments: [],
  });
  const forUser = (userId: string): AccessPerson => {
    let p = byKey.get(userId);
    if (!p) {
      p = { ...blank(userId), userId };
      byKey.set(userId, p);
    }
    return p;
  };

  for (const c of contacts) {
    const p = c.user_id ? forUser(c.user_id) : (() => {
      const created = blank(`contact:${c.id}`);
      byKey.set(created.key, created);
      return created;
    })();
    p.contactId ??= c.id;
    p.name ||= c.full_name?.trim() ?? "";
    p.email ??= c.email;
    p.jobTitle ??= c.job_title;
    p.isPrimary ||= c.is_primary;
  }
  for (const m of members) {
    const p = forUser(m.user_id);
    p.role = m.role;
    p.portalAccess = isPortalRole(m.role);
  }
  for (const e of enrollments) forUser(e.user_id).enrollments.push(e);

  for (const p of byKey.values()) {
    if (p.userId) {
      const u = directory.get(p.userId);
      p.email ??= u?.email ?? null;
      p.name ||= u?.full_name?.trim() ?? "";
    }
    p.name ||= p.email ?? "Sans nom";
    p.enrollments.sort((a, b) => a.course_title.localeCompare(b.course_title, "fr"));
  }

  const rank = (p: AccessPerson) =>
    p.role === "owner" ? 0 : p.role === "manager" ? 1 : p.role === "member" ? 2 : p.role === "learner" ? 3 : 4;
  return [...byKey.values()].sort(
    (a, b) => rank(a) - rank(b) || Number(b.isPrimary) - Number(a.isPrimary) || a.name.localeCompare(b.name, "fr"),
  );
}

/** Courses a person can still be given (not already active or completed). */
export function grantableCourseIds(person: Pick<AccessPerson, "enrollments">, publishedCourseIds: string[]): string[] {
  const busy = new Set(person.enrollments.filter((e) => e.status !== "cancelled").map((e) => e.course_id));
  return publishedCourseIds.filter((id) => !busy.has(id));
}
