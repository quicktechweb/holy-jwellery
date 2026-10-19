'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  CreditCard,
  Link2,
  MessageCircle,
  Phone,
  MoreHorizontal,
  Paperclip,
  Plus,
  RefreshCw,
  Settings2,
  StickyNote,
  Tag,
  Trash2,
} from 'lucide-react';
import {
  cities,
  deliveryMethods,
  lookupCustomer,
  type CustomerRecordData,
  orderSources,
  products,
  type Product,
} from '@/data/orders';
import { cn } from '@/lib/utils';
import { CustomerRecord } from './CustomerRecord';
import { Field, SelectBox, inputCls } from './fields';
import { OrderedProducts, type OrderLine } from './OrderedProducts';
import { CustomProductModal } from './CustomProductModal';
import { ProductPicker } from './ProductPicker';

type Mode = 'Manual' | 'Approved' | 'Pre-Order';
const modes: Mode[] = ['Manual', 'Approved', 'Pre-Order'];
const submitLabel: Record<Mode, string> = {
  Manual: 'Create Manual Order',
  Approved: 'Create Approved Order',
  'Pre-Order': 'Create Pre-Order',
};

const card = 'border-ed-line rounded-2xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]';
const money = (n: number) => `৳${Number.isFinite(n) ? n : 0}`;
const num = (v: string) => (Number.isFinite(Number(v)) ? Number(v) || 0 : 0);

const chips = [
  { key: 'tag', label: 'Tag', icon: Tag },
  { key: 'ref', label: 'Reference Link', icon: Link2 },
  { key: 'note', label: 'Note', icon: StickyNote },
] as const;

