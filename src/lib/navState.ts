'use client';

import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';

/**
 * Click korar sathe sathe "pending" route set hoy (page load howar aagei),
 * jate sidebar-er active item, top progress bar ar content fade instantly dekhay.
 */
let pending: string | null = null;
const subs = new Set<() => void>();

export const setPending = (p: string | null) => {
  if (p === pending) return;
  pending = p;
  subs.forEach((f) => f());
};

export const usePending = () =>
  useSyncExternalStore(
    (cb) => { subs.add(cb); return () => { subs.delete(cb); }; },
    () => pending,
    () => null,
  );

/** Optimistic active path: pending thakle seta, na hole current pathname */
export function useActivePath() {
  const pathname = usePathname();
  const p = usePending();
  return p ? p.split(/[?#]/)[0] : pathname;
}
