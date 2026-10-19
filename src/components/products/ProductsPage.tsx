'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Boxes, Box, GitBranch, Layers, Link2, Plus, RefreshCw, ShoppingBag, Tag, Upload } from 'lucide-react';
import { brandSeed, categorySeed, productSeed, productStats, type Product } from '@/data/products';
import { download } from '@/components/courier/ui';
import { cn } from '@/lib/utils';
import { CategoriesBrands, NameDialog, type Named } from './CategoriesBrands';
import { ProductForm } from './ProductForm';
import { ProductTable } from './ProductTable';
import { ProductTagsModal } from './TagsModal';
import { BulkBar, type BulkAction } from './BulkBar';
import { BulkImageModal, BulkUpdateModal, CopyBusinessModal, PrintBarcodesModal, VariationGroupModal } from './BulkModals';
import { Dialog, btnOut, btnPrimary } from './ui';

const tabs = [
  { key: 'products', label: 'Products', icon: Box },
  { key: 'inactive', label: 'Inactive Products', icon: Box },
  { key: 'combo', label: 'Combo Products', icon: Boxes },
  { key: 'wraps', label: 'Wraps', icon: ShoppingBag },
  { key: 'shared-inventory', label: 'Shared Inventory', icon: Layers },
  { key: 'stock-links', label: 'Stock Links', icon: Link2 },
  { key: 'variations', label: 'Variations', icon: GitBranch },
  { key: 'categories-brands', label: 'Categories & Brands', icon: Tag },
] as const;
type TabKey = (typeof tabs)[number]['key'];

const placeholders: Record<string, [string, string]> = {
  combo: ['No combo products yet', 'Bundle several products into one sellable combo.'],
  wraps: ['No wraps yet', 'Gift wraps and packaging add-ons will be listed here.'],
  'shared-inventory': ['No shared inventory', 'Link products that draw from the same stock pool.'],
  'stock-links': ['No stock links', 'Connect products so their stock moves together.'],
  variations: ['No variations yet', 'Manage sizes, colours and other product variations.'],
};

