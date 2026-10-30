import { AppShell } from "@/components/nav/app-shell";
import { requireMemberPage } from "@/lib/server/auth";

/** Client portal: requires at least one organization membership. RLS scopes every query. */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, access } = await requireMemberPage();
  const orgIds = access.memberships.map((m) => m.organization_id);
  const [{ data: profile }, { data: orgs }] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle(),
    // Explicit filter: a staff member who is also a client must only see their own orgs here.
    supabase.from("organizations").select("name").in("id", orgIds).order("name"),
  ]);
  const orgNames = (orgs ?? []).map((o) => o.name as string);

  return (
    <AppShell
      variant="portal"
      subtitle={orgNames.join(" · ") || null}
      user={{
        email: user.email,
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
        roleLabel: "Espace client",
      }}
    >
      {children}
    </AppShell>
  );
}
