'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle, BookOpen, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, Package,
  Pencil, Plus, Search, ShieldCheck, ShoppingCart, Trash2, Upload, Users, Wallet, X,
} from 'lucide-react';
import { download, GuideModal } from '@/components/courier/ui';
import { Switch } from '@/components/products/ui';
import { catalog, taka } from '@/data/purchase';
import { usePurchaseOrders } from '@/lib/purchaseStore';
import { supplierActions, useSupplierRecords, type SupplierRecord } from '@/lib/supplierStore';
import { cn } from '@/lib/utils';
import { fmtDateTime } from './format';

/* ───────── derived supplier row ───────── */
type Risk = 'Low' | 'Medium' | 'High';
interface Row extends SupplierRecord { purchases: number; total: number; due: number; last: string | null; risk: Risk }

const TABS = [
  { k: 'suppliers', label: 'Suppliers', icon: Users },
  { k: 'purchase', label: 'Purchase Report', icon: ShoppingCart },
  { k: 'due', label: 'Due Report', icon: Wallet },
  { k: 'risk', label: 'Stock Risk', icon: AlertTriangle },
] as const;
type Tab = (typeof TABS)[number]['k'];

const TERMS = ['Cash on delivery', '7 days', '15 days', '30 days', '45 days', '60 days'];
const LOW_STOCK = 10;

const riskCls: Record<Risk, string> = {
  Low: 'border-[#b7ebd0] bg-[#e8f8f0] text-[#0f9d58]',
  Medium: 'border-[#f6dca8] bg-[#fdf4e0] text-[#b7791f]',
  High: 'border-[#f8c9cf] bg-[#fdecee] text-[#e5243b]',
};

/* ───────── small ui ───────── */
function Select({ value, onChange, options, prefix, label }: { value: string; onChange: (v: string) => void; options: string[]; prefix?: string; label: string }) {
  return (
    <div className="relative">
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
        className="border-ed-line text-ed-text focus:border-ed-brand/40 h-10 w-full cursor-pointer appearance-none rounded-lg border bg-white pr-9 pl-3 text-[13.5px] outline-none">
        {options.map((o) => <option key={o} value={o}>{prefix ? `${prefix}: ${o}` : o}</option>)}
      </select>
      <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
    </div>
  );
}

function StatTile({ icon: Icon, tone, label, value, note, noteCls }: { icon: React.ElementType; tone: string; label: string; value: ReactNode; note: string; noteCls?: string }) {
  return (
    <div className="border-ed-line flex items-center gap-4 rounded-xl border bg-white px-5 py-[18px] shadow-[0_1px_3px_rgba(30,20,50,0.05)]">
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', tone)}><Icon className="size-[18px]" /></span>
      <div className="min-w-0">
        <p className="text-ed-text/70 text-[14px] leading-tight">{label}</p>
        <p className="mt-1 text-[24px] leading-none font-semibold">{value}</p>
        <p className={cn('text-ed-muted mt-1.5 text-[12.5px]', noteCls)}>{note}</p>
      </div>
    </div>
  );
}

function Alert({ icon: Icon, tone, value, label }: { icon: React.ElementType; tone: string; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4">
      <span className={cn('flex size-8 items-center justify-center rounded-lg', tone)}><Icon className="size-4" /></span>
      <div><p className="text-[14px] leading-tight font-medium">{value}</p><p className="text-ed-muted text-[12px] leading-tight">{label}</p></div>
    </div>
  );
}

const th = 'px-4 py-4 text-[11.5px] font-medium tracking-wider uppercase text-ed-text/70 whitespace-nowrap';

/* ───────── Add / Edit modal ───────── */
const blank = (): Omit<SupplierRecord, 'id' | 'createdAt'> => ({
  name: '', phone: '', email: '', terms: '30 days', contact: '', whatsapp: '', address: '', city: '', state: '', country: '', zip: '', active: true, image: undefined,
});

const fieldCls = 'border-ed-line placeholder:text-ed-muted focus:border-ed-brand/40 focus:ring-ed-brand/10 h-11 w-full rounded-lg border bg-white px-3 text-[13.5px] outline-none focus:ring-2';

function F({ label, req, children }: { label: string; req?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-ed-text mb-2 block text-[13px] font-medium">{label}{req && <span className="text-ed-red"> *</span>}</span>
      {children}
    </label>
  );
}

