import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AutoCallCenter } from '@/components/autocall/AutoCallCenter';

export const metadata: Metadata = { title: 'Auto Call Center' };

export default function AutoCallCenterPage() {
  return (
    <Suspense>
      <AutoCallCenter />
    </Suspense>
  );
}
