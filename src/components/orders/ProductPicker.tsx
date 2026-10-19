'use client';

import { useMemo, useState } from 'react';
import { CircleHelp, ImageIcon, Star } from 'lucide-react';
import type { Product } from '@/data/orders';
import { cn } from '@/lib/utils';
import { inputCls } from './fields';

export function ProductThumb({
  product,
  className,
}: {
  product: Pick<Product, 'name' | 'image' | 'tint'>;
  /** size class dao, e.g. "size-14 sm:size-24" */
  className?: string;
}) {
  const base = cn('shrink-0 rounded-lg', className);
  if (product.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={product.image} alt={product.name} loading="lazy" className={cn(base, 'object-cover')} />
    );
  }
  if (product.tint) {
    return <span style={{ background: product.tint }} className={cn(base, 'block')} aria-hidden="true" />;
  }
  return (
    <span
      className={cn(
        base,
        'flex flex-col items-center justify-center gap-1 border border-[#e4e2ea] bg-[#f6f6f8] text-[#8a8794]',
      )}
    >
      <ImageIcon className="size-4 sm:size-[18px]" strokeWidth={1.5} />
      <span className="font-plain text-[8px] font-semibold sm:text-[9px]">No Image</span>
    </span>
  );
}

export function ProductPicker({
  products,
  onAdd,
  addedIds,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
  addedIds: Set<string>;
}) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set(products.map((p) => p.id)));

  const list = useMemo(() => {
    const c = code.trim().toLowerCase();
    const n = name.trim().toLowerCase();
    return products.filter(
      (p) =>
        (!c || p.code.toLowerCase().includes(c) || p.sku.toLowerCase().includes(c)) &&
        (!n || p.name.toLowerCase().includes(n)) &&
        (!favOnly || favs.has(p.id)),
    );
  }, [products, code, name, favOnly, favs]);

  const toggleFav = (id: string) =>
    setFavs((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section className="border-ed-line min-w-0 overflow-hidden rounded-xl border bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-[18px] font-semibold">Click To Add Products</h3>
        <CircleHelp className="text-ed-muted size-[18px]" aria-label="Click a product to add it to the order" />
      </div>
      <div className="border-ed-line border-t px-4 pt-3 pb-2">
        <div className="flex items-end gap-2 max-sm:gap-1.5">
          <label className="min-w-0 flex-1">
            <span className="mb-1 block text-[14px]">Code/sku</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Type to Search.."
              className={cn(inputCls, 'h-9')}
            />
          </label>
          <label className="min-w-0 flex-1">
            <span className="mb-1 block text-[14px]">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type to Search.."
              className={cn(inputCls, 'h-9')}
            />
          </label>
          <button
            type="button"
            aria-pressed={favOnly}
            aria-label="Show favourite products only"
            onClick={() => setFavOnly((v) => !v)}
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg border-2 transition-colors',
              favOnly ? 'border-amber-500 bg-amber-100' : 'border-amber-400 bg-white',
            )}
          >
            <Star className="size-[18px] fill-amber-400 text-amber-500" />
          </button>
        </div>
      </div>

      <ul className="thin-scroll max-h-[460px] space-y-2.5 sm:max-h-[520px] sm:space-y-3 overflow-y-auto px-2.5 pt-1 pb-3 sm:px-3 sm:pb-4">
        {list.length === 0 && (
          <li className="text-ed-muted px-3 py-10 text-center text-xs">No products found.</li>
        )}
        {list.map((p) => {
          const added = addedIds.has(p.id);
          return (
            <li key={p.id}>
              <div
                role="button"
                tabIndex={added ? -1 : 0}
                aria-disabled={added}
                title={added ? 'Already added to the order' : undefined}
                onClick={() => !added && onAdd(p)}
                onKeyDown={(e) => {
                  if (!added && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onAdd(p);
                  }
                }}
                className={cn(
                  'border-ed-line flex gap-2.5 rounded-xl border bg-white p-2.5 shadow-[0_2px_5px_rgba(30,20,50,0.07)] transition-opacity sm:gap-3 sm:p-3',
                  added ? 'cursor-not-allowed opacity-50' : 'hover:border-ed-brand/30 cursor-pointer',
                )}
              >
                <ProductThumb product={p} className="size-14 sm:size-24" />
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
                  <div>
                    <p className="font-plain text-[14px] leading-snug text-black">{p.name}</p>
                    <p className="font-plain mt-0.5 text-[12.5px] leading-snug font-bold text-[#3b1250] sm:text-[14px]">
                      SKU1: {p.sku}
                    </p>
                  </div>
                  <p className="font-plain flex justify-between gap-2 pr-3 text-[12px] font-normal text-[#666] sm:text-[14px]">
                    <span>Price: ৳{p.price}</span>
                    <span>Stock: {p.stock}</span>
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={favs.has(p.id) ? 'Remove from favourites' : 'Add to favourites'}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(p.id);
                  }}
                  className="h-fit"
                >
                  <Star
                    className={cn(
                      'size-4',
                      favs.has(p.id) ? 'fill-amber-400 text-amber-400' : 'text-ed-muted/50',
                    )}
                  />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