function SupplierModal({ initial, onClose }: { initial: SupplierRecord | null; onClose: () => void }) {
  const [f, setF] = useState(() => (initial ? { ...initial } : blank()));
  const [err, setErr] = useState('');
  const [imgErr, setImgErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const pick = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) return setImgErr('Only JPEG or PNG allowed.');
    if (file.size > 2 * 1024 * 1024) return setImgErr('Image must be 2 MB or smaller.');
    setImgErr('');
    const r = new FileReader();
    r.onload = () => set('image', String(r.result));
    r.readAsDataURL(file);
  };

  const submit = () => {
    if (!f.name.trim()) return setErr('Supplier name is required.');
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) return setErr('Enter a valid email address.');
    const clean = { ...f, name: f.name.trim(), email: f.email.trim() };
    if (initial) supplierActions.update(initial.id, clean);
    else supplierActions.add({ ...clean, id: `sup-${Date.now()}`, createdAt: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={initial ? 'Edit Supplier' : 'Add Supplier'} className="flex max-h-[calc(100vh-2rem)] w-full max-w-[650px] flex-col rounded-lg bg-white shadow-2xl">
        <div className="border-ed-line flex items-center justify-between border-b px-4 py-4">
          <h3 className="text-[15px] font-semibold">{initial ? 'Edit Supplier' : 'Add Supplier'}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="text-ed-text/70 hover:text-ed-text"><X className="size-4" /></button>
        </div>

        <div className="thin-scroll flex-1 overflow-y-auto px-4 pt-4 pb-5">
          <div className="border-ed-line flex items-center gap-4 rounded-lg border bg-[#fbfafd] p-4">
            <button type="button" onClick={() => fileRef.current?.click()} aria-label="Add image"
              className="border-ed-line text-ed-muted flex size-20 shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-white text-[11px]">
              {f.image ? <img src={f.image} alt="Supplier" className="size-full object-cover" /> : <><Plus className="size-4" />Add Image</>}
            </button>
            <div>
              <button type="button" onClick={() => fileRef.current?.click()} className="border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[13.5px] font-medium shadow-sm"><Upload className="size-4" />Upload Image</button>
              <p className="text-ed-muted mt-2 text-[11px]">JPEG, PNG up to 2 MB (Optional)</p>
              {imgErr && <p className="text-ed-red mt-1 text-[11.5px]">{imgErr}</p>}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 max-sm:grid-cols-1">
            <F label="Supplier Name" req><input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Enter supplier name" className={fieldCls} autoFocus /></F>
            <F label="Phone"><input value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Enter contact number" className={fieldCls} /></F>
            <F label="Email"><input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="Enter email address" className={fieldCls} /></F>
            <F label="Payment Terms">
              <div className="relative">
                <select value={f.terms} onChange={(e) => set('terms', e.target.value)} className={cn(fieldCls, 'cursor-pointer appearance-none pr-9')}>{TERMS.map((t) => <option key={t}>{t}</option>)}</select>
                <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
              </div>
            </F>
            <F label="Contact Person"><input value={f.contact} onChange={(e) => set('contact', e.target.value)} placeholder="Enter key contact name" className={fieldCls} /></F>
            <F label="WhatsApp Number"><input value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="Enter WhatsApp contact" className={fieldCls} /></F>
            <div className="col-span-2 max-sm:col-span-1">
              <F label="Address"><textarea value={f.address} onChange={(e) => set('address', e.target.value)} placeholder="Enter physical street address" rows={2} className={cn(fieldCls, 'h-[50px] resize-none py-3')} /></F>
            </div>
            <F label="City"><input value={f.city} onChange={(e) => set('city', e.target.value)} placeholder="Enter city" className={fieldCls} /></F>
            <F label="State / Province"><input value={f.state} onChange={(e) => set('state', e.target.value)} placeholder="Enter state or province" className={fieldCls} /></F>
            <F label="Country"><input value={f.country} onChange={(e) => set('country', e.target.value)} placeholder="Enter country" className={fieldCls} /></F>
            <F label="Postal / Zip Code"><input value={f.zip} onChange={(e) => set('zip', e.target.value)} placeholder="Enter zip code" className={fieldCls} /></F>
          </div>

          <div className="border-ed-line mt-5 flex items-center justify-between rounded-lg border bg-[#fbfafd] px-3 py-3.5">
            <div><p className="text-[13px] font-medium">Active Status</p><p className="text-ed-muted text-[11px]">Toggle active state for this supplier</p></div>
            <Switch on={f.active} onChange={(v) => set('active', v)} label="Active status" small />
          </div>
          {err && <p role="alert" className="text-ed-red mt-3 text-[12.5px]">{err}</p>}
        </div>

        <div className="border-ed-line flex justify-end gap-3 border-t px-4 py-4">
          <button type="button" onClick={onClose} className="border-ed-line hover:text-ed-brand h-10 rounded-lg border bg-white px-5 text-[13.5px] font-medium shadow-sm">Cancel</button>
          <button type="button" onClick={submit} className="bg-ed-brand h-10 rounded-lg px-5 text-[13.5px] font-medium text-white shadow-[0_3px_8px_rgba(63,19,85,0.3)] hover:brightness-110">{initial ? 'Save Changes' : 'Add Supplier'}</button>
        </div>
      </div>
    </div>
  );
}

