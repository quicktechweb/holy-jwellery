'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { BookOpen, ChevronDown, Phone, PhoneCall, MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sel({ value, onChange, options, label, className }: { value: string; onChange: (v: string) => void; options: string[]; label: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="border-ed-line focus:border-ed-brand/40 focus:ring-ed-brand/10 h-10 w-full cursor-pointer appearance-none rounded-lg border bg-white pr-9 pl-3 text-[13.5px] outline-none focus:ring-2">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
    </div>
  );
}

export function Btn({ children, onClick, primary, className, disabled }: { children: ReactNode; onClick?: () => void; primary?: boolean; className?: string; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className={cn('flex h-10 items-center gap-2 rounded-lg border px-4 text-[13.5px] whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50',
        primary ? 'bg-ed-brand border-ed-brand font-medium text-white hover:brightness-110' : 'border-ed-line hover:text-ed-brand bg-white', className)}>
      {children}
    </button>
  );
}

export function LinkBtn({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[13.5px] whitespace-nowrap transition">{children}</Link>;
}

/** Fixed-position popover - table er overflow clip eriye chole */
export function Popover({ anchor, width = 280, onClose, children }: { anchor: DOMRect; width?: number; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const left = Math.max(8, Math.min(window.innerWidth - width - 8, anchor.right - width));
  const [top, setTop] = useState(anchor.bottom + 6);
  useLayoutEffect(() => {
    const h = ref.current?.offsetHeight ?? 0;
    if (anchor.bottom + 6 + h > window.innerHeight - 8) setTop(Math.max(8, anchor.top - h - 6));
  }, [anchor]);
  useEffect(() => {
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const scroll = (e: Event) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', down);
    window.addEventListener('keydown', key);
    window.addEventListener('scroll', scroll, true);
    return () => { document.removeEventListener('mousedown', down); window.removeEventListener('keydown', key); window.removeEventListener('scroll', scroll, true); };
  }, [onClose]);
  return (
    <div ref={ref} style={{ position: 'fixed', top, left, width }} className="border-ed-line z-[60] rounded-xl border bg-white shadow-[0_12px_32px_rgba(30,20,50,0.16)]">
      {children}
    </div>
  );
}

export function GuideBtn({ onClick }: { onClick: () => void }) {
  return <Btn onClick={onClick}><BookOpen className="size-4" /> Guide</Btn>;
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label={title} className={cn('relative max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-2xl', wide ? 'max-w-[1150px]' : 'max-w-[520px]')}>
        <button type="button" aria-label="Close" onClick={onClose} className="text-ed-muted hover:text-ed-text absolute top-4 right-4"><X className="size-4" /></button>
        <h3 className="pr-8 text-[16.5px] font-medium">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function GuideModal({ title, points, onClose }: { title: string; points: string[]; onClose: () => void }) {
  return (
    <Modal title={title} onClose={onClose}>
      <ul className="text-ed-text/80 list-disc space-y-2 pl-5 text-[13.5px]">{points.map((p) => <li key={p}>{p}</li>)}</ul>
    </Modal>
  );
}

export function CallIcons() {
  return (
    <span className="ml-1.5 inline-flex items-center gap-2 align-middle">
      <PhoneCall className="size-3.5 text-blue-600" />
      <MessageCircle className="size-3.5 text-emerald-500" />
      <Phone className="size-3.5 text-violet-400" />
    </span>
  );
}

export function AmPm() {
  return (
    <div className="text-ed-muted space-y-1 text-[10px]">
      {['AM', 'PM'].map((l) => (
        <div key={l} className="flex items-center gap-1.5"><span className="w-5">{l}</span><i className="size-2.5 rounded-full bg-[#ebe9f0]" /><i className="size-2.5 rounded-full bg-[#ebe9f0]" /></div>
      ))}
    </div>
  );
}

export function Avatar({ bg }: { bg: string }) {
  return <span className="block size-6 rounded-full" style={{ background: bg }} />;
}

export function download(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
