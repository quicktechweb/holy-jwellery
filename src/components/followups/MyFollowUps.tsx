'use client';

import { BookOpen, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, ClipboardList, Phone, PlusCircle, Search, Settings2, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FU_CUSTOMERS, useFollowUps, type Progress } from '@/lib/followupStore';
import { Box, Empty } from './ui';

const COLS = ['Customer', 'Activity', 'Contact Outcome', 'Feedback', 'Agent Opinion', 'Customer Opinion', 'Details', 'Customer Note', 'Status', 'Priority', 'Last Note', 'Actions'] as const;
const SORTABLE = new Set(['Customer', 'Contact Outcome', 'Feedback', 'Agent Opinion', 'Customer Opinion', 'Status', 'Priority']);
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES: Progress[] = ['Pending', 'In Progress', 'Completed'];
const TYPES = ['Delivered', 'Rts'];

function useOut(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const d = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', d);
    return () => document.removeEventListener('mousedown', d);
  }, [onClose]);
  return ref;
}

/** Faceted filter chip: "⊕ Priority" + selected values */
function Facet({ label, options, value, onChange, icon }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; icon?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useOut(() => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="border-ed-line flex h-10 items-center gap-2 rounded-lg border bg-white px-3 text-[14px] hover:bg-[#f7f6fa]">
        {icon ?? <PlusCircle className="text-ed-text/70 size-4" />}<span className="font-medium">{label}</span>
        {value.length > 0 && <span className="border-ed-line flex gap-1 border-l pl-2">{value.map((v) => <span key={v} className="bg-ed-bg rounded px-1.5 py-0.5 text-[12px]">{v}</span>)}</span>}
      </button>
      {open && (
        <ul className="border-ed-line absolute z-20 mt-1 min-w-[190px] rounded-lg border bg-white p-1 shadow-lg">
          {options.map((o) => (
            <li key={o}><button type="button" onClick={() => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])} className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-[#f4eef8]"><Box on={value.includes(o)} label={o} />{o}</button></li>
          ))}
          {value.length > 0 && <li className="border-ed-line mt-1 border-t pt-1"><button type="button" onClick={() => onChange([])} className="w-full rounded-md px-2.5 py-2 text-center text-[13px] hover:bg-[#f4eef8]">Clear filters</button></li>}
        </ul>
      )}
    </div>
  );
}

function FaqPane() {
  const [faqs, setFaqs] = useState<{ id: string; forType: string; target: string; q: string; a: string }[]>([]);
  useEffect(() => { try { setFaqs(JSON.parse(window.localStorage.getItem('ed.fu.faqs.v1') ?? '[]')); } catch { /* ignore */ } }, []);
  const [q, setQ] = useState('');
  const list = faqs.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mt-5 px-1">
      <div className="relative"><Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" /><input style={{ outline: 'none' }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search FAQ..." className="border-ed-line h-10 w-full rounded-lg border bg-[#f9f8fb] pr-3 pl-9 text-[14px] outline-none" /></div>
      {list.length === 0 ? <Empty icon={<BookOpen className="size-9" />} title="No FAQs yet" hint="Ask your manager to add FAQs from Follow-up Management." /> : (
        <ul className="mt-4 space-y-2">{list.map((f) => <li key={f.id} className="border-ed-line rounded-xl border bg-white p-4"><div className="text-ed-muted text-[12px]">{f.forType} · {f.target}</div><div className="mt-1 font-medium">{f.q}</div><p className="mt-1 text-[13.5px] whitespace-pre-wrap">{f.a}</p></li>)}</ul>
      )}
    </div>
  );
}

