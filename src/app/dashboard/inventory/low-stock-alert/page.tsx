import type { Metadata } from 'next';
import { LowStockAlerts } from '@/components/inventory/LowStockAlerts';

export const metadata: Metadata = { title: 'Low Stock Alerts' };

export default function Page() {
  return <LowStockAlerts />;
}
