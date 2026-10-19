import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductReports } from '@/components/reports/ProductReports';

export const metadata: Metadata = { title: 'Product Reports' };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProductReports />
    </Suspense>
  );
}
