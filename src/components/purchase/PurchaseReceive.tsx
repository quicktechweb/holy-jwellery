'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, PackageCheck } from 'lucide-react';
import { Modal } from '@/components/courier/ui';
import { receiveActions, receiveStatus, remaining, useReceiveLines, type ReceiveLine } from '@/lib/receiveStore';
import { cn } from '@/lib/utils';
import { fmtDateTime } from './format';
import { inputCls } from './ui';

const PAGE_SIZE = 20;

const dot: Record<ReturnType<typeof receiveStatus>, string> = {
  Pending: 'bg-[#9a96a8]',
  Partial: 'bg-[#e0a21b]',
  Received: 'bg-[#2fb36d]',
};

function StatusPill({ line }: { line: ReceiveLine }) {
  const s = receiveStatus(line);
  return (
    <span className="border-ed-line text-ed-text/80 inline-flex items-center gap-1.5 rounded-full border bg-[#faf9fc] px-3 py-1 text-[12px]">
      <i className={cn('size-1.5 rounded-full', dot[s])} />{s}
    </span>
  );
}

function ReceiveModal({ line, onClose }: { line: ReceiveLine; onClose: () => void }) {
  const left = remaining(line);
  const [good, setGood] = useState(String(left));
  const [bad, setBad] = useState('0');
  const [note, setNote] = useState('');
  const g = Number(good) || 0;
  const d = Number(bad) || 0;
  const err = g < 0 || d < 0 ? 'Quantity cannot be negative.' : g + d === 0 ? 'Enter at least one quantity.' : g + d > left ? `Only ${left} remaining to receive.` : '';

  return (
    <Modal title="Receive Stock" onClose={onClose}>
      <div className="bg-ed-bg rounded-lg px-4 py-3 text-[13px]">
        <p className="font-medium">{line.item}</p>
        <p className="text-ed-muted mt-0.5">{line.supplier} · Ordered {line.ordered} · Remaining {left}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-ed-text/80 mb-1.5 block text-[12px]">Good items received</span>
          <input type="number" min={0} value={good} onChange={(e) => setGood(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-ed-text/80 mb-1.5 block text-[12px]">Damaged / missing</span>
          <input type="number" min={0} value={bad} onChange={(e) => setBad(e.target.value)} className={inputCls} />
        </label>
      </div>
      <label className="mt-3 block">
        <span className="text-ed-text/80 mb-1.5 block text-[12px]">Note (optional)</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. 3 pieces broken in transit" className={inputCls} />
      </label>
      <p className="text-ed-muted mt-3 text-[12px]">Good items are added to stock; damaged / missing are logged only.</p>
      {err && <p className="text-ed-red mt-2 text-[12.5px]">{err}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="border-ed-line hover:text-ed-brand h-10 rounded-lg border px-4 text-[13.5px]">Cancel</button>
        <button type="button" disabled={!!err} onClick={() => { receiveActions.receive(line.id, g, d, note.trim()); onClose(); }}
          className="bg-ed-brand h-10 rounded-lg px-4 text-[13.5px] font-medium text-white hover:brightness-110 disabled:opacity-50">Confirm Receive</button>
      </div>
    </Modal>
  );
}

function DetailModal({ line, onClose }: { line: ReceiveLine; onClose: () => void }) {
  const rows: [string, string | number][] = [
    ['Supplier', line.supplier], ['Item', line.item], ['Ordered', line.ordered],
    ['Received', line.received], ['Damaged / Missing', line.damaged], ['Remaining', remaining(line)],
  ];
  return (
    <Modal title="Purchase Details" onClose={onClose}>
      <p className="text-ed-muted -mt-2 mb-3 text-[12.5px]">{fmtDateTime(line.date)}</p>
      <dl className="divide-ed-line border-ed-line divide-y rounded-lg border text-[13.5px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between px-4 py-2.5"><dt className="text-ed-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
        ))}
      </dl>
      <h4 className="mt-5 text-[13.5px] font-medium">Receiving history</h4>
      {line.history.length === 0
        ? <p className="text-ed-muted mt-2 text-[13px]">Nothing received yet.</p>
        : <ul className="mt-2 space-y-2">{line.history.map((h) => (
            <li key={h.at} className="border-ed-line rounded-lg border px-3 py-2 text-[12.5px]">
              <span className="text-ed-muted">{fmtDateTime(h.at)}</span> — <span className="text-[#0f9d58]">{h.good} good</span>, <span className="text-ed-red">{h.damaged} damaged/missing</span>{h.note && <span className="text-ed-muted"> · {h.note}</span>}
            </li>
          ))}</ul>}
    </Modal>
  );
}

