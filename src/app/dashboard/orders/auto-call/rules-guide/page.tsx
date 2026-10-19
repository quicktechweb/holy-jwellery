import type { Metadata } from 'next';
import { RulesGuide } from '@/components/autocall/RulesGuide';

export const metadata: Metadata = { title: 'Auto Call Rules Guide' };

export default function RulesGuidePage() {
  return <RulesGuide />;
}
