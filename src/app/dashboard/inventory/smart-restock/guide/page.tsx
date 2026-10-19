import type { Metadata } from 'next';
import { SmartRestockGuide } from '@/components/inventory/SmartRestockGuide';

export const metadata: Metadata = { title: 'Smart Restock Guide' };

export default function Page() {
  return <SmartRestockGuide />;
}
