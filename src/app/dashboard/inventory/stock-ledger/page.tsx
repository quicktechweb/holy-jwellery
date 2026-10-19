import type { Metadata } from 'next';
import { StockLedger } from '@/components/inventory/StockLedger';

export const metadata: Metadata = { title: 'Stock Ledger' };

export default function Page() {
  return <StockLedger />;
}
