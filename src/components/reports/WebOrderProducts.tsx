'use client';

import { useMemo, useState } from 'react';
import { Download, Hash, Layers, ShoppingBag, Tag } from 'lucide-react';
import { webRows, webStatuses, type RangeKey } from '@/data/productReport';
import { btnOut, Switch } from '@/components/products/ui';
import { cn } from '@/lib/utils';
import { BusinessSelect, RangeBar, SearchBox, Stat, StatRow, Title, card, csv, taka } from './ui';

export function WebOrderProducts() {
  const [biz, setBiz] = useState('All Businesses');
  const [range, setRange] = useState<RangeKey>('today');
  const [q, setQ] = useState('');
  const [amount, setAmount] = useState(false);
  const [size, setSize] = useState(20);
  const [page, setPage] = useState(1);
  /** TODO: sudhu aajker data ache - baki range er jonno API lagbe */
  const data = range === 'today' ? webRows : [];
  const rows = useMemo(() => data.filter((r) => `${r.name} ${r.sku}`.toLowerCase().includes(q.toLowerCase())), [data, q]);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const view = rows.slice((page - 1) * size, page * size);
  const sum = (f: (r: (typeof rows)[number]) => number) => rows.reduce((a, r) => a + f(r), 0);
  const label = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  return (
    <div className="p-5 sm:p-6">
      <Title title="Web order product report" sub={<>Aggregated by SKU · window <code className="border-ed-line rounded border bg-[#f7f6fa] px-1.5 py-0.5 text-[12px]">{label}</code></>} />
      <StatRow cols="sm:grid-cols-4">
        <Stat label="Products" value={rows.length} icon={Layers} /><Stat label="Product orders" value={sum((r) => r.orders)} icon={ShoppingBag} />
        <Stat label="Total quantity" value={sum((r) => r.qty)} icon={Tag} /><Stat label="Total amount" value={taka(sum((r) => r.amount))} icon={Hash} />
      </StatRow>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <BusinessSelect value={biz} onChange={setBiz} className="w-[220px] [&_select]:h-11" />
        <RangeBar value={range} onChange={(v) => { setRange(v); setPage(1); }} />
        <SearchBox value={q} onChange={setQ} placeholder="Search by product name, SKU, or variant..." className="min-w-[260px] flex-1 [&_input]:h-11" />
        <label className="text-ed-muted flex items-center gap-2 text-[13px]"><Switch small on={amount} onChange={setAmount} label="Show amount" /> Amount</label>
        <div className="flex items-center gap-2 text-[13px]"><span className="text-ed-muted">Show</span>
          <div role="group" aria-label="Rows" className="flex rounded-lg bg-[#f3f1f7] p-0.5">{[20, 50, 100].map((n) => <button key={n} type="button" aria-pressed={size === n} onClick={() => { setSize(n); setPage(1); }} className={cn('h-8 rounded-md px-2.5', size === n && 'bg-white shadow-sm')}>{n}</button>)}</div>
        </div>
        <button type="button" className={btnOut} onClick={() => csv('web-order-products.csv', ['Product', 'SKU', 'Orders', 'Qty', 'Amount'], rows.map((r) => [r.name, r.sku, r.orders, r.qty, r.amount]))}><Download className="size-4" /> Export</button>
      </div>

      <div className={cn(card, 'mt-4 overflow-hidden')}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-[13.5px]">
            <thead className="text-ed-text/80 border-ed-line border-b bg-[#faf9fc] text-[11.5px] tracking-wide uppercase"><tr>
              {['Product', 'SKU', 'Orders', 'Qty', 'Amount', ...webStatuses].map((h) => <th key={h} scope="col" className="px-3 py-3.5 text-left font-medium whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody>
              {view.map((r) => (
                <tr key={r.id} className="border-ed-line border-b last:border-0">
                  <td className="px-3 py-3"><div className="flex items-center gap-3"><span className="size-9 shrink-0 rounded-md" style={{ background: r.bg }} /><span className="max-w-[220px]">{r.name}</span></div></td>
                  <td className="px-3"><code className="border-ed-line rounded border bg-[#f7f6fa] px-1.5 py-0.5 text-[11px]">{r.sku}</code></td>
                  <td className="px-3">{r.orders}</td><td className="px-3">{r.qty}</td><td className="px-3">{taka(r.amount)}</td>
                  {webStatuses.map((s) => {
                    const n = r.by[s] ?? 0;
                    return (
                      <td key={s} className="px-3">
                        <span className={cn('text-[12px]', n ? 'font-medium' : 'text-ed-muted')}>{n} · {amount ? taka((n / r.qty) * r.amount) : `${n} qty`}</span>
                        <div className="mt-1 h-[3px] w-20 rounded-full bg-[#eceaf2]"><div className="bg-ed-brand h-full rounded-full" style={{ width: `${(n / r.qty) * 100}%` }} /></div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {!view.length && <tr><td colSpan={13} className="text-ed-muted py-12 text-center">No web order products in this range.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="border-ed-line flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-[12px]">
          <span className="text-ed-muted font-mono">Showing {rows.length ? 1 : 0}–{rows.length} of {rows.length} products</span>
          <span className="text-ed-text/70 font-mono">Page {page} of {pages}</span>
        </div>
      </div>
    </div>
  );
}
