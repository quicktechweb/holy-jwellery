'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Box, CheckCircle2, ClipboardCheck, MapPin, PackageX, RotateCcw, Search, TrendingUp, XCircle } from 'lucide-react';
import { negativeStock, stockHealth } from '@/data/inventory';
import { Sel } from '@/components/courier/ui';
import { Card } from '@/components/dashboard/Card';
import { SmartRestock } from './SmartRestock';
import { cn } from '@/lib/utils';

const tabs = [
  { key: 'overview', label: 'Overview', icon: Box },
  { key: 'warehouse', label: 'Warehouse Lookup', icon: MapPin },
  { key: 'restock', label: 'Smart Restock', icon: TrendingUp },
] as const;
type TabKey = (typeof tabs)[number]['key'];

const health = [
  { label: 'Total Products', value: stockHealth.total, color: 'text-[#2f5fe8]', icon: Box },
  { label: 'Healthy Stock', value: stockHealth.healthy, color: 'text-[#16a34a]', icon: CheckCircle2 },
  { label: 'Low Stock', value: stockHealth.low, color: 'text-[#d97706]', icon: AlertTriangle },
  { label: 'Out of Stock', value: stockHealth.out, color: 'text-[#e5243b]', icon: XCircle },
  { label: 'Negative Stock', value: stockHealth.negative, color: 'text-[#7c3aed]', icon: PackageX },
];

const periods = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'This month', 'Last month'];

const movement = [
  { label: 'Units Sold', value: '-0', sub: 'from order deliveries', color: 'text-[#e5243b]', icon: ArrowDownRight },
  { label: 'Units Purchased', value: '+0', sub: 'from purchase receipts', color: 'text-[#16a34a]', icon: ArrowUpRight },
  { label: 'Returns', value: '+0', sub: 'items returned', color: 'text-[#d97706]', icon: RotateCcw },
  { label: 'Net Change', value: '+0', sub: '0 total movements', color: 'text-[#16a34a]', icon: TrendingUp },
];
const iconColor = ['text-[#e5243b]', 'text-[#16a34a]', 'text-[#d97706]', 'text-[#16a34a]'];

const StatCard = ({ title, icon: Icon, iconCls, children }: { title: string; icon: React.ElementType; iconCls: string; children: React.ReactNode }) => (
  <Card className="overflow-hidden">
    <div className="border-ed-line flex items-center justify-between border-b px-5 py-3.5">
      <p className="text-[15px]">{title}</p>
      <Icon className={cn('size-4', iconCls)} />
    </div>
    <div className="px-5 py-4">{children}</div>
  </Card>
);

