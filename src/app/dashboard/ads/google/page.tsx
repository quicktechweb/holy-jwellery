import type { Metadata } from 'next';
import { GoogleAds } from '@/components/ads/AdsPages';

export const metadata: Metadata = { title: 'Google Ads' };

export default function Page() {
  return <GoogleAds />;
}
