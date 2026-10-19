import type { Metadata } from 'next';
import { SupplierLedger } from '@/components/purchase/PurchasePages';

export const metadata: Metadata = { title: 'Supplier Ledger' };

export default function Page() {
  return <SupplierLedger />;
}
