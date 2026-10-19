'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const card = 'border-ed-line rounded-2xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]';
export const lbl = 'mb-1.5 block text-[14px] font-medium';
export const field =
  'h-10 w-full rounded-lg border border-ed-line bg-[#f7f7fa] px-3 text-[14px] text-ed-text placeholder:text-ed-muted/70 outline-none transition focus:border-ed-brand/40 focus:bg-white focus:ring-2 focus:ring-ed-brand/10';

export function Section({
  title,
  subtitle,
  right,
  children,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(card, 'overflow-hidden', className)}>
      <header className="border-ed-line flex flex-wrap items-center justify-between gap-3 border-b px-6 py-[18px] max-sm:px-4">
        <div>
          <h2 className="text-[24px] leading-tight font-medium tracking-tight">{title}</h2>
          {subtitle && <p className="text-ed-muted mt-1 text-[14px]">{subtitle}</p>}
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

export function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        className={cn(field, 'appearance-none pr-9')}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
    </div>
  );
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const shown = value.slice(0, 3);
  const more = value.length - shown.length;
  const remove = (o: string) => onChange(value.filter((v) => v !== o));
  const chip = 'border-ed-line flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-0.5 text-[13px]';
  return (
    <div ref={ref} className="relative">
      <div
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen((o) => !o)}
        className="border-ed-line flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg border bg-[#f7f7fa] py-1.5 pr-2 pl-3 text-[14px]"
      >
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {value.length === 0 && <span className="text-ed-text/80 truncate">{placeholder}</span>}
          {shown.map((o) => (
            <span key={o} className={chip}>
              {o}
              <button type="button" aria-label={`Remove ${o}`} onClick={(e) => { e.stopPropagation(); remove(o); }}>
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          {more > 0 && (
            <span className={chip}>
              + {more} more
              <button type="button" aria-label="Remove extra" onClick={(e) => { e.stopPropagation(); onChange(shown); }}>
                <X className="size-3.5" />
              </button>
            </span>
          )}
        </div>
        {value.length > 0 && (
          <button type="button" aria-label="Clear" onClick={(e) => { e.stopPropagation(); onChange([]); }} className="text-ed-muted hover:text-ed-text">
            <X className="size-4" />
          </button>
        )}
        {value.length > 0 && <span className="bg-ed-line h-5 w-px" />}
        <ChevronDown className="text-ed-muted size-4 shrink-0" />
      </div>
      {open && (
        <ul id={listId} role="listbox" aria-multiselectable className="border-ed-line absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border bg-white p-1.5 shadow-lg">
          {options.map((o) => {
            const on = value.includes(o);
            return (
              <li key={o}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => onChange(on ? remove2(value, o) : [...value, o])}
                  className="hover:bg-ed-bg flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px]"
                >
                  <input type="checkbox" readOnly checked={on} className="accent-[#4a1a63]" tabIndex={-1} />
                  {o}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
const remove2 = (arr: string[], o: string) => arr.filter((v) => v !== o);

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[16px] font-semibold">{title}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="text-ed-muted hover:text-ed-text"><X className="size-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const primaryBtn =
  'bg-ed-brand inline-flex items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-medium text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#a48bb3]';
export const ghostBtn =
  'border-ed-line hover:text-ed-brand inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 text-[14px] shadow-[0_1px_2px_rgba(30,20,50,0.05)]';

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', on ? 'bg-ed-brand' : 'bg-[#dcd8e4]')}
    >
      <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform', on && 'translate-x-5')} />
    </button>
  );
}
