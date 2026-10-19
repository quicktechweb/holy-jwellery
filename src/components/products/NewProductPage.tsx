'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ImageOff, Info, Pencil, Plus, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { brandSeed, categorySeed, type Product, type ProductImage } from '@/data/products';
import { cn } from '@/lib/utils';
import { NameDialog, type Named } from './CategoriesBrands';
import { Area, Label, Section, Select, blank, input } from './ProductForm';
import { Switch, btnOut, btnPrimary } from './ui';

type Mode = 'single' | 'variants';
interface Variant { id: number; name: string; sku: string; price: string; stock: string }

const modes: { key: Mode; label: string }[] = [
  { key: 'single', label: 'Single SKU' },
  { key: 'variants', label: 'With Variants' },
];

export function NewProductPage() {
  const router = useRouter();
  const [f, setF] = useState<Product>(() => blank());
  const [mode, setMode] = useState<Mode>('single');
  const [variants, setVariants] = useState<Variant[]>([{ id: 1, name: '', sku: '', price: '', stock: '' }]);
  const [categories, setCategories] = useState<Named[]>(categorySeed);
  const [brands, setBrands] = useState<Named[]>(brandSeed);
  const [dlg, setDlg] = useState<'category' | 'brand' | null>(null);
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setF((p) => ({ ...p, [k]: v }));
  const num = (k: 'costPrice' | 'sellPrice' | 'webPrice' | 'alertQty' | 'weight' | 'qty') => (v: string) => set(k, v === '' ? 0 : Number(v));
  const val = (n: number) => (n === 0 ? '' : n);

  const profit = f.sellPrice - f.costPrice;
  const margin = f.sellPrice > 0 ? (profit / f.sellPrice) * 100 : 0;
  const showProfit = f.sellPrice > 0 || f.costPrice > 0;

  const generateSku = () => {
    const base = f.name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 8);
    set('code', `${base || 'SKU'}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const imgs: ProductImage[] = Array.from(files)
      .filter((x) => x.type.startsWith('image/') && x.size <= 5 * 1024 * 1024)
      .map((x) => ({ src: URL.createObjectURL(x) }));
    setF((p) => ({ ...p, images: [...p.images, ...imgs] }));
  };
  const addUrl = () => {
    const u = url.trim();
    if (/^https?:\/\//i.test(u)) { setF((p) => ({ ...p, images: [...p.images, { src: u }] })); setUrl(''); }
  };
  const makeMain = (i: number) => setF((p) => ({ ...p, images: [p.images[i], ...p.images.filter((_, j) => j !== i)] }));
  const dropImg = (i: number) => setF((p) => ({ ...p, images: p.images.filter((_, j) => j !== i) }));

  const patchVariant = (id: number, k: keyof Variant, v: string) => setVariants((l) => l.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const addVariant = () => setVariants((l) => [...l, { id: Math.max(0, ...l.map((x) => x.id)) + 1, name: '', sku: '', price: '', stock: '' }]);

  const nextId = (l: Named[]) => Math.max(0, ...l.map((x) => x.id)) + 1;
  const saveNamed = (name: string) => {
    const add = (l: Named[]) => [...l, { id: nextId(l), name }];
    if (dlg === 'category') { setCategories(add); set('category', name); }
    else { setBrands(add); set('brand', name); }
    setDlg(null);
  };

  const create = () => {
    if (!f.name.trim()) return setErr('Product name is required.');
    if (!f.code.trim()) return setErr('Product code is required.');
    if (mode === 'variants' && variants.some((v) => !v.name.trim())) return setErr('Every variant needs a name.');
    setErr('');
    setSaving(true);
    // TODO: real API call - POST /products { ...f, mode, variants }
    router.push('/dashboard/product/product-list');
  };

  return (
    <div className="mx-auto max-w-[1120px] pt-9">
      <header className="border-ed-line flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div className="px-1">
          <h1 className="text-[26px] leading-tight font-medium tracking-tight">Add Product</h1>
          <p className="text-ed-text/70 mt-0.5 text-[14px]">Create a new product to list in your store catalog and manage stock.</p>
        </div>
        <button type="button" onClick={() => router.push('/dashboard/product/product-list')} className={btnOut}>
          <ArrowLeft className="size-4" /> Back to Products
        </button>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_356px]">
        {/* ───────── Left column ───────── */}
        <div className="space-y-6">
          <Section title="Product Basics" desc="Provide essential details for this item.">
            <Label>Product Name</Label>
            <input value={f.name} onChange={(e) => set('name', e.target.value)} className={input} placeholder="e.g. Premium Cotton Polo T-Shirt" />
            <div className="mt-4">
              <Label right={<button type="button" onClick={generateSku} className="text-ed-brand flex items-center gap-1.5 text-[12px] font-medium"><Sparkles className="size-3.5" /> Generate SKU</button>}>Product Code</Label>
            </div>
            <input value={f.code} onChange={(e) => set('code', e.target.value)} className={input} placeholder="e.g. SKU-1002" />
          </Section>

          <Section title="Pricing" desc="Manage catalog rates and inventory cost margins.">
            <div className="grid gap-4 sm:grid-cols-3">
              {([['Cost Price', 'costPrice'], ['Sell Price', 'sellPrice'], ['Website Regular Price', 'webPrice']] as const).map(([l, k]) => (
                <div key={k}>
                  <Label>{l}</Label>
                  <div className="relative">
                    <span className="text-ed-muted absolute top-1/2 left-3 -translate-y-1/2 text-[12px]">৳</span>
                    <input type="number" min={0} step="0.01" value={val(f[k])} placeholder="0.00" onChange={(e) => num(k)(e.target.value)} className={cn(input, 'pl-7')} />
                  </div>
                </div>
              ))}
            </div>
            {showProfit && (
              <div className={cn('mt-4 flex items-center justify-between rounded-lg border px-3.5 py-3 text-[13px]', profit >= 0 ? 'border-emerald-200 bg-[#eefaf3] text-emerald-800' : 'border-rose-200 bg-[#fff1f2] text-rose-700')}>
                <span className="flex items-center gap-2.5"><Info className="size-4" /><span><b className="font-medium">Projected Profit:</b> ৳{profit.toFixed(2)} (Margin: {margin.toFixed(1)}%)</span></span>
                <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', profit >= 0 ? 'bg-emerald-100' : 'bg-rose-100')}>{profit >= 0 ? 'Profitable' : 'Loss'}</span>
              </div>
            )}
          </Section>

          {mode === 'variants' && (
            <Section title="Variants" desc="Add each size, colour or option as its own SKU with price and stock.">
              <div className="space-y-3">
                <div className="text-ed-muted hidden grid-cols-[1.4fr_1.2fr_0.8fr_0.7fr_32px] gap-2.5 px-0.5 text-[11.5px] font-medium sm:grid">
                  <span>Variant name</span><span>SKU</span><span>Price</span><span>Stock</span><span />
                </div>
                {variants.map((v) => (
                  <div key={v.id} className="grid grid-cols-2 items-center gap-2.5 sm:grid-cols-[1.4fr_1.2fr_0.8fr_0.7fr_32px]">
                    <input value={v.name} onChange={(e) => patchVariant(v.id, 'name', e.target.value)} placeholder="e.g. Red / M" aria-label="Variant name" className={input} />
                    <input value={v.sku} onChange={(e) => patchVariant(v.id, 'sku', e.target.value)} placeholder="SKU" aria-label="Variant SKU" className={input} />
                    <input type="number" min={0} value={v.price} onChange={(e) => patchVariant(v.id, 'price', e.target.value)} placeholder="0.00" aria-label="Variant price" className={input} />
                    <input type="number" min={0} value={v.stock} onChange={(e) => patchVariant(v.id, 'stock', e.target.value)} placeholder="0" aria-label="Variant stock" className={input} />
                    <button type="button" aria-label="Remove variant" disabled={variants.length === 1} onClick={() => setVariants((l) => l.filter((x) => x.id !== v.id))} className="text-ed-muted flex size-8 items-center justify-center rounded-md hover:text-rose-600 disabled:opacity-30"><Trash2 className="size-4" /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addVariant} className={cn(btnOut, 'mt-4 font-medium')}><Plus className="size-3.5" /> Add Variant</button>
            </Section>
          )}

          <Section title="Inventory" desc="Configure stock counts, alerts, and tracking switches.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Stock Qty</Label><input type="number" min={0} value={f.qty} onChange={(e) => num('qty')(e.target.value)} placeholder="0" className={input} /></div>
              <div><Label>Alert Quantity</Label><input type="number" min={0} value={f.alertQty} onChange={(e) => num('alertQty')(e.target.value)} placeholder="0" className={input} /></div>
            </div>
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
              className="border-ed-line hover:border-ed-brand/40 flex h-[110px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed bg-[#faf9fc] transition">
              <span className="bg-ed-bg flex size-9 items-center justify-center rounded-full"><Upload className="size-4" /></span>
              <span className="mt-2 text-[12px] font-medium">Click to upload or drag &amp; drop</span>
              <span className="text-ed-muted text-[10px]">Main product photo (PNG, JPG up to 5MB)</span>
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />

            <div className="mt-4 flex flex-wrap gap-3">
              {f.images.length === 0 && (
                <div className="border-ed-line text-ed-muted flex size-20 flex-col items-center justify-center gap-1 rounded-lg border bg-[#faf9fc]">
                  <ImageOff className="size-5" /><span className="text-[9px]">No image</span>
                </div>
              )}
              {f.images.map((im, i) => (
                <div key={i} className="group relative size-20 overflow-hidden rounded-lg border border-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {im.src && <img src={im.src} alt="" className="size-full object-cover" />}
                  <button type="button" aria-label="Make main" onClick={() => makeMain(i)} className="absolute inset-0" />
                  {i === 0 && <span className="bg-ed-brand absolute top-1 left-1 rounded px-1.5 py-0.5 text-[8px] font-bold text-white">MAIN</span>}
                  <button type="button" aria-label="Remove image" onClick={() => dropImg(i)} className="absolute top-1 right-1 hidden size-4 items-center justify-center rounded-full bg-black/60 text-white group-hover:flex"><X className="size-3" /></button>
                </div>
              ))}
            </div>

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
              <div><Label>Short Description</Label><Area value={f.shortDesc} onChange={(e) => set('shortDesc', e.target.value)} placeholder="Summarize product features..." /></div>
              <div>
                <Label right={<button type="button" onClick={() => setDlg('category')} className="text-ed-brand flex items-center gap-1 text-[11.5px] font-medium"><Plus className="size-3" /> Create Category</button>}>Additional Categories</Label>
                <Select value="" onChange={(v) => v && !f.extraCategories.includes(v) && set('extraCategories', [...f.extraCategories, v])} options={categories.map((c) => c.name)} placeholder="Select additional categories" />
                {f.extraCategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {f.extraCategories.map((c) => (
                      <span key={c} className="bg-ed-brand-soft text-ed-brand flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px]">{c}
                        <button type="button" aria-label={`Remove ${c}`} onClick={() => set('extraCategories', f.extraCategories.filter((x) => x !== c))}><X className="size-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4"><Label>Long Description</Label><Area value={f.longDesc} onChange={(e) => set('longDesc', e.target.value)} placeholder="Detailed description showing in storefront..." tall /></div>
          </Section>
        </div>

        {/* ───────── Right column ───────── */}
        <div className="space-y-6 lg:sticky lg:top-4">
          <Section title="Product Mode">
            <p className="text-ed-muted mb-2 text-[12px]">Choose listing model</p>
            <div role="tablist" className="grid grid-cols-2 rounded-lg bg-[#f3f1f7] p-1 text-[12.5px]">
              {modes.map((m) => (
                <button key={m.key} role="tab" aria-selected={mode === m.key} type="button" onClick={() => setMode(m.key)}
                  className={cn('h-9 rounded-md transition', mode === m.key ? 'text-ed-brand bg-white font-medium shadow-sm' : 'text-ed-text/70 hover:text-ed-brand')}>{m.label}</button>
              ))}
            </div>
          </Section>

          <Section title="Organization">
            <Label>Primary Category</Label>
            <div className="flex gap-2.5">
              <Select value={f.category} onChange={(v) => set('category', v)} options={categories.map((c) => c.name)} placeholder="Select" className="flex-1" />
              <button type="button" aria-label="Add category" onClick={() => setDlg('category')} className={cn(btnOut, 'w-10 justify-center px-0')}><Plus className="size-3.5" /></button>
            </div>
            <div className="mt-4"><Label>Product Brand</Label></div>
            <div className="flex gap-2.5">
              <Select value={f.brand} onChange={(v) => set('brand', v)} options={brands.map((b) => b.name)} placeholder="Select" className="flex-1" />
              <button type="button" aria-label="Add brand" onClick={() => setDlg('brand')} className={cn(btnOut, 'w-10 justify-center px-0')}><Plus className="size-3.5" /></button>
            </div>
          </Section>

          <Section title="Shipping Specs">
            <Label>Product Weight</Label>
            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <input type="number" min={0} value={f.weight} onChange={(e) => num('weight')(e.target.value)} className={cn(input, 'pr-12')} />
                <span className="text-ed-muted absolute top-1/2 right-3 -translate-y-1/2 text-[10.5px] font-medium uppercase">{f.weightUnit}</span>
              </div>
              <div className="flex rounded-lg bg-[#f3f1f7] p-1 text-[12px]">
                {(['kg', 'g'] as const).map((u) => (
                  <button key={u} type="button" onClick={() => set('weightUnit', u)} className={cn('w-9 rounded-md', f.weightUnit === u ? 'text-ed-brand bg-white font-medium shadow-sm' : 'text-ed-text/70')}>{u}</button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Extra Details">
            <Label>Default Shipping Note</Label>
            <Area value={f.shippingNote} onChange={(e) => set('shippingNote', e.target.value)} placeholder="Add special packaging/delivery notes..." />
            <div className="mt-4"><Label>Internal Admin Note</Label></div>
            <Area value={f.adminNote} onChange={(e) => set('adminNote', e.target.value)} placeholder="Supplier, batch info, etc..." />
            <div className="mt-4"><Label>Warranty Policy</Label></div>
            <input value={f.warranty} onChange={(e) => set('warranty', e.target.value)} placeholder="e.g. 6 Months brand warranty" className={input} />
          </Section>
        </div>
      </div>

      <div className="border-ed-line mt-8 flex items-center justify-end gap-3 border-t pt-6">
        {err && <p role="alert" className="mr-auto text-[12.5px] text-rose-600">{err}</p>}
        <button type="button" onClick={() => router.push('/dashboard/product/product-list')} className={cn(btnOut, 'h-11 px-5 font-medium')}>Cancel</button>
        <button type="button" disabled={saving} onClick={create} className={cn(btnPrimary, 'h-11')}>Create Product</button>
      </div>

      {dlg && <NameDialog title={dlg === 'category' ? 'Add Category' : 'Add Brand'} label={dlg === 'category' ? 'Category name' : 'Brand name'} initial="" onClose={() => setDlg(null)} onSave={saveNamed} />}
    </div>
  );
}
