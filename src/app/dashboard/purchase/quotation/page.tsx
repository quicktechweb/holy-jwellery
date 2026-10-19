import type { Metadata } from 'next';
import { Quotations } from '@/components/purchase/Quotations';

export const metadata: Metadata = { title: 'Ask for Quotation' };

export default function Page() {
  return <Quotations />;
}
