import { IMG_898, IMG_DIAMOND, couriers, type CourierStat, type CustomerRecordData } from './orders';

export type WebStatus =
  | 'PROCESSING'
  | 'INCOMPLETE'
  | 'GOOD_BUT_NO_RESPONSE'
  | 'NO_RESPONSE'
  | 'ADVANCE_PAYMENT'
  | 'ON_HOLD'
  | 'APPROVED'
  | 'CANCEL'
  | 'ALL';

export const statusTabs: { key: WebStatus; label: string; count: number }[] = [
  { key: 'PROCESSING', label: 'Processing', count: 2 },
  { key: 'INCOMPLETE', label: 'Incomplete', count: 6924 },
  { key: 'GOOD_BUT_NO_RESPONSE', label: 'Good But No Response', count: 7 },
  { key: 'NO_RESPONSE', label: 'No Response', count: 4 },
  { key: 'ADVANCE_PAYMENT', label: 'Advance Payment', count: 66 },
  { key: 'ON_HOLD', label: 'On Hold', count: 141 },
  { key: 'APPROVED', label: 'Approved', count: 16564 },
  { key: 'CANCEL', label: 'Cancel', count: 8104 },
  { key: 'ALL', label: 'All', count: 31811 },
];

export interface WebOrderItem {
  code: string;
  name: string;
  price: number;
  qty: number;
  stock?: number;
  /** list e dekhanor text (na thakle name) */
  label?: string;
  image?: string;
  tint?: string;
}
export interface SuccessInfo {
  pct: number;
  ok: number;
  total: number;
  rating: number;
}
export interface OrderAttribution {
  channel: string;
  campaign: string;
  adSet: string;
  ad: string;
  clickId: string;
  browserPixel: string;
  device: string;
  referrer: string;
  entryUrl: string;
}
/** details page er extra info (screenshot er moto). Na thakle default dekhabe. */
export interface OrderDetail {
  no: string;
  /** "Oct 13, 2026, 12:47 AM" - na dile created theke banabe */
  dateLabel?: string;
  createdAgo: string;
  updatedAgo: string;
  /** header er green/red pill: WEB | INCOMPLETE_ORDER */
  badge: string;
  /** order summary te Source */
  source: string;
  /** Extra Options er select value */
  channel: string;
  ip?: { place: string; region: string; addr: string };
  device?: string;
  autofill?: boolean;
  meta?: [string, string][];
  record: CustomerRecordData;
  attribution?: OrderAttribution;
}
export interface WebOrder {
  id: string;
  status: Exclude<WebStatus, 'ALL'>;
  created: string;
  idLabel: string;
  mobile: string;
  name: string;
  address?: string;
  noteUpdated?: string;
  noteLines: string[];
  items: WebOrderItem[];
  success?: SuccessInfo;
  tags: string[];
  site: string;
  // details page
  city?: string;
  zone?: string;
  shippingNote?: string;
  delivery?: number;
  detail?: OrderDetail;
}

const it = (
  code: string,
  name: string,
  price: number,
  extra: Partial<WebOrderItem> = {},
): WebOrderItem => ({ code, name, price, qty: 1, stock: 0, ...extra });

const diamond = it('27967', 'round diamond set', 1150, { stock: -34, label: '27967', image: IMG_DIAMOND });
const loket = it('46324', 'korean loket 780', 780, { tint: '#d8b04a' });
const combo898 = it('55462', '898 taka combo nacklace', 898, { label: '55462', image: IMG_898 });
const n51844 = it('51844', 'Gold bridal set', 760, { label: '51844', tint: '#b9772f' });
const n28677 = it('28677', 'Pearl choker', 790, { label: '28677', tint: '#d9a99a' });
const n28451 = it('28451', 'rotatable Necklace', 785, { label: '28451', tint: '#d9b8a0', stock: -1236 });

const URL = 'https://elishinebd.com';
const base = {
  noteLines: [] as string[],
  tags: [] as string[],
  site: 'Main',
};

const sx = (pct: number, ok: number, total: number, rating: number): SuccessInfo => ({
  pct,
  ok,
  total,
  rating,
});

