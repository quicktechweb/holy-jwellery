import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-ed-line rounded-xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]',
        className,
      )}
      {...props}
    />
  );
}

export function EmptyState({
  title,
  description,
  icon,
  className,
}: {
  title?: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-ed-line flex flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center',
        className,
      )}
    >
      {icon && (
        <span className="bg-ed-bg text-ed-muted mb-4 flex size-11 items-center justify-center rounded-xl">
          {icon}
        </span>
      )}
      {title && <p className="text-sm font-semibold">{title}</p>}
      <p className={cn('text-ed-muted max-w-md text-xs', title && 'mt-1.5')}>
        {description}
      </p>
    </div>
  );
}
