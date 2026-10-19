import type { Metadata } from 'next';
import { AutoOrderDashboard } from '@/components/orders/AutoOrderDashboard';

export const metadata: Metadata = { title: 'Auto Order Dashboard' };

export default function AutoOrderPage() {
  return <AutoOrderDashboard />;
}
