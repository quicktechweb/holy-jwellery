'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { BookOpen, CalendarDays, ChevronDown, Gem, HelpCircle, ImageIcon, Plus, Receipt, ShoppingBag, Star, X } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { GuideModal } from '@/components/courier/ui';
import { catalog, QUICK_SUPPLIER, suppliers, type CatalogProduct } from '@/data/purchase';
import { purchaseActions } from '@/lib/purchaseStore';
import { cn } from '@/lib/utils';
import { longDate, num, todayIso } from './format';
import { inputCls } from './ui';

interface Line { pid: string; qty: number; price: number }
interface Extra { id: number; label: string; amount: string }

const VENDORS = suppliers.filter((s) => s.name !== QUICK_SUPPLIER).map((s) => s.name);

function Thumb({ p, size = 96 }: { p: CatalogProduct; size?: number }) {
  const r = size > 60 ? 'rounded-xl' : 'rounded-lg';
  return p.tint ? (
    <div className={cn('flex shrink-0 items-center justify-center text-white/70', r)} style={{ width: size, height: size, background: `linear-gradient(135deg, ${p.tint[0]}, ${p.tint[1]})` }}>
      <Gem style={{ width: size / 3, height: size / 3 }} strokeWidth={1.4} />
    </div>
  ) : (
    <div className={cn('border-ed-line bg-[#f7f6fa] text-ed-muted font-plain flex shrink-0 flex-col items-center justify-center border', r)} style={{ width: size, height: size }}>
      <ImageIcon style={{ width: size / 4, height: size / 4 }} strokeWidth={1.4} />
      {size > 60 && <span className="mt-1 text-[10px]">No Image</span>}
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-ed-line flex items-center gap-2.5 border-b px-6 py-5 text-[17px] font-medium">{Icon && <Icon className="size-[18px]" />}{title}</div>
      <div className="p-6">{children}</div>
    </Card>
  );
}

