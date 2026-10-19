export type FilterKey = 'IN_TRANSIT' | 'ASSIGNED_FOR_DELIVERY' | 'CANCELLED' | 'PENDING_ENTRY' | 'RETURN_PENDING' | 'RETURNED' | 'DAMAGE_LOST';

export const parcelFilters: { key: FilterKey; label: string; total: number }[] = [
  { key: 'IN_TRANSIT', label: 'In Transit', total: 103 },
  { key: 'ASSIGNED_FOR_DELIVERY', label: 'Assigned for Delivery', total: 17 },
  { key: 'CANCELLED', label: 'Cancelled', total: 143 },
  { key: 'PENDING_ENTRY', label: 'Pending Entry', total: 7 },
  { key: 'RETURN_PENDING', label: 'Return Pending', total: 4030 },
  { key: 'RETURNED', label: 'Returned', total: 1 },
  { key: 'DAMAGE_LOST', label: 'Damage & Lost', total: 3 },
];

export interface Parcel {
  id: string;
  invoice: string;
  name: string;
  mobile: string;
  address: string;
  avatar: string;
  amount: number;
  delCharge: number;
  courier: string;
  cStatus: string;
  tracking: string;
  tracking2?: string;
  age: number;
  attempt?: number;
  rider?: { name: string; mobile: string };
  tags: string[];
  inCharge: string;
  ourStatus?: string;
  filter: FilterKey;
}

export const employeesList = ['Smita E', 'mahima N', 'Rafi K', 'Nusrat J'];
export const couriers = ['Steadfast', 'PATAW'];
export const defaultTags = [
  'Delivery Charge Discrepancy',
  'Returned With Charge',
  'Returned Without Charge',
  'Charge Discrepancy',
  'Packaging Problem',
  'Size Problem',
  'Wrong Product',
  'Customer Unreachable',
];

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const avatars = [
  'linear-gradient(135deg,#1e293b,#64748b)',
  'linear-gradient(135deg,#d6b9a4,#f2e3d5)',
  'linear-gradient(135deg,#8a5a44,#e0b9a3)',
  'linear-gradient(135deg,#c0a896,#efe2d8)',
  'linear-gradient(135deg,#3f3f46,#a1a1aa)',
  'linear-gradient(135deg,#d97757,#f4c7b6)',
];
const names = ['Rahim Uddin', 'Karim Mia', 'সুমি আক্তার', 'Nasrin Sultana', 'Hasan Mahmud', 'মোঃ রফিক', 'Tania Akter', 'Sabbir Ahmed', 'রুমানা ইয়াসমিন', 'Jahid Hasan', 'Mim Chowdhury', 'Imran Khan', 'ফারজানা আক্তার', 'Shipon Das', 'Lutfa Begum'];
const addrs = ['Dhaka, Mirpur 10', 'চট্টগ্রাম, পাহাড়তলী', 'Rajshahi, Boalia', 'সিলেট সদর, জিন্দাবাজার', 'Khulna, Sonadanga', 'কুমিল্লা, কান্দিরপাড়', 'Gazipur, Tongi', 'Narayanganj, Chashara', 'Bogura, Sherpur', 'Rangpur, Dhap'];

interface Spec {
  courier: string;
  statuses: string[];
  age: [number, number];
  attempt?: [number, number];
  prefix: string;
  tags?: string[];
  amounts: number[];
}
const specs: Record<FilterKey, Spec> = {
  IN_TRANSIT: { courier: 'Steadfast', statuses: ['unknown', 'in review'], age: [250, 345], prefix: 'SFR2511', amounts: [750, 790, 998, 3160] },
  ASSIGNED_FOR_DELIVERY: { courier: 'PATAW', statuses: ['Return Requested', 'Assigned For Delivery'], age: [5, 5], attempt: [2, 3], prefix: 'DH101026', amounts: [760, 777, 798] },
  CANCELLED: { courier: 'PATAW', statuses: [''], age: [0, 0], prefix: 'DH101426', amounts: [780, 898, 699, 798] },
  PENDING_ENTRY: { courier: 'Steadfast', statuses: ['pending'], age: [1, 3], prefix: 'SFR2610', amounts: [760, 800, 898] },
  RETURN_PENDING: { courier: 'PATAW', statuses: ['paid return', 'Return'], age: [4, 5], attempt: [1, 4], prefix: 'DH101026', tags: ['Delivery Charge Discrepancy', 'Returned With Charge', 'Returned Without Charge'], amounts: [680, 760, 777, 780] },
  RETURNED: { courier: 'Steadfast', statuses: ['pending'], age: [304, 304], prefix: 'SFR2512', amounts: [800] },
  DAMAGE_LOST: { courier: 'PATAW', statuses: ['lost'], age: [20, 40], prefix: 'DH091026', tags: ['Wrong Product'], amounts: [780, 898] },
};

