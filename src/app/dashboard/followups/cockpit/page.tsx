import type { Metadata } from 'next';
import { AgentCockpit } from '@/components/followups/AgentCockpit';

export const metadata: Metadata = { title: 'Agent Cockpit' };

export default function Page() {
  return <AgentCockpit />;
}
