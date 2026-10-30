import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StaffRole = "owner" | "admin" | "consultant" | "sales" | "trainer" | "readonly";

export interface Viewer {
  id: string;
  email: string;
  fullName: string;
  staffRole: StaffRole | null;
  /** Staff who may write (everyone but readonly). Mirrors is_training_staff(). */
  isTrainingStaff: boolean;
  managedOrganizations: { id: string; name: string }[];
  /**
   * Active staff member whose session has not passed 2FA yet: staff
   * privileges are withheld by RLS (0004_staff_mfa) until the code is verified.
   */
  mfaPending: boolean;
}

/** Current user + roles, memoized per request. null when signed out. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: staff }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("staff").select("role, suspended").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("organization_members")
      .select("role, organizations(id, name)")
      .eq("user_id", user.id)
      .in("role", ["owner", "manager"]),
  ]);

  const staffRole = staff && !staff.suspended ? (staff.role as StaffRole) : null;
  let mfaPending = false;
  if (!staffRole) {
    const pending = await supabase.rpc("staff_mfa_pending");
    mfaPending = !pending.error && pending.data === true;
  }
  const managedOrganizations = (memberships ?? []).flatMap((m) => {
    const org = m.organizations as unknown as { id: string; name: string } | null;
    return org ? [org] : [];
  });

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: (profile?.full_name as string | null)?.trim() || "",
    staffRole,
    isTrainingStaff: staffRole !== null && staffRole !== "readonly",
    managedOrganizations,
    mfaPending,
  };
});

export async function requireViewer(next = "/dashboard"): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(next)}`);
  // 2FA is mandatory for staff, on every page of the platform.
  if (viewer.mfaPending) redirect(`/login/mfa?next=${encodeURIComponent(next)}`);
  return viewer;
}

export async function requireStaff(): Promise<Viewer> {
  const viewer = await requireViewer("/staff");
  if (!viewer.staffRole) redirect("/dashboard");
  return viewer;
}

export async function requireManager(): Promise<Viewer> {
  const viewer = await requireViewer("/manager");
  if (viewer.managedOrganizations.length === 0 && !viewer.staffRole) redirect("/dashboard");
  return viewer;
}
