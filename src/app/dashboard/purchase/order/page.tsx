import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PurchaseList } from '@/components/purchase/PurchasePages';

export const metadata: Metadata = { title: 'Purchase Order' };

export default function Page() {
  return <Suspense><PurchaseList mode="order" /></Suspense>;
}
