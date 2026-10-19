'use client';

import Link from 'next/link';
import { useMemo, useState, type ElementType, type ReactNode } from 'react';
import {
  Activity, AlertTriangle, BookOpen, CalendarDays, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Clock,
  Download, Flame, Layers, PackageCheck, Plus, RotateCcw, Search, ShieldAlert, ShieldCheck, SlidersHorizontal, TrendingUp, Zap,
} from 'lucide-react';
import { productSeed } from '@/data/products';
import { download } from '@/components/courier/ui';
import { Dialog, btnOut, btnPrimary } from '@/components/products/ui';
import { cn } from '@/lib/utils';

/** TODO: real API theke ashbe - ekhane screenshot er number gulo seed hisebe ache */
const OPENING_VALUE = 23_807_210;
const RISK = { low: 0, stockout: 5, fast: 0, highAdj: 0 };
const LAST_SYNC = '02 Sep 2026, 06:51 PM';

type Dir = 'In' | 'Out';
interface Move {
  id: number; at: Date; productId: string; product: string; sku: string; type: string; dir: Dir; qty: number;
  prev: number; next: number; unitCost: number; ref: string; warehouse: string; by: string; reason: string;
}

const taka = (n: number) => `৳${Math.round(n).toLocaleString('en-US')}`;
const fmtDate = (d: Date) => {
  const day = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const t = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${t}`;
};
const ranges = [{ k: '7D', days: 7 }, { k: '30D', days: 30 }, { k: '90D', days: 90 }];
const adjTypes = ['Adjustment In', 'Adjustment Out', 'Damage / Lost'];

const sel = 'border-ed-line focus:border-ed-brand/40 h-10 w-full cursor-pointer appearance-none rounded-lg border bg-[#f7f6fa] pr-9 pl-3.5 text-[13.5px] outline-none';
const Chev = ({ updown }: { updown?: boolean }) => {
  const C = updown ? ChevronsUpDown : ChevronDown;
  return <C className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2" />;
};
const Select = ({ value, onChange, children, className, updown, label }: { value: string; onChange: (v: string) => void; children: ReactNode; className?: string; updown?: boolean; label: string }) => (
  <div className={cn('relative', className)}>
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={sel}>{children}</select>
    <Chev updown={updown} />
  </div>
);

const card = 'border-ed-line rounded-xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)]';

function Kpi({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: ElementType; tone: string }) {
  return (
    <div className={cn(card, 'px-4 pt-4 pb-3.5')}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-ed-text/75 text-[12.5px]">{label}</p>
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', tone)}><Icon className="size-4" /></span>
      </div>
      <p className="mt-3 text-[22px] leading-none font-medium tracking-tight">{value}</p>
      <p className="text-ed-muted mt-2 text-[11px]">{sub}</p>
    </div>
  );
}
function Risk({ label, value, sub, icon: Icon, tone, href, hint = 'Open inventory dashboard' }: { label: string; value: number; sub: string; icon: ElementType; tone: string; href?: string; hint?: string }) {
  const body = (
    <>
      <div>
        <p className="text-ed-text/85 text-[14px]">{label}</p>
        <p className="mt-0.5 text-[24px] leading-tight font-medium">{value}</p>
        <p className="text-ed-muted mt-0.5 text-[11px]">{sub}</p>
      </div>
      <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-full', tone)}><Icon className="size-5" /></span>
    </>
  );
  const base = cn(card, 'flex items-center justify-between gap-3 px-5 py-4');
  if (!href) return <div className={base}>{body}</div>;
  return (
    <Link href={href} aria-label={`${label}: ${value}. ${hint}`}
      className={cn(base, 'hover:border-ed-brand/30 focus-visible:ring-ed-brand/30 cursor-pointer transition hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(63,19,85,0.12)] focus-visible:ring-2 focus-visible:outline-none')}>
      {body}
    </Link>
  );
}
function Mini({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: ElementType; tone: string }) {
  return (
    <div className={cn(card, 'flex items-center gap-4 px-5 py-4')}>
      <Icon className={cn('size-5 shrink-0', tone)} />
      <div className="min-w-0">
        <p className="text-ed-muted text-[11.5px]">{label}</p>
        <p className="text-[13.5px] leading-snug font-medium">{value}</p>
        <p className="text-ed-muted text-[10.5px]">{sub}</p>
      </div>
    </div>
  );
}

const cols = ['Date & Time', 'Image', 'Product', 'SKU', 'Movement Type', 'Direction', 'Qty', 'Previous Stock', 'New Stock', 'Unit Cost', 'Value Impact', 'Reference', 'Warehouse', 'Updated By', 'Reason'];

export function StockLedger() {
  const [tab, setTab] = useState<'ledger' | 'integrity'>('ledger');
  const [range, setRange] = useState('30D');
  const [shift, setShift] = useState(0);
  const [product, setProduct] = useState('');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [dir, setDir] = useState('');
  const [user, setUser] = useState('');
  const [moves, setMoves] = useState<Move[]>([]);
  const [adj, setAdj] = useState(false);
  const [toast, setToast] = useState('');

  const days = ranges.find((r) => r.k === range)!.days;
  const to = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - shift * days); return d; }, [shift, days]);
  const from = useMemo(() => { const d = new Date(to); d.setDate(d.getDate() - days); return d; }, [to, days]);

  const rows = moves.filter((m) =>
    m.at >= from && m.at <= to && (!product || m.productId === product) && (!type || m.type === type) && (!dir || m.dir === dir) && (!user || m.by === user) &&
    (!q.trim() || `${m.sku} ${m.product}`.toLowerCase().includes(q.trim().toLowerCase())));

  const inV = rows.filter((m) => m.dir === 'In').reduce((a, m) => a + m.qty * m.unitCost, 0);
  const outV = rows.filter((m) => m.dir === 'Out').reduce((a, m) => a + m.qty * m.unitCost, 0);
  const adjRows = rows.filter((m) => m.type.startsWith('Adjustment'));
  const adjV = adjRows.reduce((a, m) => a + (m.dir === 'In' ? 1 : -1) * m.qty * m.unitCost, 0);
  const dmg = rows.filter((m) => m.type === 'Damage / Lost');
  const dmgV = dmg.reduce((a, m) => a + m.qty * m.unitCost, 0);
  const closing = OPENING_VALUE + inV - outV;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const adjToday = moves.filter((m) => m.at >= today && m.type.startsWith('Adjustment')).length;
  const users = Array.from(new Set(moves.map((m) => m.by)));
  const reset = () => { setRange('30D'); setShift(0); setProduct(''); setQ(''); setType(''); setDir(''); setUser(''); };
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600); };

  const exportCsv = () => download('stock-ledger.csv', [cols.filter((c) => c !== 'Image'),
    ...rows.map((m) => [fmtDate(m.at), m.product, m.sku, m.type, m.dir, m.qty, m.prev, m.next, m.unitCost, (m.dir === 'In' ? 1 : -1) * m.qty * m.unitCost, m.ref, m.warehouse, m.by, m.reason])]);

  const addAdjustment = (a: { productId: string; kind: 'add' | 'deduct'; qty: number; reason: string; note: string }) => {
    const p = productSeed.find((x) => x.id === a.productId)!;
    const d: Dir = a.kind === 'add' ? 'In' : 'Out';
    const type = d === 'Out' && ['Damaged', 'Lost / Stolen', 'Expired'].includes(a.reason) ? 'Damage / Lost' : d === 'In' ? 'Adjustment In' : 'Adjustment Out';
    const prev = moves.find((m) => m.productId === p.id)?.next ?? p.qty;
    const next = d === 'In' ? prev + a.qty : prev - a.qty;
    // TODO: real API call - POST /stock-ledger/adjustments
    setMoves((l) => [{ id: Date.now(), at: new Date(), productId: p.id, product: p.name, sku: p.code, type, dir: d, qty: a.qty, prev, next, unitCost: p.costPrice, ref: `ADJ-${String(l.length + 1).padStart(4, '0')}`, warehouse: 'Main', by: 'You', reason: `${a.reason} - ${a.note}` }, ...l]);
    setAdj(false);
    flash('Adjustment added');
  };

  return (
    <div className="mx-auto max-w-[1560px] pt-7">
      <header className="flex flex-wrap items-start justify-between gap-4 px-1">
        <div className="flex items-start gap-3.5">
          <span className="bg-ed-brand-soft text-ed-brand border-ed-line mt-0.5 flex size-11 items-center justify-center rounded-xl border"><BookOpen className="size-5" strokeWidth={1.7} /></span>
          <div>
            <h1 className="text-[26px] leading-tight font-medium tracking-tight">Stock Ledger</h1>
            <p className="text-ed-text/70 mt-0.5 text-[14px]">Track every stock movement, value impact, and inventory audit trail.</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={exportCsv} className={btnOut}><Download className="size-4" /> Export</button>
          <button type="button" onClick={() => setAdj(true)} className={btnPrimary}><Plus className="size-4" /> Add Adjustment</button>
        </div>
      </header>

      {toast && <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-[13px] font-medium text-green-700">{toast}</p>}

      <div role="tablist" className="mt-5 flex gap-1.5">
        {([['ledger', 'Stock Ledger', BookOpen], ['integrity', 'Stock Integrity', ShieldCheck]] as const).map(([k, l, Icon]) => (
          <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setTab(k)}
            className={cn('flex h-10 items-center gap-2.5 rounded-lg px-3.5 text-[14px] transition', tab === k ? 'bg-ed-brand-soft text-ed-brand border-ed-brand/15 border shadow-sm' : 'text-ed-text/70 hover:text-ed-brand border border-transparent')}>
            <Icon className="size-4" /> {l}
          </button>
        ))}
      </div>

      {tab === 'integrity' ? (
        <div className={cn(card, 'text-ed-muted mt-5 px-6 py-20 text-center')}>
          <ShieldCheck className="text-ed-brand mx-auto size-8" strokeWidth={1.5} />
          <p className="text-ed-text mt-3 text-[15px] font-medium">Stock Integrity</p>
          <p className="mt-1 text-[13px]">Mismatch checks between ledger and on-hand stock will appear here.</p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Opening Stock Value" value={taka(OPENING_VALUE)} sub="At start of selected range" icon={Layers} tone="bg-[#eeeff7] text-[#4a4f8a]" />
            <Kpi label="Stock In Value" value={taka(inV)} sub={`${rows.filter((m) => m.dir === 'In').length} in-movements`} icon={Download} tone="bg-[#e3f8ec] text-[#16a34a]" />
            <Kpi label="Stock Out Value" value={taka(outV)} sub={`${rows.filter((m) => m.dir === 'Out').length} out-movements`} icon={Download} tone="bg-[#fde8ea] text-[#e5243b] [&_svg]:rotate-180" />
            <Kpi label="Closing Stock Value" value={taka(closing)} sub="At end of selected range" icon={PackageCheck} tone="bg-[#eeeff7] text-[#4a4f8a]" />
            <Kpi label="Adjustment Value" value={taka(adjV)} sub={`${adjRows.length} manual adjustments`} icon={SlidersHorizontal} tone="bg-[#fff1d6] text-[#d97706]" />
            <Kpi label="Damage/Lost Value" value={taka(dmgV)} sub={`${dmg.length} damage/loss entries`} icon={Flame} tone="bg-[#ffecd9] text-[#ea580c]" />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Risk label="Low Stock Products" value={RISK.low} sub="At or below alert quantity" icon={AlertTriangle} tone="bg-[#fff1c9] text-[#d97706]" href="/dashboard/inventory/low-stock-alert" hint="Open low stock alerts" />
            <Risk label="Stockout Risk" value={RISK.stockout} sub="Out of stock or selling fast" icon={ShieldAlert} tone="bg-[#fde8ea] text-[#e5243b]" href="/dashboard/inventory" />
            <Risk label="Fast Moving SKUs" value={RISK.fast} sub="10+ units sold in range" icon={TrendingUp} tone="bg-[#e3f8ec] text-[#16a34a]" href="/dashboard/reports/product-report?tab=top-products&minSold=10" hint="Open top selling products report" />
            <Risk label="High Adjustment Alerts" value={RISK.highAdj} sub="3+ manual adjustments in range" icon={Zap} tone="bg-[#f1e6ff] text-[#9333ea]" />
          </div>

          <div className={cn(card, 'mt-4 flex flex-wrap items-center gap-3 p-4')}>
            <div className="bg-[#f3f1f7] flex h-10 items-center rounded-lg p-0.5">
              <button type="button" aria-label="Previous range" onClick={() => setShift((s) => s + 1)} className="hover:text-ed-brand flex size-8 items-center justify-center"><ChevronLeft className="size-4" /></button>
              <div className="relative">
                <CalendarDays className="text-ed-muted pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                <select aria-label="Date range" value={range} onChange={(e) => { setRange(e.target.value); setShift(0); }} className="h-8 cursor-pointer appearance-none rounded-md bg-white pr-7 pl-8 text-[13.5px] shadow-sm outline-none">
                  {ranges.map((r) => <option key={r.k}>{r.k}</option>)}
                </select>
                <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2" />
              </div>
              <button type="button" aria-label="Next range" disabled={shift === 0} onClick={() => setShift((s) => Math.max(0, s - 1))} className="hover:text-ed-brand flex size-8 items-center justify-center disabled:opacity-30"><ChevronRight className="size-4" /></button>
            </div>

            <Select label="Product" value={product} onChange={setProduct} updown className="min-w-[200px] flex-1 basis-[320px]">
              <option value="">All products</option>
              {productSeed.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <div className="relative min-w-[170px] flex-1 basis-[190px]">
              <Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="SKU / Variant" aria-label="Search SKU or variant" className={cn(sel, 'pr-3 pl-9')} />
            </div>
            <Select label="Movement type" value={type} onChange={setType} className="min-w-[170px] flex-1 basis-[180px]">
              <option value="">All movement types</option>
              {['Purchase', 'Return', 'Order Sale', 'Transfer In', 'Transfer Out', ...adjTypes].map((t) => <option key={t}>{t}</option>)}
            </Select>
            <Select label="Direction" value={dir} onChange={setDir} className="min-w-[160px] flex-1 basis-[190px]">
              <option value="">All directions</option><option>In</option><option>Out</option>
            </Select>
            <Select label="User" value={user} onChange={setUser} className="w-[130px] basis-[130px] max-lg:flex-1">
              <option value="">All users</option>
              {users.map((u) => <option key={u}>{u}</option>)}
            </Select>
            <button type="button" aria-label="Reset filters" onClick={reset} className="hover:text-ed-brand flex size-10 items-center justify-center rounded-lg"><RotateCcw className="size-4" /></button>
          </div>

          <div className={cn(card, 'mt-4 overflow-hidden')}>
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[1500px] text-left">
                <thead>
                  <tr className="border-ed-line border-b text-[14px]">
                    {cols.map((c) => <th key={c} className={cn('px-4 py-4 font-normal whitespace-nowrap', ['Qty', 'Previous Stock', 'New Stock', 'Unit Cost', 'Value Impact'].includes(c) && 'text-right')}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((m) => {
                    const v = (m.dir === 'In' ? 1 : -1) * m.qty * m.unitCost;
                    const p = productSeed.find((x) => x.id === m.productId);
                    return (
                      <tr key={m.id} className="border-ed-line border-b text-[13.5px] last:border-b-0">
                        <td className="px-4 py-3.5 whitespace-nowrap">{fmtDate(m.at)}</td>
                        <td className="px-4"><span className="block size-9 rounded-md border border-black/5" style={{ background: p?.images[0]?.bg }} /></td>
                        <td className="max-w-[240px] truncate px-4">{m.product}</td>
                        <td className="px-4">{m.sku}</td>
                        <td className="px-4 whitespace-nowrap">{m.type}</td>
                        <td className="px-4"><span className={cn('rounded-full px-2.5 py-0.5 text-[11.5px] font-medium', m.dir === 'In' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>{m.dir}</span></td>
                        <td className="px-4 text-right">{m.qty}</td>
                        <td className="px-4 text-right">{m.prev}</td>
                        <td className="px-4 text-right">{m.next}</td>
                        <td className="px-4 text-right">{taka(m.unitCost)}</td>
                        <td className={cn('px-4 text-right font-medium', v >= 0 ? 'text-emerald-700' : 'text-rose-600')}>{v >= 0 ? '+' : '-'}{taka(Math.abs(v))}</td>
                        <td className="px-4">{m.ref}</td>
                        <td className="px-4">{m.warehouse}</td>
                        <td className="px-4">{m.by}</td>
                        <td className="max-w-[200px] truncate px-4">{m.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {rows.length === 0 && (
              <div className="flex flex-col items-center px-6 pt-14 pb-12 text-center">
                <span className="bg-[#eeeff7] text-ed-brand flex size-16 items-center justify-center rounded-full"><BookOpen className="size-7" strokeWidth={1.7} /></span>
                <p className="mt-5 text-[16px] font-medium">No stock movements found</p>
                <p className="text-ed-text/65 mt-1.5 max-w-[460px] text-[13.5px] leading-relaxed">Stock movements will appear here when purchases, orders, returns, transfers, or adjustments update inventory.</p>
                <button type="button" onClick={() => setAdj(true)} className={cn(btnPrimary, 'mt-5')}><Plus className="size-4" /> Add Adjustment</button>
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Mini label="Total Movements" value={String(rows.length)} sub="In selected range" icon={Activity} tone="text-[#4a4f8a]" />
            <Mini label="Manual Adjustments Today" value={String(adjToday)} sub="Since midnight (Dhaka)" icon={SlidersHorizontal} tone="text-[#d97706]" />
            <Mini label="Last Sync" value={moves[0] ? fmtDate(moves[0].at) : LAST_SYNC} sub="Latest recorded movement" icon={Clock} tone="text-[#2f5fe8]" />
            <Mini label="Stock Accuracy" value="100.0%" sub="Units moved without manual fixes" icon={CheckCircle2} tone="text-[#16a34a]" />
          </div>
        </>
      )}

      {adj && <AdjustDialog onClose={() => setAdj(false)} onSave={addAdjustment} />}
    </div>
  );
}

const dSel = 'border-ed-line focus:border-ed-brand/40 focus:ring-ed-brand/10 h-10 w-full cursor-pointer appearance-none rounded-lg border bg-white pr-9 pl-3.5 text-[13.5px] outline-none focus:ring-2';
const reasons = ['Stock count correction', 'Opening stock', 'Found stock', 'Supplier return', 'Damaged', 'Lost / Stolen', 'Expired', 'Other'];
const Req = ({ children }: { children: ReactNode }) => <label className="mb-1.5 block text-[13.5px] font-medium">{children} <span className="text-rose-500">*</span></label>;

function AdjustDialog({ onClose, onSave }: { onClose: () => void; onSave: (a: { productId: string; kind: 'add' | 'deduct'; qty: number; reason: string; note: string }) => void }) {
  const [productId, setProductId] = useState('');
  const [kind, setKind] = useState<'add' | 'deduct'>('add');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const ok = !!productId && Number(qty) > 0 && !!reason && !!note.trim();
  return (
    <Dialog title="Add Stock Adjustment" desc="Manually add or deduct stock. Every adjustment creates a permanent ledger entry." onClose={onClose} width="max-w-[520px]">
      <div className="space-y-4 pt-1">
        <div>
          <Req>Product</Req>
          <div className="relative">
            <select aria-label="Product" value={productId} onChange={(e) => setProductId(e.target.value)} className={cn(dSel, !productId && 'text-ed-text')}>
              <option value="">Select product...</option>
              {productSeed.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
            </select>
            <Chev updown />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_0.95fr]">
          <div>
            <Req>Adjustment Type</Req>
            <div className="relative">
              <select aria-label="Adjustment type" value={kind} onChange={(e) => setKind(e.target.value as 'add' | 'deduct')} className={dSel}>
                <option value="add">Add stock</option><option value="deduct">Deduct stock</option>
              </select>
              <Chev />
            </div>
          </div>
          <div>
            <Req>Quantity</Req>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" aria-label="Quantity" className={cn(dSel, 'cursor-text pr-3')} />
          </div>
        </div>
        <div>
          <Req>Reason</Req>
          <div className="relative">
            <select aria-label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className={dSel}>
              <option value="">Select reason</option>
              {reasons.map((r) => <option key={r}>{r}</option>)}
            </select>
            <Chev />
          </div>
        </div>
        <div>
          <Req>Note</Req>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why is this adjustment needed? (required)" aria-label="Note"
            className="border-ed-line focus:border-ed-brand/40 focus:ring-ed-brand/10 placeholder:text-ed-muted/70 h-[80px] w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-[13.5px] outline-none focus:ring-2" />
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onClose} className={cn(btnOut, 'h-11 px-5 font-semibold')}>Cancel</button>
        <button type="button" disabled={!ok} onClick={() => onSave({ productId, kind, qty: Number(qty), reason, note: note.trim() })} className={cn(btnPrimary, 'h-11 font-semibold')}>Save Adjustment</button>
      </div>
    </Dialog>
  );
}
