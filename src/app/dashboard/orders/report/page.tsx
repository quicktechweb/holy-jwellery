import type { Metadata } from 'next';
import { OrdersReport } from '@/components/orders/OrdersReport';

export const metadata: Metadata = { title: 'Orders Report' };

export default function OrdersReportPage() {
  return <OrdersReport />;
}
