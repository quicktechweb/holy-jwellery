'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, FilterX, ListFilter, Phone, PhoneCall, Search, ShieldCheck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FU_EMPLOYEES } from '@/lib/followupStore';

/* ── date range ── */
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const PRESETS = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'This month', 'Last month'] as const;
type Preset = (typeof PRESETS)[number];

function rangeOf(p: Preset, offset: number): { from: string; to: string } {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const span = (days: number, end: Date) => { const e = addDays(end, offset * days); return { from: iso(addDays(e, -(days - 1))), to: iso(e) }; };
  switch (p) {
    case 'Today': return span(1, t);
    case 'Yesterday': return span(1, addDays(t, -1));
    case 'Last 7 days': return span(7, t);
    case 'Last 30 days': return span(30, t);
    default: {
      const base = new Date(t.getFullYear(), t.getMonth() - (p === 'Last month' ? 1 : 0) + offset, 1);
      return { from: iso(base), to: iso(new Date(base.getFullYear(), base.getMonth() + 1, 0)) };
    }
  }
}

/* ── filters ── */
export type FKey = 'employee' | 'direction' | 'source' | 'status';
const FILTERS: { key: FKey; label: string; icon: typeof Users; options: string[] }[] = [
  { key: 'employee', label: 'Employee', icon: Users, options: FU_EMPLOYEES.map((e) => e.name) },
  { key: 'direction', label: 'Direction', icon: Phone, options: ['Outbound', 'Inbound'] },
  { key: 'source', label: 'Source', icon: PhoneCall, options: ['Web Order', 'Approved Order', 'Manual Dial', 'Queue Callback', 'Inbound', 'Unknown'] },
  { key: 'status', label: 'Status', icon: ShieldCheck, options: ['Completed', 'Answered', 'No answer', 'Busy', 'Failed', 'Canceled'] },
];
export type Picked = Record<FKey, string[]>;
export const EMPTY: Picked = { employee: [], direction: [], source: [], status: [] };

export interface FilterState { range: { from: string; to: string }; picked: Picked; phone: string; business: string }

function useOutside(close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const d = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) close(); };
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', d); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', d); document.removeEventListener('keydown', k); };
  }, [close]);
  return ref;
}

const pill = 'border-ed-line hover:bg-ed-bg/60 flex h-10 items-center gap-2 rounded-lg border bg-white px-3.5 text-[14.5px] transition-colors';