type Head = Partial<Parcel> & { name: string; invoice: string };
const heads: Partial<Record<FilterKey, Head[]>> = {
  IN_TRANSIT: [
    { invoice: 'EH-1', name: 'tarif', mobile: '01889022225', address: 'khilgaon, dhak 1207', amount: 998, cStatus: 'unknown', tracking: 'SFR251104STB6F7CE1BD', tracking2: '186957718', age: 345 },
    { invoice: 'EH-190', name: 'Kajol Islam', mobile: '01712390695', address: 'Hamdah Shantinagar para besides of morg house Jhenaidah sadar Jhenaidah', amount: 750, cStatus: 'in review', tracking: 'SFR251107STBAAEDB9BD', tracking2: '187793389', age: 342 },
    { invoice: 'EH-636', name: 'সামিয়া আহমেদ', mobile: '01925671001', address: 'সলিমগঞ্জ -নবীনগর -ব্রাহ্মণবাড়িয়া', amount: 790, cStatus: 'in review', tracking: 'SFR251113STA3C34C1BD', tracking2: '189611168', age: 336 },
    { invoice: 'EH-990', name: 'শাহজাহান', mobile: '01872367119', address: 'বান্দরবান জেলা আলীকদম পানবাজার', amount: 790, cStatus: 'unknown', tracking: 'SFR251117STC9545E0BD', tracking2: '190761773', age: 332 },
    { invoice: 'EH-1817', name: 'হামিমা', mobile: '01956746863', address: 'কুতুপালং বাজার, উখিয়া কক্সবাজার', amount: 3160, cStatus: 'in review', tracking: 'SFR251126ST678FB05BD', tracking2: '193358865', age: 323 },
    { invoice: 'EH-2839', name: 'জান্নাতুল ফেরদৌসী', mobile: '01965911310', address: 'চামড়া নারায়ণগঞ্জ নগরগঞ্জের পকুর পাড় আমী হোসেন', amount: 790, cStatus: 'in review', tracking: 'SFR251205ST15BCF6ABD', age: 314 },
  ],
  ASSIGNED_FOR_DELIVERY: [
    { invoice: 'EH-16684', name: 'MUKTAR', mobile: '01831382055', address: 'পাবনা ঈশ্বরদী বাঁশের বাধা', amount: 777, cStatus: 'Return Requested', tracking: 'DH101026MWYPCY', attempt: 3 },
    { invoice: 'EH-16690', name: 'কলিম', mobile: '01343840258', address: 'মাস্টার মার্কেট, শাহগদি মার্কেট,পটিয়া, চট্টগ্রাম', amount: 777, cStatus: 'Assigned For Delivery', tracking: 'DH101026RZQ29D', attempt: 3 },
    { invoice: 'EH-16691', name: 'জীবন', mobile: '01932003157', address: 'মিরপুর ১২ ঢাকা বাস স্ট্যান্ড', amount: 777, cStatus: 'Return Requested', tracking: 'DH101026PPVXHM', attempt: 3 },
    { invoice: 'EH-16715', name: 'Fahmida', mobile: '01864913538', address: 'Agrabad chitagogng porbo mohiri para jame mosjider samne', amount: 798, cStatus: 'Assigned For Delivery', tracking: 'DH101026F52A72', attempt: 3 },
    { invoice: 'EH-16718', name: 'sharmin bhuiyan', mobile: '01854274813', address: 'narayanganj, bondor, fire service amine 3 number goli', amount: 760, cStatus: 'Return Requested', tracking: 'DH1010267MT39C', attempt: 3 },
    { invoice: 'EH-16687', name: '777 Kamol', mobile: '01406225378', address: 'Basa,.., koimari,.., thana jaldhaka', amount: 770, cStatus: 'Assigned For Delivery', tracking: 'DH101026TJF52H', attempt: 2 },
  ],
  CANCELLED: [
    { invoice: 'EH-16739', name: 'MdAman', mobile: '01787585336', address: 'dhaka,tongi.pochim thana.kholil ar mor', amount: 898 },
    { invoice: 'EH-16730', name: 'Raj', mobile: '01876889760', address: 'E. E. 7 .East Feroz Shah ... Akbar Shah , Chattogram', amount: 780 },
    { invoice: 'EH-16721', name: 'উম্মে মাইমুনা সাদিয়া মওউ', mobile: '01995326224', address: 'অভয়নগর বেবি কেয়ার হসপিটালের পিছনে নোয়া পাড়া যশোর', amount: 780 },
    { invoice: 'EH-16701', name: 'মোসাঃ বর্ষা আক্তার', mobile: '01739171371', address: 'নওগাঁ, বদোলগাছি, কালিবাড়ি', amount: 780 },
    { invoice: 'EH-16465', name: 'Siddik', mobile: '01713770914', address: 'Baliadangi Thakurgaon', amount: 798 },
    { invoice: 'EH-16408', name: 'Prince Riaj', mobile: '01841784096', address: 'Gholpara Bazar Riaj stor, Jhenaidah( black claer)', amount: 699 },
  ],
  RETURN_PENDING: [
    { invoice: 'EH-16719', name: 'জুয়েল', mobile: '01865278353', address: 'রংপুর থানা মাইগঞ্জ মেকুড়া পাঠানপাড়া', amount: 780, cStatus: 'paid return', tracking: 'DH1110268CZ7SH', attempt: 1, age: 4, tags: ['Delivery Charge Discrepancy'] },
    { invoice: 'EH-16717', name: 'Rakib', mobile: '01330626115', address: 'Katakali thana rajshahi', amount: 760, cStatus: 'paid return', tracking: 'DH101026GR4TDZ', attempt: 1, age: 5, tags: ['Returned With Charge'] },
    { invoice: 'EH-16716', name: 'আলমগীর হোসেন', mobile: '01729755763', address: 'এলেঙ্গা বাসটেন. কালিহাতী , টাঙ্গাইল', amount: 760, cStatus: 'paid return', tracking: 'DH1010263LXVWZ', attempt: 3, age: 5, tags: ['Delivery Charge Discrepancy'] },
    { invoice: 'EH-16710', name: '780 Nazrul', mobile: '01759642404', address: 'Mirpur 10 Senpara,Amtola Bazar, road 2, dhaka', amount: 680, cStatus: 'Return', tracking: 'DH101026962MPR', attempt: 4, age: 5, tags: ['Returned Without Charge'] },
    { invoice: 'EH-16704', name: 'Gopal', mobile: '01712492576', address: 'Nandapara purbo shohobotpur Nagarpur Tangail Dhaka', amount: 777, cStatus: 'paid return', tracking: 'DH101026KJBVWG', attempt: 1, age: 5, tags: ['Returned With Charge'] },
    { invoice: 'EH-16703', name: 'সালাম', mobile: '01916827730', address: 'হাজারি বাগ টার্মিনাল্ফিস ডাকা', amount: 780, cStatus: 'paid return', tracking: 'DH101026FNDZNK', attempt: 1, age: 5, tags: ['Returned With Charge'] },
  ],
  RETURNED: [
    { invoice: 'EH-3925', name: 'Eunus Ali', mobile: '01611340346', address: 'gazipur.sreepur.natunbager', amount: 800, cStatus: 'pending', tracking: 'SFR251215ST5AD721CBD', tracking2: '199295707', age: 304, rider: { name: 'Piyas Miya', mobile: '01786729217' }, avatar: avatars[1] },
  ],
};

