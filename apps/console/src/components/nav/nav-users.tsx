"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/app/auth/actions";
import { initials } from "@/lib/format";

export interface NavUserInfo {
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  /** Human label for the role (e.g. "Consultant", "Client"). */
  roleLabel?: string | null;
}

export function NavUser({ user, settingsHref }: { user: NavUserInfo; settingsHref: string }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const short = initials(user.full_name, user.email);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                <AvatarImage src={user.avatar_url ?? undefined} alt="" />
                <AvatarFallback className="rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                  {short}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="flex min-w-0 flex-1 flex-col items-start">
                    <span className="max-w-[140px] truncate text-sm font-semibold text-foreground">
                      {user.full_name || user.email || "Utilisateur"}
                    </span>
                    <span className="max-w-[140px] truncate text-xs text-muted-foreground">{user.roleLabel ?? ""}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-col px-2 py-1.5">
                <p className="truncate text-sm font-medium">{user.full_name || "Utilisateur"}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={settingsHref}>
                <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                Mon compte
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={signOut}>
              <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
                <button type="submit" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  Se déconnecter
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
