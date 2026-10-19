'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronsUpDown, Download, Eye, FileText, Lock, Pencil, Plus, Search, SlidersHorizontal, Trash2, TrendingUp, Wallet, Package, Clock, BookOpen, Unlock } from 'lucide-react';
import { download, GuideModal, Modal } from '@/components/courier/ui';
import { orderPay, QUICK_SUPPLIER, suppliers, type PurchaseOrder } from '@/data/purchase';
import { purchaseActions, usePurchaseOrders } from '@/lib/purchaseStore';
import { cn } from '@/lib/utils';
import { fmtDateTime, money2, num, todayIso } from './format';
import { inputCls, SelectBox } from './ui';

const COLS = ['Date', 'Supplier', 'Items', 'Note', 'Amount', 'Fulfillment', 'Payment'] as const;
type Col = (typeof COLS)[number];
type SortKey = 'date' | 'supplier' | 'amount';

const pill = 'border-ed-line hover:text-ed-brand flex h-11 items-center gap-2 rounded-full border bg-white px-5 text-[13.5px] transition';

function useOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, [onClose]);
  return ref;
}

function Menu({ label, icon, children }: { label: string; icon?: ReactNode; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(() => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className={pill} aria-expanded={open}>{icon}{label}<ChevronDown className="text-ed-muted size-4" /></button>
      {open && <div className="border-ed-line absolute top-full right-0 z-30 mt-2 min-w-[190px] rounded-xl border bg-white p-1.5 shadow-[0_12px_32px_rgba(30,20,50,0.16)]">{children(() => setOpen(false))}</div>}
    </div>
  );
}

const money = (n: number) => `৳${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Summary({ label, icon: Icon, tone, children }: { label: string; icon: React.ElementType; tone: string; children: ReactNode }) {
  return (
    <div className="border-ed-line rounded-[28px] border bg-white p-7 shadow-[0_8px_24px_rgba(30,20,50,0.05)] ring-[6px] ring-[#f8f6fb]">
      <div className="flex items-center justify-between">
        <p className="text-ed-text/80 text-[13px] font-semibold tracking-wider uppercase">{label}</p>
        <span className={cn('flex size-9 items-center justify-center rounded-full', tone)}><Icon className="size-4" /></span>
      </div>
      {children}
    </div>
  );
}

function Progress({ pct, color, a, b, c }: { pct: number; color: string; a: string; b: string; c: string }) {
  return (
    <>
      <p className="mt-5 flex items-baseline gap-2"><span className="text-[34px] leading-none font-bold">{Math.round(pct)}%</span></p>
      <div className="bg-[#eceaf2] mt-4 h-1.5 overflow-hidden rounded-full"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} /></div>
      <div className="text-ed-text/70 mt-3 flex justify-between text-[10.5px]"><span>{a}</span><span>{b}</span><span>{c}</span></div>
    </>
  );
}

function SortTh({ label, k, sort, onSort }: { label: string; k: SortKey; sort: { k: SortKey; d: 1 | -1 }; onSort: (k: SortKey) => void }) {
  return (
    <th className="px-3 py-4 text-[13.5px] font-medium">
      <button type="button" onClick={() => onSort(k)} className={cn('flex items-center gap-2 hover:text-ed-brand', sort.k === k && 'text-ed-brand')}>{label}<ChevronsUpDown className="size-3.5 opacity-60" /></button>
    </th>
  );
}

export function PurchaseOrders() {
  const orders = usePurchaseOrders();
  const [q, setQ] = useState('');
  const [cols, setCols] = useState<Record<Col, boolean>>(Object.fromEntries(COLS.map((c) => [c, true])) as Record<Col, boolean>);
  const [lock, setLock] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [fFul, setFFul] = useState('All');
  const [fPay, setFPay] = useState('All');
  const [fSup, setFSup] = useState('All');
  const [sort, setSort] = useState<{ k: SortKey; d: 1 | -1 }>({ k: 'date', d: -1 });
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [view, setView] = useState<PurchaseOrder | null>(null);
  const [edit, setEdit] = useState<PurchaseOrder | null>(null);
  const [guide, setGuide] = useState(false);
  const [quick, setQuick] = useState(false);

  const onSort = (k: SortKey) => setSort((s) => (s.k === k ? { k, d: (-s.d) as 1 | -1 } : { k, d: 1 }));

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return orders
      .filter((o) =>
        (fFul === 'All' || o.receive === fFul) &&
        (fPay === 'All' || orderPay(o) === fPay) &&
        (fSup === 'All' || o.supplier === fSup) &&
        (!t || `${o.id} ${o.supplier} ${o.note} ${o.items.map((i) => `${i.name} ${i.sku}`).join(' ')}`.toLowerCase().includes(t)))
      .sort((a, b) => {
        const v = sort.k === 'amount' ? a.amount - b.amount : sort.k === 'supplier' ? a.supplier.localeCompare(b.supplier) : a.date.localeCompare(b.date);
        return v * sort.d;
      });
  }, [orders, q, fFul, fPay, fSup, sort]);

  /* summary */
  const total = orders.reduce((s, o) => s + o.amount, 0);
  const rcvd = orders.filter((o) => o.receive === 'Received').length;
  const paid = orders.filter((o) => orderPay(o) === 'Paid').length;
  const part = orders.filter((o) => orderPay(o) === 'Partial').length;
  const n = orders.length || 1;
  const quickRuns = orders.filter((o) => o.source === 'Quick Stock').length;
  const partner = useMemo(() => {
    const c = new Map<string, number>();
    orders.filter((o) => o.supplier !== QUICK_SUPPLIER).forEach((o) => c.set(o.supplier, (c.get(o.supplier) ?? 0) + 1));
    return [...c.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';
  }, [orders]);

  const allSel = rows.length > 0 && rows.every((r) => sel.has(r.id));
  const toggle = (id: string) => setSel((s) => { const x = new Set(s); if (x.has(id)) x.delete(id); else x.add(id); return x; });

  const exportCsv = (only?: boolean) => {
    const list = only ? rows.filter((r) => sel.has(r.id)) : rows;
    download('purchase-orders.csv', [
      ['#', 'Date', 'Supplier', 'Items', 'Note', 'Amount', 'Fulfillment', 'Payment'],
      ...list.map((o, i) => [i + 1, fmtDateTime(o.date), o.supplier, o.items.map((x) => x.name).join(' | '), o.note, o.amount, o.receive, orderPay(o)]),
    ]);
  };
  const del = (o: PurchaseOrder) => {
    if (window.confirm('Delete this purchase order?')) { purchaseActions.remove([o.id]); setSel((s) => { const x = new Set(s); x.delete(o.id); return x; }); }
  };

  const th = 'px-3 py-4 text-[12px] font-semibold tracking-wider uppercase text-ed-text/80';
  return (
    <div className="mx-auto max-w-[1400px] pt-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] leading-tight font-semibold tracking-tight">Purchase Orders</h1>
          <p className="text-ed-text/65 mt-1 text-[14.5px]">Manage inventory replenishments, standard purchase orders, and quick stock updates.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setGuide(true)} className="border-ed-line hover:text-ed-brand flex h-12 items-center gap-2 rounded-xl border bg-white px-5 text-[14px] shadow-sm"><BookOpen className="size-4" /> Guide</button>
          <button type="button" onClick={() => setQuick(true)} className="border-ed-line hover:text-ed-brand h-12 rounded-full border bg-white px-6 text-[14px] shadow-sm">Quick Stock In</button>
          <Link href="/dashboard/purchase/new" className="bg-ed-brand flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-medium text-white shadow-sm hover:brightness-110"><Plus className="size-4" /> New Purchase</Link>
        </div>
      </header>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Spent & Volume" icon={TrendingUp} tone="bg-[#f1eaf7] text-ed-brand">
          <p className="mt-6 text-[36px] leading-none font-bold tracking-tight">{money(total)}</p>
          <p className="text-ed-text/70 mt-3 text-[12.5px]">{orders.length} total orders <span className="mx-1.5">•</span> ৳{Math.round(total / n).toLocaleString('en-US')} avg</p>
        </Summary>
        <Summary label="Fulfillment" icon={Package} tone="bg-[#e3f8ec] text-[#10b981]">
          <Progress pct={(rcvd / n) * 100} color="#10b981" a={`${rcvd} Rcvd`} b="0 Part" c={`${orders.length - rcvd} Pend`} />
        </Summary>
        <Summary label="Payment Status" icon={Wallet} tone="bg-[#e4efff] text-[#2f5fe8]">
          <Progress pct={(paid / n) * 100} color="#3b82f6" a={`${paid} Paid`} b={`${part} Part`} c={`${orders.length - paid - part} Unpd`} />
        </Summary>
        <Summary label="Active Partner" icon={Clock} tone="bg-[#fdf1dc] text-[#d97706]">
          <p className="mt-6 text-[26px] leading-none font-bold tracking-tight">{partner}</p>
          <p className="text-ed-text/70 mt-6 text-[12.5px]">{quickRuns} quick stock runs</p>
        </Summary>
      </div>

      <section className="border-ed-line mt-8 rounded-[32px] border bg-white p-8 shadow-[0_8px_24px_rgba(30,20,50,0.05)] ring-[6px] ring-[#f8f6fb]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-[384px]">
            <Search className="text-ed-muted absolute top-1/2 left-4 size-4 -translate-y-1/2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoice #, supplier, or product..." className="border-ed-line placeholder:text-ed-muted focus:border-ed-brand/40 focus:ring-ed-brand/10 h-11 w-full rounded-full border bg-[#fbfafd] pr-4 pl-11 text-[13px] outline-none focus:ring-2" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setShowFilters((s) => !s)} className={cn(pill, showFilters && 'border-ed-brand/30 text-ed-brand bg-ed-brand-soft')}><SlidersHorizontal className="size-4" /> Filters</button>
            <Menu label="Columns">
              {() => COLS.map((c) => (
                <label key={c} className="hover:bg-ed-bg flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]">
                  <input type="checkbox" checked={cols[c]} onChange={() => setCols((x) => ({ ...x, [c]: !x[c] }))} className="accent-[#3f1355]" /> {c}
                </label>
              ))}
            </Menu>
            <button type="button" onClick={() => setLock((l) => !l)} aria-pressed={lock} className={cn(pill, lock && 'border-ed-brand/30 text-ed-brand bg-ed-brand-soft')}>{lock ? <Lock className="size-4" /> : <Unlock className="size-4" />} Edit Lock</button>
            <Menu label="Export" icon={<Download className="size-4" />}>
              {(close) => (
                <>
                  <button type="button" onClick={() => { exportCsv(); close(); }} className="hover:bg-ed-bg flex w-full rounded-lg px-3 py-2 text-left text-[13px]">Export all (CSV)</button>
                  <button type="button" disabled={!sel.size} onClick={() => { exportCsv(true); close(); }} className="hover:bg-ed-bg flex w-full rounded-lg px-3 py-2 text-left text-[13px] disabled:opacity-40">Export selected ({sel.size})</button>
                </>
              )}
            </Menu>
            <button type="button" disabled={!sel.size} onClick={() => window.print()} className={cn(pill, 'text-[#e5243b]/80 disabled:cursor-not-allowed disabled:border-[#f6e7e9] disabled:bg-[#fdf6f7] disabled:text-[#e5243b]/40')}><FileText className="size-4" /> PDF</button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-ed-bg/60 border-ed-line mt-4 grid gap-3 rounded-2xl border p-4 sm:grid-cols-3">
            <SelectBox label="Fulfillment" value={fFul} onChange={setFFul} options={['All', 'Received', 'Pending']} />
            <SelectBox label="Payment" value={fPay} onChange={setFPay} options={['All', 'Paid', 'Partial', 'Unpaid']} />
            <SelectBox label="Supplier" value={fSup} onChange={setFSup} options={['All', ...suppliers.map((s) => s.name)]} />
          </div>
        )}

        <div className="border-ed-line mt-6 overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[1100px] text-left">
            <thead>
              <tr className="border-ed-line border-b bg-[#faf9fc]">
                <th className="w-12 pl-4"><input type="checkbox" aria-label="Select all" checked={allSel} onChange={() => setSel(allSel ? new Set() : new Set(rows.map((r) => r.id)))} className="size-4 accent-[#3f1355]" /></th>
                <th className={cn(th, 'w-10')}>#</th>
                <th className="w-16" />
                {cols.Date && <SortTh label="Date" k="date" sort={sort} onSort={onSort} />}
                {cols.Supplier && <SortTh label="Supplier" k="supplier" sort={sort} onSort={onSort} />}
                {cols.Items && <th className={th}>Items</th>}
                {cols.Note && <th className={th}>Note</th>}
                {cols.Amount && <SortTh label="Amount" k="amount" sort={sort} onSort={onSort} />}
                {cols.Fulfillment && <th className={th}>Fulfillment</th>}
                {cols.Payment && <th className={th}>Payment</th>}
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13.5px]">
              {rows.map((o, i) => {
                const pay = orderPay(o);
                return (
                  <tr key={o.id} className="border-ed-line hover:bg-[#fcfbfe] border-b last:border-b-0">
                    <td className="pl-4"><input type="checkbox" aria-label={`Select order ${i + 1}`} checked={sel.has(o.id)} onChange={() => toggle(o.id)} className="size-4 accent-[#3f1355]" /></td>
                    <td className="text-ed-muted px-3 text-[12px]">{i + 1}</td>
                    <td className="py-3.5"><button type="button" aria-label="View order" onClick={() => setView(o)} className="bg-ed-brand-soft text-ed-brand flex size-9 items-center justify-center rounded-full hover:brightness-95"><Eye className="size-4" /></button></td>
                    {cols.Date && <td className="px-3 whitespace-nowrap">{fmtDateTime(o.date)}</td>}
                    {cols.Supplier && <td className="px-3"><p className="font-medium">{o.supplier}</p><span className="border-ed-line text-ed-muted mt-1 inline-block rounded-md border bg-[#faf9fc] px-1.5 py-0.5 text-[10.5px]">{o.source}</span></td>}
                    {cols.Items && <td className="px-3">{o.items[0]?.name}{o.items.length > 1 && <span className="text-ed-muted ml-1 text-[12px]">+{o.items.length - 1} more</span>}</td>}
                    {cols.Note && <td className="text-ed-muted px-3">{o.note || '-'}</td>}
                    {cols.Amount && <td className="px-3 font-semibold whitespace-nowrap">{money2(o.amount)}</td>}
                    {cols.Fulfillment && (
                      <td className="px-3">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium', o.receive === 'Received' ? 'border-[#b7ebd0] bg-[#e8f8f0] text-[#0f9d58]' : 'border-ed-line bg-[#f6f5fa] text-ed-text/70')}>
                          <span className={cn('size-1.5 rounded-full', o.receive === 'Received' ? 'bg-[#10b981]' : 'bg-[#9a96a8]')} />{o.receive}
                        </span>
                      </td>
                    )}
                    {cols.Payment && <td className="text-ed-muted px-3">{!o.settled && pay !== 'Unpaid' ? <span className={cn('rounded-full px-2.5 py-1 text-[12px] font-medium', pay === 'Paid' ? 'bg-[#e8f8f0] text-[#0f9d58]' : 'bg-[#fdf4e0] text-[#b7791f]')}>{pay}</span> : '—'}</td>}
                    <td className="px-3">
                      <div className="flex items-center gap-2">
                        {o.receive === 'Pending' && <button type="button" onClick={() => purchaseActions.update(o.id, { receive: 'Received' })} className="h-9 rounded-lg bg-[#e3f8ec] px-4 text-[13px] font-medium text-[#0f9d58] hover:brightness-95">Receive</button>}
                        {!o.settled && pay !== 'Paid' && <button type="button" onClick={() => purchaseActions.update(o.id, { paid: o.amount })} className="h-9 rounded-lg bg-[#e4efff] px-4 text-[13px] font-medium text-[#2f5fe8] hover:brightness-95">Pay</button>}
                        <button type="button" aria-label="Edit" disabled={lock} onClick={() => setEdit(o)} className="text-ed-muted hover:text-ed-brand flex size-8 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"><Pencil className="size-4" /></button>
                        <button type="button" aria-label="Delete" disabled={lock} onClick={() => del(o)} className="flex size-8 items-center justify-center text-[#e5243b]/70 hover:text-[#e5243b] disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <p className="text-ed-muted py-14 text-center text-[13px]">No purchase orders found.</p>}
        </div>
        <p className="text-ed-muted mt-4 text-[12.5px]">{sel.size ? `${sel.size} selected · ` : ''}Showing {rows.length} of {orders.length} orders</p>
      </section>

      {view && <ViewModal o={view} onClose={() => setView(null)} />}
      {edit && <EditModal o={edit} onClose={() => setEdit(null)} />}
      {quick && <QuickStockModal onClose={() => setQuick(false)} />}
      {guide && <GuideModal title="Purchase Orders guide" onClose={() => setGuide(false)} points={[
        'New Purchase creates a standard purchase order for a vendor.',
        'Quick Stock In adds stock instantly without a vendor invoice.',
        'Use Receive when goods arrive — stock is added on receiving.',
        'Use Pay to settle the payment; Edit Lock prevents accidental edits and deletes.',
      ]} />}
    </div>
  );
}

function ViewModal({ o, onClose }: { o: PurchaseOrder; onClose: () => void }) {
  return (
    <Modal title={`Purchase • ${fmtDateTime(o.date)}`} onClose={onClose}>
      <p className="text-ed-muted text-[13px]">{o.supplier} · {o.source}{o.note ? ` · ${o.note}` : ''}</p>
      <table className="mt-4 w-full text-left text-[13px]">
        <thead><tr className="text-ed-muted border-ed-line border-b"><th className="py-2 font-normal">Item</th><th className="font-normal">Qty</th><th className="font-normal">Price</th><th className="text-right font-normal">Total</th></tr></thead>
        <tbody>{o.items.map((i) => <tr key={i.id} className="border-ed-line border-b"><td className="py-2.5">{i.name}<span className="text-ed-muted ml-1.5 text-[11px]">{i.sku}</span></td><td>{i.qty}</td><td>{money2(i.price)}</td><td className="text-right">{money2(i.qty * i.price)}</td></tr>)}</tbody>
      </table>
      {o.extras.map((e, i) => <p key={i} className="mt-2 flex justify-between text-[13px]"><span className="text-ed-muted">{e.label || 'Extra cost'}</span><span>{money2(e.amount)}</span></p>)}
      <p className="mt-3 flex justify-between text-[15px] font-semibold"><span>Grand Total</span><span>{money2(o.amount)}</span></p>
      <p className="text-ed-muted mt-1 flex justify-between text-[12.5px]"><span>Paid</span><span>{money2(o.settled ? o.amount : o.paid)}</span></p>
    </Modal>
  );
}

function EditModal({ o, onClose }: { o: PurchaseOrder; onClose: () => void }) {
  const [note, setNote] = useState(o.note);
  return (
    <Modal title="Edit purchase" onClose={onClose}>
      <label className="text-ed-text/80 mb-1.5 block text-[12px]">Note</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={cn(inputCls, 'h-auto py-2.5')} />
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="border-ed-line h-10 rounded-lg border px-4 text-[13.5px]">Cancel</button>
        <button type="button" onClick={() => { purchaseActions.update(o.id, { note }); onClose(); }} className="bg-ed-brand h-10 rounded-lg px-4 text-[13.5px] font-medium text-white">Save</button>
      </div>
    </Modal>
  );
}

function QuickStockModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');
  const amount = (Number(qty) || 0) * (Number(cost) || 0);
  const ok = name.trim() && Number(qty) > 0 && Number(cost) >= 0 && cost !== '';
  return (
    <Modal title="Quick Stock In" onClose={onClose}>
      <p className="text-ed-muted -mt-2 mb-4 text-[13px]">Add stock instantly — recorded as a received quick stock run.</p>
      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" className={inputCls} />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Quantity" className={inputCls} />
          <input type="number" min="0" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Unit cost (৳)" className={inputCls} />
        </div>
        <p className="text-right text-[13px]">Total: <b>{money2(amount)}</b></p>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="border-ed-line h-10 rounded-lg border px-4 text-[13.5px]">Cancel</button>
        <button type="button" disabled={!ok} onClick={() => {
          const now = new Date(); const iso = `${todayIso()}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          purchaseActions.add({ id: `q${Date.now()}`, date: iso, supplier: QUICK_SUPPLIER, source: 'Quick Stock', note: '', extras: [], amount, paid: amount, settled: true, receive: 'Received', items: [{ id: `qi${Date.now()}`, name: name.trim(), sku: '—', qty: Number(qty), price: Number(cost) }] });
          onClose();
        }} className="bg-ed-brand h-10 rounded-lg px-4 text-[13.5px] font-medium text-white disabled:opacity-50">Add Stock</button>
      </div>
    </Modal>
  );
}
