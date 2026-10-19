'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  AlertTriangle, BookOpen, Box, Download, Filter, Plus, RotateCcw, ShoppingCart,
  TrendingUp, User, Wallet, Clock, PackageCheck, Link2, Building2, Percent, Timer, Receipt,
} from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { DonutChart, useWidth } from '@/components/dashboard/charts';
import { download } from '@/components/courier/ui';
import { payStatus, purchaseSeed, purchaseSummary as S, suppliers, taka } from '@/data/purchase';
import { cn } from '@/lib/utils';
import { Badge, Breadcrumb, DateRangeInput, Field, inputCls, PageHead, SelectBox, type Range } from './ui';

const PAY = ['All Statuses', 'Paid', 'Partial', 'Unpaid'];
const RECV = ['All Statuses', 'Received', 'Pending'];
const SUPPLIERS = ['All Suppliers', ...suppliers.map((s) => s.name)];

interface Filters { range: Range | null; supplier: string; pay: string; recv: string; product: string; invoice: string }
const EMPTY: Filters = { range: null, supplier: SUPPLIERS[0], pay: PAY[0], recv: RECV[0], product: '', invoice: '' };

/* ───────── small pieces ───────── */
function Kpi({ label, value, icon: Icon, tone, children }: { label: string; value?: React.ReactNode; icon: React.ElementType; tone: string; children?: React.ReactNode }) {
  return (
    <Card className="px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-ed-text/75 text-[12px] leading-snug font-medium tracking-wide uppercase">{label}</p>
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', tone)}><Icon className="size-4" /></span>
      </div>
      {children ?? <p className="mt-5 text-[24px] leading-tight font-semibold">{value}</p>}
    </Card>
  );
}

function Insight({ icon: Icon, tone, title, tag, text, href }: { icon: React.ElementType; tone: string; title: React.ReactNode; tag?: React.ReactNode; text: string; href: string }) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', tone)}><Icon className="size-5" /></span>
      <div className="min-w-0">
        <p className="text-[15px] font-semibold">{title} {tag}</p>
        <p className="text-ed-muted mt-1 text-[12.5px] leading-snug">{text}</p>
        <Link href={href} className="text-ed-text hover:text-ed-brand mt-2 inline-block text-[13px] font-medium">View Details</Link>
      </div>
    </Card>
  );
}

function Panel({ title, sub, right, children, className }: { title: string; sub?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <div className="border-ed-line flex items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <h3 className="text-[16px] font-medium">{title}</h3>
          {sub && <p className="text-ed-muted mt-0.5 text-[11.5px]">{sub}</p>}
        </div>
        {right}
      </div>
      <div className="flex-1">{children}</div>
    </Card>
  );
}

