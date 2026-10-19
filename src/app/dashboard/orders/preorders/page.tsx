import type { Metadata } from 'next';
import { Preorders } from '@/components/preorders/Preorders';

export const metadata: Metadata = { title: 'Preorders' };

export default function Page() {
  return <Preorders />;
}
