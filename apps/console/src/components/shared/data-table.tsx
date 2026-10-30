import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Primitives de tableau Console : en-tête collant (opaque), séparateurs,
 * survol, colonnes numériques alignées à droite en chiffres tabulaires.
 * Le conteneur borne la hauteur pour que l'en-tête reste visible au défilement.
 */
export function DataTable({
  children,
  className,
  maxHeight = "max-h-[min(70vh,720px)]",
  label,
}: Readonly<{ children: React.ReactNode; className?: string; maxHeight?: string | null; label?: string }>) {
  return (
    <div
      className={cn("relative w-full overflow-auto", maxHeight ?? undefined, className)}
      // Région défilante focusable au clavier (WCAG 2.1.1) quand elle est étiquetée.
      {...(label ? { role: "region", "aria-label": label, tabIndex: 0 } : {})}
    >
      <table className="w-full caption-bottom border-separate border-spacing-0 text-sm">{children}</table>
    </div>
  );
}

export function DataTableHead({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <thead className="sticky top-0 z-10 bg-muted text-left text-xs text-muted-foreground">
      {children}
    </thead>
  );
}

export function Th({
  children,
  numeric,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap border-b px-4 py-2.5 font-medium first:pl-4 last:pr-4",
        numeric && "text-right",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Tr({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("transition-colors hover:bg-muted/40 [&:not(:last-child)>td]:border-b", className)} {...props}>
      {children}
    </tr>
  );
}

export function Td({
  children,
  numeric,
  muted,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean; muted?: boolean }) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle",
        numeric && "whitespace-nowrap text-right tabular-nums",
        muted && "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}

/** Texte tronqué sur une ligne avec infobulle native (title) du texte complet. */
export function Truncate({
  children,
  title,
  className,
}: Readonly<{ children: React.ReactNode; title?: string | null; className?: string }>) {
  return (
    <span className={cn("block max-w-[16rem] truncate", className)} title={title ?? (typeof children === "string" ? children : undefined)}>
      {children}
    </span>
  );
}
