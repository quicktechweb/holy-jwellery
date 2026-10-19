import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Comments } from '@/components/comments/Comments';

export const metadata: Metadata = { title: 'Comments' };

export default function CommentsPage() {
  return (
    <Suspense>
      <Comments />
    </Suspense>
  );
}
