'use client';

import { Boxes, Minus, Plus, Trash2 } from 'lucide-react';
import type { Product } from '@/data/orders';
import { ProductThumb } from './ProductPicker';

export interface OrderLine {
  product: Product;
  qty: number;
  price: number;
}

export function Stepper({
  value,
  onChange,
  min,
  label,
  width = 'w-full',
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  label: string;
  width?: string;
}) {
  const btn =
    'flex h-8 w-8 shrink-0 items-center justify-center bg-[#f1eff6] text-ed-text hover:text-ed-brand';
  return (
    <div className={`flex h-8 items-center overflow-hidden rounded-lg border border-[#e3dfec] bg-white ${width}`}>
      <button type="button" aria-label={`Decrease ${label}`} className={btn}
        onClick={() => onChange(Math.max(min, value - 1))}>
        <Minus className="size-3.5" />
      </button>
      <input
        type="number"
        inputMode="decimal"
        aria-label={label}
        min={min}
        value={Number.isNaN(value) ? '' : value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
        className="min-w-0 flex-1 border-x border-[#e3dfec] h-full [appearance:textfield] bg-transparent text-center text-[13px] outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button type="button" aria-label={`Increase ${label}`} className={btn}
        onClick={() => onChange(value + 1)}>
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function OrderedProducts({
  lines,
  onChange,
  onRemove,
  invalid,
}: {
  lines: OrderLine[];
  onChange: (id: string, patch: Partial<Pick<OrderLine, 'qty' | 'price'>>) => void;
  onRemove: (id: string) => void;
  invalid?: boolean;
}) {
  return (
    <section aria-label="Ordered products" className="min-w-0">
      <div className="flex items-center justify-between pt-1 pb-3">
        <h3 className="flex items-center gap-2 text-[14.5px] font-semibold">
          <Boxes className="size-[18px]" strokeWidth={1.75} />
          Ordered Products
        </h3>
        <span className="text-ed-muted text-xs">{lines.length} item(s)</span>
      </div>

      {lines.length === 0 ? (
        <div
          className={`flex min-h-[88px] items-center justify-center rounded-xl border border-dashed px-4 text-center ${
            invalid ? 'border-ed-red/60 text-ed-red' : 'border-ed-line text-ed-muted'
          }`}
        >
          <p className="text-[13.5px]">
            Search and add products from the “Click To Add Products” panel.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {lines.map(({ product: p, qty, price }) => (
            <li key={p.id} className="border-ed-line rounded-xl border bg-white p-2.5 shadow-[0_1px_4px_rgba(30,20,50,0.06)] sm:px-3.5 sm:pt-3 sm:pb-3.5">
              <div className="flex items-start gap-2.5">
                <ProductThumb product={p} className="size-[52px] sm:size-20" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-tight font-bold sm:text-[16px]">{p.code}</p>
                  <p className="mt-0.5 truncate text-[12px] sm:mt-1 sm:text-[14px]">{p.name}</p>
                  <p className="mt-0.5 text-[10.5px] sm:mt-1 sm:text-[12.5px]">
                    ৳{p.price} &nbsp;Stock: {p.stock}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${p.name}`}
                  onClick={() => onRemove(p.id)}
                  className="text-ed-red hover:bg-ed-red/10 flex size-7 items-center justify-center rounded-md transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {/* mobile: ek line e Qty stepper, Price, Total */}
              <div className="mt-2 flex items-center gap-2 sm:hidden">
                <Stepper label="Quantity" value={qty} min={1} width="w-[104px] shrink-0"
                  onChange={(v) => onChange(p.id, { qty: v })} />
                <input
                  type="number"
                  inputMode="decimal"
                  aria-label="Price"
                  min={0}
                  value={Number.isNaN(price) ? '' : price}
                  onChange={(e) => onChange(p.id, { price: Math.max(0, Number(e.target.value)) })}
                  className="h-8 min-w-0 flex-1 [appearance:textfield] rounded-lg border border-[#e3dfec] bg-[#f7f6fa] px-2 text-center text-[13px] outline-none focus:border-ed-brand/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span
                  aria-label="Line total"
                  className="border-ed-brand/30 bg-ed-brand-soft text-ed-brand flex h-8 min-w-[88px] items-center justify-center rounded-lg border px-2 text-[13px] font-bold tabular-nums"
                >
                  ৳{(qty * price).toFixed(2)}
                </span>
              </div>

              {/* desktop: label shoho grid */}
              <div className="mt-2 hidden grid-cols-[0.85fr_1fr_1fr] gap-3 sm:grid">
                <div>
                  <span className="mb-1 block text-[13px]">Qty</span>
                  <Stepper label="Quantity" value={qty} min={1}
                    onChange={(v) => onChange(p.id, { qty: v })} />
                </div>
                <div>
                  <span className="mb-1 block text-[13px]">Price</span>
                  <Stepper label="Price" value={price} min={0}
                    onChange={(v) => onChange(p.id, { price: v })} />
                </div>
                <div>
                  <span className="mb-1 block text-[13px]">Total</span>
                  <input
                    readOnly
                    aria-label="Line total"
                    value={(qty * price).toFixed(2)}
                    className="h-8 w-full rounded-lg border border-[#e3dfec] bg-[#f7f6fa] px-3 text-center text-[13px] text-[#9a97a6] outline-none"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
