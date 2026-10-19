import type { Metadata } from 'next';
import { FollowUpPerformance } from '@/components/followups/FollowUpPerformance';

export const metadata: Metadata = { title: 'Follow-up Performance' };

export default function Page() {
  return <FollowUpPerformance />;
}
