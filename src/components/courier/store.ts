'use client';

import { useCallback, useState } from 'react';
import { problemTagNames, SOLVED } from '@/data/courierTags';
import type { Parcel } from '@/data/courier';

export const OUTCOMES = ['Connected', 'No Answer', 'Busy', 'Switched Off', 'Wrong Number'] as const;
export type Outcome = (typeof OUTCOMES)[number];
export const SLOTS = ['Morning 10AM', 'Morning 1PM', 'Evening 4PM', 'Evening 7PM', 'Ad-hoc'] as const;
export type Slot = (typeof SLOTS)[number];
export type Target = 'customer' | 'rider';
export type CallMap = Partial<Record<Slot, Outcome>>;
export interface HistoryItem { id: number; kind: 'TAG' | 'CALL' | 'CHARGE' | 'NOTE'; text: string; by: string; at: number }

export const ME = 'Smita E';
export const people = ['mahima N', 'Md. Eamin', 'Shakib N', 'Smita E'];
export const outcomeColor: Record<Outcome, string> = { Connected: '#22c55e', 'No Answer': '#ef4444', Busy: '#eab308', 'Switched Off': '#64748b', 'Wrong Number': '#f97316' };

let seq = 1;

export function useParcelStore() {
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [charge, setCharge] = useState<Record<string, string>>({});
  const [calls, setCalls] = useState<Record<string, Record<Target, CallMap>>>({});
  const [hist, setHist] = useState<Record<string, HistoryItem[]>>({});

  const log = useCallback((ids: string[], kind: HistoryItem['kind'], text: string) => {
    setHist((h) => {
      const n = { ...h };
      ids.forEach((id) => { n[id] = [{ id: seq++, kind, text, by: ME, at: Date.now() }, ...(n[id] ?? [])]; });
      return n;
    });
  }, []);

  const tagsOf = (p: Parcel) => tags[p.id] ?? p.tags;
  const chargeOf = (p: Parcel) => (p.id in charge ? charge[p.id] || '-' : p.inCharge);
  const callsOf = (id: string, t: Target): CallMap => calls[id]?.[t] ?? {};

  /** mode: toggle (single), add, remove, replace (bulk) */
  const editTags = (ps: Parcel[], tag: string, mode: 'toggle' | 'add' | 'remove' | 'replace') => {
    setTags((cur) => {
      const n = { ...cur };
      ps.forEach((p) => {
        const has = (n[p.id] ?? p.tags).includes(tag);
        const base = n[p.id] ?? p.tags;
        if (mode === 'replace') n[p.id] = [tag];
        else if (mode === 'remove' || (mode === 'toggle' && has)) n[p.id] = base.filter((t) => t !== tag);
        else if (!has) n[p.id] = [...base, tag];
      });
      return n;
    });
    ps.forEach((p) => {
      const has = tagsOf(p).includes(tag);
      const text = mode === 'replace' ? `Replaced tags with ${tag}` : mode === 'remove' || (mode === 'toggle' && has) ? `Removed ${tag}` : `Added ${tag}`;
      log([p.id], 'TAG', text);
    });
  };

  const resolveProblems = (p: Parcel) => {
    setTags((cur) => {
      const base = cur[p.id] ?? p.tags;
      return { ...cur, [p.id]: [...base.filter((t) => !problemTagNames.includes(t) && t !== SOLVED), SOLVED] };
    });
    log([p.id], 'TAG', `Added ${SOLVED}`);
  };

  const setInCharge = (ids: string[], who: string) => {
    setCharge((c) => { const n = { ...c }; ids.forEach((id) => (n[id] = who)); return n; });
    log(ids, 'CHARGE', who ? `Put in ${who}'s charge` : 'Cleared in-charge');
  };

  const recordCall = (id: string, target: Target, slot: Slot, outcome: Outcome, note: string) => {
    setCalls((c) => ({ ...c, [id]: { customer: c[id]?.customer ?? {}, rider: c[id]?.rider ?? {}, [target]: { ...(c[id]?.[target] ?? {}), [slot]: outcome } } }));
    log([id], 'CALL', `${target === 'customer' ? 'Customer' : 'Rider'} call · ${slot} · ${outcome}${note ? ` — ${note}` : ''}`);
  };

  const addNote = (id: string, text: string) => log([id], 'NOTE', text);

  return { tagsOf, chargeOf, callsOf, hist, editTags, resolveProblems, setInCharge, recordCall, addNote };
}
export type ParcelStore = ReturnType<typeof useParcelStore>;
