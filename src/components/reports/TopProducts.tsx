'use client';

import { useMemo, useState } from 'react';
import { Award, Download, RotateCcw, Trophy, TrendingUp, Wallet } from 'lucide-react';
import { salesStats, unitsFor, type RangeKey } from '@/data/productReport';
import { btnOut } from '@/components/products/ui';
import { cn } from '@/lib/utils';
import { BusinessSelect, DateMenu, Pager, SearchBox, SortTh, Stat, StatRow, Title, card, csv, taka, useSort } from './ui';

const modes = [
  { k: 'sell', l: 'Top Selling', icon: Trophy, hint: 'Best sellers by units and by revenue.' },
  { k: 'ret', l: 'Top Returned', icon: RotateCcw, hint: 'Products with the highest return rate.' },
  { k: 'comp', l: 'Best Completing', icon: Award, hint: 'Products with the best delivery success.' },
  { k: 'profit', l: 'Profit', icon: Wallet, hint: 'Most profitable products.' },
  { k: 'trend', l: 'Trending', icon: TrendingUp, hint: 'Products gaining momentum.' },
] as const;
type Mode = (typeof modes)[number]['k'];
const mins = [0, 5, 10, 20];

export function TopProducts({ initialMin = 10 }: { initialMin?: number }) {
  const [biz, setBiz] = useState('All Businesses');
  const [range, setRange] = useState<RangeKey>('today');
  const [min, setMin] = useState(mins.includes(initialMin) ? initialMin : 10);
  const [mode, setMode] = useState<Mode>('sell');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const { sort, onSort } = useSort('sold');

  const rows = useMemo(() => {
    const r = salesStats.map((s) => {
      const sold = unitsFor(s, range);
      const trend = range === 'today' && s.units.yest ? Math.round(((s.units.today - s.units.yest) / s.units.yest) * 100) : s.trend;
      return { ...s, sold, trend, revenue: sold * s.price, profit: Math.round((sold * s.deliveredPct / 100) * (s.price - s.cost)) };
    }).filter((s) => s.sold >= (mode === 'sell' ? 1 : Math.max(min, 1)) && s.name.toLowerCase().includes(q.toLowerCase()));
    const key: Record<Mode, string> = { sell: 'sold', ret: 'returnedPct', comp: 'deliveredPct', profit: 'profit', trend: 'trend' };
    const k = mode === 'sell' ? sort.k : key[mode];
    return r.sort((a, b) => ((a as never)[k] - (b as never)[k]) * (mode === 'sell' ? sort.d : -1));
  }, [range, min, q, mode, sort]);
  const chip = 'border-ed-line rounded border bg-[#f7f6fa] px-1.5 py-0.5 font-mono text-[10.5px]';
  const thumb = (bg: string) => <span className="size-10 shrink-0 rounded-lg" style={{ background: bg }} />;

  const units = rows.reduce((a, r) => a + r.sold, 0);
  const revenue = rows.reduce((a, r) => a + r.revenue, 0);
  const share = units ? (Math.max(...rows.map((r) => r.sold)) / units) * 100 : 0;
  const pages = Math.ceil(rows.length / size);
  const view = rows.slice((page - 1) * size, page * size);
  const top = (k: 'sold' | 'revenue') => [...rows].sort((a, b) => b[k] - a[k]).slice(0, 5);
  const maxOf = (k: 'sold' | 'revenue') => Math.max(1, ...rows.map((r) => r[k]));

  const panel = (t: string, k: 'sold' | 'revenue') => (
    <section className={cn(card, 'min-h-[160px] p-5')}>
      <h3 className="text-[15px] font-medium">{t}</h3>
      {rows.length ? (
        <ul className="mt-3 space-y-4">
          {top(k).map((r, i) => (
            <li key={r.id} className="flex items-start gap-3">
              <span className="bg-ed-text mt-3 flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-medium text-white">{i + 1}</span>
              {thumb(r.bg)}
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3 text-[14px]">
                  <span className="truncate">{r.name}</span>
                  <span className={cn('font-mono', k === 'revenue' && 'font-medium text-green-600')}>{k === 'sold' ? r.sold : taka(r.revenue)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-[#f1eef6]"><div className={cn('h-full rounded-full', k === 'sold' ? 'bg-ed-brand' : 'bg-green-500')} style={{ width: `${(r[k] / maxOf(k)) * 100}%` }} /></div>
                  <span className="text-ed-muted font-mono text-[10.5px]">{k === 'sold' ? taka(r.revenue) : `${r.sold} qty`}</span>
                </div>
                <code className={cn(chip, 'mt-1.5 inline-block')}>{r.sku}</code>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="text-ed-muted py-10 text-center text-[13.5px]">Nothing to show for this range.</p>}
    </section>
  );

  return (
    <div className="p-5 sm:p-6">
      <Title title="Top Products" sub="Ranked product performance — best sellers, returns, delivery success, profit, and momentum." />
      <BusinessSelect value={biz} onChange={setBiz} className="mt-4 [&_select]:h-11 [&_select]:bg-[#f7f6fa]" />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <DateMenu value={range} onChange={(v) => { setRange(v); setPage(1); }} />
        <div className="border-ed-line flex h-10 items-center gap-1 rounded-lg border bg-white px-2 text-[13px]">
          <span className="text-ed-muted px-1">Min sold</span>
          {mins.map((m) => (
            <button key={m} type="button" aria-pressed={min === m} onClick={() => { setMin(m); setPage(1); }}
              className={cn('h-7 rounded-md px-2.5', min === m ? 'bg-[#f3f1f7] font-medium' : 'text-ed-text/65 hover:text-ed-brand')}>{m ? `${m}+` : 'All'}</button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Ranking" className="border-ed-line flex rounded-lg border bg-white p-1">
          {modes.map(({ k, l, icon: I }) => (
            <button key={k} role="tab" aria-selected={mode === k} type="button" onClick={() => setMode(k)}
              className={cn('flex h-9 items-center gap-2 rounded-md px-3 text-[13px]', mode === k ? 'bg-ed-brand font-medium text-white' : 'text-ed-text/70 hover:text-ed-brand')}><I className="size-3.5" /> {l}</button>
          ))}
        </div>
        <p className="text-ed-muted text-[12px]">{modes.find((m) => m.k === mode)?.hint} <span className="text-ed-brand/60">Tap any product for its return & delivery trend.</span></p>
      </div>

      <StatRow cols="sm:grid-cols-4">
        <Stat label="Units sold" value={units} /><Stat label="Revenue" value={taka(revenue)} />
        <Stat label="Products sold" value={rows.length} /><Stat label="Top product share" value={`${share.toFixed(1)}%`} />
      </StatRow>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">{panel('Top by units sold', 'sold')}{panel('Top by revenue', 'revenue')}</div>

      <section className={cn(card, 'mt-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} className="w-full max-w-[320px]" />
          <button type="button" className={btnOut} onClick={() => csv('top-products.csv', ['Product', 'Sold', 'Revenue', 'Profit', 'Delivery %', 'Return %', 'Cancelled', 'Trend %', 'Stock'], rows.map((r) => [r.name, r.sold, r.revenue, r.profit, r.deliveredPct, r.returnedPct, r.cancelled, r.trend, r.stock]))}><Download className="size-4" /> Download</button>
        </div>
        <div className="border-ed-line mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[860px] text-[13.5px]">
            <thead className="text-ed-text/80 border-ed-line border-b bg-[#faf9fc]"><tr>
              <th scope="col" className="px-3 py-3 text-left font-medium">Product</th>
              {([['Sold', 'sold'], ['Revenue', 'revenue'], ['Profit', 'profit'], ['Delivery', 'deliveredPct'], ['Return', 'returnedPct'], ['Cancelled', 'cancelled'], ['Trend', 'trend'], ['Stock', 'stock']] as const).map(([l, k]) => <SortTh key={k} label={l} k={k} sort={sort} onSort={onSort} />)}
            </tr></thead>
            <tbody>
              {view.map((r) => (
                <tr key={r.id} className="border-ed-line hover:bg-ed-brand-soft/40 border-b last:border-0">
                  <td className="px-3 py-3"><div className="flex items-center gap-2.5">{thumb(r.bg)}<div className="min-w-0"><p className="max-w-[240px] truncate">{r.name}</p><code className={chip}>{r.sku}</code></div></div></td>
                  <td className="px-3 font-mono text-[12.5px]">{r.sold}</td><td className="px-3 font-mono text-[12.5px]">{taka(r.revenue)}</td>
                  <td className="px-3 font-mono text-[12.5px] text-green-600">{r.profit}</td>
                  <td className="px-3 font-mono text-[12.5px]">{r.deliveredPct.toFixed(1)}%</td><td className="px-3 font-mono text-[12.5px]">{r.returnedPct.toFixed(1)}%</td><td className="px-3 font-mono text-[12.5px]">{r.cancelled.toFixed(1)}%</td>
                  <td className="px-3"><span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium', r.trend >= 0 ? 'border-green-200 bg-green-50 text-green-600' : 'border-red-200 bg-red-50 text-red-500')}>{r.trend >= 0 ? '↑' : '↓'} {r.trend}%</span></td>
                  <td className="px-3 font-mono text-[12.5px]">{r.stock}</td>
                </tr>
              ))}
              {!view.length && <tr><td colSpan={9} className="py-8 text-center">No results.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={pages} onPage={setPage} size={size} onSize={setSize} selectedText={`0 of ${rows.length} row(s) selected.`} />
      </section>
    </div>
  );
}
