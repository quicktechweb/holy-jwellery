'use client';

import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { courierTabs, operationsKpis } from '@/data/dashboard';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { HourlyCombined } from './HourlyCombined';

const cardTitle = 'text-[22px] leading-tight font-medium sm:text-[17px]';

function ControlCenter() {
  return (
    <Card className="rounded-2xl sm:rounded-xl">
      <div className="border-ed-line flex items-start justify-between gap-3 border-b px-6 py-4 sm:items-center sm:border-b-0 sm:pb-3">
        <h2 className={cardTitle}>Operations Control Center</h2>
        <CircleHelp
          className="text-ed-muted mt-1.5 size-4 shrink-0 sm:mt-0"
          aria-label="Help"
        />
      </div>

      <div className="px-6 pt-4 pb-6 sm:pt-2">
        <div className="max-sm:border-ed-line grid gap-2 max-sm:gap-0 max-sm:overflow-hidden max-sm:rounded-xl max-sm:border sm:grid-cols-2 lg:grid-cols-3">
          {operationsKpis.map((k) => (
            <div
              key={k.label}
              className={cn(
                'flex items-center justify-between',
                // mobile: plain list rows
                'max-sm:border-ed-line px-3.5 max-sm:border-b max-sm:py-[15px] max-sm:last:border-b-0',
                // desktop: mint tiles
                'sm:min-h-[82px] sm:flex-col sm:items-start sm:justify-between sm:gap-1 sm:rounded-lg sm:border sm:border-[#7de8c0] sm:bg-[#d6f9ea] sm:px-3 sm:py-3',
              )}
            >
              <span className="text-ed-text text-sm font-medium sm:text-[15px] sm:font-normal sm:text-[#0b6b49]">
                {k.label}
              </span>
              <span className="text-lg leading-none font-semibold text-[#059669] sm:text-[26px] sm:leading-none sm:font-medium sm:text-[#0b8a5c]">
                {k.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function CourierTable() {
  const [tab, setTab] = useState(courierTabs[0].label);
  const active = courierTabs.find((t) => t.label === tab)!;

  return (
    <Card className="rounded-2xl sm:rounded-xl">
      <div className="border-ed-line flex items-center justify-between gap-3 border-b px-6 py-4">
        <h2 className={cardTitle}>Courier Table</h2>
        <CircleHelp className="text-ed-muted size-4 shrink-0" aria-label="Help" />
      </div>

      <div className="space-y-4 p-3 sm:p-6 sm:pt-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          {courierTabs.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setTab(t.label)}
              className={cn(
                'h-10 rounded-lg border px-4 text-sm font-medium transition-colors max-sm:w-full',
                t.label === tab
                  ? 'bg-ed-brand border-ed-brand text-white'
                  : 'border-ed-line bg-ed-bg/70 text-ed-text hover:border-ed-brand/30',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="border-ed-line text-ed-muted flex h-28 items-center justify-center rounded-xl border border-dashed px-4 text-center text-sm">
          {active.empty}
        </div>
      </div>
    </Card>
  );
}

export function Operations() {
  return (
    <>
      <ControlCenter />
      <CourierTable />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-2">
        <HourlyCombined until="11:00" />
      </div>
    </>
  );
}
