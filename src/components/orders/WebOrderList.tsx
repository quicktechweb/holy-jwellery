'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  Copy,
  ExternalLink,
  Filter,
  List,
  ListChecks,
  MapPin,
  MessageCircle,
  Pause,
  Phone,
  PhoneIncoming,
  PhoneOff,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  ThumbsUp,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import {
  isStatusKey,
  ordersFor,
  statusTabs,
  type SuccessInfo,
  type WebOrder,
  type WebStatus,
} from '@/data/webOrders';
import { cn } from '@/lib/utils';
import { ProductThumb } from './ProductPicker';

export const LIST_PATH = '/dashboard/orders/web';

const tabIcons: Record<WebStatus, LucideIcon> = {
  PROCESSING: Clock,
  INCOMPLETE: CircleAlert,
  GOOD_BUT_NO_RESPONSE: ThumbsUp,
  NO_RESPONSE: PhoneOff,
  ADVANCE_PAYMENT: Wallet,
  ON_HOLD: Pause,
  APPROVED: CircleCheck,
  CANCEL: CircleX,
  ALL: List,
};

const outlineBtn =
  'border-ed-line text-ed-text hover:text-ed-brand flex h-9 items-center gap-1.5 rounded-lg border bg-white px-3 text-[13px] font-medium shadow-sm transition-colors';

function Ring({ s }: { s: SuccessInfo }) {
  const color = s.pct >= 80 ? '#22b35e' : s.pct >= 40 ? '#f5a524' : '#ef3b3b';
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <svg width="36" height="36" viewBox="0 0 36 36" className="shrink-0 -rotate-90" aria-hidden="true">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#ece9f2" strokeWidth="3.5" />
        <circle
          cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={`${(s.pct / 100) * c} ${c}`}
        />
      </svg>
      <div className="text-[12.5px] leading-[1.45]" style={{ color }}>
        <p>Success: {s.pct}%</p>
        <p>Order: {s.ok}/{s.total}</p>
        <p className="text-ed-text">
          Rating:{' '}
          <span className={s.rating > 0 ? 'text-green-600' : 'text-ed-red'}>{s.rating}</span>
        </p>
      </div>
    </div>
  );
}

function SortBtn({ active, onClick, label }: { active?: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cn('text-ed-muted hover:text-ed-brand', active && 'text-ed-brand')}>
      <ChevronsUpDown className="size-3.5" />
    </button>
  );
}

