'use client';

import { useSyncExternalStore } from 'react';
import { purchaseOrderSeed, type PurchaseOrder } from '@/data/purchase';

/** Chhoto in-memory store: New Purchase -> List -> Receive -> Ledger shobai ek data dekhe. TODO: API call diye replace. */
let orders: PurchaseOrder[] = purchaseOrderSeed;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const set = (next: PurchaseOrder[]) => { orders = next; emit(); };

export const usePurchaseOrders = () =>
  useSyncExternalStore(
    (cb) => { subs.add(cb); return () => { subs.delete(cb); }; },
    () => orders,
    () => purchaseOrderSeed,
  );

export const purchaseActions = {
  add: (o: PurchaseOrder) => set([o, ...orders]),
  update: (id: string, patch: Partial<PurchaseOrder>) => set(orders.map((o) => (o.id === id ? { ...o, ...patch } : o))),
  remove: (ids: string[]) => set(orders.filter((o) => !ids.includes(o.id))),
};
