'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Send } from 'lucide-react';
import { couriers, type CourierStat, type CustomerRecordData } from '@/data/orders';
import { cn } from '@/lib/utils';

const bar = 'rounded bg-ed-line animate-pulse';

function Val({ loading, children }: { loading: boolean; children: ReactNode }) {
  return loading ? <span className={cn(bar, 'inline-block h-3 w-6 align-middle')} /> : <>{children}</>;
}

function OurRecord({
  record,
  loading,
  onFill,
}: {
  record: CustomerRecordData | null;
  loading: boolean;
  onFill: () => void;
}) {
  const canFill = !!record?.info && !loading;
  return (
    <div className="border-ed-line w-full overflow-hidden rounded-lg border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.08)] sm:w-[284px] sm:shrink-0">
      <div className="flex h-9 items-center justify-between bg-[#561f6e] px-3 text-white">
        <span className="flex items-center gap-2 text-[13px] font-semibold">
          <span className="flex size-5 items-center justify-center rounded-md bg-white text-[12px] font-extrabold text-[#561f6e]">
            E
          </span>
          Our Record
        </span>
        <button
          type="button"
          onClick={onFill}
          disabled={!canFill}
          title={canFill ? 'Fill customer info' : 'No saved info for this number'}
          className="rounded-full border border-white/70 px-2.5 py-0.5 text-[11px] font-semibold transition-colors enabled:hover:bg-white/15 disabled:opacity-50"
        >
          Fill Info
        </button>
      </div>
      <div className="px-3 pt-2.5 pb-3">
        <div className="flex items-center gap-2 text-[12px]">
          {loading ? (
            <span className={cn(bar, 'h-5 w-40')} />
          ) : (
            <>
              <span className="bg-ed-bg rounded-full px-2 py-0.5 text-[11px]">
                {record?.isNew ? 'New customer' : 'Returning customer'}
              </span>
              <span className="text-ed-muted">{record?.ordersLabel}</span>
            </>
          )}
        </div>
        <p className="text-ed-muted mt-3.5 text-[10px] font-medium tracking-wide uppercase">
          Web orders
        </p>
        <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
          {loading ? (
            <li><span className={cn(bar, 'inline-block h-3 w-32')} /></li>
          ) : record?.web.length ? (
            record.web.map((w) => (
              <li key={w.label} className="flex items-center gap-1.5">
                <span className={cn('flex items-center gap-1.5', w.tone === 'red' ? 'text-red-600' : 'text-sky-600', record.web.length === 1 && 'min-w-[110px]')}>
                  <span className={cn('size-1.5 rounded-full', w.tone === 'red' ? 'bg-red-500' : 'bg-sky-500')} />
                  {w.label}
                </span>
                <span>{w.count}</span>
              </li>
            ))
          ) : (
            <li className="text-ed-muted">No web orders</li>
          )}
        </ul>
      </div>
    </div>
  );
}

const palette: Record<string, { bg: string; text: string; mark: string }> = {
  overall: { bg: '#561f6e', text: '#fff', mark: '' },
  pathao: { bg: '#e8352f', text: '#fff', mark: 'P' },
  steadfast: { bg: '#2fa58a', text: '#fff', mark: '' },
  redx: { bg: '#ee1c25', text: '#fff', mark: 'REDX' },
  carrybee: { bg: '#f3d200', text: '#3a2f00', mark: '' },
};

