import type { Metadata } from 'next';
import { AdProfit } from '@/components/ads/AdsPages';

export const metadata: Metadata = { title: 'Ad Profit Analysis' };

export default function Page() {
  return <AdProfit />;
}
