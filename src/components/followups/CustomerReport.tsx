'use client';

import { CalendarDays, Search, ThumbsDown, XCircle, PlusCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { FU_CUSTOMERS, FU_EMPLOYEES, type Assignment } from '@/lib/followupStore';
import { Box, card, th } from './ui';

interface Opt { v: string; icon?: string }
const o = (...v: string[]): Opt[] => v.map((x) => ({ v: x }));

const DISTRICTS = ['B. Baria', 'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Chandpur', 'Chapainawabganj', 'Chattogram', 'Chuadanga', 'Cumilla', "Cox's Bazar", 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachhari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'];

/** key = Assignment.meta key (call/status/source/order are derived) */
const FILTERS: { key: string; label: string; opts: Opt[]; align?: 'right'; tall?: boolean }[] = [
  { key: 'call', label: 'Call', opts: o('Call answered', 'Call not answered', 'Not yet called') },
  { key: 'status', label: 'Status', opts: o('Pending', 'In progress', 'Completed') },
  { key: 'source', label: 'Source', opts: o('Customer', 'Web Order', 'Approved Order', 'Manual order') },
  { key: 'customerTag', label: 'Customer feedback tag', opts: o('দাম বেশি বলেছে', 'অভিযোগ আছে', 'এখন প্রয়োজন নেই', 'আগ্রহী, ভাবছে', 'নিরপেক্ষ') },
  { key: 'agentTag', label: 'Agent feedback tag', opts: [{ v: 'নিয়মিত কাস্টমার', icon: '⭐' }, { v: 'দ্রুত ডেলিভারি চায়', icon: '⚡' }, { v: 'ডিসকাউন্ট চেয়েছে', icon: '🏷️' }, { v: 'বেশি পণ্য নেবে', icon: '📦' }, { v: 'অভিযোগকারী', icon: '⚠️' }, { v: 'আন্তরিক ব্যবহার', icon: '💛' }] },
  { key: 'interestTag', label: 'Interest tag', opts: o('নতুন পণ্যে আগ্রহী', 'ফিচার্ড পণ্যে আগ্রহী', 'একই ক্যাটাগরির পণ্য চায়') },
  { key: 'note', label: 'Note', align: 'right', opts: o('কথা হয়েছে', 'পরে অর্ডার করবে', 'দাম বেশি বলেছে', 'ডেলিভারি দ্রুত চায়', 'অফিসে ডেলিভারি', 'পণ্য নিশ্চিত করেছে') },
  { key: 'response', label: 'Response', align: 'right', opts: o('Positive', 'Negative', 'Neutral', 'Busy, call back', 'Complaint', 'Already ordered', 'Price negotiation') },
  { key: 'result', label: 'Result', align: 'right', opts: o('Order placed', 'Call back later', 'Not interested', 'No answer', 'Wrong number') },
  { key: 'customerType', label: 'Customer type', align: 'right', opts: o('Fraud', 'Regular', 'New', 'Premium', 'Custom 1', 'Custom 2', 'New Customer', 'Premium Customer') },
  { key: 'rfm', label: 'RFM segment', opts: o('Champions', 'Loyal', 'Potential loyalist', 'At risk', 'Hibernating', 'Lost') },
  { key: 'district', label: 'District', opts: o(...DISTRICTS), tall: true },
  { key: 'order', label: 'Order', opts: o('Order placed', 'Order delivered', 'No order') },
];

const chip = 'border-ed-line flex h-10 items-center gap-2 rounded-lg border bg-white px-3.5 text-[14.5px] transition hover:bg-[#f7f6fa]';

function Chip({ label, opts, value, onChange, align, tall }: { label: string; opts: Opt[]; value: string[]; onChange: (v: string[]) => void; align?: 'right'; tall?: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const d = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', d); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', d); document.removeEventListener('keydown', k); };
  }, [open]);
  const list = opts.filter((x) => x.v.toLowerCase().includes(q.toLowerCase()));
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  const on = value.length > 0;
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => { setOpen((x) => !x); setQ(''); }} className={chip}>
        {on
          ? <span role="button" aria-label={`Clear ${label}`} onClick={(e) => { e.stopPropagation(); onChange([]); }}><XCircle className="text-ed-text/70 size-4" /></span>
          : <PlusCircle className="text-ed-text/70 size-4" />}
        <span className="font-medium">{label}</span>
        {on && <span className="border-ed-line flex gap-1 border-l pl-2.5">{value.slice(0, 2).map((v) => <span key={v} className="text-[12.5px]">{v}</span>)}{value.length > 2 && <span className="text-[12.5px]">+{value.length - 2}</span>}</span>}
      </button>
      {open && (
        <div className={cn('border-ed-line absolute z-30 mt-1.5 min-w-[230px] rounded-xl border bg-white shadow-[0_12px_32px_rgba(30,20,50,0.16)]', align === 'right' ? 'right-0' : 'left-0')}>
          <div className="border-ed-line relative border-b">
            <Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input style={{ outline: 'none' }} autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={label} className="h-11 w-full rounded-t-xl bg-transparent pr-3 pl-9 text-[14px] outline-none" />
          </div>
          <ul role="listbox" aria-multiselectable className={cn('p-1.5', tall && 'thin-scroll max-h-[300px] overflow-y-auto')}>
            {list.length === 0 && <li className="text-ed-muted px-3 py-2 text-[13px]">No results</li>}
            {list.map((x) => (
              <li key={x.v}>
                <button type="button" role="option" aria-selected={value.includes(x.v)} onClick={() => toggle(x.v)} className={cn('flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-[14px] whitespace-nowrap hover:bg-[#f4eef8]', value.includes(x.v) && 'bg-[#f4eef8]')}>
                  <Box on={value.includes(x.v)} label={x.v} />
                  {x.icon && <span>{x.icon}</span>}{x.v}
                </button>
              </li>
            ))}
          </ul>
          {on && <div className="border-ed-line border-t p-1.5"><button type="button" onClick={() => { onChange([]); setOpen(false); }} className="w-full rounded-md py-2 text-center text-[14px] hover:bg-[#f4eef8]">Clear filters</button></div>}
        </div>
      )}
    </div>
  );
}