const cs = (rate: number | null, total: number, success: number, cancelled: number): CourierStat => ({
  rate,
  total,
  success,
  cancelled,
});
const rec = (
  web: CustomerRecordData['web'],
  stats: Partial<Record<(typeof couriers)[number]['id'], CourierStat>>,
): CustomerRecordData => ({
  isNew: true,
  ordersLabel: 'No orders yet',
  web,
  couriers: Object.fromEntries(
    couriers.map((c) => [c.id, stats[c.id] ?? cs(null, 0, 0, 0)]),
  ),
});

const skn28115 = it('28115', 'SMART KOREAN NECKLESS', 795, { stock: -3, label: '28115', tint: '#e3c4aa' });
const purple28677 = it('28677', 'purple colar neckless 790', 790, { stock: -4719, label: '28677', tint: '#b98fa6' });
const unsynced28677 = it('ID_28677', 'ID_28677', 790, { label: 'ID_28677' });

const processing: WebOrder[] = [
  {
    ...base,
    id: 'cmv5lu4uix6s806o0q7rws469',
    status: 'PROCESSING',
    created: '13 Oct, 12:47 am',
    idLabel: 'ID: 55626',
    mobile: '01914221528',
    name: 'KhodezaBegum',
    address: '32,Lake circus Kolabagan ,Ena kingdom ,Delphi A3, 4',
    items: [combo898],
    success: sx(93, 78, 84, 70),
    city: 'Dhaka',
    zone: 'Kalabagan',
    detail: {
      no: '#55626',
      dateLabel: 'Oct 13, 2026, 12:47 AM',
      createdAgo: 'about 9 hours ago',
      updatedAgo: 'about 9 hours ago',
      badge: 'WEB',
      source: 'Facebook',
      channel: 'Website',
      ip: { place: 'Dhaka (Tejgaon)', region: 'Dhaka', addr: '103.81.199.129' },
      device: '9a3c072dd2aa000cbc756cea663d6e24…',
      autofill: true,
      meta: [
        [
          'Tfw client user agent:',
          'Mozilla/5.0 (Linux; Android 16; V2530 Build/BP2A.250605.031.A3_NN_V000L1) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/155.0.8059.34 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/582.0.0.50.54;IABMV/1;]',
        ],
        ['Tfw client ip address:', '103.81.199.129'],
      ],
      record: rec([{ label: 'Processing', count: 1 }], {
        overall: cs(93, 84, 78, 6),
        pathao: cs(94, 31, 29, 2),
        steadfast: cs(95, 51, 48, 3),
        redx: cs(50, 2, 1, 1),
      }),
      attribution: {
        channel: 'Facebook (paid)',
        campaign: '12025081389320…',
        adSet: '12025081389318…',
        ad: '12025081392233…',
        clickId: 'IwZXh0bgNhZW08MABwZG9mAWFkaaWQ…',
        browserPixel: 'fb.1.1791830562292.5947990613',
        device: 'Mobile',
        referrer: 'http://m.facebook.com/',
        entryUrl:
          'https://elishinebd.com/stop/diamond-look-jewellery-4-pis/?fbclid=IwZXh0bgNhZW08MABwZG9mAWFkaaWQ0a65CeXNydGMGYXBwX2lkMDM1MDM4NTUzMTcyOAABHkZ4ZDeLuWVgyvOQ8Ruxi4dtbgQ8gcpO',
      },
    },
  },
  {
    ...base,
    id: 'cmv4qrqgyi52e07pctg2gsbps',
    status: 'PROCESSING',
    created: '12 Oct, 10:18 am',
    idLabel: 'ID: 0',
    mobile: '01793805795',
    name: 'quicktech test',
    address: 'modern mor rangpur',
    noteLines: ['Smita E on 12-10-2026 10:18 AM'],
    items: [diamond],
    tags: ['MANUAL'],
    city: 'Rangpur',
    zone: 'Rangpur Sadar(Kotowali Thana)',
    shippingNote: 'dhaka',
    delivery: 120,
  },
];

