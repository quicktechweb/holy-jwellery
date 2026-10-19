'use client';

import { useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, DollarSign, ImageOff, Package, Settings, Tag, Upload } from 'lucide-react';
import { barRuns, barcodeSvgString, code128 } from '@/lib/barcode';
import { money, productStats, type Product } from '@/data/products';
import { cn } from '@/lib/utils';
import { Dialog, Switch, Tick, btnOut, btnPrimary } from './ui';

const input = 'border-ed-line focus:border-ed-brand/50 focus:ring-ed-brand/20 h-10 w-full rounded-lg border bg-white px-3 text-[13.5px] outline-none placeholder:text-ed-muted/70 focus:ring-2';
const foot = '-mx-6 mt-6 flex justify-end gap-3 border-t border-ed-line px-6 pt-5';
const dis = 'h-10 rounded-lg px-5 text-[13.5px] font-medium text-white bg-ed-brand transition enabled:hover:brightness-110 disabled:opacity-50';

function Sel({ value, onChange, options, className }: { value: string; onChange: (v: string) => void; options: [string, string][]; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(input, 'cursor-pointer appearance-none pr-9')}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2" />
    </div>
  );
}
const Field = ({ label, help, cur, children }: { label: string; help: string; cur: string; children: ReactNode }) => (
  <div><label className="mb-1.5 block text-[13.5px] font-medium">{label}</label>{children}{help && <p className="text-ed-text/60 mt-2 text-[13px]">{help}</p>}<p className="text-ed-muted mt-1 text-[11px]">Current: {cur}</p></div>
);
const curOf = <T,>(ps: Product[], f: (p: Product) => T, fmt: (v: T) => string = String) => { const v = ps.map(f); return v.every((x) => x === v[0]) ? fmt(v[0]) : 'Mixed'; };

