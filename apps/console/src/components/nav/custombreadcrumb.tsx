"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useBreadcrumbOverride, useBreadcrumbExtraValue } from "./breadcrumb-context";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Tableau de bord",
  leads: "Leads",
  clients: "Clients",
  projects: "Projets",
  tasks: "Tâches",
  requests: "Demandes",
  billing: "Facturation",
  quotes: "Devis",
  invoices: "Factures",
  team: "Équipe",
  settings: "Paramètres",
  portal: "Mon espace",
  documents: "Documents",
  new: "Nouveau",
  account: "Mon compte",
  blog: "Blog",
  preview: "Aperçu",
  training: "Formations",
  access: "Accès formation",
  lessons: "Leçons",
};

/** Intermediate segments without their own page.tsx: rendered as text targets. */
const NON_NAVIGABLE_SEGMENTS: Record<string, string> = {
  "/billing": "/billing/invoices",
  "/training/lessons": "/training",
};

function truncateId(segment: string): string | null {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(segment)) return segment.slice(0, 4) + "…";
  if (/^\d{6,}$/.test(segment)) return "#" + segment.slice(0, 4);
  return null;
}

function clamp(label: string, max: number): string {
  return label.length > max ? label.slice(0, max - 1).trimEnd() + "…" : label;
}

export function resolveHref(path: string): string {
  return NON_NAVIGABLE_SEGMENTS[path] ?? path;
}

const PAGE_TITLE_MAX = 48;
const CRUMB_MAX = 22;

export default function Breadcrumb() {
  const pathname = usePathname() ?? "";
  const segments = pathname.split("/").filter(Boolean);
  const override = useBreadcrumbOverride();
  const extra = useBreadcrumbExtraValue();

  const effectiveSegments = segments.map((seg, idx) => ({ seg, idx }));

  const crumbs = effectiveSegments.map(({ seg, idx }, i) => {
    const isLast = i === effectiveSegments.length - 1;
    const rawLabel = (isLast && override) || ROUTE_LABELS[seg] || truncateId(seg) || seg;
    return {
      label: clamp(rawLabel, CRUMB_MAX),
      fullLabel: rawLabel,
      href: resolveHref("/" + segments.slice(0, idx + 1).join("/")),
    };
  });

  // Client-side state (e.g. the active tab on a detail page) that doesn't
  // live in the URL still gets its own crumb, appended after the trail.
  if (extra) {
    crumbs.push({ label: clamp(extra, CRUMB_MAX), fullLabel: extra, href: pathname });
  }

  const pageTitle = clamp(crumbs[crumbs.length - 1]?.fullLabel ?? "Console", PAGE_TITLE_MAX);

  return (
    <div className="min-w-0">
      {/* Titre de la page : unique <h1> du shell (les pages n'en rendent pas d'autre). */}
      <h1
        className="text-foreground truncate text-2xl font-bold leading-tight tracking-tight sm:text-4xl sm:leading-none"
        title={crumbs[crumbs.length - 1]?.fullLabel}
      >
        {pageTitle}
      </h1>
      {crumbs.length > 1 && (
        <nav aria-label="Fil d'Ariane" className="mt-2 min-w-0">
          <ol className="flex min-w-0 items-center gap-1">
          {crumbs.map((crumb, i) => (
            <li key={`${crumb.href}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />}
              {i < crumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  title={crumb.fullLabel}
                  className="truncate text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" title={crumb.fullLabel} className="truncate text-sm text-muted-foreground">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
          </ol>
        </nav>
      )}
    </div>
  );
}
