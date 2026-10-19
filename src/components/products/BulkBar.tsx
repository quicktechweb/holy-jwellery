'use client';

import { Copy, ImagePlus, Pencil, Plus, Printer, Tag, Trash2, X } from 'lucide-react';

export type BulkAction = 'barcode' | 'update' | 'image' | 'tags' | 'copy' | 'variation' | 'delete';

const btn = 'border-ed-line hover:text-ed-brand flex h-10 items-center gap-2.5 rounded-lg border bg-white px-4 text-[13.5px] whitespace-nowrap shadow-sm transition';

export function BulkBar({ count, onClear, onAction }: { count: number; onClear: () => void; onAction: (a: BulkAction) => void }) {
  return (
    <div role="toolbar" aria-label="Bulk actions" className="border-ed-line sticky bottom-5 z-30 mx-auto mt-6 flex w-fit max-w-full flex-wrap items-center gap-x-3 gap-y-2.5 rounded-2xl border bg-white px-4 py-3.5 shadow-[0_14px_44px_rgba(30,20,50,0.2)]">
      <span className="bg-ed-brand flex size-9 items-center justify-center rounded-full text-[13px] font-medium text-white">{count}</span>
      <span className="text-ed-text/60 mr-1 text-[14px]">{count === 1 ? 'product' : 'products'} selected</span>
      <button type="button" onClick={onClear} className="text-ed-text/60 hover:text-ed-text mr-3 flex items-center gap-2 text-[14px]"><X className="size-3.5" /> Deselect All</button>
      <button type="button" onClick={() => onAction('barcode')} className={btn}><Printer className="size-4" /> Print Barcode</button>
      <button type="button" onClick={() => onAction('update')} className={btn}><Pencil className="size-4" /> Bulk Update</button>
      <button type="button" onClick={() => onAction('image')} className={btn}><ImagePlus className="size-4" /> Bulk Image Upload</button>
      <button type="button" onClick={() => onAction('tags')} className={btn}><Tag className="size-4" /> Manage Tags</button>
      <button type="button" onClick={() => onAction('copy')} className={btn}><Copy className="size-4" /> Copy to Business</button>
      <button type="button" onClick={() => onAction('variation')} className={btn}><Plus className="size-4" /> Add to Variation Group</button>
      <button type="button" onClick={() => onAction('delete')} className="flex h-10 items-center gap-2.5 rounded-lg bg-[#e5090f] px-4 text-[13.5px] font-medium whitespace-nowrap text-white shadow-sm transition hover:brightness-110"><Trash2 className="size-4" /> Delete ({count})</button>
    </div>
  );
}
