'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  CircleCheck,
  CircleX,
  Copy,
  ExternalLink,
  FileImage,
  FileText,
  Filter,
  GripVertical,
  MapPin,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Package,
  Pencil,
  Phone,
  PhoneIncoming,
  Plus,
  Printer,
  Search,
  Settings,
  SlidersHorizontal,
  StickyNote,
  Tag,
  Trash2,
  User,
  Video,
  X,
  Download,
  ClipboardList,
  Layers,
  ListOrdered,
  ShieldAlert,
  CalendarDays,
  FileDown,
  Truck,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import {
  NOW,
  allOrders,
  baseTabsAfter,
  baseTabsBefore,
  channels,
  employees,
  sources,
  type ApprovedOrder,
  type StatusTab,
} from '@/data/approvedOrders';
import { cn } from '@/lib/utils';
import { ProductThumb } from './ProductPicker';
import { deliveryMethods } from '@/data/orders';
import {
  printInvoices,
  printInvoicesGroupedBySku,
  printPicking,
  printSheet,
  printStickers,
} from '@/lib/printDocs';

export const APPROVED_LIST_PATH = '/dashboard/orders/list';

/* ───────────────────────── small helpers ───────────────────────── */

const outlineBtn =
  'border-ed-line text-ed-text hover:text-ed-brand flex h-9 items-center gap-1.5 rounded-lg border bg-white px-3 text-[13px] font-medium shadow-sm transition-colors';

export function Floating({
  anchor,
  onClose,
  align = 'left',
  className,
  width,
  children,
}: {
  anchor: HTMLElement;
  onClose: () => void;
  align?: 'left' | 'right';
  className?: string;
  width?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = anchor.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let left = align === 'right' ? r.right - w : r.left;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    let top = r.bottom + 6;
    if (top + h > window.innerHeight - 8) top = Math.max(8, window.innerHeight - h - 8);
    setPos({ top, left });
  }, [anchor, align]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!ref.current?.contains(t) && !anchor.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onScroll = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onClose);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onClose);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [anchor, onClose]);

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        visibility: pos ? 'visible' : 'hidden',
        colorScheme: 'light',
        ...(width ? { width } : {}),
      }}
      className={cn(
        'font-dash text-ed-text border-ed-line z-50 rounded-xl border bg-white shadow-[0_8px_30px_rgba(30,20,50,0.14)]',
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full transition-colors',
        checked ? 'bg-ed-brand' : 'bg-[#e1dde8]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-4',
        )}
      />
    </button>
  );
}

function SortBtn({
  active,
  dir,
  onClick,
  label,
}: {
  active?: boolean;
  dir?: 'asc' | 'desc';
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn('text-ed-muted hover:text-ed-brand', active && 'text-ed-brand')}
    >
      {active && dir === 'asc' ? (
        <ArrowUp className="size-3.5" />
      ) : active && dir === 'desc' ? (
        <ArrowDown className="size-3.5" />
      ) : (
        <ChevronsUpDown className="size-3.5" />
      )}
    </button>
  );
}

/* ───────────────────────── columns ───────────────────────── */

type ColKey =
  | 'date'
  | 'invoice'
  | 'customer'
  | 'repeat'
  | 'note'
  | 'products'
  | 'productName'
  | 'sku'
  | 'quantity'
  | 'tags'
  | 'customTags'
  | 'statusTags'
  | 'print'
  | 'total'
  | 'upload'
  | 'isCrossSale'
  | 'user'
  | 'source'
  | 'channel'
  | 'attachments'
  | 'actions';

type SortKey = 'date' | 'invoice' | 'products' | 'total' | 'upload' | 'sku' | 'quantity' | 'delivery' | 'discount';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: { label: string; key: SortKey; dir: SortDir }[] = [
  { label: 'Date Created (Newest)', key: 'date', dir: 'desc' },
  { label: 'Date Created (Oldest)', key: 'date', dir: 'asc' },
  { label: 'Order Amount (High to Low)', key: 'total', dir: 'desc' },
  { label: 'Order Amount (Low to High)', key: 'total', dir: 'asc' },
  { label: 'SKU', key: 'sku', dir: 'asc' },
  { label: 'Quantity (High to Low)', key: 'quantity', dir: 'desc' },
  { label: 'Quantity (Low to High)', key: 'quantity', dir: 'asc' },
  { label: 'Delivery Charge (High to Low)', key: 'delivery', dir: 'desc' },
  { label: 'Delivery Charge (Low to High)', key: 'delivery', dir: 'asc' },
  { label: 'Discount (High to Low)', key: 'discount', dir: 'desc' },
  { label: 'Discount (Low to High)', key: 'discount', dir: 'asc' },
];
const sortOptionLabel = (key: SortKey, dir: SortDir) =>
  SORT_OPTIONS.find((o) => o.key === key && o.dir === dir)?.label ??
  `${key === 'invoice' ? 'Invoice' : key === 'products' ? 'Product' : 'Upload'} (${dir === 'desc' ? 'High to Low' : 'Low to High'})`;

const COLS: Record<ColKey, { label: string; menuLabel: string; w: number; sort?: SortKey }> = {
  date: { label: 'Date', menuLabel: 'Date', w: 95, sort: 'date' },
  invoice: { label: 'Invoice', menuLabel: 'Invoice', w: 103, sort: 'invoice' },
  customer: { label: 'Customer', menuLabel: 'Customer', w: 240 },
  repeat: { label: 'Repeat Order', menuLabel: 'Repeat Order', w: 120 },
  note: { label: 'Note', menuLabel: 'Note', w: 167 },
  products: { label: 'Products', menuLabel: 'Products', w: 232, sort: 'products' },
  productName: { label: 'Product Name', menuLabel: 'Product Name', w: 190 },
  sku: { label: 'sku', menuLabel: 'SKU', w: 120 },
  quantity: { label: 'Quantity', menuLabel: 'Quantity', w: 90 },
  tags: { label: 'Tags', menuLabel: 'Tags', w: 96 },
  customTags: { label: 'Custom Tags', menuLabel: 'Custom Tags', w: 87 },
  statusTags: { label: 'Status Tags', menuLabel: 'Status Tags', w: 70 },
  print: { label: 'Print', menuLabel: 'Print', w: 62 },
  total: { label: 'Total', menuLabel: 'Total', w: 89, sort: 'total' },
  upload: { label: 'Upload', menuLabel: 'Upload', w: 95, sort: 'upload' },
  isCrossSale: { label: 'isCrossSale', menuLabel: 'isCrossSale', w: 112 },
  user: { label: 'User', menuLabel: 'User', w: 67 },
  source: { label: 'Source', menuLabel: 'Source', w: 110, },
  channel: { label: 'Channel', menuLabel: 'Channel', w: 120 },
  attachments: { label: 'Attachments', menuLabel: 'Attachments', w: 140 },
  actions: { label: 'Actions', menuLabel: 'Actions', w: 90 },
};

const DEFAULT_ORDER: ColKey[] = [
  'date',
  'invoice',
  'customer',
  'repeat',
  'note',
  'products',
  'productName',
  'sku',
  'quantity',
  'tags',
  'customTags',
  'statusTags',
  'print',
  'total',
  'upload',
  'isCrossSale',
  'user',
  'source',
  'channel',
  'attachments',
  'actions',
];
const DEFAULT_HIDDEN: ColKey[] = ['repeat', 'productName', 'sku', 'quantity'];

interface ColState {
  order: ColKey[];
  hidden: ColKey[];
}
const defaultCols = (): ColState => ({ order: [...DEFAULT_ORDER], hidden: [...DEFAULT_HIDDEN] });
const COLS_STORAGE = 'ed.orderlist.columns.v2';

/* ───────────────────────── filters ───────────────────────── */

