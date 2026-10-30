import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  warning: {
    box: "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200",
    icon: AlertTriangle,
  },
  info: {
    box: "border-blue-500/40 bg-blue-500/10 text-blue-900 dark:text-blue-200",
    icon: Info,
  },
  success: {
    box: "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
    icon: CheckCircle2,
  },
  destructive: {
    box: "border-red-500/40 bg-red-500/10 text-red-900 dark:text-red-200",
    icon: XCircle,
  },
} as const;

export type CalloutTone = keyof typeof TONES;

/** Contextual banner (missing configuration, success, error…). */
export function Callout({
  tone = "warning",
  title,
  children,
  className,
}: Readonly<{ tone?: CalloutTone; title?: React.ReactNode; children?: React.ReactNode; className?: string }>) {
  const { box, icon: Icon } = TONES[tone];
  return (
    <div
      role={tone === "destructive" ? "alert" : undefined}
      className={cn("flex items-start gap-3 rounded-lg border px-4 py-3 text-sm", box, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 space-y-1 [&_code]:rounded [&_code]:bg-background/60 [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs">
        {title && <p className="font-medium">{title}</p>}
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
