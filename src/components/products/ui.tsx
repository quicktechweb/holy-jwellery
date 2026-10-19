'use client';

import { useEffect, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Dialog({ title, desc, onClose, width = 'max-w-[672px]', children }: { title: string; desc?: string; onClose: () => void; width?: string; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label={title} className={cn('relative max-h-[92vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-2xl', width)}>
        <button type="button" aria-label="Close" onClick={onClose} className="text-ed-muted hover:text-ed-text absolute top-5 right-5"><X className="size-4" /></button>
        <h3 className="pr-8 text-[18px] font-medium">{title}</h3>
        {desc && <p className="text-ed-text/65 mt-1.5 text-[13px] leading-relaxed">{desc}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function Switch({ on, onChange, label, small }: { on: boolean; onChange: (v: boolean) => void; label: string; small?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={cn('relative shrink-0 rounded-full transition-colors', small ? 'h-[22px] w-[42px]' : 'h-8 w-[46px]', on ? 'bg-ed-brand shadow-[0_2px_6px_rgba(63,19,85,0.35)]' : 'bg-[#e4e1ea]')}>
      <i className={cn('absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-all', small ? 'size-[18px]' : 'size-6', on ? (small ? 'left-[22px]' : 'left-[19px]') : 'left-0.5')} />
    </button>
  );
}

export const btnOut = 'border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[13.5px] whitespace-nowrap shadow-sm transition';
export const btnPrimary = 'bg-ed-brand flex h-10 items-center gap-2 rounded-lg px-5 text-[13.5px] font-medium whitespace-nowrap text-white shadow-[0_3px_8px_rgba(63,19,85,0.3)] transition hover:brightness-110 disabled:opacity-50';

export function Tick({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn('flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition', checked ? 'bg-ed-brand border-ed-brand text-white' : 'border-[#b9b5c6] bg-white hover:border-ed-brand')}>
      {checked && <Check className="size-3" strokeWidth={3} />}
    </button>
  );
}
