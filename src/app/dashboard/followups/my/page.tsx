import type { Metadata } from 'next';
import { MyFollowUps } from '@/components/followups/MyFollowUps';

export const metadata: Metadata = { title: 'My Follow-ups' };

export default function Page() {
  return <MyFollowUps />;
}
