import type { Metadata } from 'next';
import { AdSpend } from '@/components/ads/AdSpend';

export const metadata: Metadata = { title: 'Ad Spend' };

export default function Page() {
  return <AdSpend />;
}
