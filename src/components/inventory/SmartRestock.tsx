'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle, BarChart3, Bell, BookOpen, Box, Calculator, Calendar, PackageX, RefreshCw, ShoppingCart, Skull, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { cn } from '@/lib/utils';

const stats = [
  { label: 'Low Stock', value: 0, bar: 'border-l-[#f59e0b]', num: 'text-ed-text', bubble: 'bg-[#fdf0c3] text-[#d97706]', icon: AlertTriangle },
  { label: 'Critical', value: 0, bar: 'border-l-[#ef1d2f]', num: 'text-[#e5090f]', bubble: 'bg-[#fde2e4] text-[#e5243b]', icon: PackageX },
  { label: 'Out of Stock', value: 0, bar: 'border-l-[#9ca3af]', num: 'text-ed-text', bubble: 'bg-[#f0f0f3] text-[#4b5563]', icon: Box },
  { label: 'Active Alerts', value: 0, bar: 'border-l-[#2f6bff]', num: 'text-ed-text', bubble: 'bg-[#dce8fd] text-[#2f5fe8]', icon: Bell },
];

const actions = [
  { label: 'Dead Stock', sub: 'Find stuck inventory', bubble: 'bg-[#f0f0f3] text-[#4b5563]', icon: Skull },
  { label: 'ABC Analysis', sub: 'Prioritize products', bubble: 'bg-[#dce8fd] text-[#2f5fe8]', icon: BarChart3 },
  { label: 'Forecast', sub: 'Predict demand', bubble: 'bg-[#d8f7e4] text-[#16a34a]', icon: Calendar },
  { label: 'New Purchase', sub: 'Add stock', bubble: 'bg-[#f1e4fd] text-[#a21fe0]', icon: ShoppingCart },
];

const outBtn = 'border-ed-line hover:text-ed-brand flex h-9 items-center gap-2 rounded-lg border bg-white px-3.5 text-[12.5px] shadow-sm';

export function SmartRestock() {
  const [analyzed, setAnalyzed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2400); };
  const recalc = () => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => { setBusy(false); setAnalyzed(true); flash('Analytics updated from the last 90 days of orders'); }, 700);
  };
  const refresh = () => { setBusy(true); setTimeout(() => { setBusy(false); flash('Refreshed'); }, 400); };

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center justify-end gap-2.5 py-3">
        <Link href="/dashboard/inventory/smart-restock/guide" className={outBtn}><BookOpen className="size-3.5" /> Guide</Link>
        <button type="button" onClick={recalc} disabled={busy} className="bg-ed-brand flex h-9 items-center gap-2 rounded-lg px-3.5 text-[12.5px] font-medium text-white shadow-sm hover:brightness-110 disabled:opacity-70">
          <Calculator className="size-3.5" /> Recalculate Analytics
        </button>
        <button type="button" onClick={refresh} className={outBtn}><RefreshCw className={cn('size-3.5', busy && 'animate-spin')} /> Refresh</button>
      </div>

      {msg && <p role="status" className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-[13px] font-medium text-green-700">{msg}</p>}

      {!analyzed && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#b9d3fb] bg-[#eef5ff] px-4 py-3.5">
          <div className="flex items-center gap-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#dce8fd] text-[#2f5fe8]"><Calculator className="size-4.5" /></span>
            <div>
              <p className="text-[14px] font-medium text-[#1e40af]">Welcome to Smart Restock!</p>
              <p className="text-[12px] text-[#2f6bff]">Click &quot;Recalculate Analytics&quot; to analyze your last 90 days of order history and populate the dashboard with insights.</p>
            </div>
          </div>
          <button type="button" onClick={recalc} disabled={busy} className="flex h-9 items-center gap-2 rounded-lg bg-[#1d5cff] px-4 text-[12.5px] font-medium text-white hover:brightness-110 disabled:opacity-70"><Calculator className="size-3.5" /> Get Started</button>
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className={cn('flex items-center justify-between border-l-4 px-5 py-5', s.bar)}>
            <div><p className="text-ed-muted text-[12px]">{s.label}</p><p className={cn('text-[24px] leading-tight font-medium', s.num)}>{s.value}</p></div>
            <span className={cn('flex size-9 items-center justify-center rounded-full', s.bubble)}><s.icon className="size-4" /></span>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 text-[15px]">Quick Actions</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((a) => (
          <button key={a.label} type="button" onClick={() => flash(`${a.label}: run Recalculate Analytics first to see results`)} className="border-ed-line hover:border-ed-brand/30 flex h-[150px] flex-col items-center justify-center rounded-xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)] transition hover:shadow-md">
            <span className={cn('flex size-12 items-center justify-center rounded-xl', a.bubble)}><a.icon className="size-5" /></span>
            <span className="mt-3 text-[13.5px] font-medium">{a.label}</span>
            <span className="text-ed-muted mt-1 text-[10.5px]">{a.sub}</span>
          </button>
        ))}
      </div>

      <Card className="mt-6 overflow-hidden">
        <p className="border-ed-line border-b px-5 py-3.5 text-[13.5px] font-medium">Products Needing Reorder</p>
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#d8f7e4] text-[#16a34a]"><Box className="size-5" /></span>
          <p className="mt-4 text-[13px] text-[#16a34a]">All products are well stocked!</p>
          <p className="text-ed-muted mt-1 text-[11.5px]">No items need reordering at this time.</p>
        </div>
      </Card>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {[{ t: 'Fast Moving', icon: TrendingUp, cls: 'bg-[#d8f7e4] text-[#16a34a]' }, { t: 'Slow Moving', icon: TrendingDown, cls: 'bg-[#fde2e4] text-[#e5243b]' }].map((c) => (
          <Card key={c.t} className="overflow-hidden">
            <p className="border-ed-line flex items-center gap-2.5 border-b px-4 py-3 text-[13.5px] font-medium"><span className={cn('flex size-6 items-center justify-center rounded-md', c.cls)}><c.icon className="size-3.5" /></span>{c.t}</p>
            <p className="text-ed-muted py-9 text-center text-[11.5px]">No sales data available</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
