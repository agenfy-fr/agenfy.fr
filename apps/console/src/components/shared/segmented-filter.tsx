"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  count?: number | null;
}

/**
 * Filtre à boutons exclusifs (aria-pressed) : même rendu que les TabsList
 * (piste bg-muted, segment actif bg-background). Défile horizontalement en
 * mobile plutôt que de casser la mise en page.
 */
export function SegmentedFilter<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: Readonly<{
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
            {o.count != null && (
              <span
                className={cn(
                  "min-w-[1.25rem] rounded-full px-1.5 text-center text-[11px] tabular-nums",
                  active ? "bg-muted text-foreground" : "bg-background/70 text-muted-foreground",
                )}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
