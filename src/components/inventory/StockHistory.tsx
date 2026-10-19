'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Calendar, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, ExternalLink, HelpCircle, Package, RotateCw, XCircle, AlertCircle } from 'lucide-react';
import { findProduct, isIn, moveTypes, type MoveType, type StockMove } from '@/data/inventory';
import { Popover } from '@/components/courier/ui';
import { Card } from '@/components/dashboard/Card';
import { cn } from '@/lib/utils';

type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'lastmonth' | 'year' | 'lastyear' | 'lifetime';
const quick: { key: RangeKey; label: string; icon: typeof Clock }[] = [
  { key: 'today', label: 'Today', icon: Clock },
  { key: 'yesterday', label: 'Yesterday', icon: Clock },
  { key: '7d', label: 'Last 7 days', icon: Calendar },
  { key: '30d', label: 'Last 30 days', icon: Calendar },
];
const extended: { key: RangeKey; label: string }[] = [
  { key: 'month', label: 'This month' }, { key: 'lastmonth', label: 'Last month' },
  { key: 'year', label: 'This year' }, { key: 'lastyear', label: 'Last year' }, { key: 'lifetime', label: 'Lifetime' },
];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (d: Date) => `${MON[d.getMonth()]} ${d.getDate()}`;
const day = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

function getRange(key: RangeKey, off: number, now: Date) {
  const t = day(now, 0);
  if (key === 'today' || key === 'yesterday') {
    const d = day(t, -off - (key === 'yesterday' ? 1 : 0));
    const diff = Math.round((t.getTime() - d.getTime()) / 864e5);
    return { from: d, to: d, label: diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : fmt(d) };
  }
  if (key === '7d' || key === '30d') {
    const n = key === '7d' ? 7 : 30;
    const to = day(t, -off * n), from = day(to, -(n - 1));
    return { from, to, label: off ? `${fmt(from)} – ${fmt(to)}` : `Last ${n} days` };
  }
  if (key === 'month' || key === 'lastmonth') {
    const m = now.getMonth() - off - (key === 'lastmonth' ? 1 : 0);
    const from = new Date(now.getFullYear(), m, 1), to = new Date(now.getFullYear(), m + 1, 0);
    return { from, to, label: !off ? (key === 'month' ? 'This month' : 'Last month') : `${MON[from.getMonth()]} ${from.getFullYear()}` };
  }
  if (key === 'year' || key === 'lastyear') {
    const y = now.getFullYear() - off - (key === 'lastyear' ? 1 : 0);
    return { from: new Date(y, 0, 1), to: new Date(y, 11, 31), label: !off ? (key === 'year' ? 'This year' : 'Last year') : String(y) };
  }
  return { from: new Date(2000, 0, 1), to: t, label: 'Lifetime' };
}

const sum = (m: StockMove[], t: MoveType) => m.filter((x) => x.type === t).reduce((a, x) => a + x.qty, 0);

