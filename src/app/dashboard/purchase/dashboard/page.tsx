import type { Metadata } from 'next';
import { PurchaseDashboard } from '@/components/purchase/PurchaseDashboard';

export const metadata: Metadata = { title: 'Purchase Dashboard' };

export default function Page() {
  return <PurchaseDashboard />;
}
