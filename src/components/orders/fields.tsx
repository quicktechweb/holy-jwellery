import type { ReactNode } from 'react';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const inputCls =
  'h-10 w-full rounded-lg border border-ed-line bg-[#f7f7fa] px-3 text-[14px] text-ed-text placeholder:text-ed-muted/70 outline-none transition focus:border-ed-brand/40 focus:bg-white focus:ring-2 focus:ring-ed-brand/10 disabled:cursor-not-allowed disabled:text-ed-muted/60';

export function Field({
  label,
  required,
  optional,
  right,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  right?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-2 flex min-h-5 items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[12.5px] font-medium text-ed-text">
          {label}
          {required && <span className="text-ed-red">*</span>}
          {optional && (
            <span className="rounded bg-ed-brand-soft/70 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-ed-muted uppercase">
              Optional
            </span>
          )}
        </span>
        {right}
      </div>
      {children}
      {error && <p className="text-ed-red mt-1 text-[11.5px]">{error}</p>}
    </div>
  );
}

export function SelectBox({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  variant = 'filled',
  invalid,
  'aria-label': ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  variant?: 'filled' | 'white';
  invalid?: boolean;
  'aria-label'?: string;
}) {
  const Icon = variant === 'white' ? ChevronsUpDown : ChevronDown;
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          inputCls,
          'appearance-none pr-9',
          variant === 'white' && 'bg-white px-4 text-[14.5px]',
          !value && 'text-ed-muted/70',
          invalid && 'border-ed-red/60',
        )}
      >
        {placeholder && (
          <option value="" disabled={variant === 'white'}>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
    </div>
  );
}
