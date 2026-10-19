import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CourierManagement } from '@/components/courier/CourierManagement';

export const metadata: Metadata = { title: 'Courier Management' };

export default function Page() {
  return (
    <Suspense>
      <CourierManagement />
    </Suspense>
  );
}