const compact = (n: number) => (n >= 1e7 ? `${+(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `${+(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}k` : String(n));

function TrendChart({ data }: { data: { label: string; value: number }[] }) {
  const [ref, w] = useWidth<HTMLDivElement>(700);
  const H = 250, L = 44, R = 20, T = 20, B = 34;
  const max = Math.max(...data.map((d) => d.value), 0);
  const step = max <= 0 ? 1 : Math.pow(10, Math.floor(Math.log10(max / 4))) * ([1, 2, 2.5, 5, 10].find((m) => m * Math.pow(10, Math.floor(Math.log10(max / 4))) >= max / 4) ?? 10);
  const top = step * 4;
  const x = (i: number) => L + (i / Math.max(data.length - 1, 1)) * (w - L - R);
  const y = (v: number) => H - B - (v / top) * (H - B - T);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  return (
    <div ref={ref} className="px-5 py-4">
      <svg width="100%" height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label="Monthly purchase trend">
        {[0, 1, 2, 3, 4].map((t) => (
          <g key={t}>
            <line x1={L} x2={w - R} y1={y(step * t)} y2={y(step * t)} stroke="#e9e6ef" strokeDasharray="4 4" />
            <text x={L - 10} y={y(step * t) + 3} textAnchor="end" fontSize="9" fill="#6e6980">৳{compact(step * t)}</text>
          </g>
        ))}
        <path d={line} fill="none" stroke="#3f1355" strokeWidth="2" />
        {data.map((d, i) => (
          <g key={d.label}>
            <circle cx={x(i)} cy={y(d.value)} r="4.5" fill="#fff" stroke="#3f1355" strokeWidth="1.6"><title>{`${d.label}: ${taka(d.value)}`}</title></circle>
            <text x={x(i)} y={H - 12} textAnchor="middle" fontSize="10" fill="#6e6980">{d.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Donut({ segments }: { segments: { label: string; value: number; color: string; note: string }[] }) {
  return (
    <div className="flex flex-col items-center gap-5 px-5 pt-8 pb-14">
      <DonutChart size={140} thickness={18} segments={segments} />
      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[12.5px]">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: s.color }} />
            {s.label} <span className="text-ed-muted text-[11px]">({s.note})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────── page ───────── */
export function PurchaseDashboard() {
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const recent = useMemo(() => {
    const f = applied;
    return purchaseSeed
      .filter((p) =>
        (f.supplier === SUPPLIERS[0] || p.supplier === f.supplier) &&
        (f.pay === PAY[0] || payStatus(p) === f.pay) &&
        (f.recv === RECV[0] || p.receive === f.recv) &&
        (!f.invoice.trim() || p.invoice.toLowerCase().includes(f.invoice.trim().toLowerCase())) &&
        (!f.product.trim() || p.items.toLowerCase().includes(f.product.trim().toLowerCase())) &&
        (!f.range || (p.date >= f.range.from && p.date <= f.range.to)),
      )
      .slice(0, 5);
  }, [applied]);

  const exportCsv = () =>
    download('purchase-dashboard.csv', [
      ['Metric', 'Value'],
      ['Total Purchase', S.totalPurchase], ['Total Paid', S.totalPaid], ['Total Due', S.totalDue],
      ['Overdue Due', S.overdueDue], ['Pending Receive', S.pendingReceive], ['Received Value', S.receivedValue],
    ]);

  const top = S.topSupplier;
  return (
    <div className="mx-auto max-w-[1400px] pt-7">
      <Breadcrumb page="Purchase Dashboard" />
      <PageHead
        title="Purchase Dashboard"
        right={
          <>
            <Link href="/dashboard/purchase/list" className="border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[13.5px] shadow-sm"><BookOpen className="size-4" /> Guide</Link>
            <button type="button" onClick={exportCsv} className="border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[13.5px] shadow-sm"><Download className="size-4" /> Export</button>
            <Link href="/dashboard/purchase/new" className="bg-ed-brand flex h-10 items-center gap-2 rounded-lg px-4 text-[13.5px] font-medium text-white shadow-sm hover:brightness-110"><Plus className="size-4" /> Add Purchase</Link>
          </>
        }
      />

      {/* Filters */}
      <Card className="mt-6 overflow-hidden">
        <div className="border-ed-line flex items-center gap-2.5 border-b px-5 py-5 text-[16px] font-medium"><Filter className="size-[18px]" /> Filters</div>
        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_1.5fr]">
            <Field label="Date Range"><DateRangeInput value={draft.range} onChange={(r) => set('range', r)} /></Field>
            <Field label="Supplier"><SelectBox label="Supplier" value={draft.supplier} onChange={(v) => set('supplier', v)} options={SUPPLIERS} /></Field>
            <Field label="Payment Status"><SelectBox label="Payment Status" value={draft.pay} onChange={(v) => set('pay', v)} options={PAY} /></Field>
            <Field label="Receive Status"><SelectBox label="Receive Status" value={draft.recv} onChange={(v) => set('recv', v)} options={RECV} /></Field>
            <Field label="Product / SKU Search"><input value={draft.product} onChange={(e) => set('product', e.target.value)} placeholder="Search by product name or SKU" className={inputCls} /></Field>
          </div>
          <div className="mt-4 max-w-[450px]">
            <Field label="Invoice No"><input value={draft.invoice} onChange={(e) => set('invoice', e.target.value)} placeholder="Search invoice #" className={inputCls} /></Field>
          </div>
          <div className="border-ed-line mt-5 flex justify-end gap-3 border-t pt-5">
            <button type="button" onClick={() => { setDraft(EMPTY); setApplied(EMPTY); }} className="border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[13.5px]"><RotateCcw className="size-4" /> Reset</button>
            <button type="button" onClick={() => setApplied(draft)} className="bg-ed-brand flex h-10 items-center gap-2 rounded-lg px-4 text-[13.5px] font-medium text-white hover:brightness-110"><Filter className="size-4" /> Apply Filter</button>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <Kpi label="Total Purchase" value={taka(S.totalPurchase)} icon={ShoppingCart} tone="bg-[#f1eaf7] text-ed-brand" />
        <Kpi label="Total Paid" value={taka(S.totalPaid)} icon={Link2} tone="bg-[#e3f8ec] text-[#16a34a]" />
        <Kpi label="Total Due" value={taka(S.totalDue)} icon={Wallet} tone="bg-[#fde8ea] text-[#e5243b]" />
        <Kpi label="Overdue Due" value={taka(S.overdueDue)} icon={AlertTriangle} tone="bg-[#fdf1dc] text-[#d97706]" />
        <Kpi label="Pending Receive" value={taka(S.pendingReceive)} icon={Clock} tone="bg-[#e4efff] text-[#2f5fe8]" />
        <Kpi label="Received Value" value={taka(S.receivedValue)} icon={PackageCheck} tone="bg-[#eeeff7] text-[#4a4f8a]" />
        <Kpi label="Top Supplier" icon={Building2} tone="bg-[#e4efff] text-[#2f5fe8]">
          <p className="mt-4 text-[20px] leading-tight font-semibold">{top ? top.name : '—'}</p>
          <p className="text-ed-muted mt-0.5 text-[12px]">{taka(top?.amount ?? 0)}</p>
        </Kpi>
        <Kpi label="Overdue Suppliers" icon={User} tone="bg-[#fde8ea] text-[#e5243b]">
          <p className="text-ed-red mt-3 text-[22px] leading-tight font-semibold">{S.overdueSuppliers}</p>
          <Link href="/dashboard/purchase/ledger" className="mt-1 inline-block text-[12px] font-medium">View Details</Link>
        </Kpi>
      </div>

      {/* Insights */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Insight icon={AlertTriangle} tone="bg-[#fde8ea] text-[#e5243b]" title={<>{taka(S.overdueDue)}</>} tag={<span className="text-ed-red ml-1 text-[12.5px] font-normal">(Overdue)</span>} text={`Outstanding dues across ${S.overdueSuppliers} suppliers.`} href="/dashboard/purchase/ledger" />
        <Insight icon={Clock} tone="bg-[#fdf1dc] text-[#d97706]" title={`${S.shipmentsAwaiting} Shipments`} text="Purchase orders awaiting stock receiving." href="/dashboard/purchase/receive" />
        <Insight icon={TrendingUp} tone="bg-[#e8eaff] text-[#4f46e5]" title={top ? top.name : '—'} text="Highest buying volume this period." href="/dashboard/purchase/suppliers" />
        <Insight icon={Box} tone="bg-[#e4efff] text-[#2f5fe8]" title={`${S.lowStockProducts} Products`} tag={<span className="ml-1 text-[12.5px] font-normal text-[#d97706]">(Low Stock)</span>} text="Active purchase lines running low on warehouse stock." href="/dashboard/inventory/low-stock-alert" />
      </div>

      {/* Charts */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title="Monthly Purchase Trend" className="lg:col-span-2"><TrendChart data={S.trend} /></Panel>
        <Panel title="Purchase by Supplier">
          {S.bySupplier.length === 0 ? (
            <p className="text-ed-muted flex h-full min-h-[250px] items-center justify-center text-[12.5px]">No supplier sales data.</p>
          ) : (
            <ul className="space-y-4 px-5 py-5">
              {S.bySupplier.map((s) => {
                const max = Math.max(...S.bySupplier.map((x) => x.value), 1);
                return (
                  <li key={s.name}>
                    <div className="flex justify-between text-[13px]"><span>{s.name}</span><span>{taka(s.value)}</span></div>
                    <div className="bg-ed-bg mt-1.5 h-2 rounded-full"><div className="bg-ed-brand h-2 rounded-full" style={{ width: `${(s.value / max) * 100}%` }} /></div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Payment Status">
          <Donut segments={[{ label: 'Paid', value: S.paid.paidPct, color: '#10b981', note: `${S.paid.paidPct.toFixed(1)}%` }]} />
        </Panel>
        <Panel title="Receive Status">
          <Donut segments={[
            { label: 'Received', value: S.receive.received, color: '#10b981', note: `${S.receive.received} POs` },
            { label: 'Pending', value: S.receive.pending, color: '#ef4444', note: `${S.receive.pending} POs` },
          ]} />
        </Panel>
        <Panel title="Top Purchased Products">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#faf9fc] text-ed-muted text-[12px]">
                <th className="px-5 py-3.5 font-normal">Product</th>
                <th className="px-2 text-right font-normal">Quantity</th>
                <th className="px-5 text-right font-normal">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {S.topProducts.map((p) => (
                <tr key={p.sku} className="border-ed-line border-t text-[13px]">
                  <td className="px-5 py-3"><p>{p.name}</p><p className="text-ed-muted text-[11px]">{p.sku}</p></td>
                  <td className="px-2 text-right whitespace-nowrap">{p.qty.toLocaleString('en-IN')} pcs</td>
                  <td className="px-5 text-right whitespace-nowrap">{taka(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Overdue Supplier Payments" sub="Dues that require immediate action or payment settlement." className="lg:col-span-2">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#faf9fc] text-ed-muted text-[12px]">
                <th className="px-5 py-3.5 font-normal">Supplier</th>
                <th className="font-normal">Overdue Amount</th>
                <th className="font-normal">Overdue Invoices</th>
                <th className="font-normal">Oldest Due Date</th>
                <th className="px-5 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {S.overdueSupplierPayments.map((o) => (
                <tr key={o.supplier} className="border-ed-line border-t text-[13px]">
                  <td className="px-5 py-3">{o.supplier}</td><td>{taka(o.amount)}</td><td>{o.invoices}</td><td>{o.oldest}</td>
                  <td className="px-5 text-right"><Link href="/dashboard/purchase/ledger" className="text-ed-brand">Settle</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {S.overdueSupplierPayments.length === 0 && <p className="text-ed-muted py-16 text-center text-[12.5px]">Excellent! No overdue supplier payments.</p>}
        </Panel>
        <Panel title="Recent Purchases" sub="Latest purchase order invoices logged." right={<Link href="/dashboard/purchase/list" className="text-[12px] font-medium">View All</Link>}>
          <div className="text-ed-muted grid grid-cols-[1fr_auto_88px] gap-3 bg-[#faf9fc] px-5 py-3.5 text-[12px]"><span>Invoice / Supplier</span><span>Amount</span><span>Receive</span></div>
          {recent.length === 0 && <p className="text-ed-muted py-10 text-center text-[12.5px]">No purchases match the filters.</p>}
          {recent.map((p) => (
            <div key={p.id} className="border-ed-line grid grid-cols-[1fr_auto_88px] items-center gap-3 border-t px-5 py-3 text-[13px]">
              <div className="min-w-0"><p className="truncate">{p.invoice.slice(0, 15)}…</p><p className="text-ed-brand/70 text-[11px]">{p.source}</p></div>
              <span>{taka(p.amount)}</span>
              <Badge tone={p.receive === 'Received' ? 'green' : 'red'}>{p.receive}</Badge>
            </div>
          ))}
        </Panel>
      </div>

      {/* Footer stats */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Purchases', value: String(S.totalPurchases), icon: ShoppingCart, tone: 'bg-[#f1eaf7] text-ed-brand' },
          { label: 'Avg Purchase Value', value: taka(S.avgPurchaseValue), icon: Receipt, tone: 'bg-[#eeeff7] text-[#4f46e5]' },
          { label: 'Avg Payment Days', value: `${S.avgPaymentDays.toFixed(1)} Days`, icon: Timer, tone: 'bg-[#fdf1dc] text-[#d97706]' },
          { label: 'Receive Rate', value: `${S.receiveRate.toFixed(1)}%`, icon: Percent, tone: 'bg-[#e3f8ec] text-[#16a34a]' },
        ].map((k) => (
          <Card key={k.label} className="flex items-center gap-4 px-5 py-4">
            <span className={cn('flex size-11 items-center justify-center rounded-xl', k.tone)}><k.icon className="size-5" /></span>
            <div><p className="text-ed-muted text-[11px] font-medium tracking-wide uppercase">{k.label}</p><p className="font-mono text-[20px] font-bold">{k.value}</p></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
