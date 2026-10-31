import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import type { Viewer } from "@/lib/auth";

export function SiteHeader({ viewer }: { viewer: Viewer | null }) {
  const links: { href: string; label: string }[] = viewer
    ? [
        { href: "/dashboard", label: "Mes formations" },
        ...(viewer.managedOrganizations.length > 0 ? [{ href: "/manager", label: "Mon équipe" }] : []),
        ...(viewer.staffRole ? [{ href: "/staff", label: "Espace formateur" }] : []),
      ]
    : [{ href: "/", label: "Catalogue" }];

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href={viewer ? "/dashboard" : "/"} className="flex items-center gap-2 shrink-0" aria-label="Agenfy Formation, accueil">
          <Image src="/logo-mark.svg" alt="" width={14} height={32} className="h-7 w-auto" priority />
          <span className="text-lg font-bold tracking-tight text-foreground">Agenfy</span>
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-muted-foreground border-l border-border pl-2">
            Formation
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="flex flex-1 items-center gap-1 overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {viewer ? (
            <>
              <Link
                href="/compte"
                className="hidden md:block max-w-40 truncate rounded-md px-2 py-2 text-sm text-muted-foreground hover:text-foreground"
                title={viewer.email}
              >
                {viewer.fullName || viewer.email}
              </Link>
              <form action="/auth/signout" method="post">
                <Button type="submit" variant="ghost" size="icon" aria-label="Se déconnecter">
                  <LogOut />
                </Button>
              </form>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-full gradient-btn border-0 text-white">
              <Link href="/login">Se connecter</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-border/60 mt-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Agenfy — marque de Hasfy SAS</p>
        <div className="flex flex-wrap gap-4">
          <a href="https://www.agenfy.fr" className="hover:text-foreground">
            agenfy.fr
          </a>
          <Link href="/verify" className="hover:text-foreground">
            Vérifier une attestation
          </Link>
          <a href="https://www.agenfy.fr/mentions-legales" className="hover:text-foreground">
            Mentions légales
          </a>
        </div>
      </div>
    </footer>
  );
}
