'use client';

import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, btnOut, btnPrimary } from './ui';

export interface Named { id: number; name: string }

export function NameDialog({ title, initial, label, onClose, onSave }: { title: string; initial: string; label: string; onClose: () => void; onSave: (name: string) => void }) {
  const [v, setV] = useState(initial);
  const submit = () => v.trim() && onSave(v.trim());
  return (
    <Dialog title={title} onClose={onClose} width="max-w-[460px]">
      <label className="mb-1.5 block text-[13px] font-medium">{label}</label>
      <input autoFocus value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} className="border-ed-line focus:border-ed-brand/40 h-10 w-full rounded-lg border bg-[#f7f6fa] px-3 text-[13.5px] outline-none" />
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onClose} className={btnOut}>Cancel</button>
        <button type="button" disabled={!v.trim()} onClick={submit} className={btnPrimary}>Save</button>
      </div>
    </Dialog>
  );
}

export function CategoriesBrands({ categories, brands, onSaveCategory, onSaveBrand }: {
  categories: Named[]; brands: Named[]; onSaveCategory: (id: number | null, name: string) => void; onSaveBrand: (id: number | null, name: string) => void;
}) {
  const [tab, setTab] = useState<'categories' | 'brands'>('categories');
  const [edit, setEdit] = useState<{ id: number | null; name: string } | null>(null);
  const isCat = tab === 'categories';
  const rows = isCat ? categories : brands;
  const word = isCat ? 'Category' : 'Brand';

  return (
    <div className="pt-12">
      <h2 className="text-[24px] font-medium tracking-tight">Categories &amp; Brands</h2>
      <div role="tablist" className="mt-5 grid max-w-[400px] grid-cols-2 rounded-lg bg-[#f3f1f7] p-1 text-[14px]">
        {(['categories', 'brands'] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setTab(k)} className={cn('h-10 rounded-md capitalize transition', tab === k ? 'bg-ed-brand font-medium text-white shadow' : 'text-ed-text/70')}>{k}</button>
        ))}
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div><h3 className="text-[18px] font-medium">Product {isCat ? 'Categories' : 'Brands'}</h3><p className="text-ed-text/70 mt-0.5 text-[13.5px]">Manage and organize your product {isCat ? 'categories' : 'brands'}</p></div>
        <button type="button" onClick={() => setEdit({ id: null, name: '' })} className={btnPrimary}><Plus className="size-4" /> Add {word}</button>
      </div>

      <div className="border-ed-line mt-4 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-left">
          <thead><tr className="border-ed-line border-b bg-[#faf9fc] text-[14px]"><th className="w-[100px] px-4 py-4 font-normal">ID</th><th className="font-normal">Name</th><th className="px-6 text-right font-normal">Actions</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={3} className="text-ed-muted py-14 text-center text-[13px]">No {word.toLowerCase()} yet. Click &quot;Add {word}&quot; to create one.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-ed-line border-b text-[14px] last:border-b-0">
                <td className="px-4 py-6">{r.id}</td><td>{r.name}</td>
                <td className="px-6 text-right"><button type="button" aria-label={`Edit ${r.name}`} onClick={() => setEdit({ id: r.id, name: r.name })} className="hover:text-ed-brand inline-flex"><Pencil className="size-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && <NameDialog title={`${edit.id === null ? 'Add' : 'Edit'} ${word}`} label={`${word} name`} initial={edit.name} onClose={() => setEdit(null)} onSave={(n) => { (isCat ? onSaveCategory : onSaveBrand)(edit.id, n); setEdit(null); }} />}
    </div>
  );
}