const incomplete: WebOrder[] = [
  {
    ...base,
    id: 'cmic31c2466klre0kcvxlrbze',
    status: 'INCOMPLETE',
    created: '24 Nov, 12:59 am',
    idLabel: 'ID: 1',
    mobile: '01317751987',
    name: 'বিপ্লব',
    address: 'মানিক নগর',
    noteUpdated: 'Updated 11 months ago',
    noteLines: [URL],
    items: [unsynced28677],
    success: sx(67, 4, 6, 0),
    detail: {
      no: '#1',
      dateLabel: 'Nov 24, 2025, 12:59 AM',
      createdAgo: '11 months ago',
      updatedAgo: '11 months ago',
      badge: 'INCOMPLETE_ORDER',
      source: 'INCOMPLETE_ORDER',
      channel: 'Incomplete Order',
      ip: { place: 'Tongi', region: 'Dhaka', addr: '2404:1c40:70:c8a1:1:0:ac55:7a38' },
      record: rec(
        [
          { label: 'Incomplete', count: 1 },
          { label: 'Cancel', count: 2, tone: 'red' },
        ],
        {
          overall: cs(67, 6, 4, 2),
          pathao: cs(67, 3, 2, 1),
          steadfast: cs(67, 3, 2, 1),
        },
      ),
    },
  },
  { ...base, id: 'wo-inc-1', status: 'INCOMPLETE', created: '10 Oct, 09:11 pm', idLabel: 'ID: 1', mobile: '01405992752', name: 'Ekramul', noteUpdated: 'Updated 1 day ago', noteLines: [URL], items: [{ ...loket, code: 'ID_46324', name: 'ID_46324', price: 780, tint: undefined }] },
  { ...base, id: 'wo-inc-2', status: 'INCOMPLETE', created: '10 Oct, 08:58 pm', idLabel: 'ID: 1', mobile: '01892091231', name: 'Elias Mridha', noteLines: [URL], items: [loket] },
  { ...base, id: 'wo-inc-3', status: 'INCOMPLETE', created: '10 Oct, 07:15 pm', idLabel: 'ID: 1', mobile: '01624430315', name: 'Sahlon', address: 'Takkar maar', noteUpdated: 'Updated 1 day ago', noteLines: ['Duplicate by ip 116.204.140.16', URL], items: [combo898] },
  { ...base, id: 'wo-inc-4', status: 'INCOMPLETE', created: '10 Oct, 07:09 pm', idLabel: 'ID: 1', mobile: '01882034552', name: 'Jamal uddin', address: 'মরিচা', noteUpdated: 'Updated 1 day ago', noteLines: [URL], items: [n51844] },
  { ...base, id: 'wo-inc-5', status: 'INCOMPLETE', created: '10 Oct, 05:15 pm', idLabel: 'ID: 1', mobile: '01725397048', name: 'Demo', address: 'Demo', noteUpdated: 'Updated 2 days ago', noteLines: ['Duplicate by mobile number 01725397048', URL], items: [it('51901', 'Original Daimond set', 970, { tint: '#1d2a44' }), it('50221', 'duvai gold plated set', 1099, { tint: '#c89b5a' })], success: sx(21, 28, 135, 0) },
  { ...base, id: 'wo-inc-6', status: 'INCOMPLETE', created: '10 Oct, 05:09 pm', idLabel: 'ID: 1', mobile: '01718385192', name: 'নবী', noteUpdated: 'Updated 2 days ago', noteLines: [URL], items: [loket], success: sx(29, 2, 7, 44) },
  { ...base, id: 'wo-inc-7', status: 'INCOMPLETE', created: '10 Oct, 04:24 pm', idLabel: 'ID: 1', mobile: '01994653358', name: 'সুমন', address: 'দুর্গাপুর', noteUpdated: 'Updated 2 days ago', noteLines: [URL], items: [n51844] },
];

