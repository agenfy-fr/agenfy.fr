"use client";

import { PageFade } from "@/components/effects";

/** Re-mounted on every navigation (unlike layout.tsx): page fade-in. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageFade>{children}</PageFade>;
}
