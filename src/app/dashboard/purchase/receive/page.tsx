import type { Metadata } from 'next';
import { PurchaseReceive } from '@/components/purchase/PurchaseReceive';

export const metadata: Metadata = { title: 'Purchase Receive' };

export default function Page() {
  return <PurchaseReceive />;
}
