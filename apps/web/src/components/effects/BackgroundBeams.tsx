import { cn } from "@/lib/utils";

interface BackgroundBeamsProps {
  className?: string;
}

/**
 * Decorative ambient background: soft blurred gradient orbs + a faint grid.
 * Pure CSS (no canvas, no per-frame JS) — animation only runs under
 * `motion-safe:` so prefers-reduced-motion is respected with zero JS.
 */
export function BackgroundBeams({ className }: BackgroundBeamsProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[120px] motion-safe:animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px] motion-safe:animate-float-slow-reverse" />
    </div>
  );
}
