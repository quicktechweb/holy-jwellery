import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ApprovedOrderList } from '@/components/orders/ApprovedOrderList';

export const metadata: Metadata = { title: 'Order List' };

export default function ApprovedOrderListPage() {
  return (
    <Suspense>
      <ApprovedOrderList />
    </Suspense>
  );
}
