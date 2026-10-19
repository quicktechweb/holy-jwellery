'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { HourlyChart } from './charts';
import { Dropdown } from './Dropdown';

export function HourlyCombined({ until = '10:00' }: { until?: string }) {
  const [range, setRange] = useState<'Today' | 'Yesterday'>('Today');

  return (
    <Card className="rounded-2xl p-4 sm:rounded-xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold sm:text-[15px] sm:font-medium">
            Hourly Combined
          </h2>
          <p className="text-ed-muted mt-0.5 text-[11px]">
            2026-10-12 vs 2026-10-11 (Until {until})
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
          <Dropdown
            size="sm"
            options={['Combined', 'Web Orders', 'Approved']}
            align="left"
            className="max-sm:[&>button]:h-9 max-sm:[&>button]:px-3 max-sm:[&>button]:text-[13px]"
          />
          <div className="flex items-center gap-2">
            <div className="bg-ed-bg flex rounded-md p-0.5">
              {(['Today', 'Yesterday'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cn(
                    'rounded px-3 py-1.5 text-[10px] font-semibold transition-colors max-sm:py-2',
                    r === range ? 'bg-ed-brand text-white' : 'text-ed-muted',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="More"
              className="border-ed-line flex size-8 items-center justify-center rounded-lg border bg-white max-sm:size-9"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-ed-line -mx-4 mt-4 border-t px-4 pt-3 sm:mx-0 sm:px-0">
        <HourlyChart focus={range} />
      </div>
    </Card>
  );
}
