'use client';

import { useState } from 'react';
import type { Product } from '@/data/products';
import { activeProductTags } from '@/data/products';
import { cn } from '@/lib/utils';
import { Dialog, btnOut } from './ui';

export function ProductTagsModal({ products, onClose, onApply }: { products: Product[]; onClose: () => void; onApply: (mode: 'add' | 'remove', tags: string[]) => void }) {
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [pick, setPick] = useState<string[]>([]);
  const pool = mode === 'add' ? activeProductTags.filter((t) => !products.every((p) => p.tags.includes(t))) : Array.from(new Set(products.flatMap((p) => p.tags)));
  const toggle = (t: string) => setPick((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  const apply = () => onApply(mode, pick);

  return (
    <Dialog title="Manage Product Tags" desc="Apply tags from your business or remove tags your business already assigned. Foreign tags remain visible in the list but are read-only here." onClose={onClose}>
      <p className="border-ed-line rounded-lg border bg-[#f7f6fa] px-3.5 py-3.5 text-[13.5px]">{products.length === 1 ? products[0].name : `${products.length} products selected`}</p>
      <div className="mt-4 grid grid-cols-2 rounded-lg bg-[#f3f1f7] p-0.5 text-[13.5px] font-medium">
        {(['add', 'remove'] as const).map((m) => (
          <button key={m} type="button" onClick={() => { setMode(m); setPick([]); }} className={cn('h-10 rounded-md transition', mode === m ? 'bg-ed-brand text-white shadow' : 'text-ed-text/70')}>{m === 'add' ? 'Add Tags' : 'Remove Tags'}</button>
        ))}
      </div>
      <div className="border-ed-line mt-4 rounded-xl border bg-white p-3">
        {pool.length === 0 ? (
          <div className="border-ed-line text-ed-text/70 flex h-[100px] items-center justify-center rounded-lg border border-dashed text-[13px]">
            {mode === 'add' ? 'No active tags available. Create a tag first.' : 'The selected products have no tags to remove.'}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">{pool.map((t) => (
            <button key={t} type="button" onClick={() => toggle(t)} className={cn('rounded-full border px-3 py-1 text-[12.5px]', pick.includes(t) ? 'bg-ed-brand border-ed-brand text-white' : 'border-ed-line hover:text-ed-brand')}>{t}</button>
          ))}</div>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <button type="button" onClick={onClose} className={cn(btnOut, 'font-medium')}>Close</button>
        <button type="button" disabled={pick.length === 0} onClick={apply} className="bg-ed-brand h-10 rounded-lg px-5 text-[13.5px] font-medium text-white transition enabled:hover:brightness-110 disabled:opacity-50">Apply Tags</button>
      </div>
    </Dialog>
  );
}
