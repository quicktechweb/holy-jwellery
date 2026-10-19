'use client';

import type { ReactNode } from 'react';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

export const card = 'border-ed-line rounded-xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)]';
export type Lang = 'en' | 'bn';

/** TODO: API — real work items (invoice, customer, phone, reason, source, due …) */
export interface WorkItem {
  id: string;
  title: string;
  customer: string;
  phone: string;
  reason: string;
  source: string;
  business: string;
  status: 'open' | 'progress' | 'done';
  due: string; // yyyy-mm-dd
  urgent?: boolean;
  assignee?: string;
}
export const WORK_ITEMS: WorkItem[] = [];

export function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="border-ed-line flex items-center gap-1 rounded-xl border bg-white p-1 shadow-sm">
      <Languages className="text-ed-muted mx-2 size-4" />
      {([['en', 'English'], ['bn', 'Bangla']] as const).map(([k, l]) => (
        <button key={k} type="button" onClick={() => onChange(k)} className={cn('h-9 rounded-lg px-4 text-[14.5px] font-medium transition-colors', lang === k ? 'bg-ed-brand text-white' : 'text-ed-text hover:bg-ed-bg')}>{l}</button>
      ))}
    </div>
  );
}

export function Stat({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) {
  return (
    <div className={cn(card, 'flex items-start justify-between p-4')}>
      <div>
        <p className="text-ed-text/80 text-[15px]">{label}</p>
        <p className="mt-1 text-[28px] leading-tight font-medium">{value}</p>
      </div>
      <span className="text-ed-text/70 mt-1">{icon}</span>
    </div>
  );
}

export const chip = (on: boolean) =>
  cn('h-10 rounded-lg border px-3.5 text-[14.5px] transition-colors', on ? 'bg-ed-brand border-ed-brand text-white' : 'border-ed-line hover:bg-ed-bg/70 bg-white');
