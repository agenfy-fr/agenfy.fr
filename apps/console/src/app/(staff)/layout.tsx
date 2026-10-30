import { AppShell } from "@/components/nav/app-shell";
import { STAFF_ROLE_LABELS } from "@/lib/access-control";
import { requireStaffPage } from "@/lib/server/auth";

/** Staff back-office: requires a non-suspended row in public.staff. */
export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, role } = await requireStaffPage();
  const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle();

  return (
    <AppShell
      variant="staff"
      user={{
        email: user.email,
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
        role,
        roleLabel: STAFF_ROLE_LABELS[role],
      }}
    >
      {children}
    </AppShell>
  );
}
