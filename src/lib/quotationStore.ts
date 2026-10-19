'use client';

import { useSyncExternalStore } from 'react';

export type Priority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type RfqStatus = 'Draft' | 'Sent' | 'Received' | 'Approved';

export interface RfqItem { pid: string; name: string; sku: string; qty: number; target: number | null }
export interface Rfq {
  id: string;
  no: string;
  date: string; // YYYY-MM-DD
  expected: string;
  deadline: string;
  priority: Priority;
  note: string;
  suppliers: string[];
  items: RfqItem[];
  status: RfqStatus;
}

/** Live site e ekhon kono RFQ nei, tai empty. TODO: API. */
const seed: Rfq[] = [];
let rfqs = seed;
const subs = new Set<() => void>();
const set = (n: Rfq[]) => { rfqs = n; subs.forEach((f) => f()); };

export const useRfqs = () =>
  useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, () => rfqs, () => seed);

export const rfqActions = {
  add: (r: Omit<Rfq, 'id' | 'no'>) => set([{ ...r, id: `rfq${Date.now()}`, no: `RFQ-${String(rfqs.length + 1).padStart(4, '0')}` }, ...rfqs]),
  setStatus: (id: string, status: RfqStatus) => set(rfqs.map((r) => (r.id === id ? { ...r, status } : r))),
  remove: (id: string) => set(rfqs.filter((r) => r.id !== id)),
};
