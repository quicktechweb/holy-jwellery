'use client';

import { useSyncExternalStore } from 'react';

export interface SupplierRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  terms: string; // e.g. "30 days"
  contact: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  active: boolean;
  image?: string; // data URL (optional)
  createdAt: string; // ISO
}

/** Chhoto in-memory store. TODO: API call diye replace (GET/POST/PATCH/DELETE /suppliers). Screenshot e list faka, tai seed faka. */
const seed: SupplierRecord[] = [];
let list: SupplierRecord[] = seed;
const subs = new Set<() => void>();
const set = (next: SupplierRecord[]) => { list = next; subs.forEach((f) => f()); };

export const useSupplierRecords = () =>
  useSyncExternalStore(
    (cb) => { subs.add(cb); return () => { subs.delete(cb); }; },
    () => list,
    () => seed,
  );

export const supplierActions = {
  add: (s: SupplierRecord) => set([s, ...list]),
  update: (id: string, patch: Partial<SupplierRecord>) => set(list.map((s) => (s.id === id ? { ...s, ...patch } : s))),
  remove: (id: string) => set(list.filter((s) => s.id !== id)),
};