export function WebOrderList() {
  const params = useSearchParams();
  const pathname = usePathname();
  const q = params.get('WooCommerceStatus');
  const active: WebStatus = isStatusKey(q) ? q : 'PROCESSING';

  const [search, setSearch] = useState('');
  const [newestFirst, setNewestFirst] = useState(true);
  const [rateSort, setRateSort] = useState<'asc' | 'desc' | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = ordersFor(active).filter(
      (o) =>
        !term ||
        [o.mobile, o.name, o.address ?? '', o.idLabel, ...o.items.map((i) => `${i.code} ${i.name}`)]
          .join(' ')
          .toLowerCase()
          .includes(term),
    );
    if (rateSort) {
      list = [...list].sort((a, b) =>
        rateSort === 'asc' ? (a.success?.pct ?? -1) - (b.success?.pct ?? -1) : (b.success?.pct ?? -1) - (a.success?.pct ?? -1),
      );
    } else if (!newestFirst) {
      list = [...list].reverse();
    }
    return list;
  }, [active, search, newestFirst, rateSort]);

  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const cur = Math.min(page, pages);
  const visible = rows.slice((cur - 1) * perPage, cur * perPage);
  const allChecked = visible.length > 0 && visible.every((o) => selected.has(o.id));

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected((s) => {
      const n = new Set(s);
      visible.forEach((o) => (allChecked ? n.delete(o.id) : n.add(o.id)));
      return n;
    });

  const returnUrl = encodeURIComponent(
    `${pathname}${active === 'PROCESSING' ? '' : `?WooCommerceStatus=${active}`}`,
  );

  return (
    <div className="border-ed-line mt-4 rounded-2xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
      {/* status tabs */}
      <div role="tablist" className="thin-scroll flex gap-1 overflow-x-auto px-3 pt-1.5 sm:px-4">
        {statusTabs.map((t) => {
          const Icon = tabIcons[t.key];
          const on = t.key === active;
          return (
            <Link
              key={t.key}
              role="tab"
              aria-selected={on}
              scroll={false}
              href={t.key === 'PROCESSING' ? LIST_PATH : `${LIST_PATH}?WooCommerceStatus=${t.key}`}
              onClick={() => { setPage(1); setSelected(new Set()); }}
              className={cn(
                'flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-[14px] whitespace-nowrap transition-colors',
                on ? 'border-ed-brand text-ed-text' : 'text-ed-muted hover:text-ed-text border-transparent',
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {t.label}
              <span className={cn('rounded-md px-2 py-0.5 text-[11.5px] tabular-nums', on ? 'bg-ed-brand-soft text-ed-text' : 'bg-ed-bg text-ed-muted')}>
                {t.count}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="px-3 pb-4 sm:px-4">
        {/* toolbar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:flex-none">
            <div className="relative min-w-0 flex-1 sm:w-[340px] sm:flex-none">
              <Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Filter orders..."
                className="border-ed-line focus:border-ed-brand/40 focus:ring-ed-brand/10 h-10 w-full rounded-lg border bg-white pr-3 pl-9 text-[14px] outline-none focus:ring-2"
              />
            </div>
            <button type="button" className={cn(outlineBtn, 'h-10 px-3.5 text-[14px]')}>
              <Filter className="size-4" /> Filter
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setRateSort(null); setNewestFirst((v) => !v); }}
              className={outlineBtn}
              aria-label="Toggle order of creation"
            >
              <ChevronsUpDown className="size-3.5" /> {newestFirst ? 'New' : 'Old'}
            </button>
            <button type="button" disabled={selected.size === 0} className={cn(outlineBtn, 'disabled:opacity-100')}>
              <ListChecks className="size-4" /> Bulk Actions{selected.size > 0 && ` (${selected.size})`}
            </button>
            <button type="button" aria-label="Columns" className={cn(outlineBtn, 'px-2.5')}>
              <SlidersHorizontal className="size-4" />
            </button>
            <button type="button" aria-label="Settings" className="text-ed-text/80 hover:text-ed-brand flex size-9 items-center justify-center">
              <Settings className="size-[18px]" />
            </button>
          </div>
        </div>

        {/* table */}
        <div className="thin-scroll mt-3 overflow-x-auto rounded-xl">
          <table className="w-full min-w-[1180px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="bg-[#e9e3ee] [&>th]:px-3 [&>th]:py-4 [&>th]:font-normal">
                <th className="w-12 rounded-tl-xl">
                  <input type="checkbox" aria-label="Select all" checked={allChecked} onChange={toggleAll} className="size-[18px] accent-[#561f6e]" />
                </th>
                <th className="w-[170px]">
                  <span className="flex items-center gap-3">Created At
                    <SortBtn label="Sort by date" active={!newestFirst && !rateSort} onClick={() => { setRateSort(null); setNewestFirst((v) => !v); }} />
                  </span>
                </th>
                <th className="w-[90px]">Auto Call</th>
                <th className="w-[290px]">Customer</th>
                <th className="w-[240px]">Note</th>
                <th className="w-[250px]">Order Items</th>
                <th className="w-[190px]">
                  <span className="flex items-center gap-3">Success Rate
                    <SortBtn label="Sort by success rate" active={!!rateSort} onClick={() => setRateSort((r) => (r === 'desc' ? 'asc' : 'desc'))} />
                  </span>
                </th>
                <th className="w-[110px]">Tags</th>
                <th className="w-[70px]">Site</th>
                <th className="w-[110px] rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-ed-muted py-16 text-center text-sm">
                    No orders found.
                  </td>
                </tr>
              )}
              {visible.map((o) => (
                <Row key={o.id} o={o} checked={selected.has(o.id)} onCheck={() => toggle(o.id)} returnUrl={returnUrl} />
              ))}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="text-ed-muted mt-5 flex flex-wrap items-center justify-between gap-3 text-[14px]">
          <span>Page {cur}</span>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-3">
              Rows per page
              <span className="relative">
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                  className="border-ed-line text-ed-text h-10 w-[88px] appearance-none rounded-lg border bg-[#f7f7fa] pr-8 pl-3 text-[14px] outline-none"
                >
                  {[10, 20, 50, 100].map((n) => <option key={n}>{n}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2" />
              </span>
            </label>
            <span className="text-ed-text">Page {cur}</span>
            <button type="button" disabled={cur <= 1} onClick={() => setPage(cur - 1)} className="flex items-center gap-1 disabled:opacity-70">
              <ChevronLeft className="size-4" /> Previous
            </button>
            <button type="button" disabled={cur >= pages} onClick={() => setPage(cur + 1)} className="flex items-center gap-1 disabled:opacity-70">
              Next <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  o,
  checked,
  onCheck,
  returnUrl,
}: {
  o: WebOrder;
  checked: boolean;
  onCheck: () => void;
  returnUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <tr className="border-ed-line hover:bg-ed-bg/40 border-b align-middle transition-colors [&>td]:px-3 [&>td]:py-3.5">
      <td>
        <input type="checkbox" aria-label={`Select ${o.name}`} checked={checked} onChange={onCheck} className="size-[18px] accent-[#561f6e]" />
      </td>
      <td>
        <p>{o.created}</p>
        <p className="text-ed-muted mt-0.5 text-[12.5px]">{o.idLabel}</p>
      </td>
      <td className="text-ed-muted">-</td>
      <td>
        <div className="space-y-1 text-[13.5px]">
          <p className="flex items-center gap-2">
            <Phone className="text-ed-muted size-4" strokeWidth={1.75} />
            <span>{o.mobile}</span>
            <a href={`tel:${o.mobile}`} aria-label="Call" className="text-blue-600"><Phone className="size-3.5" /></a>
            <a href={`https://wa.me/88${o.mobile}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="text-green-600"><MessageCircle className="size-3.5" /></a>
            <PhoneIncoming className="size-3.5 text-violet-400" aria-hidden="true" />
          </p>
          <p className="flex items-center gap-2">
            <User className="text-ed-muted size-4" strokeWidth={1.75} />
            <span>{o.name}</span>
            <button
              type="button"
              aria-label="Copy name"
              onClick={() => { navigator.clipboard?.writeText(o.name); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
              className={cn('text-ed-muted hover:text-ed-brand', copied && 'text-green-600')}
            >
              <Copy className="size-3.5" />
            </button>
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="text-ed-muted size-4 shrink-0" strokeWidth={1.75} />
            <span className="max-w-[210px] truncate">{o.address}</span>
          </p>
        </div>
      </td>
      <td>
        <div className="text-[13px] leading-snug">
          {o.noteUpdated && <p className="text-ed-muted text-[12px]">{o.noteUpdated}</p>}
          {o.noteLines.map((l, i) => <p key={i} className="mt-0.5 break-words">{l}</p>)}
        </div>
      </td>
      <td>
        <div className="space-y-1.5">
          {o.items.map((i) => (
            <div key={i.code + i.name} className="flex items-center gap-2 rounded-md bg-[#f6f5f9] p-1.5">
              <ProductThumb product={i} className="size-8 rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="max-w-[130px] truncate text-[13px] leading-tight">{i.label ?? i.name}</p>
                <p className="text-ed-muted text-[11px]">৳{i.price}</p>
              </div>
              <span className="text-ed-muted pr-1 text-[12px]">{i.qty}x</span>
            </div>
          ))}
        </div>
      </td>
      <td>{o.success ? <Ring s={o.success} /> : <span className="pl-1">0</span>}</td>
      <td>
        <div className="flex items-center gap-1.5">
          {o.tags.map((t) => (
            <span key={t} className="bg-ed-brand rounded-full px-2.5 py-1 text-[10px] font-bold text-white">{t}</span>
          ))}
          <button type="button" aria-label="Add tag" className="border-ed-line text-ed-muted hover:text-ed-brand flex size-6 items-center justify-center rounded-md border bg-white">
            <Plus className="size-3.5" />
          </button>
        </div>
      </td>
      <td>{o.site}</td>
      <td>
        <Link
          href={`${LIST_PATH}/${o.id}?returnUrl=${returnUrl}`}
          className="border-ed-line hover:text-ed-brand inline-flex h-8 items-center gap-1.5 rounded-lg border bg-white px-3 text-[13.5px] shadow-sm transition-colors"
        >
          Open <ExternalLink className="size-3.5" />
        </Link>
      </td>
    </tr>
  );
}
