import type { Metadata } from 'next';
import { TikTokAds } from '@/components/ads/AdsPages';

export const metadata: Metadata = { title: 'TikTok Ads' };

export default function Page() {
  return <TikTokAds />;
}
