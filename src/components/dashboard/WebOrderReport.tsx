'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { dateOptions } from '@/config/dashboard';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { DonutChart } from './charts';
import { Dropdown } from './Dropdown';

const tabs = {
  'Web Orders': [{ label: 'Processing', value: 1, color: '#4f46e5' }],
  'Incomplete Orders': [],
} as const;
type Tab = keyof typeof tabs;

export function WebOrderReport({ showDate = true }: { showDate?: boolean }) {
  const [tab, setTab] = useState<Tab>('Web Orders');
  const segments = [...tabs[tab]];
  const total = segments.reduce((s, x) => s + x.value, 0);

  return (
    <Card className="rounded-2xl p-3 sm:rounded-xl sm:p-6">
      <div className="flex items-center justify-between gap-3 px-3 pt-3 sm:p-0">
        <h2 className="text-base font-semibold sm:text-[17px] sm:font-medium">
          Web Order Report
        </h2>
        {showDate && <Dropdown options={dateOptions} icon={<Calendar />} />}
      </div>

      <div className="border-ed-line bg-ed-bg/70 mt-4 flex border-b sm:mt-5">
        {(Object.keys(tabs) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              '-mb-px border-b-2 px-4 py-3 text-sm transition-colors',
              t === tab
                ? 'border-ed-brand text-ed-text sm:border-ed-text font-medium'
                : 'text-ed-muted hover:text-ed-text border-transparent',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center gap-6 px-1 py-10 sm:flex-row sm:gap-20 sm:py-12">
        <div className="text-center">
          <DonutChart segments={segments} className="mx-auto max-w-full" />
          <p className="mt-5 text-sm">Total Orders: {total}</p>
        </div>
        {segments.length > 0 && (
          <ul className="w-full space-y-2 text-xs sm:w-auto">
            {segments.map((s) => (
              <li key={s.label} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                {s.label}
                <span className="text-ed-muted">({s.value})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
