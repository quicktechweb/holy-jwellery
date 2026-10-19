import type { Metadata } from 'next';
import { CallCenterSetup } from '@/components/callcenter/CallCenterSetup';

export const metadata: Metadata = { title: 'Call Center Setup' };

export default function CallCenterSetupPage() {
  return <CallCenterSetup />;
}