export function InventoryDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const fromUrl = ({ 'warehouse-lookup': 'warehouse', 'smart-restock': 'restock' } as Record<string, TabKey>)[params.get('section') ?? ''] ?? 'overview';
  const [tab, setTabState] = useState<TabKey>(fromUrl);
  const setTab = (k: TabKey) => {
    setTabState(k);
    const q = k === 'overview' ? '' : `?section=${k === 'warehouse' ? 'warehouse-lookup' : 'smart-restock'}`;
    router.replace(`${pathname}${q}`, { scroll: false });
  };
  const [period, setPeriod] = useState('Last 7 days');
  const [q, setQ] = useState('');

  return (
    <div className="mx-auto max-w-[1400px] pt-7">
      <header className="flex flex-wrap items-start justify-between gap-4 px-1">
        <div className="flex items-start gap-3">
          <Box className="text-ed-brand mt-1 size-7" strokeWidth={1.6} />
          <div>
            <h1 className="text-[24px] leading-tight font-medium tracking-tight">Inventory Dashboard</h1>
            <p className="text-ed-text/70 mt-0.5 text-[13.5px]">Monitor stock health and movements across your inventory</p>
          </div>
        </div>
        <button type="button" className="border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[13.5px] shadow-sm">
          <ClipboardCheck className="size-4" /> Stock Reconciliation
        </button>
      </header>

      <div role="tablist" className="mt-6 flex flex-wrap gap-1.5">
        {tabs.map((t) => {
          const on = t.key === tab;
          const Icon = t.icon;
          return (
            <button key={t.key} role="tab" aria-selected={on} type="button" onClick={() => setTab(t.key)}
              className={cn('flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13.5px] transition', on ? 'bg-ed-brand-soft text-ed-brand border-ed-brand/15 border shadow-sm' : 'text-ed-text/70 hover:text-ed-brand border border-transparent')}>
              <Icon className="size-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <>
          <h2 className="mt-5 text-[17px]">Stock Health Overview</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {health.map((h) => (
              <StatCard key={h.label} title={h.label} icon={h.icon} iconCls={h.color}>
                <p className={cn('text-[24px] font-medium', h.color)}>{h.value}</p>
              </StatCard>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between">
            <h2 className="text-[17px]">Stock Movement Summary</h2>
            <Sel label="Period" value={period} onChange={setPeriod} options={periods} className="w-[140px]" />
          </div>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {movement.map((m, i) => (
              <StatCard key={m.label} title={m.label} icon={m.icon} iconCls={iconColor[i]}>
                <p className={cn('text-[24px] font-medium', m.color)}>{m.value}</p>
                <p className="text-ed-muted mt-1 text-[11px]">{m.sub}</p>
              </StatCard>
            ))}
          </div>

          <h2 className="mt-10 text-[17px]">Attention Required</h2>
          <Card className="mt-4 overflow-hidden">
            <div className="border-ed-line border-b px-5 py-4">
              <p className="flex items-center gap-2 text-[15px] text-[#e5243b]"><PackageX className="size-4" /> Negative Stock</p>
              <p className="text-ed-muted mt-1 text-[12.5px]">Products with stock below zero require immediate attention.</p>
            </div>
            <div className="overflow-x-auto px-5 pb-2">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-ed-line text-ed-muted border-b text-[13px]">
                    <th className="px-3.5 py-4 font-normal">Product</th>
                    <th className="px-3.5 font-normal">SKU</th>
                    <th className="px-3.5 text-center font-normal">Stock</th>
                    <th className="w-[130px]" />
                  </tr>
                </thead>
                <tbody>
                  {negativeStock.map((p) => (
                    <tr key={p.id} className="border-ed-line border-b text-[13.5px] last:border-b-0">
                      <td className="px-3.5 py-5">{p.name}</td>
                      <td className="text-ed-muted px-3.5">{p.sku}</td>
                      <td className="px-3.5 text-center"><span className="inline-block rounded-full bg-[#e5090f] px-2.5 py-0.5 text-[11.5px] font-medium text-white">{p.stock}</span></td>
                      <td className="px-3.5"><Link href={`/dashboard/product/${p.id}/stock-history`} className="hover:text-ed-brand text-[13px]">View History</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {tab === 'warehouse' && (
        <div className="mt-6">
          <div className="relative max-w-[420px]">
            <Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product or SKU" className="border-ed-line focus:border-ed-brand/40 h-10 w-full rounded-lg border bg-white pl-9 text-[13.5px] outline-none" />
          </div>
          <Card className="mt-4 overflow-hidden">
            <ul>
              {negativeStock.filter((p) => !q.trim() || `${p.name} ${p.sku}`.toLowerCase().includes(q.trim().toLowerCase())).map((p) => (
                <li key={p.id} className="border-ed-line flex items-center justify-between border-b px-5 py-4 text-[13.5px] last:border-b-0">
                  <span>{p.name} <span className="text-ed-muted ml-2 text-[12px]">{p.sku}</span></span>
                  <span className="text-ed-muted text-[12.5px]">Main Warehouse · {p.stock}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'restock' && <SmartRestock />}
    </div>
  );
}
