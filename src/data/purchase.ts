/** TODO: sob data real API theke ashbe (purchase summary + list). Ekhon screenshot er moto mock data. */

export type ReceiveStatus = 'Received' | 'Pending';
export type PayStatus = 'Paid' | 'Partial' | 'Unpaid';

export interface PurchaseRow {
  id: string;
  invoice: string;
  supplier: string;
  date: string; // YYYY-MM-DD
  amount: number;
  paid: number;
  receive: ReceiveStatus;
  source: string;
  items: string; // product/sku text for search
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  purchases: number;
  total: number;
  due: number;
}

export const QUICK_SUPPLIER = 'Quick Stock Increase';

/** TODO: API. Prothom ta screenshot theke; baki 2-ta mock vendor (New Purchase er vendor dropdown test er jonno). */
export const suppliers: Supplier[] = [
  { id: 'sup-1', name: QUICK_SUPPLIER, phone: '—', email: '—', purchases: 12, total: 41598179, due: 41597279 },
  { id: 'sup-2', name: 'Dhaka Jewellery House', phone: '01711-000001', email: '—', purchases: 0, total: 0, due: 0 },
  { id: 'sup-3', name: 'Chattogram Trading Co.', phone: '01811-000002', email: '—', purchases: 0, total: 0, due: 0 },
];

export const payStatus = (p: PurchaseRow): PayStatus =>
  p.paid >= p.amount ? 'Paid' : p.paid > 0 ? 'Partial' : 'Unpaid';

export const purchaseSeed: PurchaseRow[] = [
  { id: 'p1', invoice: 'cmo9uomt44vfx2co7k1a0', supplier: QUICK_SUPPLIER, date: '2026-10-12', amount: 900, paid: 0, receive: 'Received', source: 'Quick Stock In', items: 'butterflay nacklace777 777sdku' },
  { id: 'p2', invoice: 'cmjzwalmk3gl7rw0kv2b1', supplier: QUICK_SUPPLIER, date: '2026-09-28', amount: 0, paid: 0, receive: 'Pending', source: 'Quick Stock In', items: 'Korean nacklace 2002' },
  { id: 'p3', invoice: 'cmisd2d8e1s80pk0k3c9d', supplier: QUICK_SUPPLIER, date: '2026-09-21', amount: 0, paid: 0, receive: 'Pending', source: 'Quick Stock In', items: 'Butterfly nacklace 888889' },
  { id: 'p4', invoice: 'cmiscrg2v1rbbpk0k8e4f', supplier: QUICK_SUPPLIER, date: '2026-09-14', amount: 0, paid: 0, receive: 'Pending', source: 'Quick Stock In', items: 'Butterfly nacklace 33334' },
  { id: 'p5', invoice: 'cmimzwqxl58wnqa0g7h5j', supplier: QUICK_SUPPLIER, date: '2026-09-02', amount: 0, paid: 0, receive: 'Pending', source: 'Quick Stock In', items: 'rotate necklace BB38' },
  ...Array.from({ length: 7 }, (_, i): PurchaseRow => ({
    id: `p${i + 6}`,
    invoice: `cmh${(7 - i).toString(36)}qk2m9x4t0b${i}zz8a1c`,
    supplier: QUICK_SUPPLIER,
    date: `2026-08-${String(20 - i * 2).padStart(2, '0')}`,
    amount: 0,
    paid: 0,
    receive: 'Pending',
    source: 'Quick Stock In',
    items: '—',
  })),
];

export const purchaseSummary = {
  totalPurchase: 900,
  totalPaid: 0,
  totalDue: 900,
  overdueDue: 0,
  pendingReceive: 0,
  receivedValue: 900,
  topSupplier: null as null | { name: string; amount: number },
  overdueSuppliers: 0,
  shipmentsAwaiting: 11,
  lowStockProducts: 1,
  totalPurchases: 12,
  avgPurchaseValue: 75,
  avgPaymentDays: 30,
  receiveRate: 0,
  paid: { paidPct: 100, count: 12 },
  receive: { received: 1, pending: 11 },
  trend: [
    { label: 'May', value: 0 },
    { label: 'Jun', value: 0 },
    { label: 'Jul', value: 0 },
    { label: 'Aug', value: 0 },
    { label: 'Sep', value: 0 },
    { label: 'Oct', value: 0 },
  ],
  bySupplier: [] as { name: string; value: number }[],
  topProducts: [
    { name: 'butterflay nacklace777', sku: '777sdku', qty: 49927, total: 38793279 },
    { name: 'Korean nacklace', sku: '2002', qty: 2800, total: 1400000 },
    { name: 'Butterfly nacklace', sku: '888889', qty: 600, total: 360000 },
    { name: 'Butterfly nacklace', sku: '33334', qty: 600, total: 360000 },
    { name: 'rotate necklace', sku: 'BB38', qty: 300, total: 210000 },
  ],
  overdueSupplierPayments: [] as { supplier: string; amount: number; invoices: number; oldest: string }[],
};