function SelectedBox({ products, icon: Icon, note }: { products: Product[]; icon: typeof Package; note?: string }) {
  return (
    <div className="border-ed-line rounded-xl border px-5 py-4">
      <p className="flex items-center gap-3 text-[14px] font-medium"><Icon className="size-4" /> Selected Products:</p>
      <div className="mt-2.5 flex max-h-[84px] flex-wrap gap-2 overflow-y-auto pl-7">
        {products.map((p) => <span key={p.id} className="rounded-md bg-[#f5f4f8] px-2.5 py-1 text-[12px]">{p.code} - {p.name}</span>)}
      </div>
      {note && <p className="text-ed-text/65 mt-2.5 pl-7 text-[13px]">{note}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------- Print Barcodes */
const stickerOpts = ['SKU', 'Price', 'Product Name', 'Variation', 'Regular Price', 'Brand', 'Category', 'Short Description', 'Warranty'] as const;
type StickerOpt = (typeof stickerOpts)[number];

function stickerLines(p: Product, on: Set<StickerOpt>) {
  const lines: { t: string; cls: string; strike?: boolean }[] = [];
  if (on.has('Product Name')) lines.push({ t: p.name, cls: 'name' });
  if (on.has('Category') && p.category) lines.push({ t: p.category, cls: 'meta' });
  if (on.has('Brand') && p.brand) lines.push({ t: p.brand, cls: 'meta' });
  if (on.has('Short Description') && p.shortDesc) lines.push({ t: p.shortDesc, cls: 'meta' });
  if (on.has('Warranty') && p.warranty) lines.push({ t: p.warranty, cls: 'meta' });
  return lines;
}

export function PrintBarcodesModal({ products, onClose }: { products: Product[]; onClose: () => void }) {
  const [on, setOn] = useState<Set<StickerOpt>>(new Set(['SKU', 'Price', 'Product Name']));
  const [bw, setBw] = useState('18'); const [bh, setBh] = useState('9');
  const [pw, setPw] = useState('45'); const [ph, setPh] = useState('35');
  const [a4, setA4] = useState(false);
  const [qty, setQty] = useState<Record<string, string>>({});
  const first = products[0];
  const toggle = (o: StickerOpt) => setOn((s) => { const n = new Set(s); n.has(o) ? n.delete(o) : n.add(o); return n; });
  const bits = useMemo(() => code128(first.code), [first.code]);
  const showReg = on.has('Regular Price') && first.webPrice > first.sellPrice;

  const print = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
    const labels = products.flatMap((p) => Array.from({ length: Math.max(1, Number(qty[p.id]) || 1) }, () => {
      const reg = on.has('Regular Price') && p.webPrice > p.sellPrice ? `<div class="reg">৳${money(p.webPrice)}</div>` : '';
      return `<div class="label">${stickerLines(p, on).filter((l) => l.cls === 'name').map((l) => `<div class="name">${esc(l.t)}</div>`).join('')}<div class="bar">${barcodeSvgString(p.code, Math.max(8, Number(bh) * 3.78))}</div>${on.has('SKU') ? `<div class="sku">${esc(p.code)}</div>` : ''}${reg}${on.has('Price') ? `<div class="price">৳${money(p.sellPrice)}</div>` : ''}${stickerLines(p, on).filter((l) => l.cls === 'meta').map((l) => `<div class="meta">${esc(l.t)}</div>`).join('')}</div>`;
    }));
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Barcodes</title><style>
      @page{size:${a4 ? 'A4' : `${pw}mm ${ph}mm`};margin:${a4 ? '8mm' : '0'}}
      body{margin:0;font-family:Arial,sans-serif;${a4 ? 'display:flex;flex-wrap:wrap;gap:2mm' : ''}}
      .label{box-sizing:border-box;width:${pw}mm;height:${ph}mm;padding:1.5mm;text-align:center;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;page-break-after:${a4 ? 'auto' : 'always'}}
      .bar{width:${bw}mm;max-width:100%}.name{font-size:7pt;font-weight:700;line-height:1.1;margin-bottom:1mm}.sku{font-family:monospace;font-size:7pt}
      .price{font-size:9pt;font-weight:700}.reg{font-size:7pt;text-decoration:line-through}.meta{font-size:6pt}
    </style></head><body>${labels.join('')}<script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
    onClose();
  };

  return (
    <Dialog title="Print Barcodes" onClose={onClose} width="max-w-[896px]">
      <div className="mt-2 grid gap-6 md:grid-cols-[1fr_340px]">
        <div>
          <p className="text-[14px] font-medium">Show on sticker</p>
          <p className="text-ed-text/60 mt-1 text-[11.5px]">The barcode always encodes the SKU. These choose the text printed with it.</p>
          <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3.5">
            {stickerOpts.map((o) => <label key={o} className="flex cursor-pointer items-center gap-2.5 text-[13.5px]"><Tick checked={on.has(o)} onChange={() => toggle(o)} label={o} />{o}</label>)}
          </div>
          <p className="text-ed-text/60 mt-4 text-[11.5px]">Regular Price prints crossed out, only when it is higher than the price.</p>
        </div>
        <div>
          <p className="text-[14px] font-medium">Preview</p>
          <div className="border-ed-line mt-2 flex min-h-[262px] flex-col items-center justify-center rounded-lg border bg-white px-5 py-4 text-center">
            {on.has('Product Name') && <p className="text-[19px] leading-tight font-bold uppercase">{first.name}</p>}
            <svg viewBox={`0 0 ${bits.length} 1`} preserveAspectRatio="none" className="mt-2 h-[68px] w-full" fill="#000">{barRuns(bits).map((r) => <rect key={r.x} x={r.x} y={0} width={r.w} height={1} />)}</svg>
            {on.has('SKU') && <p className="mt-1 font-mono text-[22px] leading-tight">{first.code}</p>}
            {showReg && <p className="text-ed-muted text-[15px] line-through">৳{money(first.webPrice)}</p>}
            {on.has('Price') && <p className="text-[32px] leading-tight font-bold">৳{money(first.sellPrice)}</p>}
            {stickerLines(first, on).filter((l) => l.cls === 'meta').map((l) => <p key={l.t} className="text-ed-muted text-[12px]">{l.t}</p>)}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-x-4 gap-y-4 sm:grid-cols-2">
        {([['Barcode Width (mm)', bw, setBw], ['Barcode Height (mm)', bh, setBh], ['Paper Width (mm)', pw, setPw], ['Paper Height (mm)', ph, setPh]] as const).map(([l, v, s]) => (
          <div key={l}><label className="mb-1.5 block text-[13.5px] font-medium">{l}</label><input type="number" min={1} value={v} onChange={(e) => s(e.target.value)} className={input} /></div>
        ))}
      </div>
      <label className="mt-5 flex items-center gap-3 text-[13.5px] font-medium"><Switch small on={a4} onChange={setA4} label="Print on A4 paper" /> Print on A4 Paper</label>

      <div className="border-ed-line mt-5 overflow-hidden rounded-lg border">
        <table className="w-full text-left text-[13.5px]">
          <thead><tr className="text-ed-text/70 border-ed-line border-b bg-[#faf9fc]"><th className="w-[95px] px-4 py-3.5 font-medium">Image</th><th className="w-[195px] font-medium">Code</th><th className="font-medium">Name</th><th className="w-[140px] pr-4 font-medium">Quantity</th></tr></thead>
          <tbody>{products.map((p) => (
            <tr key={p.id} className="border-ed-line border-b last:border-b-0">
              <td className="px-4 py-3"><span className="block size-10 rounded-md" style={{ background: p.images[0]?.bg ?? '#e9e6ee' }} /></td>
              <td>{p.code}</td><td>{p.name}</td>
              <td className="pr-4"><input type="number" min={1} aria-label={`Quantity ${p.code}`} placeholder="1" value={qty[p.id] ?? ''} onChange={(e) => setQty((q) => ({ ...q, [p.id]: e.target.value }))} className={cn(input, 'w-[80px]')} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className={foot}><button type="button" onClick={print} className={dis}>Print</button></div>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- Bulk Update */
type Act = '' | 'set' | 'clear';
const tri: [string, string][] = [['', 'No Change'], ['on', 'Enable'], ['off', 'Disable']];

export function BulkUpdateModal({ products, categories, brands, onClose, onApply }: {
  products: Product[]; categories: string[]; brands: string[]; onClose: () => void; onApply: (fn: (p: Product) => Product) => void;
}) {
  const [mode, setMode] = useState<'shared' | 'per'>('shared');
  const [sub, setSub] = useState<'pricing' | 'categories' | 'stock' | 'settings'>('pricing');
  const [f, setF] = useState({ sell: '', cost: '', catAct: '' as Act, cat: '', brandAct: '' as Act, brand: '', adj: false, adjMode: 'add', adjQty: '', outAlert: '', inAlert: '', weight: '', note: '', warranty: '', manage: '', featured: '', active: '' });
  const [per, setPer] = useState<Record<string, { cost: string; sell: string; qty: string }>>(() => Object.fromEntries(products.map((p) => [p.id, { cost: String(p.costPrice), sell: String(p.sellPrice), qty: String(p.qty) }])));
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const n = products.length;
  const numOr = (s: string, d: number) => (s.trim() === '' || Number.isNaN(Number(s)) ? d : Number(s));
  const tf = (v: string, cur: boolean) => (v === 'on' ? true : v === 'off' ? false : cur);

  const apply = () => {
    onApply((p) => {
      if (mode === 'per') { const r = per[p.id]; return r ? { ...p, costPrice: numOr(r.cost, p.costPrice), sellPrice: numOr(r.sell, p.sellPrice), qty: numOr(r.qty, p.qty) } : p; }
      let qty = p.qty;
      if (f.adj && f.adjQty.trim() !== '') { const q = Number(f.adjQty) || 0; qty = f.adjMode === 'add' ? p.qty + q : f.adjMode === 'subtract' ? p.qty - q : q; }
      return {
        ...p, sellPrice: numOr(f.sell, p.sellPrice), costPrice: numOr(f.cost, p.costPrice), qty,
        category: f.catAct === 'set' && f.cat ? f.cat : f.catAct === 'clear' ? 'Uncategorized' : p.category,
        brand: f.brandAct === 'set' && f.brand ? f.brand : f.brandAct === 'clear' ? '' : p.brand,
        alertQty: numOr(f.outAlert, p.alertQty), stockInAlert: numOr(f.inAlert, p.stockInAlert), weight: numOr(f.weight, p.weight),
        shippingNote: f.note.trim() || p.shippingNote, warranty: f.warranty.trim() || p.warranty,
        manageStock: tf(f.manage, p.manageStock), featured: tf(f.featured, p.featured), active: tf(f.active, p.active),
      };
    });
  };

  const subTabs = [['pricing', 'Pricing', DollarSign], ['categories', 'Categories', Tag], ['stock', 'Stock', Package], ['settings', 'Settings', Settings]] as const;
  const catOpts: [string, string][] = [['', 'Select category update action'], ['set', 'Set to a category'], ['clear', 'Remove category']];
  const brandOpts: [string, string][] = [['', 'Select brand update action'], ['set', 'Set to a brand'], ['clear', 'Remove brand']];
  const state = (p: Product, k: 'manageStock' | 'featured' | 'active') => (p[k] ? 'Enabled' : 'Disabled');
  const money0 = (v: number) => money(v);

  return (
    <Dialog title="Bulk Update Products" desc={`Update ${n} selected product${n > 1 ? 's' : ''}. Only fields you fill in will be updated.`} onClose={onClose} width="max-w-[1152px]">
      <SelectedBox products={products} icon={Package} />
      <div className="mt-4 grid grid-cols-2 rounded-lg bg-[#f3f1f7] p-0.5 text-[13.5px] font-medium">
        {([['shared', 'Shared Fields'], ['per', 'Per Product Price/Stock']] as const).map(([k, l]) => <button key={k} type="button" onClick={() => setMode(k)} className={cn('h-10 rounded-md transition', mode === k ? 'bg-ed-brand text-white shadow' : 'text-ed-text/70')}>{l}</button>)}
      </div>

      {mode === 'shared' ? (
        <>
          <div className="mt-2 grid grid-cols-4 rounded-lg bg-[#f3f1f7] p-0.5 text-[13.5px] font-medium">
            {subTabs.map(([k, l, I]) => <button key={k} type="button" onClick={() => setSub(k)} className={cn('flex h-10 items-center justify-center gap-2 rounded-md transition', sub === k ? 'bg-ed-brand text-white shadow' : 'text-ed-text/70')}><I className="size-4" />{l}</button>)}
          </div>
          <div className="mt-4 space-y-5">
            {sub === 'pricing' && (
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {([['Selling Price', 'sell', 'selling price', (p: Product) => p.sellPrice], ['Cost Price', 'cost', 'cost price', (p: Product) => p.costPrice]] as const).map(([l, k, w, g]) => (
                  <Field key={k} label={l} help={`Update ${w} for all selected products`} cur={curOf(products, g, money0)}>
                    <div className="relative"><span className="text-ed-muted absolute top-1/2 left-3 -translate-y-1/2 text-[12px]">৳</span><input type="number" min={0} value={f[k]} onChange={(e) => set(k, e.target.value)} placeholder="Leave empty to keep current" className={cn(input, 'pl-7')} /></div>
                  </Field>
                ))}
              </div>
            )}
            {sub === 'categories' && (
              <>
                <Field label="Product Category" help="Update category for all selected products" cur={curOf(products, (p) => p.category, (v) => v || 'Not set')}>
                  <Sel value={f.catAct} onChange={(v) => set('catAct', v as Act)} options={catOpts} />
                  {f.catAct === 'set' && <Sel className="mt-2" value={f.cat} onChange={(v) => set('cat', v)} options={[['', 'Choose category'], ...categories.map((c): [string, string] => [c, c])]} />}
                </Field>
                <Field label="Product Brand" help="Update brand for all selected products" cur={curOf(products, (p) => p.brand, (v) => v || 'Not set')}>
                  <Sel value={f.brandAct} onChange={(v) => set('brandAct', v as Act)} options={brandOpts} />
                  {f.brandAct === 'set' && <Sel className="mt-2" value={f.brand} onChange={(v) => set('brand', v)} options={[['', brands.length ? 'Choose brand' : 'No brands yet'], ...brands.map((c): [string, string] => [c, c])]} />}
                </Field>
              </>
            )}
            {sub === 'stock' && (
              <>
                <div className="border-ed-line rounded-xl border px-4 py-3.5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-[13.5px] font-medium">Adjust Stock Quantity</p><p className="text-ed-text/65 text-[13px]">Add, subtract, or set stock for all products</p><p className="text-ed-muted mt-1 text-[11px]">Current stock: {curOf(products, (p) => p.qty)} units</p></div>
                    <Switch small on={f.adj} onChange={(v) => set('adj', v)} label="Adjust stock quantity" />
                  </div>
                  {f.adj && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Sel value={f.adjMode} onChange={(v) => set('adjMode', v)} options={[['add', 'Add to stock'], ['subtract', 'Subtract from stock'], ['set', 'Set stock to']]} />
                      <input type="number" value={f.adjQty} onChange={(e) => set('adjQty', e.target.value)} placeholder="Quantity" className={input} />
                    </div>
                  )}
                </div>
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <Field label="Stock Out Alert Quantity" help="Alert when stock falls below this level" cur={curOf(products, (p) => p.alertQty)}><input type="number" min={0} value={f.outAlert} onChange={(e) => set('outAlert', e.target.value)} placeholder="Leave empty to keep current" className={input} /></Field>
                  <Field label="Stock In Alert Quantity" help="Alert when stock reaches this level" cur={curOf(products, (p) => p.stockInAlert)}><input type="number" min={0} value={f.inAlert} onChange={(e) => set('inAlert', e.target.value)} placeholder="Leave empty to keep current" className={input} /></Field>
                </div>
              </>
            )}
            {sub === 'settings' && (
              <>
                <Field label="Product Weight (kg)" help="Update weight for shipping calculations" cur={curOf(products, (p) => p.weight)}><input type="number" min={0} value={f.weight} onChange={(e) => set('weight', e.target.value)} placeholder="Leave empty to keep current" className={input} /></Field>
                <Field label="Shipping Note" help="Default note for shipping" cur={curOf(products, (p) => p.shippingNote, (v) => v || 'Not set')}><input value={f.note} onChange={(e) => set('note', e.target.value)} placeholder="Leave empty to keep current" className={input} /></Field>
                <Field label="Warranty" help="Product warranty information" cur={curOf(products, (p) => p.warranty, (v) => v || 'Not set')}><input value={f.warranty} onChange={(e) => set('warranty', e.target.value)} placeholder="e.g., 1 Year, 6 Months" className={input} /></Field>
                {([['Manage Stock', 'manage', 'manageStock'], ['Featured Status', 'featured', 'featured'], ['Active Status', 'active', 'active']] as const).map(([l, k, pk]) => (
                  <Field key={k} label={l} help="" cur={curOf(products, (p) => state(p, pk))}>
                    <Sel value={f[k]} onChange={(v) => set(k, v)} options={tri} />
                  </Field>
                ))}
              </>
            )}
          </div>
        </>
      ) : (
        <div className="border-ed-line mt-4 overflow-hidden rounded-lg border">
          <table className="w-full text-left text-[13.5px]">
            <thead><tr className="text-ed-text/70 border-ed-line border-b bg-[#faf9fc] text-[12.5px]"><th className="px-4 py-3 font-medium">Product</th><th className="w-[140px] font-medium">Cost Price</th><th className="w-[140px] font-medium">Selling Price</th><th className="w-[120px] pr-4 font-medium">Stock Qty</th></tr></thead>
            <tbody>{products.map((p) => (
              <tr key={p.id} className="border-ed-line border-b last:border-b-0">
                <td className="px-4 py-2.5"><p className="max-w-[420px] truncate">{p.name}</p><p className="text-ed-muted text-[11.5px]">{p.code}</p></td>
                {(['cost', 'sell', 'qty'] as const).map((k) => <td key={k} className={k === 'qty' ? 'pr-4' : 'pr-3'}><input type="number" aria-label={`${k} ${p.code}`} value={per[p.id]?.[k] ?? ''} onChange={(e) => setPer((s) => ({ ...s, [p.id]: { ...s[p.id], [k]: e.target.value } }))} className={cn(input, 'h-9')} /></td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onClose} className={cn(btnOut, 'font-medium')}>Cancel</button>
        <button type="button" onClick={() => { apply(); }} className={btnPrimary}>Update Products</button>
      </div>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- Bulk Image Upload */
export function BulkImageModal({ products, onClose, onApply }: { products: Product[]; onClose: () => void; onApply: (src: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
  const n = products.length;
  return (
    <Dialog title="Bulk Image Upload" desc={`Upload one image and apply it to ${n} selected product${n > 1 ? 's' : ''}.`} onClose={onClose} width="max-w-[768px]">
      <SelectedBox products={products} icon={Upload} note={`This will replace the current image for all selected product${n > 1 ? 's' : ''}.`} />
      <p className="mt-5 text-[14px] font-medium">Product Image</p>
      <button type="button" onClick={() => ref.current?.click()} className="border-ed-line hover:border-ed-brand/40 mt-2 flex h-[54px] w-full items-center justify-center gap-2.5 rounded-lg border border-dashed bg-[#fdfcfe] text-[14px]"><Upload className="size-4" /> Choose File</button>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <p className="text-ed-text/65 mt-3 text-[13px]">{file ? file.name : 'No file chosen'}</p>
      <div className="border-ed-line mt-3 flex h-[186px] flex-col items-center justify-center rounded-lg border bg-white">
        {preview ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={preview} alt="Selected" className="max-h-[150px] rounded-lg object-contain" />
          : <><span className="flex size-[128px] items-center justify-center rounded-xl bg-[#f5f4f8]"><ImageOff className="text-ed-text/60 size-9" strokeWidth={1.4} /></span><p className="text-ed-muted mt-2 text-[11.5px]">No image selected</p></>}
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onClose} className={cn(btnOut, 'font-medium')}>Cancel</button>
        <button type="button" disabled={!file} onClick={() => file && onApply(preview)} className={cn(dis, 'h-11')}>Upload and Apply</button>
      </div>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- Copy to business */
export function CopyBusinessModal({ count, businesses, onClose, onCopy }: { count: number; businesses: string[]; onClose: () => void; onCopy: (biz: string, all: boolean) => void }) {
  const [all, setAll] = useState(false);
  const [biz, setBiz] = useState('');
  const [open, setOpen] = useState(false);
  return (
    <Dialog title="Copy Products to Another Business" desc={`Copy ${all ? productStats.products : count} selected products`} onClose={onClose} width="max-w-[512px]">
      <label className="mt-1 flex cursor-pointer items-center gap-3 text-[13.5px] font-medium"><Tick checked={all} onChange={setAll} label="Select all products" /> Select all products ({productStats.products} products)</label>
      <div className="relative mt-4">
        <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={cn(input, 'flex items-center justify-between text-left', open && 'border-ed-brand/50 ring-ed-brand/20 ring-2')}>
          <span className={biz ? '' : 'text-ed-text/80'}>{biz || 'Select business'}</span><ChevronDown className="text-ed-muted size-4" />
        </button>
        {open && (
          <ul role="listbox" className="border-ed-line absolute top-[46px] right-0 left-0 z-10 rounded-xl border bg-white p-1.5 shadow-[0_12px_32px_rgba(30,20,50,0.16)]">
            {businesses.map((b) => <li key={b}><button type="button" role="option" aria-selected={biz === b} onClick={() => { setBiz(b); setOpen(false); }} className="bg-ed-brand-soft text-ed-brand hover:brightness-95 h-10 w-full rounded-lg px-3 text-left text-[13.5px]">{b}</button></li>)}
          </ul>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className={cn(btnOut, 'font-medium')}>Cancel</button>
        <button type="button" disabled={!biz} onClick={() => onCopy(biz, all)} className={cn(dis, 'h-11')}>Copy Products</button>
      </div>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- Variation group */
export function VariationGroupModal({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="Add To Variation Group" desc="Add the selected products into an existing variation group by assigning values for that group's attributes." onClose={onClose} width="max-w-[896px]">
      <p className="mt-8 mb-1.5 text-[14px] font-medium">Variation Group</p>
      <div className="relative"><div className={cn(input, 'text-ed-muted flex items-center bg-[#faf9fc]')}>Select a variation group</div><ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2" /></div>
      <p className="text-ed-text/70 mt-3 mb-6 text-[13.5px]">No variation groups available. Create one first.</p>
      <div className={foot}>
        <button type="button" onClick={onClose} className={cn(btnOut, 'h-11 font-medium')}>Cancel</button>
        <button type="button" disabled className={cn(dis, 'h-11')}>Add Products</button>
      </div>
    </Dialog>
  );
}
