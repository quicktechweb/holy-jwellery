'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BarChart3, Check, ChevronsUpDown, Columns3, Copy, Filter, History, Minus, Package, Plus, Search, SlidersHorizontal, SquarePen, Tag, Trash2, ArrowUpDown } from 'lucide-react';
import { money, type Product } from '@/data/products';
import { Popover } from '@/components/courier/ui';
import { cn } from '@/lib/utils';
import { Switch, Tick } from './ui';

type SortKey = 'code' | 'name' | 'cost' | 'qty' | 'price';
const sortVal = (p: Product, k: SortKey) => ({ code: p.code.toLowerCase(), name: p.name.toLowerCase(), cost: p.costPrice, qty: p.qty, price: p.sellPrice })[k];
const sortOpts: { label: string; key: SortKey; dir: 1 | -1 }[] = [
  { label: 'Code A → Z', key: 'code', dir: 1 }, { label: 'Code Z → A', key: 'code', dir: -1 },
  { label: 'Name A → Z', key: 'name', dir: 1 }, { label: 'Name Z → A', key: 'name', dir: -1 },
  { label: 'Price low → high', key: 'price', dir: 1 }, { label: 'Price high → low', key: 'price', dir: -1 },
  { label: 'Stock low → high', key: 'qty', dir: 1 }, { label: 'Stock high → low', key: 'qty', dir: -1 },
];
const cols = ['Code', 'Product', 'Manage Stock', 'Cost Price', 'Stock Qty', 'Selling Price', 'Active'] as const;
type Col = (typeof cols)[number];
type Pop = { kind: 'filter' | 'sort' | 'columns' | 'density' | 'row'; rect: DOMRect; id?: string };

const toolBtn = 'border-ed-line hover:text-ed-brand flex h-9 items-center gap-2 rounded-lg border bg-white px-3 text-[13px] shadow-sm';

export interface TableActions {
  onPatch: (id: string, patch: Partial<Product>) => void;
  onEdit: (p: Product) => void; onDuplicate: (p: Product) => void; onDelete: (p: Product) => void; onTags: (p: Product) => void;
  flash: (m: string) => void;
}

