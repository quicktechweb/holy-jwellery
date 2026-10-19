import type { Metadata } from 'next';
import { MyWork } from '@/components/workinbox/MyWork';

export const metadata: Metadata = { title: 'My Work' };

export default function MyWorkPage() {
  return <MyWork />;
}