const advance: WebOrder[] = [
  {
    ...base,
    id: 'cmiuh2hqg96t8pk0kotfvfggd',
    status: 'ADVANCE_PAYMENT',
    created: '06 Dec, 09:52 pm',
    idLabel: 'ID: 35376',
    mobile: '01606204225',
    name: 'নাম জান্নাতুল মাওয়া',
    address: 'কক্সবাজার চকরিয়া মালুমঘাট',
    noteUpdated: 'Updated 10 months ago',
    items: [skn28115],
    success: sx(34, 3, 6, 40),
    city: "Cox's Bazar",
    zone: 'Chakaria',
    detail: {
      no: '#35376',
      dateLabel: 'Dec 6, 2025, 9:52 PM',
      createdAgo: '10 months ago',
      updatedAgo: '10 months ago',
      badge: 'WEB',
      source: 'Facebook',
      channel: 'Website',
      ip: { place: 'Kāliganj', region: 'Khulna', addr: '103.242.20.161' },
      record: rec(
        [
          { label: 'Incomplete', count: 1 },
          { label: 'Advance Payment', count: 1 },
        ],
        { overall: cs(34, 6, 3, 2), pathao: cs(50, 2, 1, 1), steadfast: cs(0, 1, 0, 1) },
      ),
    },
  },
  { ...base, id: 'wo-adv-1', status: 'ADVANCE_PAYMENT', created: '12 May, 03:46 pm', idLabel: 'ID: 48368', mobile: '01618514970', name: 'Osman', address: 'Tangail Madhupur jalchotro', noteUpdated: 'Updated 5 months ago', noteLines: ['-'], items: [loket], success: sx(50, 5, 10, 50) },
  { ...base, id: 'wo-adv-2', status: 'ADVANCE_PAYMENT', created: '07 May, 11:01 am', idLabel: 'ID: 47812', mobile: '01878263029', name: 'Rubel', address: 'নোয়াখালী মাইজদী পৌর বাজার', noteUpdated: 'Updated 5 months ago', noteLines: ['-'], items: [it('77700', '777sdku', 777, { tint: '#7da7d9' })], success: sx(89, 8, 9, 64) },
  { ...base, id: 'wo-adv-3', status: 'ADVANCE_PAYMENT', created: '28 Apr, 02:21 pm', idLabel: 'ID: 47042', mobile: '01328451118', name: 'Mohammed sumon', address: 'Homna thanar samne', noteUpdated: 'Updated 6 months ago', noteLines: ['-'], items: [n28677], success: sx(100, 2, 2, 54) },
  { ...base, id: 'wo-adv-4', status: 'ADVANCE_PAYMENT', created: '23 Apr, 05:24 pm', idLabel: 'ID: 46265', mobile: '01949932624', name: 'Hridoy', address: 'চাঁদিনি হাউজিং নারায়ণগঞ্জ ফতুল্লা', noteUpdated: 'Updated 6 months ago', noteLines: ['-'], items: [n28677], success: sx(67, 2, 3, 52) },
  { ...base, id: 'wo-adv-5', status: 'ADVANCE_PAYMENT', created: '22 Apr, 10:47 am', idLabel: 'ID: 46120', mobile: '01715660494', name: 'শাকিল আহমেদ খাঁন', address: 'পূর্ব গুপ্তপাড়া,জামে মসজিদের …', noteUpdated: 'Updated 6 months ago', noteLines: ['-'], items: [n28451] },
  { ...base, id: 'wo-adv-6', status: 'ADVANCE_PAYMENT', created: '05 Apr, 03:46 am', idLabel: 'ID: 45674', mobile: '01753056014', name: 'Nirob', address: 'নওগাঁ জেলা পত্নীতলা থানা নজি…', noteUpdated: 'Updated 6 months ago', noteLines: ['-'], items: [n28677] },
  { ...base, id: 'wo-adv-7', status: 'ADVANCE_PAYMENT', created: '12 Mar, 01:53 pm', idLabel: 'ID: 45251', mobile: '01921060430', name: 'মোঃখোরশেদ আলম', address: 'ঢাকা, সাভার', noteUpdated: 'Updated 7 months ago', noteLines: ['-'], items: [n28677], success: sx(60, 25, 42, 66) },
];

const others = (
  status: WebOrder['status'],
  tag: string,
  rows: [string, string, string, string, WebOrderItem, SuccessInfo?][],
): WebOrder[] =>
  rows.map(([created, mobile, name, address, item, success], i) => ({
    ...base,
    id: `wo-${tag}-${i + 1}`,
    status,
    created,
    idLabel: `ID: ${50000 - i * 37}`,
    mobile,
    name,
    address,
    noteUpdated: 'Updated 3 days ago',
    noteLines: [URL],
    items: [item],
    success,
  }));

