'use client';

import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const BRAND = '#3f1355';
export const card = 'border-ed-line rounded-xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)]';
export const th = 'px-4 py-3 text-[13.5px] font-medium text-ed-text/70 whitespace-nowrap';
export const inputCls = 'border-ed-line placeholder:text-ed-muted h-10 w-full rounded-lg border bg-[#f9f8fb] pr-3 pl-9 text-[13.5px] outline-none focus:border-ed-brand/50 focus:ring-2 focus:ring-ed-brand/10';

/** onChange dile clickable checkbox; na dile (button er bhetore) shudhu visual tick (span) */
export function Box({ on, onChange, label }: { on: boolean; onChange?: () => void; label: string }) {
  const cls = cn('flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition', on ? 'border-ed-brand bg-ed-brand text-white' : 'border-[#9a97a8] bg-white');
  if (!onChange) return <span aria-hidden className={cls}>{on && <Check className="size-3" strokeWidth={3.5} />}</span>;
  return (
    <button type="button" role="checkbox" aria-checked={on} aria-label={label} onClick={onChange} className={cls}>
      {on && <Check className="size-3" strokeWidth={3.5} />}
    </button>
  );
}

export function Empty({ icon, title, hint }: { icon: ReactNode; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="text-ed-text/70 mb-4">{icon}</div>
      <p className="text-[16px] font-medium">{title}</p>
      <p className="text-ed-muted mt-2 text-[14px]">{hint}</p>
    </div>
  );
}

export function Modal({ title, sub, onClose, children }: { title: string; sub?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className="relative max-h-[calc(100vh-2rem)] w-full max-w-[768px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <button type="button" aria-label="Close" onClick={onClose} className="absolute top-5 right-5 text-[#1b1b2f]/80 hover:text-[#1b1b2f]">✕</button>
        <h2 className="text-[18px] font-semibold tracking-tight">{title}</h2>
        {sub && <p className="text-ed-muted mt-1 text-[13px]">{sub}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
