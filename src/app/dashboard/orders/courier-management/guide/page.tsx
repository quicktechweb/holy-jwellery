import type { Metadata } from 'next';
import { GuideView } from '@/components/courier/GuideView';

export const metadata: Metadata = { title: 'Courier Management Guide' };

export default function Page() {
  return <GuideView />;
}
