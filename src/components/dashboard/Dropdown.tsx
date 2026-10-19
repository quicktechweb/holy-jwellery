'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownProps {
  options: string[];
  defaultValue?: string;
  icon?: ReactNode;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md';
  highlight?: boolean;
  pill?: boolean;
  chevron?: boolean;
  onChange?: (value: string) => void;
  align?: 'left' | 'right';
  className?: string;
  ariaLabel?: string;
}

const sizes = {
  xs: 'h-6 gap-1 rounded-md bg-ed-bg px-2 text-[10px] [&_svg]:size-3',
  sm: 'h-8 gap-1.5 rounded-lg bg-white px-2.5 text-xs [&_svg]:size-3.5',
  md: 'h-10 gap-2 rounded-lg bg-white px-3.5 text-sm shadow-sm [&_svg]:size-4',
};

export function Dropdown({
  options,
  defaultValue,
  icon,
  showLabel = true,
  size = 'md',
  highlight,
  pill,
  chevron = true,
  onChange,
  align = 'right',
  className,
  ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? options[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button
        type="button"
        aria-label={ariaLabel ?? value}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'text-ed-text hover:border-ed-brand/30 inline-flex items-center border font-medium whitespace-nowrap transition-colors',
          sizes[size],
          pill && 'rounded-full',
          highlight ? 'border-ed-brand/50' : 'border-ed-line',
        )}
      >
        {icon}
        {showLabel && <span>{value}</span>}
        {chevron && (
          <ChevronDown
            className={cn(
              'text-ed-muted transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        )}
      </button>

      {open && (
        <ul
          role="listbox"
          className={cn(
            'border-ed-line absolute top-full z-30 mt-1.5 min-w-36 rounded-lg border bg-white p-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                role="option"
                aria-selected={opt === value}
                onClick={() => {
                  setValue(opt);
                  onChange?.(opt);
                  setOpen(false);
                }}
                className="hover:bg-ed-bg flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-xs"
              >
                {opt}
                {opt === value && <Check className="text-ed-brand size-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