const noResponse = others('NO_RESPONSE', 'nr', [
  ['11 Oct, 06:40 pm', '01711223344', 'Rakib Hasan', 'Mirpur 10, Dhaka', diamond],
  ['11 Oct, 02:12 pm', '01822334455', 'Sumaiya', 'Khulshi, Chattogram', combo898, sx(40, 4, 10, 30)],
  ['10 Oct, 11:05 am', '01933445566', 'Nahid', 'Zindabazar, Sylhet', n28451],
]);
const gbnr = others('GOOD_BUT_NO_RESPONSE', 'gb', [
  ['11 Oct, 04:30 pm', '01744556677', 'Farzana', 'Uttara Sector 7', n28677, sx(75, 3, 4, 48)],
  ['10 Oct, 09:50 pm', '01655667788', 'Imran', 'Rajshahi Sadar', loket],
  ['09 Oct, 01:20 pm', '01566778899', 'Tania', 'Dhanmondi 27', diamond],
]);
const onHoldFirst: WebOrder = {
  ...base,
  id: 'cminhjrra7igbqa0kxhsmy6cw',
  status: 'ON_HOLD',
  created: '02 Dec, 12:31 am',
  idLabel: 'ID: 34469',
  mobile: '01732658447',
  name: 'Feroz',
  address: 'মিরপুর ১১',
  noteUpdated: 'Updated 10 months ago',
  items: [purple28677],
  success: sx(100, 1, 1, 60),
  city: 'Dhaka',
  zone: 'Mirpur 11',
  detail: {
    no: '#34469',
    dateLabel: 'Dec 2, 2025, 12:31 AM',
    createdAgo: '11 months ago',
    updatedAgo: '10 months ago',
    badge: 'WEB',
    source: 'Facebook',
    channel: 'Website',
    ip: { place: 'Kafrul', region: 'Dhaka', addr: '45.114.89.166' },
    record: rec([{ label: 'On Hold', count: 1 }], { overall: cs(100, 1, 1, 0), pathao: cs(100, 1, 1, 0) }),
  },
};
const onHoldMore = others('ON_HOLD', 'oh', [
  ['08 Oct, 10:10 am', '01311223344', 'Masud', 'Bogura Sadar', combo898],
  ['07 Oct, 05:45 pm', '01422334455', 'Lipi', 'Comilla Kotwali', n51844, sx(66, 2, 3, 40)],
  ['06 Oct, 03:15 pm', '01533445566', 'Shuvo', 'Khulna Sonadanga', n28451],
  ['05 Oct, 12:00 pm', '01644556677', 'Rima', 'Barishal Sadar', loket],
]);
const approved = others('APPROVED', 'ap', [
  ['11 Oct, 08:20 pm', '01712121212', 'Sabbir', 'Gulshan 2, Dhaka', diamond, sx(92, 11, 12, 70)],
  ['11 Oct, 07:02 pm', '01813131313', 'Mitu', 'Agrabad, Chattogram', combo898, sx(100, 3, 3, 62)],
  ['11 Oct, 05:44 pm', '01914141414', 'Arif', 'Mymensingh Sadar', n28677],
  ['11 Oct, 01:16 pm', '01515151515', 'Jui', 'Narayanganj', n51844, sx(83, 5, 6, 58)],
  ['10 Oct, 10:30 pm', '01616161616', 'Kamal', 'Gazipur Chowrasta', loket],
]);
const cancel = others('CANCEL', 'ca', [
  ['10 Oct, 02:40 pm', '01317171717', 'Rony', 'Feni Sadar', n28451, sx(18, 2, 11, 0)],
  ['09 Oct, 06:25 pm', '01418181818', 'Anika', 'Tangail Sadar', loket],
  ['09 Oct, 11:12 am', '01519191919', 'Parvez', 'Jessore Kotwali', diamond, sx(30, 3, 10, 22)],
  ['08 Oct, 04:05 pm', '01620202020', 'Mim', 'Cox\'s Bazar', combo898],
]);

export const allWebOrders: WebOrder[] = [
  ...processing,
  ...incomplete,
  ...gbnr,
  ...noResponse,
  ...advance,
  onHoldFirst,
  ...onHoldMore,
  ...approved,
  ...cancel,
];

export const ordersFor = (key: WebStatus): WebOrder[] =>
  key === 'ALL' ? allWebOrders : allWebOrders.filter((o) => o.status === key);

export const getWebOrder = (id: string) => allWebOrders.find((o) => o.id === id);

export const isStatusKey = (v: string | null | undefined): v is WebStatus =>
  !!v && statusTabs.some((t) => t.key === v);
