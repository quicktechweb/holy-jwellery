import type { Metadata } from 'next';
import { PurchaseOrders } from '@/components/purchase/PurchaseOrders';

export const metadata: Metadata = { title: 'Purchase Orders' };

export default function Page() {
  return <PurchaseOrders />;
}