interface Filters {
  dateRange: string;
  print: string;
  upload: string;
  advance: string;
  discount: string;
  sku: string;
  productName: string;
  includeOther: boolean;
  employee: string;
  source: string;
  channel: string;
  statusTags: string[];
  qtyMin: string;
  qtyMax: string;
}
const emptyFilters: Filters = {
  dateRange: 'All dates',
  print: 'All',
  upload: 'All',
  advance: 'All',
  discount: 'All',
  sku: '',
  productName: '',
  includeOther: true,
  employee: 'All Employees',
  source: 'All Sources',
  channel: 'All Channels',
  statusTags: [],
  qtyMin: '',
  qtyMax: '',
};
const dateRanges = ['All dates', 'Today', 'Yesterday', 'Last 7 days', 'Last 30 days'];
const DAY = 86_400_000;

function inDateRange(ts: number, range: string) {
  // Dhaka day boundary (UTC+6)
  const dhaka = (t: number) => t + 6 * 3_600_000;
  const today = Math.floor(dhaka(NOW) / DAY);
  const day = Math.floor(dhaka(ts) / DAY);
  switch (range) {
    case 'Today':
      return day === today;
    case 'Yesterday':
      return day === today - 1;
    case 'Last 7 days':
      return day > today - 7;
    case 'Last 30 days':
      return day > today - 30;
    default:
      return true;
  }
}

function applyFilters(rows: ApprovedOrder[], f: Filters) {
  const sku = f.sku.trim().toLowerCase();
  const pn = f.productName.trim().toLowerCase();
  const min = f.qtyMin === '' ? null : Number(f.qtyMin);
  const max = f.qtyMax === '' ? null : Number(f.qtyMax);
  return rows.filter((o) => {
    if (!inDateRange(o.ts, f.dateRange)) return false;
    if (f.print === 'Printed' && !o.printed) return false;
    if (f.print === 'Not printed' && o.printed) return false;
    if (f.upload === 'Uploaded' && !o.uploaded) return false;
    if (f.upload === 'Not Uploaded' && o.uploaded) return false;
    if (f.advance === 'With Advance' && !o.advance) return false;
    if (f.advance === 'No Advance' && o.advance) return false;
    if (f.discount === 'With Discount' && !o.discount) return false;
    if (f.discount === 'No Discount' && o.discount) return false;
    if (sku && !o.product.sku.toLowerCase().includes(sku)) return false;
    if (pn && !o.product.name.toLowerCase().includes(pn)) return false;
    if (f.employee !== 'All Employees' && o.user !== f.employee) return false;
    if (f.source !== 'All Sources' && o.source !== f.source) return false;
    if (f.channel !== 'All Channels' && o.channel !== f.channel) return false;
    if (min !== null && !Number.isNaN(min) && o.product.qty < min) return false;
    if (max !== null && !Number.isNaN(max) && o.product.qty > max) return false;
    return true;
  });
}

/* ───────────────────────── main ───────────────────────── */

interface CustomStatus {
  key: string;
  name: string;
  enabled: boolean;
}
const initialCustom: CustomStatus[] = [
  { key: 'Custom_Active_1', name: 'Custom Active 1', enabled: false },
  { key: 'Custom_Active_2', name: 'Custom Active 2', enabled: false },
];

