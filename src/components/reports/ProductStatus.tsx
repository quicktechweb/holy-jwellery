'use client';

import { useMemo, useState } from 'react';
import { BadgePercent, Download, Package, SlidersHorizontal, TrendingUp, Wallet, Coins } from 'lucide-react';
import { salesStats, unitsFor, type RangeKey } from '@/data/productReport';
import { btnOut } from '@/components/products/ui';
import { cn } from '@/lib/utils';
import { BusinessSelect, Chips, RangeBar, SearchBox, SortTh, Stat, StatRow, Title, card, csv, taka, useSort } from './ui';

const states = [
  { k: 'Pending', tone: 'border-blue-500 text-blue-600', share: 0.2 },
  { k: 'RTS', tone: 'border-sky-500 text-sky-600', share: 0.1 },
  { k: 'Shipped', tone: 'border-orange-400 text-orange-500', share: 0.15 },
  { k: 'Delivered', tone: 'border-green-500 text-green-600', share: 0.45 },
  { k: 'Returned', tone: 'border-red-300 text-red-500', share: 0.06 },
  { k: 'Preorder', tone: 'border-zinc-300 text-zinc-500', share: 0.02 },
  { k: 'Other', tone: 'border-purple-300 text-purple-500', share: 0.02 },
] as const;
type St = (typeof states)[number]['k'];

