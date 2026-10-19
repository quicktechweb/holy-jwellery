'use client';

import Link from 'next/link';
import { useMemo, useState, type ElementType } from 'react';
import { AlertCircle, AlertTriangle, ArrowLeft, BookOpen, Box, ChevronDown, RefreshCw, Search } from 'lucide-react';
import { stockAlertSeed } from '@/data/inventory';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'out' | 'critical';
const card = 'border-ed-line rounded-xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)]';
const btn = 'border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[13.5px] whitespace-nowrap shadow-sm transition disabled:opacity-60';
/** critical = stock ache kintu alert qty-r ordhek ba tar kom */
const level = (stock: number, alertQty: number): 'out' | 'critical' | 'low' => (stock <= 0 ? 'out' : stock <= Math.ceil(alertQty / 2) ? 'critical' : 'low');

export function LowStockAlerts() {
  const [data, setData] = useState(stockAlertSeed);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All categories');
  const [filter, setFilter] = useState<Filter>('all');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const cats = useMemo(() => ['All categories', ...Array.from(new Set(data.map((d) => d.category).filter(Boolean)))], [data]);
  const scoped = useMemo(() => data.filter((d) => (cat === 'All categories' || d.category === cat) && `${d.name} ${d.sku}`.toLowerCase().includes(q.toLowerCase())), [data, q, cat]);
  const out = scoped.filter((d) => level(d.stock, d.alertQty) === 'out');
  const crit = scoped.filter((d) => level(d.stock, d.alertQty) === 'critical');
  const rows = filter === 'out' ? out : filter === 'critical' ? crit : scoped;

  const recalc = () => {
    setBusy(true);
    // TODO: API call - ekhane shudhu list refresh hocche
    setTimeout(() => { setData([...stockAlertSeed]); setBusy(false); setToast('Alerts recalculated.'); setTimeout(() => setToast(''), 2500); }, 600);
  };

  const tile = (k: Filter, label: string, n: number, Icon: ElementType) => (
    <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}
      className={cn(card, 'px-4 pt-4 pb-3.5 text-left transition', filter === k ? 'border-ed-brand/50 bg-ed-brand-soft ring-ed-brand/20 ring-2' : 'hover:border-ed-brand/30')}>
      <div className="flex items-center justify-between">
        <p className="text-ed-text/80 text-[12px] font-medium tracking-wide uppercase">{label}</p>
        <Icon className="text-ed-muted size-4" />
      </div>
      <p className="mt-3 flex items-baseline gap-2"><span className="text-[32px] leading-none font-medium">{n}</span><span className="text-ed-muted text-[12px]">items</span></p>
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-[1024px] py-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link href="/dashboard/inventory" aria-label="Back to inventory dashboard" className="hover:text-ed-brand mt-1.5 flex size-6 items-center justify-center"><ArrowLeft className="size-4" /></Link>
          <div>
            <h1 className="text-[24px] leading-tight font-medium tracking-tight">Low Stock Alerts</h1>
            <p className="text-ed-text/70 mt-0.5 text-[13px]">Manage inventory levels and restock recommendations.</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button type="button" onClick={recalc} disabled={busy} className={btn}><RefreshCw className={cn('size-4', busy && 'animate-spin')} /> Recalculate</button>
          <Link href="/dashboard/inventory/smart-restock/guide" className={btn}><BookOpen className="size-4" /> Guide</Link>
        </div>
      </header>

      {toast && <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-[13px] font-medium text-green-700">{toast}</p>}

      <div className="mt-5 flex flex-wrap gap-3 sm:flex-nowrap">
        <label className="relative block min-w-0 flex-1">
          <Search className="text-ed-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by product name or SKU..." aria-label="Search by product name or SKU"
            className="border-ed-line focus:border-ed-brand/40 h-10 w-full rounded-lg border bg-white pr-3 pl-10 text-[13.5px] outline-none" />
        </label>
        <div className="relative w-full sm:w-[224px]">
          <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}
            className="border-ed-line focus:border-ed-brand/40 h-10 w-full cursor-pointer appearance-none rounded-lg border bg-white pr-9 pl-3 text-[13px] outline-none">
            {cats.map((c) => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {tile('all', 'All alerts', scoped.length, AlertCircle)}
        {tile('out', 'Out of stock', out.length, Box)}
        {tile('critical', 'Critical stock', crit.length, AlertTriangle)}
      </div>

      {rows.length ? (
        <div className={cn(card, 'mt-5 overflow-x-auto')}>
          <table className="w-full min-w-[680px] text-[13.5px]">
            <thead className="border-ed-line border-b bg-[#faf9fc] text-left"><tr>
              {['Product', 'SKU', 'Category', 'Stock', 'Alert qty', 'Status'].map((h) => <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {rows.map((r) => {
                const l = level(r.stock, r.alertQty);
                return (
                  <tr key={r.id} className="border-ed-line border-b last:border-0">
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><span className="size-9 shrink-0 rounded-md bg-[#eee]" style={{ background: r.bg }} />{r.name}</div></td>
                    <td className="px-4 font-mono text-[12px]">{r.sku}</td><td className="px-4">{r.category || '—'}</td>
                    <td className="px-4 font-medium">{r.stock}</td><td className="px-4">{r.alertQty}</td>
                    <td className="px-4"><span className={cn('rounded-full px-2.5 py-1 text-[11.5px] font-medium', l === 'out' ? 'bg-red-50 text-red-600' : l === 'critical' ? 'bg-orange-50 text-orange-600' : 'bg-amber-50 text-amber-600')}>{l === 'out' ? 'Out of stock' : l === 'critical' ? 'Critical' : 'Low'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={cn(card, 'text-ed-muted mt-5 px-6 py-14 text-center')}>
          <AlertCircle className="text-ed-text/35 mx-auto size-10" strokeWidth={1.5} />
          <p className="text-ed-text mt-4 text-[15px] font-medium">No alerts found</p>
          <p className="mt-1 text-[12.5px]">All clear! All product stocks are above minimum thresholds.</p>
        </div>
      )}
    </div>
  );
}
