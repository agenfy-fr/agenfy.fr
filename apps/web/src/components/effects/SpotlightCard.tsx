"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card with a soft radial highlight that follows the pointer on hover.
 * Pointer-only effect — there is no motion to reduce for touch/keyboard use.
 */
export function SpotlightCard({ children, className }: SpotlightCardProps) {
  const [opacity, setOpacity] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, color-mix(in srgb, var(--primary) 15%, transparent), transparent 80%)`;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 transition-colors hover:border-primary/30",
        className
      )}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{ background, opacity }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