function build(): Parcel[] {
  const out: Parcel[] = [];
  parcelFilters.forEach((f, fi) => {
    const sp = specs[f.key];
    const r = rng(fi * 977 + 13);
    const head = heads[f.key] ?? [];
    const cap = f.key === 'RETURN_PENDING' ? f.total : f.total;
    for (let i = 0; i < cap; i++) {
      const h = head[i];
      const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
      const n = 16000 - i - fi * 5 + Math.floor(r() * 3);
      const age = h?.age ?? sp.age[0] + Math.floor(r() * (sp.age[1] - sp.age[0] + 1));
      const attempt = h?.attempt ?? (sp.attempt ? sp.attempt[0] + Math.floor(r() * (sp.attempt[1] - sp.attempt[0] + 1)) : undefined);
      const tag = sp.tags ? pick(sp.tags) : undefined;
      out.push({
        id: `${f.key}-${i}`,
        invoice: h?.invoice ?? `EH-${n}`,
        name: h?.name ?? pick(names),
        mobile: h?.mobile ?? `01${[3, 5, 6, 7, 8, 9][Math.floor(r() * 6)]}${String(Math.floor(r() * 1e8)).padStart(8, '0')}`,
        address: h?.address ?? pick(addrs),
        avatar: h?.avatar ?? pick(avatars),
        amount: h?.amount ?? pick(sp.amounts),
        delCharge: 0,
        courier: sp.courier,
        cStatus: h?.cStatus ?? pick(sp.statuses),
        tracking: h?.tracking ?? `${sp.prefix}${Math.floor(r() * 1e6).toString(36).toUpperCase().padStart(6, 'X')}${pick(['BD', 'CY', 'XM'])}`,
        tracking2: h?.tracking2,
        age,
        attempt,
        rider: h?.rider,
        tags: h?.tags ?? (tag ? [tag] : []),
        inCharge: '-',
        ourStatus: f.key === 'ASSIGNED_FOR_DELIVERY' ? 'RTS' : undefined,
        filter: f.key,
      });
    }
  });
  return out;
}
export const allParcels: Parcel[] = build();