const th = 'px-5 py-4 text-[11px] font-medium tracking-wider uppercase text-ed-muted';

export function PurchaseReceive() {
  const all = useReceiveLines();
  const pending = all.filter((l) => remaining(l) > 0);
  const [page, setPage] = useState(1);
  const [recv, setRecv] = useState<ReceiveLine | null>(null);
  const [view, setView] = useState<ReceiveLine | null>(null);

  const pages = Math.max(Math.ceil(pending.length / PAGE_SIZE), 1);
  const cur = Math.min(page, pages);
  const rows = pending.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-[1220px] pt-7 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] leading-tight font-medium tracking-tight">Purchase Receive</h1>
          <p className="text-ed-text/65 mt-2 max-w-[960px] text-[14px] leading-relaxed">
            Receive incoming stock against pending and partially received purchase orders. Good items are added to stock; damaged / missing items are logged only.
          </p>
        </div>
        <Link href="/dashboard/purchase/list" className="border-ed-line hover:text-ed-brand flex h-12 items-center rounded-full border bg-white px-6 text-[13.5px] font-medium shadow-sm">All Purchases</Link>
      </header>

      <div className="border-ed-line mt-7 overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead>
              <tr className="border-ed-line border-b bg-[#fcfbfd]">
                <th className={th}>Date</th><th className={th}>Supplier</th><th className={th}>Items</th>
                <th className={cn(th, 'text-right')}>Ordered</th><th className={cn(th, 'text-right')}>Received</th>
                <th className={cn(th, 'text-right')}>Damaged / Missing</th><th className={cn(th, 'text-right')}>Remaining</th>
                <th className={th}>Status</th><th className={cn(th, 'text-right')}>Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13.5px] [&_td]:px-5 [&_td]:py-[21px] [&_tr:not(:last-child)]:border-b [&_tr]:border-ed-line">
              {rows.map((l) => (
                <tr key={l.id} className="hover:bg-[#fbfafd]">
                  <td className="whitespace-nowrap">{fmtDateTime(l.date)}</td>
                  <td className="font-medium whitespace-nowrap">{l.supplier}</td>
                  <td>{l.item}</td>
                  <td className="text-right tabular-nums">{l.ordered}</td>
                  <td className="text-right font-medium text-[#0f9d58] tabular-nums">{l.received}</td>
                  <td className="text-ed-red text-right font-medium tabular-nums">{l.damaged}</td>
                  <td className="text-ed-blue text-right font-medium tabular-nums">{remaining(l)}</td>
                  <td><StatusPill line={l} /></td>
                  <td>
                    <div className="flex items-center justify-end gap-2.5">
                      <button type="button" onClick={() => setRecv(l)} className="flex h-9 items-center gap-1.5 rounded-lg border border-[#b7ebd0] bg-[#e8f8f0] px-4 text-[13px] font-medium text-[#0f9d58] hover:brightness-95"><PackageCheck className="size-4" />Receive</button>
                      <button type="button" aria-label="View details" onClick={() => setView(l)} className="flex size-9 items-center justify-center rounded-lg bg-[#f4eefb] text-[#7a3fb5] hover:brightness-95"><Eye className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="text-ed-muted py-14 text-center text-[13px]">No purchases waiting to be received.</p>}
      </div>

      <div className="text-ed-muted mt-5 flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <p>{pending.length} purchase{pending.length === 1 ? '' : 's'} to receive</p>
        <div className="flex items-center gap-3">
          <span className="text-ed-text/80">Page {cur} of {pages}</span>
          <button type="button" disabled={cur <= 1} onClick={() => setPage(cur - 1)} className="border-ed-line h-9 rounded-lg border bg-white px-4 text-[13px] disabled:opacity-50">‹ Prev</button>
          <button type="button" disabled={cur >= pages} onClick={() => setPage(cur + 1)} className="border-ed-line h-9 rounded-lg border bg-white px-4 text-[13px] disabled:opacity-50">Next ›</button>
        </div>
      </div>

      {recv && <ReceiveModal line={recv} onClose={() => setRecv(null)} />}
      {view && <DetailModal line={all.find((l) => l.id === view.id) ?? view} onClose={() => setView(null)} />}
    </div>
  );
}
