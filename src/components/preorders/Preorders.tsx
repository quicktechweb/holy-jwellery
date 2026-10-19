'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreorderRow {
  id: string;
  invoice: string;
  customer: string;
  mobile: string;
  reason: string;
  note: string;
  notificationDate: string;
  status: 'Notified' | 'Pending Notification';
  products: string;
  productCode: string;
  business: string;
  createdAt: string;
}

const rowsSeed: PreorderRow[] = [];
const reasons = ['All Reasons', 'Out of Stock', 'Coming Soon', 'Customer Request'];
const businesses = ['All Businesses', 'Elishine'];
const tabs = ['All', 'Notified', 'Pending Notification'] as const;
const cols = ['Invoice', 'Customer', 'Mobile', 'Reason', 'Note', 'Notification Date', 'Status', 'Products', 'Created At'];

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-ed-line text-ed-text focus:border-ed-brand/40 focus:ring-ed-brand/10 h-10 w-full cursor-pointer appearance-none rounded-lg border bg-[#faf9fc] pr-9 pl-3.5 text-[14px] outline-none focus:ring-2"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
    </div>
  );
}

export function Preorders() {
  const [rows, setRows] = useState<PreorderRow[]>(rowsSeed);
  const [reason, setReason] = useState(reasons[0]);
  const [business, setBusiness] = useState(businesses[0]);
  const [code, setCode] = useState('');
  const [tab, setTab] = useState<(typeof tabs)[number]>('Notified');
  const [spin, setSpin] = useState(false);
  const [msg, setMsg] = useState('');

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 2200);
  };

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (tab === 'All' || r.status === tab) &&
          (reason === reasons[0] || r.reason === reason) &&
          (business === businesses[0] || r.business === business) &&
          (!code.trim() || r.productCode.toLowerCase().includes(code.trim().toLowerCase())),
      ),
    [rows, tab, reason, business, code],
  );

  const refresh = () => {
    setSpin(true);
    setTimeout(() => {
      setSpin(false);
      setRows((r) => [...r]);
      flash('Stock refreshed');
    }, 700);
  };

  return (
    <div className="pt-4">
      <section className="border-ed-line overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
        <div className="border-ed-line flex flex-wrap items-center justify-between gap-3 border-b px-6 py-5 max-sm:px-4">
          <h1 className="text-[24px] font-medium tracking-tight">Preorders</h1>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => flash('Product summary is empty')} className="border-ed-line hover:text-ed-brand h-10 rounded-lg border bg-[#faf9fc] px-5 text-[14.5px]">
              Product Summary
            </button>
            <button type="button" onClick={() => flash('No pending notifications to send')} className="bg-ed-brand h-10 rounded-lg px-5 text-[14.5px] font-medium text-white hover:brightness-110">
              Check Notifications
            </button>
          </div>
        </div>

        <div className="px-6 pt-8 pb-8 max-sm:px-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Select label="Reason" value={reason} onChange={setReason} options={reasons} />
            <Select label="Business" value={business} onChange={setBusiness} options={businesses} />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Filter by product code"
              className="border-ed-line placeholder:text-ed-muted focus:border-ed-brand/40 focus:ring-ed-brand/10 h-10 rounded-lg border bg-[#faf9fc] px-3.5 text-[14px] outline-none focus:ring-2"
            />
            <button type="button" onClick={refresh} className="border-ed-line hover:text-ed-brand flex h-10 items-center justify-center gap-2.5 rounded-lg border bg-[#faf9fc] text-[14.5px]">
              <RefreshCw className={cn('size-4', spin && 'animate-spin')} /> Refresh Stock
            </button>
          </div>

          {msg && <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-[13px] font-medium text-green-700">{msg}</p>}

          <div role="tablist" className="border-ed-line mt-8 flex gap-2 border-b">
            {tabs.map((t) => {
              const on = tab === t;
              return (
                <button
                  key={t}
                  role="tab"
                  aria-selected={on}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    '-mb-px h-11 border-b-2 px-4 text-[15px] transition-colors',
                    on ? 'border-ed-brand text-ed-text font-medium' : 'text-ed-muted hover:text-ed-brand border-transparent',
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div className="border-ed-line mt-4 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[980px] text-left text-[14.5px]">
              <thead>
                <tr className="text-ed-muted border-ed-line border-b">
                  {cols.map((h) => (
                    <th key={h} className="px-4 py-5 text-[14.5px] font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={cols.length} className="py-11 text-center text-[14.5px]">No results.</td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-ed-line hover:bg-ed-bg/50 h-14 border-b last:border-b-0">
                      <td className="px-4">{r.invoice}</td>
                      <td className="px-4">{r.customer}</td>
                      <td className="px-4">{r.mobile}</td>
                      <td className="px-4">{r.reason}</td>
                      <td className="px-4">{r.note}</td>
                      <td className="px-4">{r.notificationDate}</td>
                      <td className="px-4">{r.status}</td>
                      <td className="px-4">{r.products}</td>
                      <td className="px-4">{r.createdAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
