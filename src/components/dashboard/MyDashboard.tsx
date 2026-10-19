import { EarningReports } from './EarningReports';
import { HourlyCombined } from './HourlyCombined';
import { KpiCards } from './KpiCards';
import { OrderCounts } from './OrderCounts';
import { OrdersBySource } from './OrdersBySource';
import { TopSellingProducts } from './TopSellingProducts';
import { WebOrderReport } from './WebOrderReport';

export function MyDashboard() {
  return (
    <>
      <KpiCards />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-2">
        <WebOrderReport />
        <OrdersBySource />
      </div>

      <OrderCounts />
      <EarningReports />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-2">
        <HourlyCombined />
        <TopSellingProducts />
      </div>
    </>
  );
}