export function ProductsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const sec = params.get('section');
  const tab = (tabs.find((t) => t.key === sec)?.key ?? 'products') as TabKey;

  const [products, setProducts] = useState<Product[]>(productSeed);
  const [categories, setCategories] = useState<Named[]>(categorySeed);
  const [brands, setBrands] = useState<Named[]>(brandSeed);
  const [form, setForm] = useState<{ product?: Product } | null>(null);
  const [tagFor, setTagFor] = useState<Product[] | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState<Exclude<BulkAction, 'tags' | 'delete'> | null>(null);
  const [nameDlg, setNameDlg] = useState<'category' | 'brand' | null>(null);
  const [io, setIo] = useState(false);
  const [guide, setGuide] = useState(false);
  const [toast, setToast] = useState('');
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600); };

  const patch = (id: string, p: Partial<Product>) => setProducts((l) => l.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const nextId = (l: Named[]) => Math.max(0, ...l.map((x) => x.id)) + 1;
  const save = (p: Product) => {
    const exists = products.some((x) => x.id === p.id);
    setProducts((l) => (exists ? l.map((x) => (x.id === p.id ? p : x)) : [p, ...l]));
    setForm(null);
    flash(exists ? 'Product updated' : 'Product added');
  };
  const actions = {
    onPatch: patch, flash,
    onEdit: (p: Product) => setForm({ product: p }),
    onTags: (p: Product) => setTagFor([p]),
    onDuplicate: (p: Product) => { setProducts((l) => [{ ...p, id: `prod-${Date.now()}`, code: `${p.code} copy`, name: `${p.name} (Copy)` }, ...l]); flash('Product duplicated'); },
    onDelete: (p: Product) => { if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) { setProducts((l) => l.filter((x) => x.id !== p.id)); setSel((s) => { const n = new Set(s); n.delete(p.id); return n; }); flash('Product deleted'); } },
  };
  const saveNamed = (set: typeof setCategories) => (id: number | null, name: string) => set((l) => (id === null ? [...l, { id: nextId(l), name }] : l.map((x) => (x.id === id ? { ...x, name } : x))));
  const catNames = categories.map((c) => c.name);

  const exportCsv = () => {
    download('products.csv', [['Code', 'Name', 'Category', 'Manage Stock', 'Cost Price', 'Stock Qty', 'Selling Price', 'Active'], ...products.map((p) => [p.code, p.name, p.category, p.manageStock ? 'ON' : 'OFF', p.costPrice, p.qty, p.sellPrice, p.active ? 'Yes' : 'No'])]);
    setIo(false);
  };
  const picked = products.filter((p) => sel.has(p.id));
  const bulkAction = (a: BulkAction) => {
    if (a === 'tags') return setTagFor(picked);
    if (a === 'delete') {
      if (window.confirm(`Delete ${picked.length} selected product${picked.length > 1 ? 's' : ''}? This cannot be undone.`)) { setProducts((l) => l.filter((x) => !sel.has(x.id))); setSel(new Set()); flash(`${picked.length} product${picked.length > 1 ? 's' : ''} deleted`); }
      return;
    }
    setBulk(a);
  };
  const applyAll = (fn: (p: Product) => Product, msg: string) => { setProducts((l) => l.map((x) => (sel.has(x.id) ? fn(x) : x))); setBulk(null); flash(msg); };
  const go = (k: TabKey) => { setSel(new Set()); router.push(k === 'products' ? '?' : `?section=${k}`, { scroll: false }); };
  const isCB = tab === 'categories-brands';

  return (
    <div className="mx-auto max-w-[1500px] pt-9">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="px-1">
          <h1 className="text-[26px] leading-tight font-medium tracking-tight">Products</h1>
          <p className="text-ed-text/70 mt-0.5 text-[14px]">Manage your product catalog, combos, and inventory</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={() => setGuide((g) => !g)} className={btnOut}><BookOpen className="size-4" /> Guide</button>
          {!isCB && <button type="button" onClick={() => flash('Products synced')} className={btnOut}><RefreshCw className="size-4" /> Sync Products</button>}
          <button type="button" onClick={() => setIo(true)} className={btnOut}><Upload className="size-4" /> Import / Export</button>
          <button type="button" onClick={() => setForm({})} className={btnPrimary}><Plus className="size-4" /> Add Product</button>
        </div>
      </header>

      {guide && <p className="border-ed-line text-ed-text/80 mt-4 rounded-xl border bg-white px-4 py-3 text-[13px]">Use the tabs to switch between active products, combos, wraps and shared inventory. Toggle &quot;Active&quot; to move a product to Inactive Products; use the ••• menu to edit, duplicate, tag or delete it.</p>}
      {toast && <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-[13px] font-medium text-green-700">{toast}</p>}

      <div role="tablist" className="mt-4 flex flex-wrap gap-1.5">
        {tabs.map((t) => {
          const on = t.key === tab, Icon = t.icon;
          return (
            <button key={t.key} role="tab" aria-selected={on} type="button" onClick={() => go(t.key)}
              className={cn('flex h-10 items-center gap-2.5 rounded-lg px-3.5 text-[14px] transition', on ? 'bg-ed-brand-soft text-ed-brand border-ed-brand/15 border shadow-sm' : 'text-ed-text/70 hover:text-ed-brand border border-transparent')}>
              <Icon className="size-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'products' && (
        <>
          <div className="border-ed-line mt-4 grid gap-3 rounded-xl border bg-white p-3 shadow-[0_1px_2px_rgba(30,20,50,0.04)] sm:grid-cols-2 lg:grid-cols-4">
            {[['Products', String(productStats.products), ''], ['Stock', productStats.stock, ''], ['Sell Value', `৳${productStats.sellValue}`, 'text-[#15803d]'], ['Cost Value', `৳${productStats.costValue}`, 'text-[#c2570c]']].map(([l, v, c]) => (
              <div key={l} className="rounded-lg bg-[#f8f7fb] px-4 py-3"><p className="text-ed-muted text-[12px]">{l}</p><p className={cn('mt-1 text-[15px] font-medium', c)}>{v}</p></div>
            ))}
          </div>
          <ProductTable products={products.filter((p) => p.active)} categories={catNames} actions={actions} sel={sel} setSel={setSel} />
        </>
      )}
      {tab === 'inactive' && <ProductTable products={products.filter((p) => !p.active)} categories={catNames} actions={actions} sel={sel} setSel={setSel} emptyText="No inactive products. Switch a product off in the Active column to see it here." />}
      {tab === 'categories-brands' && (
        <CategoriesBrands categories={categories} brands={brands} onSaveCategory={saveNamed(setCategories)} onSaveBrand={saveNamed(setBrands)} />
      )}
      {placeholders[tab] && (
        <div className="border-ed-line text-ed-muted mt-6 rounded-xl border bg-white px-6 py-16 text-center">
          <p className="text-ed-text text-[15px] font-medium">{placeholders[tab][0]}</p><p className="mt-1 text-[13px]">{placeholders[tab][1]}</p>
        </div>
      )}

      {form && <ProductForm product={form.product} categories={catNames} brands={brands.map((b) => b.name)} onClose={() => setForm(null)} onSave={save} onAddCategory={() => setNameDlg('category')} onAddBrand={() => setNameDlg('brand')} />}
      {tagFor && <ProductTagsModal products={tagFor} onClose={() => setTagFor(null)} onApply={(mode, tags) => {
        const ids = new Set(tagFor.map((p) => p.id));
        setProducts((l) => l.map((x) => (ids.has(x.id) ? { ...x, tags: mode === 'add' ? Array.from(new Set([...x.tags, ...tags])) : x.tags.filter((t) => !tags.includes(t)) } : x)));
        setTagFor(null); flash('Tags updated');
      }} />}
      {(tab === 'products' || tab === 'inactive') && picked.length > 0 && <BulkBar count={picked.length} onClear={() => setSel(new Set())} onAction={bulkAction} />}
      {bulk === 'barcode' && <PrintBarcodesModal products={picked} onClose={() => setBulk(null)} />}
      {bulk === 'update' && <BulkUpdateModal products={picked} categories={catNames} brands={brands.map((b) => b.name)} onClose={() => setBulk(null)} onApply={(fn) => applyAll(fn, `${picked.length} product${picked.length > 1 ? 's' : ''} updated`)} />}
      {bulk === 'image' && <BulkImageModal products={picked} onClose={() => setBulk(null)} onApply={(src) => applyAll((p) => ({ ...p, images: [{ src }, ...p.images.slice(1)] }), 'Image applied')} />}
      {bulk === 'copy' && <CopyBusinessModal count={picked.length} businesses={['Elishine']} onClose={() => setBulk(null)} onCopy={(b, all) => { setBulk(null); flash(`Copy request sent: ${all ? productStats.products : picked.length} products to ${b}`); }} />}
      {bulk === 'variation' && <VariationGroupModal onClose={() => setBulk(null)} />}
      {nameDlg && <NameDialog title={nameDlg === 'category' ? 'Add Category' : 'Add Brand'} label={nameDlg === 'category' ? 'Category name' : 'Brand name'} initial="" onClose={() => setNameDlg(null)} onSave={(n) => { saveNamed(nameDlg === 'category' ? setCategories : setBrands)(null, n); setNameDlg(null); }} />}
      {io && (
        <Dialog title="Import / Export" desc="Download your catalog as a CSV file." onClose={() => setIo(false)} width="max-w-[460px]">
          <div className="flex flex-col gap-2.5">
            <button type="button" onClick={exportCsv} className={cn(btnPrimary, 'justify-center')}>Export products (CSV) · {products.length}</button>
            <button type="button" disabled className={cn(btnOut, 'justify-center opacity-50')}>Import from CSV (not connected yet)</button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
