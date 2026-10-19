import { IMG_898, IMG_DIAMOND } from './orders';

export interface StatusTab {
  key: string;
  label: string;
  count: number;
}

/** Fixed workflow statuses. Custom statuses Pending/RTS/Shipped er pore, Delivered er age boshe. */
export const baseTabsBefore: StatusTab[] = [
  { key: 'Pending', label: 'Pending', count: 1 },
  { key: 'RTS', label: 'RTS', count: 38 },
  { key: 'Shipped', label: 'Shipped', count: 0 },
];
export const baseTabsAfter: StatusTab[] = [
  { key: 'Delivered', label: 'Delivered', count: 1674 },
  { key: 'PendingReturn', label: 'Pending Return', count: 586 },
  { key: 'Returned', label: 'Returned', count: 0 },
  { key: 'Partial', label: 'Partial', count: 0 },
  { key: 'Cancelled', label: 'Cancelled', count: 22 },
  { key: 'PendingCancel', label: 'Pending Cancel', count: 2 },
  { key: 'Preorder', label: 'Preorder', count: 0 },
  { key: 'Lost', label: 'Lost', count: 0 },
];

export interface OrderProduct {
  name: string;
  sku: string;
  qty: number;
  image?: string;
  tint?: string;
}

export interface ApprovedOrder {
  id: string;
  status: string;
  /** UTC ms. Sorting er jonno */
  ts: number;
  created: string;
  updated: string;
  invoice: string;
  invoiceNo: number;
  name: string;
  mobile: string;
  successPct: number;
  address: string;
  note: string;
  product: OrderProduct;
  total: number;
  unpaid: boolean;
  printed: boolean;
  uploaded: boolean;
  trackingId?: string;
  isCrossSale: boolean;
  repeat: boolean;
  advance: boolean;
  discount: boolean;
  user: string;
  source: string;
  channel: string;
  attachments: number;
  deliveryCharge: number;
  discountAmount: number;
}

export const employees = ['Smita E', 'mahima N', 'Rafi K', 'Nusrat J'];
export const sources = ['Unknown', 'Website', 'Facebook', 'Instagram', 'WhatsApp', 'Phone Call'];
export const channels = ['Unknown', 'Facebook', 'Instagram', 'WhatsApp', 'Website'];

/** "Ekhon" er fixed reference (hydration mismatch charate). Real backend e Date.now() hobe. */
export const NOW = Date.UTC(2026, 9, 14, 3, 50);

const LOKET: OrderProduct = {
  name: 'korean loket 780 taka',
  sku: 'korean loket 780 taka',
  qty: 1,
  tint: '#efe3c4',
};
const COMBO: OrderProduct = { name: '898 taka combo nacklace', sku: '55462', qty: 1, image: IMG_898 };
const BUTTERFLY: OrderProduct = { name: 'butterflay nacklace777', sku: '777sdku', qty: 1, tint: '#b88a6a' };
const DIAMOND: OrderProduct = { name: 'round diamond set', sku: '27967', qty: 1, image: IMG_DIAMOND };

const pad = (n: number) => String(n).padStart(2, '0');

