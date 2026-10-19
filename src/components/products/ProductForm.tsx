'use client';

import { useRef, useState, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { ChevronsUpDown, Info, Pencil, Plus, Upload, X } from 'lucide-react';
import type { Product, ProductImage } from '@/data/products';
import { cn } from '@/lib/utils';
import { Switch, btnOut, btnPrimary } from './ui';

export const input = 'border-ed-line focus:border-ed-brand/40 focus:ring-ed-brand/10 h-10 w-full rounded-lg border bg-[#f7f6fa] px-3 text-[13.5px] outline-none placeholder:text-ed-muted/70 focus:ring-2 disabled:bg-[#f0eff4] disabled:text-ed-text/70';
export const area = cn(input, 'h-[80px] resize-y py-2.5');

export function Section({ title, desc, children, className }: { title: string; desc?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('border-ed-line overflow-hidden rounded-xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)]', className)}>
      <div className={cn('px-6', desc ? 'border-ed-line border-b py-4' : 'py-4')}>
        <h4 className="text-[15px] font-medium">{title}</h4>
        {desc && <p className="text-ed-muted mt-1 text-[11.5px]">{desc}</p>}
      </div>
      <div className={cn('px-6 pb-5', !desc && 'border-ed-line border-t pt-4')}>{desc ? <div className="pt-4">{children}</div> : children}</div>
    </section>
  );
}
export const Label = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
  <div className="mb-1.5 flex items-center justify-between"><label className="text-[13px] font-medium">{children}</label>{right}</div>
);

export function Select({ value, onChange, options, placeholder, className }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(input, 'cursor-pointer appearance-none bg-white pr-9', !value && 'text-ed-text')}>
        <option value="">{placeholder}</option>
        {options.map((o, i) => <option key={`${o}-${i}`} value={o}>{o}</option>)}
      </select>
      <ChevronsUpDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2" />
    </div>
  );
}

export const blank = (): Product => ({
  id: `prod-${Date.now()}`, code: '', name: '', category: '', brand: '', manageStock: false, costPrice: 0, sellPrice: 0, webPrice: 0, qty: 0, active: true,
  alertQty: 0, stockInAlert: 5, featured: false, weight: 0, weightUnit: 'kg', shippingNote: '', adminNote: '', warranty: '', shortDesc: '', longDesc: '', extraCategories: [], images: [], tags: [],
});

