'use client';

import { Check, ChevronDown, ChevronsUpDown, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export const FOLLOWUP_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type FollowUpPriority = (typeof FOLLOWUP_PRIORITIES)[number];

export const OWNER_SCOPES = ['Only customers without an owner', 'All linked customers (replace existing owner)'] as const;
export type OwnerScope = (typeof OWNER_SCOPES)[number];

export interface AssignFollowUpsPayload {
  employee: string;
  priority: FollowUpPriority;
  note: string;
  relationshipOwner: boolean;
  ownerScope: OwnerScope;
}

interface Props {
  /** kotogulo follow-up assign hocche (selected rows) */
  count: number;
  /** TODO: API (employee list). Assigned Employee Profile er shathe same list */
  employees: string[];
  onClose: () => void;
  onSubmit: (p: AssignFollowUpsPayload) => void;
  /** default: "These Approved Orders will be added to the order follow-up queue." */
  description?: string;
}

const PLUM = '#4a1d66';
const field = 'border-[#e3e1ea] bg-white text-[13.5px] outline-none';

/** Select-er moto dropdown: trigger + check mark wala popover */
function Pick<T extends string>({ value, placeholder, options, onChange, label, icon: Icon = ChevronDown, strong, upper }: {
  value: T | ''; placeholder?: string; options: readonly T[]; onChange: (v: T) => void; label: string;
  icon?: typeof ChevronDown; strong?: boolean; upper?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key, true);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key, true); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label={label} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        style={{ outline: 'none' }}
        className={cn(field, 'flex h-10 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left transition focus-visible:border-[#4a1d66] focus-visible:ring-2 focus-visible:ring-[#4a1d66]/20', open && 'border-[#4a1d66] ring-2 ring-[#4a1d66]/20')}>
        <span className={cn('truncate', strong && 'font-semibold', upper && 'uppercase', !value && 'font-semibold text-[#1b1b2f]')}>{value || placeholder}</span>
        <Icon className="size-4 shrink-0 text-[#6b6b80]" />
      </button>
      {open && (
        <ul role="listbox" className="absolute top-full right-0 left-0 z-30 mt-1 rounded-lg border border-[#e3e1ea] bg-white p-1 shadow-[0_12px_32px_rgba(30,20,50,0.16)]">
          {options.map((o) => (
            <li key={o}>
              <button type="button" role="option" aria-selected={o === value} onClick={() => { onChange(o); setOpen(false); }}
                className={cn('flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-[#f4eef8]', o === value && 'bg-[#f4eef8]')}>
                <span className="flex size-4 items-center justify-center">{o === value && <Check className="size-3.5" style={{ color: PLUM }} />}</span>
                <span className={upper ? 'uppercase' : undefined}>{o}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AssignFollowUpsModal({ count, employees, onClose, onSubmit, description = 'These Approved Orders will be added to the order follow-up queue.' }: Props) {
  const [employee, setEmployee] = useState('');
  const [priority, setPriority] = useState<FollowUpPriority>('MEDIUM');
  const [note, setNote] = useState('');
  const [owner, setOwner] = useState(true);
  const [scope, setScope] = useState<OwnerScope>(OWNER_SCOPES[0]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const submit = () => { if (employee) onSubmit({ employee, priority, note: note.trim(), relationshipOwner: owner, ownerScope: scope }); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="assign-fu-title" className="relative max-h-[calc(100vh-2rem)] w-full max-w-[512px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <button type="button" aria-label="Close" onClick={onClose} className="absolute top-5 right-5 text-[#1b1b2f]/80 hover:text-[#1b1b2f]"><X className="size-4" /></button>

        <h2 id="assign-fu-title" className="text-[18px] leading-tight font-semibold tracking-tight text-[#1b1b2f]">Assign {count} follow-ups</h2>
        <p className="mt-1 text-[13px] text-[#55556a]">{description}</p>

        <div className="mt-8 space-y-5">
          <div>
            <span className="mb-2 block text-[14px] font-medium text-[#1b1b2f]">Assigned employee</span>
            <Pick label="Assigned employee" value={employee} placeholder="Select employee" options={employees} onChange={setEmployee} icon={ChevronsUpDown} />
          </div>

          <div>
            <span className="mb-2 block text-[14px] font-medium text-[#1b1b2f]">Priority</span>
            <Pick label="Priority" value={priority} options={FOLLOWUP_PRIORITIES} onChange={setPriority} />
          </div>

          <label className="block">
            <span className="mb-2 block text-[14px] font-medium text-[#1b1b2f]">Note (optional)</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Assignment note" style={{ outline: 'none' }}
              className={cn(field, 'block h-20 w-full resize-y rounded-lg border px-3 py-2.5 placeholder:text-[#8a8a9c] focus:border-[#4a1d66] focus:ring-2 focus:ring-[#4a1d66]/20')} />
          </label>

          <div className="rounded-lg border border-[#e3e1ea] p-3.5">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={owner} onChange={(e) => setOwner(e.target.checked)} className="peer sr-only" />
              <span aria-hidden className={cn('mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#4a1d66]/30', owner ? 'border-[#4a1d66] bg-[#4a1d66] text-white' : 'border-[#9a97a8] bg-white')}>
                {owner && <Check className="size-3" strokeWidth={3.5} />}
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] leading-tight font-medium text-[#1b1b2f]">Set as Relationship Owner</span>
                <span className="mt-1.5 block text-[11.5px] leading-[16px] text-[#6b6b80]">Give this employee long-term nurturing responsibility for the linked Customer Profiles.</span>
              </span>
            </label>
            {owner && (
              <div className="mt-3 pl-7">
                <Pick label="Relationship owner scope" value={scope} options={OWNER_SCOPES} onChange={setScope} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-[#e3e1ea] bg-white px-4 text-[13.5px] font-medium text-[#1b1b2f] shadow-[0_1px_2px_rgba(30,20,50,0.05)] transition hover:bg-[#f7f6fa]">Cancel</button>
          <button type="button" onClick={submit} disabled={!employee} className="h-10 rounded-lg px-4 text-[13.5px] font-semibold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: PLUM }}>Assign Follow-ups</button>
        </div>
      </div>
    </div>
  );
}