export function formatCreated(ts: number) {
  // Dhaka time = UTC+6
  const d = new Date(ts + 6 * 3_600_000);
  const h = d.getUTCHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}, ${h12}:${pad(d.getUTCMinutes())} ${h < 12 ? 'am' : 'pm'}`;
}

function agoLabel(ts: number) {
  const mins = Math.max(0, Math.round((NOW - ts) / 60000));
  if (mins < 1) return 'less than a minute ago';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `about ${hours} hours ago`;
  const days = Math.round(hours / 24);
  return `${days} days ago`;
}

interface Seed {
  status: string;
  d: number;
  m: number;
  h: number;
  min: number;
  invoiceNo: number;
  name: string;
  mobile: string;
  pct: number;
  address: string;
  product: OrderProduct;
  total: number;
  tracking?: string;
  unpaid?: boolean;
  user: string;
  source: string;
  channel: string;
  updated?: string;
}

function make(s: Seed): ApprovedOrder {
  const ts = Date.UTC(2026, s.m - 1, s.d, s.h, s.min);
  return {
    id: `${s.status}-${s.invoiceNo}`,
    status: s.status,
    ts,
    created: formatCreated(ts),
    updated: s.updated ?? agoLabel(ts),
    invoice: `EH-${s.invoiceNo}`,
    invoiceNo: s.invoiceNo,
    name: s.name,
    mobile: s.mobile,
    successPct: s.pct,
    address: s.address,
    note: '',
    product: s.product,
    total: s.total,
    unpaid: !!s.unpaid,
    printed: false,
    uploaded: !!s.tracking,
    trackingId: s.tracking,
    isCrossSale: false,
    repeat: false,
    advance: false,
    discount: false,
    user: s.user,
    source: s.source,
    channel: s.channel,
    attachments: 0,
    deliveryCharge: 0,
    discountAmount: 0,
  };
}

// 14/10/2026 9:45 am (Dhaka) = 03:45 UTC
const pending: ApprovedOrder[] = [
  {
    ...make({
      status: 'Pending',
      d: 14,
      m: 10,
      h: 3,
      min: 45,
      invoiceNo: 16746,
      name: 'razwan',
      mobile: '01914221528',
      pct: 93,
      address: 'dhanmondi dhaka',
      product: DIAMOND,
      total: 1150,
      user: 'Smita E',
      source: 'Unknown',
      channel: 'Unknown',
      updated: 'less than a minute ago',
    }),
  },
];

// Dhaka time (UTC+6) -> UTC: 8:07 pm Dhaka = 14:07 UTC
type RealRow = readonly [
  number, // invoice no
  string, // name
  string, // mobile
  number, // success %
  string, // address
  OrderProduct,
  number, // total
  string, // tracking id
  number, // day
  number, // UTC hour
  number, // minute
  string, // updated label
];

const rtsRows: RealRow[] = [
  [16745, 'রেহানা আক্তর', '01862100469', 100, 'চাঁদ পুর মতলব,গ্রাম দক্ষিণ নওগাঁ', LOKET, 780, 'DH1310267WS3UN', 13, 14, 7, 'about 14 hours ago'],
  [16744, 'Maksud Munna', '01755540506', 94, 'House 23, Road 24, Gulshan 2, Dhaka', COMBO, 898, 'DH1310267ZEHSD', 13, 14, 2, 'about 14 hours ago'],
  [16743, '780 AKM.SHAFIQUR RAHMAN.', '01839111111', 84, '45-DILKHOSHA.JAMAN COURT.MATIJHEEL.DHAKA. LIFT-4.5', LOKET, 700, 'DH131026U8WW2Y', 13, 14, 1, 'about 14 hours ago'],
  [16742, 'Mdjalal', '01771454908', 67, 'Habir,dhaka,savar,korno para', LOKET, 780, 'DH1310262TA42L', 13, 13, 23, 'about 14 hours ago'],
  [16741, '780+780 Md Dulal', '01717185634', 80, 'Dhaka,Kamrangir cha,Roni market', { ...LOKET, qty: 2 }, 1560, 'DH131026Q72BCG', 13, 13, 19, 'about 14 hours ago'],
  [16740, 'Mostafa Kamal', '01711372792', 88, '214 Ahmed Nagar, Solimuddin Market Mirpur-1, Dhaka.', COMBO, 898, 'DH1310267F6G3T', 13, 11, 13, 'about 15 hours ago'],
];

const deliveredRows: RealRow[] = [
  [16725, 'অনুরাধা সূত্রধর', '01932171433', 100, 'রামরাইল,b.bariya,sadar', LOKET, 780, 'DH111026RU27DH', 11, 5, 3, 'about 2 days ago'],
  [16724, '780 Tahara naznin', '01773770065', 79, 'Village. Kumerpur thana.vulle.Thakurgaon sadar', LOKET, 700, 'DH111026ZPMB38', 11, 4, 50, 'about 15 hours ago'],
  [16723, 'Md abu sayed Khan', '01925102733', 100, 'Gendariya d i t plot Dhaka 1204,shempur', BUTTERFLY, 777, 'DH111026N4XX56', 11, 4, 42, 'about 1 day ago'],
  [16722, 'Habibur', '01832296261', 100, 'বনরুপা রোড রাজিব স্টোর এর সামনে চান্দনা চৌরাস্তা গাজীপুর', LOKET, 780, 'DH111026GYGCPV', 11, 4, 36, 'about 18 hours ago'],
  [16720, 'Soleman', '01736269484', 0, 'সাজাপুর ফটকি ব্রীজ মোহিনী নাবিল জুটমিল বগুড়া', LOKET, 780, 'DH111026BGZV6D', 11, 4, 29, 'about 1 day ago'],
  [16714, 'রাজু আহমেদ', '01630679928', 40, 'আশুলিয়া বাইপেল ছনিয়া মার্কেট, dhaka', BUTTERFLY, 777, 'DH101026XPFHTV', 10, 12, 31, 'about 3 days ago'],
];

const fromRows = (rows: RealRow[], status: string, unpaid: boolean): ApprovedOrder[] =>
  rows.map(([no, name, mobile, pct, address, product, total, tracking, d, h, min, updated]) =>
    make({
      status,
      d,
      m: 10,
      h,
      min,
      invoiceNo: no,
      name,
      mobile,
      pct,
      address,
      product,
      total,
      tracking,
      unpaid,
      user: 'mahima N',
      source: 'Website',
      channel: 'Facebook',
      updated,
    }),
  );

const rtsReal = fromRows(rtsRows, 'RTS', false);
const deliveredReal = fromRows(deliveredRows, 'Delivered', true);

// ───────── demo filler: tab count er sathe milaite ─────────
const firstNames = ['Rahim', 'Karim', 'Sumaiya', 'Nusrat', 'Tanvir', 'Jannat', 'Imran', 'Farzana', 'Sabbir', 'Mim', 'Arif', 'Shirin'];
const lastNames = ['Hossain', 'Ahmed', 'Akter', 'Islam', 'Khan', 'Begum', 'Uddin', 'Chowdhury', 'Mia', 'Sarker'];
const places = [
  'Mirpur 10, Dhaka',
  'Uttara Sector 7, Dhaka',
  'Mohammadpur, Dhaka',
  'Agrabad, Chattogram',
  'Zindabazar, Sylhet',
  'Rangpur Sadar, Rangpur',
  'Savar Bazar, Dhaka',
  'Tongi, Gazipur',
  'Narayanganj Sadar',
  'Cumilla Kandirpar',
];
const catalog: OrderProduct[] = [LOKET, COMBO, BUTTERFLY, DIAMOND];
const prices = [780, 898, 777, 1150];

function filler(
  status: string,
  count: number,
  startInvoice: number,
  startTs: number,
  skip: number,
  seedBase: number,
  withTracking: boolean,
  unpaid: boolean,
): ApprovedOrder[] {
  const out: ApprovedOrder[] = [];
  for (let i = skip; i < count; i++) {
    const n = seedBase + i;
    const k = n % catalog.length;
    const ts = startTs - (i - skip + 1) * (37 + (n % 5) * 11) * 60000;
    // 3 jora duplicate mobile => exactly 6 duplicate row (jodi dupPairs thake)
    const pairIdx = status === 'Delivered' && i >= 40 && i < 46 ? (i - 40) >> 1 : -1;
    const phoneSeed = pairIdx >= 0 ? seedBase + 40 + pairIdx * 2 : n;
    const digits = String(10000000 + ((phoneSeed * 7919 + 12345) % 90000000));
    const mobile = `01${(phoneSeed % 7) + 3}${digits}`;
    const qty = n % 9 === 0 ? 2 : 1;
    out.push({
      ...make({
        status,
        d: 1,
        m: 1,
        h: 0,
        min: 0,
        invoiceNo: startInvoice - (i - skip),
        name: `${firstNames[n % firstNames.length]} ${lastNames[(n * 3) % lastNames.length]}`,
        mobile,
        pct: (n * 37) % 101,
        address: places[n % places.length],
        product: { ...catalog[k], qty },
        total: prices[k] * qty,
        tracking: withTracking ? `DH${String(1000000000 + n * 7777).slice(0, 7)}${String.fromCharCode(65 + (n % 26))}${String.fromCharCode(65 + ((n * 5) % 26))}${String.fromCharCode(65 + ((n * 11) % 26))}${n % 10}` : undefined,
        unpaid,
        user: employees[n % 3 === 0 ? 1 : n % 3 === 1 ? 0 : 2],
        source: n % 4 === 0 ? 'Facebook' : 'Website',
        channel: n % 4 === 0 ? 'Instagram' : 'Facebook',
      }),
      deliveryCharge: n % 3 === 0 ? 60 : n % 3 === 1 ? 0 : 120,
      discountAmount: n % 7 === 0 ? 50 : 0,
      discount: n % 7 === 0,
      id: `${status}-${startInvoice - (i - skip)}`,
      ts,
      created: formatCreated(ts),
      updated: agoLabel(ts),
    });
  }
  return out;
}

const byStatus: Record<string, ApprovedOrder[]> = {
  Pending: pending,
  RTS: [...rtsReal, ...filler('RTS', 38, 16739, Date.UTC(2026, 9, 13, 11, 0), 6, 100, true, false)],
  Delivered: [
    ...deliveredReal,
    ...filler('Delivered', 1674, 16713, Date.UTC(2026, 9, 10, 12, 31), 6, 1000, true, true),
  ],
  PendingReturn: filler('PendingReturn', 586, 16000, Date.UTC(2026, 9, 6, 9, 0), 0, 5000, true, false),
  Cancelled: filler('Cancelled', 22, 15500, Date.UTC(2026, 9, 4, 9, 0), 0, 9000, false, false),
  PendingCancel: filler('PendingCancel', 2, 16730, Date.UTC(2026, 9, 12, 9, 0), 0, 9500, false, false),
};

export const allOrders: ApprovedOrder[] = Object.values(byStatus).flat();

export function ordersForStatus(key: string): ApprovedOrder[] {
  return byStatus[key] ?? [];
}

export const tabKeyFromParam = (q: string | null, keys: string[]) =>
  q && keys.includes(q) ? q : 'Pending';
