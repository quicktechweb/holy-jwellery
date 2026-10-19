import { OrderCounts } from './OrderCounts';
import { OrderFunnel } from './OrderFunnel';
import { OrdersBySource } from './OrdersBySource';
import { OverviewKpis } from './OverviewKpis';
import { ProfitAnalytics } from './ProfitAnalytics';
import { WebOrderReport } from './WebOrderReport';
import { orderCountsToday } from '@/data/dashboard';

export function Overview() {
  return (
    <>
      <OverviewKpis />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[5fr_7fr]">
        <OrderFunnel />
        <ProfitAnalytics />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-2">
        <WebOrderReport showDate={false} />
        <OrdersBySource showDate={false} />
      </div>

      <OrderCounts data={orderCountsToday} showRange={false} />
    </>
  );
}