export function ProductForm({ product, categories, brands, onClose, onSave, onAddCategory, onAddBrand }: {
  product?: Product; categories: string[]; brands: string[]; onClose: () => void; onSave: (p: Product) => void;
  onAddCategory: () => void; onAddBrand: () => void;
}) {
  const editing = !!product;
  const [f, setF] = useState<Product>(() => product ?? blank());
  const [codeLocked, setCodeLocked] = useState(editing);
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setF((p) => ({ ...p, [k]: v }));
  const num = (k: 'costPrice' | 'sellPrice' | 'webPrice' | 'alertQty' | 'weight') => (v: string) => set(k, v === '' ? 0 : Number(v));

  const profit = f.sellPrice - f.costPrice;
  const margin = f.sellPrice > 0 ? (profit / f.sellPrice) * 100 : 0;
  const good = profit >= 0;

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const imgs: ProductImage[] = Array.from(files).filter((x) => x.type.startsWith('image/') && x.size <= 5 * 1024 * 1024).map((x) => ({ src: URL.createObjectURL(x) }));
    setF((p) => ({ ...p, images: [...p.images, ...imgs] }));
  };
  const addUrl = () => { const u = url.trim(); if (/^https?:\/\//i.test(u)) { setF((p) => ({ ...p, images: [...p.images, { src: u }] })); setUrl(''); } };
  const makeMain = (i: number) => setF((p) => ({ ...p, images: [p.images[i], ...p.images.filter((_, j) => j !== i)] }));
  const dropImg = (i: number) => setF((p) => ({ ...p, images: p.images.filter((_, j) => j !== i) }));
  const save = () => {
    if (!f.name.trim()) return setErr('Product name is required.');
    if (!f.code.trim()) return setErr('Product code is required.');
    onSave({ ...f, name: f.name.trim(), code: f.code.trim(), category: f.category || 'Uncategorized' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label={editing ? 'Edit product' : 'Add product'} className="flex max-h-[92vh] w-full max-w-[1024px] flex-col overflow-hidden rounded-xl bg-[#f8f7fc] shadow-2xl">
        <div className="relative px-6 pt-6 pb-4">
          <h3 className="pr-8 text-[19px] font-medium">{editing ? `Edit Product: ${product!.name}` : 'Add Product'}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="text-ed-muted hover:text-ed-text absolute top-6 right-6"><X className="size-4" /></button>
        </div>

        <div className="thin-scroll grid min-h-0 flex-1 items-start gap-5 overflow-y-auto px-6 pb-6 md:grid-cols-[minmax(0,1fr)_308px]">
          <div className="space-y-5">
            <Section title="Product Basics" desc="Provide essential details for this item.">
              <Label>Product Name</Label>
              <input value={f.name} onChange={(e) => set('name', e.target.value)} className={input} placeholder="Product name" />
              <div className="mt-4"><Label right={editing && <button type="button" onClick={() => setCodeLocked((l) => !l)} className="text-ed-brand flex items-center gap-1.5 text-[12px] font-medium"><Pencil className="size-3" /> {codeLocked ? 'Change code' : 'Lock code'}</button>}>Product Code</Label></div>
              <input value={f.code} disabled={codeLocked} onChange={(e) => set('code', e.target.value)} className={input} placeholder="SKU / code" />
            </Section>

            <Section title="Pricing" desc="Manage catalog rates and inventory cost margins.">
              <div className="grid gap-4 sm:grid-cols-3">
                {([['Cost Price', 'costPrice'], ['Sell Price', 'sellPrice'], ['Website Regular Price', 'webPrice']] as const).map(([l, k]) => (
                  <div key={k}><Label>{l}</Label>
                    <div className="relative"><span className="text-ed-muted absolute top-1/2 left-3 -translate-y-1/2 text-[12px]">৳</span>
                      <input type="number" min={0} step="0.01" value={f[k] === 0 && k === 'webPrice' ? '' : f[k]} placeholder="0.00" onChange={(e) => num(k)(e.target.value)} className={cn(input, 'pl-7')} /></div>
                  </div>
                ))}
              </div>
              <div className={cn('mt-4 flex items-center justify-between rounded-lg border px-3.5 py-3 text-[13px]', good ? 'border-emerald-200 bg-[#eefaf3] text-emerald-800' : 'border-rose-200 bg-[#fff1f2] text-rose-700')}>
                <span className="flex items-center gap-2.5"><Info className="size-4" /><span><b className="font-medium">Projected Profit:</b> ৳{profit.toFixed(2)} (Margin: {margin.toFixed(1)}%)</span></span>
                <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', good ? 'bg-emerald-100' : 'bg-rose-100')}>{good ? 'Profitable' : 'Loss'}</span>
              </div>
            </Section>

            <Section title="Inventory" desc="Configure stock counts, alerts, and tracking switches.">
              <Label>Alert Quantity</Label>
              <input type="number" min={0} value={f.alertQty || ''} placeholder="0" onChange={(e) => num('alertQty')(e.target.value)} className={cn(input, 'max-w-[288px]')} />
              <div className="border-ed-line mt-6 grid gap-5 border-t pt-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Switch small on={f.manageStock} onChange={(v) => set('manageStock', v)} label="Manage stock" />
                  <div><p className="text-[13.5px] font-medium">Manage Stock</p><p className="text-ed-muted text-[10.5px]">Track current inventory count and block oversell.</p></div>
                </div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} className="accent-ed-brand mt-1 size-4 rounded" />
                  <span><span className="block text-[13.5px] font-medium">Featured Product</span><span className="text-ed-muted block text-[10.5px]">Display this product prominently on your website store.</span></span>
                </label>
              </div>
            </Section>

            <Section title="Media & Images" desc="Drag and drop file or supply web URLs to build the catalog gallery.">
              <button type="button" onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                className="border-ed-line hover:border-ed-brand/40 flex h-[110px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed bg-[#faf9fc]">
                <span className="bg-ed-bg flex size-9 items-center justify-center rounded-full"><Upload className="size-4" /></span>
                <span className="mt-2 text-[12px] font-medium">Click to upload or drag &amp; drop</span>
                <span className="text-ed-muted text-[10px]">Main product photo (PNG, JPG up to 5MB)</span>
              </button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
              {f.images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {f.images.map((im, i) => (
                    <div key={i} className="group relative size-[80px] overflow-hidden rounded-lg border border-black/5" style={im.src ? undefined : { background: im.bg }}>
                      {im.src && /* eslint-disable-next-line @next/next/no-img-element */ <img src={im.src} alt="" className="size-full object-cover" />}
                      <button type="button" aria-label="Make main" onClick={() => makeMain(i)} className="absolute inset-0" />
                      {i === 0 && <span className="bg-ed-brand absolute top-1 left-1 rounded px-1.5 py-0.5 text-[8px] font-bold text-white">MAIN</span>}
                      <button type="button" aria-label="Remove image" onClick={() => dropImg(i)} className="absolute top-1 right-1 hidden size-4 items-center justify-center rounded-full bg-black/60 text-white group-hover:flex"><X className="size-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-ed-line mt-5 border-t pt-4">
                <Label>Add Image URL to Gallery</Label>
                <div className="flex gap-2.5">
                  <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addUrl()} placeholder="https://example.com/gallery-image.jpg" className={input} />
                  <button type="button" onClick={addUrl} className={cn(btnOut, 'font-medium')}>Add to Gallery</button>
                </div>
              </div>
            </Section>

            <Section title="Catalog Info" desc="Manage product descriptions and alternative category links.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Short Description</Label><textarea value={f.shortDesc} onChange={(e) => set('shortDesc', e.target.value)} placeholder="Summarize product features..." className={area} /></div>
                <div>
                  <Label right={<button type="button" onClick={onAddCategory} className="text-ed-brand flex items-center gap-1 text-[11.5px] font-medium"><Plus className="size-3" /> Create Category</button>}>Additional Categories</Label>
                  <Select value="" onChange={(v) => v && !f.extraCategories.includes(v) && set('extraCategories', [...f.extraCategories, v])} options={categories} placeholder="Select additional categories" className="[&_select]:bg-[#f1eaf7]" />
                  {f.extraCategories.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{f.extraCategories.map((c) => <span key={c} className="bg-ed-brand-soft text-ed-brand flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px]">{c}<button type="button" aria-label={`Remove ${c}`} onClick={() => set('extraCategories', f.extraCategories.filter((x) => x !== c))}><X className="size-3" /></button></span>)}</div>}
                </div>
              </div>
              <div className="mt-4"><Label>Long Description</Label><textarea value={f.longDesc} onChange={(e) => set('longDesc', e.target.value)} placeholder="Detailed description showing in storefront..." className={cn(area, 'h-[120px]')} /></div>
            </Section>
          </div>

          <div className="space-y-5">
            <Section title="Organization">
              <Label>Primary Category</Label>
              <div className="flex gap-2.5"><Select value={f.category === 'Uncategorized' ? '' : f.category} onChange={(v) => set('category', v)} options={categories} placeholder="Select" className="flex-1" /><button type="button" aria-label="Add category" onClick={onAddCategory} className={cn(btnOut, 'w-10 justify-center px-0')}><Plus className="size-3.5" /></button></div>
              <div className="mt-4"><Label>Product Brand</Label></div>
              <div className="flex gap-2.5"><Select value={f.brand} onChange={(v) => set('brand', v)} options={brands} placeholder="Select" className="flex-1" /><button type="button" aria-label="Add brand" onClick={onAddBrand} className={cn(btnOut, 'w-10 justify-center px-0')}><Plus className="size-3.5" /></button></div>
            </Section>

            <Section title="Shipping Specs">
              <Label>Product Weight</Label>
              <div className="flex gap-2.5">
                <div className="relative flex-1"><input type="number" min={0} value={f.weight} onChange={(e) => num('weight')(e.target.value)} className={cn(input, 'pr-12')} /><span className="text-ed-muted absolute top-1/2 right-3 -translate-y-1/2 text-[10.5px] font-medium uppercase">{f.weightUnit === 'kg' ? 'KG' : 'G'}</span></div>
                <div className="flex rounded-lg bg-[#f3f1f7] p-1 text-[12px]">
                  {(['kg', 'g'] as const).map((u) => <button key={u} type="button" onClick={() => set('weightUnit', u)} className={cn('w-9 rounded-md', f.weightUnit === u ? 'text-ed-brand bg-white font-medium shadow-sm' : 'text-ed-text/70')}>{u}</button>)}
                </div>
              </div>
            </Section>

            <Section title="Extra Details">
              <Label>Default Shipping Note</Label><textarea value={f.shippingNote} onChange={(e) => set('shippingNote', e.target.value)} placeholder="Add special packaging/delivery notes..." className={area} />
              <div className="mt-4"><Label>Internal Admin Note</Label></div><textarea value={f.adminNote} onChange={(e) => set('adminNote', e.target.value)} placeholder="Supplier, batch info, etc..." className={area} />
              <div className="mt-4"><Label>Warranty Policy</Label></div><input value={f.warranty} onChange={(e) => set('warranty', e.target.value)} placeholder="e.g. 6 Months brand warranty" className={input} />
            </Section>
          </div>
        </div>

        <div className="border-ed-line flex items-center justify-end gap-3 border-t bg-[#f8f7fc] px-6 py-4">
          {err && <p role="alert" className="mr-auto text-[12.5px] text-rose-600">{err}</p>}
          <button type="button" onClick={onClose} className={cn(btnOut, 'h-11 px-5 font-medium')}>Cancel</button>
          <button type="button" onClick={save} className={cn(btnPrimary, 'h-11')}>{editing ? 'Save Changes' : 'Add Product'}</button>
        </div>
      </div>
    </div>
  );
}

/** Shared textarea used by the full-page Add Product form */
export function Area({ tall, className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement> & { tall?: boolean }) {
  return <textarea {...p} className={cn(area, tall && 'h-[120px]', className)} />;
}
