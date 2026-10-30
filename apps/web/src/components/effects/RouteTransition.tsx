"use client";

import { AnimatePresence, motion, useReducedMotion, type Easing } from "motion/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const EASE_OUT_SOFT: Easing = [0.16, 1, 0.3, 1];
/** The logo stays visible at least this long, so fast navigations don't flicker. */
const MIN_VISIBLE_MS = 450;
/** Safety net: never leave the overlay up if a navigation is aborted. */
const MAX_VISIBLE_MS = 4000;

/** Set on the first client-side navigation: PageFade skips the initial load (LCP). */
export function hasNavigated(): boolean {
  return typeof window !== "undefined" && window.__agenfyNavigated === true;
}

declare global {
  interface Window {
    __agenfyNavigated?: boolean;
  }
}

function isInternalNavigation(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const anchor = (event.target as Element | null)?.closest?.("a");
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return null;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  // Same page (or only the hash changes): no transition.
  if (url.pathname === window.location.pathname) return null;
  return url.pathname;
}

/**
 * Full-screen veil with the Agenfy logo while the next page loads (internal
 * link clicks only). Not shown on the first load nor with reduced motion.
 */
export function RouteTransition() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;
    const onClick = (event: MouseEvent) => {
      if (!isInternalNavigation(event)) return;
      window.__agenfyNavigated = true;
      startedAt.current = Date.now();
      setActive(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [reduceMotion]);

  // New route rendered: lift the veil (after the minimum display time).
  useEffect(() => {
    if (!startedAt.current) return;
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt.current));
    const timer = window.setTimeout(() => setActive(false), wait);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setActive(false), MAX_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="route-transition"
          aria-hidden="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT_SOFT }}
        >
          <div className="relative flex items-center justify-center">
            <motion.span
              className="absolute size-28 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-2xl"
              animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.25, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT_SOFT }}
            >
              <Image src="/logo.svg" alt="" width={88} height={88} priority />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Wraps each page (app/template.tsx): soft fade-in after a client navigation. */
export function PageFade({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion || !hasNavigated()) return <>{children}</>;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT_SOFT }}>
      {children}
    </motion.div>
  );
}
