'use client';

import { useSyncExternalStore } from 'react';
import { purchaseActions } from '@/lib/purchaseStore';
import { QUICK_SUPPLIER } from '@/data/purchase';

export interface ReceiptLog { at: string; good: number; damaged: number; note: string }
export interface ReceiveLine {
  id: string;
  orderId?: string; // linked Purchase List order (jodi thake)
  date: string; // ISO local
  supplier: string;
  item: string;
  ordered: number;
  received: number;
  damaged: number; // damaged + missing
  history: ReceiptLog[];
}

export const remaining = (l: ReceiveLine) => Math.max(l.ordered - l.received - l.damaged, 0);
export const receiveStatus = (l: ReceiveLine): 'Pending' | 'Partial' | 'Received' =>
  remaining(l) === 0 ? 'Received' : l.received + l.damaged > 0 ? 'Partial' : 'Pending';

const L = (id: string, date: string, item: string, ordered: number, orderId?: string): ReceiveLine => ({
  id, orderId, date, supplier: QUICK_SUPPLIER, item, ordered, received: 0, damaged: 0, history: [],
});

/** TODO: API (pending purchase lines). Screenshot er 11 ta row hubohu. */
const seed: ReceiveLine[] = [
  L('r1', '2026-01-04T21:37', 'butterflay nacklace777', 49927, 'o2'),
  L('r2', '2025-12-05T10:24', 'Black cup set', 100, 'o3'),
  L('r3', '2025-12-05T10:16', 'Winter cup combo', 20, 'o4'),
  L('r4', '2025-12-01T16:17', 'Butterfly nacklace', 600, 'o5'),
  L('r5', '2025-12-01T11:16', 'Butterfly nacklace', 600, 'o6'),
  L('r6', '2025-11-26T12:00', 'Benny chain', 100),
  L('r7', '2025-11-14T16:17', 'Korean nacklace', 2800),
  L('r8', '2025-11-13T18:42', 'rotate necklace', 300),
  L('r9', '2025-11-13T18:42', 'Bracelet for female', 100),
  L('r10', '2025-11-13T18:42', 'Bracelet black', 100),
  L('r11', '2025-11-13T18:42', 'Korian top Earring', 120),
];

let lines: ReceiveLine[] = seed;
const subs = new Set<() => void>();
const set = (next: ReceiveLine[]) => { lines = next; subs.forEach((f) => f()); };

export const useReceiveLines = () =>
  useSyncExternalStore(
    (cb) => { subs.add(cb); return () => { subs.delete(cb); }; },
    () => lines,
    () => seed,
  );

export const receiveActions = {
  /** good = stock e jabe, damaged = shudhu log hobe (stock e jabe na). */
  receive: (id: string, good: number, damaged: number, note: string) => {
    const next = lines.map((l) => {
      if (l.id !== id) return l;
      const u: ReceiveLine = {
        ...l, received: l.received + good, damaged: l.damaged + damaged,
        history: [{ at: new Date().toISOString(), good, damaged, note }, ...l.history],
      };
      // TODO: API – good qty stock e add + damaged/missing log
      if (u.orderId && remaining(u) === 0) purchaseActions.update(u.orderId, { receive: 'Received' });
      return u;
    });
    set(next);
  },
};
