import type { Metadata } from 'next';
import { NewOrderForm } from '@/components/orders/NewOrderForm';

export const metadata: Metadata = { title: 'New Order' };

export default function NewOrderPage() {
  return <NewOrderForm />;
}
