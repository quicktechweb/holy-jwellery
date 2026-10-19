import type { Metadata } from 'next';
import { NewProductPage } from '@/components/products/NewProductPage';

export const metadata: Metadata = { title: 'Add Product' };

export default function Page() {
  return <NewProductPage />;
}