/* ───────── page ───────── */
export function Suppliers() {
  const records = useSupplierRecords();
  const orders = usePurchaseOrders();
  const [tab, setTab] = useState<Tab>('suppliers');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [risk, setRisk] = useState('All');
  const [size, setSize] = useState(5);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | 'new' | SupplierRecord>(null);
  const [guide, setGuide] = useState(false);

  const rows: Row[] = useMemo(() => records.map((s) => {
    const mine = orders.filter((o) => o.supplier === s.name);
    const total = mine.reduce((a, o) => a + o.amount, 0);
    const due = mine.reduce((a, o) => a + (o.settled ? 0 : Math.max(o.amount - o.paid, 0)), 0);
    const last = mine.map((o) => o.date).sort().at(-1) ?? null;
    const ratio = total ? due / total : 0;
    return { ...s, purchases: mine.length, total, due, last, risk: ratio > 0.6 ? 'High' : ratio > 0.2 ? 'Medium' : 'Low' } as Row;
  }), [records, orders]);

  const filtered = rows.filter((s) =>
    (!q.trim() || `${s.name} ${s.phone} ${s.email} ${s.contact}`.toLowerCase().includes(q.trim().toLowerCase())) &&
    (status === 'All' || (status === 'Active') === s.active) &&
    (risk === 'All' || s.risk === risk));

  const pages = Math.max(Math.ceil(filtered.length / size), 1);
  const cur = Math.min(page, pages);
  const slice = filtered.slice((cur - 1) * size, cur * size);

  const active = rows.filter((s) => s.active).length;
  const lowItems = rows.length ? catalog.filter((c) => c.stock <= LOW_STOCK).length : 0;
  const overdue = rows.filter((s) => s.due > 0 && s.risk === 'High').length;
  const attention = rows.filter((s) => s.risk !== 'Low' && s.due > 0).length;
  const totals = { purchased: rows.reduce((a, s) => a + s.total, 0), due: rows.reduce((a, s) => a + s.due, 0) };

  const exportCsv = () =>
    download('suppliers.csv', [
      ['Supplier', 'Phone', 'Email', 'Terms', 'Purchases', 'Total Purchased', 'Due', 'Last Purchase', 'Status', 'Risk'],
      ...filtered.map((s) => [s.name, s.phone, s.email, s.terms, s.purchases, s.total, s.due, s.last ?? '', s.active ? 'Active' : 'Inactive', s.risk]),
    ]);

  const emptyMsg = 'No suppliers match the current filter criteria.';

  return (
    <div className="mx-auto max-w-[1407px] pt-7 pb-10">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] leading-tight font-semibold tracking-tight">Suppliers</h1>
            <button type="button" onClick={() => setGuide(true)} className="border-ed-line hover:text-ed-brand flex h-9 items-center gap-2 rounded-lg border bg-white px-4 text-[13.5px] shadow-sm"><BookOpen className="size-4" />Guide</button>
          </div>
          <p className="text-ed-text/65 mt-1 text-[12.5px]">Manage suppliers, track dues, and decide what to reorder.</p>
        </div>
        <div className="border-ed-line divide-ed-line flex divide-x rounded-xl border bg-white py-3 shadow-[0_1px_3px_rgba(30,20,50,0.05)]">
          <Alert icon={AlertTriangle} tone="bg-[#fdecee] text-[#e5243b]" value={attention} label="Attention need" />
          <Alert icon={Clock} tone="bg-[#fdf4e0] text-[#e08a00]" value={overdue} label="Overdue" />
          <Alert icon={Package} tone="bg-[#e8f0ff] text-[#2f5fe8]" value={lowItems} label="Reorder items" />
        </div>
      </div>

      {/* KPI tiles */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatTile icon={Users} tone="bg-[#e8f8f0] text-[#2fb36d]" label="Total Suppliers" value={rows.length} note="All time" />
        <StatTile icon={ShieldCheck} tone="bg-[#e8f8f0] text-[#2fb36d]" label="Active Suppliers" value={active} note={`${rows.length ? Math.round((active / rows.length) * 100) : 0}% of total`} noteCls="text-[#0f9d58]" />
        <StatTile icon={ShoppingCart} tone="bg-[#e8f0ff] text-[#2f5fe8]" label="Total Purchased" value={taka(totals.purchased)} note="All purchases" />
        <StatTile icon={Wallet} tone="bg-[#fdecee] text-[#e5243b]" label="Total Due" value={taka(totals.due)} note="Outstanding" />
        <StatTile icon={AlertTriangle} tone="bg-[#fdf4e0] text-[#e08a00]" label="Overdue Suppliers" value={overdue} note="Require action" noteCls="text-[#e08a00]" />
        <StatTile icon={Package} tone="bg-[#f1eaf7] text-[#7a3fb5]" label="Need Reorder" value={lowItems} note="Low stock items" />
      </div>

      {/* tabs */}
      <div role="tablist" className="border-ed-line mt-7 flex gap-7 border-b">
        {TABS.map(({ k, label, icon: Icon }) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setPage(1); }}
            className={cn('-mb-px flex items-center gap-2 border-b-2 pb-3 text-[14.5px] transition', tab === k ? 'text-ed-brand border-ed-brand font-medium' : 'text-ed-text/60 hover:text-ed-brand border-transparent')}>
            <Icon className="size-4" />{label}
          </button>
        ))}
      </div>

      {/* panel */}
      <div className="border-ed-line mt-4 overflow-hidden rounded-xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)]">
        {tab === 'suppliers' && (
          <>
            <div className="flex flex-wrap items-center gap-3 p-4">
              <div className="relative w-[240px] max-sm:w-full">
                <Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search suppliers..." className="border-ed-line placeholder:text-ed-muted focus:border-ed-brand/40 h-10 w-full rounded-lg border bg-white pr-3 pl-9 text-[13.5px] outline-none" />
              </div>
              <div className="w-[145px]"><Select label="Status" prefix="Status" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={['All', 'Active', 'Inactive']} /></div>
              <div className="w-[145px]"><Select label="Risk" prefix="Risk" value={risk} onChange={(v) => { setRisk(v); setPage(1); }} options={['All', 'Low', 'Medium', 'High']} /></div>
              <div className="ml-auto flex items-center gap-3">
                <button type="button" onClick={exportCsv} className="border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[13.5px] shadow-sm"><Download className="size-4" />Download</button>
                <button type="button" onClick={() => setModal('new')} className="bg-ed-brand flex h-10 items-center gap-2 rounded-lg px-4 text-[13.5px] font-medium text-white shadow-[0_3px_8px_rgba(63,19,85,0.3)] hover:brightness-110"><Plus className="size-4" />Add Supplier</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-ed-line border-y bg-[#fcfbfd]">
                    {['Supplier', 'Phone', 'Terms', 'Purchases', 'Total Purchased', 'Due', 'Last Purchase', 'Status', 'Risk'].map((h) => <th key={h} className={th}>{h}</th>)}
                    <th className={cn(th, 'text-right')}>Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[13.5px] [&_td]:px-4 [&_td]:py-3.5 [&_tr:not(:last-child)]:border-b [&_tr]:border-ed-line">
                  {slice.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span className="bg-ed-brand-soft text-ed-brand flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
                            {s.image ? <img src={s.image} alt="" className="size-full object-cover" /> : <Users className="size-4" />}
                          </span>
                          <div><p className="font-medium">{s.name}</p>{s.contact && <p className="text-ed-muted text-[11.5px]">{s.contact}</p>}</div>
                        </div>
                      </td>
                      <td>{s.phone || '—'}</td><td>{s.terms}</td><td>{s.purchases}</td><td>{taka(s.total)}</td>
                      <td className={s.due > 0 ? 'text-ed-red font-medium' : ''}>{taka(s.due)}</td>
                      <td className="whitespace-nowrap">{s.last ? fmtDateTime(s.last) : '—'}</td>
                      <td><span className={cn('rounded-full border px-3 py-0.5 text-[12px] font-medium', s.active ? riskCls.Low : 'border-ed-line bg-[#f4f3f7] text-ed-muted')}>{s.active ? 'Active' : 'Inactive'}</span></td>
                      <td><span className={cn('rounded-full border px-3 py-0.5 text-[12px] font-medium', riskCls[s.risk])}>{s.risk}</span></td>
                      <td>
                        <div className="flex justify-end gap-1.5">
                          <button type="button" aria-label={`Edit ${s.name}`} onClick={() => setModal(records.find((r) => r.id === s.id) ?? null)} className="border-ed-line hover:text-ed-brand flex size-8 items-center justify-center rounded-lg border"><Pencil className="size-3.5" /></button>
                          <button type="button" aria-label={`Delete ${s.name}`} onClick={() => confirm(`Delete ${s.name}?`) && supplierActions.remove(s.id)} className="border-ed-line text-ed-red flex size-8 items-center justify-center rounded-lg border hover:bg-[#fdecee]"><Trash2 className="size-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {slice.length === 0 && <p className="text-ed-blue py-8 text-center text-[13px]">{emptyMsg}</p>}

            <div className="border-ed-line flex flex-wrap items-center justify-between gap-3 border-t px-4 py-4 text-[12px]">
              <p className="text-ed-muted">Showing {filtered.length ? (cur - 1) * size + 1 : 0} to {Math.min(cur * size, filtered.length)} of {filtered.length} suppliers</p>
              <div className="flex items-center gap-3">
                <button type="button" aria-label="Previous page" disabled={cur <= 1} onClick={() => setPage(cur - 1)} className="text-ed-muted flex size-8 items-center justify-center rounded-lg disabled:opacity-40"><ChevronLeft className="size-4" /></button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="button" onClick={() => setPage(n)} aria-current={n === cur} className={cn('flex size-8 items-center justify-center rounded-lg text-[12.5px]', n === cur ? 'bg-ed-brand font-medium text-white' : 'hover:text-ed-brand')}>{n}</button>
                ))}
                <button type="button" aria-label="Next page" disabled={cur >= pages} onClick={() => setPage(cur + 1)} className="text-ed-muted flex size-8 items-center justify-center rounded-lg disabled:opacity-40"><ChevronRight className="size-4" /></button>
                <span className="text-ed-text/70 ml-2">Show:</span>
                <div className="w-[110px]"><Select label="Rows per page" value={`${size} / page`} onChange={(v) => { setSize(parseInt(v, 10)); setPage(1); }} options={['5 / page', '10 / page', '20 / page', '50 / page']} /></div>
              </div>
            </div>
          </>
        )}

        {tab === 'purchase' && (
          <ReportTable head={['Supplier', 'Purchases', 'Total Purchased', 'Last Purchase']} empty="No purchase data yet."
            rows={rows.map((s) => [s.name, s.purchases, taka(s.total), s.last ? fmtDateTime(s.last) : '—'])} />
        )}
        {tab === 'due' && (
          <ReportTable head={['Supplier', 'Terms', 'Total Purchased', 'Due', 'Risk']} empty="No outstanding dues."
            rows={rows.filter((s) => s.due > 0).map((s) => [s.name, s.terms, taka(s.total), taka(s.due), s.risk])} />
        )}
        {tab === 'risk' && (
          <ReportTable head={['Product', 'SKU', 'Stock']} empty="No low stock items."
            rows={catalog.filter((c) => c.stock <= LOW_STOCK).map((c) => [c.name, c.sku, c.stock])} />
        )}
      </div>

      {modal && <SupplierModal initial={modal === 'new' ? null : modal} onClose={() => setModal(null)} />}
      {guide && <GuideModal title="Suppliers Guide" onClose={() => setGuide(false)} points={[
        'Add each vendor you buy stock from with contact details and payment terms.',
        'Total Purchased and Due are calculated from your purchase orders for that supplier.',
        'Risk rises as the unpaid share of a supplier’s purchases grows.',
        'Use the Stock Risk tab to see low stock products that need reordering.',
      ]} />}
    </div>
  );
}

function ReportTable({ head, rows, empty }: { head: string[]; rows: (string | number)[][]; empty: string }) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead><tr className="border-ed-line border-b bg-[#fcfbfd]">{head.map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
          <tbody className="text-[13.5px] [&_td]:px-4 [&_td]:py-3.5 [&_tr:not(:last-child)]:border-b [&_tr]:border-ed-line">
            {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="text-ed-blue py-12 text-center text-[13px]">{empty}</p>}
    </>
  );
}
