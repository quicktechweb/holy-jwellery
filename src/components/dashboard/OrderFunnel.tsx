'use client';

import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { funnels } from '@/data/dashboard';
import { cn } from '@/lib/utils';
import { Card } from './Card';

const ROW = 76;
const tabs = Object.keys(funnels);

export function OrderFunnel() {
  const [tab, setTab] = useState(tabs[0]);
  const stages = funnels[tab];
  const max = Math.max(...stages.map((s) => s.value), 0);
  const height = ROW * stages.length;

  return (
    <Card className="rounded-2xl sm:rounded-xl">
      <div className="border-ed-line flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-[22px] font-medium sm:text-[17px]">Order Funnel</h2>
        <CircleHelp className="text-ed-muted size-4" aria-label="Help" />
      </div>

      <div className="px-3 pt-3 pb-6 sm:px-6 sm:pt-4">
        <div className="border-ed-line bg-ed-bg/60 inline-flex rounded-lg border p-0.5">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs whitespace-nowrap transition-colors',
                t === tab
                  ? 'text-ed-text border-ed-line border bg-white font-medium shadow-sm'
                  : 'text-ed-muted hover:text-ed-text border border-transparent',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative mx-auto mt-5 max-w-[400px]" style={{ height }}>
          <svg
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            className="absolute inset-y-0 left-1/2 h-full w-[40%] -translate-x-1/2 sm:w-full"
            aria-hidden="true"
          >
            {max > 0 &&
              stages.map((s, i) => {
                const top = (s.value / max) * 100;
                const bottom = ((stages[i + 1]?.value ?? s.value) / max) * 100;
                const y0 = i * ROW;
                const y1 = y0 + ROW - 4;
                const pts = [
                  [(100 - top) / 2, y0],
                  [100 - (100 - top) / 2, y0],
                  [100 - (100 - bottom) / 2, y1],
                  [(100 - bottom) / 2, y1],
                ];
                return (
                  <polygon
                    key={s.label}
                    points={pts.map((p) => p.join(',')).join(' ')}
                    fill="#60a5fa"
                  />
                );
              })}
          </svg>

          {stages.map((s, i) => (
            <div
              key={s.label}
              className="absolute inset-x-0 flex items-center text-sm"
              style={{ top: i * ROW, height: ROW - 4 }}
            >
              {i === 0 && s.value > 0 ? (
                <>
                  <span className="text-ed-muted absolute right-[calc(50%+43px)] text-xs sm:right-auto sm:left-[14%]">
                    {s.pct}
                  </span>
                  <span className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-white">
                    {s.value}
                  </span>
                  <span className="absolute left-[calc(50%+44px)] max-w-[64px] text-[13px] leading-tight font-medium sm:right-[3%] sm:left-auto sm:max-w-none">
                    {s.label}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-ed-muted absolute right-1/2 mr-3 text-xs">
                    {s.pct}
                  </span>
                  <span className="absolute left-1/2 ml-3 max-w-[64px] text-[13px] leading-tight font-medium sm:max-w-none">
                    {s.label}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
