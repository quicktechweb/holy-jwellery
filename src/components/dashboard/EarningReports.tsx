import { Calendar, Filter } from 'lucide-react';
import { statusOptions } from '@/config/dashboard';
import { Card } from './Card';
import { Dropdown } from './Dropdown';

export function EarningReports() {
  return (
    <Card className="rounded-2xl sm:rounded-xl">
      <div className="border-ed-line flex flex-col items-start gap-3 border-b px-6 pt-5 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <h2 className="text-base font-semibold sm:text-[17px] sm:font-medium">
          Earning Reports
        </h2>
        <div className="flex items-center gap-2">
          <Dropdown size="sm" options={statusOptions} icon={<Filter />} />
          <Dropdown
            size="sm"
            options={['Year', 'Month', 'Week']}
            icon={<Calendar />}
            highlight
          />
        </div>
      </div>

      <div className="p-3 sm:p-5">
        <div className="border-ed-line flex flex-col items-center justify-center gap-5 rounded-xl border border-dashed px-5 py-8 text-center sm:px-6 sm:py-10">
          <p className="text-ed-muted text-xs">
            This report is loaded only when you ask for it. Pick a date range above, then
            load it.
          </p>
          <button
            type="button"
            className="bg-ed-brand rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#531b6e]"
          >
            Load Earning Reports
          </button>
        </div>
      </div>
    </Card>
  );
}
