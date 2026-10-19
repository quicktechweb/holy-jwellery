import { Calendar, Filter } from 'lucide-react';
import { dateOptions, statusOptions } from '@/config/dashboard';
import { Card } from './Card';
import { Dropdown } from './Dropdown';

export function TopSellingProducts() {
  return (
    <Card className="rounded-2xl p-4 sm:rounded-xl">
      <div className="flex items-start justify-between gap-3 sm:flex-wrap sm:items-center">
        <div className="flex flex-col items-start gap-3 sm:block">
          <h2 className="text-[17px] font-semibold sm:text-[15px] sm:font-medium">
            Top Selling Products
          </h2>
          <Dropdown
            size="xs"
            pill
            chevron={false}
            align="left"
            options={['Top 0', 'Top 5', 'Top 10']}
            className="sm:hidden"
          />
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <Dropdown
            size="xs"
            options={['Top 0', 'Top 5', 'Top 10']}
            className="max-sm:hidden"
          />
          <Dropdown size="sm" options={statusOptions} icon={<Filter />} />
          <Dropdown size="sm" options={dateOptions} icon={<Calendar />} />
        </div>
      </div>

      <div className="border-ed-line mt-4 border-t pt-3">
        <div className="border-ed-line flex h-24 items-center justify-center rounded-xl border border-dashed">
          <p className="text-ed-blue text-xs">No selling products for this range</p>
        </div>
      </div>
    </Card>
  );
}