export function CallFilterBar({ onChange }: { onChange: (f: FilterState) => void }) {
  const [preset, setPreset] = useState<Preset>('Today');
  const [offset, setOffset] = useState(0);
  const [dateOpen, setDateOpen] = useState(false);
  const [business, setBusiness] = useState('Active business');
  const [bizOpen, setBizOpen] = useState(false);
  const [picked, setPicked] = useState<Picked>(EMPTY);
  const [phone, setPhone] = useState('');
  const [fOpen, setFOpen] = useState(false);
  const [sub, setSub] = useState<FKey | 'search' | null>(null);
  const [q, setQ] = useState('');

  const closeDate = useMemo(() => () => setDateOpen(false), []);
  const closeBiz = useMemo(() => () => setBizOpen(false), []);
  const closeF = useMemo(() => () => { setFOpen(false); setSub(null); setQ(''); }, []);
  const dateRef = useOutside(closeDate);
  const bizRef = useOutside(closeBiz);
  const fRef = useOutside(closeF);

  const toggle = (k: FKey, v: string) => {
    setPicked((p) => ({ ...p, [k]: p[k].includes(v) ? [] : [v] }));
    setSub(null); // option pick korle main filter menu te fire jay
    setQ('');
  };
  const clearAll = () => { setPicked(EMPTY); setPhone(''); };
  const count = FILTERS.filter((f) => picked[f.key].length).length + (phone ? 1 : 0);

  const range = rangeOf(preset, offset);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onChange({ range, picked, phone, business }); }, [preset, offset, picked, phone, business]);

  return (
      <div className="border-ed-line flex flex-wrap items-center gap-3 rounded-xl border bg-[#faf9fc] p-3.5">
        {/* date */}
        <div ref={dateRef} className="relative flex">
          <button type="button" aria-label="Previous period" onClick={() => setOffset((o) => o - 1)} className="border-ed-line hover:bg-ed-bg/60 flex h-10 w-9 items-center justify-center rounded-l-lg border border-r-0 bg-white"><ChevronLeft className="size-4" /></button>
          <button type="button" onClick={() => setDateOpen((o) => !o)} className="border-ed-line hover:bg-ed-bg/60 flex h-10 items-center gap-2 rounded-r-lg border bg-white px-3 text-[14.5px]">
            <CalendarDays className="text-ed-muted size-4" /> {preset} <ChevronDown className="size-4" />
          </button>
          {offset < 0 && <button type="button" aria-label="Next period" onClick={() => setOffset((o) => o + 1)} className="border-ed-line hover:bg-ed-bg/60 ml-1 flex h-10 w-9 items-center justify-center rounded-lg border bg-white"><ChevronRight className="size-4" /></button>}
          {dateOpen && (
            <ul className="border-ed-line absolute top-full left-0 z-30 mt-1.5 w-[200px] rounded-xl border bg-white p-1.5 shadow-xl">
              {PRESETS.map((p) => (
                <li key={p}><button type="button" onClick={() => { setPreset(p); setOffset(0); setDateOpen(false); }} className="hover:bg-ed-brand-soft flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[14px]">{p}{p === preset && <Check className="text-ed-brand size-4" />}</button></li>
              ))}
            </ul>
          )}
        </div>

        {/* business */}
        <div ref={bizRef} className="relative w-[224px]">
          <button type="button" onClick={() => setBizOpen((o) => !o)} className={cn(pill, 'w-full justify-between')}>{business}<ChevronDown className="size-4" /></button>
          {bizOpen && (
            <ul className="border-ed-line absolute top-full z-30 mt-1.5 w-full rounded-xl border bg-white p-1.5 shadow-xl">
              {['Active business', 'Elishine'].map((b) => (
                <li key={b}><button type="button" onClick={() => { setBusiness(b); setBizOpen(false); }} className="hover:bg-ed-brand-soft flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[14px]">{b}{b === business && <Check className="text-ed-brand size-4" />}</button></li>
              ))}
            </ul>
          )}
        </div>

        {/* filters popover */}
        <div ref={fRef} className="relative">
          <button type="button" onClick={() => setFOpen((o) => !o)} className={cn(pill, 'bg-ed-bg/60')}>
            <ListFilter className="size-4" /> Filters
            {count > 0 && <span className="bg-ed-brand/10 text-ed-brand flex size-5 items-center justify-center rounded-full text-[12px] font-medium">{count}</span>}
          </button>
          {fOpen && (
            <div className="border-ed-line absolute top-full left-0 z-30 mt-1.5 w-[350px] overflow-hidden rounded-xl border bg-white shadow-xl">
              {sub === 'search' ? (
                <>
                  <button type="button" onClick={() => setSub(null)} className="border-ed-line flex w-full items-center gap-2 border-b px-4 py-3 text-left text-[14px] font-medium"><ArrowLeft className="text-ed-muted size-4" />Search</button>
                  <div className="p-3">
                    <input autoFocus value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number…" className="border-ed-line focus:border-ed-brand/50 h-10 w-full rounded-lg border px-3 text-[14px] outline-none" />
                  </div>
                </>
              ) : cur ? (
                <>
                  <button type="button" onClick={() => { setSub(null); setQ(''); }} className="border-ed-line flex w-full items-center gap-2 border-b px-4 py-3 text-left text-[14px] font-medium"><ArrowLeft className="text-ed-muted size-4" />{cur.label}</button>
                  <SearchBox value={q} onChange={setQ} />
                  <ul className="border-ed-line max-h-[260px] overflow-y-auto border-t p-1.5">
                    {cur.options.filter((o) => o.toLowerCase().includes(q.toLowerCase())).map((o) => {
                      const on = picked[cur.key].includes(o);
                      return (
                        <li key={o}>
                          <button type="button" onClick={() => toggle(cur.key, o)} className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[14px]', on ? 'bg-ed-brand-soft' : 'hover:bg-ed-bg/70')}>
                            <span className={cn('flex size-[18px] items-center justify-center rounded-full', on ? 'bg-ed-brand text-white' : 'w-0 opacity-0')}>{on && <Check className="size-3" strokeWidth={3.5} />}</span>
                            {o}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <>
                  <SearchBox focus value={q} onChange={setQ} />
                  <ul className="border-ed-line border-t p-1.5">
                    {menu.map((f) => (
                      <li key={f.key}>
                        <button type="button" onClick={() => { setSub(f.key); setQ(''); }} className="hover:bg-ed-brand-soft flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[14px]"><f.icon className="size-4" />{f.label}<ArrowRight className="text-ed-muted ml-auto size-4" /></button>
                      </li>
                    ))}
                    {'search'.includes(q.toLowerCase()) && (
                      <li><button type="button" onClick={() => setSub('search')} className="hover:bg-ed-brand-soft flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[14px]"><Search className="size-4" />Search</button></li>
                    )}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        {/* active chips */}
        {FILTERS.filter((f) => picked[f.key].length).map((f) => (
          <Chip key={f.key} icon={<f.icon className="size-3.5" />} label={f.label} value={picked[f.key].join(', ')} onRemove={() => setPicked((p) => ({ ...p, [f.key]: [] }))} />
        ))}
        {phone && <Chip icon={<Search className="size-3.5" />} label="Phone" op="contains" value={phone} onRemove={() => setPhone('')} />}

        {count > 0 && (
          <button type="button" onClick={clearAll} className="bg-ed-red ml-auto flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[14px] font-medium text-white hover:opacity-90"><FilterX className="size-4" />Clear</button>
        )}
      </div>
  );
}

function SearchBox({ value, onChange, focus }: { value: string; onChange: (v: string) => void; focus?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 px-4 py-3">
      <Search className="text-ed-muted size-4" />
      <input autoFocus={focus} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search..." className="placeholder:text-ed-muted w-full text-[14px] outline-none" />
    </label>
  );
}

function Chip({ icon, label, op = 'is', value, onRemove }: { icon: React.ReactNode; label: string; op?: string; value: string; onRemove: () => void }) {
  return (
    <span className="border-ed-line flex h-9 items-center overflow-hidden rounded-full border bg-white text-[13.5px]">
      <span className="flex items-center gap-1.5 px-3">{icon}{label}</span>
      <span className="text-ed-muted border-ed-line border-x px-2.5 text-[12.5px]">{op}</span>
      <span className="max-w-[180px] truncate px-3">{value}</span>
      <button type="button" aria-label={`Remove ${label} filter`} onClick={onRemove} className="border-ed-line hover:text-ed-red flex h-full w-8 items-center justify-center border-l">✕</button>
    </span>
  );
}
