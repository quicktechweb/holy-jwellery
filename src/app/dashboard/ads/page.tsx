import type { Metadata } from 'next';
import { AdsDashboard } from '@/components/ads/AdsDashboard';

export const metadata: Metadata = { title: 'AI Ads Dashboard' };

export default function Page() {
  return <AdsDashboard />;
}
