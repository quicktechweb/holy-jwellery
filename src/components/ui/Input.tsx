import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-sm font-medium text-white/80">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'focus:border-primary focus:ring-primary/30 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3.5 text-sm text-white transition-colors outline-none placeholder:text-white/30 focus:ring-2',
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = 'Input';
