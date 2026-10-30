import { cn } from "@/lib/utils";

export function ProgressBar({ value, className, label }: { value: number; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-label={label ?? "Progression"}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
    >
      <div className="h-full rounded-full gradient-bg transition-[width] duration-500" style={{ width: `${v}%` }} />
    </div>
  );
}
