'use client';

import { useEffect, useMemo, useRef, useState, type ElementType, type ReactNode } from 'react';
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, Package, Search } from 'lucide-react';
import { productSeed } from '@/data/products';
import { businesses, rangeLabels, type RangeKey } from '@/data/productReport';
import { cn } from '@/lib/utils';

export const card = 'border-ed-line rounded-xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)]';
export const taka = (n: number) => `৳${Math.round(n).toLocaleString('en-US')}`;

export function Title({ title, sub, right }: { title: string; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-[28px] leading-tight font-medium tracking-tight">{title}</h2>
        {sub && <p className="text-ed-text/65 mt-1 text-[14px]">{sub}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

export function Empty({ icon: Icon = Package, title, text }: { icon?: ElementType; title: string; text: string }) {
  return (
    <div className="border-ed-line text-ed-muted mt-6 rounded-xl border border-dashed px-6 py-16 text-center">
      <span className="bg-ed-brand-soft text-ed-brand mx-auto flex size-16 items-center justify-center rounded-full"><Icon className="size-7" strokeWidth={1.5} /></span>
      <p className="text-ed-text mt-4 text-[16px] font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-[13.5px]">{text}</p>
    </div>
  );
}

export function Stat({ label, value, icon: Icon, tone }: { label: string; value: ReactNode; icon?: ElementType; tone?: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      {Icon && <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', tone ?? 'bg-ed-brand-soft text-ed-brand')}><Icon className="size-5" /></span>}
      <div>
        <p className="text-ed-muted text-[11px] font-medium tracking-wide uppercase">{label}</p>
        <p className="mt-0.5 text-[24px] leading-tight font-medium">{value}</p>
      </div>
    </div>
  );
}
export const StatRow = ({ children, cols }: { children: ReactNode; cols: string }) => (
  <div className={cn(card, 'divide-ed-line mt-5 grid divide-y overflow-hidden sm:divide-x sm:divide-y-0', cols)}>{children}</div>
);

export function Select({ value, onChange, options, label, className }: { value: string; onChange: (v: string) => void; options: string[]; label: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
        className="border-ed-line focus:border-ed-brand/40 h-10 w-full cursor-pointer appearance-none rounded-lg border bg-[#f7f6fa] pr-9 pl-3.5 text-[13.5px] outline-none">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2" />
    </div>
  );
}
export const BusinessSelect = ({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) => (
  <Select label="Business" value={value} onChange={onChange} options={businesses} className={className} />
);

export function SearchBox({ value, onChange, placeholder = 'Search...', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={cn('relative block', className)}>
      <Search className="text-ed-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}
        className="border-ed-line focus:border-ed-brand/40 h-10 w-full rounded-lg border bg-[#f7f6fa] pr-3 pl-9 text-[13.5px] outline-none" />
    </label>
  );
}

export function Chips<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { k: T; l: string }[]; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex h-10 items-center rounded-lg bg-[#f3f1f7] p-0.5">
      {items.map((i) => (
        <button key={i.k} type="button" aria-pressed={value === i.k} onClick={() => onChange(i.k)}
          className={cn('h-8 rounded-md px-3 text-[13px] transition', value === i.k ? 'bg-ed-brand font-medium text-white shadow-sm' : 'text-ed-text/65 hover:text-ed-brand')}>{i.l}</button>
      ))}
    </div>
  );
}

/** Dropdown menu jeta bahire click korle bondho hoy */
function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, [open, close]);
  return ref;
}

const QUICK: RangeKey[] = ['today', 'yest', '7d', '30d'];
const EXT: RangeKey[] = ['month', 'lastMonth', 'year', 'lastYear', 'lifetime'];

/** Calendar-style date dropdown (Today / Yesterday / ... / Custom) */
export function DateMenu({ value, onChange, className }: { value: RangeKey; onChange: (v: RangeKey) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(open, () => setOpen(false));
  const item = (k: RangeKey) => (
    <button key={k} type="button" onClick={() => { onChange(k); setOpen(false); }}
      className={cn('hover:bg-ed-brand-soft flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-[13.5px]', value === k && 'bg-ed-brand-soft')}>
      <CalendarDays className="text-ed-muted size-4" /> <span className="flex-1">{rangeLabels[k]}</span>
      {value === k && <span className="bg-ed-brand flex size-5 items-center justify-center rounded-full text-white"><Check className="size-3" strokeWidth={3} /></span>}
    </button>
  );
  const h = 'text-ed-muted px-3 pt-2 pb-1 text-[10.5px] font-medium tracking-wider uppercase';
  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className="flex h-10 items-center rounded-lg bg-[#f3f1f7] p-0.5">
        <button type="button" aria-label="Previous range" className="hover:text-ed-brand flex size-8 items-center justify-center"><ChevronLeft className="size-4" /></button>
        <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}
          className="flex h-8 items-center gap-2 rounded-md bg-white px-3 text-[13.5px] shadow-sm">
          <CalendarDays className="text-ed-muted size-3.5" /> {rangeLabels[value]} <ChevronDown className={cn('size-3.5 transition', open && 'rotate-180')} />
        </button>
      </div>
      {open && (
        <div role="menu" className="border-ed-line absolute top-12 right-0 z-30 w-[220px] rounded-xl border bg-white p-1.5 shadow-xl">
          <p className={h}>Quick select</p>{QUICK.map(item)}
          <p className={cn(h, 'border-ed-line mt-1 border-t')}>Extended range</p>{EXT.map(item)}
          <p className={cn(h, 'border-ed-line mt-1 border-t')}>Custom</p>
          {['Select a date', 'Custom range'].map((l) => (
            <button key={l} type="button" onClick={() => setOpen(false)} className="hover:bg-ed-brand-soft flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-[13.5px]"><CalendarDays className="text-ed-muted size-4" /> {l}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Today / Yest. / 30D chips + "..." (baki range) */
export function RangeBar({ value, onChange }: { value: RangeKey; onChange: (v: RangeKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(open, () => setOpen(false));
  const short = value === 'today' || value === 'yest' || value === '30d';
  return (
    <div ref={ref} className="relative flex items-center gap-2">
      <button type="button" aria-label="Previous range" className="border-ed-line hover:text-ed-brand flex size-10 items-center justify-center rounded-lg border bg-white"><ChevronLeft className="size-4" /></button>
      <Chips label="Date range" value={(short ? value : '') as RangeKey} onChange={onChange} items={[{ k: 'today', l: 'Today' }, { k: 'yest', l: 'Yest.' }, { k: '30d', l: '30D' }]} />
      <button type="button" aria-label="More ranges" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className={cn('border-ed-line hover:text-ed-brand flex h-10 w-12 items-center justify-center rounded-lg border bg-white text-[16px] leading-none', !short && 'bg-ed-brand-soft text-ed-brand')}>•••</button>
      {open && (
        <div role="menu" className="border-ed-line absolute top-12 left-0 z-30 w-[200px] rounded-xl border bg-white p-1.5 shadow-xl">
          {(['7d', ...EXT] as RangeKey[]).map((k) => (
            <button key={k} type="button" onClick={() => { onChange(k); setOpen(false); }} className={cn('hover:bg-ed-brand-soft flex h-9 w-full items-center rounded-lg px-3 text-[13.5px]', value === k && 'bg-ed-brand-soft')}>{rangeLabels[k]}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Searchable product picker (Product Report / A-Z / Buyers) */
export function ProductSelect({ value, onChange, label = 'Select product...' }: { value: string; onChange: (id: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useOutside(open, () => setOpen(false));
  const list = useMemo(() => productSeed.filter((p) => `${p.name} ${p.code}`.toLowerCase().includes(q.toLowerCase())), [q]);
  const cur = productSeed.find((p) => p.id === value);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className="border-ed-line flex h-12 min-w-[175px] items-center justify-between gap-3 rounded-lg border bg-[#f7f6fa] px-4 text-[14px]">
        <span className={cn('max-w-[260px] truncate', !cur && 'text-ed-text/80')}>{cur?.name ?? label}</span><ChevronsUpDown className="text-ed-muted size-4" />
      </button>
      {open && (
        <div className="border-ed-line absolute top-14 left-0 z-30 w-[340px] rounded-xl border bg-white p-2 shadow-xl">
          <SearchBox value={q} onChange={setQ} placeholder="Search product or SKU..." />
          <ul role="listbox" className="mt-2 max-h-64 overflow-y-auto">
            {list.map((p) => (
              <li key={p.id}>
                <button type="button" role="option" aria-selected={p.id === value} onClick={() => { onChange(p.id); setOpen(false); setQ(''); }}
                  className="hover:bg-ed-brand-soft flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[13px]">
                  <span className="size-8 shrink-0 rounded-md" style={{ background: p.images[0]?.bg }} />
                  <span className="min-w-0 flex-1"><span className="block truncate">{p.name}</span><span className="text-ed-muted block text-[11px]">{p.code}</span></span>
                  {p.id === value && <Check className="text-ed-brand size-4" />}
                </button>
              </li>
            ))}
            {!list.length && <li className="text-ed-muted px-2 py-6 text-center text-[13px]">No product found.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Pager({ page, pages, onPage, size, onSize, selectedText }: { page: number; pages: number; onPage: (p: number) => void; size: number; onSize: (n: number) => void; selectedText?: string }) {
  const b = 'border-ed-line flex size-9 items-center justify-center rounded-lg border bg-white disabled:opacity-40';
  return (
    <div className="text-ed-text/70 flex flex-wrap items-center justify-between gap-3 px-1 pt-3 text-[13px]">
      <span>{selectedText}</span>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">Rows per page
          <select value={size} onChange={(e) => { onSize(+e.target.value); onPage(1); }} className="border-ed-line h-9 rounded-lg border bg-[#f7f6fa] px-2">{[10, 20, 50].map((n) => <option key={n}>{n}</option>)}</select>
        </label>
        <span>Page {pages ? page : 0} of {pages}</span>
        <div className="flex gap-1.5">
          <button type="button" aria-label="First page" disabled={page <= 1} onClick={() => onPage(1)} className={b}><ChevronsLeft className="size-4" /></button>
          <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className={b}><ChevronLeft className="size-4" /></button>
          <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)} className={b}><ChevronRight className="size-4" /></button>
          <button type="button" aria-label="Last page" disabled={page >= pages} onClick={() => onPage(pages)} className={b}><ChevronsRight className="size-4" /></button>
        </div>
      </div>
    </div>
  );
}

export function SortTh({ label, k, sort, onSort, right }: { label: string; k: string; sort: { k: string; d: 1 | -1 }; onSort: (k: string) => void; right?: boolean }) {
  return (
    <th scope="col" className={cn('px-3 py-3 text-left font-medium whitespace-nowrap', right && 'text-right')}>
      <button type="button" onClick={() => onSort(k)} className={cn('hover:text-ed-brand inline-flex items-center gap-1.5', sort.k === k && 'text-ed-brand')}>
        {label} <ChevronsUpDown className="size-3.5 opacity-70" />
      </button>
    </th>
  );
}
export const useSort = (init: string) => {
  const [sort, setSort] = useState<{ k: string; d: 1 | -1 }>({ k: init, d: -1 });
  return { sort, onSort: (k: string) => setSort((s) => (s.k === k ? { k, d: (-s.d) as 1 | -1 } : { k, d: -1 })) };
};

export function csv(name: string, head: string[], rows: (string | number)[][]) {
  const body = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/csv' }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
