import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn('size-8', className)}
    >
      <path
        d="M40 12H20a10 10 0 0 0 0 20h20"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M22 22h16" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
