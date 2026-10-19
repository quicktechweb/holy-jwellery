'use client';

import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Clock, Headphones, ListChecks, Phone } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FU_CUSTOMERS, useFollowUps } from '@/lib/followupStore';

function Stat({ label, value, icon, tint }: { label: string; value: number; icon: ReactNode; tint: string }) {
  return (
    <div className="border-ed-line relative flex h-[52px] min-w-[150px] flex-1 items-center justify-between overflow-hidden rounded-lg border px-3" style={{ background: tint }}>
      <div><div className="text-ed-text/70 text-[11px] leading-none">{label}</div><div className="mt-1.5 text-[18px] leading-none font-bold">{value}</div></div>
      <span className="flex size-8 items-center justify-center rounded-lg bg-white/70">{icon}</span>
    </div>
  );
}

export function AgentCockpit() {
  const { assignments, setProgress } = useFollowUps();
  const [i, setI] = useState(0);
  const queue = assignments.filter((a) => a.progress !== 'Completed');
  const done = assignments.filter((a) => a.progress === 'Completed').length;
  const cur = queue[Math.min(i, Math.max(queue.length - 1, 0))];
  const cust = cur && FU_CUSTOMERS.find((c) => c.id === cur.customerId);
  const idx = queue.length ? Math.min(i, queue.length - 1) + 1 : 0;

  return (
    <div className="pt-4">
      <div className="border-ed-line flex flex-wrap items-center gap-3 rounded-2xl border bg-[#f1f0fb]/60 p-3">
        <div className="flex items-center gap-2.5 pr-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#7c1ee6] text-white"><Headphones className="size-5" /></span>
          <div><div className="text-[16px] leading-tight font-bold">এজেন্ট কল ডেস্ক</div><div className="text-ed-muted text-[11px]">আজকের ফলো-আপ কিউ</div></div>
        </div>
        <div className="flex flex-1 flex-wrap gap-2.5">
          <Stat label="আজ সম্পন্ন" value={done} tint="#e8f8ef" icon={<CheckCircle2 className="size-4 text-[#16a34a]" />} />
          <Stat label="বাকি আছে" value={queue.length} tint="#f7f7fb" icon={<ListChecks className="size-4" />} />
          <Stat label="এখন কল" value={queue.filter((a) => a.progress === 'In Progress').length} tint="#f1ecfb" icon={<Clock className="size-4 text-[#7c3aed]" />} />
          <Stat label="সময় পেরিয়েছে" value={0} tint="#f7f7fb" icon={<AlertTriangle className="size-4" />} />
        </div>
        <div className="flex items-center gap-2">
          <span className="border-ed-line rounded-lg border bg-white px-3 py-2 text-[11px]">দেখা <b className="text-[12px]">{idx}/{queue.length}</b></span>
          <button type="button" disabled={i <= 0} onClick={() => setI((n) => n - 1)} className="border-ed-line flex h-9 items-center gap-1.5 rounded-lg border bg-white px-3 text-[12px] disabled:opacity-50"><ArrowLeft className="size-3.5" />আগের</button>
          <button type="button" disabled={i >= queue.length - 1} onClick={() => setI((n) => n + 1)} className="flex h-9 items-center gap-1.5 rounded-lg bg-[#a98bb8] px-3 text-[12px] font-semibold text-white enabled:bg-ed-brand">পরের<ArrowRight className="size-3.5" /></button>
        </div>
      </div>

      <section className="border-ed-line mt-4 min-h-[320px] rounded-2xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)]">
        {!cur || !cust ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
            <CheckCircle2 className="size-14 text-[#10b981]" strokeWidth={1.8} />
            <p className="mt-4 text-[18px] font-bold">কলের তালিকা খালি</p>
            <p className="mt-1.5 text-[13px] text-[#4a63c8]">এই ব্যবসায় এখন আপনার জন্য কোনো ফলো-আপ দেওয়া নেই।</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-ed-muted text-[12px]">{cust.order} · {cur.priority}</div>
                <h2 className="mt-1 text-[22px] font-bold">{cust.name}</h2>
                <p className="mt-1 text-[14px]">{cust.products} · ৳ {cust.amount}</p>
                {cur.note && <p className="bg-ed-bg mt-3 rounded-lg px-3 py-2 text-[13px]">{cur.note}</p>}
              </div>
              <a href={`tel:${cust.mobile}`} onClick={() => setProgress(cur.customerId, 'In Progress')} className="flex h-11 items-center gap-2 rounded-lg bg-[#16a34a] px-5 text-[15px] font-semibold text-white"><Phone className="size-4" />{cust.mobile}</a>
            </div>
            <div className={cn('mt-6 flex gap-2')}>
              <button type="button" onClick={() => setProgress(cur.customerId, 'Completed')} className="h-10 rounded-lg bg-ed-brand px-5 text-[14px] font-semibold text-white">কল সম্পন্ন</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