export function ApprovedOrderList() {
  const params = useSearchParams();
  const pathname = usePathname();

  const [customStatuses, setCustomStatuses] = useState<CustomStatus[]>(initialCustom);
  const [overrides, setOverrides] = useState<Record<string, Partial<ApprovedOrder>>>({});
  const orders = useMemo(
    () => allOrders.map((o) => (overrides[o.id] ? { ...o, ...overrides[o.id] } : o)),
    [overrides],
  );
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    orders.forEach((o) => {
      m[o.status] = (m[o.status] ?? 0) + 1;
    });
    return m;
  }, [orders]);
  const tabs: StatusTab[] = useMemo(
    () =>
      [
        ...baseTabsBefore,
        ...customStatuses
          .filter((c) => c.enabled)
          .map((c) => ({ key: c.key, label: c.name, count: 0 })),
        ...baseTabsAfter,
      ].map((t) => ({ ...t, count: counts[t.key] ?? 0 })),
    [customStatuses, counts],
  );
  const q = params.get('status');
  const active = tabs.some((t) => t.key === q) ? (q as string) : 'Pending';

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'date', dir: 'desc' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [perPage, setPerPage] = useState(500);
  const [page, setPage] = useState(1);
  const [dupOnly, setDupOnly] = useState(false);
  const [cols, setCols] = useState<ColState>(defaultCols);
  const [rowMenu, setRowMenu] = useState<{ id: string; anchor: HTMLElement } | null>(null);
  const [panel, setPanel] = useState<{ kind: 'filters' | 'actions' | 'view' | 'gear' | 'sort'; anchor: HTMLElement } | null>(null);
  const [dialog, setDialog] = useState<{ kind: 'invoice' | 'delivery' | 'note' | 'details'; id?: string } | null>(null);
  const [statusModal, setStatusModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // saved column layout load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLS_STORAGE);
      if (raw) {
        const v = JSON.parse(raw) as ColState;
        if (Array.isArray(v.order) && Array.isArray(v.hidden)) setCols(v);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  const base = useMemo(() => orders.filter((o) => o.status === active), [orders, active]);

  const dupCount = useMemo(() => {
    const m = new Map<string, number>();
    base.forEach((o) => m.set(o.mobile, (m.get(o.mobile) ?? 0) + 1));
    return base.filter((o) => (m.get(o.mobile) ?? 0) > 1).length;
  }, [base]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = applyFilters(base, filters).filter(
      (o) =>
        !term ||
        [o.name, o.mobile, o.invoice, o.address, o.product.name, o.product.sku, o.trackingId ?? '']
          .join(' ')
          .toLowerCase()
          .includes(term),
    );
    if (dupOnly) {
      const m = new Map<string, number>();
      base.forEach((o) => m.set(o.mobile, (m.get(o.mobile) ?? 0) + 1));
      list = list.filter((o) => (m.get(o.mobile) ?? 0) > 1);
    }
    const sign = sort.dir === 'asc' ? 1 : -1;
    const val = (o: ApprovedOrder): number | string => {
      switch (sort.key) {
        case 'invoice':
          return o.invoiceNo;
        case 'products':
          return o.product.name.toLowerCase();
        case 'total':
          return o.total;
        case 'upload':
          return o.uploaded ? 1 : 0;
        case 'sku':
          return o.product.sku.toLowerCase();
        case 'quantity':
          return o.product.qty;
        case 'delivery':
          return o.deliveryCharge;
        case 'discount':
          return o.discountAmount;
        default:
          return o.ts;
      }
    };
    return [...list].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      return (x < y ? -1 : x > y ? 1 : 0) * sign;
    });
  }, [base, filters, search, dupOnly, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const cur = Math.min(page, pages);
  const visible = rows.slice((cur - 1) * perPage, cur * perPage);
  const allChecked = visible.length > 0 && visible.every((o) => selected.has(o.id));

  const shownCols = cols.order.filter((k) => !cols.hidden.includes(k));
  const totalWidth = 30 + shownCols.reduce((s, k) => s + COLS[k].w, 0);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);
  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [updateArrows, shownCols.length, visible.length, active]);

  const scrollBy = (dx: number) => scrollRef.current?.scrollBy({ left: dx, behavior: 'smooth' });

  const actionsBtnRef = useRef<HTMLButtonElement>(null);
  /** checkbox select korle Actions modal open hobe; sob unselect korle close */
  const applySelection = (next: Set<string>) => {
    setSelected(next);
    const btn = actionsBtnRef.current;
    if (next.size === 0) setPanel((p) => (p?.kind === 'actions' ? null : p));
    else if (btn) setPanel({ kind: 'actions', anchor: btn });
  };
  const toggle = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    applySelection(n);
  };
  const toggleAll = () => {
    const n = new Set(selected);
    visible.forEach((o) => (allChecked ? n.delete(o.id) : n.add(o.id)));
    applySelection(n);
  };

  const setSortKey = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));

  const openPanel = (kind: 'filters' | 'actions' | 'view' | 'gear' | 'sort', el: HTMLElement) =>
    setPanel((p) => (p?.kind === kind ? null : { kind, anchor: el }));
  const closePanel = useCallback(() => setPanel(null), []);
  const closeRowMenu = useCallback(() => setRowMenu(null), []);

  const exportCsv = () => {
    const src = selected.size ? rows.filter((o) => selected.has(o.id)) : rows;
    const head = ['Date', 'Invoice', 'Customer', 'Mobile', 'Address', 'Product', 'SKU', 'Qty', 'Total', 'Status', 'User', 'Source', 'Channel'];
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const body = src.map((o) =>
      [o.created, o.invoice, o.name, o.mobile, o.address, o.product.name, o.product.sku, o.product.qty, o.total, o.status, o.user, o.source, o.channel].map(esc).join(','),
    );
    const blob = new Blob(['\ufeff' + [head.map(esc).join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${active.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const menuOrder = rowMenu ? base.find((o) => o.id === rowMenu.id) : undefined;
  const sortLabel = `(${sortOptionLabel(sort.key, sort.dir)}`;
  const statusLabelOf = (k: string) => tabs.find((t) => t.key === k)?.label ?? k;
  const selectedOrders = useMemo(() => orders.filter((o) => selected.has(o.id)), [orders, selected]);
  const dialogOrder = dialog?.id ? orders.find((o) => o.id === dialog.id) : undefined;

  const patchOrders = (ids: string[], patch: Partial<ApprovedOrder>) =>
    setOverrides((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = { ...next[id], ...patch };
      });
      return next;
    });
  const dropSelection = (ids: string[]) =>
    setSelected((s0) => {
      const n = new Set(s0);
      ids.forEach((i) => n.delete(i));
      return n;
    });
  const moveOrders = (ids: string[], status: string) => {
    if (!ids.length) return flash('Select at least one order first');
    patchOrders(ids, { status, updated: 'less than a minute ago' });
    dropSelection(ids);
    flash(`${ids.length} order(s) moved to ${statusLabelOf(status)}`);
  };
  const sendToPathao = (ids: string[]) => {
    if (!ids.length) return flash('Select at least one order first');
    ids.forEach((id, i) =>
      patchOrders([id], {
        status: 'Shipped',
        uploaded: true,
        trackingId: `PT${Date.now().toString().slice(-8)}${i}`,
        updated: 'less than a minute ago',
      }),
    );
    dropSelection(ids);
    flash(`${ids.length} order(s) sent to Pathao`);
  };
  const runPrint = (kind: 'invoice' | 'invoiceSku' | 'sticker' | 'picking' | 'sheet', list: ApprovedOrder[]) => {
    if (!list.length) {
      flash('Select at least one order first');
      return false;
    }
    const ok =
      kind === 'invoice'
        ? printInvoices(list)
        : kind === 'invoiceSku'
          ? printInvoicesGroupedBySku(list)
          : kind === 'sticker'
            ? printStickers(list)
            : kind === 'picking'
              ? printPicking(list)
              : printSheet(list);
    if (!ok) {
      flash('Pop-up blocked. Allow pop-ups to print.');
      return false;
    }
    if (kind === 'invoice' || kind === 'invoiceSku' || kind === 'sticker') {
      patchOrders(list.map((o) => o.id), { printed: true });
    }
    return true;
  };
  const rowAction = (label: string, o: ApprovedOrder) => {
    switch (label) {
      case 'Order Details':
        return setDialog({ kind: 'details', id: o.id });
      case 'Print':
        return void runPrint('sticker', [o]);
      case 'Send to RTS':
        return moveOrders([o.id], 'RTS');
      case 'Send to Pathao':
        return sendToPathao([o.id]);
      case 'Cancel':
        return moveOrders([o.id], 'Cancelled');
      case 'Add Note':
        return setDialog({ kind: 'note', id: o.id });
      default:
        return flash(`${label} – ${o.invoice}`);
    }
  };

  return (
    <div className="border-ed-line mt-4 flex min-h-[calc(100vh-6.5rem)] flex-col rounded-2xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
      {/* status tabs */}
      <div role="tablist" className="thin-scroll flex gap-1 overflow-x-auto px-3 pt-1.5 sm:px-4">
        {tabs.map((t) => {
          const on = t.key === active;
          return (
            <Link
              key={t.key}
              role="tab"
              aria-selected={on}
              scroll={false}
              href={t.key === 'Pending' ? APPROVED_LIST_PATH : `${APPROVED_LIST_PATH}?status=${t.key}`}
              onClick={() => {
                setPage(1);
                setSelected(new Set());
                setDupOnly(false);
              }}
              className={cn(
                'flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-3.5 text-[14.5px] whitespace-nowrap transition-colors',
                on ? 'border-ed-brand text-ed-text' : 'text-ed-muted hover:text-ed-text border-transparent',
              )}
            >
              {t.label}
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] tabular-nums',
                  on ? 'bg-ed-brand-soft text-ed-text' : 'bg-ed-bg text-ed-muted',
                )}
              >
                {t.count}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="border-ed-line border-t" />

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 sm:px-4">
        {/* toolbar */}
        <div className="bg-ed-bg/70 mt-3 flex flex-wrap items-center justify-between gap-2.5 rounded-lg p-1.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:w-[340px] sm:flex-none">
              <Search className="text-ed-muted absolute top-1/2 right-3 size-4 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter orders..."
                className="border-ed-line focus:border-ed-brand/40 focus:ring-ed-brand/10 h-10 w-full rounded-lg border bg-white pr-9 pl-3 text-[14px] outline-none focus:ring-2"
              />
            </div>
            <button
              type="button"
              onClick={(e) => openPanel('filters', e.currentTarget)}
              className={cn(outlineBtn, 'h-10 px-3.5 text-[14px]')}
            >
              <Filter className="size-4" /> Filters
            </button>
            <button
              type="button"
              onClick={(e) => openPanel('sort', e.currentTarget)}
              className={cn(outlineBtn, 'h-10 max-w-[190px] px-3 text-[14px]')}
              aria-label="Change sort order"
              aria-haspopup="listbox"
            >
              <ChevronsUpDown className="size-4 shrink-0" />
              <span className="text-ed-muted truncate pl-2">{sortLabel}</span>
            </button>
            <button
              ref={actionsBtnRef}
              type="button"
              onClick={(e) => openPanel('actions', e.currentTarget)}
              className={cn(outlineBtn, 'h-10 px-3.5 text-[14px]')}
            >
              <MoreVertical className="size-4" /> Actions
            </button>
            {dupCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setDupOnly((v) => !v);
                  setPage(1);
                }}
                className="bg-ed-red hover:bg-ed-red/90 flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-[14px] font-medium text-white"
              >
                {dupOnly ? 'Hide Duplicates' : 'Show Duplicates'} <span>{dupCount}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => openPanel('view', e.currentTarget)}
              className={cn(outlineBtn, 'h-10 px-3.5 text-[14px]')}
            >
              <SlidersHorizontal className="size-4" /> View
            </button>
            <button
              type="button"
              aria-label="Settings"
              onClick={(e) => openPanel('gear', e.currentTarget)}
              className="text-ed-text/80 hover:text-ed-brand flex size-9 items-center justify-center"
            >
              <Settings className="size-[18px]" />
            </button>
          </div>
        </div>

        {/* table */}
        <div className="relative mt-3 min-h-0 flex-1">
          {canLeft && (
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollBy(-420)}
              className="border-ed-line text-ed-text hover:text-ed-brand absolute top-3 left-1 z-10 flex size-8 items-center justify-center rounded-full border bg-white shadow"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
          {canRight && (
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollBy(420)}
              className="border-ed-line text-ed-text hover:text-ed-brand absolute top-3 right-1 z-10 flex size-8 items-center justify-center rounded-full border bg-white shadow"
            >
              <ChevronRight className="size-4" />
            </button>
          )}
          <div
            ref={scrollRef}
            onScroll={updateArrows}
            className="purple-scroll border-ed-line max-h-[calc(100vh-17rem)] min-h-[300px] overflow-auto rounded-xl border"
          >
            <table className="border-collapse text-left text-[14px]" style={{ minWidth: totalWidth, width: '100%' }}>
              <thead className="sticky top-0 z-[1]">
                <tr className="bg-[#e9e3ee] [&>th]:px-3 [&>th]:py-4 [&>th]:font-normal">
                  <th style={{ width: 30, minWidth: 30 }} className="!pl-[9px] !pr-[3px]">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={allChecked}
                      onChange={toggleAll}
                      className="size-[18px] accent-[#561f6e]"
                    />
                  </th>
                  {shownCols.map((k) => {
                    const c = COLS[k];
                    return (
                      <th key={k} style={{ width: c.w, minWidth: c.w }} className={cn(k === 'upload' && 'text-ed-blue text-[13px]')}>
                        <span className="flex items-center gap-2.5">
                          {c.label}
                          {c.sort && (
                            <SortBtn
                              label={`Sort by ${c.label}`}
                              active={sort.key === c.sort}
                              dir={sort.dir}
                              onClick={() => setSortKey(c.sort as SortKey)}
                            />
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={shownCols.length + 1} className="text-ed-muted py-20 text-center text-sm">
                      No orders found.
                    </td>
                  </tr>
                )}
                {visible.map((o) => (
                  <Row
                    key={o.id}
                    o={o}
                    cols={shownCols}
                    checked={selected.has(o.id)}
                    onCheck={() => toggle(o.id)}
                    onMenu={(el) =>
                      setRowMenu((m) => (m?.id === o.id && m.anchor === el ? null : { id: o.id, anchor: el }))
                    }
                    onCopy={() => flash('Name copied')}
                    statusLabel={statusLabelOf(o.status)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* footer */}
        <div className="text-ed-muted mt-3 flex flex-wrap items-center justify-between gap-3 text-[14px]">
          <span>
            {selected.size} of {rows.length} row(s) selected.
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-ed-text flex items-center gap-3">
              Rows per page
              <span className="relative">
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border-ed-line text-ed-text h-9 w-[84px] appearance-none rounded-lg border bg-white pr-7 pl-3 text-[14px] outline-none"
                >
                  {[10, 20, 50, 100, 500].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2" />
              </span>
            </label>
            <span className="text-ed-text">
              Page {cur} of {pages}
            </span>
            <div className="flex items-center gap-1.5">
              {(
                [
                  [ChevronsLeft, 'First page', () => setPage(1), cur <= 1],
                  [ChevronLeft, 'Previous page', () => setPage(cur - 1), cur <= 1],
                  [ChevronRight, 'Next page', () => setPage(cur + 1), cur >= pages],
                  [ChevronsRight, 'Last page', () => setPage(pages), cur >= pages],
                ] as [LucideIcon, string, () => void, boolean][]
              ).map(([Icon, label, fn, off]) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  disabled={off}
                  onClick={fn}
                  className="border-ed-line text-ed-text hover:text-ed-brand flex size-9 items-center justify-center rounded-lg border bg-white disabled:opacity-45"
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* floating panels */}
      {panel?.kind === 'filters' && (
        <Floating anchor={panel.anchor} onClose={closePanel} className="w-[285px]">
          <FiltersPanel value={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
        </Floating>
      )}
      {panel?.kind === 'sort' && (
        <Floating anchor={panel.anchor} onClose={closePanel} className="w-[207px] py-2">
          <div role="listbox" aria-label="Sort orders">
            {SORT_OPTIONS.map((opt) => {
              const on = sort.key === opt.key && sort.dir === opt.dir;
              return (
                <button
                  key={opt.label}
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => {
                    setSort({ key: opt.key, dir: opt.dir });
                    closePanel();
                  }}
                  className="hover:bg-ed-bg flex w-full items-start gap-3 px-3.5 py-[7px] text-left text-[12px] leading-snug"
                >
                  <span className="mt-[3px] flex size-3 shrink-0 items-center justify-center">
                    {on && <span className="border-ed-muted size-2.5 rounded-full border" />}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Floating>
      )}
      {panel?.kind === 'actions' && (
        <Floating anchor={panel.anchor} onClose={closePanel} className="w-[288px]">
          <div className="thin-scroll max-h-[min(570px,calc(100vh-8rem))] overflow-y-auto py-6 pr-3 pl-7">
            <div className="flex items-center justify-between text-[12px]">
              <span className="bg-ed-bg rounded-md px-2 py-1 font-medium">{selected.size} selected</span>
              <button
                type="button"
                onClick={() => setSelected(new Set(rows.map((o) => o.id)))}
                className="hover:text-ed-brand mr-1 flex items-center gap-2 font-medium"
              >
                <Check className="size-3.5" /> Select All
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                closePanel();
                flash('Approved Auto Call opened');
              }}
              className="border-ed-line hover:bg-ed-bg mt-4 flex h-10 w-full items-center gap-3 rounded-lg border px-3 text-[12px] font-medium"
            >
              <CircleCheck className="size-4" /> Open Approved Auto Call
            </button>

            <p className="text-ed-muted mt-5 flex items-center gap-1.5 text-[11.5px]">
              <Printer className="size-3" /> Print Options
            </p>
            <div className="mt-2 grid grid-cols-2 gap-y-1 text-[12px] font-medium">
              {(
                [
                  [FileText, 'Invoice', () => { closePanel(); runPrint('invoice', selectedOrders); }],
                  [Package, 'Sticker', () => { closePanel(); runPrint('sticker', selectedOrders); }],
                  [ClipboardList, 'Picking', () => { closePanel(); runPrint('picking', selectedOrders); }],
                  [FileText, 'Sheet', () => { closePanel(); runPrint('sheet', selectedOrders); }],
                ] as [LucideIcon, string, () => void][]
              ).map(([Icon, label, fn]) => (
                <button key={label} type="button" onClick={fn} className="hover:bg-ed-bg flex h-9 items-center gap-3 rounded-md pl-3">
                  <Icon className="size-4" /> {label}
                </button>
              ))}
            </div>
            <div className="bg-ed-line mt-3 mr-1 h-px" />

            {selected.size > 0 && (
              <>
                <p className="text-ed-muted mt-4 flex items-center gap-1.5 text-[11.5px]">
                  <CircleCheck className="size-3" /> Status Update
                </p>
                <p className="text-ed-muted mt-1.5 text-[11.5px]">Update Status ({selected.size} selected)</p>
                <div className="mt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => { closePanel(); moveOrders([...selected], 'RTS'); }}
                    className="border-ed-line hover:bg-ed-bg flex h-10 w-full items-center gap-3 rounded-lg border px-3 text-[13px] font-medium"
                  >
                    <span className="flex size-4 items-center justify-center rounded-full bg-[#4f46e5]">
                      <Check className="size-3 text-white" strokeWidth={3} />
                    </span>
                    Ready to Ship
                  </button>
                  <button
                    type="button"
                    onClick={() => { closePanel(); moveOrders([...selected], 'Shipped'); }}
                    className="border-ed-line hover:bg-ed-bg flex h-10 w-full items-center gap-3 rounded-lg border px-3 text-[13px] font-medium"
                  >
                    <Truck className="size-4 text-[#2f5fe8]" /> Send to Shipping
                  </button>
                  <button
                    type="button"
                    onClick={() => { closePanel(); moveOrders([...selected], 'Cancelled'); }}
                    className="border-ed-line text-ed-red hover:bg-ed-red/5 flex h-10 w-full items-center gap-3 rounded-lg border px-3 text-[13px] font-medium"
                  >
                    <X className="size-4" /> Cancel Orders
                  </button>
                </div>
                <div className="bg-ed-line mt-4 mr-1 h-px" />

                <p className="text-ed-muted mt-4 flex items-center gap-1.5 text-[11.5px]">
                  <Truck className="size-3" /> Courier Services
                </p>
                <button
                  type="button"
                  onClick={() => { closePanel(); sendToPathao([...selected]); }}
                  className="border-ed-line hover:bg-ed-bg mt-2 flex h-10 w-full items-center gap-3 rounded-lg border px-3 text-[13px] font-medium"
                >
                  <span className="flex size-4 items-center justify-center text-[13px] font-semibold">R</span> Send to Pathao
                </button>
                <div className="mt-2 text-[12px] font-medium">
                  <button
                    type="button"
                    onClick={() => { closePanel(); flash('Courier status refreshed'); }}
                    className="hover:bg-ed-bg flex h-9 w-full items-center gap-3 rounded-md pl-3"
                  >
                    <RefreshCw className="size-4" /> Refresh Status
                  </button>
                  <button
                    type="button"
                    onClick={() => { closePanel(); setDialog({ kind: 'delivery' }); }}
                    className="hover:bg-ed-bg flex h-9 w-full items-center gap-3 rounded-md pl-3"
                  >
                    <Truck className="size-4" /> Change Delivery Method
                  </button>
                </div>
                <div className="bg-ed-line mt-3 mr-1 h-px" />
              </>
            )}

            <p className="text-ed-muted mt-4 flex items-center gap-1.5 text-[11.5px]">
              <Download className="size-3" /> Tools &amp; Export
            </p>
            <div className="mt-2 grid grid-cols-2 gap-y-1 text-[12px] font-medium">
              <button type="button" onClick={() => { closePanel(); exportCsv(); }} className="hover:bg-ed-bg flex h-9 items-center gap-3 rounded-md pl-3">
                <Download className="size-4" /> Excel
              </button>
              <button type="button" onClick={() => { closePanel(); setDupOnly((v) => !v); }} className="hover:bg-ed-bg flex h-9 items-center gap-3 rounded-md pl-3">
                <Copy className="size-4" /> Duplicates
              </button>
            </div>
          </div>
        </Floating>
      )}
      {panel?.kind === 'view' && (
        <Floating anchor={panel.anchor} onClose={closePanel} align="right" className="w-[165px]">
          <ViewPanel
            cols={cols}
            onChange={setCols}
            onSave={() => {
              try {
                localStorage.setItem(COLS_STORAGE, JSON.stringify(cols));
              } catch {
                /* ignore */
              }
              closePanel();
              flash('Columns saved');
            }}
            onReset={() => {
              setCols(defaultCols());
              try {
                localStorage.removeItem(COLS_STORAGE);
              } catch {
                /* ignore */
              }
            }}
          />
        </Floating>
      )}
      {panel?.kind === 'gear' && (
        <Floating anchor={panel.anchor} onClose={closePanel} align="right" className="w-[224px] p-2.5">
          {(
            [
              [Settings, 'Customize Statuses', () => { closePanel(); setStatusModal(true); }],
              [MessageSquare, 'Team Chat', () => { closePanel(); flash('Team Chat'); }],
              [Video, 'Video Guide', () => { closePanel(); flash('Video Guide'); }],
            ] as [LucideIcon, string, () => void][]
          ).map(([Icon, label, fn]) => (
            <button key={label} type="button" onClick={fn} className="hover:bg-ed-bg flex h-11 w-full items-center gap-3 rounded-lg px-3 text-[14px]">
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </Floating>
      )}

      {rowMenu && menuOrder && (
        <Floating anchor={rowMenu.anchor} onClose={closeRowMenu} className="w-[222px] py-1.5">
          <RowMenu
            o={menuOrder}
            onPick={(label) => {
              closeRowMenu();
              rowAction(label, menuOrder);
            }}
          />
        </Floating>
      )}

      {dialog?.kind === 'invoice' && (
        <Dialog title="Print Invoice" subtitle={`${selectedOrders.length} orders selected`} onClose={() => setDialog(null)}>
          <div className="mt-6 space-y-3">
            {(
              [
                [FileText, 'Print Invoice (By Invoice)', () => runPrint('invoice', selectedOrders)],
                [FileText, 'Print Invoice (Grouped by SKU)', () => runPrint('invoiceSku', selectedOrders)],
                [FileDown, 'Download PDF', () => runPrint('invoice', selectedOrders)],
              ] as [LucideIcon, string, () => boolean][]
            ).map(([Icon, label, fn]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (fn()) setDialog(null);
                }}
                className="border-ed-line hover:bg-ed-bg flex h-10 w-full items-center gap-4 rounded-lg border bg-white px-4 text-left text-[13px] font-medium"
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => setDialog(null)} className="border-ed-line hover:bg-ed-bg h-10 rounded-lg border px-5 text-[13px] font-medium">
              Close
            </button>
          </div>
        </Dialog>
      )}
      {dialog?.kind === 'delivery' && (
        <DeliveryDialog
          count={selectedOrders.length}
          onClose={() => setDialog(null)}
          onApply={(m) => {
            setDialog(null);
            flash(`Delivery method changed to ${m} (${selectedOrders.length} orders)`);
          }}
        />
      )}
      {dialog?.kind === 'note' && dialogOrder && (
        <NoteDialog
          o={dialogOrder}
          onClose={() => setDialog(null)}
          onSave={(note) => {
            patchOrders([dialogOrder.id], { note });
            setDialog(null);
            flash('Note saved');
          }}
        />
      )}
      {dialog?.kind === 'details' && dialogOrder && (
        <DetailsDialog
          o={dialogOrder}
          statusLabel={statusLabelOf(dialogOrder.status)}
          onClose={() => setDialog(null)}
          onInvoice={() => void runPrint('invoice', [dialogOrder])}
          onSticker={() => void runPrint('sticker', [dialogOrder])}
        />
      )}

      {statusModal && (
        <StatusModal
          value={customStatuses}
          onClose={() => setStatusModal(false)}
          onSave={(v) => {
            setCustomStatuses(v);
            setStatusModal(false);
            flash('Statuses saved');
          }}
        />
      )}

      {toast && (
        <div
          role="status"
          className="bg-ed-text fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg px-4 py-2 text-[13px] text-white shadow-lg"
        >
          {toast}
        </div>
      )}
      <span className="sr-only">{pathname}</span>
    </div>
  );
}

/* ───────────────────────── row ───────────────────────── */

function pctColor(p: number) {
  return p >= 70 ? '#22b35e' : p >= 30 ? '#f5a524' : '#ef3b3b';
}

function Row({
  o,
  cols,
  checked,
  onCheck,
  onMenu,
  onCopy,
  statusLabel,
}: {
  o: ApprovedOrder;
  cols: ColKey[];
  checked: boolean;
  onCheck: () => void;
  onMenu: (el: HTMLElement) => void;
  onCopy: () => void;
  statusLabel: string;
}) {
  const kebab = (cls?: string) => (
    <button
      type="button"
      aria-label={`Actions for ${o.invoice}`}
      aria-haspopup="menu"
      onClick={(e) => onMenu(e.currentTarget)}
      className={cn('border-ed-line text-ed-text hover:text-ed-brand flex size-8 shrink-0 items-center justify-center rounded-lg border bg-white', cls)}
    >
      <MoreVertical className="size-4" />
    </button>
  );

  const cell = (k: ColKey): ReactNode => {
    switch (k) {
      case 'date':
        return (
          <>
            <p className="text-[13px] leading-snug">{o.created}</p>
            <p className="text-ed-blue/70 mt-0.5 text-[10.5px] leading-tight">Updated {o.updated}</p>
          </>
        );
      case 'invoice':
        return (
          <div className="flex items-center gap-2">
            <span className="w-[40px] break-words">{o.invoice.replace('-', '-\u200b')}</span>
            {kebab()}
          </div>
        );
      case 'customer':
        return (
          <div className="space-y-1 text-[13.5px]">
            <p className="flex items-center gap-2">
              <User className="text-ed-muted size-4" strokeWidth={1.75} />
              <span className="max-w-[170px] truncate">{o.name}</span>
              <button
                type="button"
                aria-label="Copy name"
                onClick={() => {
                  navigator.clipboard?.writeText(o.name);
                  onCopy();
                }}
                className="text-ed-muted hover:text-ed-brand"
              >
                <Copy className="size-3.5" />
              </button>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="text-ed-muted size-4" strokeWidth={1.75} />
              <span>{o.mobile}</span>
              <span className="text-[12px] font-bold" style={{ color: pctColor(o.successPct) }}>
                {o.successPct}%
              </span>
              <a href={`tel:${o.mobile}`} aria-label="Call" className="text-blue-600"><Phone className="size-3.5" /></a>
              <a href={`https://wa.me/88${o.mobile}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="text-green-600"><MessageCircle className="size-3.5" /></a>
              <PhoneIncoming className="size-3.5 text-violet-400" aria-hidden="true" />
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="text-ed-muted mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
              <span className="line-clamp-2 max-w-[220px]">{o.address}</span>
            </p>
          </div>
        );
      case 'repeat':
        return o.repeat ? <span className="text-ed-brand">Repeat</span> : <span className="text-ed-muted">-</span>;
      case 'note':
        return <span className="text-[13px] break-words">{o.note}</span>;
      case 'products':
        return (
          <div>
            <p className="flex items-center gap-1.5 text-[12px]">
              <span className={cn('size-1.5 rounded-full', o.status === 'Delivered' ? 'bg-green-500' : 'bg-blue-600')} />
              <span className="text-ed-muted">{statusLabel}</span>
            </p>
            <div className="mt-1 flex items-center gap-2">
              <ProductThumb product={o.product} className="size-8 rounded-md" />
              <div className="min-w-0">
                <p className="max-w-[170px] truncate text-[13px] leading-tight">{o.product.name}</p>
                <p className="text-ed-muted text-[11px]">
                  {o.product.sku} • Qty: {o.product.qty}
                </p>
              </div>
            </div>
          </div>
        );
      case 'productName':
        return <span className="text-[13px]">{o.product.name}</span>;
      case 'sku':
        return <span className="break-words">{o.product.sku}</span>;
      case 'quantity':
        return <span>{o.product.qty}</span>;
      case 'tags':
        return (
          <button type="button" aria-label="Add tag" className="border-ed-line text-ed-muted hover:text-ed-brand flex size-6 items-center justify-center rounded-md border bg-white">
            <Plus className="size-3.5" />
          </button>
        );
      case 'customTags':
      case 'statusTags':
        return null;
      case 'print':
        return o.printed ? (
          <Check className="size-5 text-green-600" strokeWidth={2.25} />
        ) : (
          <CircleX className="text-ed-red size-[18px]" />
        );
      case 'total':
        return (
          <div>
            <p>{o.total}</p>
            {o.unpaid && <p className="text-ed-red text-[10.5px]">Unpaid</p>}
          </div>
        );
      case 'upload':
        return o.uploaded ? (
          <span className="flex items-center gap-2 text-[13px]">
            <span className="flex text-green-600"><Check className="size-4" /><Check className="-ml-2 size-4" /></span>
            <span className="text-ed-blue underline">{o.trackingId}</span>
          </span>
        ) : (
          <span className="text-ed-red flex gap-1.5"><X className="size-4" /><X className="size-4" /></span>
        );
      case 'isCrossSale':
        return <span>{String(o.isCrossSale)}</span>;
      case 'user':
        return <span>{o.user}</span>;
      case 'source':
        return <span>{o.source}</span>;
      case 'channel':
        return <span>{o.channel}</span>;
      case 'attachments':
        return o.attachments > 0 ? <span>{o.attachments}</span> : <span className="text-ed-muted">-</span>;
      case 'actions':
        return kebab();
    }
  };

  return (
    <tr
      className={cn(
        'border-ed-line hover:bg-ed-bg/40 border-b align-middle transition-colors last:border-b-0 [&>td]:px-3 [&>td]:py-3.5',
        checked && 'bg-[#efeaf4]/80',
      )}
    >
      <td className="!pl-[9px] !pr-[3px]">
        <input type="checkbox" aria-label={`Select ${o.invoice}`} checked={checked} onChange={onCheck} className="size-[18px] accent-[#561f6e]" />
      </td>
      {cols.map((k) => (
        <td key={k}>{cell(k)}</td>
      ))}
    </tr>
  );
}

/* ───────────────────────── row menu ───────────────────────── */

function RowMenu({ o, onPick }: { o: ApprovedOrder; onPick: (label: string) => void }) {
  const item = 'hover:bg-ed-bg flex h-10 w-full items-center gap-3 px-3.5 text-left text-[14px]';
  const sep = <div className="bg-ed-line mx-1 my-1 h-px" />;
  return (
    <div role="menu" aria-label={`Actions for ${o.invoice}`}>
      <button type="button" role="menuitem" onClick={() => onPick('Order Details')} className={cn(item, 'text-ed-blue')}>
        <FileText className="size-4" /> <span className="flex-1">Order Details</span> <ExternalLink className="size-3.5" />
      </button>
      <button type="button" role="menuitem" onClick={() => onPick('Print')} className={item}>
        <Printer className="size-4" /> Print
      </button>
      <button type="button" role="menuitem" onClick={() => onPick('JPG Export')} className={item}>
        <FileImage className="size-4" /> JPG Export
      </button>
      {sep}
      <div className="px-1.5">
        <button type="button" role="menuitem" onClick={() => onPick('Edit')} className="border-ed-line bg-ed-bg/60 hover:bg-ed-bg flex h-10 w-full items-center gap-3 rounded-lg border px-2.5 text-[14px]">
          <Pencil className="size-4" /> <span className="flex-1 text-left">Edit</span> <Pencil className="text-ed-muted size-3.5" />
        </button>
      </div>
      {sep}
      <button type="button" role="menuitem" onClick={() => onPick('Send to RTS')} className={item}>
        <Package className="size-4" /> Send to RTS
      </button>
      {sep}
      <button type="button" role="menuitem" onClick={() => onPick('Send to Pathao')} className={item}>
        <span className="flex size-4 items-center justify-center text-[13px] font-semibold">R</span> Send to Pathao
      </button>
      {sep}
      <button type="button" role="menuitem" onClick={() => onPick('Cancel')} className={cn(item, 'text-ed-red')}>
        <X className="size-4" /> Cancel
      </button>
      {sep}
      <button type="button" role="menuitem" onClick={() => onPick('Create Task')} className={cn(item, 'h-9 text-[13px]')}>
        <Plus className="size-4" /> Create Task
      </button>
      <button type="button" role="menuitem" onClick={() => onPick('Add Note')} className={cn(item, 'h-10 pl-[3.1rem]')}>
        <StickyNote className="-ml-[2.1rem] size-4" /> <span className="pl-[1.3rem]">Add Note</span>
      </button>
    </div>
  );
}

/* ───────────────────────── filters panel ───────────────────────── */

function Seg({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-ed-text text-[11px] font-medium">{label}</span>
      <div className="flex items-center gap-0.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              'rounded-md px-1.5 py-1 text-[10.5px] transition-colors',
              value === o ? 'bg-ed-brand text-white' : 'text-ed-text hover:bg-ed-bg',
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="text-ed-text mb-1.5 text-[10.5px] font-medium">{children}</p>;
}

const fieldCls =
  'border-ed-line focus:border-ed-brand/40 h-9 w-full rounded-lg border bg-white px-3 text-[11.5px] outline-none placeholder:text-[#9a96a6]';

function SelectField({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  icon?: ReactNode;
}) {
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">{icon}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(fieldCls, 'h-10 appearance-none pr-8 text-[12px]', icon && 'pl-9')}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2" />
    </div>
  );
}

function FiltersPanel({ value: f, onChange }: { value: Filters; onChange: (f: Filters) => void }) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...f, [k]: v });
  return (
    <div className="thin-scroll max-h-[calc(100vh-7rem)] space-y-3.5 overflow-y-auto p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold">Filters</p>
        <button type="button" onClick={() => onChange(emptyFilters)} className="text-ed-brand text-[11px] font-medium hover:underline">
          Reset
        </button>
      </div>

      <div>
        <FieldLabel><span className="text-ed-muted tracking-wide uppercase">Date range</span></FieldLabel>
        <SelectField value={f.dateRange} onChange={(v) => set('dateRange', v)} options={dateRanges} icon={<CalendarDays className="text-ed-muted size-3.5" />} />
      </div>

      <div className="space-y-2.5">
        <Seg label="Print Status" options={['All', 'Printed', 'Not printed']} value={f.print} onChange={(v) => set('print', v)} />
        <Seg label="Upload Status" options={['All', 'Not Uploaded', 'Uploaded']} value={f.upload} onChange={(v) => set('upload', v)} />
        <Seg label="Advance Payment" options={['All', 'With Advance', 'No Advance']} value={f.advance} onChange={(v) => set('advance', v)} />
        <Seg label="Discount" options={['All', 'With Discount', 'No Discount']} value={f.discount} onChange={(v) => set('discount', v)} />
      </div>

      <div>
        <FieldLabel>Product SKU</FieldLabel>
        <input value={f.sku} onChange={(e) => set('sku', e.target.value)} placeholder="Enter SKU to filter" className={cn(fieldCls, 'h-10')} />
      </div>
      <div>
        <FieldLabel>Product Name</FieldLabel>
        <input value={f.productName} onChange={(e) => set('productName', e.target.value)} placeholder="Enter product name" className={cn(fieldCls, 'h-10')} />
      </div>

      <div className="border-ed-line flex items-center justify-between gap-3 rounded-lg border p-2.5">
        <div>
          <p className="text-[10.5px] font-medium">Include other products</p>
          <p className="text-ed-muted mt-0.5 text-[9px] leading-tight">Orders that also contain other products are shown.</p>
        </div>
        <Switch checked={f.includeOther} onChange={(v) => set('includeOther', v)} label="Include other products" />
      </div>

      <div>
        <FieldLabel>Employee</FieldLabel>
        <SelectField value={f.employee} onChange={(v) => set('employee', v)} options={['All Employees', ...employees]} />
      </div>
      <div>
        <FieldLabel>Order Source</FieldLabel>
        <SelectField value={f.source} onChange={(v) => set('source', v)} options={['All Sources', ...sources]} />
      </div>
      <div>
        <FieldLabel>Channel</FieldLabel>
        <SelectField value={f.channel} onChange={(v) => set('channel', v)} options={['All Channels', ...channels]} />
      </div>
      <div>
        <FieldLabel>Order Tags</FieldLabel>
        <SelectField value="Select tags" onChange={() => {}} options={['Select tags']} icon={<Tag className="text-ed-muted size-3.5" />} />
      </div>

      <div>
        <FieldLabel>Status Tags (Fraud Detection)</FieldLabel>
        <div className="flex gap-1.5">
          {(
            [
              [User, 'Customer Fraud'],
              [ShieldAlert, 'Courier Fraud'],
            ] as [LucideIcon, string][]
          ).map(([Icon, label]) => {
            const on = f.statusTags.includes(label);
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => set('statusTags', on ? f.statusTags.filter((x) => x !== label) : [...f.statusTags, label])}
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[10px]',
                  on ? 'border-ed-brand bg-ed-brand-soft text-ed-brand' : 'border-ed-line',
                )}
              >
                <Icon className="size-3" /> {label}
              </button>
            );
          })}
        </div>
        <div className="mt-2">
          <SelectField value="Select status tags" onChange={() => {}} options={['Select status tags']} icon={<Layers className="text-ed-muted size-3.5" />} />
        </div>
      </div>

      <div>
        <FieldLabel>Quantity Range</FieldLabel>
        <div className="flex items-center gap-2">
          <input value={f.qtyMin} onChange={(e) => set('qtyMin', e.target.value.replace(/\D/g, ''))} placeholder="Min" inputMode="numeric" className={cn(fieldCls, 'h-10')} />
          <span className="text-ed-muted">-</span>
          <input value={f.qtyMax} onChange={(e) => set('qtyMax', e.target.value.replace(/\D/g, ''))} placeholder="Max" inputMode="numeric" className={cn(fieldCls, 'h-10')} />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── view (toggle columns) ───────────────────────── */

function ViewPanel({
  cols,
  onChange,
  onSave,
  onReset,
}: {
  cols: ColState;
  onChange: (c: ColState) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  const [arrange, setArrange] = useState(false);
  const move = (k: ColKey, dir: -1 | 1) => {
    const i = cols.order.indexOf(k);
    const j = i + dir;
    if (j < 0 || j >= cols.order.length) return;
    const order = [...cols.order];
    [order[i], order[j]] = [order[j], order[i]];
    onChange({ ...cols, order });
  };
  const flip = (k: ColKey) =>
    onChange({
      ...cols,
      hidden: cols.hidden.includes(k) ? cols.hidden.filter((x) => x !== k) : [...cols.hidden, k],
    });

  return (
    <div className="p-2.5">
      <p className="px-1.5 pt-1 pb-2 text-[11.5px] font-semibold">{arrange ? 'Arrange columns' : 'Toggle columns'}</p>
      <ul className="thin-scroll max-h-[225px] overflow-y-auto">
        {cols.order.map((k) => {
          const on = !cols.hidden.includes(k);
          return (
            <li key={k} className="flex items-center">
              {arrange ? (
                <div className="hover:bg-ed-bg flex h-8 w-full items-center gap-1.5 rounded px-1.5 text-[11.5px]">
                  <GripVertical className="text-ed-muted size-3.5" />
                  <span className="flex-1 truncate">{COLS[k].menuLabel}</span>
                  <button type="button" aria-label={`Move ${COLS[k].menuLabel} up`} onClick={() => move(k, -1)} className="text-ed-muted hover:text-ed-brand"><ArrowUp className="size-3.5" /></button>
                  <button type="button" aria-label={`Move ${COLS[k].menuLabel} down`} onClick={() => move(k, 1)} className="text-ed-muted hover:text-ed-brand"><ArrowDown className="size-3.5" /></button>
                </div>
              ) : (
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={on}
                  onClick={() => flip(k)}
                  className="hover:bg-ed-bg flex h-8 w-full items-center gap-2 rounded px-1.5 text-left text-[11.5px]"
                >
                  <span className="flex size-3.5 items-center justify-center">{on && <Check className="size-3.5" />}</span>
                  {COLS[k].menuLabel}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => setArrange((a) => !a)}
        className="border-ed-line hover:bg-ed-bg mt-2 flex h-9 w-full items-center gap-2 rounded-lg border px-2.5 text-[11.5px]"
      >
        <ListOrdered className="size-3.5" /> Arrange Columns
      </button>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onSave} className="bg-ed-brand h-9 flex-1 rounded-lg text-[12px] font-semibold text-white">
          Save
        </button>
        <button type="button" onClick={onReset} className="bg-ed-red h-9 flex-1 rounded-lg text-[12px] font-semibold text-white">
          Reset
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── customize statuses modal ───────────────────────── */

function StatusModal({
  value,
  onClose,
  onSave,
}: {
  value: CustomStatus[];
  onClose: () => void;
  onSave: (v: CustomStatus[]) => void;
}) {
  const [list, setList] = useState<CustomStatus[]>(value);
  const MAX = 10;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const patch = (key: string, p: Partial<CustomStatus>) =>
    setList((l) => l.map((c) => (c.key === key ? { ...c, ...p } : c)));
  const add = () =>
    setList((l) => {
      if (l.length >= MAX) return l;
      let n = l.length + 1;
      while (l.some((c) => c.key === `Custom_Active_${n}`)) n++;
      return [...l, { key: `Custom_Active_${n}`, name: `Custom Active ${n}`, enabled: false }];
    });
  const move = (i: number, dir: -1 | 1) =>
    setList((l) => {
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const n = [...l];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const fixed = (label: string) => (
    <div key={label} className="border-ed-line flex items-center gap-3 rounded-lg border bg-white px-3.5 py-2.5">
      <span className="text-ed-muted"><LockIcon /></span>
      <div>
        <p className="text-[12.5px] font-medium">{label}</p>
        <p className="text-ed-muted text-[10.5px]">Fixed status</p>
      </div>
    </div>
  );

  return createPortal(
    <div
      className="font-dash text-ed-text fixed inset-0 z-[55] flex items-center justify-center bg-black/45 p-4"
      style={{ colorScheme: 'light' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="cs-title" className="relative flex max-h-[min(760px,calc(100vh-2rem))] w-[420px] max-w-full flex-col rounded-2xl bg-white p-5 shadow-2xl">
        <button type="button" aria-label="Close" onClick={onClose} className="text-ed-muted hover:text-ed-text absolute top-4 right-4">
          <X className="size-4" />
        </button>
        <h2 id="cs-title" className="text-[14px] font-semibold">Customize Ecom Statuses</h2>
        <p className="text-ed-muted mt-1 pr-6 text-[11.5px] leading-snug">
          Add and enable up to {MAX} active order queues, then position them between Pending and Delivered.
        </p>

        <div className="thin-scroll mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {list.map((c) => (
            <div key={c.key} className="border-ed-line rounded-xl border p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12.5px] font-medium">Custom Active Status {c.key.split('_').pop()}</p>
                  <p className="text-ed-muted text-[10px]">Internal key: {c.key}</p>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <button type="button" aria-label={`Delete ${c.name}`} onClick={() => setList((l) => l.filter((x) => x.key !== c.key))} className="text-ed-red">
                    <Trash2 className="size-3.5" />
                  </button>
                  <span>{c.enabled ? 'Enabled' : 'Disabled'}</span>
                  <Switch checked={c.enabled} onChange={(v) => patch(c.key, { enabled: v })} label={`Enable ${c.name}`} />
                </div>
              </div>
              <label className="mt-3 block text-[11px] font-medium">
                Display Name
                <input
                  value={c.name}
                  onChange={(e) => patch(c.key, { name: e.target.value })}
                  className="border-ed-line focus:border-ed-brand/40 mt-1.5 h-10 w-full rounded-lg border px-3 text-[12px] font-normal outline-none"
                />
              </label>
            </div>
          ))}

          <div className="border-ed-line flex items-center justify-between rounded-xl border p-3">
            <span className="text-ed-muted text-[11.5px]">{list.length} of {MAX} used</span>
            <button
              type="button"
              onClick={add}
              disabled={list.length >= MAX}
              className="border-ed-line hover:text-ed-brand flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[11.5px] disabled:opacity-50"
            >
              <Plus className="size-3.5" /> Add Custom Status
            </button>
          </div>

          <div className="border-ed-line rounded-xl border p-3.5">
            <p className="text-[12.5px] font-medium">Status order</p>
            <p className="text-ed-muted mt-1 mb-3 text-[10.5px] leading-snug">
              Drag custom statuses or use the arrow buttons. Fixed statuses keep their workflow order.
            </p>
            <div className="space-y-2">
              {['Pending', 'RTS', 'Shipped'].map(fixed)}
              {list.map((c, i) => (
                <div key={c.key} className={cn('border-ed-line flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5', !c.enabled && 'bg-ed-bg/40')}>
                  <GripVertical className="text-ed-muted size-3.5" />
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-[12.5px]', !c.enabled && 'text-ed-muted')}>{c.name}</p>
                    <p className="text-ed-muted text-[10.5px]">{c.enabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="text-ed-muted hover:text-ed-brand disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                  <button type="button" aria-label="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)} className="text-ed-muted hover:text-ed-brand disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                </div>
              ))}
              {['Delivered', 'Pending Return', 'Returned', 'Partial', 'Cancelled', 'Pending Cancel', 'Preorder', 'Lost'].map(fixed)}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2.5">
          <button type="button" onClick={onClose} className="border-ed-line h-9 rounded-lg border bg-white px-4 text-[12.5px]">
            Cancel
          </button>
          <button type="button" onClick={() => onSave(list)} className="bg-ed-brand h-9 rounded-lg px-4 text-[12.5px] font-semibold text-white">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}


/* ───────────────────────── dialogs ───────────────────────── */

function Dialog({
  title,
  subtitle,
  onClose,
  width = 448,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  width?: number;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return createPortal(
    <div
      className="font-dash text-ed-text fixed inset-0 z-[55] flex items-center justify-center bg-black/55 p-4"
      style={{ colorScheme: 'light' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width }}
        className="relative max-h-[calc(100vh-2rem)] max-w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <button type="button" aria-label="Close" onClick={onClose} className="text-ed-muted hover:text-ed-text absolute top-5 right-5">
          <X className="size-4" />
        </button>
        <h2 className="text-[19px] leading-tight font-semibold">{title}</h2>
        {subtitle && <p className="text-ed-muted mt-1 text-[13.5px]">{subtitle}</p>}
        {children}
      </div>
    </div>,
    document.body,
  );
}

function DialogActions({ onClose, onOk, ok }: { onClose: () => void; onOk: () => void; ok: string }) {
  return (
    <div className="mt-6 flex justify-end gap-2.5">
      <button type="button" onClick={onClose} className="border-ed-line hover:bg-ed-bg h-10 rounded-lg border px-5 text-[13px] font-medium">
        Cancel
      </button>
      <button type="button" onClick={onOk} className="bg-ed-brand h-10 rounded-lg px-5 text-[13px] font-semibold text-white">
        {ok}
      </button>
    </div>
  );
}

function DeliveryDialog({ count, onClose, onApply }: { count: number; onClose: () => void; onApply: (m: string) => void }) {
  const [m, setM] = useState(deliveryMethods[0]);
  return (
    <Dialog title="Change Delivery Method" subtitle={`${count} orders selected`} onClose={onClose}>
      <div className="relative mt-5">
        <select value={m} onChange={(e) => setM(e.target.value)} className="border-ed-line h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-8 text-[13px] outline-none">
          {deliveryMethods.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
      </div>
      <DialogActions onClose={onClose} onOk={() => onApply(m)} ok="Apply" />
    </Dialog>
  );
}

function NoteDialog({ o, onClose, onSave }: { o: ApprovedOrder; onClose: () => void; onSave: (n: string) => void }) {
  const [v, setV] = useState(o.note);
  return (
    <Dialog title="Add Note" subtitle={`${o.invoice} · ${o.name}`} onClose={onClose}>
      <textarea
        autoFocus
        value={v}
        onChange={(e) => setV(e.target.value)}
        rows={4}
        placeholder="Write a note for this order..."
        className="border-ed-line focus:border-ed-brand/40 mt-5 w-full resize-none rounded-lg border p-3 text-[13px] outline-none"
      />
      <DialogActions onClose={onClose} onOk={() => onSave(v.trim())} ok="Save note" />
    </Dialog>
  );
}

function DetailsDialog({
  o,
  statusLabel,
  onClose,
  onInvoice,
  onSticker,
}: {
  o: ApprovedOrder;
  statusLabel: string;
  onClose: () => void;
  onInvoice: () => void;
  onSticker: () => void;
}) {
  const rows: [string, string][] = [
    ['Date', o.created],
    ['Status', statusLabel],
    ['Customer', o.name],
    ['Mobile', `${o.mobile} (${o.successPct}% success)`],
    ['Address', o.address],
    ['Product', `${o.product.name} (${o.product.sku}) × ${o.product.qty}`],
    ['Delivery charge', String(o.deliveryCharge)],
    ['Discount', String(o.discountAmount)],
    ['Total', `৳${o.total}${o.unpaid ? ' (Unpaid)' : ''}`],
    ['Handled by', `${o.user} · ${o.source} · ${o.channel}`],
  ];
  return (
    <Dialog title={`Order ${o.invoice}`} subtitle="Order details" onClose={onClose} width={520}>
      <dl className="border-ed-line mt-5 divide-y divide-[#f0edf4] rounded-xl border text-[13px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-4 px-4 py-2.5">
            <dt className="text-ed-muted w-[120px] shrink-0">{k}</dt>
            <dd className="min-w-0 flex-1 break-words">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-wrap justify-end gap-2.5">
        <button type="button" onClick={onSticker} className="border-ed-line hover:bg-ed-bg flex h-10 items-center gap-2 rounded-lg border px-4 text-[13px] font-medium">
          <Package className="size-4" /> Print Sticker
        </button>
        <button type="button" onClick={onInvoice} className="bg-ed-brand flex h-10 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold text-white">
          <Printer className="size-4" /> Print Invoice
        </button>
        <button type="button" onClick={onClose} className="border-ed-line hover:bg-ed-bg h-10 rounded-lg border px-5 text-[13px] font-medium">
          Close
        </button>
      </div>
    </Dialog>
  );
}
