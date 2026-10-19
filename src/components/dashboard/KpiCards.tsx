import { ArrowDownRight, Calendar, Filter } from 'lucide-react';
import { dateOptions, statusOptions } from '@/config/dashboard';
import { kpis } from '@/data/dashboard';
import { Card } from './Card';
import { Dropdown } from './Dropdown';

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {kpis.map((k) => (
        <Card key={k.title} className="rounded-2xl p-4 sm:rounded-xl">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-ed-muted sm:text-ed-text/80 text-sm sm:text-[15px]">
              {k.title}
            </h3>
            <div className="flex items-center gap-1.5">
              {k.hasFilter && (
                <Dropdown
                  size="sm"
                  pill
                  showLabel={false}
                  options={statusOptions}
                  icon={<Filter />}
                  ariaLabel="Filter"
                  className="[&>button]:bg-ed-bg [&>button]:px-2.5 max-sm:[&>button]:h-7 sm:[&>button]:h-6"
                />
              )}
              <Dropdown
                size="xs"
                pill
                options={dateOptions}
                icon={<Calendar />}
                className="max-sm:[&>button]:h-7 max-sm:[&>button]:px-2.5 max-sm:[&>button]:text-xs"
              />
            </div>
          </div>

          <p className="mt-2 text-[26px] leading-tight font-semibold">
            <span className="decoration-ed-muted/60 underline decoration-dotted underline-offset-[6px]">
              {k.value}
            </span>
          </p>

          {'delta' in k && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-ed-red flex items-center gap-1 font-medium">
                <ArrowDownRight className="size-3.5" />
                {k.delta}
              </span>
              <span className="text-ed-muted">Previous {k.previous}</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
