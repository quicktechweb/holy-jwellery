import type { Metadata } from 'next';
import { WorkInboxSettings } from '@/components/workinbox/WorkInboxSettings';

export const metadata: Metadata = { title: 'Work Inbox Settings' };

export default function WorkInboxSettingsPage() {
  return <WorkInboxSettings />;
}
