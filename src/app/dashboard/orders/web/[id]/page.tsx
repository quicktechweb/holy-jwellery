import type { Metadata } from 'next';
import { WebOrderDetails } from '@/components/orders/WebOrderDetails';

export const metadata: Metadata = { title: 'Web Order Details' };

export default async function WebOrderDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnUrl?: string; openBy?: string; queueStatus?: string }>;
}) {
  const { id } = await params;
  const { returnUrl, openBy, queueStatus } = await searchParams;
  return <WebOrderDetails id={id} returnUrl={returnUrl} autoQueue={openBy === 'autoOpen' ? queueStatus : undefined} />;
}
