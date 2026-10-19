'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Ban,
  Check,
  Facebook,
  Globe,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  FileDown,
  FileText,
  Info,
  Link2,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Save,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';
import { cities, deliveryMethods, lookupCustomer, orderSources, products, type Product } from '@/data/orders';
import { getWebOrder } from '@/data/webOrders';
import { cn } from '@/lib/utils';
import { CustomerRecord } from './CustomerRecord';
import { SelectBox, inputCls } from './fields';
import { Stepper, type OrderLine } from './OrderedProducts';
import { ProductThumb } from './ProductPicker';
import { LIST_PATH } from './WebOrderList';
import { AUTO_PATH, autoOrderHref, getAutoNext, isQueueKey, takeNext, type QueueKey } from '@/lib/autoQueue';

const card = 'border-ed-line rounded-2xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]';
const block = 'border-ed-line rounded-xl border bg-white p-4 max-sm:p-3';
const sectionLabel = 'text-ed-muted mt-5 mb-2 text-[12px] font-medium tracking-wide uppercase';
const cap = 'text-ed-muted text-[10px] font-semibold tracking-wide uppercase';
const label14 = 'mb-2 block text-[14px] font-medium';
const fmt = (n: number) => (Number.isFinite(n) ? n : 0);
const num = (v: string) => (Number.isFinite(Number(v)) ? Number(v) || 0 : 0);

/** "10 Oct, 09:11 pm" -> "Oct 10, 2026, 09:11 PM" */
const orderDate = (c: string) => {
  const m = c.match(/^(\d+) (\w+), (.+)$/);
  return m ? `${m[2]} ${Number(m[1])}, 2026, ${m[3].toUpperCase()}` : c;
};

const statusOptions = ['Processing', 'Incomplete', 'Good But No Response', 'No Response', 'Advance Payment', 'On Hold', 'Approved', 'Cancel'];

export function WebOrderDetails({ id, returnUrl, autoQueue }: { id: string; returnUrl?: string; autoQueue?: string }) {
  const queue = isQueueKey(autoQueue) ? autoQueue : undefined;
  const order = getWebOrder(id);
  const backHref = returnUrl && returnUrl.startsWith('/dashboard/') ? returnUrl : LIST_PATH;

  if (!order) {
    return (
      <div className={cn(card, 'mt-4 p-10 text-center')}>
        <p className="text-[15px] font-semibold">Order not found</p>
        <p className="text-ed-muted mt-1 text-[13px]">This web order does not exist or was removed.</p>
        <Link href={backHref} className="bg-ed-brand mt-5 inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[14px] font-semibold text-white">
          <ArrowLeft className="size-4" /> Back to List
        </Link>
      </div>
    );
  }
  return <Details key={order.id} orderId={order.id} backHref={backHref} queue={queue} />;
}

