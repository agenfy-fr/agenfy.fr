"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";

interface CountUpProps {
  /** Full display value, e.g. "25+", "100%", "5 ans" — the leading number animates. */
  value: string;
  className?: string;
}

function parseValue(value: string): { prefix: string; number: number; suffix: string } {
  const match = value.match(/^(\D*)(\d+)(.*)$/);
  if (!match) return { prefix: "", number: 0, suffix: value };
  const [, prefix, digits, suffix] = match;
  return { prefix, number: Number(digits), suffix };
}

/**
 * Displays the real value at all times (SSR, no-JS, pre-hydration, and
 * before it scrolls into view all show e.g. "25+" — never a placeholder
 * "0", which crawlers and text extractors would otherwise pick up as the
 * real number). Once it scrolls into view, briefly animates down to 0 and
 * back up as a visual flourish on top of that already-correct text.
 */
export function CountUp({ value, className }: CountUpProps) {
  const { prefix, number, suffix } = parseValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 90 });

  useEffect(() => {
    if (isInView && !shouldReduceMotion) motionValue.set(number);
  }, [isInView, motionValue, number, shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) ref.current.textContent = `${prefix}${Math.round(latest)}${suffix}`;
    });
    return unsubscribe;
  }, [springValue, prefix, suffix, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
