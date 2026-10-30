"use client";

import { useBreadcrumbLabel } from "./breadcrumb-context";

/** Lets a Server Component page name its last breadcrumb (e.g. a client name instead of its UUID). */
export function BreadcrumbLabel({ label }: { label: string | null }) {
  useBreadcrumbLabel(label);
  return null;
}
