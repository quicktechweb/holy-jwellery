import type { Metadata } from 'next';
import { FollowUpManagement } from '@/components/followups/FollowUpManagement';

export const metadata: Metadata = { title: 'Follow-up Management' };

export default function Page() {
  return <FollowUpManagement />;
}
