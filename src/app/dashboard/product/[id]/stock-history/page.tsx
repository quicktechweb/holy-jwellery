import type { Metadata } from 'next';
import { StockHistory } from '@/components/inventory/StockHistory';

export const metadata: Metadata = { title: 'Stock History' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StockHistory id={id} />;
}