export function MyFollowUps() {
  const { assignments, setProgress } = useFollowUps();
  const [top, setTop] = useState<'mine' | 'faq'>('mine');
  const [sub, setSub] = useState<'calls' | 'customers'>('calls');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string[]>(['Pending', 'In Progress']);
  const [prio, setPrio] = useState<string[]>([]);
  const [ctype, setCtype] = useState<string[]>([]);
  const [product, setProduct] = useState('');
  const [sort, setSort] = useState<{ k: string; d: 1 | -1 } | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const viewRef = useOut(() => setViewOpen(false));
  const [sel, setSel] = useState<string[]>([]);
  const [size, setSize] = useState(20);
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const list = assignments
      .map((a) => ({ a, c: FU_CUSTOMERS.find((x) => x.id === a.customerId)! }))
      .filter(({ a, c }) => c
        && (sub === 'calls' || a.relationshipOwner)
        && (sub === 'customers' || !status.length || status.includes(a.progress))
        && (!prio.length || prio.includes(a.priority))
        && (!ctype.length || ctype.includes(c.status))
        && (!product || c.products.toLowerCase().includes(product.toLowerCase()))
        && (!q || `${c.name} ${c.mobile}`.toLowerCase().includes(q.toLowerCase())));
    if (sort) {
      const val = ({ a, c }: (typeof list)[number]) => (sort.k === 'Customer' ? c.name : sort.k === 'Status' ? a.progress : sort.k === 'Priority' ? PRIORITIES.indexOf(a.priority) : '');
      list.sort((x, y) => (val(x) > val(y) ? 1 : val(x) < val(y) ? -1 : 0) * sort.d);
    }
    return list;
  }, [assignments, sub, status, prio, ctype, product, q, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / size));
  const cur = Math.min(page, pages - 1);
  const view = rows.slice(cur * size, cur * size + size);
  const cols = COLS.filter((c) => !hidden.includes(c));
  const allOn = view.length > 0 && view.every(({ a }) => sel.includes(a.customerId));
  const toggleSort = (k: string) => setSort((s) => (s?.k === k ? (s.d === 1 ? { k, d: -1 } : null) : { k, d: 1 }));

  const cell = (col: string, r: (typeof rows)[number]): ReactNode => {
    const { a, c } = r;
    switch (col) {
      case 'Customer': return <div><div className="font-medium">{c.name}</div><div className="text-ed-muted text-[12.5px]">{c.mobile}</div></div>;
      case 'Status': return <span className="border-ed-line rounded-full border px-2.5 py-0.5 text-[12px] font-medium">{a.progress}</span>;
      case 'Priority': return <span className="bg-ed-bg rounded px-2 py-0.5 text-[11.5px] font-semibold">{a.priority}</span>;
      case 'Last Note': return <span className="text-ed-text/80 block max-w-[180px] truncate">{a.note || '—'}</span>;
      case 'Details': return <span className="text-ed-muted text-[12.5px]">{c.order} · ৳{c.amount}</span>;
      case 'Actions': return (
        <div className="flex gap-1.5">
          <a href={`tel:${c.mobile}`} onClick={() => setProgress(a.customerId, 'In Progress')} aria-label="Call" className="border-ed-line flex size-8 items-center justify-center rounded-lg border hover:bg-[#f4eef8]"><Phone className="size-4" /></a>
          {a.progress !== 'Completed' && <button type="button" aria-label="Mark completed" onClick={() => setProgress(a.customerId, 'Completed')} className="border-ed-line flex size-8 items-center justify-center rounded-lg border hover:bg-[#f4eef8]"><CheckCircle2 className="size-4 text-[#16a34a]" /></button>}
        </div>);
      default: return <span className="text-ed-muted">—</span>;
    }
  };

  return (
    <div className="pt-6">
      <div className="flex items-center gap-3 px-2"><h1 className="text-[22px] font-semibold tracking-tight">My Follow-ups</h1><span className="border-ed-line text-ed-muted rounded-md border px-2 py-0.5 text-[11.5px]">Beta</span><span className="text-ed-muted text-[13.5px]">Manage your assigned follow-ups</span></div>
      <nav className="border-ed-line mt-4 flex border-y">
        {([['mine', 'My Follow-ups', ClipboardList], ['faq', 'FAQ', BookOpen]] as const).map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => setTop(id)} className={cn('-mb-px flex items-center gap-2 border-b-2 px-4 py-3.5 text-[14.5px] font-medium', top === id ? 'border-ed-brand text-ed-brand' : 'text-ed-text/70 border-transparent')}><Icon className="size-4" />{label}</button>
        ))}
      </nav>

      {top === 'faq' ? <FaqPane /> : (
        <div className="px-1 pt-6">
          <div className="flex gap-1">
            {([['calls', 'Calls'], ['customers', 'My Customers']] as const).map(([id, l]) => <button key={id} type="button" onClick={() => { setSub(id); setPage(0); }} className={cn('h-10 rounded-lg px-4 text-[14.5px] font-medium', sub === id ? 'bg-ed-bg' : 'text-ed-text/80 hover:bg-ed-bg/60')}>{l}</button>)}
          </div>
          <div className="mt-3 flex gap-3">
            <div className="relative flex-1"><Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" /><input style={{ outline: 'none' }} value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search customer or mobile..." className="border-ed-line h-10 w-full rounded-lg border bg-[#f9f8fb] pr-3 pl-9 text-[14px] outline-none focus:border-ed-brand/50" /></div>
            <div ref={viewRef} className="relative">
              <button type="button" onClick={() => setViewOpen((o) => !o)} className="border-ed-line flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[14px] font-medium hover:bg-[#f7f6fa]"><Settings2 className="size-4" />View</button>
              {viewOpen && <ul className="border-ed-line absolute right-0 z-20 mt-1 w-[210px] rounded-lg border bg-white p-1 shadow-lg">{COLS.map((c) => <li key={c}><button type="button" onClick={() => setHidden((h) => (h.includes(c) ? h.filter((x) => x !== c) : [...h, c]))} className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-[#f4eef8]"><Box on={!hidden.includes(c)} label={c} />{c}</button></li>)}</ul>}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Facet label="Status" icon={<XCircle className="text-ed-text/70 size-4" />} options={STATUSES} value={status} onChange={(v) => { setStatus(v); setPage(0); }} />
            <Facet label="Priority" options={PRIORITIES} value={prio} onChange={(v) => { setPrio(v); setPage(0); }} />
            <Facet label="Customer Type" options={TYPES} value={ctype} onChange={(v) => { setCtype(v); setPage(0); }} />
            <input style={{ outline: 'none' }} value={product} onChange={(e) => { setProduct(e.target.value); setPage(0); }} placeholder="Product..." className="border-ed-line h-10 w-[140px] rounded-lg border border-dashed bg-white px-3 text-[14px] outline-none focus:border-ed-brand/50" />
          </div>

          <div className="border-ed-line mt-4 overflow-x-auto rounded-t-lg border">
            <table className="w-full min-w-[1300px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="bg-[#f4f3f8]">
                  <th className="w-[44px] pl-3"><Box on={allOn} label="Select all" onChange={() => setSel(allOn ? [] : view.map(({ a }) => a.customerId))} /></th>
                  {cols.map((c) => (
                    <th key={c} className={cn('border-ed-line border-l px-3 py-3 text-[13px] font-medium whitespace-nowrap', !SORTABLE.has(c) && 'text-ed-text/80 text-[12.5px] font-semibold tracking-wide uppercase')}>
                      {SORTABLE.has(c) ? <button type="button" onClick={() => toggleSort(c)} className="flex items-center gap-2 text-[#6b6880]">{c}<ChevronsUpDown className="size-3.5" /></button> : c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {view.length === 0 && <tr><td colSpan={cols.length + 1} className="py-12 text-center text-[14px]">No followups found</td></tr>}
                {view.map((r) => (
                  <tr key={r.a.customerId} className={cn('border-ed-line border-t hover:bg-[#faf9fc]', sel.includes(r.a.customerId) && 'bg-[#f6f0fa]')}>
                    <td className="pl-3"><Box on={sel.includes(r.a.customerId)} label="Select row" onChange={() => setSel((s) => (s.includes(r.a.customerId) ? s.filter((x) => x !== r.a.customerId) : [...s, r.a.customerId]))} /></td>
                    {cols.map((c) => <td key={c} className="px-3 py-3">{cell(c, r)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[14px]">
            <span className="text-ed-text/70">{sel.length} of {rows.length} row(s) selected.</span>
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-3 font-medium">Rows per page
                <span className="relative"><select style={{ outline: 'none' }} value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }} className="border-ed-line h-10 w-[70px] appearance-none rounded-lg border bg-white pr-6 pl-3 outline-none">{[10, 20, 50, 100].map((n) => <option key={n}>{n}</option>)}</select><ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2" /></span>
              </label>
              <span className="font-medium">Page {rows.length ? cur + 1 : 1} of {rows.length ? pages : 0}</span>
              <div className="flex gap-2">
                {[[ChevronsLeft, () => setPage(0), cur === 0], [ChevronLeft, () => setPage(cur - 1), cur === 0], [ChevronRight, () => setPage(cur + 1), cur >= pages - 1], [ChevronsRight, () => setPage(pages - 1), cur >= pages - 1]].map(([Ic, fn, dis], i) => {
                  const I = Ic as typeof ChevronLeft;
                  return <button key={i} type="button" disabled={dis as boolean} onClick={fn as () => void} aria-label="Page" className="border-ed-line flex size-9 items-center justify-center rounded-lg border bg-white disabled:opacity-40"><I className="size-4" /></button>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
