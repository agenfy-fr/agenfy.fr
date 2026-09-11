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
 * Animates a stat's leading number up from 0 once it scrolls into view.
 * Renders the final value immediately under prefers-reduced-motion.
 */
export function CountUp({ value, className }: CountUpProps) {
  const { prefix, number, suffix } = parseValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 90 });

  useEffect(() => {
    if (isInView) motionValue.set(number);
  }, [isInView, motionValue, number]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) ref.current.textContent = `${prefix}${Math.round(latest)}${suffix}`;
    });
    return unsubscribe;
  }, [springValue, prefix, suffix, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
