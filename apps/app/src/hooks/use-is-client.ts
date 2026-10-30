"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns false during SSR and the initial client render, then true once
 * hydration has completed. Use to gate rendering that must match the server
 * on first paint (theme toggles, canvas/animation effects, etc.) without
 * calling setState inside an effect.
 */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
