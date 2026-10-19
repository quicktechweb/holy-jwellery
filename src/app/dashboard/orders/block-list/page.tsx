import type { Metadata } from 'next';
import { OrderBlockList } from '@/components/blocklist/OrderBlockList';

export const metadata: Metadata = { title: 'Order Block List' };

export default function OrderBlockListPage() {
  return <OrderBlockList />;
}
