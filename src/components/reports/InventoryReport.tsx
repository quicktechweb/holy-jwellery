'use client';

import { useMemo, useState } from 'react';
import { Download, Info, Layers, Tag, Wallet } from 'lucide-react';
import { inventoryTotals, stockRows } from '@/data/productReport';
import { btnOut } from '@/components/products/ui';
import { cn } from '@/lib/utils';
import { SearchBox, SortTh, Stat, StatRow, Title, card, csv, useSort } from './ui';

const subs = [{ k: 'product', l: 'Product Inventory' }, { k: 'category', l: 'Category Wise' }, { k: 'dead', l: 'Dead Stock' }] as const;
type Sub = (typeof subs)[number]['k'];
const taka1 = (n: number) => `৳ ${n.toLocaleString('en-US', { maximumFractionDigits: 1 })}`;

export function InventoryReport() {
  const [sub, setSub] = useState<Sub>('product');
  const [q, setQ] = useState('');
  const { sort, onSort } = useSort('qty');

  const rows = useMemo(() => {
    let r = stockRows.map((x) => ({ ...x, cv: x.qty * x.cost, sv: x.qty * x.sell, label: x.name, key: x.sku }));
    if (sub === 'dead') r = r.filter((x) => x.lastSold >= 60);
    if (sub === 'category') {
      const m = new Map<string, (typeof r)[number]>();
      r.forEach((x) => { const o = m.get(x.category); m.set(x.category, o ? { ...o, qty: o.qty + x.qty, cv: o.cv + x.cv, sv: o.sv + x.sv, sku: String(+o.sku + 1) } : { ...x, label: x.category, key: x.category }); });
      r = [...m.values()];
    }
    return r.filter((x) => `${x.label} ${x.key}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => ((a as never)[sort.k] - (b as never)[sort.k]) * sort.d);
  }, [sub, q, sort]);

  return (
    <div className="p-5 sm:p-6">
      <Title title="Inventory report" sub="Stock quantity, cost value, and selling value — by product and category, plus dead stock." />
      <div role="tablist" aria-label="Inventory views" className="border-ed-line mt-4 flex rounded-lg border bg-[#faf9fc] px-1">
        {subs.map((s) => (
          <button key={s.k} role="tab" aria-selected={sub === s.k} type="button" onClick={() => { setSub(s.k); setQ(''); }}
            className={cn('h-11 border-b-2 px-4 text-[14px]', sub === s.k ? 'border-ed-brand text-ed-brand' : 'text-ed-text/65 hover:text-ed-brand border-transparent')}>{s.l}</button>
        ))}
      </div>

      <StatRow cols="sm:grid-cols-3">
        <Stat label="In-stock products" value={inventoryTotals.products.toLocaleString('en-US')} icon={Layers} tone="bg-[#eeeff7] text-[#4a4f8a]" />
        <Stat label="Total cost value" value={taka1(inventoryTotals.cost)} icon={Wallet} tone="bg-[#fff1d6] text-[#d97706]" />
        <Stat label="Total selling value" value={taka1(inventoryTotals.sell)} icon={Tag} tone="bg-[#e3f8ec] text-[#16a34a]" />
      </StatRow>

      <section className={cn(card, 'mt-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <SearchBox value={q} onChange={setQ} className="w-full max-w-[320px]" />
          <button type="button" className={btnOut} onClick={() => csv(`inventory-${sub}.csv`, ['SKU', 'Name', 'Stock', 'Cost', 'Sell', 'Total cost', 'Total sell'], rows.map((r) => [r.key, r.label, r.qty, r.cost, r.sell, r.cv, r.sv]))}><Download className="size-4" /> Download</button>
        </div>
        <div className="border-ed-line mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[900px] text-[13.5px]">
            <thead className="border-ed-line border-b bg-[#faf9fc]"><tr>
              {sub === 'product' && <th scope="col" className="px-3 py-3.5 text-left font-medium">Image</th>}
              <th scope="col" className="px-3 text-left font-medium">{sub === 'category' ? 'Category' : 'SKU'}</th>
              {sub !== 'category' && <th scope="col" className="px-3 text-left font-medium">Product Name</th>}
              <SortTh label="Stock Quantity" k="qty" sort={sort} onSort={onSort} />
              {sub !== 'category' && <><SortTh label="Cost Price" k="cost" sort={sort} onSort={onSort} /><SortTh label="Selling Price" k="sell" sort={sort} onSort={onSort} /></>}
              <SortTh label="Total Cost Value" k="cv" sort={sort} onSort={onSort} /><SortTh label="Total Sell Value" k="sv" sort={sort} onSort={onSort} />
              {sub === 'dead' && <SortTh label="Days unsold" k="lastSold" sort={sort} onSort={onSort} />}
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-ed-line border-b last:border-0">
                  {sub === 'product' && <td className="px-3 py-4"><span className="bg-ed-brand-soft block size-9 rounded-md" /></td>}
                  <td className="px-3 py-4">{r.key}</td>
                  {sub !== 'category' && <td className="px-3">{r.label}</td>}
                  <td className="px-3">{r.qty}</td>
                  {sub !== 'category' && <><td className="px-3">৳ {r.cost.toLocaleString('en-US')}</td><td className="px-3">৳ {r.sell.toLocaleString('en-US')}</td></>}
                  <td className="px-3">৳ {r.cv.toLocaleString('en-US')}</td><td className="px-3">৳ {r.sv.toLocaleString('en-US')}</td>
                  {sub === 'dead' && <td className="text-ed-red px-3">{r.lastSold}d</td>}
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={9} className="text-ed-muted py-12 text-center">{sub === 'dead' ? 'No dead stock — everything is moving.' : 'No results.'}</td></tr>}
            </tbody>
          </table>
        </div>
        {sub === 'dead' && <p className="text-ed-muted mt-3 flex items-center gap-1.5 text-[12px]"><Info className="size-3.5" /> Dead stock = in stock but not sold for 60+ days.</p>}
      </section>
    </div>
  );
}
