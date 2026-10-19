import type { Metadata } from 'next';
import { Suspense } from 'react';
import { WebOrderList } from '@/components/orders/WebOrderList';

export const metadata: Metadata = { title: 'Web Order List' };

export default function WebOrderListPage() {
  return (
    <Suspense>
      <WebOrderList />
    </Suspense>
  );
}