function Trend({ moves, from, to, current }: { moves: StockMove[]; from: Date; to: Date; current: number }) {
  const [mode, setMode] = useState<'Movements' | 'Stock Level'>('Movements');
  const monthly = (to.getTime() - from.getTime()) / 864e5 > 62;
  const buckets = useMemo(() => {
    const out: { label: string; start: number; end: number }[] = [];
    if (monthly) {
      const first = moves.length ? new Date(Math.max(from.getTime(), Math.min(...moves.map((m) => +new Date(m.at))))) : to;
      for (let d = new Date(first.getFullYear(), first.getMonth(), 1); d <= to; d = new Date(d.getFullYear(), d.getMonth() + 1, 1))
        out.push({ label: `${MON[d.getMonth()]} ${d.getFullYear() % 100}`, start: +d, end: +new Date(d.getFullYear(), d.getMonth() + 1, 1) });
    } else for (let d = from; d <= to; d = day(d, 1)) out.push({ label: fmt(d), start: +d, end: +day(d, 1) });
    return out;
  }, [moves, from, to, monthly]);

  const data = buckets.map((b) => {
    const m = moves.filter((x) => +new Date(x.at) >= b.start && +new Date(x.at) < b.end);
    return { ...b, in: m.filter((x) => isIn(x.type)).reduce((a, x) => a + x.qty, 0), out: m.filter((x) => !isIn(x.type)).reduce((a, x) => a + x.qty, 0) };
  });
  // stock level: current stock theke ulta hisab kore
  let lvl = current; const levels: number[] = [];
  for (let i = data.length - 1; i >= 0; i--) { levels[i] = lvl; lvl -= data[i].in - data[i].out; }

  const vals = mode === 'Movements' ? data.flatMap((d) => [d.in, d.out]) : levels;
  const max = Math.max(4, ...vals), min = mode === 'Stock Level' ? Math.min(0, ...levels) : 0;
  const ticks = Array.from({ length: 5 }, (_, i) => Math.round(min + ((max - min) * (4 - i)) / 4));
  const W = 1000, H = 210, L = 44, R = 12, T = 12, B = 30;
  const y = (v: number) => T + (H - T - B) * (1 - (v - min) / (max - min || 1));
  const x = (i: number) => L + ((W - L - R) * (i + 0.5)) / Math.max(1, data.length);
  const bw = Math.min(24, (W - L - R) / Math.max(1, data.length) / 3);
  const step = Math.ceil(data.length / 12);

  return (
    <Card className="mt-5 overflow-hidden">
      <div className="border-ed-line flex items-center justify-between border-b px-5 py-3.5">
        <p className="text-[15px]">Stock Trend <span className="text-ed-muted ml-1 text-[11px]">{monthly ? 'Monthly' : 'Daily'}</span></p>
        <div className="bg-ed-bg flex rounded-lg p-0.5 text-[11px]">
          {(['Movements', 'Stock Level'] as const).map((k) => (
            <button key={k} type="button" onClick={() => setMode(k)} className={cn('rounded-md px-3 py-1.5', mode === k ? 'text-ed-text bg-white shadow-sm' : 'text-ed-brand/70')}>{k}</button>
          ))}
        </div>
      </div>
      <div className="px-4 py-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Stock trend">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#e9e6ee" strokeDasharray="3 4" />
              <text x={L - 18} y={y(t) + 3} fontSize="10" fill="#8b869a" textAnchor="end">{t}</text>
            </g>
          ))}
          {mode === 'Movements'
            ? data.map((d, i) => (
                <g key={d.start}>
                  {d.in > 0 && <rect x={x(i) - bw} y={y(d.in)} width={bw} height={y(0) - y(d.in)} fill="#16a34a" rx="2" />}
                  {d.out > 0 && <rect x={x(i)} y={y(d.out)} width={bw} height={y(0) - y(d.out)} fill="#e5243b" rx="2" />}
                </g>
              ))
            : levels.length > 0 && <polyline fill="none" stroke="#3f1355" strokeWidth="2" points={levels.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />}
          {data.map((d, i) => (i % step === 0 || data.length === 1) && <text key={d.start} x={x(i)} y={H - 8} fontSize="10" fill="#8b869a" textAnchor="middle">{d.label}</text>)}
        </svg>
      </div>
    </Card>
  );
}

function Activity({ label, value, sub, valCls, icon: Icon, iconCls }: { label: string; value: number; sub: string; valCls: string; icon: typeof Clock; iconCls: string }) {
  return (
    <Card className="flex items-center justify-between px-5 py-4">
      <div><p className="text-ed-muted text-[11px]">{label}</p><p className={cn('mt-1 text-[22px] leading-tight font-medium', valCls)}>{value}</p><p className="text-ed-muted text-[11px]">{sub}</p></div>
      <Icon className={cn('size-8 opacity-70', iconCls)} strokeWidth={1.5} />
    </Card>
  );
}

