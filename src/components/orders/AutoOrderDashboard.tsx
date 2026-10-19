'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Box,
  CheckCheck,
  CircleArrowRight,
  Clock,
  PackageX,
  PhoneMissed,
  RefreshCw,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react';
import { autoOrderHref, getAutoNext, getTaken, queues, setAutoNext, takeNext, type QueueKey } from '@/lib/autoQueue';
import { cn } from '@/lib/utils';

const card = 'border-ed-line rounded-2xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]';

const icons: Record<QueueKey, LucideIcon> = {
  PROCESSING: Clock,
  INCOMPLETE: PackageX,
  GOOD_BUT_NO_RESPONSE: CheckCheck,
  NO_RESPONSE: PhoneMissed,
  ADVANCE_PAYMENT: WalletCards,
  ON_HOLD: Box,
};

export function AutoOrderDashboard() {
  const router = useRouter();
  const [autoNext, setAuto] = useState(true);
  const [taken, setTaken] = useState(0);
  const [spin, setSpin] = useState(false);
  const [guide, setGuide] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setAuto(getAutoNext());
    setTaken(getTaken());
  }, []);

  const toggle = () => {
    setAuto((v) => {
      setAutoNext(!v);
      return !v;
    });
  };

  const refresh = () => {
    setSpin(true);
    setTaken(getTaken());
    setTimeout(() => setSpin(false), 700);
  };

  const open = (key: QueueKey) => {
    const next = takeNext(key);
    if (!next) {
      setMsg('No orders available in this queue right now.');
      setTimeout(() => setMsg(''), 2400);
      return;
    }
    router.push(autoOrderHref(next.id, key));
  };

  return (
    <div className="pt-4">
      <section className={card}>
        <header className="border-ed-line flex flex-wrap items-center justify-between gap-3 border-b px-6 py-[18px]">
          <h1 className="text-[17px] font-semibold">Auto Order Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-ed-muted flex items-center gap-2.5 text-[12.5px]">
              Updated just now
              <button type="button" aria-label="Refresh" onClick={refresh} className="hover:text-ed-brand">
                <RefreshCw className={cn('size-4', spin && 'animate-spin')} />
              </button>
            </span>
            <button
              type="button"
              onClick={() => setGuide(true)}
              className="border-ed-line hover:text-ed-brand flex h-10 items-center gap-2.5 rounded-lg border bg-white px-4 text-[14px] font-medium shadow-[0_1px_2px_rgba(30,20,50,0.05)]"
            >
              <BookOpen className="size-4" /> Guide
            </button>
          </div>
        </header>

        <div className="p-6 max-sm:p-4">
          <div className="border-ed-line bg-[#fcfbfd] flex items-center justify-between gap-4 rounded-xl border px-4 py-4">
            <div>
              <p className="text-[14.5px] font-medium">Open next automatically after status update</p>
              <p className="text-ed-muted mt-1 text-[12.5px]">
                When enabled, auto-order continues with the next item in the same queue after you update a status.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoNext}
              aria-label="Open next automatically after status update"
              onClick={toggle}
              className={cn('relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors', autoNext ? 'bg-ed-brand' : 'bg-[#dcd8e4]')}
            >
              <span className={cn('absolute top-[3px] left-[3px] size-5 rounded-full bg-white shadow transition-transform', autoNext && 'translate-x-5')} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {queues.map((q) => {
              const Icon = icons[q.key];
              const off = q.count === 0;
              return (
                <div
                  key={q.key}
                  className={cn(
                    'rounded-xl border bg-white p-4 shadow-[0_2px_8px_rgba(30,20,50,0.07)]',
                    off ? 'border-ed-line border-dashed opacity-55 shadow-none' : 'border-ed-line',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-3 text-[14.5px] font-medium">
                      <Icon className="size-[18px]" strokeWidth={1.75} /> {q.label}
                    </span>
                    <span className="bg-[#f1f0f4] text-ed-text rounded-md px-2.5 py-0.5 text-[12px] font-medium tabular-nums">{q.count}</span>
                  </div>
                  <button
                    type="button"
                    disabled={off}
                    onClick={() => open(q.key)}
                    className="bg-ed-brand mt-5 flex h-10 w-full items-center justify-center gap-3 rounded-lg text-[14px] font-medium text-white transition enabled:hover:brightness-110 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#ece9f0] disabled:text-ed-muted"
                  >
                    Open Next <CircleArrowRight className="size-[18px]" strokeWidth={1.75} />
                  </button>
                </div>
              );
            })}
          </div>
          {msg && <p role="status" className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-[13px] font-medium text-amber-700">{msg}</p>}
        </div>
      </section>

      <section className={cn(card, 'mt-6')}>
        <header className="border-ed-line border-b px-6 py-[18px]">
          <h2 className="text-[17px] font-semibold">My Daily Report</h2>
        </header>
        <div className="grid grid-cols-1 gap-4 p-6 max-sm:p-4 sm:grid-cols-2 xl:grid-cols-4">
          {(
            [
              ['Taken', taken],
              ['Shipped', 0],
              ['Delivered', 0],
              ['Returned', 0],
            ] as [string, number][]
          ).map(([k, v]) => (
            <div key={k} className="border-ed-line border-l-ed-brand rounded-xl border border-l-[3px] bg-white px-4 py-4 shadow-[0_2px_8px_rgba(30,20,50,0.07)]">
              <p className="text-ed-muted text-[12px] font-medium tracking-wide uppercase">{k}</p>
              <p className="mt-2 text-[28px] leading-none font-semibold tabular-nums">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {guide && (
        <Modal onClose={() => setGuide(false)} title="Auto Order Guide">
          <ol className="text-ed-text/90 list-decimal space-y-2 pl-5 text-[13.5px] leading-relaxed">
            <li>Pick a queue and press <b>Open Next</b>. The next order of that queue opens for you.</li>
            <li>Review the customer, address and products, then update the status or approve the order.</li>
            <li>With <b>Open next automatically</b> on, the next order in the same queue opens right after you update.</li>
            <li>Use <b>Back to Auto Order</b> any time to return to this dashboard.</li>
          </ol>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[16px] font-semibold">{title}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="text-ed-muted hover:text-ed-text"><X className="size-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
