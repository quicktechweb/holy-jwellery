import type { Metadata } from 'next';
import { NewPurchase } from '@/components/purchase/NewPurchase';

export const metadata: Metadata = { title: 'New Purchase' };

export default function Page() {
  return <NewPurchase />;
}
