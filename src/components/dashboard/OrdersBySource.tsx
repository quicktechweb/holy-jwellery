'use client';

import { useState } from 'react';
import { Calendar, Filter, Inbox } from 'lucide-react';
import { dateOptions, statusOptions } from '@/config/dashboard';
import { cn } from '@/lib/utils';
import { Card, EmptyState } from './Card';
import { Dropdown } from './Dropdown';

function Segmented({ options }: { options: string[] }) {
  const [value, setValue] = useState(options[0]);
  return (
    <div className="sm:bg-ed-bg flex rounded-lg sm:p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => setValue(o)}
          className={cn(
            'rounded-md px-2.5 py-1.5 text-xs transition-colors sm:px-3',
            o === value
              ? 'bg-ed-brand-soft text-ed-brand font-medium'
              : 'text-ed-text/80',
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function OrdersBySource({ showDate = true }: { showDate?: boolean }) {
  return (
    <Card className="rounded-2xl p-3 sm:rounded-xl sm:p-6">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3 px-3 pt-3 sm:justify-end sm:p-0">
        <h2 className="order-1 text-base font-semibold sm:mr-auto sm:text-[17px] sm:font-medium">
          Orders by Source
        </h2>
        {showDate && (
          <div className="order-2 ml-auto sm:order-4 sm:ml-0">
            <Dropdown options={dateOptions} icon={<Calendar />} />
          </div>
        )}
        <div className="order-3 basis-full sm:order-2 sm:basis-auto">
          <div className="border-ed-line flex w-fit items-center gap-1 rounded-xl border bg-white p-1 shadow-sm sm:gap-2 sm:pl-3">
            <span className="text-ed-muted text-[9px] font-semibold tracking-[0.15em] max-sm:hidden">
              VIEW
            </span>
            <Segmented options={['Source', 'Channel']} />
            <Segmented options={['Chart', 'Table']} />
          </div>
        </div>
        <div className="order-4 basis-full sm:order-3 sm:basis-auto">
          <Dropdown options={statusOptions} icon={<Filter />} align="left" />
        </div>
      </div>

      <EmptyState
        className="mt-4 h-72 sm:mt-6"
        icon={<Inbox className="size-5" />}
        title="No source data in this period"
        description="The selected date range and status filter have no source breakdown to chart."
      />
    </Card>
  );
}