export function ProductTable({ products, categories, actions, emptyText, sel, setSel }: { products: Product[]; categories: string[]; actions: TableActions; emptyText?: string; sel: Set<string>; setSel: React.Dispatch<React.SetStateAction<Set<string>>> }) {
  const [q, setQ] = useState('');
  const [stockF, setStockF] = useState<'All' | 'ON' | 'OFF'>('All');
  const [catF, setCatF] = useState('All');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null);
  const [hidden, setHidden] = useState<Set<Col>>(new Set());
  const [compact, setCompact] = useState(false);
  const [pop, setPop] = useState<Pop | null>(null);
  const show = (c: Col) => !hidden.has(c);
  const open = (kind: Pop['kind'], e: React.MouseEvent, id?: string) => setPop({ kind, rect: e.currentTarget.getBoundingClientRect(), id });

  const rows = useMemo(() => {
    const k = q.trim().toLowerCase();
    const list = products.filter((p) => (!k || `${p.code} ${p.name}`.toLowerCase().includes(k)) && (stockF === 'All' || (stockF === 'ON') === p.manageStock) && (catF === 'All' || p.category === catF));
    if (sort) list.sort((a, b) => { const x = sortVal(a, sort.key), y = sortVal(b, sort.key); return (x < y ? -1 : x > y ? 1 : 0) * sort.dir; });
    return list;
  }, [products, q, stockF, catF, sort]);
  const allOn = rows.length > 0 && rows.every((r) => sel.has(r.id));
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const headSort = (k: SortKey) => setSort((s) => (s?.key === k ? (s.dir === 1 ? { key: k, dir: -1 } : null) : { key: k, dir: 1 }));
  const rowProduct = pop?.id ? products.find((p) => p.id === pop.id) : undefined;
  const filtersOn = stockF !== 'All' || catF !== 'All';
  const rowPad = compact ? '[&>td]:py-2' : '[&>td]:py-4';

  const Th = ({ c, k, className }: { c: Col; k?: SortKey; className?: string }) => show(c) ? (
    <th className={cn('px-3 font-normal', className)}>
      {k ? <button type="button" onClick={() => headSort(k)} className="hover:text-ed-brand inline-flex items-center gap-2.5">{c}<ChevronsUpDown className={cn('size-3', sort?.key === k && 'text-ed-brand')} /></button> : c}
    </th>
  ) : null;

  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <div className="relative w-[256px] max-w-full"><Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products by SKU or name" className="border-ed-line focus:border-ed-brand/40 h-9 w-full rounded-lg border bg-white pl-9 text-[13px] outline-none" /></div>
        <button type="button" onClick={(e) => open('filter', e)} className={cn(toolBtn, 'font-medium', filtersOn && 'border-ed-brand/40 text-ed-brand')}><Filter className="size-3.5" /> Filter{filtersOn && <i className="bg-ed-brand size-1.5 rounded-full" />}</button>
        <div className="ml-auto flex items-center gap-2.5">
          <button type="button" aria-label="Row density" onClick={(e) => open('density', e)} className={cn(toolBtn, 'w-9 justify-center px-0')}><SlidersHorizontal className="size-3.5" /></button>
          <button type="button" onClick={(e) => open('sort', e)} className={toolBtn}><ArrowUpDown className="size-3.5" /> Sort</button>
          <button type="button" onClick={(e) => open('columns', e)} className={toolBtn}><Columns3 className="size-3.5" /> Columns</button>
        </div>
      </div>
      <div className="border-ed-line mt-4 border-t" />

      <div className="border-ed-line mt-4 overflow-x-auto rounded-xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
        <table className="w-full min-w-[1120px] text-left">
          <thead>
            <tr className="text-ed-text/65 border-ed-line border-b bg-[#fcfbfd] text-[12.5px]">
              <th className="w-14 px-5 py-4"><Tick label="Select all" checked={allOn} onChange={() => setSel(allOn ? new Set() : new Set(rows.map((r) => r.id)))} /></th>
              <Th c="Code" k="code" className="w-[190px]" /><Th c="Product" k="name" />
              <Th c="Manage Stock" className="text-center" /><Th c="Cost Price" k="cost" /><Th c="Stock Qty" k="qty" className="text-center" /><Th c="Selling Price" k="price" />
              <Th c="Active" className="text-center" /><th className="px-3 text-center font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={9} className="text-ed-muted py-16 text-center text-[13px]"><Package className="mx-auto mb-2 size-5" />{emptyText ?? 'No products found.'}</td></tr>}
            {rows.map((p) => (
              <tr key={p.id} className={cn('border-ed-line border-b text-[14px] transition-colors last:border-b-0', rowPad, sel.has(p.id) ? 'bg-[#f1eff5]' : 'hover:bg-[#faf9fc]')}>
                <td className="w-14 px-5"><Tick label={`Select ${p.code}`} checked={sel.has(p.id)} onChange={() => toggle(p.id)} /></td>
                {show('Code') && <td className="px-3">{p.code}</td>}
                {show('Product') && (
                  <td className="px-3"><div className="flex items-center gap-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <span className="block size-10 shrink-0 overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5" style={p.images[0]?.src ? undefined : { background: p.images[0]?.bg ?? '#e9e6ee' }}>{p.images[0]?.src && <img src={p.images[0].src} alt="" className="size-full object-cover" />}</span>
                    <div className="min-w-0"><p className="max-w-[270px] truncate text-[14px]" title={p.name}>{p.name}</p>{p.category && <p className="text-ed-muted text-[12.5px]">{p.category}</p>}</div>
                  </div></td>
                )}
                {show('Manage Stock') && <td className="px-3 text-center"><span className={cn('inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium', p.manageStock ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-orange-200 bg-orange-50 text-orange-600')}>{p.manageStock ? 'ON' : 'OFF'}</span></td>}
                {show('Cost Price') && <td className="px-3">{money(p.costPrice)}</td>}
                {show('Stock Qty') && (
                  <td className="px-3"><div className="mx-auto flex w-[116px] items-center justify-between rounded-lg bg-[#f3f1f7] p-1">
                    <button type="button" aria-label="Decrease stock" onClick={() => actions.onPatch(p.id, { qty: p.qty - 1 })} className="flex size-7 items-center justify-center rounded-md bg-[#fde8ea] text-rose-500 hover:brightness-95"><Minus className="size-3.5" /></button>
                    <span className={cn('text-[13.5px] tabular-nums', p.qty <= 0 ? 'text-rose-600' : 'text-ed-text')}>{p.qty}</span>
                    <button type="button" aria-label="Increase stock" onClick={() => actions.onPatch(p.id, { qty: p.qty + 1 })} className="flex size-7 items-center justify-center rounded-md bg-[#dff7ea] text-emerald-600 hover:brightness-95"><Plus className="size-3.5" /></button>
                  </div></td>
                )}
                {show('Selling Price') && <td className="px-3">{money(p.sellPrice)}</td>}
                {show('Active') && <td className="px-3 text-center"><span className="inline-flex"><Switch on={p.active} onChange={(v) => { actions.onPatch(p.id, { active: v }); actions.flash(v ? 'Product activated' : 'Product moved to Inactive Products'); }} label={`Active ${p.code}`} /></span></td>}
                <td className="px-3 text-center"><button type="button" aria-label="Actions" onClick={(e) => open('row', e, p.id)} className="hover:text-ed-brand inline-flex h-8 w-8 items-center justify-center rounded-lg tracking-widest">•••</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pop?.kind === 'row' && rowProduct && (
        <Popover anchor={pop.rect} width={160} onClose={() => setPop(null)}>
          <p className="border-ed-line border-b px-3.5 py-2.5 text-[13px] font-medium">Actions</p>
          <div className="p-1.5 text-[13px]">
            {([
              [SquarePen, 'Edit', () => actions.onEdit(rowProduct)], [Copy, 'Duplicate', () => actions.onDuplicate(rowProduct)],
              [History, 'Edit History', () => actions.flash('No edit history recorded for this product yet')], [Tag, 'Tags', () => actions.onTags(rowProduct)],
            ] as const).map(([I, l, fn]) => <button key={l} type="button" onClick={() => { setPop(null); fn(); }} className="hover:bg-ed-bg flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-left"><I className="size-3.5" />{l}</button>)}
            <Link href={`/dashboard/product/${rowProduct.id}/stock-history`} className="hover:bg-ed-bg flex h-8 w-full items-center gap-2.5 rounded-md px-2"><BarChart3 className="size-3.5" />Stock History</Link>
            <button type="button" onClick={() => { setPop(null); actions.flash('Product report is not available yet'); }} className="hover:bg-ed-bg flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-left"><BarChart3 className="size-3.5" />Product Report</button>
            <div className="bg-ed-line my-1 h-px" />
            <button type="button" onClick={() => { setPop(null); actions.onDelete(rowProduct); }} className="flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-left text-rose-600 hover:bg-rose-50"><Trash2 className="size-3.5" />Delete</button>
          </div>
        </Popover>
      )}
      {pop?.kind === 'sort' && (
        <Popover anchor={pop.rect} width={200} onClose={() => setPop(null)}>
          <div className="p-1.5 text-[13px]">
            {sortOpts.map((o) => { const on = sort?.key === o.key && sort.dir === o.dir; return (
              <button key={o.label} type="button" onClick={() => { setSort(on ? null : { key: o.key, dir: o.dir }); setPop(null); }} className={cn('hover:bg-ed-bg flex h-8 w-full items-center justify-between rounded-md px-2.5', on && 'bg-ed-brand-soft')}>{o.label}{on && <Check className="text-ed-brand size-3.5" />}</button>
            ); })}
          </div>
        </Popover>
      )}
      {pop?.kind === 'columns' && (
        <Popover anchor={pop.rect} width={210} onClose={() => setPop(null)}>
          <p className="px-4 pt-3 pb-1 text-[13px] font-medium">Visible columns</p>
          <div className="px-2 pb-2">{cols.map((c) => (
            <label key={c} className="hover:bg-ed-bg flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px]"><input type="checkbox" checked={show(c)} onChange={() => setHidden((h) => { const n = new Set(h); n.has(c) ? n.delete(c) : n.add(c); return n; })} className="accent-ed-brand size-3.5" />{c}</label>
          ))}</div>
        </Popover>
      )}
      {pop?.kind === 'density' && (
        <Popover anchor={pop.rect} width={190} onClose={() => setPop(null)}>
          <p className="px-4 pt-3 pb-1 text-[13px] font-medium">Row density</p>
          <div className="p-1.5 text-[13px]">{[['Comfortable', false], ['Compact', true]].map(([l, v]) => (
            <button key={l as string} type="button" onClick={() => { setCompact(v as boolean); setPop(null); }} className={cn('hover:bg-ed-bg flex h-8 w-full items-center justify-between rounded-md px-2.5', compact === v && 'bg-ed-brand-soft')}>{l as string}{compact === v && <Check className="text-ed-brand size-3.5" />}</button>
          ))}</div>
        </Popover>
      )}
      {pop?.kind === 'filter' && (
        <Popover anchor={new DOMRect(pop.rect.left, pop.rect.top, 260, pop.rect.height)} width={260} onClose={() => setPop(null)}>
          <div className="space-y-3 p-4 text-[13px]">
            <div><p className="text-ed-muted mb-1.5 text-[11px] tracking-wide uppercase">Manage stock</p>
              <div className="flex gap-1.5">{(['All', 'ON', 'OFF'] as const).map((v) => <button key={v} type="button" onClick={() => setStockF(v)} className={cn('h-8 flex-1 rounded-lg border text-[12.5px]', stockF === v ? 'bg-ed-brand border-ed-brand text-white' : 'border-ed-line hover:text-ed-brand')}>{v}</button>)}</div></div>
            <div><p className="text-ed-muted mb-1.5 text-[11px] tracking-wide uppercase">Category</p>
              <select value={catF} onChange={(e) => setCatF(e.target.value)} className="border-ed-line h-9 w-full rounded-lg border bg-white px-2.5 text-[13px] outline-none">{['All', ...Array.from(new Set(categories))].map((c) => <option key={c}>{c}</option>)}</select></div>
            <button type="button" onClick={() => { setStockF('All'); setCatF('All'); }} className="text-ed-brand text-[12.5px] underline">Reset filters</button>
          </div>
        </Popover>
      )}
    </div>
  );
}
