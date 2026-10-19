'use client';

import { useState, type FormEvent } from 'react';
import { Search, ShieldAlert } from 'lucide-react';
import { allOrders, baseTabsAfter, baseTabsBefore, type ApprovedOrder } from '@/data/approvedOrders';
import { cn } from '@/lib/utils';

const statuses = [...baseTabsBefore, ...baseTabsAfter].map((t) => t.label);
const couriers = ['Pathao', 'Steadfast', 'RedX', 'Paperfly', 'eCourier'];

export function SuperEdit() {
  const [q, setQ] = useState('');
  const [order, setOrder] = useState<ApprovedOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState('');
  const [courier, setCourier] = useState(couriers[0]);
  const [tracking, setTracking] = useState('');
  const [msg, setMsg] = useState('');

  const find = (e: FormEvent) => {
    e.preventDefault();
    const key = q.trim().toLowerCase();
    if (!key) return;
    const hit = allOrders.find((o) => o.invoice.toLowerCase() === key) ?? null;
    setOrder(hit);
    setNotFound(!hit);
    setMsg('');
    if (hit) {
      setStatus(statuses.find((s) => s.replace(/\s/g, '').toLowerCase() === hit.status.toLowerCase()) ?? statuses[0]);
      setTracking(hit.trackingId ?? '');
    }
  };

  const save = () => {
    if (!order) return;
    if (!window.confirm(`Override ${order.invoice}? This action is audit logged.`)) return;
    setMsg(`${order.invoice} updated — status "${status}", courier ${courier}${tracking ? `, tracking ${tracking}` : ''}. Audit log recorded.`);
  };

  const field = 'border-ed-line focus:border-ed-brand/40 focus:ring-ed-brand/10 h-11 w-full rounded-lg border bg-white px-3.5 text-[14px] outline-none focus:ring-2';

  return (
    <div className="mx-auto max-w-[1103px] pt-12">
      <header className="flex flex-wrap items-start justify-between gap-4 px-2">
        <div className="flex items-start gap-5">
          <ShieldAlert className="text-ed-brand mt-1 size-10 shrink-0" strokeWidth={1.5} />
          <div>
            <h1 className="text-[26px] leading-tight font-medium tracking-tight">Order Override</h1>
            <p className="text-ed-muted mt-1.5 text-[14.5px]">Override restricted order status and courier details that are not editable through normal workflows.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
          <span className="rounded-full border border-purple-300 bg-[#fbf5ff] px-3 py-0.5 text-[12.5px] font-medium text-purple-700">Admin Only</span>
          <span className="rounded-full border border-blue-300 bg-[#f3f8ff] px-3 py-0.5 text-[12.5px] font-medium text-blue-700">Audit Logged</span>
          <span className="rounded-full border border-red-300 bg-[#fff4f5] px-3 py-0.5 text-[12.5px] font-medium text-red-600">High Impact Action</span>
        </div>
      </header>

      <div className="border-ed-line mt-6 border-t" />

      <section className="border-ed-line mt-6 rounded-2xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
        <div className="border-ed-line border-b px-6 pt-8 pb-5">
          <h2 className="flex items-center gap-3 text-[18px] font-medium"><Search className="size-5" /> Order Lookup</h2>
          <p className="text-ed-muted mt-2 text-[14.5px]">Enter the order reference to load order details</p>
        </div>

        <div className="px-6 pt-5 pb-8">
          <form onSubmit={find} className="flex gap-3 max-sm:flex-col">
            <div className="relative flex-1">
              <Search className="text-ed-muted absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="e.g. LP5045"
                className="border-ed-brand/60 ring-ed-brand/10 placeholder:text-ed-muted/70 h-[44px] w-full rounded-xl border bg-white pr-4 pl-11 text-[15px] ring-2 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!q.trim()}
              className="bg-ed-brand h-[44px] rounded-xl px-6 text-[15px] font-medium text-white transition disabled:cursor-not-allowed disabled:bg-[#f1eff4] disabled:text-[#a9a4b5] enabled:hover:brightness-110"
            >
              Find Order
            </button>
          </form>

          <div className="border-ed-line mt-6 border-t pt-6">
            {!order ? (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="bg-ed-bg text-ed-muted flex size-12 items-center justify-center rounded-full"><Search className="size-5" /></span>
                <p className="mt-3 text-[15px] font-medium">{notFound ? 'Order Not Found' : 'Awaiting Search Input'}</p>
                <p className="text-ed-muted mt-1 max-w-[290px] text-[12.5px]">
                  {notFound ? `No order matches "${q.trim()}". Check the invoice number and try again.` : 'Enter a complete invoice number above to load the override control panel.'}
                </p>
              </div>
            ) : (
              <div>
                <div className="bg-ed-bg grid gap-3 rounded-xl p-4 text-[13.5px] sm:grid-cols-4">
                  <Info k="Invoice" v={order.invoice} />
                  <Info k="Customer" v={order.name} />
                  <Info k="Mobile" v={order.mobile} />
                  <Info k="Total" v={`৳${order.total.toLocaleString()}`} />
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <label className="text-[13px] font-medium">Status
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className={cn(field, 'mt-1.5 font-normal')}>
                      {statuses.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="text-[13px] font-medium">Courier
                    <select value={courier} onChange={(e) => setCourier(e.target.value)} className={cn(field, 'mt-1.5 font-normal')}>
                      {couriers.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="text-[13px] font-medium">Tracking ID
                    <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking ID" className={cn(field, 'mt-1.5 font-normal')} />
                  </label>
                </div>
                <div className="mt-5 flex justify-end">
                  <button type="button" onClick={save} className="bg-ed-red h-11 rounded-xl px-6 text-[14.5px] font-medium text-white hover:brightness-110">Apply Override</button>
                </div>
                {msg && <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-[13px] font-medium text-green-700">{msg}</p>}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-ed-muted text-[12px]">{k}</p>
      <p className="mt-0.5 font-medium">{v}</p>
    </div>
  );
}