const sheetRow = 'flex items-center justify-between px-3.5 py-3.5 text-[13.5px] text-ed-muted';

export function StockHistory({ id }: { id: string }) {
  const product = findProduct(id);
  const [now] = useState(() => new Date());
  const [key, setKey] = useState<RangeKey>('today');
  const [off, setOff] = useState(0);
  const [menu, setMenu] = useState<DOMRect | null>(null);
  const [filter, setFilter] = useState<'All Movements' | MoveType>('All Movements');
  const [recOpen, setRecOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [counted, setCounted] = useState('');

  if (!product) {
    return (
      <div className="mx-auto max-w-[1400px] pt-10 text-center text-[14px]">
        <p>Product not found.</p>
        <Link href="/dashboard/inventory" className="text-ed-brand mt-3 inline-block underline">Back to Inventory Dashboard</Link>
      </div>
    );
  }

  const { from, to, label } = getRange(key, off, now);
  const inRange = product.moves.filter((m) => { const t = +new Date(m.at); return t >= +from && t < +day(to, 1); });
  const rows = inRange.filter((m) => filter === 'All Movements' || m.type === filter);
  const totalIn = moveTypes.filter(isIn).reduce((a, t) => a + sum(inRange, t), 0);
  const totalOut = moveTypes.filter((t) => !isIn(t)).reduce((a, t) => a + sum(inRange, t), 0);
  const net = totalIn - totalOut;
  const delivered = sum(inRange, 'Order Sale'), returned = sum(inRange, 'Return');
  const cur = product.stock;
  const pick = (k: RangeKey) => { setKey(k); setOff(0); setMenu(null); };
  const iconBtn = 'border-ed-line hover:text-ed-brand flex h-10 items-center border bg-white text-[13.5px]';

  const sheet = (head: string, items: [string, number, string][], sign: '+' | '-') => (
    <div>
      <div className="text-ed-muted flex items-center justify-between px-3.5 py-3.5 text-[13px] tracking-wide uppercase"><span>{head}</span><span className="normal-case">Qty</span></div>
      {items.map(([n, v]) => <div key={n} className={sheetRow}><span>{n}</span><span>{sign}{v}</span></div>)}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] pt-7">
      <header className="flex flex-wrap items-start justify-between gap-4 px-1">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/inventory" aria-label="Back" className="hover:text-ed-brand mt-2"><ArrowLeft className="size-4" /></Link>
          <div>
            <h1 className="text-[24px] leading-tight font-medium tracking-tight">Stock History</h1>
            <p className="text-ed-text/70 text-[13px]">{product.name} ({product.sku}) — Current Stock: <b className="text-ed-text font-medium">{cur}</b></p>
          </div>
        </div>
        <div className="flex">
          <button type="button" aria-label="Previous period" disabled={key === 'lifetime'} onClick={() => setOff((o) => o + 1)} className={cn(iconBtn, 'w-9 justify-center rounded-l-lg disabled:opacity-40')}><ChevronLeft className="size-3.5" /></button>
          <button type="button" aria-haspopup="listbox" aria-expanded={!!menu} onClick={(e) => setMenu(menu ? null : e.currentTarget.getBoundingClientRect())} className={cn(iconBtn, 'gap-2 rounded-r-lg border-l-0 px-3.5')}>
            <Calendar className="size-3.5" /> {label} {menu ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </div>
      </header>

      {!product.manageStock && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-300 bg-[#fff8d9] px-4 py-3.5 text-amber-900">
          <Clock className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-[14.5px]">Stock Management Disabled</p>
            <p className="mt-0.5 text-[12.5px] text-amber-800">Stock tracking is turned OFF for this product. Stock movements are not being recorded. Enable &quot;Manage Stock&quot; in product settings to track inventory.</p>
          </div>
        </div>
      )}

      <p className="text-ed-text/80 mt-5 px-0.5 text-[13px]">Order Activity in Selected Period</p>
      <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Activity label="Delivered" value={delivered} sub={`${delivered} units`} valCls="text-[#16a34a]" icon={CheckCircle2} iconCls="text-[#16a34a]" />
        <Activity label="Pending Delivery" value={0} sub="0 units reserved" valCls="text-[#d97706]" icon={Clock} iconCls="text-[#f5b335]" />
        <Activity label="Returned" value={returned} sub={`${returned} units back`} valCls="text-[#2f5fe8]" icon={RotateCw} iconCls="text-[#2f5fe8]" />
        <Activity label="Cancelled" value={0} sub="0 units freed" valCls="text-ed-text" icon={XCircle} iconCls="text-ed-muted" />
      </div>

      <Card className="mt-5 overflow-hidden">
        <p className="border-ed-line border-b px-5 py-3.5 text-[15px]">Stock Balance Sheet</p>
        <div className="px-5 pb-8">
          <div className="grid md:grid-cols-2 md:gap-x-0">
            <div className="border-ed-line border-b">{sheet('Stock In', [['Purchases', sum(inRange, 'Purchase'), ''], ['Returns (Customer)', sum(inRange, 'Return'), ''], ['Adjustments In', sum(inRange, 'Adjustment In'), ''], ['Transfers In', sum(inRange, 'Transfer In'), '']], '+')}</div>
            <div className="border-ed-line border-b">{sheet('Stock Out', [['Order Sales', sum(inRange, 'Order Sale'), ''], ['Adjustments Out', sum(inRange, 'Adjustment Out'), ''], ['Transfers Out', sum(inRange, 'Transfer Out'), '']], '-')}</div>
            <div className="flex items-center justify-between px-3.5 py-4 text-[13.5px]"><b className="font-medium">Total In</b><b className="font-medium text-[#16a34a]">+{totalIn}</b></div>
            <div className="flex items-center justify-between px-3.5 py-4 text-[13.5px]"><b className="font-medium">Total Out</b><b className="font-medium text-[#e5243b]">-{totalOut}</b></div>
          </div>
          <p className={cn('border-ed-line mt-2 border-t pt-6 text-center text-[17px] font-medium tracking-tight uppercase', net < 0 ? 'text-[#e5243b]' : 'text-[#16a34a]')}>Net Change: {net >= 0 ? '+' : ''}{net}</p>
        </div>
      </Card>

      <Trend moves={inRange} from={from} to={to} current={cur} />

      <Card className="mt-5 overflow-hidden">
        <button type="button" aria-expanded={recOpen} onClick={() => setRecOpen((o) => !o)} className="flex w-full items-center justify-between px-5 py-5 text-left text-[15px]">
          Reconcile Stock <ChevronRight className={cn('size-4 transition-transform', recOpen && 'rotate-90')} />
        </button>
        {recOpen && (
          <div className="border-ed-line flex flex-wrap items-end gap-3 border-t px-5 py-4">
            <label className="text-ed-muted text-[11.5px]">Counted quantity
              <input type="number" value={counted} onChange={(e) => setCounted(e.target.value)} placeholder={String(cur)} className="border-ed-line focus:border-ed-brand/40 mt-1 block h-10 w-[180px] rounded-lg border px-3 text-[13.5px] text-ed-text outline-none" />
            </label>
            <button type="button" disabled={counted === ''} className="bg-ed-brand h-10 rounded-lg px-5 text-[13.5px] font-medium text-white disabled:opacity-50">Reconcile</button>
            {counted !== '' && <p className="text-ed-muted text-[12px]">Difference: {Number(counted) - cur > 0 ? '+' : ''}{Number(counted) - cur}</p>}
          </div>
        )}
      </Card>

      <Card className="mt-5 overflow-hidden">
        <div className="border-ed-line flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
          <p className="text-[15px]">Stock History - {product.name}</p>
          <div className="flex items-center gap-5">
            <a href="#" onClick={(e) => e.preventDefault()} className="text-ed-brand flex items-center gap-1.5 text-[11.5px] hover:underline">View in Stock Ledger <ExternalLink className="size-3.5" /></a>
            <div className="relative">
              <select aria-label="Movement filter" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="border-ed-line h-9 w-[150px] cursor-pointer appearance-none rounded-lg border bg-white pr-8 pl-3 text-[11.5px] outline-none">
                <option>All Movements</option>{moveTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2" />
            </div>
          </div>
        </div>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <Package className="text-ed-muted size-10" strokeWidth={1.3} />
            <p className="text-ed-muted mt-3 text-[13px]">No stock history found for this product.</p>
            <p className="text-ed-muted text-[11.5px]">Stock movements will appear here as they occur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-[13px]">
            <thead><tr className="text-ed-muted border-ed-line border-b text-[12px]"><th className="px-5 py-3 font-normal">Date</th><th className="font-normal">Type</th><th className="font-normal">Note</th><th className="px-5 text-right font-normal">Qty</th></tr></thead>
            <tbody>{rows.map((m) => (
              <tr key={m.id} className="border-ed-line border-b last:border-b-0"><td className="px-5 py-3.5">{new Date(m.at).toLocaleString()}</td><td>{m.type}</td><td className="text-ed-muted">{m.note ?? '-'}</td><td className={cn('px-5 text-right font-medium', isIn(m.type) ? 'text-[#16a34a]' : 'text-[#e5243b]')}>{isIn(m.type) ? '+' : '-'}{m.qty}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </Card>

      <div className="mt-5">
        <button type="button" aria-expanded={helpOpen} onClick={() => setHelpOpen((o) => !o)} className="border-ed-line text-ed-text/80 flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[13px]">
          <HelpCircle className="size-4" /> How to use this page <ChevronDown className={cn('size-3.5 transition-transform', helpOpen && 'rotate-180')} />
        </button>
        {helpOpen && (
          <Card className="text-ed-text/80 mt-2 flex items-start gap-2.5 px-4 py-3.5 text-[12.5px]">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            Pick a period at the top to see the balance sheet, trend and movement list for that range. Use the arrow beside the period to jump to the previous one, and Reconcile Stock to correct the count.
          </Card>
        )}
      </div>

      {menu && (
        <Popover anchor={menu} width={222} onClose={() => setMenu(null)}>
          <div role="listbox" className="thin-scroll max-h-[362px] overflow-y-auto p-1.5">
            <p className="text-ed-muted px-2.5 pt-2 pb-1.5 text-[9.5px] tracking-wider uppercase">Quick select</p>
            {quick.map(({ key: k, label: l, icon: I }) => (
              <button key={k} role="option" aria-selected={k === key} type="button" onClick={() => pick(k)} className={cn('flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px]', k === key ? 'bg-ed-brand-soft' : 'hover:bg-ed-bg')}>
                <I className="text-ed-muted size-3.5" /><span className="flex-1">{l}</span>
                {k === key && <span className="bg-ed-brand flex size-[18px] items-center justify-center rounded-full"><Check className="size-3 text-white" /></span>}
              </button>
            ))}
            <div className="bg-ed-line my-2 h-px" />
            <p className="text-ed-muted px-2.5 pt-1 pb-1.5 text-[9.5px] tracking-wider uppercase">Extended range</p>
            {extended.map(({ key: k, label: l }) => (
              <button key={k} role="option" aria-selected={k === key} type="button" onClick={() => pick(k)} className={cn('flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px]', k === key ? 'bg-ed-brand-soft' : 'hover:bg-ed-bg')}>
                <Calendar className="text-ed-muted size-3.5" /><span className="flex-1">{l}</span>
                {k === key && <span className="bg-ed-brand flex size-[18px] items-center justify-center rounded-full"><Check className="size-3 text-white" /></span>}
              </button>
            ))}
          </div>
        </Popover>
      )}
    </div>
  );
}
