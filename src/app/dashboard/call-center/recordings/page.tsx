import type { Metadata } from 'next';
import { CallRecordings } from '@/components/callcenter/CallRecordings';

export const metadata: Metadata = { title: 'Call Recordings' };

export default function CallRecordingsPage() {
  return <CallRecordings />;
}
