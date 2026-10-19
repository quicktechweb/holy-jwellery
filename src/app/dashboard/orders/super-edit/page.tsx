import type { Metadata } from 'next';
import { SuperEdit } from '@/components/superedit/SuperEdit';

export const metadata: Metadata = { title: 'Super Edit' };

export default function Page() {
  return <SuperEdit />;
}
