import type { Metadata } from 'next';
import { PurchaseOrders } from '@/components/purchase/PurchaseOrders';

export const metadata: Metadata = { title: 'Purchase Order' };

export default function Page() {
  return <PurchaseOrders />;
}