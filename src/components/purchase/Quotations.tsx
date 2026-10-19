'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { AlertCircle, BellOff, BookOpen, CheckCircle2, Clock, FileQuestion, FileText, Inbox, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { GuideModal } from '@/components/courier/ui';
import { rfqActions, useRfqs, type Rfq } from '@/lib/quotationStore';
import { cn } from '@/lib/utils';
import { longDate, todayIso } from './format';
import { SelectBox } from './ui';

type Shown = Rfq['status'] | 'Expired';
const NEW = '/dashboard/purchase/quotation/new';

/** deadline ses hoye gele (ar Approved/Received na hole) Expired */
const shown = (r: Rfq, today: string): Shown => (r.deadline < today && (r.status === 'Draft' || r.status === 'Sent') ? 'Expired' : r.status);

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: React.ElementType; tone: string }) {
  return (
    <div className="border-ed-line rounded-[28px] border bg-white p-6 shadow-[0_6px_20px_rgba(30,20,50,0.04)] ring-[6px] ring-[#f8f6fb]">
      <div className="flex items-center justify-between">
        <p className="text-ed-text/75 text-[11px] font-semibold tracking-wider uppercase">{label}</p>
        <span className={cn('flex size-9 items-center justify-center rounded-full', tone)}><Icon className="size-4" /></span>
      </div>
      <p className="mt-6 text-[26px] leading-none font-semibold">{value}</p>
    </div>
  );
}

const statusCls: Record<Shown, string> = {
  Draft: 'border-ed-line bg-[#f6f5fa] text-ed-text/70',
  Sent: 'border-[#c9dcfb] bg-[#e8f0ff] text-[#2f5fe8]',
  Received: 'border-[#bfe9f0] bg-[#e6f7fa] text-[#0e8aa0]',
  Approved: 'border-[#b7ebd0] bg-[#e8f8f0] text-[#0f9d58]',
  Expired: 'border-[#f8d9b8] bg-[#fff1e3] text-[#d9731a]',
};
const statusLabel: Record<Shown, string> = { Draft: 'Draft', Sent: 'Pending Response', Received: 'Received', Approved: 'Approved', Expired: 'Expired' };

