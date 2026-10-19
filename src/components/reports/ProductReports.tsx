'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { card } from './ui';
import { InventoryReport } from './InventoryReport';
import { ProductStatus } from './ProductStatus';
import { SingleProduct } from './SingleProduct';
import { TopProducts } from './TopProducts';
import { WebOrderProducts } from './WebOrderProducts';

export const reportTabs = [
  { k: 'product-report', l: 'Product Report' }, { k: 'top-products', l: 'Top Products' }, { k: 'product-status', l: 'Product Status' },
  { k: 'web-order-product-report', l: 'Web Order Product Report' }, { k: 'product-buyers', l: 'Product Buyers' },
  { k: 'inventory-report', l: 'Inventory Report' }, { k: 'product-az', l: 'Product A-Z' },
] as const;
export const REPORT_HREF = '/dashboard/reports/product-report';

export function ProductReports() {
  const sp = useSearchParams();
  const urlTab = reportTabs.find((t) => t.k === sp.get('tab'))?.k ?? 'product-report';
  // tab local state e thake, tai click korle sathe sathe bodlay (server e jete hoy na)
  const [tab, setTab] = useState<string>(urlTab);
  useEffect(() => setTab(urlTab), [urlTab]);
  const statuses = sp.get('statuses')?.split(',').filter(Boolean);
  const minSold = Number(sp.get('minSold') ?? 10);
  // tab URL e statuses thake (jemon live site) - tai tab bodlale oita rakhi
  const keep = statuses?.length ? `&statuses=${statuses.join(',')}` : '';

  return (
    <div className={cn(card, 'overflow-hidden')}>
      <nav aria-label="Product report tabs" className="border-ed-line flex overflow-x-auto border-b bg-[#fcfbfd]">
        {reportTabs.map((t) => (
          <Link key={t.k} href={`${REPORT_HREF}?tab=${t.k}${keep}`} aria-current={tab === t.k ? 'page' : undefined} data-no-progress
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey) return;
              e.preventDefault();
              setTab(t.k);
              window.history.pushState(null, '', `${REPORT_HREF}?tab=${t.k}${keep}`);
            }}
            className={cn('h-[52px] shrink-0 border-b-2 px-4 text-[14px] leading-[52px] whitespace-nowrap transition', tab === t.k ? 'border-ed-brand text-ed-brand font-medium' : 'text-ed-text/65 hover:text-ed-brand border-transparent')}>{t.l}</Link>
        ))}
      </nav>
      {tab === 'product-report' && <SingleProduct kind="report" />}
      {tab === 'top-products' && <TopProducts initialMin={minSold} />}
      {tab === 'product-status' && <ProductStatus initialStatuses={statuses} />}
      {tab === 'web-order-product-report' && <WebOrderProducts />}
      {tab === 'product-buyers' && <SingleProduct kind="buyers" />}
      {tab === 'inventory-report' && <InventoryReport />}
      {tab === 'product-az' && <SingleProduct kind="az" />}
    </div>
  );
}
