"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { Navbar } from "@/components/nav/navbar-vertical";
import { NavUser, type NavUserInfo } from "@/components/nav/nav-users";
import { CommandPalette, type CommandPaletteHandle } from "@/components/shell/command-palette";
import { filterNavForRole } from "@/lib/access-control";
import { navigationGroups, portalNavigationGroups } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  user: NavUserInfo;
  variant: "staff" | "portal";
  /** Portal: client organization name(s) shown under the logo. */
  subtitle?: string | null;
}

export default function AppSidebar({ user, variant, subtitle }: AppSidebarProps) {
  const { state } = useSidebar();
  const [logoHovered, setLogoHovered] = useState(false);
  const collapsed = state === "collapsed";
  const paletteRef = useRef<CommandPaletteHandle>(null);
  const isStaff = variant === "staff";
  const groups = isStaff ? filterNavForRole(navigationGroups, user.role) : portalNavigationGroups;
  const home = isStaff ? "/dashboard" : "/portal";

  return (
    <>
      {isStaff && <CommandPalette ref={paletteRef} groups={groups} />}
      <Sidebar className="border-r-0" side="left" collapsible="icon">
        <SidebarHeader className={cn("flex flex-col gap-3 p-5 pb-4", collapsed && "items-center justify-center p-3 pb-3")}>
          <div className="relative flex items-center justify-between">
            {!collapsed ? (
              <>
                <Link href={home} className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                    <Image src="/logo-mark.svg" alt="" width={15} height={32} className="h-8 w-auto" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-semibold leading-tight text-foreground">
                      Agenfy <span className="text-brand-gradient">{isStaff ? "Console" : "Client"}</span>
                    </span>
                    {subtitle && <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>}
                  </span>
                </Link>
                <SidebarTrigger className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100" />
              </>
            ) : (
              <div
                className="relative flex h-8 w-8 items-center justify-center"
                onMouseEnter={() => setLogoHovered(true)}
                onMouseLeave={() => setLogoHovered(false)}
                onFocus={() => setLogoHovered(true)}
                onBlur={() => setLogoHovered(false)}
              >
                <SidebarTrigger
                  className={cn("absolute inset-0 h-8 w-8 text-muted-foreground", !logoHovered && "opacity-0 focus-visible:opacity-100")}
                />
                {!logoHovered && (
                  <Image src="/logo-mark.svg" alt="" width={15} height={32} className="pointer-events-none h-8 w-auto" />
                )}
              </div>
            )}
          </div>

          {isStaff &&
            (!collapsed ? (
              <button
                type="button"
                onClick={() => paletteRef.current?.open()}
                aria-keyshortcuts="Meta+K Control+K"
                className="flex w-full items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1 text-left">Rechercher...</span>
                <kbd
                  aria-hidden="true"
                  className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex"
                >
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => paletteRef.current?.open()}
                aria-label="Rechercher (⌘K)"
                title="Rechercher (⌘K)"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
            ))}
        </SidebarHeader>

        <SidebarContent className={cn("overflow-x-hidden px-5", collapsed && "items-center px-3")}>
          <Navbar groups={groups} />
        </SidebarContent>

        <SidebarFooter className={cn("mt-auto p-5", collapsed && "items-center justify-center p-3")}>
          <NavUser user={user} settingsHref={isStaff ? "/settings" : "/account"} />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
