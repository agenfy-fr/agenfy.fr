"use client";

import { motion, useReducedMotion, type Easing } from "motion/react";
import type { ReactNode } from "react";

const EASE_OUT_SOFT: Easing = [0.16, 1, 0.3, 1];

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in seconds — pass index * 0.1 for a group. */
  delay?: number;
  /** Vertical offset (px) the content travels in from. */
  y?: number;
  className?: string;
}

/**
 * Scroll-triggered fade/translate-in. Renders children immediately, with no
 * transition, when the viewer has requested reduced motion.
 */
export function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT_SOFT }}
    >
      {children}
    </motion.div>
  );
}
