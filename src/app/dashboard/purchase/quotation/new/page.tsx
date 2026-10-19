import type { Metadata } from 'next';
import { NewQuotation } from '@/components/purchase/NewQuotation';

export const metadata: Metadata = { title: 'New Quotation Request' };

export default function Page() {
  return <NewQuotation />;
}
