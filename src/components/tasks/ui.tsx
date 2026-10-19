'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { priorityColor, statusColor, type Priority, type Status } from '@/lib/taskStore';

export const violet = 'bg-[#7c1ee6] hover:bg-[#6d17d0]';

/** solid = board column header / detail, soft = list group header / status pill. Colors Settings > Status Columns theke ashe. */
const GRAY = '#6b7280';
export function StatusChip({ status, solid, spaceId }: { status: Status; solid?: boolean; spaceId?: string }) {
  const c = statusColor(status, spaceId);
  const base = 'inline-block rounded-md px-2 py-[3px] text-[10.5px] leading-none font-bold tracking-wide uppercase';
  if (solid) {
    return c === GRAY
      ? <span className={cn(base, 'bg-[#dfe1e6] text-[#4b5160]')}>{status}</span>
      : <span className={base} style={{ backgroundColor: c, color: '#fff' }}>{status}</span>;
  }
  return <span className={cn(base, 'border')} style={{ backgroundColor: `${c}1a`, borderColor: `${c}40`, color: c }}>{status}</span>;
}

export function StatusPill({ status, spaceId }: { status: Status; spaceId?: string }) {
  const c = statusColor(status, spaceId);
  return <span className="inline-block rounded-md border px-2 py-[3px] text-[10.5px] leading-none font-medium" style={{ backgroundColor: `${c}1a`, borderColor: `${c}40`, color: c }}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === 'None') return <span className="text-ed-muted">-</span>;
  const c = priorityColor(priority);
  return <span className="rounded px-2 py-0.5 text-[10.5px] font-medium" style={{ backgroundColor: `${c}1f`, color: c }}>{priority}</span>;
}

export const initials = (name: string) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
export function Avatar({ name }: { name: string }) {
  return <span className="flex size-[22px] items-center justify-center rounded-full bg-[#ece4fb] text-[8.5px] font-bold text-[#6d28d9]">{initials(name)}</span>;
}

/** Styled native select with chevron */
export function Sel({ value, onChange, options, label, className, icon }: { value: string; onChange: (v: string) => void; options: string[]; label: string; className?: string; icon?: ReactNode }) {
  return (
    <div className={cn('relative', className)}>
      {icon && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] leading-none">{icon}</span>}
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
        className={cn('border-ed-line text-ed-text h-full min-h-9 w-full cursor-pointer appearance-none rounded-lg border bg-white pr-8 text-[13.5px] outline-none focus:border-[#7c1ee6] focus:ring-2 focus:ring-[#7c1ee6]/25', icon ? 'pl-9' : 'pl-3')}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="text-ed-text/60 pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
    </div>
  );
}

export function useOutside<T extends HTMLElement>(onClose: () => void, active = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!active) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, [onClose, active]);
  return ref;
}

export const fmtUpdated = (iso: string) => iso.replace('T', ' ');

/** "Oct 18, 2026" / "Oct 18" */
const day = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`);
export const fmtDay = (iso: string) => day(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const fmtShort = (iso: string) => day(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const fmtStamp = (iso: string) => `${fmtShort(iso)}, ${iso.slice(11, 16)}`;
export const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
