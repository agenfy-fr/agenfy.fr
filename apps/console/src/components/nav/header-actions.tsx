"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const ORDER = ["system", "light", "dark"] as const;
const LABELS = { system: "Thème : système", light: "Thème : clair", dark: "Thème : sombre" } as const;

const subscribe = () => () => {};

export function HeaderActions() {
  const { theme, setTheme } = useTheme();
  // Avoid a hydration mismatch: the theme is only known on the client.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const current = (mounted ? theme : "system") as (typeof ORDER)[number];
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
  const Icon = current === "dark" ? Moon : current === "light" ? Sun : Monitor;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setTheme(next)}
        aria-label={`${LABELS[current] ?? LABELS.system} (changer)`}
        title={LABELS[current] ?? LABELS.system}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
