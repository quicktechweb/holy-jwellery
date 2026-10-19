'use client';

import { useState } from 'react';
import { Box, PackageSearch, Users } from 'lucide-react';
import { productSeed } from '@/data/products';
import { salesStats, unitsFor, type RangeKey } from '@/data/productReport';
import { cn } from '@/lib/utils';
import { DateMenu, Empty, ProductSelect, Stat, StatRow, Title, card, taka } from './ui';

type Kind = 'report' | 'az' | 'buyers';
const copy = {
  report: { title: 'Product report', sub: 'Analyze product performance, sales trends, and delivery metrics.', label: 'Select a product or variation group', empty: 'No product selected.', text: 'Pick a product above to open its merged report — trends, status breakdown, and delivery metrics.' },
  az: { title: 'Product A-Z Report', sub: 'Comprehensive product performance analysis', label: 'Select a product to view report', empty: 'No product selected', text: 'Select a product above to view its complete A-Z report including orders, campaigns, profits, inventory, returns, and more.' },
  buyers: { title: 'Product buyers', sub: 'See who bought a product and how often.', label: 'Select a product to see its buyers', empty: 'No product selected', text: 'Select a product above to list the customers who bought it.' },
} as const;

export function SingleProduct({ kind }: { kind: Kind }) {
  const c = copy[kind];
  const [id, setId] = useState('');
  const [range, setRange] = useState<RangeKey>('today');
  const prod = productSeed.find((p) => p.id === id);
  const s = salesStats.find((x) => x.id === id);
  const units = s ? unitsFor(s, range) : 0;

  return (
    <div className="p-5 sm:p-6">
      <Title title={c.title} sub={c.sub} right={kind !== 'report' ? <DateMenu value={range} onChange={setRange} /> : undefined} />

      <div className={cn('mt-5 flex flex-wrap items-center gap-4', kind !== 'report' && card, kind !== 'report' && 'bg-[#faf9fc] p-3')}>
        <span className="text-ed-text/80 flex items-center gap-2 text-[12px] font-medium tracking-wide uppercase"><Box className="size-4" /> {c.label}</span>
        <ProductSelect value={id} onChange={setId} />
      </div>

      {!prod ? (
        <div className={cn(card, 'mt-6 px-6 py-12 text-center')}>
          {kind === 'report' ? (
            <><p className="text-[15px] font-medium">{c.empty}</p><p className="text-ed-muted mt-1 text-[13.5px]">{c.text}</p></>
          ) : <Empty icon={kind === 'buyers' ? Users : Box} title={c.empty} text={c.text} />}
        </div>
      ) : (
        <>
          <div className="mt-6 flex items-center gap-3">
            <span className="size-12 rounded-lg" style={{ background: prod.images[0]?.bg }} />
            <div><p className="text-[16px] font-medium">{prod.name}</p><p className="text-ed-muted text-[12px]">SKU {prod.code}</p></div>
          </div>
          {kind === 'buyers' ? (
            <Empty icon={PackageSearch} title="No buyers found" text="No customer has bought this product in the selected range." />
          ) : (
            <>
              <StatRow cols="sm:grid-cols-4">
                <Stat label="Units sold" value={units} /><Stat label="Revenue" value={taka(units * prod.sellPrice)} />
                <Stat label="Profit" value={taka(units * (prod.sellPrice - prod.costPrice))} /><Stat label="Delivery rate" value={s ? `${s.deliveredPct}%` : '0%'} />
              </StatRow>
              <StatRow cols="sm:grid-cols-4">
                <Stat label="Return rate" value={s ? `${s.returnedPct}%` : '0%'} /><Stat label="Cancelled" value={s?.cancelled ?? 0} />
                <Stat label="Current stock" value={prod.manageStock ? (s?.stock ?? prod.qty) : 'Not tracked'} /><Stat label="Trend" value={s ? `${s.trend >= 0 ? '+' : ''}${s.trend}%` : '0%'} />
              </StatRow>
            </>
          )}
        </>
      )}
    </div>
  );
}
