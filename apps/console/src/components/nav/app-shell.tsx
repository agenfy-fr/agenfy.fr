import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/nav/sidebar";
import Breadcrumb from "@/components/nav/custombreadcrumb";
import { HeaderActions } from "@/components/nav/header-actions";
import { BreadcrumbProvider } from "@/components/nav/breadcrumb-context";
import type { NavUserInfo } from "@/components/nav/nav-users";

/** Shared shell (sidebar + header + main) for the staff and portal areas. */
export function AppShell({
  user,
  variant,
  subtitle,
  children,
}: {
  user: NavUserInfo;
  variant: "staff" | "portal";
  subtitle?: string | null;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <BreadcrumbProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Aller au contenu principal
        </a>
        <AppSidebar user={user} variant={variant} subtitle={subtitle} />
        <div className="flex h-screen min-w-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:px-12">
          <header className="mb-6 flex w-full min-w-0 items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <SidebarTrigger className="mt-1 h-9 w-9 shrink-0 md:hidden" />
              <Breadcrumb />
            </div>
            <HeaderActions />
          </header>
          <main
            id="main-content"
            tabIndex={-1}
            className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden focus:outline-none"
          >
            {children}
          </main>
        </div>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
}
