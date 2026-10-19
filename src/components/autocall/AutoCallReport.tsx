'use client';

import { useEffect, useState } from 'react';
import { BarChart3, BookOpen, CalendarDays, Check, ChevronDown, ChevronLeft, Clock, Download, Filter, Megaphone, PhoneCall, RefreshCw, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, MultiSelect, Select, card, field, ghostBtn, primaryBtn } from './ui';

const SOURCES = ['Manual', 'Workflow', 'Rule'];
const ORDER_TYPES = ['Web Order', 'Approved Order'];
const OUTCOMES = ['Pressed 1', 'Insufficient Balance', 'Busy', 'Failed', 'Pressed 2', 'Try Again', 'No Answer', 'Rejected'];
const PRESETS: Record<string, number> = { '7D': 7, '30D': 30, '90D': 90, '365D': 365 };

const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const cap = 'text-ed-muted text-[10.5px] font-semibold tracking-[0.1em] uppercase';

type Sub = 'orders' | 'leads';

export function AutoCallReport() {
  const [sub, setSub] = useState<Sub>('orders');
  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(
          [
            ['orders', 'Order Calls', BarChart3],
            ['leads', 'Broadcast Leads', Megaphone],
          ] as const
        ).map(([k, label, Icon]) => (
          <button
            key={k}
            type="button"
            onClick={() => setSub(k)}
            className={cn(
              'flex h-10 items-center gap-2 rounded-lg px-3.5 text-[14.5px] transition-colors',
              sub === k ? 'border-ed-line border bg-[#f3f1f7] font-medium shadow-[0_1px_2px_rgba(30,20,50,0.06)]' : 'text-ed-text/80 hover:text-ed-brand',
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>
      <Report key={sub} sub={sub} />
    </div>
  );
}

function Report({ sub }: { sub: Sub }) {
  const isOrders = sub === 'orders';
  const [q, setQ] = useState('');
  const [preset, setPreset] = useState('30D');
  const [shift, setShift] = useState(0);
  const [size, setSize] = useState('20 rows');
  const [sources, setSources] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [outs, setOuts] = useState<string[]>([]);
  const [how, setHow] = useState(false);
  const [range, setRange] = useState('');

  useEffect(() => {
    const days = PRESETS[preset];
    const end = new Date();
    end.setDate(end.getDate() - shift * days);
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    setRange(`${fmt(start)} - ${fmt(end)}`);
  }, [preset, shift]);

  const reset = () => {
    setQ(''); setPreset('30D'); setShift(0); setSize('20 rows'); setSources([]); setTypes([]); setOuts([]);
  };
  const exportCsv = () => {
    const head = isOrders
      ? 'Time,Approved Order Status,Web Order Status,Source,Order Type,Phone,Attempt,Duration / Retry,Error\n'
      : 'Time,Campaign,Phone,Outcome,Attempt,Duration,Error\n';
    const url = URL.createObjectURL(new Blob([head], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = isOrders ? 'auto-call-report.csv' : 'broadcast-leads-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tiles: [string, string][] = isOrders
    ? [
        ['Total Calls', 'Completed auto-call attempts in the selected filter'],
        ['Success', '0.0% Pressed 1 confirmation rate'],
        ['Not Confirmed', 'Calls that did not end with Pressed 1'],
        ['Live Queue', 'In progress, retry queue, and queued items'],
        ['In Progress', 'Currently waiting for customer response'],
        ['Try Again', 'Retry is scheduled for another attempt'],
        ['Pressed 2', 'Customers cancelled from auto call'],
        ['Failed', '0 rejected and 0 busy'],
      ]
    : [
        ['Total Leads', 'Contacts uploaded in the selected filter'],
        ['Contacted', '0.0% of leads reached'],
        ['Interested', 'Leads marked interested'],
        ['Call Back', 'Leads waiting for a follow-up call'],
        ['In Progress', 'Currently being called'],
        ['Try Again', 'Retry is scheduled for another attempt'],
        ['Not Interested', 'Leads that declined'],
        ['Failed', '0 rejected and 0 busy'],
      ];

  return (
    <div className="space-y-4">
      {/* header */}
      <section className={cn(card, 'bg-gradient-to-br from-white via-white to-[#f4faf7] p-6 max-sm:p-4')}>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-[760px]">
            <span className="border-ed-line text-ed-muted inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.08em] uppercase">
              <PhoneCall className="size-3.5 text-green-600" /> Reports / Auto Call Center
            </span>
            <h2 className="mt-2.5 text-[32px] leading-tight font-medium tracking-tight">{isOrders ? 'Auto Call Center Report' : 'Broadcast Leads Report'}</h2>
            <p className="text-ed-muted mt-3 text-[14.5px] leading-relaxed">
              {isOrders
                ? 'Date-wise, month-wise, year-wise, and lifetime auto-call activity in one place. Monitor total calls, pressed keys, failure recovery metrics, and order-level events.'
                : 'Date-wise activity for your broadcast campaigns. Monitor reached contacts, interest, follow-ups, and failure recovery metrics.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="border-ed-line rounded-xl border bg-white/80 px-4 py-2.5">
              <p className={cap}>Selected range</p>
              <p className="mt-1 text-[15px] font-medium whitespace-nowrap">{range || '\u00A0'}</p>
            </div>
            <button type="button" onClick={() => setHow(true)} className={cn(ghostBtn, 'h-11')}><BookOpen className="size-4" /> How it Works</button>
            <button type="button" onClick={reset} className={cn(ghostBtn, 'h-11')}><RefreshCw className="size-4" /> Reset</button>
            <button type="button" onClick={exportCsv} className={cn(primaryBtn, 'h-11')}><Download className="size-4" /> Export CSV</button>
          </div>
        </div>
      </section>

      {/* filters */}
      <section className={cn(card, 'overflow-visible')}>
        <header className="border-ed-line flex items-center gap-2.5 border-b px-6 py-4 max-sm:px-4">
          <Filter className="size-[18px]" strokeWidth={1.75} />
          <h3 className="text-[24px] leading-tight font-medium tracking-tight">Filter Operations</h3>
        </header>
        <div className="p-6 max-sm:p-4">
          <div className="flex flex-wrap items-end gap-4">
            <label className="block min-w-[240px] flex-1">
              <span className={cn(cap, 'mb-1.5 block')}>Search query</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Phone, order ID, or rule..." className={cn(field, 'h-11 rounded-xl')} />
            </label>
            <div>
              <span className={cn(cap, 'mb-1.5 block')}>Date filter</span>
              <div className="border-ed-line flex h-11 items-center overflow-hidden rounded-xl border bg-[#f7f7fa]">
                <button type="button" aria-label="Previous period" onClick={() => setShift((s) => s + 1)} className="hover:text-ed-brand flex h-full w-9 items-center justify-center"><ChevronLeft className="size-4" /></button>
                <div className="relative h-[calc(100%-8px)] mr-1 flex items-center rounded-lg bg-white pr-6 pl-9 text-[14px] font-medium shadow-sm">
                  <CalendarDays className="text-ed-text/80 pointer-events-none absolute left-2.5 size-4" />
                  <select aria-label="Date range" value={preset} onChange={(e) => { setPreset(e.target.value); setShift(0); }} className="h-full w-14 cursor-pointer appearance-none bg-transparent outline-none">
                    {Object.keys(PRESETS).map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 size-3.5" />
                </div>
              </div>
            </div>
            <div className="w-[190px] max-sm:w-full">
              <span className={cn(cap, 'mb-1.5 block')}>Page size</span>
              <Select label="Page size" value={size} onChange={setSize} options={['20 rows', '50 rows', '100 rows']} />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div><span className={cn(cap, 'mb-1.5 block')}>Sources</span><MultiSelect options={SOURCES} value={sources} onChange={setSources} placeholder="All sources" /></div>
            <div><span className={cn(cap, 'mb-1.5 block')}>Order type</span><MultiSelect options={ORDER_TYPES} value={types} onChange={setTypes} placeholder="Web and approved orders" /></div>
            <div><span className={cn(cap, 'mb-1.5 block')}>States &amp; outcomes</span><MultiSelect options={OUTCOMES} value={outs} onChange={setOuts} placeholder="Pressed 1, failed, try again..." /></div>
          </div>
        </div>
      </section>

      {/* kpis */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map(([k, sub]) => (
          <div key={k} className="border-ed-line border-l-ed-brand rounded-xl border border-l-[3px] bg-white px-4 py-4 shadow-[0_2px_8px_rgba(30,20,50,0.07)]">
            <p className={cap}>{k}</p>
            <p className="mt-2 font-mono text-[26px] leading-none font-bold">0</p>
            <p className="text-ed-muted mt-3 text-[12px]">{sub}</p>
          </div>
        ))}
      </div>

      {/* breakdowns */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr_1fr]">
        <section className={cn(card, 'min-h-[300px]')}>
          <h3 className="border-ed-line border-b px-6 py-4 text-[24px] leading-tight font-medium tracking-tight">Outcome &amp; State Breakdown</h3>
        </section>
        <section className={card}>
          <h3 className="border-ed-line border-b px-6 py-4 text-[24px] leading-tight font-medium tracking-tight">Source Mix</h3>
          <div className="space-y-3 p-4">
            {SOURCES.map((s) => (
              <div key={s} className="border-ed-line rounded-xl border bg-[#fbfafd] px-4 py-3">
                <div className="flex items-center justify-between"><span className={cap}>{s}</span><span className="font-mono text-[18px] font-bold">0</span></div>
                <p className="text-ed-muted mt-2 text-[11px]">0.0% of visible activity</p>
              </div>
            ))}
          </div>
        </section>
        <section className={card}>
          <h3 className="border-ed-line border-b px-6 py-4 text-[24px] leading-tight font-medium tracking-tight">Order Type Mix</h3>
          <div className="space-y-5 px-6 py-4 text-[13px]">
            {['Web Orders', 'Approved Orders'].map((t) => (
              <div key={t}>
                <div className="text-ed-text/80 flex justify-between"><span>{t}</span><span className="font-mono text-[11px]">0</span></div>
                <div className="bg-ed-line mt-2 h-1.5 rounded-full" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* confirmed status */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.9fr_1fr]">
        <section className={card}>
          <div className="border-ed-line border-b px-6 py-4">
            <h3 className="text-[24px] leading-tight font-medium tracking-tight">Confirmed Order Status Chart</h3>
            <p className="text-ed-muted mt-1.5 text-[12.5px]">Approved orders that were confirmed by auto call and their active positions in the delivery pipeline.</p>
          </div>
          <div className="p-4">
            <div className="border-ed-line text-ed-muted flex h-[360px] items-center justify-center rounded-xl border border-dashed text-[13px] max-sm:h-48">
              No confirmed approved orders found for the selected filters.
            </div>
            <p className="text-ed-muted mt-5 text-[11px]">RTS is resolved from ready-to-ship records, shifted from courier integration statuses, and delivery milestones when available.</p>
          </div>
        </section>
        <section className={card}>
          <div className="border-ed-line border-b px-6 py-4">
            <h3 className="text-[24px] leading-tight font-medium tracking-tight">Confirmed Order Snapshot</h3>
            <p className="text-ed-muted mt-1.5 text-[12.5px]">Current distribution of Pressed 1 approved orders.</p>
          </div>
          <div className="space-y-3 p-4">
            {(
              [
                ['Confirmed approved orders', '#16a34a', 'text-green-600', ''],
                ['Active pipeline', '#2563eb', 'text-blue-600', 'Pending, RTS, shifted, and delivering'],
                ['Delivered', '#16a34a', 'text-green-600', ''],
                ['Returned / Cancelled', '#e11d48', 'text-rose-600', 'Includes return, cancel, and pending/partial return'],
              ] as const
            ).map(([k, c, t, s]) => (
              <div key={k} className="border-ed-line rounded-xl border border-l-[4px] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(30,20,50,0.06)]" style={{ borderLeftColor: c }}>
                <p className={cn('text-[10.5px] font-semibold tracking-[0.06em] uppercase', t)}>{k}</p>
                <p className="mt-1.5 font-mono text-[22px] leading-none font-bold">0</p>
                {s && <p className="text-ed-muted mt-2 text-[11px]">{s}</p>}
              </div>
            ))}
            <ul className="space-y-0 pt-2 text-[13px]">
              {(
                [
                  ['Pending', '#2563eb'], ['RTS', '#4f46e5'], ['Shifted', '#f59e0b'], ['Delivering', '#0891b2'], ['Delivered', '#16a34a'],
                  ['Partial Delivery', '#0f766e'], ['Partial Return', '#e11d48'], ['Pending Return', '#ea580c'], ['Returned', '#dc2626'],
                  ['Cancelled', '#991b1b'], ['Other', '#64748b'],
                ] as const
              ).map(([k, c]) => (
                <li key={k} className="py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-ed-text/80 flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: c }} />{k}</span>
                    <span className="font-mono text-[11px]">0</span>
                  </div>
                  <div className="bg-ed-line mt-1.5 h-1 rounded-full" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* detailed activity */}
      <section className={card}>
        <div className="flex items-start justify-between gap-3 px-6 pt-5">
          <div>
            <h3 className="text-[24px] leading-tight font-medium tracking-tight">Detailed Auto Call Activity</h3>
            <p className="text-ed-muted mt-1.5 text-[12.5px]">Combined call history and live queue records with current order statuses, source, and attempts.</p>
          </div>
          <span className="bg-ed-bg text-ed-text rounded-full px-2.5 py-0.5 text-[10.5px] font-medium">0 rows</span>
        </div>
        <div className="mt-4 px-6 max-sm:px-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="bg-[#f6f5fa] text-[10.5px] font-semibold tracking-[0.06em] text-[#6b6580] uppercase">
                  {['Time', 'Approved Order Status', 'Web Order Status', 'Source', 'Order Type', 'Phone', 'Attempt', 'Duration / Retry', 'Error'].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={9} className="text-ed-muted border-ed-line border-b px-4 py-9 text-center text-[13px]">No records found for the selected filters.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex items-center justify-between px-10 py-5 text-[12.5px] max-sm:px-4">
          <span>Page 0 of 0</span>
          <span className="flex gap-3">
            <button type="button" disabled className="border-ed-line text-ed-muted h-9 rounded-lg border bg-[#f7f7fa] px-4">Previous</button>
            <button type="button" disabled className="border-ed-line text-ed-muted h-9 rounded-lg border bg-[#f7f7fa] px-4">Next</button>
          </span>
        </div>
      </section>

      {/* tips */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {(
          [
            ['Best for success analysis', "Use 'Pressed 1', 'This month', or 'Lifetime' to review confirmation trends and analyze customer responses.", '#16a34a', Check],
            ['Best for retry monitoring', "Filter by 'Try Again' and 'Live Queue' to see which calls are automatically scheduled for subsequent attempts.", '#f59e0b', Clock],
            ['Best for failure follow-up', "Use 'Failed', 'Rejected', 'No Answer', and 'Busy' filters to find failure recovery opportunities fast.", '#e11d48', Siren],
          ] as const
        ).map(([t, d, c, Icon]) => (
          <div key={t} className="border-ed-line flex gap-3 rounded-xl border border-l-[4px] bg-white px-4 py-4 shadow-[0_2px_8px_rgba(30,20,50,0.06)]" style={{ borderLeftColor: c }}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${c}1a`, color: c }}><Icon className="size-[18px]" /></span>
            <div>
              <p className="text-[12px] font-semibold tracking-[0.03em] uppercase">{t}</p>
              <p className="text-ed-muted mt-1.5 text-[12.5px] leading-relaxed">{d}</p>
            </div>
          </div>
        ))}
      </div>

      {how && (
        <Modal title="How it Works" onClose={() => setHow(false)}>
          <ul className="text-ed-text/90 list-disc space-y-2 pl-5 text-[13.5px] leading-relaxed">
            <li>Pick a date range and filters, then watch totals, pressed keys and failures update.</li>
            <li><b>Success</b> means the customer pressed 1 to confirm the order.</li>
            <li><b>Try Again</b> and <b>Live Queue</b> show calls scheduled for another attempt.</li>
            <li>Use <b>Export CSV</b> to download the filtered activity.</li>
          </ul>
        </Modal>
      )}
    </div>
  );
}
