import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-3xl font-bold">404</h2>
      <p className="text-muted">This page could not be found.</p>
      <Link href="/">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
