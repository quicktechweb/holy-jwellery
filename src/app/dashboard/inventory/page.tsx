import type { Metadata } from 'next';
import { Suspense } from 'react';
import { InventoryDashboard } from '@/components/inventory/InventoryDashboard';

export const metadata: Metadata = { title: 'Inventory Dashboard' };

export default function Page() {
  return (
    <Suspense>
      <InventoryDashboard />
    </Suspense>
  );
}
