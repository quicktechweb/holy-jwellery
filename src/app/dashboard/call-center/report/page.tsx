import type { Metadata } from 'next';
import { CallCenterReport } from '@/components/callcenter/CallCenterReport';

export const metadata: Metadata = { title: 'Call Center Report' };

export default function CallCenterReportPage() {
  return <CallCenterReport />;
}
