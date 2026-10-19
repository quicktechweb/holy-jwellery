'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FollowUpPriority } from '@/components/followups/AssignFollowUpsModal';

export const FU_EMPLOYEES = [
  { name: 'Md. Eamin', email: 'sumayasafa626@gmail.com' },
  { name: 'mahima N', email: 'ontora2029@gmail.com' },
  { name: 'Smita E', email: 'smita2027@gmail.com' },
  { name: 'Shakib N', email: 'sakib2027@gmail.com' },
];

export type Progress = 'Pending' | 'In Progress' | 'Completed';

export interface FuCustomer {
  id: string; order: string; name: string; mobile: string;
  status: 'Delivered' | 'Rts'; products: string; amount: number; date: string;
}
export interface Assignment {
  customerId: string; employee: string; priority: FollowUpPriority; note: string;
  assignedAt: string; progress: Progress; times: number; relationshipOwner: boolean;
  /** Customer Report filter fields (call outcome tags etc). TODO: Agent Cockpit save korle ekhane likhbe */
  meta?: Record<string, string>; negative?: boolean; scheduledAt?: string;
}
export interface Audience { id: string; name: string; customerIds: string[]; createdAt: string }
export interface CallScript { id: string; name: string; target: string; body: string; active: boolean }

const P = 'korean leaf nacklace with 2 gift';
const c = (n: number, name: string, mobile: string, status: FuCustomer['status'], amount: number, date = '2026-10-17'): FuCustomer =>
  ({ id: `EH-${n}`, order: `EH-${n}`, name, mobile, status, products: P, amount, date });

/** TODO: API. Ekhane seed data, real e /customer/customer-segments theke ashbe */
export const FU_CUSTOMERS: FuCustomer[] = [
  c(16798, '699 MD Rubel Hosen', '01796601124', 'Delivered', 650),
  c(16797, 'Imran', '01700659905', 'Rts', 699),
  c(16796, 'Mohammad Abul Kashem', '01711120532', 'Rts', 699),
  c(16795, 'Yasin', '01884646500', 'Rts', 699),
  c(16794, '997 সুবাস চন্দ্র রায়', '01322746926', 'Rts', 900),
  c(16793, 'Kajol', '01831273809', 'Rts', 699),
  c(16792, 'জুবায়ের হাসান', '01326182443', 'Rts', 699),
  c(16791, 'জামশেদ.', '01892064393', 'Delivered', 699),
  c(16790, 'Protap mondal', '01617643338', 'Rts', 699),
  c(16789, 'Zamir', '01600667494', 'Rts', 699, '2026-10-16'),
];
export const FU_TOTAL = 16257;

interface State { assignments: Assignment[]; audiences: Audience[]; scripts: CallScript[] }
const KEY = 'ed.followups.v1';
const empty: State = { assignments: [], audiences: [], scripts: [] };
const EVT = 'ed-followups';

const read = (): State => {
  try { const r = window.localStorage.getItem(KEY); return r ? { ...empty, ...JSON.parse(r) } : empty; } catch { return empty; }
};

export function useFollowUps() {
  const [s, setS] = useState<State>(empty);
  useEffect(() => {
    const sync = () => setS(read());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener('storage', sync); };
  }, []);
  const commit = useCallback((fn: (p: State) => State) => {
    const next = fn(read());
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
    window.dispatchEvent(new Event(EVT));
  }, []);

  const assign = (ids: string[], p: { employee: string; priority: FollowUpPriority; note: string; relationshipOwner: boolean }) =>
    commit((st) => {
      const now = new Date().toISOString().slice(0, 10);
      const prev = new Map(st.assignments.map((a) => [a.customerId, a]));
      ids.forEach((id) => prev.set(id, { customerId: id, ...p, assignedAt: now, progress: 'Pending', times: (prev.get(id)?.times ?? 0) + 1 }));
      return { ...st, assignments: [...prev.values()] };
    });
  const setProgress = (id: string, progress: Progress) =>
    commit((st) => ({ ...st, assignments: st.assignments.map((a) => (a.customerId === id ? { ...a, progress } : a)) }));
  const addAudience = (name: string, customerIds: string[]) =>
    commit((st) => ({ ...st, audiences: [{ id: `aud-${Date.now()}`, name, customerIds, createdAt: new Date().toISOString().slice(0, 10) }, ...st.audiences] }));
  const addToAudience = (id: string, customerIds: string[]) =>
    commit((st) => ({ ...st, audiences: st.audiences.map((a) => (a.id === id ? { ...a, customerIds: [...new Set([...a.customerIds, ...customerIds])] } : a)) }));
  const saveScript = (sc: Omit<CallScript, 'id'>) => commit((st) => ({ ...st, scripts: [{ id: `sc-${Date.now()}`, ...sc }, ...st.scripts] }));
  const removeScript = (id: string) => commit((st) => ({ ...st, scripts: st.scripts.filter((x) => x.id !== id) }));

  return { ...s, assign, setProgress, addAudience, addToAudience, saveScript, removeScript };
}
