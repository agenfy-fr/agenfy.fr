"use client";

import { motion, useReducedMotion, useScroll, useTransform, type Easing } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const EASE_OUT_SOFT: Easing = [0.16, 1, 0.3, 1];

interface IllustrationFrameProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

/** Rounded frame with a soft brand glow, fade-in and a light parallax on scroll. */
export function IllustrationFrame({ src, alt, width, height, priority, className }: IllustrationFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [24, -24]);

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      initial={reduceMotion || priority ? false : { opacity: 0, y: 32, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: EASE_OUT_SOFT }}
    >
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-3xl"
      />
      <div className="relative overflow-hidden rounded-3xl border border-border/40 shadow-2xl shadow-primary/10">
        <motion.div style={reduceMotion ? undefined : { y }} className="scale-[1.06]">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="h-auto w-full"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
