import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Squelette de tableau/liste : même hauteur de ligne que DataTable (pas de saut). */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
  label = "Chargement",
}: Readonly<{ rows?: number; columns?: number; className?: string; label?: string }>) {
  return (
    <div className={cn("divide-y", className)} role="status" aria-busy="true" aria-label={label}>
      <div className="flex gap-4 bg-muted px-4 py-3">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-3 flex-1 bg-background/60" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} className={cn("h-4 flex-1", c === 0 && "flex-[2]")} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** État d'erreur de chargement : message clair + détail technique + action. */
export function ErrorState({
  title,
  description,
  action,
  className,
}: Readonly<{ title: string; description?: React.ReactNode; action?: React.ReactNode; className?: string }>) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center gap-1.5 p-8 text-center", className)}>
      <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="max-w-md break-words text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
