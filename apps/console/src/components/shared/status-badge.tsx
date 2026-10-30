import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        success:
          "border-emerald-200/60 bg-emerald-500/10 text-emerald-800 dark:border-emerald-800/60 dark:text-emerald-400",
        destructive:
          "border-red-200/60 bg-red-500/10 text-red-700 dark:border-red-800/60 dark:text-red-400",
        warning:
          "border-orange-200/60 bg-orange-500/10 text-orange-800 dark:border-orange-800/60 dark:text-orange-400",
        caution:
          "border-amber-200/60 bg-amber-500/10 text-amber-800 dark:border-amber-800/60 dark:text-amber-400",
        info:
          "border-blue-200/60 bg-blue-500/10 text-blue-700 dark:border-blue-800/60 dark:text-blue-400",
        purple:
          "border-purple-200/60 bg-purple-500/10 text-purple-700 dark:border-purple-800/60 dark:text-purple-400",
        neutral:
          "border-border/60 bg-muted/70 text-muted-foreground",
      },
      size: {
        sm: "px-2 py-px text-[11px]",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
);

const dotVariants: Record<string, string> = {
  success: "bg-emerald-500",
  destructive: "bg-red-500",
  warning: "bg-orange-500",
  caution: "bg-amber-500",
  info: "bg-blue-500",
  purple: "bg-purple-500",
  neutral: "bg-muted-foreground",
};

export type StatusBadgeVariant = NonNullable<VariantProps<typeof statusBadgeVariants>["variant"]>;

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  label: React.ReactNode;
  showDot?: boolean;
  icon?: React.ReactNode;
}

export function StatusBadge({
  label,
  variant = "neutral",
  size = "default",
  showDot = false,
  icon,
  className,
  ...props
}: StatusBadgeProps) {
  const activeVariant = variant ?? "neutral";
  const dotColor = dotVariants[activeVariant] ?? dotVariants.neutral;

  return (
    <span
      className={cn(statusBadgeVariants({ variant: activeVariant, size }), className)}
      {...props}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotColor)}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </span>
  );
}
