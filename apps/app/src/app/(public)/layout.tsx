import { SiteFooter, SiteHeader } from "@/components/site-header";
import { getViewer } from "@/lib/auth";
import { getSupabaseEnv } from "@/lib/supabase/env";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const viewer = getSupabaseEnv() ? await getViewer() : null;
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader viewer={viewer} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
