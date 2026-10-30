"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface BreadcrumbContextValue {
  label: string | null;
  setLabel: (label: string | null) => void;
  extra: string | null;
  setExtra: (label: string | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState<string | null>(null);
  const [extra, setExtra] = useState<string | null>(null);
  return (
    <BreadcrumbContext.Provider value={{ label, setLabel, extra, setExtra }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

/**
 * Lets a dynamic-segment page (e.g. /blog/[id]) override the last breadcrumb
 * crumb with real data (an article title) instead of the raw id/slug.
 *
 * `undefined` means "this component doesn't manage the breadcrumb at all" —
 * it skips registering/clearing entirely, so a component nested inside a
 * parent that already owns the breadcrumb (e.g. BlogWizard rendered inside
 * a detail page's "Modifier" tab) can opt out without clobbering the
 * parent's value on mount/unmount. Pass `null` to actively clear it.
 */
export function useBreadcrumbLabel(label: string | undefined | null) {
  const ctx = useContext(BreadcrumbContext);

  useEffect(() => {
    if (!ctx || label === undefined) return;
    ctx.setLabel(label);
    return () => ctx.setLabel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);
}

/**
 * Appends a further, non-navigable crumb after the URL-derived trail —
 * for state that lives client-side (e.g. the active tab on a detail page)
 * rather than in the pathname. Same `undefined` opt-out semantics as above.
 */
export function useBreadcrumbExtra(label: string | undefined | null) {
  const ctx = useContext(BreadcrumbContext);

  useEffect(() => {
    if (!ctx || label === undefined) return;
    ctx.setExtra(label);
    return () => ctx.setExtra(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);
}

export function useBreadcrumbOverride(): string | null {
  const ctx = useContext(BreadcrumbContext);
  return ctx?.label ?? null;
}

export function useBreadcrumbExtraValue(): string | null {
  const ctx = useContext(BreadcrumbContext);
  return ctx?.extra ?? null;
}