export interface EntryRow { date: string; courier: string; parcels: number }
const counts = [18, 6, 38, 46, 24, 8, 18, 31, 44, 27];
const octDays = [13, 11, 10, 9, 7, 5, 4, 3, 2, 1];
const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const entryRows: EntryRow[] = (() => {
  const rows: EntryRow[] = octDays.map((d, i) => ({ date: `Oct ${String(d).padStart(2, '0')}, 2026`, courier: 'PATAW', parcels: counts[i] }));
  const r = rng(77);
  for (let d = 30; rows.length < 31; d--) {
    if (r() > 0.3) rows.push({ date: `Sep ${String(d).padStart(2, '0')}, 2026`, courier: 'PATAW', parcels: 5 + Math.floor(r() * 45) });
  }
  return rows;
})();
export const monthName = (i: number) => mon[i];

export interface EntryOrder { invoice: string; name: string; mobile: string; address: string; tracking: string; status: string; product: string; sku: string; qty: number; price: number }
export function entryOrders(n: number, seed: number): EntryOrder[] {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const alt = i % 2 === 0;
    const qty = r() > 0.9 ? 2 : 1;
    const price = alt ? 780 : 898;
    return {
      invoice: `EH-${16745 - i}`,
      name: names[Math.floor(r() * names.length)],
      mobile: `01${[3, 5, 7, 8][Math.floor(r() * 4)]}${String(Math.floor(r() * 1e8)).padStart(8, '0')}`,
      address: addrs[Math.floor(r() * addrs.length)],
      tracking: `DH131026${Math.floor(r() * 1e6).toString(36).toUpperCase().padStart(6, 'X')}`,
      status: 'RTS',
      product: alt ? 'korean loket 780 taka' : '898 taka combo nacklace',
      sku: alt ? 'korean loket 780 taka' : '55462',
      qty,
      price,
    };
  });
}

export const returnStats = { total: 120, withCharge: 32, withoutCharge: 50, discrepancy: 7, untagged: 31 };