export function NewOrderForm() {
  const [mode, setMode] = useState<Mode>('Approved');

  // customer
  const [mobile, setMobile] = useState('');
  const [customer, setCustomer] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [shipNote, setShipNote] = useState('');
  const [delivery, setDelivery] = useState(deliveryMethods[0]);
  const [source, setSource] = useState(orderSources[0]);
  const [city, setCity] = useState('');
  const [zone, setZone] = useState('');
  const [area, setArea] = useState('');
  const [extras, setExtras] = useState<Record<string, boolean>>({});
  const [extraVals, setExtraVals] = useState<Record<string, string>>({});

  // money
  const [discount, setDiscount] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [advance, setAdvance] = useState('');
  const [trxId, setTrxId] = useState('');

  // products
  const [lines, setLines] = useState<OrderLine[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);

  // customer record: valid mobile dile smooth open hoy
  const validMobile = /^01[3-9]\d{8}$/.test(mobile.trim());
  const [record, setRecord] = useState<CustomerRecordData | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recTick, setRecTick] = useState(0);
  const [auto, setAuto] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!validMobile) return;
    const number = mobile.trim();
    setRecLoading(true);
    const t = setTimeout(() => {
      setRecord(lookupCustomer(number));
      setRecLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, [mobile, validMobile, recTick]);

  const edit = (key: string, set: (v: string) => void) => (v: string) => {
    set(v);
    setAuto((a) => {
      if (!a.has(key)) return a;
      const n = new Set(a);
      n.delete(key);
      return n;
    });
  };
  const fillInfo = () => {
    const info = record?.info;
    if (!info) return;
    setCustomer(info.name);
    setEmail(info.email);
    setAddress(info.address);
    setAuto(new Set(['customer', 'email', 'address']));
    setErrors((e) => ({ ...e, customer: '', address: '' }));
  };
  const autoCls = (key: string) =>
    auto.has(key) && 'border-[#d3e0f7] bg-[#e8f0fe] focus:bg-[#e8f0fe]';

  const addProduct = (p: Product, qty = 1) => {
    setCreated(null);
    setErrors((e) => ({ ...e, products: '' }));
    setLines((ls) => {
      const found = ls.find((l) => l.product.id === p.id);
      if (found) return ls.map((l) => (l === found ? { ...l, qty: l.qty + qty } : l));
      return [...ls, { product: p, qty, price: p.price }];
    });
  };
  const updateLine = (id: string, patch: Partial<Pick<OrderLine, 'qty' | 'price'>>) =>
    setLines((ls) => ls.map((l) => (l.product.id === id ? { ...l, ...patch } : l)));
  const removeLine = (id: string) =>
    setLines((ls) => ls.filter((l) => l.product.id !== id));

  const addedIds = useMemo(() => new Set(lines.map((l) => l.product.id)), [lines]);

  const itemsTotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const disc = num(discount);
  const dlv = num(deliveryCharge);
  const adv = num(advance);
  const grand = Math.max(0, itemsTotal - disc + dlv);
  const due = Math.max(0, grand - adv);

  const zones = city ? Object.keys(cities[city]) : [];
  const areas = city && zone ? cities[city][zone] : [];

  const resetLocation = () => {
    setCity('');
    setZone('');
    setArea('');
  };

  const reset = () => {
    setMobile(''); setCustomer(''); setEmail(''); setAddress(''); setShipNote('');
    setDelivery(deliveryMethods[0]); setSource(orderSources[0]); resetLocation();
    setExtras({}); setExtraVals({});
    setDiscount(''); setDeliveryCharge(''); setAdvance(''); setTrxId('');
    setLines([]); setErrors({}); setAuto(new Set());
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!/^01[3-9]\d{8}$/.test(mobile.trim())) e.mobile = 'Enter a valid 11-digit mobile number';
    if (!customer.trim()) e.customer = 'Customer name is required';
    if (!address.trim()) e.address = 'Address is required';
    if (!delivery) e.delivery = 'Select a delivery method';
    if (lines.length === 0) e.products = 'Add at least one product';
    setErrors(e);
    if (Object.keys(e).length) return;
    setCreated(`${customer.trim()} · ${money(grand)}`);
    reset();
  };

  const setCityAndReset = (v: string) => {
    setCity(v);
    setZone('');
    setArea('');
  };

  return (
    <div className="grid grid-cols-1 items-start gap-5 pt-4 xl:grid-cols-[minmax(0,1fr)_348px]">
      {/* ───────── left column ───────── */}
      <div className="min-w-0 space-y-5">
        {/* mode + actions */}
        <div className={cn(card, 'flex flex-wrap items-center justify-between gap-3 px-4 py-3')}>
          <div role="tablist" aria-label="Order type" className="bg-ed-bg flex rounded-lg p-1">
            {modes.map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  'h-8 rounded-md px-3.5 text-[13px] font-medium transition-colors',
                  mode === m
                    ? 'bg-ed-brand text-white shadow-sm'
                    : 'text-ed-muted hover:text-ed-text',
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="border-ed-line text-ed-text/85 hover:text-ed-brand flex h-9 items-center gap-2 rounded-lg border bg-white px-3 text-[13px] font-medium transition-colors">
              <BookOpen className="size-4" strokeWidth={1.75} /> Guide
            </button>
            <button type="button" className="border-ed-line text-ed-text/85 hover:text-ed-brand flex h-9 items-center gap-2 rounded-lg border bg-white px-3 text-[13px] font-medium transition-colors">
              <Settings2 className="size-4" strokeWidth={1.75} /> Layouts &amp; Fields
            </button>
          </div>
        </div>

        {/* customer */}
        <div className={cn(card, 'min-w-0 p-5 max-sm:p-4')}>
          <CustomerRecord
            open={validMobile}
            loading={recLoading || (validMobile && !record)}
            record={record}
            onFill={fillInfo}
            onRefresh={() => setRecTick((t) => t + 1)}
          />
          <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-3">
            <Field label="Mobile Number" required error={errors.mobile}>
              <div className="relative">
                <input
                  value={mobile}
                  inputMode="tel"
                  maxLength={11}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="01XXXXXXXXX"
                  className={cn(
                    inputCls,
                    validMobile && 'border-[#d3e0f7] bg-[#e8f0fe] pr-20 focus:bg-[#e8f0fe]',
                    errors.mobile && 'border-ed-red/60',
                  )}
                />
                {validMobile && (
                  <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2.5 text-green-600">
                    <a href={`tel:${mobile}`} aria-label="Call customer"><Phone className="size-4" /></a>
                    <a href={`https://wa.me/88${mobile}`} target="_blank" rel="noreferrer" aria-label="WhatsApp customer">
                      <MessageCircle className="size-4" />
                    </a>
                  </span>
                )}
              </div>
            </Field>
            <Field label="Customer Name" required error={errors.customer}>
              <input
                value={customer}
                onChange={(e) => edit('customer', setCustomer)(e.target.value)}
                placeholder="Customer name"
                className={cn(inputCls, autoCls('customer'), errors.customer && 'border-ed-red/60')}
              />
            </Field>
            <Field label="Email" optional>
              <input
                type="email"
                value={email}
                onChange={(e) => edit('email', setEmail)(e.target.value)}
                placeholder="customer@example.com"
                className={cn(inputCls, autoCls('email'))}
              />
            </Field>

            <Field label="Address" required error={errors.address}>
              <textarea
                value={address}
                onChange={(e) => edit('address', setAddress)(e.target.value)}
                placeholder="Enter address"
                className={cn(inputCls, 'h-[126px] resize-y py-2.5', autoCls('address'), errors.address && 'border-ed-red/60')}
              />
            </Field>
            <Field
              label="Shipping Note"
              optional
              right={
                <span className="flex items-center gap-2">
                  <span className="text-ed-muted text-[11px] tabular-nums">{shipNote.length}/350</span>
                  <button type="button" aria-label="Add note template" className="border-ed-line text-ed-muted hover:text-ed-brand flex size-7 items-center justify-center rounded-md border bg-white">
                    <Plus className="size-3.5" />
                  </button>
                </span>
              }
            >
              <textarea
                value={shipNote}
                maxLength={350}
                onChange={(e) => setShipNote(e.target.value)}
                placeholder="Note printed on invoice / shared with courier"
                className={cn(inputCls, 'h-[126px] resize-y py-2.5')}
              />
            </Field>
            <div>
              <Field label="Delivery Method" required error={errors.delivery}>
                <SelectBox
                  value={delivery}
                  onChange={setDelivery}
                  options={deliveryMethods}
                  aria-label="Delivery method"
                />
              </Field>
              <div className="mt-3 flex flex-wrap gap-2">
                {chips.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={!!extras[key]}
                    onClick={() => setExtras((x) => ({ ...x, [key]: !x[key] }))}
                    className={cn(
                      'flex h-8 items-center gap-1.5 rounded-lg border bg-white px-2.5 text-[12.5px] font-medium transition-colors',
                      extras[key]
                        ? 'border-ed-brand/50 text-ed-brand'
                        : 'border-ed-line text-ed-text/85 hover:text-ed-brand',
                    )}
                  >
                    <Icon className="size-3.5" /> {label}
                  </button>
                ))}
                <button type="button" className="border-ed-line text-ed-text/85 hover:text-ed-brand flex h-8 items-center gap-1.5 rounded-lg border bg-white px-2.5 text-[12.5px] font-medium">
                  <Paperclip className="size-3.5" /> Attachment
                </button>
                <button type="button" className="border-ed-line text-ed-text/85 hover:text-ed-brand flex h-8 items-center gap-1.5 rounded-lg border bg-white px-2.5 text-[12.5px] font-medium">
                  <MoreHorizontal className="size-3.5" /> More
                </button>
              </div>
              {chips.filter((c) => extras[c.key]).map((c) => (
                <input
                  key={c.key}
                  value={extraVals[c.key] ?? ''}
                  onChange={(e) => setExtraVals((v) => ({ ...v, [c.key]: e.target.value }))}
                  placeholder={c.label}
                  aria-label={c.label}
                  className={cn(inputCls, 'mt-2 h-9')}
                />
              ))}
            </div>

            <div className="md:col-span-1">
              <Field label="Payment Method" optional>
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <SelectBox value="" onChange={() => {}} options={[]} placeholder="No active accounts" disabled />
                  </div>
                  <button type="button" aria-label="Add payment account" className="border-ed-line text-ed-text/80 hover:text-ed-brand flex size-10 shrink-0 items-center justify-center rounded-lg border bg-white">
                    <Plus className="size-4" />
                  </button>
                </div>
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Order Source" optional>
                <SelectBox value={source} onChange={setSource} options={orderSources} aria-label="Order source" />
              </Field>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-blue-600">
            Add an account in Accounts &amp; Bank, then return here.
          </p>

          {/* auto-fill location */}
          <div className="mt-4 rounded-lg border border-green-600 p-3.5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13px] leading-snug font-medium text-green-700">
                এড্রেস লিখলে এই Filed গুলা অটোমেটিক ফিল হবে. যদি না হয় তাহলে সিলেক্ট করে নিন
              </p>
              <span className="text-ed-text/80 flex shrink-0 items-center gap-3">
                <button type="button" aria-label="Reset location" onClick={resetLocation} className="hover:text-ed-brand">
                  <RefreshCw className="size-4" />
                </button>
                <button type="button" aria-label="Clear address" onClick={() => { setAddress(''); resetLocation(); }} className="hover:text-ed-red">
                  <Trash2 className="size-4" />
                </button>
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: 'City', value: city, onChange: setCityAndReset, options: Object.keys(cities), ph: 'Select a city', dis: false },
                { label: 'Zone', value: zone, onChange: (v: string) => { setZone(v); setArea(''); }, options: zones, ph: 'Select a zone', dis: !city },
                { label: 'Area', value: area, onChange: setArea, options: areas, ph: 'Select an area', dis: !zone },
              ].map((f) => (
                <div key={f.label}>
                  <span className="mb-1.5 block text-[14px] font-medium">{f.label}</span>
                  <SelectBox
                    variant="white"
                    value={f.value}
                    onChange={f.onChange}
                    options={f.options}
                    placeholder={f.ph}
                    disabled={f.dis}
                    aria-label={f.label}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* products */}
        <div className={cn(card, 'min-w-0 p-5 max-sm:p-4')}>
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
            {['Add Product', 'Scan Barcode', 'Add Custom Product'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => l === 'Add Custom Product' && setCustomOpen(true)}
                className={cn(
                  'border-ed-brand/20 text-ed-brand hover:border-ed-brand/40 flex h-9 items-center justify-center gap-2 rounded-lg border bg-[#faf7fd] px-4 text-[13.5px] font-medium transition-colors',
                  l === 'Add Custom Product' && 'max-sm:col-span-2',
                )}
              >
                <Plus className="size-4" /> {l}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,6fr)_minmax(0,7fr)]">
            <ProductPicker products={products} onAdd={addProduct} addedIds={addedIds} />
            <div>
              <OrderedProducts
                lines={lines}
                onChange={updateLine}
                onRemove={removeLine}
                invalid={!!errors.products}
              />
              {errors.products && <p className="text-ed-red mt-1.5 text-[11.5px]">{errors.products}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ───────── right column ───────── */}
      <aside className="min-w-0 space-y-5 xl:sticky xl:top-4">
        <div className={cn(card, 'p-5')}>
          <h3 className="mb-4 flex items-center gap-2 text-[15px] font-semibold">
            <CreditCard className="size-[18px]" strokeWidth={1.75} /> Calculation Details
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Discount (৳)', v: discount, set: setDiscount },
              { label: 'Delivery Charge (৳)', v: deliveryCharge, set: setDeliveryCharge },
              { label: 'Advance (৳)', v: advance, set: setAdvance },
            ].map((f) => (
              <label key={f.label} className="block">
                <span className="text-ed-muted mb-1.5 block text-[12.5px] font-medium">{f.label}</span>
                <input
                  inputMode="decimal"
                  value={f.v}
                  onChange={(e) => f.set(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="0"
                  className={cn(inputCls, 'h-11')}
                />
              </label>
            ))}
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-medium">Transaction ID</span>
              <input
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="TrxId (bKash/Nagad/Bank)"
                className={cn(inputCls, 'h-11')}
              />
            </label>
          </div>
        </div>

        <div className={cn(card, 'p-5')}>
          <h3 className="mb-3 text-[15px] font-semibold">Order Summary</h3>
          <dl className="space-y-2.5 text-[14px]">
            <Row label="Items Total" value={money(itemsTotal)} />
            <Row label="Discount" value={money(disc)} accent />
            <Row label="Delivery Charge" value={money(dlv)} />
            <div className="pt-2" />
            <Row label="Grand Total" value={money(grand)} strong />
            <Row label="Advance" value={money(adv)} accent />
          </dl>
          <div className="bg-ed-brand-soft mt-3 flex items-center justify-between rounded-lg px-3.5 py-3.5">
            <span className="text-[14px] font-medium">Due Amount</span>
            <span className="text-[15px] font-bold tabular-nums">{money(due)}</span>
          </div>
          <button
            type="button"
            onClick={submit}
            className="bg-ed-brand mt-4 h-12 w-full rounded-xl text-[15px] font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.99]"
          >
            {submitLabel[mode]}
          </button>
          <p className="text-ed-muted mt-2.5 text-center text-[11px]">
            Order will be saved as soon as you click.
          </p>
          {Object.keys(errors).some((k) => errors[k]) && (
            <p role="alert" className="text-ed-red mt-2 text-center text-[11.5px]">
              Fix the highlighted fields to continue.
            </p>
          )}
          {created && (
            <p role="status" className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-[12px] font-medium text-green-700">
              <CheckCircle2 className="size-4" /> Order created: {created}
            </p>
          )}
        </div>
      </aside>

      {customOpen && (
        <CustomProductModal
          onClose={() => setCustomOpen(false)}
          onAdd={(p, q) => addProduct(p, q)}
        />
      )}
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  strong,
}: {
  label: string;
  value: string;
  accent?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={cn(strong ? 'text-ed-text font-medium' : 'text-ed-muted')}>{label}</dt>
      <dd className={cn('tabular-nums', accent ? 'text-ed-green' : 'text-ed-text', strong && 'font-semibold')}>
        {value}
      </dd>
    </div>
  );
}