function CourierCard({
  id,
  name,
  stat,
  loading,
  refreshing,
  onRefresh,
}: {
  id: string;
  name: string;
  stat: CourierStat;
  loading: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const c = palette[id];
  const pct = stat.total > 0 ? Math.round((stat.success / stat.total) * 100) : 0;
  return (
    <div className="border-ed-line w-[176px] shrink-0 overflow-hidden rounded-lg border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.08)]">
      <div
        className="relative flex h-9 items-center justify-center gap-2 overflow-hidden px-2 text-[13px] font-semibold"
        style={{ background: c.bg, color: c.text }}
      >
        {c.mark && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-1 text-[34px] leading-none font-black italic opacity-15 select-none"
          >
            {c.mark === 'P' ? 'P' : name.toUpperCase()}
          </span>
        )}
        {id === 'pathao' && (
          <span className="flex size-6 items-center justify-center rounded-md bg-white text-[13px] font-black text-[#e8352f]">
            P
          </span>
        )}
        {id === 'steadfast' && <Send className="size-4" />}
        {id === 'carrybee' && (
          <span className="flex size-5 items-center justify-center rounded-full bg-[#3a2f00] text-[10px] font-bold text-[#f3d200]">
            C
          </span>
        )}
        <span className="relative">{name}</span>
        {id === 'overall' && (
          <button
            type="button"
            aria-label="Refresh courier stats"
            onClick={onRefresh}
            className="relative opacity-90 hover:opacity-100"
          >
            <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
          </button>
        )}
      </div>
      <dl className="space-y-0.5 px-2.5 pt-2 pb-2.5 text-[12px]">
        {[
          ['Success Rate', stat.rate === null ? '—' : `${stat.rate}%`],
          ['Total', stat.total],
          ['Success', stat.success],
          ['Cancelled', stat.cancelled],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between">
            <dt className="text-ed-muted">{k}</dt>
            <dd className="tabular-nums"><Val loading={loading}>{v}</Val></dd>
          </div>
        ))}
        <div className="bg-ed-line mt-1.5 h-2 overflow-hidden rounded-full">
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-500',
              pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-orange-500' : 'bg-red-500',
            )}
            style={{ width: loading ? '0%' : `${pct}%` }}
          />
        </div>
      </dl>
    </div>
  );
}

export function CustomerRecord({
  open,
  loading,
  record,
  onFill,
  onRefresh,
}: {
  open: boolean;
  loading: boolean;
  record: CustomerRecordData | null;
  onFill: () => void;
  onRefresh: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const t = setTimeout(update, 350); // open animation shesh hole measure
    window.addEventListener('resize', update);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', update);
    };
  }, [open, loading, update]);

  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * 360, behavior: 'smooth' });

  const stat = (id: string): CourierStat =>
    record?.couriers[id] ?? { rate: null, total: 0, success: 0, cancelled: 0 };

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out',
        open ? 'mb-5 grid-rows-[1fr] opacity-100' : 'mb-0 grid-rows-[0fr] opacity-0',
      )}
    >
      <div className="min-h-0 overflow-hidden" inert={!open}>
        <div className="space-y-3 pb-1">
          {/* mobile: Our Record alada row */}
          <div className="sm:hidden">
            <OurRecord record={record} loading={loading} onFill={onFill} />
          </div>

          <div className="relative">
            <div
              ref={scroller}
              onScroll={update}
              className="purple-scroll flex gap-3 overflow-x-auto pb-2.5"
            >
              {/* desktop: Our Record sticky thake */}
              <div className="bg-white max-sm:hidden sm:sticky sm:left-0 sm:z-10 sm:pr-0">
                <OurRecord record={record} loading={loading} onFill={onFill} />
              </div>
              {couriers.map((c) => (
                <CourierCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  stat={stat(c.id)}
                  loading={loading}
                  refreshing={loading}
                  onRefresh={onRefresh}
                />
              ))}
            </div>

            {canLeft && (
              <button
                type="button"
                aria-label="Scroll left"
                onClick={() => scrollBy(-1)}
                className="border-ed-line text-ed-text absolute top-[62px] left-2 z-20 flex size-7 items-center justify-center rounded-full border bg-white shadow-md sm:left-[298px]"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
            {canRight && (
              <button
                type="button"
                aria-label="Scroll right"
                onClick={() => scrollBy(1)}
                className="border-ed-line text-ed-text absolute top-[62px] right-1 z-20 flex size-7 items-center justify-center rounded-full border bg-white shadow-md"
              >
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
