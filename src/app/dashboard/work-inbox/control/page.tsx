import type { Metadata } from 'next';
import { WorkControl } from '@/components/workinbox/WorkControl';

export const metadata: Metadata = { title: 'Work Control' };

export default function WorkControlPage() {
  return <WorkControl />;
}
