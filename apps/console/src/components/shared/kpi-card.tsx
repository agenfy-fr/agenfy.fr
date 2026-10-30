import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type KpiTone = "default" | "ok" | "warn" | "error";

const TONE_CLASS: Record<KpiTone, string> = {
  default: "text-foreground",
  ok: "text-emerald-700 dark:text-emerald-400",
  warn: "text-amber-800 dark:text-amber-400",
  error: "text-red-700 dark:text-red-400",
};

export interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: KpiTone;
  loading?: boolean;
  className?: string;
}

/**
 * Tuile KPI — même gabarit que le tableau de bord (titre xs muted, valeur
 * 2xl, ligne d'aide optionnelle). À utiliser en grille `sm:grid-cols-2
 * lg:grid-cols-4` en tête de page.
 */
export function KpiCard({ label, value, hint, icon, tone = "default", loading, className }: KpiCardProps) {
  return (
    <Card className={cn("border-border/60", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
        {icon && <span className="text-muted-foreground [&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">{icon}</span>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className={cn("text-2xl font-bold tracking-tight tabular-nums", TONE_CLASS[tone])}>{value}</div>
        )}
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function KpiGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>{children}</div>;
}
