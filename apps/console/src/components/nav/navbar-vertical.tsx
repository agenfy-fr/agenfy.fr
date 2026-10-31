"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavGroup } from "@/lib/navigation";

/** `groups` are already filtered for the current role (see AppSidebar). */
export function Navbar({ groups }: { groups: NavGroup[] }) {
  const NAV_GROUPS = groups;
  const allItems = NAV_GROUPS.flatMap((g) => g.items);
  const pathname = usePathname() ?? "";
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(NAV_GROUPS.map((g) => [g.label, true]))
  );

  const isActive = (href: string) =>
    pathname === href ||
    (pathname.startsWith(href + "/") &&
      !allItems.some(
        (other) =>
          other.href !== href &&
          other.href.startsWith(href + "/") &&
          (pathname === other.href || pathname.startsWith(other.href + "/"))
      ));

  const toggle = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <nav aria-label="Navigation principale" className="flex flex-col">
      {NAV_GROUPS.map((group, gi) => (
        <div key={group.label}>
          {collapsed ? (
            gi > 0 && <SidebarSeparator className="my-1" />
          ) : (
            <button
              type="button"
              onClick={() => toggle(group.label)}
              aria-expanded={!!openGroups[group.label]}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 mt-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <span className="text-xs font-medium text-sidebar-foreground/70 group-hover:text-sidebar-foreground transition-colors">
                {group.label}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "h-3.5 w-3.5 text-sidebar-foreground/50 transition-transform duration-200",
                  !openGroups[group.label] && "-rotate-90"
                )}
              />
            </button>
          )}

          {(collapsed || openGroups[group.label]) && (
            <SidebarMenu className="gap-0.5 mt-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={cn(
                        "h-8 rounded-md transition-colors",
                        active
                          ? "bg-foreground/10 font-semibold text-foreground hover:bg-foreground/10 hover:text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        // The mobile drawer lives in the shared layout: close it on navigation.
                        onClick={() => isMobile && setOpenMobile(false)}
                      >
                        <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          )}
        </div>
      ))}
    </nav>
  );
}
