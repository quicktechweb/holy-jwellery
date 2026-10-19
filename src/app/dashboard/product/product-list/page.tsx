import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductsPage } from '@/components/products/ProductsPage';

export const metadata: Metadata = { title: 'Products' };

export default function Page() {
  return (
    <Suspense>
      <ProductsPage />
    </Suspense>
  );
}
