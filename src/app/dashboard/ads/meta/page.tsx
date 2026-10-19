import type { Metadata } from 'next';
import { MetaAds } from '@/components/ads/AdsPages';

export const metadata: Metadata = { title: 'Meta Ads' };

export default function Page() {
  return <MetaAds />;
}
