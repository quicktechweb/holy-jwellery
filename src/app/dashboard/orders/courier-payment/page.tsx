import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CourierPayment } from '@/components/courier/CourierPayment';

export const metadata: Metadata = { title: 'Update Courier Payment' };

export default function Page() {
  return (
    <Suspense>
      <CourierPayment />
    </Suspense>
  );
}