export function ProductStatus({ initialStatuses }: { initialStatuses?: string[] }) {
  const [biz, setBiz] = useState('All Businesses');
  const [range, setRange] = useState<RangeKey>('today');
  const [picked, setPicked] = useState<St[]>((initialStatuses as St[]) ?? ['Pending', 'RTS', 'Shipped', 'Delivered']);
  const [q, setQ] = useState('');
  const [show, setShow] = useState<'qty' | 'amt'>('qty');
  const [layout, setLayout] = useState<'table' | 'matrix'>('table');
  const [by, setBy] = useState<'count' | 'pct'>('count');
  const { sort, onSort } = useSort('total');

  const rows = useMemo(() => salesStats.map((s) => {
    const total = unitsFor(s, range);
    const cnt = Object.fromEntries(states.map((x) => [x.k, Math.round(total * x.share)])) as Record<St, number>;
    const money = total * s.price;
    return { ...s, total, cnt, money, discount: Math.round(money * 0.04), pcost: total * s.cost, net: total * (s.price - s.cost) };
  }).filter((r) => r.total > 0 && r.name.toLowerCase().includes(q.toLowerCase()) && (!picked.length || picked.some((p) => r.cnt[p] > 0)))
    .sort((a, b) => ((a as never)[sort.k] - (b as never)[sort.k]) * sort.d), [range, q, picked, sort]);

  const sum = (f: (r: (typeof rows)[number]) => number) => rows.reduce((a, r) => a + f(r), 0);
  const toggle = (k: St) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const cell = (r: (typeof rows)[number], k: St) => {
    const n = r.cnt[k];
    if (by === 'pct') return `${r.total ? ((n / r.total) * 100).toFixed(0) : 0}%`;
    return show === 'amt' ? taka(n * r.price) : n;
  };

  return (
    <div className="p-5 sm:p-6">
      <Title title="Product status report" sub="Per-product breakdown across Pending, RTS, Shipped, Delivered, Returned, Preorder, and Other states."
        right={<>
          <BusinessSelect value={biz} onChange={setBiz} className="w-[220px] [&_select]:h-11" />
          <RangeBar value={range} onChange={setRange} />
          <button type="button" className={btnOut} onClick={() => csv('product-status.csv', ['Name', 'Total Money', 'Discount', 'Cost', 'Net Profit', 'Total', ...states.map((s) => s.k)], rows.map((r) => [r.name, r.money, r.discount, r.pcost, r.net, r.total, ...states.map((s) => r.cnt[s.k])]))}><Download className="size-4" /> Download</button>
        </>} />

      <StatRow cols="sm:grid-cols-5">
        <Stat label="Units" value={sum((r) => r.total)} icon={Package} tone="bg-[#eeeff7] text-[#4a4f8a]" />
        <Stat label="Total Money" value={sum((r) => r.money)} icon={Wallet} tone="bg-[#f1e6ff] text-[#9333ea]" />
        <Stat label="Discount Given" value={sum((r) => r.discount)} icon={BadgePercent} tone="bg-[#fff1d6] text-[#d97706]" />
        <Stat label="Product Cost" value={sum((r) => r.pcost)} icon={Coins} tone="bg-[#ffecd9] text-[#ea580c]" />
        <Stat label="Net Profit" value={sum((r) => r.net)} icon={TrendingUp} tone="bg-[#e3f8ec] text-[#16a34a]" />
      </StatRow>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {states.map(({ k, tone }) => {
          const on = picked.includes(k);
          const n = sum((r) => r.cnt[k]);
          return (
            <button key={k} type="button" aria-pressed={on} onClick={() => toggle(k)}
              className={cn('rounded-xl border-2 px-3.5 py-2.5 text-left transition', on ? tone : 'border-ed-line text-ed-muted opacity-80 hover:opacity-100')}>
              <p className="text-[13px] font-medium">{k}</p><p className="text-[22px] leading-tight font-medium">{n}</p>
              <p className="text-ed-muted text-[11px]">{n} · {rows.filter((r) => r.cnt[k] > 0).length} products</p>
            </button>
          );
        })}
      </div>
      <p className="text-ed-text/70 mt-2 text-[12.5px]">
        {picked.length ? <>Products with any <b className="text-ed-text font-medium">{picked.join(' or ')}</b>{' '}<button type="button" className="text-ed-brand ml-1" onClick={() => setPicked([])}>Clear</button></> : 'Showing all statuses'}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search by name or SKU..." className="w-full max-w-[320px]" />
        <span className="text-ed-text/70 text-[13.5px]">Showing 1 to {rows.length} of {rows.length} items</span>
        <div className="ml-auto flex flex-wrap items-center gap-3 text-[12.5px]">
          <span className="text-ed-muted">Show</span><Chips label="Show" value={show} onChange={setShow} items={[{ k: 'qty', l: 'Quantity' }, { k: 'amt', l: 'Amount' }]} />
          <span className="text-ed-muted">Layout</span><Chips label="Layout" value={layout} onChange={setLayout} items={[{ k: 'table', l: 'Table' }, { k: 'matrix', l: 'Matrix' }]} />
          <span className="text-ed-muted">Sort by</span><Chips label="Sort by" value={by} onChange={setBy} items={[{ k: 'count', l: 'Count' }, { k: 'pct', l: 'Percentage' }]} />
          <button type="button" className={btnOut}><SlidersHorizontal className="size-4" /> View &amp; Filter</button>
        </div>
      </div>

      <div className={cn(card, 'mt-3 overflow-x-auto')}>
        <table className="w-full min-w-[1100px] text-[13.5px]">
          <thead className="border-ed-line border-b bg-[#faf9fc]"><tr>
            <th scope="col" className="px-3 py-3 text-left font-medium">Image</th><th scope="col" className="px-3 text-left font-medium">Name</th>
            {([['Total Money', 'money'], ['Discount Given', 'discount'], ['Product Cost', 'pcost'], ['Net Profit', 'net'], ['Current Stock', 'stock'], ['Total', 'total']] as const).map(([l, k]) => <SortTh key={k} label={l} k={k} sort={sort} onSort={onSort} />)}
            {states.filter((s) => layout === 'table' || picked.includes(s.k) || !picked.length).map((s) => <th key={s.k} scope="col" className="px-3 text-left font-medium">{s.k}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-ed-line border-b last:border-0">
                <td className="px-3 py-2.5"><span className="block size-9 rounded-md" style={{ background: r.bg }} /></td>
                <td className="max-w-[220px] truncate px-3">{r.name}</td>
                <td className="px-3">{taka(r.money)}</td><td className="px-3">{taka(r.discount)}</td><td className="px-3">{taka(r.pcost)}</td><td className="px-3">{taka(r.net)}</td>
                <td className="px-3">{r.stock}</td><td className="px-3">{r.total}</td>
                {states.filter((s) => layout === 'table' || picked.includes(s.k) || !picked.length).map((s) => <td key={s.k} className="px-3">{cell(r, s.k)}</td>)}
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={14} className="text-ed-text py-16 text-center">No results.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