export const taka = (n: number) => `৳${Math.round(n).toLocaleString('en-IN')}`;


/* ───────── Purchase orders (list + new purchase) ───────── */
export interface PurchaseItem { id: string; name: string; sku: string; qty: number; price: number }
export interface PurchaseOrder {
  id: string;
  date: string; // YYYY-MM-DDTHH:mm
  supplier: string;
  source: 'Quick Stock' | 'Purchase';
  items: PurchaseItem[];
  note: string;
  extras: { label: string; amount: number }[];
  amount: number;
  paid: number;
  settled?: boolean; // quick stock-in: auto settled, payment column e "—"
  receive: ReceiveStatus;
}
export const orderPay = (o: PurchaseOrder): PayStatus =>
  o.settled || (o.amount > 0 && o.paid >= o.amount) ? 'Paid' : o.paid > 0 ? 'Partial' : 'Unpaid';

const ord = (id: string, date: string, name: string, sku: string, amount: number, note: string, receive: ReceiveStatus = 'Pending', settled = false): PurchaseOrder => ({
  id, date, supplier: QUICK_SUPPLIER, source: 'Quick Stock', note, extras: [], amount, paid: settled ? amount : 0, settled, receive,
  items: [{ id: `${id}-i`, name, sku, qty: 1, price: amount }],
});

/** TODO: API. Prothom 6 ta screenshot er hubohu; baki 6 ta total ৳41,598,179 miliye mock. */
export const purchaseOrderSeed: PurchaseOrder[] = [
  ord('o1', '2026-04-22T15:28', 'জুমকা', '—', 900, '', 'Received', true),
  ord('o2', '2026-01-04T21:37', 'butterflay nacklace777', '777sdku', 38793279, ''),
  ord('o3', '2025-12-05T10:24', 'Black cup set', '—', 110000, 'Initial Stock'),
  ord('o4', '2025-12-05T10:16', 'Winter cup combo', '—', 22000, 'Initial Stock'),
  ord('o5', '2025-12-01T16:17', 'Butterfly nacklace', '888889', 360000, 'Initial Stock'),
  ord('o6', '2025-12-01T11:16', 'Butterfly nacklace', '33334', 360000, 'Initial Stock'),
  ord('o7', '2025-12-01T10:50', 'Korean nacklace', '2002', 1400000, 'Initial Stock'),
  ord('o8', '2025-11-30T17:02', 'rotate necklace', 'BB38', 210000, 'Initial Stock'),
  ord('o9', '2025-11-30T15:40', 'Korian top Earring', '2026', 100000, 'Initial Stock'),
  ord('o10', '2025-11-29T18:15', 'round diamond set', '27967', 90000, 'Initial Stock'),
  ord('o11', '2025-11-29T14:20', 'SMART KOREAN NECKLESS', '28115', 82000, 'Initial Stock'),
  ord('o12', '2025-11-28T11:05', 'purple neckless', '28670', 70000, 'Initial Stock'),
];

export interface CatalogProduct { id: string; name: string; sku: string; price: number; stock: number; fav: boolean; tint?: [string, string] }
/** TODO: API (products list). Screenshot er product gulo; tint = chobi nei bole gradient placeholder. */
export const catalog: CatalogProduct[] = [
  { id: 'c1', name: 'Korian top Earring', sku: '2026', price: 600, stock: 60, fav: true },
  { id: 'c2', name: 'round diamond set', sku: '27967', price: 839.3, stock: -34, fav: true, tint: ['#1e2a5a', '#3b4a8a'] },
  { id: 'c3', name: 'SMART KOREAN NECKLESS', sku: '28115', price: 609, stock: -3, fav: true, tint: ['#e9c9b4', '#c99a7e'] },
  { id: 'c4', name: 'rotatable Necklace', sku: '28451', price: 560, stock: -1236, fav: true, tint: ['#3a2a22', '#a8794f'] },
  { id: 'c5', name: 'purple neckless', sku: '28670', price: 558, stock: -558, fav: true, tint: ['#b58fb8', '#7c4a86'] },
  { id: 'c6', name: 'Korean earring pair', sku: '2008', price: 500, stock: 2702, fav: false },
  { id: 'c7', name: 'Korean nacklace', sku: '2005', price: 500, stock: -111, fav: false },
  { id: 'c8', name: 'Leaf earring Free 1 Stone Nose Pin', sku: '27970', price: 699.3, stock: -2, fav: false, tint: ['#6b3f2c', '#c9a26a'] },
  { id: 'c9', name: 'love shape diamond set', sku: '27942', price: 698.6, stock: -3, fav: false, tint: ['#2a3550', '#6b7a99'] },
  { id: 'c10', name: 'leaf loket combo', sku: '27973', price: 697.9, stock: -2, fav: false, tint: ['#f1d9c4', '#d9a77a'] },
];
