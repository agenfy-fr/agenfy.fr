import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <header className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Image src="/logo.svg" alt="Agenfy" width={110} height={35} className="h-7 w-auto" />
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                Tableau de bord
              </Link>
              <Link href="/admin/leads" className="text-muted-foreground hover:text-foreground transition-colors">
                Leads
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm" className="rounded-full">
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
