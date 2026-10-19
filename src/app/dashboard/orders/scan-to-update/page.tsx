import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ScanToUpdate } from '@/components/scan/ScanToUpdate';

export const metadata: Metadata = { title: 'Scan to Update' };

export default function Page() {
  return (
    <Suspense>
      <ScanToUpdate />
    </Suspense>
  );
}
