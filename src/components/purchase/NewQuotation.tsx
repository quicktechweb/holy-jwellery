'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Calendar, ChevronDown, Package, Search, Users, X } from 'lucide-react';
import { catalog, QUICK_SUPPLIER, suppliers } from '@/data/purchase';
import { rfqActions, type Priority, type RfqItem } from '@/lib/quotationStore';
import { cn } from '@/lib/utils';
import { todayIso } from './format';
import { DateField, inputCls } from './ui';

const VENDORS = suppliers.filter((s) => s.name !== QUICK_SUPPLIER).map((s) => s.name);
const PRIORITIES: Priority[] = ['Low', 'Normal', 'High', 'Urgent'];

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="border-ed-line overflow-hidden rounded-2xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.04)]">
      <div className="border-ed-line flex items-center gap-2.5 border-b px-6 py-[18px] text-[17px] font-medium"><Icon className="size-[18px]" strokeWidth={1.7} />{title}</div>
      <div className="px-6 pt-5 pb-6">{children}</div>
    </section>
  );
}

const lbl = 'text-ed-text/85 mb-2 block text-[13px]';

export function NewQuotation() {
  const router = useRouter();
  const [date, setDate] = useState(todayIso);
  const [expected, setExpected] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('Normal');
  const [note, setNote] = useState('');
  const [sup, setSup] = useState<string[]>([]);
  const [supOpen, setSupOpen] = useState(false);
  const [q, setQ] = useState('');
  const [qFocus, setQFocus] = useState(false);
  const [items, setItems] = useState<RfqItem[]>([]);
  const supRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (!supRef.current?.contains(e.target as Node)) setSupOpen(false);
      if (!searchRef.current?.contains(e.target as Node)) setQFocus(false);
    };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, []);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return catalog.filter((c) => !items.some((i) => i.pid === c.id) && `${c.name} ${c.sku}`.toLowerCase().includes(t)).slice(0, 6);
  }, [q, items]);

  const errors: string[] = [];
  if (!date) errors.push('RFQ date is required');
  if (!deadline) errors.push('Response deadline is required');
  else if (date && deadline < date) errors.push('Deadline cannot be before the RFQ date');
  if (!sup.length) errors.push('Select at least one supplier');
  if (!items.length) errors.push('Add at least one product');
  else if (items.some((i) => i.qty < 1)) errors.push('Quantity must be at least 1');
  const [tried, setTried] = useState(false);

  const save = () => {
    setTried(true);
    if (errors.length) return;
    rfqActions.add({ date, expected, deadline, priority, note: note.trim(), suppliers: sup, items, status: 'Draft' });
    router.push('/dashboard/purchase/quotation');
  };
  const patch = (pid: string, p: Partial<RfqItem>) => setItems((l) => l.map((i) => (i.pid === pid ? { ...i, ...p } : i)));

  return (
    <div className="mx-auto max-w-[958px] pt-9 pb-4">
      <header className="flex items-start gap-4">
        <Link href="/dashboard/purchase/quotation" aria-label="Back to quotations" className="border-ed-line hover:text-ed-brand mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm"><ArrowLeft className="size-4" /></Link>
        <div>
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight">New Quotation Request</h1>
          <p className="text-ed-text/65 mt-0.5 text-[14.5px]">Saved as Draft — mark it as Sent after you contact the suppliers.</p>
        </div>
      </header>

      <div className="mt-6 space-y-6">
        <Section title="Basic Information" icon={Calendar}>
          <div className="grid gap-4 md:grid-cols-3">
            <DateField label="RFQ Date" required value={date} onChange={setDate} />
            <DateField label="Expected Purchase Date" value={expected} onChange={setExpected} />
            <DateField label="Response Deadline" required value={deadline} onChange={setDeadline} />
            <label className="block">
              <span className={lbl}>Priority</span>
              <div className="relative">
                <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={cn(inputCls, 'cursor-pointer appearance-none bg-white pr-9')}>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
                <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
              </div>
            </label>
          </div>
          <label className="mt-5 block">
            <span className={lbl}>Internal Note</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Internal note for your team (optional)" className={cn(inputCls, 'h-20 resize-y bg-[#f9f8fb] py-3 text-[14.5px]')} />
          </label>
        </Section>

        <Section title="Suppliers" icon={Users}>
          <span className={lbl}>Select suppliers to ask for pricing *</span>
          <div ref={supRef} className="relative">
            <button type="button" onClick={() => setSupOpen((o) => !o)} aria-expanded={supOpen} className={cn(inputCls, 'flex h-10 items-center justify-between gap-2 bg-[#f9f8fb] text-left text-[14.5px]', !sup.length && 'text-ed-muted')}>
              <span className="flex flex-wrap items-center gap-1.5">
                {sup.length ? sup.map((s) => (
                  <span key={s} className="bg-ed-brand-soft text-ed-brand flex items-center gap-1 rounded-md px-2 py-0.5 text-[12.5px]">
                    {s}<span role="button" tabIndex={0} aria-label={`Remove ${s}`} onClick={(e) => { e.stopPropagation(); setSup((x) => x.filter((v) => v !== s)); }} onKeyDown={(e) => e.key === 'Enter' && setSup((x) => x.filter((v) => v !== s))}><X className="size-3" /></span>
                  </span>
                )) : 'Select suppliers'}
              </span>
              <ChevronDown className="text-ed-muted size-4 shrink-0" />
            </button>
            {supOpen && (
              <ul className="border-ed-line absolute top-full z-20 mt-1.5 w-full rounded-xl border bg-white p-1.5 shadow-[0_12px_32px_rgba(30,20,50,0.16)]">
                {VENDORS.map((v) => (
                  <li key={v}>
                    <label className="hover:bg-ed-bg flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px]">
                      <input type="checkbox" checked={sup.includes(v)} onChange={() => setSup((x) => (x.includes(v) ? x.filter((s) => s !== v) : [...x, v]))} className="size-4 accent-[#3f1355]" /> {v}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-ed-muted mt-3 text-[12px]">Suppliers are contacted outside EcomDrive (phone, WhatsApp, visit). Their responses are entered manually on the request page.</p>
        </Section>

        <Section title="Product Items" icon={Package}>
          <div ref={searchRef} className="relative">
            <Search className="text-ed-muted absolute top-1/2 left-4 size-4 -translate-y-1/2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setQFocus(true)} placeholder="Search products by name to add..." className={cn(inputCls, 'h-10 bg-[#f9f8fb] pl-11 text-[14.5px]')} />
            {qFocus && q.trim() && (
              <ul className="border-ed-line absolute top-full z-20 mt-1.5 w-full rounded-xl border bg-white p-1.5 shadow-[0_12px_32px_rgba(30,20,50,0.16)]">
                {matches.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => { setItems((l) => [...l, { pid: c.id, name: c.name, sku: c.sku, qty: 1, target: null }]); setQ(''); }} className="hover:bg-ed-bg flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13.5px]">
                      <span>{c.name}</span><span className="text-ed-muted text-[12px]">SKU {c.sku}</span>
                    </button>
                  </li>
                ))}
                {matches.length === 0 && <li className="text-ed-muted px-3 py-3 text-[13px]">No matching products.</li>}
              </ul>
            )}
          </div>

          {items.length === 0 ? (
            <div className="border-ed-line text-ed-text/60 mt-5 flex h-[100px] items-center justify-center rounded-xl border border-dashed text-[14.5px]">No products added yet — search above to add products.</div>
          ) : (
            <div className="border-ed-line mt-5 overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[560px] text-left text-[13.5px]">
                <thead><tr className="text-ed-muted border-ed-line border-b bg-[#faf9fc] text-[12px]"><th className="px-4 py-3 font-normal">Product</th><th className="font-normal">Quantity</th><th className="font-normal">Target price (৳)</th><th className="w-10" /></tr></thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.pid} className="border-ed-line border-b last:border-b-0">
                      <td className="px-4 py-3"><p>{i.name}</p><p className="text-ed-muted text-[11.5px]">{i.sku}</p></td>
                      <td><input type="number" min="1" aria-label="Quantity" value={i.qty} onChange={(e) => patch(i.pid, { qty: Math.max(0, Math.floor(Number(e.target.value)) || 0) })} className={cn(inputCls, 'h-9 w-24 bg-white')} /></td>
                      <td><input type="number" min="0" step="any" aria-label="Target price" value={i.target ?? ''} placeholder="Optional" onChange={(e) => patch(i.pid, { target: e.target.value === '' ? null : Number(e.target.value) })} className={cn(inputCls, 'h-9 w-32 bg-white')} /></td>
                      <td><button type="button" aria-label="Remove product" onClick={() => setItems((l) => l.filter((x) => x.pid !== i.pid))} className="text-ed-muted hover:text-ed-red flex size-8 items-center justify-center"><X className="size-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {tried && errors.length > 0 && (
          <ul role="alert" className="border-[#f8c9cf] bg-[#fdecee] text-ed-red list-disc rounded-xl border py-3 pr-4 pl-8 text-[13px]">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        )}

        <div className="flex justify-end gap-3 pb-6">
          <Link href="/dashboard/purchase/quotation" className="border-ed-line hover:text-ed-brand flex h-11 items-center rounded-lg border bg-white px-6 text-[14px]">Cancel</Link>
          <button type="button" onClick={save} className="bg-ed-brand h-11 rounded-lg px-6 text-[14px] font-medium text-white hover:brightness-110">Save as Draft</button>
        </div>
      </div>
    </div>
  );
}