export function Quotations() {
  const rfqs = useRfqs();
  const [today] = useState(todayIso);
  const [open, setOpen] = useState(false);
  const [fStatus, setFStatus] = useState('All');
  const [fPri, setFPri] = useState('All');
  const [guide, setGuide] = useState(false);

  const count = (s: Shown) => rfqs.filter((r) => shown(r, today) === s).length;
  const rows = useMemo(
    () => rfqs.filter((r) => (fStatus === 'All' || statusLabel[shown(r, today)] === fStatus) && (fPri === 'All' || r.priority === fPri)),
    [rfqs, fStatus, fPri, today],
  );

  const newBtn = (cls: string, children: ReactNode) => <Link href={NEW} className={cn('bg-ed-brand flex items-center justify-center gap-2 font-medium text-white shadow-sm hover:brightness-110', cls)}>{children}</Link>;

  return (
    <div className="mx-auto max-w-[1216px] pt-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] leading-tight font-semibold tracking-tight">Ask for Quotation</h1>
          <p className="text-ed-text/65 mt-0.5 text-[14.5px]">Request supplier pricing before creating purchase orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setGuide(true)} className="border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-5 text-[14px] shadow-sm"><BookOpen className="size-4" /> Guide</button>
          {newBtn('h-10 rounded-xl px-5 text-[13.5px]', <><Plus className="size-4" /> New Quotation Request</>)}
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Total RFQ" value={rfqs.length} icon={FileText} tone="bg-[#f1eaf7] text-[#7c3aed]" />
        <Stat label="Pending Response" value={count('Sent')} icon={Clock} tone="bg-[#e4efff] text-[#2f5fe8]" />
        <Stat label="Received" value={count('Received')} icon={Inbox} tone="bg-[#e0f4f8] text-[#0e8aa0]" />
        <Stat label="Approved" value={count('Approved')} icon={CheckCircle2} tone="bg-[#e3f8ec] text-[#16a34a]" />
        <Stat label="Expired" value={count('Expired')} icon={BellOff} tone="bg-[#fdebdc] text-[#ea580c]" />
      </div>

      <section className="border-ed-line mt-8 rounded-[36px] border bg-[#fcfbfd] p-2 shadow-[0_6px_20px_rgba(30,20,50,0.04)]">
        <div className="border-ed-line rounded-[30px] border bg-white p-8 shadow-[0_1px_3px_rgba(30,20,50,0.04)]">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-medium">Quotation Requests</h2>
            <button type="button" onClick={() => setOpen((o) => !o)} aria-pressed={open} className={cn('border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-full border bg-white px-5 text-[13.5px]', open && 'bg-ed-brand-soft text-ed-brand border-ed-brand/30')}><SlidersHorizontal className="size-4" /> Filters</button>
          </div>
          {open && (
            <div className="bg-ed-bg/60 border-ed-line mt-4 grid gap-3 rounded-2xl border p-4 sm:grid-cols-2">
              <SelectBox label="Status" value={fStatus} onChange={setFStatus} options={['All', 'Draft', 'Pending Response', 'Received', 'Approved', 'Expired']} />
              <SelectBox label="Priority" value={fPri} onChange={setFPri} options={['All', 'Low', 'Normal', 'High', 'Urgent']} />
            </div>
          )}

          {rfqs.length === 0 ? (
            <div className="border-ed-line mt-6 flex min-h-[366px] flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center">
              <span className="bg-[#f1eaf7] text-[#7c3aed] flex size-14 items-center justify-center rounded-full"><FileQuestion className="size-6" strokeWidth={1.6} /></span>
              <p className="mt-5 text-[19px] font-semibold">No quotation requests yet</p>
              <p className="text-ed-text/65 mt-1.5 max-w-[360px] text-[14.5px] leading-snug">Create your first quotation request to compare supplier prices before purchase.</p>
              {newBtn('mt-7 h-10 rounded-full px-6 text-[13.5px]', <><Plus className="size-4" /> New Quotation Request</>)}
            </div>
          ) : (
            <div className="border-ed-line mt-6 overflow-x-auto rounded-2xl border">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-ed-line text-ed-text/80 border-b bg-[#faf9fc] text-[12px] font-semibold tracking-wider uppercase">
                    {['RFQ #', 'RFQ Date', 'Suppliers', 'Items', 'Priority', 'Deadline', 'Status', 'Actions'].map((h) => <th key={h} className="px-4 py-4">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="text-[13.5px]">
                  {rows.map((r) => {
                    const st = shown(r, today);
                    return (
                      <tr key={r.id} className="border-ed-line border-b last:border-b-0">
                        <td className="px-4 py-4 font-medium">{r.no}</td>
                        <td className="px-4 whitespace-nowrap">{longDate(r.date)}</td>
                        <td className="max-w-[220px] truncate px-4" title={r.suppliers.join(', ')}>{r.suppliers[0]}{r.suppliers.length > 1 && <span className="text-ed-muted ml-1 text-[12px]">+{r.suppliers.length - 1}</span>}</td>
                        <td className="px-4" title={r.items.map((i) => i.name).join(', ')}>{r.items.length}</td>
                        <td className="px-4">{r.priority}</td>
                        <td className="px-4 whitespace-nowrap">{longDate(r.deadline)}</td>
                        <td className="px-4"><span className={cn('rounded-full border px-2.5 py-1 text-[12px] font-medium', statusCls[st])}>{statusLabel[st]}</span></td>
                        <td className="px-4">
                          <div className="flex items-center gap-2">
                            {r.status === 'Draft' && st !== 'Expired' && <button type="button" onClick={() => rfqActions.setStatus(r.id, 'Sent')} className="h-9 rounded-lg bg-[#e4efff] px-3.5 text-[13px] font-medium text-[#2f5fe8]">Mark Sent</button>}
                            {r.status === 'Sent' && st !== 'Expired' && <button type="button" onClick={() => rfqActions.setStatus(r.id, 'Received')} className="h-9 rounded-lg bg-[#e0f4f8] px-3.5 text-[13px] font-medium text-[#0e8aa0]">Mark Received</button>}
                            {r.status === 'Received' && <button type="button" onClick={() => rfqActions.setStatus(r.id, 'Approved')} className="h-9 rounded-lg bg-[#e3f8ec] px-3.5 text-[13px] font-medium text-[#0f9d58]">Approve</button>}
                            {r.status === 'Approved' && <Link href="/dashboard/purchase/new" className="bg-ed-brand-soft text-ed-brand flex h-9 items-center rounded-lg px-3.5 text-[13px] font-medium">Create Purchase</Link>}
                            <button type="button" aria-label="Delete request" onClick={() => window.confirm('Delete this quotation request?') && rfqActions.remove(r.id)} className="flex size-8 items-center justify-center text-[#e5243b]/70 hover:text-[#e5243b]"><Trash2 className="size-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rows.length === 0 && <p className="text-ed-muted flex items-center justify-center gap-2 py-12 text-[13px]"><AlertCircle className="size-4" /> No requests match the filters.</p>}
            </div>
          )}
        </div>
      </section>

      {guide && <GuideModal title="Ask for Quotation guide" onClose={() => setGuide(false)} points={[
        'Create a request with the products you need and the suppliers to ask.',
        'Suppliers are contacted outside EcomDrive — mark the request Sent afterwards.',
        'When replies arrive, mark it Received, then Approve the best quote.',
        'Requests past their response deadline show as Expired.',
      ]} />}
    </div>
  );
}
