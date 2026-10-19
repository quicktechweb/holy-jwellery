'use client';

import { useState } from 'react';
import { orderCounts } from '@/data/dashboard';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { BarChart } from './charts';
import { Dropdown } from './Dropdown';

const stats = [
  { key: 'Created', dot: 'bg-ed-blue', color: 'text-ed-blue' },
  { key: 'Sent to Courier', dot: 'bg-ed-green/40', color: 'text-ed-text' },
] as const;

export function OrderCounts({
  data = orderCounts,
  showRange = true,
}: {
  data?: { label: string; value: number }[];
  showRange?: boolean;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const [active, setActive] = useState<string>('Created');

  return (
    <Card className="overflow-hidden rounded-2xl sm:rounded-xl">
      <div className="flex flex-wrap items-stretch justify-between gap-x-4 sm:pl-6">
        <div className="relative w-full px-5 pt-5 pb-4 sm:w-auto sm:p-0 sm:py-6">
          <h2 className="text-base font-semibold sm:text-[17px] sm:font-medium">
            Order Counts
          </h2>
          <p className="text-ed-muted mt-2 max-w-[250px] text-sm sm:mt-3 sm:max-w-none">
            Orders created vs sent to courier in the selected range
          </p>
          {/* mobile: dropdown sits top-right of the header */}
          <div className={cn('absolute top-4 right-4 sm:hidden', !showRange && 'hidden')}>
            <Dropdown
              options={['Last 30 days', 'Last 7 days', 'Last 90 days']}
              className="[&_button]:text-[13px]"
            />
          </div>
        </div>

        <div className="flex w-full items-stretch gap-6 sm:w-auto">
          <div className={cn('self-start pt-6 max-sm:hidden', !showRange && 'hidden')}>
            <Dropdown
              options={['Last 30 days', 'Last 7 days', 'Last 90 days']}
              className="[&_button]:text-[13px]"
            />
          </div>
          <div className="flex w-full sm:w-auto">
            {stats.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setActive(s.key)}
                className={cn(
                  'flex flex-1 flex-col items-start justify-center border-t-2 px-4 py-3 text-left transition-colors max-sm:first:rounded-tl-xl sm:min-w-[140px] sm:flex-none sm:px-6 sm:py-4',
                  active === s.key
                    ? 'border-ed-blue bg-[#ebe8ef]'
                    : 'bg-ed-bg/60 border-transparent',
                )}
              >
                <span className="text-ed-muted flex items-center gap-1.5 text-xs">
                  <span className={cn('size-2 rounded-[2px]', s.dot)} />
                  {s.key}
                </span>
                <span
                  className={cn('mt-1 text-[26px] font-semibold sm:text-3xl', s.color)}
                >
                  {total}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 pb-5 sm:px-6 sm:pt-8 sm:pb-6">
        <BarChart data={data} />
      </div>
    </Card>
  );
}
