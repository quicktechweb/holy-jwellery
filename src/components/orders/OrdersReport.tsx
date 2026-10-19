'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  ClipboardList,
  Clock,
  Download,
  FileDown,
  Filter,
  Info,
  ListChecks,
  Loader2,
  MapPin,
  Package,
  RotateCcw,
  Search,
  Truck,
  TriangleAlert,
  UserX,
  X,
  type LucideIcon,
} from 'lucide-react';
import { NOW } from '@/data/approvedOrders';
import {
  DISTRICTS,
  ORDER_TAGS,
  REPORT_COURIERS,
  REPORT_SOURCES,
  REPORT_USERS,
  STATUS_TAGS_ALERT,
  STATUS_TAGS_PLAIN,
  reportOrders,
  type ReportOrder,
} from '@/data/ordersReport';
import { cn } from '@/lib/utils';
import { Floating } from './ApprovedOrderList';

/* ───────────────────────── date helpers (Dhaka = UTC+6) ───────────────────────── */

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');
const dh = (ts: number) => new Date(ts + 6 * 3_600_000);
const dayKey = (ts: number) => {
  const d = dh(ts);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};
const keyToUtc = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const utcToKey = (ms: number) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};
const fmtDay = (ts: number) => {
  const d = dh(ts);
  return `${MON[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};
const fmtTime = (ts: number) => {
  const d = dh(ts);
  const h = d.getUTCHours();
  return `${h % 12 || 12}:${pad(d.getUTCMinutes())} ${h >= 12 ? 'PM' : 'AM'}`;
};
const minutesOfDay = (ts: number) => {
  const d = dh(ts);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
};
const fmtRangeLabel = (r: DateRange) => {
  const a = new Date(keyToUtc(r.start));
  const b = new Date(keyToUtc(r.end));
  const s = `${MON[a.getUTCMonth()]} ${pad(a.getUTCDate())}`;
  const e = `${MON[b.getUTCMonth()]} ${pad(b.getUTCDate())}, ${b.getUTCFullYear()}`;
  return `${s} - ${e}`;
};
const timeLabel = (mins: number) => {
  const h = Math.floor(mins / 60);
  return `${h % 12 || 12}:${pad(mins % 60)} ${h >= 12 ? 'PM' : 'AM'}`;
};
const TIME_ITEMS: Item[] = [
  { value: '', label: 'Clear' },
  ...Array.from({ length: 96 }, (_, i) => ({ value: String(i * 15), label: timeLabel(i * 15) })),
];
const money = (n: number) => `৳${n.toLocaleString('en-US')}`;

interface DateRange {
  start: string;
  end: string;
}

/* ───────────────────────── Picker (dropdown) ───────────────────────── */

interface Item {
  value: string;
  label: string;
  icon?: LucideIcon;
  pill?: boolean;
}

const fieldBase =
  'border-ed-line hover:border-ed-brand/30 flex h-10 w-full items-center gap-2.5 rounded-lg border bg-white px-3 text-left text-[14.5px] shadow-[0_1px_0_rgba(30,20,50,0.02)] transition-colors';

function Picker({
  icon: Icon,
  display,
  muted,
  trailing = 'chevron',
  items,
  value,
  onChange,
  multi,
  searchable,
  searchPlaceholder,
}: {
  icon?: LucideIcon;
  display: string;
  muted?: boolean;
  trailing?: 'chevron' | 'updown';
  items: Item[];
  value: string | string[];
  onChange: (v: string) => void;
  multi?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const btn = useRef<HTMLButtonElement>(null);
  const isSel = (v: string) => (Array.isArray(value) ? value.includes(v) : value === v);
  const shown = items.filter((i) => !q.trim() || i.label.toLowerCase().includes(q.trim().toLowerCase()));
  const lastPill = shown.reduce((acc, it, idx) => (it.pill ? idx : acc), -1);
  const Trail = trailing === 'updown' ? ChevronsUpDown : ChevronDown;

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setQ('');
          setOpen((o) => !o);
        }}
        className={fieldBase}
      >
        {Icon && <Icon className="text-ed-muted size-4 shrink-0" strokeWidth={1.75} />}
        <span className={cn('min-w-0 flex-1 truncate', muted && 'text-ed-muted')}>{display}</span>
        <Trail className="text-ed-muted size-4 shrink-0" />
      </button>
      {open && btn.current && (
        <Floating anchor={btn.current} onClose={() => setOpen(false)} width={btn.current.offsetWidth}>
          {searchable && (
            <div className="border-ed-line flex h-11 items-center gap-2.5 border-b px-3.5">
              <Search className="text-ed-muted size-4" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-[14px] outline-none"
              />
            </div>
          )}
          <div role="listbox" className="thin-scroll max-h-[290px] overflow-y-auto p-1.5">
            {shown.length === 0 && <p className="text-ed-muted px-3 py-4 text-center text-[13px]">No results</p>}
            {shown.map((it, idx) => {
              const on = isSel(it.value);
              const Ic = it.icon;
              return (
                <div key={it.value + idx}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => {
                      onChange(it.value);
                      if (!multi) setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-3 text-left text-[14px] transition-colors',
                      it.pill ? 'h-[31px]' : 'h-8',
                      on && searchable ? 'bg-ed-brand-soft' : 'hover:bg-ed-bg',
                      on && !searchable && 'bg-ed-brand-soft/60',
                    )}
                  >
                    {!searchable && (
                      <span className="flex size-4 shrink-0 items-center justify-center">
                        {on && <Check className="size-3.5" />}
                      </span>
                    )}
                    {it.pill ? (
                      <span className="border-ed-line inline-flex items-center gap-1.5 rounded-md border bg-white px-2 py-0.5 text-[12px] font-medium">
                        {Ic && <Ic className="size-3.5" />}
                        {it.label}
                      </span>
                    ) : (
                      <>
                        {Ic && <Ic className="text-ed-muted size-4" />}
                        <span className="flex-1 truncate">{it.label}</span>
                      </>
                    )}
                    {searchable && multi && on && <Check className="text-ed-brand ml-auto size-4" />}
                  </button>
                  {idx === lastPill && <div className="bg-ed-line mx-1 my-1.5 h-px" />}
                </div>
              );
            })}
          </div>
        </Floating>
      )}
    </>
  );
}

/* ───────────────────────── date range picker ───────────────────────── */

function MonthGrid({
  year,
  month,
  range,
  onPick,
}: {
  year: number;
  month: number;
  range: DateRange | null;
  onPick: (k: string) => void;
}) {
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const dim = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const rows = Math.ceil((first + dim) / 7);
  const todayKey = dayKey(NOW);
  const cells = Array.from({ length: rows * 7 }, (_, i) => {
    const ms = Date.UTC(year, month, 1 - first + i);
    return { ms, key: utcToKey(ms), out: new Date(ms).getUTCMonth() !== month, day: new Date(ms).getUTCDate() };
  });
  return (
    <div className="w-[252px]">
      <div className="text-ed-muted grid grid-cols-7 text-center text-[12.5px]">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="flex h-9 items-center justify-center">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((c) => {
          const edge = range && (c.key === range.start || c.key === range.end);
          const mid = range && c.key > range.start && c.key < range.end;
          return (
            <div key={c.key} className={cn('flex h-11 items-center justify-center', mid && !c.out && 'bg-ed-brand-soft')}>
              <button
                type="button"
                onClick={() => onPick(c.key)}
                className={cn(
                  'size-9 rounded-md text-[14px] transition-colors',
                  c.out ? 'text-ed-muted/50' : 'text-ed-text',
                  edge && !c.out ? 'bg-ed-brand text-white' : 'hover:bg-ed-bg',
                  !edge && c.key === todayKey && 'bg-ed-brand-soft',
                )}
              >
                {c.day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DateRangeField({ value, onChange }: { value: DateRange | null; onChange: (r: DateRange | null) => void }) {
  const [open, setOpen] = useState(false);
  const [anchorKey, setAnchorKey] = useState<string | null>(null);
  const base = value ? new Date(keyToUtc(value.start)) : new Date(NOW);
  const [view, setView] = useState({ y: base.getUTCFullYear(), m: base.getUTCMonth() });
  const btn = useRef<HTMLButtonElement>(null);

  const shift = (dir: 1 | -1) => {
    if (!value) return;
    const len = Math.round((keyToUtc(value.end) - keyToUtc(value.start)) / DAY_MS) + 1;
    onChange({
      start: utcToKey(keyToUtc(value.start) + dir * len * DAY_MS),
      end: utcToKey(keyToUtc(value.end) + dir * len * DAY_MS),
    });
  };
  const pick = (k: string) => {
    if (!anchorKey) {
      setAnchorKey(k);
      onChange({ start: k, end: k });
    } else {
      onChange(k < anchorKey ? { start: k, end: anchorKey } : { start: anchorKey, end: k });
      setAnchorKey(null);
      setOpen(false);
    }
  };
  const second = view.m === 11 ? { y: view.y + 1, m: 0 } : { y: view.y, m: view.m + 1 };
  const move = (d: number) =>
    setView((v) => {
      const t = new Date(Date.UTC(v.y, v.m + d, 1));
      return { y: t.getUTCFullYear(), m: t.getUTCMonth() };
    });

  return (
    <div className="border-ed-line flex h-10 w-full items-center rounded-lg border bg-white shadow-[0_1px_0_rgba(30,20,50,0.02)]">
      <button type="button" aria-label="Previous range" onClick={() => shift(-1)} className="text-ed-muted hover:text-ed-brand border-ed-line flex h-full w-[26px] items-center justify-center border-r">
        <ChevronLeft className="size-4" />
      </button>
      <button
        ref={btn}
        type="button"
        onClick={() => {
          setAnchorKey(null);
          setOpen((o) => !o);
        }}
        className="flex h-full min-w-0 flex-1 items-center gap-2.5 px-3 text-left text-[14.5px]"
      >
        <CalendarDays className="text-ed-muted size-4 shrink-0" strokeWidth={1.75} />
        <span className={cn('truncate', !value && 'text-ed-muted')}>{value ? fmtRangeLabel(value) : 'Select date range'}</span>
      </button>
      <button type="button" aria-label="Next range" onClick={() => shift(1)} className="text-ed-muted hover:text-ed-brand border-ed-line flex h-full w-[26px] items-center justify-center border-l">
        <ChevronRight className="size-4" />
      </button>
      {open && btn.current && (
        <Floating anchor={btn.current} onClose={() => { setOpen(false); setAnchorKey(null); }} className="p-4">
          <div className="relative flex gap-5">
            <button type="button" aria-label="Previous month" onClick={() => move(-1)} className="hover:bg-ed-bg absolute top-0 left-0 flex size-8 items-center justify-center rounded-md">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" aria-label="Next month" onClick={() => move(1)} className="hover:bg-ed-bg absolute top-0 right-0 flex size-8 items-center justify-center rounded-md">
              <ChevronRight className="size-4" />
            </button>
            {[view, second].map((mo) => (
              <div key={`${mo.y}-${mo.m}`}>
                <p className="mb-1 flex h-8 items-center justify-center text-[14px] font-semibold">
                  {MONTH_FULL[mo.m]} {mo.y}
                </p>
                <MonthGrid year={mo.y} month={mo.m} range={value} onPick={pick} />
              </div>
            ))}
          </div>
        </Floating>
      )}
    </div>
  );
}

/* ───────────────────────── filters ───────────────────────── */

interface Filters {
  filterBy: string;
  range: DateRange | null;
  timeFrom: string;
  timeTo: string;
  search: string;
  source: string;
  courier: string;
  takenBy: string;
  payment: string;
  invoice: string;
  statusTags: string[];
  orderTags: string[];
  district: string;
}
const FILTER_BY: Item[] = [
  { value: 'approved', label: 'By Approved Order Date' },
  { value: 'created', label: 'By Order Created Date' },
  { value: 'courier', label: 'By Courier Date' },
];
const DEFAULT_RANGE: DateRange = { start: '2026-09-01', end: '2026-09-01' };
const defaultFilters = (): Filters => ({
  filterBy: 'approved',
  range: DEFAULT_RANGE,
  timeFrom: '',
  timeTo: '',
  search: '',
  source: '',
  courier: '',
  takenBy: '',
  payment: '',
  invoice: '',
  statusTags: [],
  orderTags: [],
  district: '',
});
const emptyFilters = (): Filters => ({ ...defaultFilters(), range: null });
const activeCount = (f: Filters) =>
  [
    f.range,
    f.timeFrom || f.timeTo,
    f.search.trim(),
    f.source,
    f.courier,
    f.takenBy,
    f.payment,
    f.invoice.trim(),
    f.statusTags.length,
    f.orderTags.length,
    f.district,
  ].filter(Boolean).length;

function applyFilters(list: ReportOrder[], f: Filters): ReportOrder[] {
  const s = f.search.trim().toLowerCase();
  const inv = f.invoice.trim().toLowerCase();
  return list.filter((o) => {
    const ts = f.filterBy === 'created' ? o.createdTs : f.filterBy === 'courier' ? o.courierTs : o.approvedTs;
    if (f.range) {
      const k = dayKey(ts);
      if (k < f.range.start || k > f.range.end) return false;
    }
    const mins = minutesOfDay(o.approvedTs);
    if (f.timeFrom && mins < Number(f.timeFrom)) return false;
    if (f.timeTo && mins > Number(f.timeTo)) return false;
    if (s && !`${o.product.name} ${o.product.sku}`.toLowerCase().includes(s)) return false;
    if (f.source && o.source !== f.source) return false;
    if (f.courier && o.method !== f.courier) return false;
    if (f.takenBy && o.takenBy !== f.takenBy) return false;
    if (f.payment === 'paid' && o.payment !== 'paid') return false;
    if (f.payment === 'unpaid' && o.payment !== 'unpaid') return false;
    if (inv && !`${o.invoice} ${o.tracking}`.toLowerCase().includes(inv)) return false;
    if (f.statusTags.length && !f.statusTags.some((t) => o.statusTags.includes(t))) return false;
    if (f.orderTags.length && !f.orderTags.some((t) => o.orderTags.includes(t))) return false;
    if (f.district) {
      const d = o.district || 'Missing district';
      if (d !== f.district) return false;
    }
    return true;
  });
}

function Field({ label, children, plain }: { label: string; children: ReactNode; plain?: boolean }) {
  return (
    <div>
      <p className={cn('text-ed-muted mb-2 text-[12px]', plain ? 'font-medium' : 'tracking-wide uppercase')}>{label}</p>
      {children}
    </div>
  );
}

/* ───────────────────────── KPI cards ───────────────────────── */

const KPIS: {
  key: string;
  label: string;
  icon: LucideIcon;
  card: string;
  num: string;
  ic: string;
}[] = [
  { key: 'all', label: 'Total', icon: ClipboardList, card: 'bg-[#f6f1fa] border-[#e6dcef]', num: 'text-ed-brand', ic: 'text-ed-brand' },
  { key: 'Pending', label: 'Pending', icon: Package, card: 'bg-[#eef3ff] border-[#dbe5ff]', num: 'text-[#3730d9]', ic: 'text-[#2f5fe8]' },
  { key: 'RTS', label: 'RTS', icon: Package, card: 'bg-[#f1f0ff] border-[#e0defc]', num: 'text-[#4338ca]', ic: 'text-[#5b4be0]' },
  { key: 'Shipped', label: 'Shipped', icon: Truck, card: 'bg-[#fff8ee] border-[#fbe7c9]', num: 'text-[#b45309]', ic: 'text-[#f08a1c]' },
  { key: 'Delivered', label: 'Delivered', icon: Check, card: 'bg-[#eefaf6] border-[#cdeee3]', num: 'text-[#0b7a55]', ic: 'text-[#0f9d6c]' },
  { key: 'Partial', label: 'Partial', icon: Package, card: 'bg-[#eefafd] border-[#cbeaf3]', num: 'text-[#0e7490]', ic: 'text-[#0891b2]' },
  { key: 'Returned', label: 'Returned', icon: RotateCcw, card: 'bg-[#fff1f4] border-[#fbd5dd]', num: 'text-[#be123c]', ic: 'text-[#e11d48]' },
  { key: 'PendingReturn', label: 'Pending Return', icon: TriangleAlert, card: 'bg-[#fff6f2] border-[#fde0d3]', num: 'text-[#c2410c]', ic: 'text-[#ea580c]' },
];

/* ───────────────────────── export ───────────────────────── */

type ExportKind = 'Orders' | 'Products' | 'Main Report Template';
interface ExportJob {
  id: number;
  kind: ExportKind;
  createdAt: number;
  total: number;
  ready: boolean;
  csv: string;
}

const csvCell = (v: string | number) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (head: string[], rows: (string | number)[][]) => [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
const statusText = (o: ReportOrder) => (o.status === 'PendingReturn' ? 'Pending Return' : o.status);
const payText = (o: ReportOrder) => (o.payment === 'paid' ? 'Paid' : o.payment === 'unpaid' ? 'Unpaid' : '-');

function groupProducts(list: ReportOrder[]) {
  const m = new Map<string, { name: string; sku: string; orders: number; qty: number; revenue: number; delivered: number; pendingReturn: number }>();
  list.forEach((o) => {
    const cur = m.get(o.product.sku) ?? { name: o.product.name, sku: o.product.sku, orders: 0, qty: 0, revenue: 0, delivered: 0, pendingReturn: 0 };
    cur.orders += 1;
    cur.qty += o.product.qty;
    cur.revenue += o.amount;
    if (o.status === 'Delivered') cur.delivered += o.product.qty;
    if (o.status === 'PendingReturn') cur.pendingReturn += o.product.qty;
    m.set(o.product.sku, cur);
  });
  return [...m.values()].sort((a, b) => b.qty - a.qty);
}

function buildCsv(kind: ExportKind, list: ReportOrder[]): string {
  if (kind === 'Products') {
    return toCsv(
      ['SKU', 'Product', 'Orders', 'Qty', 'Revenue', 'Delivered Qty', 'Pending Return Qty'],
      groupProducts(list).map((p) => [p.sku, p.name, p.orders, p.qty, p.revenue, p.delivered, p.pendingReturn]),
    );
  }
  if (kind === 'Main Report Template') {
    return toCsv(
      ['Invoice', 'Date', 'Customer', 'Phone', 'District', 'Product', 'Qty', 'COD', 'Courier', 'Tracking', 'Status'],
      list.map((o) => [o.invoice, fmtDay(o.approvedTs), o.name, o.mobile, o.district, o.product.name, o.product.qty, o.amount, o.method, o.tracking, statusText(o)]),
    );
  }
  return toCsv(
    ['Order', 'Customer', 'Mobile', 'District', 'Product', 'SKU', 'Qty', 'Status', 'Payment', 'Tags', 'Amount', 'Approved Date', 'Courier Date', 'Method', 'Source', 'Tracking', 'Taken By'],
    list.map((o) => [
      o.invoice, o.name, o.mobile, o.district, o.product.name, o.product.sku, o.product.qty, statusText(o), payText(o),
      o.statusTags.join('; '), o.amount, `${fmtDay(o.approvedTs)} ${fmtTime(o.approvedTs)}`, `${fmtDay(o.courierTs)} ${fmtTime(o.courierTs)}`,
      o.method, o.source, o.tracking, o.takenBy,
    ]),
  );
}

function downloadJob(job: ExportJob) {
  const blob = new Blob(['\ufeff' + job.csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const d = dh(job.createdAt);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${job.kind.toLowerCase().replace(/\s+/g, '-')}-${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ExportCenter({
  jobs,
  onNew,
  onClose,
}: {
  jobs: ExportJob[];
  onNew: (k: ExportKind) => void;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(false);
  const [lastKind, setLastKind] = useState<ExportKind | null>(jobs[0]?.kind ?? null);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const kinds: [ExportKind, LucideIcon][] = [
    ['Orders', FileDown],
    ['Products', FileDown],
    ['Main Report Template', FileDown],
  ];
  return createPortal(
    <div className="font-dash text-ed-text fixed inset-0 z-[60]" style={{ colorScheme: 'light' }}>
      <div onClick={onClose} className={cn('absolute inset-0 bg-black/60 transition-opacity duration-200', shown ? 'opacity-100' : 'opacity-0')} />
      <aside
        role="dialog"
        aria-label="Export Center"
        className={cn(
          'thin-scroll absolute top-0 right-0 h-full w-full max-w-[576px] overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-200',
          shown ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <button type="button" aria-label="Close" onClick={onClose} className="text-ed-muted hover:text-ed-text absolute top-5 right-5 rounded-full p-1">
          <X className="size-5" />
        </button>
        <h2 className="text-[19px] font-semibold">Export Center</h2>
        <p className="text-ed-muted mt-3 text-[14px]">Exports run in the background against the filters currently applied to the report.</p>

        <div className="mt-5 flex gap-2">
          {kinds.map(([k, Ic]) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setLastKind(k);
                onNew(k);
              }}
              className={cn(
                'border-ed-line hover:bg-ed-bg flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-3 text-[14px] font-medium whitespace-nowrap',
                lastKind === k ? 'bg-ed-bg' : 'bg-white',
              )}
            >
              <Ic className="size-4 shrink-0" strokeWidth={1.75} /> {k}
            </button>
          ))}
        </div>
        <p className="text-ed-muted mt-5 text-[12px] leading-relaxed">
          An export covers up to 100,000 orders — narrow the date range if the filter matches more. Cancelled and Pending Cancel orders are excluded. Finished files stay downloadable for 24 hours.
        </p>

        <div className="mt-5 space-y-3">
          {jobs.length === 0 && <p className="text-ed-muted py-10 text-center text-[13px]">No exports yet. Pick a type above to start one.</p>}
          {jobs.map((j) => (
            <div key={j.id} className="border-ed-line rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[16px] font-semibold">{j.kind}</p>
                {j.ready ? (
                  <span className="rounded-full bg-[#1f9d8f] px-3 py-1 text-[11px] font-bold tracking-wide text-white">READY</span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold tracking-wide text-amber-700">
                    <Loader2 className="size-3 animate-spin" /> PROCESSING
                  </span>
                )}
              </div>
              <p className="text-ed-muted mt-0.5 text-[12.5px]">
                {fmtDay(j.createdAt)} {fmtTime(j.createdAt)} · {j.ready ? j.total : 0} / {j.total} rows
              </p>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  disabled={!j.ready}
                  onClick={() => downloadJob(j)}
                  className="flex h-10 items-center gap-2 rounded-lg bg-[#1f9d8f] px-5 text-[14px] font-semibold text-white hover:bg-[#188a7d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="size-4" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>,
    document.body,
  );
}

/* ───────────────────────── table bits ───────────────────────── */

const th = 'px-4 py-4 text-left text-[12px] font-bold tracking-wide uppercase';
const pill = 'inline-flex items-center gap-1 rounded-md border px-2 py-[3px] text-[10.5px] font-bold tracking-wide uppercase';

function StatusPill({ o }: { o: ReportOrder }) {
  if (o.status === 'PendingReturn')
    return <span className={cn(pill, 'border-[#fdd9c2] bg-[#fff4ec] text-[#c2410c]')}>PENDING RETURN</span>;
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className={cn(pill, 'border-[#bfe8d6] bg-[#eefaf5] text-[#0b7a55]')}>{o.status}</span>
      {o.payment === 'unpaid' && <span className={cn(pill, 'border-[#f7c5cd] bg-[#fff1f3] text-[#d1203a]')}>PAYMENT NOT RECEIVED</span>}
    </div>
  );
}

function OrdersTable({ rows }: { rows: ReportOrder[] }) {
  return (
    <div className="border-ed-line thin-scroll overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[1380px] border-collapse text-[14px]">
        <thead>
          <tr className="bg-ed-bg/60 text-ed-text">
            <th className={cn(th, 'w-[160px]')}>Order</th>
            <th className={cn(th, 'w-[230px]')}>Products</th>
            <th className={cn(th, 'w-[190px]')}>Status</th>
            <th className={th}>Tags</th>
            <th className={cn(th, 'w-[100px] text-right')}>Amount</th>
            <th className={cn(th, 'w-[140px]')}>Date</th>
            <th className={cn(th, 'w-[140px]')}>Courier Date</th>
            <th className={cn(th, 'w-[120px]')}>Method</th>
            <th className={cn(th, 'w-[90px]')}>Source</th>
            <th className={cn(th, 'w-[160px]')}>Tracking</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={10} className="text-ed-muted py-16 text-center text-sm">
                No orders match these filters.
              </td>
            </tr>
          )}
          {rows.map((o) => (
            <tr key={o.id} className="border-ed-line hover:bg-ed-bg/40 border-t align-middle">
              <td className="px-4 py-4">
                <p className="text-[15px] font-bold">#{o.invoice}</p>
                <p className="text-ed-muted mt-0.5 max-w-[140px] truncate text-[12.5px]">{o.name}</p>
                <p className="text-ed-muted/70 font-mono text-[9.5px] tracking-wide">{o.mobile}</p>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="bg-ed-brand-soft text-ed-muted rounded-full px-2 py-0.5 text-[10.5px] font-bold">{o.product.qty}x</span>
                  <div className="min-w-0">
                    <p className="max-w-[150px] truncate text-[13px] font-medium">{o.product.name}</p>
                    <p className="text-ed-muted/70 max-w-[150px] truncate font-mono text-[9.5px]">{o.product.sku}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <StatusPill o={o} />
              </td>
              <td className="px-4 py-4">
                {o.statusTags.length || o.orderTags.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {o.statusTags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-[#f7c5cd] bg-[#fff1f3] px-2.5 py-1 text-[12px] font-medium text-[#d1203a]">
                        <TriangleAlert className="size-3.5" /> {t}
                      </span>
                    ))}
                    {o.orderTags.map((t) => (
                      <span key={t} className="bg-ed-brand-soft rounded-full px-2.5 py-1 text-[12px] font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-ed-muted">-</span>
                )}
              </td>
              <td className="px-4 py-4 text-right">
                <p className="text-[15px] font-bold">{money(o.amount)}</p>
                {o.payment === 'unpaid' && <span className={cn(pill, 'mt-1 border-[#f7c5cd] bg-[#fff1f3] text-[9.5px] text-[#d1203a]')}>UNPAID</span>}
              </td>
              <td className="px-4 py-4">
                <p className="text-[14.5px]">{fmtDay(o.approvedTs)}</p>
                <p className="text-ed-muted/80 font-mono text-[10.5px]">{fmtTime(o.approvedTs)}</p>
              </td>
              <td className="px-4 py-4">
                <p className="text-[14.5px]">{fmtDay(o.courierTs)}</p>
                <p className="text-ed-muted/80 font-mono text-[10.5px]">{fmtTime(o.courierTs)}</p>
              </td>
              <td className="px-4 py-4">
                <span className="border-ed-line rounded-lg border bg-white px-3 py-1.5 text-[12.5px] font-medium">{o.method}</span>
              </td>
              <td className="text-ed-muted px-4 py-4 text-[13px]">{o.source}</td>
              <td className="px-4 py-4">
                <p className="flex items-center gap-2 text-[14.5px]">
                  {o.tracking}
                  <Info className="text-ed-muted size-3.5" />
                </p>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-ed-blue text-[13.5px] underline">
                  Panel Link
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductsTable({ rows }: { rows: ReturnType<typeof groupProducts> }) {
  return (
    <div className="border-ed-line thin-scroll overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[760px] border-collapse text-[14px]">
        <thead>
          <tr className="bg-ed-bg/60">
            <th className={th}>Product</th>
            <th className={th}>SKU</th>
            <th className={cn(th, 'text-right')}>Orders</th>
            <th className={cn(th, 'text-right')}>Qty</th>
            <th className={cn(th, 'text-right')}>Delivered</th>
            <th className={cn(th, 'text-right')}>Pending Return</th>
            <th className={cn(th, 'text-right')}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="text-ed-muted py-16 text-center text-sm">
                No products found.
              </td>
            </tr>
          )}
          {rows.map((p) => (
            <tr key={p.sku} className="border-ed-line border-t">
              <td className="px-4 py-4 font-medium">{p.name}</td>
              <td className="text-ed-muted px-4 py-4 font-mono text-[11px]">{p.sku}</td>
              <td className="px-4 py-4 text-right">{p.orders}</td>
              <td className="px-4 py-4 text-right">{p.qty}</td>
              <td className="px-4 py-4 text-right">{p.delivered}</td>
              <td className="px-4 py-4 text-right">{p.pendingReturn}</td>
              <td className="px-4 py-4 text-right font-bold">{money(p.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

export function OrdersReport() {
  const [f, setF] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(true);
  const [status, setStatus] = useState('all');
  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [drawer, setDrawer] = useState(false);
  const jobSeq = useRef(1);

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setPage(1);
  };
  const toggleIn = (k: 'statusTags' | 'orderTags', v: string) =>
    set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);

  const scoped = useMemo(() => applyFilters(reportOrders, f), [f]);
  const visible = useMemo(() => (status === 'all' ? scoped : scoped.filter((o) => o.status === status)), [scoped, status]);
  const totalRevenue = scoped.reduce((s, o) => s + o.amount, 0);
  const products = useMemo(() => groupProducts(visible), [visible]);
  const pages = Math.max(1, Math.ceil(visible.length / perPage));
  const cur = Math.min(page, pages);
  const pageRows = visible.slice((cur - 1) * perPage, cur * perPage);
  const active = activeCount(f);

  const startExport = (kind: ExportKind) => {
    const snapshot = visible;
    const id = jobSeq.current++;
    const job: ExportJob = { id, kind, createdAt: Date.now(), total: snapshot.length, ready: false, csv: buildCsv(kind, snapshot) };
    setJobs((j) => [job, ...j]);
    setDrawer(true);
    window.setTimeout(() => setJobs((j) => j.map((x) => (x.id === id ? { ...x, ready: true } : x))), 900);
  };

  const statusTagItems: Item[] = [
    ...STATUS_TAGS_ALERT.map((t, i) => ({ value: t, label: t, pill: true, icon: i === 0 ? UserX : TriangleAlert })),
    ...STATUS_TAGS_PLAIN.map((t) => ({ value: t, label: t })),
  ];
  const tagDisplay = (sel: string[]) => (sel.length === 0 ? 'All tags' : sel.length === 1 ? sel[0] : `${sel.length} tags selected`);

  return (
    <div className="font-dash text-ed-text mt-4 pb-10">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4 px-1">
        <div className="flex items-start gap-3.5">
          <span className="border-ed-line bg-ed-brand-soft text-ed-brand flex size-12 items-center justify-center rounded-xl border">
            <ClipboardList className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <h1 className="text-[30px] leading-tight font-bold">Orders Report</h1>
            <p className="text-ed-muted text-[14.5px]">Showing {visible.length} orders</p>
          </div>
        </div>
        <div className="flex items-center gap-5 pt-3">
          <button
            type="button"
            onClick={() => {
              setF(emptyFilters());
              setStatus('all');
              setPage(1);
            }}
            className="text-ed-muted hover:text-ed-brand flex items-center gap-2 text-[14.5px]"
          >
            <RotateCcw className="size-4" /> Clear ({active})
          </button>
          <Link href="/dashboard/orders/list" className="bg-ed-brand hover:bg-ed-brand/90 flex h-11 items-center gap-2.5 rounded-lg px-4 text-[14.5px] font-semibold text-white shadow-sm">
            <ListChecks className="size-4" /> Open New All Orders List
          </Link>
        </div>
      </div>

      {/* filters */}
      <section className="border-ed-line mt-7 rounded-2xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="border-ed-line bg-ed-brand-soft text-ed-brand flex size-10 items-center justify-center rounded-xl border">
              <Filter className="size-4" />
            </span>
            <h2 className="text-[17px] font-semibold">Filters</h2>
            {active > 0 && <span className="bg-ed-brand-soft rounded-full px-2.5 py-1 text-[12px] font-medium">{active} active</span>}
          </div>
          <button type="button" onClick={() => setShowFilters((s) => !s)} className="hover:text-ed-brand flex items-center gap-2 text-[14.5px]">
            {showFilters ? 'Hide' : 'Show'} {showFilters ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
        {showFilters && (
          <div className="border-ed-line grid grid-cols-1 gap-x-5 gap-y-6 border-t px-5 pt-6 pb-7 sm:grid-cols-2 xl:grid-cols-4">
            <Field label="Filter By">
              <Picker icon={CalendarDays} display={FILTER_BY.find((i) => i.value === f.filterBy)?.label ?? ''} items={FILTER_BY} value={f.filterBy} onChange={(v) => set('filterBy', v)} />
            </Field>
            <Field label="Date Range">
              <DateRangeField value={f.range} onChange={(r) => set('range', r)} />
            </Field>
            <Field label="Approved Time Range">
              <div className="grid grid-cols-2 gap-2">
                <Picker icon={Clock} muted={!f.timeFrom} display={f.timeFrom ? timeLabel(Number(f.timeFrom)) : 'From'} items={TIME_ITEMS} value={f.timeFrom} onChange={(v) => set('timeFrom', v)} />
                <Picker icon={Clock} muted={!f.timeTo} display={f.timeTo ? timeLabel(Number(f.timeTo)) : 'To'} items={TIME_ITEMS} value={f.timeTo} onChange={(v) => set('timeTo', v)} />
              </div>
            </Field>
            <Field label="Search">
              <div className="relative">
                <Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" strokeWidth={1.75} />
                <input
                  value={f.search}
                  onChange={(e) => set('search', e.target.value)}
                  placeholder="Product name or SKU..."
                  className="border-ed-line focus:border-ed-brand/40 focus:ring-ed-brand/10 h-10 w-full rounded-lg border bg-white pr-3 pl-10 text-[14.5px] outline-none focus:ring-2"
                />
              </div>
            </Field>

            <Field label="Source">
              <Picker
                display={f.source || 'All sources'}
                items={[{ value: '', label: 'All sources' }, ...REPORT_SOURCES.map((s) => ({ value: s, label: s }))]}
                value={f.source}
                onChange={(v) => set('source', v)}
              />
            </Field>
            <Field label="Courier">
              <Picker
                icon={Truck}
                display={f.courier || 'All couriers'}
                items={[{ value: '', label: 'All couriers' }, ...REPORT_COURIERS.map((s) => ({ value: s, label: s }))]}
                value={f.courier}
                onChange={(v) => set('courier', v)}
              />
            </Field>
            <Field label="Taken By">
              <Picker
                trailing="updown"
                searchable
                searchPlaceholder="Search users..."
                display={f.takenBy || 'All users'}
                items={[{ value: '', label: 'All users' }, ...REPORT_USERS.map((u) => ({ value: u, label: u }))]}
                value={f.takenBy}
                onChange={(v) => set('takenBy', v)}
              />
            </Field>
            <Field label="Courier Payment Status">
              <Picker
                display={f.payment === 'paid' ? 'Paid' : f.payment === 'unpaid' ? 'Unpaid' : 'All'}
                items={[
                  { value: '', label: 'All' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'unpaid', label: 'Unpaid' },
                ]}
                value={f.payment}
                onChange={(v) => set('payment', v)}
              />
            </Field>

            <Field label="Invoice Search (Order/Courier)">
              <div className="relative">
                <Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" strokeWidth={1.75} />
                <input
                  value={f.invoice}
                  onChange={(e) => set('invoice', e.target.value)}
                  placeholder="Search order or courier invoice..."
                  className="border-ed-line focus:border-ed-brand/40 focus:ring-ed-brand/10 h-10 w-full rounded-lg border bg-white pr-3 pl-10 text-[14.5px] outline-none focus:ring-2"
                />
              </div>
            </Field>
            <Field label="Status Tags">
              <Picker trailing="updown" multi searchable searchPlaceholder="Search tags..." display={tagDisplay(f.statusTags)} items={statusTagItems} value={f.statusTags} onChange={(v) => toggleIn('statusTags', v)} />
            </Field>
            <Field label="Order Tags">
              <Picker trailing="updown" multi searchable searchPlaceholder="Search tags..." display={tagDisplay(f.orderTags)} items={ORDER_TAGS.map((t) => ({ value: t, label: t }))} value={f.orderTags} onChange={(v) => toggleIn('orderTags', v)} />
            </Field>
            <Field label="District Wise Filter" plain>
              <Picker
                icon={MapPin}
                trailing="updown"
                searchable
                searchPlaceholder="Search districts..."
                display={f.district || 'All districts'}
                items={[{ value: '', label: 'All districts' }, ...DISTRICTS.map((d) => ({ value: d, label: d }))]}
                value={f.district}
                onChange={(v) => set('district', v)}
              />
            </Field>
          </div>
        )}
      </section>

      {/* KPI cards */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((k) => {
          const list = k.key === 'all' ? scoped : scoped.filter((o) => o.status === k.key);
          const rev = list.reduce((s, o) => s + o.amount, 0);
          const pct = totalRevenue ? Number(((rev / totalRevenue) * 100).toFixed(1)) : 0;
          const on = status === k.key;
          const Icon = k.icon;
          return (
            <button
              key={k.key}
              type="button"
              onClick={() => {
                setStatus(k.key);
                setPage(1);
              }}
              aria-pressed={on}
              className={cn(
                'flex h-[150px] flex-col rounded-2xl border p-4 text-left transition-shadow hover:shadow-md',
                on ? 'bg-ed-brand border-ed-brand text-white ring-2 ring-[#3f1355] ring-offset-2' : k.card,
              )}
            >
              <div className="flex items-start justify-between">
                <Icon className={cn('size-[18px]', on ? 'text-white' : k.ic)} strokeWidth={1.9} />
                {on && <span className="rounded-md bg-white/25 px-2 py-0.5 text-[10px] font-bold tracking-wide">ACTIVE</span>}
              </div>
              <p className={cn('mt-2 text-[30px] leading-none font-bold', !on && k.num)}>{list.length}</p>
              <p className={cn('mt-2 text-[16px] font-medium tracking-wide uppercase', on ? 'text-white/90' : 'text-ed-muted')}>{k.label}</p>
              <p className={cn('mt-auto text-[15px]', on ? 'text-white/90' : 'text-ed-muted')}>
                Revenue {money(rev)} <span className="mx-1">•</span> {pct}%
              </p>
            </button>
          );
        })}
      </div>

      {/* orders / product report */}
      <section className="border-ed-line mt-6 rounded-2xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
        <div role="tablist" className="border-ed-line flex gap-2 border-b px-4">
          {(
            [
              ['orders', 'Orders'],
              ['products', 'Product Report'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              type="button"
              onClick={() => setTab(k)}
              className={cn('border-b-2 px-3 py-4 text-[15px] transition-colors', tab === k ? 'border-ed-brand text-ed-text' : 'text-ed-muted hover:text-ed-text border-transparent')}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-ed-muted flex items-center gap-2 text-[14px]">
              Rows:
              <span className="relative">
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border-ed-line text-ed-text h-10 w-[74px] appearance-none rounded-lg border bg-white pr-7 pl-3 text-[14px] outline-none"
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2" />
              </span>
            </label>
            <button type="button" onClick={() => startExport(tab === 'products' ? 'Products' : 'Orders')} className="border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-3.5 text-[14px] font-medium">
              <Download className="size-4" /> Export Excel
            </button>
            <button type="button" onClick={() => startExport('Main Report Template')} className="border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-3.5 text-[14px] font-medium">
              <Download className="size-4" /> Export as Main Report Template
            </button>
            <button type="button" onClick={() => setDrawer(true)} className="hover:text-ed-brand h-10 px-3 text-[14px] font-medium">
              Export Center
            </button>
          </div>
          <p className="text-ed-muted mt-3 mb-4 text-[12px]">
            Exports run in the background and appear in the Export Center. They include all filtered active orders; Cancelled and Pending Cancel orders are excluded.
          </p>

          {tab === 'orders' ? <OrdersTable rows={pageRows} /> : <ProductsTable rows={products} />}

          {tab === 'orders' && visible.length > perPage && (
            <div className="text-ed-muted mt-4 flex items-center justify-between text-[13px]">
              <span>
                Page {cur} of {pages} · {visible.length} orders
              </span>
              <div className="flex gap-2">
                <button type="button" disabled={cur <= 1} onClick={() => setPage(cur - 1)} className="border-ed-line text-ed-text flex h-9 items-center gap-1 rounded-lg border bg-white px-3 disabled:opacity-40">
                  <ChevronLeft className="size-4" /> Prev
                </button>
                <button type="button" disabled={cur >= pages} onClick={() => setPage(cur + 1)} className="border-ed-line text-ed-text flex h-9 items-center gap-1 rounded-lg border bg-white px-3 disabled:opacity-40">
                  Next <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {drawer && <ExportCenter jobs={jobs} onNew={startExport} onClose={() => setDrawer(false)} />}
    </div>
  );
}