export function NewPurchase() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [favFirst, setFavFirst] = useState(true);
  const [favs, setFavs] = useState<Set<string>>(new Set(catalog.filter((c) => c.fav).map((c) => c.id)));
  const [lines, setLines] = useState<Line[]>([]);
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(todayIso);
  const [note, setNote] = useState('');
  const [extras, setExtras] = useState<Extra[]>([]);
  const [pay, setPay] = useState<'later' | 'partial' | 'full'>('later');
  const [partial, setPartial] = useState('');
  const [receiveNow, setReceiveNow] = useState(true);
  const [guide, setGuide] = useState(false);

  const byId = useMemo(() => new Map(catalog.map((c) => [c.id, c])), []);
  const list = useMemo(() => {
    const f = catalog.filter((c) => c.sku.toLowerCase().includes(code.trim().toLowerCase()) && c.name.toLowerCase().includes(name.trim().toLowerCase()));
    return favFirst ? [...f].sort((a, b) => Number(favs.has(b.id)) - Number(favs.has(a.id))) : f;
  }, [code, name, favFirst, favs]);

  const added = new Set(lines.map((l) => l.pid));
  const totalQty = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const extraTotal = extras.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const grand = subtotal + extraTotal;
  const partialAmt = Number(partial) || 0;
  const valid = !!vendor && lines.length > 0 && lines.every((l) => l.qty > 0 && l.price >= 0) && (pay !== 'partial' || (partialAmt > 0 && partialAmt <= grand));

  const patchLine = (pid: string, p: Partial<Line>) => setLines((ls) => ls.map((l) => (l.pid === pid ? { ...l, ...p } : l)));

  const create = () => {
    if (!valid) return;
    const now = new Date();
    purchaseActions.add({
      id: `n${Date.now()}`,
      date: `${date}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      supplier: vendor, source: 'Purchase', note: note.trim(),
      extras: extras.filter((e) => Number(e.amount)).map((e) => ({ label: e.label.trim(), amount: Number(e.amount) })),
      amount: grand, paid: pay === 'full' ? grand : pay === 'partial' ? partialAmt : 0,
      receive: receiveNow ? 'Received' : 'Pending',
      items: lines.map((l) => ({ id: `${Date.now()}-${l.pid}`, name: byId.get(l.pid)!.name, sku: byId.get(l.pid)!.sku, qty: l.qty, price: l.price })),
    });
    router.push('/dashboard/purchase/list');
  };

  return (
    <div className="mx-auto max-w-[1400px] pt-9">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-tight font-medium tracking-tight">New Purchase</h1>
          <p className="text-ed-text/65 mt-0.5 text-[14px]">Create a new purchase order for your inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setGuide(true)} className="border-ed-line hover:text-ed-brand flex h-11 items-center gap-2 rounded-lg border bg-white px-5 text-[14px] shadow-sm"><BookOpen className="size-4" /> Guide</button>
          <Link href="/dashboard/purchase/list" className="border-ed-line hover:text-ed-brand flex h-11 items-center rounded-lg border bg-white px-5 text-[14px] shadow-sm">View Purchase List</Link>
        </div>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_500px]">
        {/* left */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="border-ed-line flex items-center gap-2.5 border-b px-6 py-5 text-[17px] font-medium"><ShoppingBag className="size-[18px]" /> Add Products</div>
            <div className="p-6">
              <div className="border-ed-line rounded-xl border">
                <div className="border-ed-line flex items-center justify-between border-b px-5 py-4">
                  <h2 className="text-[19px] font-medium">Click To Add Products</h2>
                  <span title="Click a product card to add it to this purchase"><HelpCircle className="text-ed-muted size-4" /></span>
                </div>
                <div className="p-4">
                  <div className="flex items-end gap-2.5">
                    <label className="block flex-1"><span className="text-ed-text/80 mb-1.5 block text-[13.5px]">Code/sku</span><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Type to Search.." className={inputCls} /></label>
                    <label className="block flex-1"><span className="text-ed-text/80 mb-1.5 block text-[13.5px]">Name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type to Search.." className={inputCls} /></label>
                    <button type="button" onClick={() => setFavFirst((f) => !f)} aria-pressed={favFirst} title="Favourites first"
                      className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-[#f5b301] bg-white', favFirst ? 'text-[#f5b301]' : 'text-[#f5b301]/50')}>
                      <Star className="size-5" fill={favFirst ? '#f5b301' : 'none'} />
                    </button>
                  </div>
                  <ul className="thin-scroll mt-4 max-h-[560px] space-y-3 overflow-y-auto pr-2">
                    {list.map((p) => {
                      const on = added.has(p.id);
                      return (
                        <li key={p.id}>
                          <div role="button" tabIndex={0} aria-disabled={on} title={on ? 'Already added' : 'Add to purchase'}
                            onClick={() => !on && setLines((l) => [...l, { pid: p.id, qty: 1, price: p.price }])}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !on && setLines((l) => [...l, { pid: p.id, qty: 1, price: p.price }])}
                            className={cn('font-plain relative flex gap-4 rounded-xl border border-transparent bg-white p-3 shadow-[0_1px_6px_rgba(30,20,50,0.1)] transition', on ? 'cursor-default opacity-55' : 'hover:border-ed-brand/25 cursor-pointer')}>
                            <Thumb p={p} />
                            <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                              <div><p className="pr-8 text-[15px]">{p.name}</p><p className="mt-1 text-[15px] font-bold">SKU1: {p.sku}</p></div>
                              <div className="flex items-end justify-between pr-4 text-[14px]"><span>Purchase Price: ৳{num(p.price)}</span><span>Stock: {p.stock}</span></div>
                            </div>
                            <button type="button" aria-label={favs.has(p.id) ? 'Remove favourite' : 'Add favourite'} onClick={(e) => { e.stopPropagation(); setFavs((s) => { const x = new Set(s); if (x.has(p.id)) x.delete(p.id); else x.add(p.id); return x; }); }}
                              className="absolute top-3 right-4 text-[#f5b301]"><Star className="size-[18px]" fill={favs.has(p.id) ? '#f5b301' : 'none'} /></button>
                          </div>
                        </li>
                      );
                    })}
                    {list.length === 0 && <li className="text-ed-muted py-10 text-center text-[13px]">No products match.</li>}
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {lines.length > 0 && (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <h3 className="text-[17px] font-medium">Items ({lines.length})</h3>
                <span className="bg-ed-bg rounded-full px-3.5 py-1.5 text-[14px] font-semibold">৳{num(subtotal)}</span>
              </div>
              <ul className="space-y-3 px-6 pb-6">
                {lines.map((l) => {
                  const p = byId.get(l.pid)!;
                  return (
                    <li key={l.pid} className="border-ed-line flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3 shadow-[0_1px_4px_rgba(30,20,50,0.06)]">
                      <Thumb p={p} size={48} />
                      <div className="min-w-[140px] flex-1"><p className="text-[14.5px] font-medium">{p.name}</p><p className="text-ed-muted text-[12px]">{p.sku}</p></div>
                      <input type="number" min="1" aria-label="Quantity" value={l.qty} onChange={(e) => patchLine(l.pid, { qty: Math.max(0, Math.floor(Number(e.target.value)) || 0) })} className="border-ed-line focus:border-ed-brand/40 h-10 w-20 rounded-lg border bg-[#f7f6fa] text-center text-[14px] outline-none" />
                      <div className="border-ed-line flex h-10 w-[120px] items-center gap-2 rounded-lg border bg-[#f7f6fa] px-3 text-[14px]">
                        <span className="text-ed-muted">৳</span>
                        <input type="number" min="0" step="any" aria-label="Unit price" value={l.price} onChange={(e) => patchLine(l.pid, { price: Number(e.target.value) || 0 })} className="w-full bg-transparent text-right outline-none" />
                      </div>
                      <span className="w-[110px] truncate text-right text-[14px] font-semibold">৳{num(l.qty * l.price)}</span>
                      <button type="button" aria-label="Remove item" onClick={() => setLines((ls) => ls.filter((x) => x.pid !== l.pid))} className="text-ed-muted hover:text-ed-red flex size-8 items-center justify-center"><X className="size-4" /></button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>

        {/* right */}
        <div className="space-y-6">
          <Panel title="Purchase Details">
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-ed-text/80 mb-1.5 block text-[13px]">Vendor <span className="text-ed-red">*</span></span>
                <div className="relative">
                  <select value={vendor} onChange={(e) => setVendor(e.target.value)} className={cn(inputCls, 'cursor-pointer appearance-none bg-white pr-9', !vendor && 'text-ed-muted')}>
                    <option value="">Select vendor</option>
                    {VENDORS.map((v) => <option key={v} value={v} className="text-ed-text">{v}</option>)}
                  </select>
                  <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
                </div>
              </label>
              <label className="block">
                <span className="text-ed-text/80 mb-1.5 block text-[13px]">Purchase Date</span>
                <div className="relative">
                  <div className={cn(inputCls, 'flex items-center gap-2.5 bg-white')}><CalendarDays className="size-4" /><span suppressHydrationWarning>{date ? longDate(date) : 'Pick a date'}</span></div>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} onClick={(e) => e.currentTarget.showPicker?.()} aria-label="Purchase date" className="absolute inset-0 cursor-pointer opacity-0" />
                </div>
              </label>
            </div>
            <label className="mt-5 block">
              <span className="text-ed-text/80 mb-1.5 block text-[13px]">Note</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Add purchase notes..." className={cn(inputCls, 'h-[60px] resize-y bg-[#fbfafd] py-2.5')} />
            </label>
          </Panel>

          <Card className="overflow-hidden">
            <div className="border-ed-line border-b px-6 py-5 text-[17px] font-medium">Extra Costs</div>
            <div className="space-y-3 p-6">
              {extras.map((e) => (
                <div key={e.id} className="flex items-center gap-2">
                  <input value={e.label} onChange={(ev) => setExtras((x) => x.map((r) => (r.id === e.id ? { ...r, label: ev.target.value } : r)))} placeholder="e.g. Shipping" className={inputCls} />
                  <input type="number" min="0" value={e.amount} onChange={(ev) => setExtras((x) => x.map((r) => (r.id === e.id ? { ...r, amount: ev.target.value } : r)))} placeholder="৳" className={cn(inputCls, 'w-28')} />
                  <button type="button" aria-label="Remove extra cost" onClick={() => setExtras((x) => x.filter((r) => r.id !== e.id))} className="text-ed-muted hover:text-ed-red"><X className="size-4" /></button>
                </div>
              ))}
              <button type="button" onClick={() => setExtras((x) => [...x, { id: Date.now(), label: '', amount: '' }])} className="border-ed-line hover:text-ed-brand flex h-10 w-full items-center justify-center gap-2 rounded-lg border bg-[#fbfafd] text-[13.5px]"><Plus className="size-4" /> Add Extra Cost</button>
            </div>
          </Card>

          <Panel title="Payment" icon={Receipt}>
            <div className="space-y-3.5">
              {([['later', 'Pay Later'], ['partial', 'Partial Payment'], ['full', 'Pay in Full']] as const).map(([k, l]) => (
                <label key={k} className="flex cursor-pointer items-center gap-2.5 text-[14.5px]">
                  <input type="radio" name="pay" checked={pay === k} onChange={() => setPay(k)} className="size-[18px] accent-[#3f1355]" /> {l}
                </label>
              ))}
              {pay === 'partial' && (
                <div>
                  <input type="number" min="0" value={partial} onChange={(e) => setPartial(e.target.value)} placeholder="Amount paid now (৳)" className={inputCls} />
                  {partialAmt > grand && <p className="text-ed-red mt-1 text-[12px]">Cannot exceed the grand total.</p>}
                </div>
              )}
            </div>
          </Panel>

          <Card className="overflow-hidden">
            <div className="border-ed-line border-b px-6 py-5 text-[17px] font-medium">Summary</div>
            <div className="p-6">
              <div className="border-ed-line flex items-center justify-between gap-4 rounded-xl border bg-[#fbfafd] px-4 py-3.5">
                <div><p className="text-[14.5px] font-medium">Receive now</p><p className="text-ed-muted mt-0.5 text-[12px]">Immediately add stock and sync Shopify for linked items</p></div>
                <button type="button" role="switch" aria-checked={receiveNow} aria-label="Receive now" onClick={() => setReceiveNow((r) => !r)} className={cn('relative h-7 w-12 shrink-0 rounded-full transition', receiveNow ? 'bg-ed-brand' : 'bg-[#d9d5e3]')}>
                  <span className={cn('absolute top-0.5 size-6 rounded-full bg-white shadow transition-all', receiveNow ? 'left-[22px]' : 'left-0.5')} />
                </button>
              </div>
              <dl className="mt-4 space-y-2.5 text-[14.5px]">
                <div className="flex justify-between"><dt className="text-ed-muted">Total Qty</dt><dd>{totalQty}</dd></div>
                <div className="flex justify-between"><dt className="text-ed-muted">Subtotal</dt><dd>৳{num(subtotal)}</dd></div>
                {extraTotal > 0 && <div className="flex justify-between"><dt className="text-ed-muted">Extra Costs</dt><dd>৳{num(extraTotal)}</dd></div>}
                <div className="border-ed-line flex justify-between border-t pt-3 text-[18px] font-semibold"><dt>Grand Total</dt><dd>৳{num(grand)}</dd></div>
              </dl>
            </div>
          </Card>

          <button type="button" disabled={!valid} onClick={create} className="bg-ed-brand h-12 w-full rounded-lg text-[15px] font-medium text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">Create Purchase</button>
        </div>
      </div>
      {guide && <GuideModal title="New Purchase guide" onClose={() => setGuide(false)} points={[
        'Pick a vendor and the purchase date.',
        'Click product cards to add them, then set quantity and unit price.',
        'Add extra costs such as shipping, and choose how much to pay now.',
        'Turn on Receive now to add stock immediately, then press Create Purchase.',
      ]} />}
    </div>
  );
}