function Details({ orderId, backHref, queue }: { orderId: string; backHref: string; queue?: QueueKey }) {
  const router = useRouter();
  const order = getWebOrder(orderId)!;
  const d = order.detail;

  const [mobile] = useState(order.mobile);
  const [name, setName] = useState(order.name);
  const [delivery, setDelivery] = useState(deliveryMethods[0]);
  const [address, setAddress] = useState(order.address ?? '');
  const [shipNote, setShipNote] = useState(order.shippingNote ?? '');
  const [city, setCity] = useState(order.city ?? '');
  const [zone, setZone] = useState(order.zone ?? '');
  const [area, setArea] = useState('');
  const [channel, setChannel] = useState(d?.channel ?? 'Unknown');
  const source = d?.source ?? channel;
  const [preorder, setPreorder] = useState(false);
  const [saved, setSaved] = useState(false);

  const [lines, setLines] = useState<OrderLine[]>(() =>
    order.items.filter((i) => !i.code.startsWith('ID_')).map((i) => ({
      product: { id: i.code, code: i.code, sku: i.code, name: i.name, price: i.price, stock: i.stock ?? 0, image: i.image, tint: i.tint },
      qty: i.qty,
      price: i.price,
    })),
  );
  const [discount, setDiscount] = useState('');
  const [advance, setAdvance] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(order.delivery !== undefined ? String(order.delivery) : '');

  const [status, setStatus] = useState(
    order.status.split('_').map((w) => w[0] + w.slice(1).toLowerCase()).join(' '),
  );
  const [pendingStatus, setPendingStatus] = useState('');
  const [note, setNote] = useState(order.noteLines.join('\n').replace(/^-$/, ''));
  const [noteDraft, setNoteDraft] = useState(note);
  const [toast, setToast] = useState('');

  const [pickerQ, setPickerQ] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const record = useMemo(() => d?.record ?? lookupCustomer(mobile), [d, mobile]);
  const [tick, setTick] = useState(0);

  const subTotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const grand = Math.max(0, subTotal - num(discount) + num(deliveryCharge));
  const due = Math.max(0, grand - num(advance));
  const missing = order.items.filter((i) => i.code.startsWith('ID_'));
  const webTotal = order.items.reduce((s, i) => s + i.qty * i.price, 0);
  const mismatch = missing.length > 0 && Math.abs(grand - webTotal) > 0.001;
  const isIncomplete = order.status === 'INCOMPLETE';

  const [logTime, setLogTime] = useState('');
  useEffect(() => {
    const t = new Date();
    const mon = t.toLocaleString('en-GB', { month: 'short' });
    const hm = t.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
    setLogTime(`${t.getDate()} ${mon}, ${hm}`);
  }, []);

  /** auto mode: status update / approve hole porer order e jabe (toggle on thakle) */
  const goNext = () => {
    if (!queue || !getAutoNext()) return;
    setTimeout(() => {
      const next = takeNext(queue, orderId);
      router.push(next ? autoOrderHref(next.id, queue) : AUTO_PATH);
    }, 900);
  };

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2400);
  };

  const addProduct = (p: Product) => {
    setLines((ls) => {
      const found = ls.find((l) => l.product.code === p.code);
      if (found) return ls.map((l) => (l === found ? { ...l, qty: l.qty + 1 } : l));
      return [...ls, { product: p, qty: 1, price: p.price }];
    });
    setPickerQ('');
    setPickerOpen(false);
  };
  const upd = (code: string, patch: Partial<Pick<OrderLine, 'qty' | 'price'>>) =>
    setLines((ls) => ls.map((l) => (l.product.code === code ? { ...l, ...patch } : l)));

  const matches = products.filter((p) => {
    const t = pickerQ.trim().toLowerCase();
    return !t || p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t);
  });

  const zones = city && cities[city] ? Object.keys(cities[city]) : [];
  const areas = city && zone && cities[city]?.[zone] ? cities[city][zone] : [];

  const approve = () => {
    if (lines.length === 0) return flash('Add at least one product to approve');
    setStatus('Approved');
    flash(`Order approved: ৳${grand.toFixed(2)}`);
    goNext();
  };

  return (
    <div className="pt-4">
      {/* header */}
      <div className={cn(card, 'flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5')}>
        <div className="flex items-center gap-3">
          <Link href={queue ? AUTO_PATH : backHref} aria-label="Back" className="border-ed-line hover:text-ed-brand flex size-9 shrink-0 items-center justify-center rounded-full border bg-white">
            <ChevronLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-[20px] leading-tight font-semibold">Web Order Details</h1>
            <p className="text-ed-muted text-[12.5px]">Review and manage this web order</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
          <span className={cn('rounded-full px-3 py-1', status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-[#e4eeff] text-ed-blue')}>{status}</span>
          <span className={cn('rounded-full px-3 py-1 uppercase', d?.badge === 'INCOMPLETE_ORDER' ? 'bg-[#fde8ea] text-ed-red' : 'bg-[#e3f6ec] text-green-700')}>{d?.badge ?? 'WEB'}</span>
          <span className="border-ed-line text-ed-text/80 rounded-full border bg-white px-3 py-1">Created {d?.createdAgo ?? 'about 2 hours ago'}</span>
          <span className="border-ed-line text-ed-text/80 rounded-full border bg-white px-3 py-1">Updated {d?.updatedAgo ?? 'about 2 hours ago'}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ───── left ───── */}
        <div className={cn(card, 'min-w-0 p-4 pb-4 sm:p-5')}>
          <CustomerRecord
            open
            loading={false}
            record={record}
            onFill={() => {
              if (!record.info) return;
              setName(record.info.name);
              setAddress(record.info.address);
            }}
            onRefresh={() => setTick((t) => t + 1)}
            key={tick}
          />

          <p className={cn(sectionLabel, 'mt-0')}>Customer details</p>
          <div className={cn(block, 'grid grid-cols-1 gap-4 md:grid-cols-3')}>
            <div>
              <span className={label14}>Mobile Number</span>
              <div className="relative">
                <input readOnly value={mobile} className={cn(inputCls, 'h-11 pr-20 text-[15px]')} />
                <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2.5 text-green-600">
                  <a href={`tel:${mobile}`} aria-label="Call customer"><Phone className="size-[18px]" /></a>
                  <a href={`https://wa.me/88${mobile}`} target="_blank" rel="noreferrer" aria-label="WhatsApp customer"><MessageCircle className="size-[18px]" /></a>
                </span>
              </div>
            </div>
            <label className="block">
              <span className={label14}>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className={cn(inputCls, 'h-11 text-[15px]')} />
            </label>
            <div>
              <span className={label14}>Delivery Method</span>
              <SelectBox value={delivery} onChange={setDelivery} options={deliveryMethods} aria-label="Delivery method" />
            </div>
          </div>

          <p className={sectionLabel}>Shipping &amp; address</p>
          <div className={cn(block, 'grid grid-cols-1 gap-4 md:grid-cols-3')}>
            <label className="block">
              <span className={label14}>Address</span>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} className={cn(inputCls, 'h-20 resize-y py-2.5 text-[15px]')} />
            </label>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[14px] font-medium">Shipping Note</span>
                <button type="button" aria-label="Add note template" className="border-ed-line text-ed-muted hover:text-ed-brand flex size-7 items-center justify-center rounded-md border bg-white">
                  <span className="text-[16px] leading-none">+</span>
                </button>
              </div>
              <textarea value={shipNote} maxLength={350} onChange={(e) => setShipNote(e.target.value)} className={cn(inputCls, 'h-20 resize-y py-2.5 text-[15px]')} />
              <p className="text-ed-muted mt-1.5 text-right text-[12px] tabular-nums">{shipNote.length}/350</p>
            </div>
            <div>
              <span className={label14}>Extra Options</span>
              <div className="border-ed-line rounded-xl border p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-ed-text/80 flex items-center gap-2.5 px-1">
                    <FileText className="size-4" />
                    <Link2 className="size-4" />
                    <span className="relative flex size-6 items-center justify-center rounded-md ring-1 ring-ed-brand/50">
                      <Tag className="text-ed-brand size-4" />
                      <span className="bg-ed-brand absolute -top-1.5 -right-1.5 flex size-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white">1</span>
                    </span>
                    <FileDown className="size-4" />
                  </span>
                  <div className="relative min-w-[120px] flex-1">
                    {channel === 'Website' ? <Globe className="text-ed-text/80 pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2" /> : <CircleHelp className="text-ed-muted pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2" />}
                    <select value={channel} onChange={(e) => setChannel(e.target.value)} aria-label="Order source" className="border-ed-line h-9 w-full appearance-none rounded-lg border bg-[#f7f7fa] pr-7 pl-8 text-[14px] outline-none">
                      {orderSources.map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2" />
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setSaved(true); flash('Shipping details saved'); setTimeout(() => setSaved(false), 1500); }}
                    className="bg-ed-brand flex h-9 items-center gap-2 rounded-lg px-4 text-[14px] font-semibold text-white hover:brightness-110"
                  >
                    <Save className="size-4" /> {saved ? 'Saved' : 'Save'}
                  </button>
                </div>
                <div className="bg-ed-bg mt-2 flex items-center justify-between rounded-lg px-3 py-1.5 text-[13px]">
                  <span className="text-ed-muted">Preorder</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preorder}
                    aria-label="Preorder"
                    onClick={() => setPreorder((v) => !v)}
                    className={cn('relative h-5 w-9 rounded-full transition-colors', preorder ? 'bg-ed-brand' : 'bg-[#dcd8e4]')}
                  >
                    <span className={cn('absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform', preorder && 'translate-x-4')} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* location */}
          <div className="mt-4 rounded-lg border border-green-600 p-3.5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13px] leading-snug font-medium text-green-700">
                এড্রেস লিখলে এই Filed গুলা অটোমেটিক ফিল হবে. যদি না হয় তাহলে সিলেক্ট করে নিন
              </p>
              <span className="text-ed-text/80 flex shrink-0 items-center gap-3">
                <button type="button" aria-label="Reset location" onClick={() => { setCity(''); setZone(''); setArea(''); }} className="hover:text-ed-brand"><RefreshCw className="size-4" /></button>
                <button type="button" aria-label="Clear address" onClick={() => { setAddress(''); setCity(''); setZone(''); setArea(''); }} className="hover:text-ed-red"><Trash2 className="size-4" /></button>
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { l: 'City', v: city, set: (v: string) => { setCity(v); setZone(''); setArea(''); }, o: Object.keys(cities), ph: 'Select a city', d: false },
                { l: 'Zone', v: zone, set: (v: string) => { setZone(v); setArea(''); }, o: zones, ph: 'Select a zone', d: !city },
                { l: 'Area', v: area, set: setArea, o: areas, ph: 'Select an area', d: !zone },
              ].map((f) => (
                <div key={f.l}>
                  <span className="mb-1.5 block text-[14px] font-medium">{f.l}</span>
                  <SelectBox variant="white" value={f.v} onChange={f.set} options={f.o} placeholder={f.ph} disabled={f.d} aria-label={f.l} />
                </div>
              ))}
            </div>
          </div>

          {/* add products */}
          <div className={cn(block, 'mt-5')}>
            <h3 className="text-[16px] font-semibold">Add products</h3>
            <p className="text-ed-muted mt-0.5 mb-3 text-[12.5px]">Search by product name and SKU</p>
            <div className="relative">
              <Search className="text-ed-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                value={pickerQ}
                onChange={(e) => { setPickerQ(e.target.value); setPickerOpen(true); }}
                onFocus={() => setPickerOpen(true)}
                onBlur={() => setTimeout(() => setPickerOpen(false), 120)}
                placeholder="Search and add products"
                role="combobox"
                aria-expanded={pickerOpen}
                aria-controls="product-options"
                className={cn(inputCls, 'h-11 pr-9 pl-9 text-[15px]')}
              />
              <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
              {pickerOpen && (
                <ul id="product-options" role="listbox" className="thin-scroll border-ed-line absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border bg-white p-1.5 shadow-lg">
                  {matches.length === 0 && <li className="text-ed-muted px-3 py-6 text-center text-xs">No products found.</li>}
                  {matches.map((p) => (
                    <li key={p.id} role="option" aria-selected={false}>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => addProduct(p)} className="hover:bg-ed-bg flex w-full items-center gap-3 rounded-lg p-2 text-left">
                        <ProductThumb product={p} className="size-10 rounded-md" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px]">{p.name}</span>
                          <span className="text-ed-muted block text-[12px]">SKU: {p.sku} · Stock {p.stock}</span>
                        </span>
                        <span className="text-[13px] font-medium">৳{p.price}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ordered products */}
          <div className={cn(block, 'mt-4')}>
            <h3 className="flex items-center gap-2 text-[18px] font-semibold">
              Ordered Products
              {(lines.length > 0 || missing.length === 0) && <span className="bg-ed-brand-soft rounded-full px-2 py-0.5 text-[12px] font-medium tabular-nums">{lines.length}</span>}
            </h3>
            {missing.length > 0 && (
              <div className="mt-3 space-y-2 text-[13.5px] text-red-600">
                {lines.length === 0 && <p>No Products added. Please add products to the order.</p>}
                <p>
                  {missing.length} Products are not synced in our product list. Please{' '}
                  <button type="button" onClick={() => flash('Product list sync started')} className="text-ed-blue underline">sync the product list</button>{' '}
                  or add the product manually. Products are:
                </p>
                <ul className="border-ed-line rounded-lg border bg-white px-3 py-3 text-[13.5px] text-red-600">
                  {missing.map((m) => <li key={m.code}>{m.code} - {m.qty}</li>)}
                </ul>
              </div>
            )}
            {lines.length === 0 && missing.length > 0 ? null : lines.length === 0 ? (
              <p className="text-ed-muted border-ed-line mt-3 rounded-xl border border-dashed py-8 text-center text-[13px]">No products yet. Search above to add one.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {lines.map(({ product: p, qty, price }) => (
                  <li key={p.code} className="border-ed-line rounded-xl border bg-white p-3">
                    <div className="flex items-start gap-3">
                      <ProductThumb product={p} className="size-[72px] sm:size-20" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[16px] leading-tight font-bold">{p.code}</p>
                        <p className="mt-1 truncate text-[14.5px]">{p.name}</p>
                        <p className="mt-1 text-[13.5px]">৳{p.price} &nbsp;<span className={cn(p.stock < 0 && 'text-ed-red')}>Stock: {p.stock}</span></p>
                      </div>
                      <button type="button" aria-label={`Remove ${p.name}`} onClick={() => setLines((ls) => ls.filter((l) => l.product.code !== p.code))} className="text-ed-red hover:bg-ed-red/10 flex size-8 items-center justify-center rounded-md">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-[0.86fr_1fr_1fr]">
                      <div><span className="mb-1 block text-[13.5px]">Qty</span><Stepper label="Quantity" value={qty} min={1} onChange={(v) => upd(p.code, { qty: v })} /></div>
                      <div><span className="mb-1 block text-[13.5px]">Price</span><Stepper label="Price" value={price} min={0} onChange={(v) => upd(p.code, { price: v })} /></div>
                      <div>
                        <span className="mb-1 block text-[13.5px]">Total</span>
                        <input readOnly aria-label="Line total" value={(qty * price).toFixed(2)} className="h-8 w-full rounded-lg border border-[#e3dfec] bg-[#f7f6fa] px-3 text-center text-[13px] text-[#9a97a6] outline-none" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className={sectionLabel}>Order total</p>
          <div className={cn(block, 'grid grid-cols-2 gap-4 md:grid-cols-5')}>
            <label className="block">
              <span className={label14}>Discount</span>
              <input inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value.replace(/[^\d.]/g, ''))} className={cn(inputCls, 'h-11')} />
            </label>
            <label className="block">
              <span className={label14}>Advance</span>
              <input inputMode="decimal" value={advance} onChange={(e) => setAdvance(e.target.value.replace(/[^\d.]/g, ''))} className={cn(inputCls, 'h-11')} />
            </label>
            <label className="block">
              <span className={label14}>Sub Total</span>
              <input readOnly value={fmt(subTotal)} className={cn(inputCls, 'h-11 text-ed-muted')} />
            </label>
            <label className="block">
              <span className={label14}>Delivery Charge</span>
              <input inputMode="decimal" value={deliveryCharge} onChange={(e) => setDeliveryCharge(e.target.value.replace(/[^\d.]/g, ''))} className={cn(inputCls, 'h-11')} />
            </label>
            <label className="col-span-2 block md:col-span-1">
              <span className={cn(label14, 'text-ed-red')}>Grand Total</span>
              <input readOnly value={fmt(grand)} className={cn(inputCls, 'border-ed-red/70 bg-red-50 text-ed-red h-11')} />
            </label>
          </div>
          {num(advance) > 0 && <p className="text-ed-muted mt-2 text-right text-[12.5px]">Due after advance: ৳{due.toFixed(2)}</p>}

          {mismatch && (
            <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              The grand total does not match the web order grand total. Difference is {grand - webTotal}
            </p>
          )}
          <button type="button" onClick={approve} className="mt-5 h-11 w-full rounded-lg bg-[#1fbd5b] text-[15px] font-medium text-white transition hover:brightness-95 active:scale-[0.995]">
            Approve Order ({grand.toFixed(2)}৳)
          </button>
          {toast && <p role="status" className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-center text-[13px] font-medium text-green-700">{toast}</p>}
        </div>

        {/* ───── right ───── */}
        <aside className="min-w-0 space-y-4">
          <div className={cn(card, 'p-4')}>
            <div className="flex items-center justify-between">
              <h3 className={cap}>Order summary</h3>
              <span className="text-ed-muted text-[11px]">{d?.no ?? '#0'}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              <div><p className={cap}>Date</p><p className="mt-0.5 text-[13px]">{d?.dateLabel ?? orderDate(order.created)}</p></div>
              <div><p className={cap}>Status</p><p className="mt-0.5 text-[13px]">{status}</p></div>
              <div><p className={cap}>Payment</p><p className="mt-0.5 text-[13px]">COD</p></div>
              <div><p className={cap}>Source</p><p className="mt-0.5 flex items-center gap-1.5 text-[13px]">{source === 'Facebook' ? <Facebook className="size-3.5 fill-[#1877f2] text-[#1877f2]" /> : <CircleHelp className="text-ed-muted size-3.5" />}<span className={source === source.toUpperCase() ? 'uppercase' : ''}>{source}</span></p></div>
            </div>
            <div className="bg-ed-bg/70 mt-3 space-y-1.5 rounded-lg p-3 text-[12.5px]">
              <div className="text-ed-muted flex justify-between"><span>Subtotal</span><span className="tabular-nums">{fmt(subTotal)}</span></div>
              <div className="text-ed-muted flex justify-between"><span>Delivery</span><span className="tabular-nums">{fmt(num(deliveryCharge))}</span></div>
              <div className="border-ed-line flex justify-between border-t pt-2 text-[15px] font-semibold"><span className="font-medium">Total</span><span className="tabular-nums">{fmt(grand)}</span></div>
            </div>

            <div className="bg-ed-bg/70 mt-3 rounded-xl p-2.5">
              <div className="border-ed-line rounded-xl border bg-white">
                <div className="flex items-center gap-3 p-3">
                  <span className="bg-ed-bg flex size-9 items-center justify-center rounded-lg"><MapPin className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-ed-muted text-[11px]">IP location</p>
                    <p className="text-[14px] font-semibold">{d?.ip?.place ?? 'Not available'}</p>
                    {d?.ip && <p className="text-ed-muted text-[11px]">{d.ip.region}</p>}
                  </div>
                  {d?.ip && <span className="flex items-center gap-1 self-start text-[10px] font-bold">BD <span aria-hidden="true">🇧🇩</span></span>}
                </div>
                <div className="border-ed-line text-ed-muted flex items-center justify-between gap-2 border-t bg-[#f8f7fb] px-3 py-2 font-mono text-[11px]">
                  <span className="min-w-0 break-all">IP&nbsp; {d?.ip?.addr ?? 'Not available'}</span>
                  {d?.ip && (
                    <button type="button" className="flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-white px-2.5 py-0.5 font-sans text-[11px] font-medium text-red-600 hover:bg-red-50">
                      <Ban className="size-3.5" /> Block
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2.5 space-y-2 text-[12.5px]">
                {[['Mobile:', mobile], ['Device:', d?.device ?? 'Not available']].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-2">
                    <span><span className="text-ed-muted">{k}</span> <span className={cn('break-all', k === 'Device:' && v === 'Not available' && 'text-ed-muted')}>{v}</span></span>
                    <button type="button" className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-red-600 hover:bg-red-50">
                      <Ban className="size-3.5" /> Block
                    </button>
                  </div>
                ))}
                {d?.autofill && (
                  <p className="text-ed-muted flex items-center gap-1.5 text-[11px]">Autofill: <Check className="size-3 text-green-600" /> <span className="text-green-600">Yes</span></p>
                )}
              </div>
            </div>

            <h3 className={cn(cap, 'mt-4')}>Order items</h3>
            <ul className="mt-2 space-y-1.5">
              {lines.map(({ product: p, qty, price }) => (
                <li key={p.code} className="flex items-center gap-2 rounded-md bg-[#f6f5f9] p-1.5">
                  <ProductThumb product={p} className="size-8 rounded-md" />
                  <div className="min-w-0 flex-1"><p className="truncate text-[13px] leading-tight">{p.code}</p><p className="text-ed-muted text-[11px]">৳{price}</p></div>
                  <span className="text-ed-muted pr-1 text-[12px]">{qty}x</span>
                </li>
              ))}
              {missing.map((m) => (
                <li key={m.code} className="flex items-center gap-2 rounded-md bg-[#f6f5f9] p-1.5">
                  <div className="min-w-0 flex-1 pl-1"><p className="truncate text-[13px] leading-tight">{m.code}</p><p className="text-ed-muted text-[11px]">৳{m.price}</p></div>
                  <span className="text-ed-muted pr-1 text-[12px]">{m.qty}x</span>
                </li>
              ))}
            </ul>

            {missing.length > 0 && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-[12.5px] text-red-600">
                <p>Products not found</p>
                {missing.map((m) => <p key={m.code} className="mt-1">{m.code} - {m.qty}</p>)}
              </div>
            )}

            {d?.meta ? (
              <div className="thin-scroll border-ed-line mt-3 max-h-[112px] space-y-2 overflow-y-auto rounded-lg border p-3 text-[12px]">
                {d.meta.map(([k, v]) => <div key={k}><p className="text-ed-muted">{k}</p><p className="break-words">{v}</p></div>)}
              </div>
            ) : !d ? (
              <div className="thin-scroll border-ed-line mt-3 max-h-[112px] space-y-2 overflow-y-auto rounded-lg border p-3 text-[12px]">
                <div><p className="text-ed-muted">Manual shipping note:</p><p>{shipNote || '-'}</p></div>
                <div><p className="text-ed-muted">Manual advance source:</p><p>BKASH</p></div>
                <div><p className="text-ed-muted">Manual created by id:</p><p className="break-all">cmhrt8p130m5ymw0kovwz8rin</p></div>
              </div>
            ) : null}
          </div>

          <div className={cn(card, 'p-4')}>
            <h3 className={cap}>Order tags</h3>
            <div className="border-ed-line mt-2 border-t pt-3">
              <div className="flex items-center gap-2">
                {order.tags.map((t) => <span key={t} className="bg-ed-brand rounded-full px-3 py-1 text-[10px] font-bold text-white">{t}</span>)}
                <button type="button" aria-label="Add tag" className="border-ed-line text-ed-muted hover:text-ed-brand flex size-6 items-center justify-center rounded-md border bg-white">+</button>
              </div>
            </div>
          </div>

          <div className={cn(card, 'p-4')}>
            <h3 className={cap}>Order actions</h3>
            <div className="border-ed-line mt-2 flex flex-wrap items-center gap-2 border-t pt-3">
              <div className="relative min-w-[130px] flex-1">
                <select value={pendingStatus} onChange={(e) => setPendingStatus(e.target.value)} aria-label="Change status" className="border-ed-line h-9 w-full appearance-none rounded-lg border bg-white pr-7 pl-3 text-[13px] outline-none">
                  <option value="">Change status</option>
                  {statusOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2" />
              </div>
              <button
                type="button"
                disabled={!pendingStatus}
                onClick={() => { setStatus(pendingStatus); setPendingStatus(''); flash('Status updated'); goNext(); }}
                className="h-9 rounded-lg bg-[#1fbd5b] px-4 text-[13px] font-medium text-white transition disabled:bg-[#9fe0b7]"
              >
                Update
              </button>
              <Link href={backHref} className="border-ed-line flex h-9 items-center gap-1.5 rounded-lg border bg-white px-3 text-[13px] hover:text-ed-brand">
                <ArrowLeft className="size-3.5" /> Back to List
              </Link>
            </div>
            <div className="border-ed-line mt-3 rounded-xl border p-3">
              <p className="mb-1.5 text-[14px] font-medium">Note</p>
              <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} className="border-ed-line h-[76px] w-full resize-y rounded-lg border bg-[#f7f7fa] px-3 py-2 text-[13px] outline-none" />
              <button
                type="button"
                disabled={noteDraft === note}
                onClick={() => { setNote(noteDraft); flash('Note added'); }}
                className="border-ed-line text-ed-muted enabled:text-ed-text enabled:hover:text-ed-brand mt-2 h-9 rounded-lg border bg-white px-3 text-[13px]"
              >
                Add Note
              </button>
              {queue && (
                <Link href={AUTO_PATH} className="border-ed-line hover:text-ed-brand mt-2 ml-2 inline-flex h-9 items-center gap-1.5 rounded-lg border bg-white px-3 text-[13px]">
                  <ArrowLeft className="size-3.5" /> Back to Auto Order
                </Link>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => flash('Reminder SMS queued')} className="border-ed-line hover:text-ed-brand h-10 rounded-lg border bg-white px-3.5 text-[13.5px]">Send Reminder SMS</button>
              <button type="button" onClick={() => flash('Advance SMS queued')} className="border-ed-line hover:text-ed-brand h-10 rounded-lg border bg-white px-3.5 text-[13.5px]">Send Advance SMS</button>
              {isIncomplete && (
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm('Delete this order?')) return;
                    flash('Order deleted');
                    if (queue && getAutoNext()) goNext();
                    else setTimeout(() => router.push(queue ? AUTO_PATH : backHref), 700);
                  }}
                  className="h-10 rounded-lg bg-red-600 px-3.5 text-[13.5px] font-medium text-white hover:bg-red-700"
                >
                  Delete Order
                </button>
              )}
            </div>
          </div>

          {d?.attribution ? (
            <div className={cn(card, 'p-4')}>
              <h3 className="flex items-center gap-2 text-[14px] font-semibold"><Info className="size-4" /> Attribution</h3>
              <p className="text-ed-muted mt-0.5 text-[12px]">Track where this order came from</p>
              <div className="border-ed-line mt-3 border-t pt-3">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0fe] px-2.5 py-0.5 text-[12px] text-ed-blue"><Facebook className="size-3.5 fill-[#1877f2] text-[#1877f2]" /> {d.attribution.channel}</span>
                  <span className="border-ed-line rounded-full border px-2.5 py-0.5 text-[12px]">utm</span>
                </div>
                <dl className="mt-3 divide-y divide-[#f0eef4] text-[12px]">
                  {([['Campaign', d.attribution.campaign], ['Ad Set', d.attribution.adSet], ['Ad', d.attribution.ad]] as const).map(([k, v]) => (
                    <div key={k} className="py-2"><dt className="text-ed-muted">{k}</dt><dd className="mt-1 font-mono text-[11px] break-all">{v}</dd></div>
                  ))}
                </dl>
                <div className="border-ed-line mt-1 border-t pt-3 text-[11.5px]">
                  <p className="text-ed-muted">Facebook Pixel</p>
                  <p className="mt-1 break-all"><span className="text-ed-muted">Click ID:</span> <span className="font-mono">{d.attribution.clickId}</span></p>
                  <p className="mt-0.5 break-all"><span className="text-ed-muted">Browser Pixel:</span> <span className="font-mono">{d.attribution.browserPixel}</span></p>
                </div>
                <div className="border-ed-line mt-3 border-t pt-3 text-[11.5px]">
                  <p className="text-ed-muted">Session Info</p>
                  <p className="mt-1">{d.attribution.device}</p>
                  <p className="text-ed-blue mt-1 break-all">{d.attribution.referrer}</p>
                </div>
                <div className="border-ed-line mt-3 border-t pt-3 text-[11px]">
                  <p className="text-ed-muted text-[11.5px]">Entry URL</p>
                  <p className="mt-1 line-clamp-3 font-mono break-all">{d.attribution.entryUrl}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-ed-muted flex items-center gap-2 px-1 text-[13px]"><Info className="size-4" /> No attribution data available for this order</p>
          )}

          <div className={cn(card, 'p-4')}>
            <h3 className="mb-3 text-[13.5px] font-medium">Activity Log</h3>
            <ul className="space-y-3.5">
              {logTime && (
                <li>
                  <p className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-ed-muted">{logTime}</span>
                    <span className="text-ed-muted/80 text-[10px]">· now</span>
                    <span className="rounded bg-[#efedf3] px-1.5 py-0.5 text-[11.5px]">Smita</span>
                  </p>
                  <p className="mt-1 text-[12px]">ORDER_VIEWED</p>
                </li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
