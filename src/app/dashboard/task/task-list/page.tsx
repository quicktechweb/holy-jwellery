import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TaskHub } from '@/components/tasks/TaskHub';

export const metadata: Metadata = { title: 'Task Board' };

export default function Page() {
  return <Suspense><TaskHub /></Suspense>;
}