/** Row -> value used by each filter. Call/status/source/order are derived from real data; tag fields come from a.meta */
function valueOf(a: Assignment, key: string): string | undefined {
  switch (key) {
    case 'call': return a.progress === 'Pending' ? 'Not yet called' : 'Call answered';
    case 'status': return a.progress === 'In Progress' ? 'In progress' : a.progress;
    case 'source': return a.meta?.source ?? 'Approved Order';
    case 'order': return a.meta?.order ?? 'No order';
    default: return a.meta?.[key];
  }
}

export function CustomerReport({ rows }: { rows: Assignment[] }) {
  const [f, setF] = useState<Record<string, string[]>>({ call: ['Call answered'] });
  const [negative, setNegative] = useState(false);
  const [dOpen, setDOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const dRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const d = (e: MouseEvent) => { if (!dRef.current?.contains(e.target as Node)) setDOpen(false); }; document.addEventListener('mousedown', d); return () => document.removeEventListener('mousedown', d); }, []);

  const count = Object.values(f).filter((v) => v.length).length + (negative ? 1 : 0) + (from || to ? 1 : 0);
  const clear = () => { setF({}); setNegative(false); setFrom(''); setTo(''); };

  const list = useMemo(() => rows.filter((a) =>
    FILTERS.every(({ key }) => { const sel = f[key]; if (!sel?.length) return true; const v = valueOf(a, key); return !!v && sel.includes(v); })
    && (!negative || a.negative)
    && (!from || (a.scheduledAt ?? '') >= from) && (!to || (!!a.scheduledAt && a.scheduledAt <= to))), [rows, f, negative, from, to]);

  const byEmp = FU_EMPLOYEES.map((e) => { const r = list.filter((a) => a.employee === e.name); return { n: e.name, total: r.length, p: r.filter((a) => a.progress === 'Pending').length, i: r.filter((a) => a.progress === 'In Progress').length, c: r.filter((a) => a.progress === 'Completed').length }; }).filter((x) => x.total);

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-3">
        {FILTERS.slice(0, 10).map(({ key, ...x }) => <Chip key={key} {...x} value={f[key] ?? []} onChange={(v) => setF((s) => ({ ...s, [key]: v }))} />)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-3">
        {FILTERS.slice(10).map(({ key, ...x }) => <Chip key={key} {...x} value={f[key] ?? []} onChange={(v) => setF((s) => ({ ...s, [key]: v }))} />)}
        <button type="button" aria-pressed={negative} onClick={() => setNegative((n) => !n)} className={cn(chip, negative && 'bg-ed-brand border-ed-brand text-white hover:bg-ed-brand')}><ThumbsDown className="size-4" />Negative marked</button>
        <span className="text-ed-muted text-[12.5px]">Scheduled</span>
        <div ref={dRef} className="relative">
          <button type="button" onClick={() => setDOpen((x) => !x)} className={cn(chip, 'text-ed-muted')}><CalendarDays className="size-4" />{from || to ? `${from || '…'} → ${to || '…'}` : 'Pick a date range'}</button>
          {dOpen && (
            <div className="border-ed-line absolute left-0 z-30 mt-1.5 w-[260px] space-y-2 rounded-xl border bg-white p-3 shadow-[0_12px_32px_rgba(30,20,50,0.16)]">
              <label className="block text-[12.5px] font-medium">From<input style={{ outline: 'none' }} type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="border-ed-line mt-1 h-9 w-full rounded-md border px-2 text-[13px] font-normal" /></label>
              <label className="block text-[12.5px] font-medium">To<input style={{ outline: 'none' }} type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="border-ed-line mt-1 h-9 w-full rounded-md border px-2 text-[13px] font-normal" /></label>
              {(from || to) && <button type="button" onClick={() => { setFrom(''); setTo(''); setDOpen(false); }} className="w-full rounded-md py-1.5 text-center text-[13px] hover:bg-[#f4eef8]">Clear dates</button>}
            </div>
          )}
        </div>
        {count > 0 && <button type="button" onClick={clear} className="text-[14.5px] font-medium hover:underline">Clear {count} filter{count > 1 ? 's' : ''}</button>}
      </div>

      <div className="mt-7">
        <h2 className="text-[16px] font-semibold">By employee</h2>
        <p className="text-ed-muted text-[12.5px]">What each employee holds among the matching follow-ups, and what the completed ones produced.</p>
        {byEmp.length > 0 && (
          <div className={cn(card, 'mt-3 overflow-x-auto')}>
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead><tr className="border-ed-line border-b"><th className={cn(th, 'py-3')}>Employee</th>{['Matching', 'Pending', 'In progress', 'Completed', 'Orders', 'Sales'].map((h) => <th key={h} className={cn(th, 'py-3 text-center')}>{h}</th>)}</tr></thead>
              <tbody>{byEmp.map((e) => <tr key={e.n} className="border-ed-line border-b last:border-0"><td className="px-4 py-3">{e.n}</td>{[e.total, e.p, e.i, e.c, 0, '৳0'].map((v, i) => <td key={i} className="px-4 text-center">{v}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-[16px] font-semibold">Customers</h2>
        <p className="text-ed-muted text-[12.5px]">{list.length} matching follow-ups. Click a number to open the customer profile.</p>
        {list.length === 0 ? (
          <div className="border-ed-line text-ed-text/75 mt-3 rounded-xl border border-dashed bg-white/50 py-9 text-center text-[14.5px]">No follow-up matches these filters in this date range.</div>
        ) : (
          <div className={cn(card, 'mt-3 overflow-x-auto')}>
            <table className="w-full min-w-[820px] text-left text-[14px]">
              <thead><tr className="border-ed-line border-b">{['Customer', 'Mobile', 'Employee', 'Status', 'Priority', 'Assigned date'].map((h) => <th key={h} className={cn(th, 'py-3')}>{h}</th>)}</tr></thead>
              <tbody>{list.map((a) => { const c = FU_CUSTOMERS.find((x) => x.id === a.customerId); return (
                <tr key={a.customerId} className="border-ed-line border-b last:border-0 hover:bg-[#faf9fc]">
                  <td className="px-4 py-3">{c?.name}</td><td className="px-4 text-[#4a1d9a]">{c?.mobile}</td><td className="px-4">{a.employee}</td>
                  <td className="px-4"><span className="border-ed-line rounded-full border px-2.5 py-0.5 text-[12px]">{a.progress}</span></td><td className="px-4">{a.priority}</td><td className="px-4">{a.assignedAt}</td>
                </tr>); })}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
