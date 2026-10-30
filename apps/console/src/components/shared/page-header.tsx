import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  /** Titre de section/page. Rendu en <h2> : le <h1> unique est le fil d'Ariane. */
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Boutons / filtres alignés à droite (repassent sous le titre en mobile). */
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  /** Niveau de titre : h2 pour une page, h3 pour une section d'onglet. */
  as?: "h2" | "h3";
  className?: string;
  id?: string;
}

/**
 * En-tête de page ou de section : titre, description courte, actions.
 * Même hiérarchie partout (titre lg semibold, description sm muted).
 */
export function PageHeader({ title, description, actions, icon, as: Heading = "h2", className, id }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground [&_svg]:h-4 [&_svg]:w-4"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 space-y-1">
          <Heading id={id} className={cn("font-semibold tracking-tight", Heading === "h2" ? "text-xl" : "text-base")}>
            {title}
          </Heading>
          {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
    </div>
  );
}
