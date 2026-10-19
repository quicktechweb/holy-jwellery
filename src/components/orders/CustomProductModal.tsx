'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Product } from '@/data/orders';
import { cn } from '@/lib/utils';

const input =
  'h-11 w-full rounded-lg border border-ed-line bg-white px-3.5 text-[14px] outline-none transition placeholder:text-ed-muted/70 focus:border-ed-brand focus:ring-2 focus:ring-ed-brand/20';

export function CustomProductModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (product: Product, qty: number) => void;
}) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('0');
  const [qty, setQty] = useState('1');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = () => {
    const e: Record<string, string> = {};
    const p = Number(price);
    const q = Number(qty);
    if (!name.trim()) e.name = 'Product name is required';
    if (price.trim() === '' || !Number.isFinite(p) || p < 0) e.price = 'Enter a valid price';
    if (!Number.isInteger(q) || q < 1) e.qty = 'Quantity must be at least 1';
    setErrors(e);
    if (Object.keys(e).length) return;
    const code = sku.trim() || `CUS-${Date.now().toString().slice(-6)}`;
    onAdd(
      { id: `custom-${Date.now()}`, code, sku: code, name: name.trim(), price: p, stock: 0 },
      q,
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-product-title"
        className="max-h-full w-full max-w-[424px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <h2 id="custom-product-title" className="text-[19px] font-semibold">
            Add Custom Product
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-ed-text/70 hover:text-ed-text -mt-1 -mr-1 flex size-8 items-center justify-center rounded-md"
          >
            <X className="size-[18px]" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-[13.5px] font-medium">Product Name *</span>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Special Offer Box"
              className={cn(input, errors.name && 'border-ed-red/60')}
            />
            {errors.name && <span className="text-ed-red mt-1 block text-[11.5px]">{errors.name}</span>}
          </label>
          <label className="block">
            <span className="mb-2 block text-[13.5px] font-medium">SKU (optional)</span>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Auto-generated if left blank"
              className={input}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13.5px] font-medium">Price (৳) *</span>
            <input
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))}
              className={cn(input, errors.price && 'border-ed-red/60')}
            />
            {errors.price && <span className="text-ed-red mt-1 block text-[11.5px]">{errors.price}</span>}
          </label>
          <label className="block">
            <span className="mb-2 block text-[13.5px] font-medium">Quantity *</span>
            <input
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              className={cn(input, errors.qty && 'border-ed-red/60')}
            />
            {errors.qty && <span className="text-ed-red mt-1 block text-[11.5px]">{errors.qty}</span>}
          </label>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border-ed-line hover:bg-ed-bg h-11 rounded-lg border bg-white px-5 text-[14px] font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="bg-ed-brand h-11 rounded-lg px-5 text-[14px] font-semibold text-white hover:brightness-110"
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}
