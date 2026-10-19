'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CalendarDays, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { longDate } from './format';

/** Home > Purchase > Page */
export function Breadcrumb({ page }: { page: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-ed-text/70 flex items-center gap-2 text-[13px]">
      <Link href="/dashboard" className="hover:text-ed-brand">Home</Link>
      <ChevronRight className="size-3" />
      <Link href="/dashboard/purchase/dashboard" className="hover:text-ed-brand">Purchase</Link>
      <ChevronRight className="size-3" />
      <span className="text-ed-text">{page}</span>
    </nav>
  );
}

export function PageHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="mt-3 text-[28px] leading-tight font-medium tracking-tight">{title}</h1>
        {sub && <p className="text-ed-text/65 mt-1 text-[14px]">{sub}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </header>
  );
}

/** Label-er niche select (filter card er jonno) */
export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="text-ed-text/80 mb-1.5 block text-[12px]">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  'border-ed-line placeholder:text-ed-muted focus:border-ed-brand/40 focus:ring-ed-brand/10 h-10 w-full rounded-lg border bg-[#fbfafd] px-3 text-[13.5px] transition outline-none focus:ring-2';

export function SelectBox({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <div className="relative">
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, 'cursor-pointer appearance-none bg-white pr-9')}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
    </div>
  );
}

export interface Range { from: string; to: string }

const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export function DateRangeInput({ value, onChange }: { value: Range | null; onChange: (r: Range | null) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Range>(value ?? { from: '', to: '' });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', down);
    window.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); window.removeEventListener('keydown', key); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => { setDraft(value ?? { from: '', to: '' }); setOpen((o) => !o); }}
        className={cn(inputCls, 'flex items-center justify-between text-left', open && 'border-ed-brand/40 ring-ed-brand/10 ring-2')}>
        <span className={cn('truncate', !value && 'text-ed-muted')}>{value ? `${fmt(value.from)} – ${fmt(value.to)}` : 'Pick a date range'}</span>
        <CalendarDays className="text-ed-muted size-4 shrink-0" />
      </button>
      {open && (
        <div className="border-ed-line absolute top-full left-0 z-30 mt-1.5 w-[300px] rounded-xl border bg-white p-4 shadow-[0_12px_32px_rgba(30,20,50,0.16)]">
          <div className="grid grid-cols-2 gap-3">
            <Field label="From"><input type="date" value={draft.from} max={draft.to || undefined} onChange={(e) => setDraft({ ...draft, from: e.target.value })} className={inputCls} /></Field>
            <Field label="To"><input type="date" value={draft.to} min={draft.from || undefined} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className={inputCls} /></Field>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => { onChange(null); setOpen(false); }} className="border-ed-line hover:text-ed-brand h-9 rounded-lg border px-3.5 text-[13px]">Clear</button>
            <button type="button" disabled={!draft.from || !draft.to} onClick={() => { onChange(draft); setOpen(false); }}
              className="bg-ed-brand h-9 rounded-lg px-3.5 text-[13px] font-medium text-white disabled:opacity-50">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Badge({ tone, children }: { tone: 'green' | 'red' | 'amber'; children: ReactNode }) {
  const t = {
    green: 'border-[#b7ebd0] bg-[#e8f8f0] text-[#0f9d58]',
    red: 'border-[#f8c9cf] bg-[#fdecee] text-[#e5243b]',
    amber: 'border-[#f6dca8] bg-[#fdf4e0] text-[#b7791f]',
  }[tone];
  return <span className={cn('inline-block rounded-full border px-3 py-0.5 text-[12px] font-medium', t)}>{children}</span>;
}

/** "October 18th, 2026" / "Pick a date" — native picker overlay */
export function DateField({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-ed-text/85 mb-2 block text-[13px]">{label}{required && ' *'}</span>
      <div className="relative">
        <div className={cn(inputCls, 'flex h-[42px] items-center gap-3 bg-[#f9f8fb] text-[14px]', !value && 'text-ed-muted')}>
          <CalendarDays className="text-ed-text/70 size-4" />
          <span suppressHydrationWarning>{value ? longDate(value) : 'Pick a date'}</span>
        </div>
        <input type="date" value={value} onChange={(e) => onChange(e.target.value)} onClick={(e) => e.currentTarget.showPicker?.()} aria-label={label} className="absolute inset-0 cursor-pointer opacity-0" />
      </div>
    </label>
  );
}
