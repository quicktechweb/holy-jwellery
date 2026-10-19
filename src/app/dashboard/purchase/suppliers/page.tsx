import type { Metadata } from 'next';
import { Suppliers } from '@/components/purchase/Suppliers';

export const metadata: Metadata = { title: 'Suppliers' };

export default function Page() {
  return <Suppliers />;
}
