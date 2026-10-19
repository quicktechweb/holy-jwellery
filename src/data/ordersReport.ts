/** Orders Dashboard (Orders Report) er demo data. Real backend e API theke ashbe. */

export interface ReportOrder {
  id: string;
  invoice: string;
  name: string;
  mobile: string;
  district: string;
  product: { name: string; sku: string; qty: number };
  /** KPI card key: Delivered | PendingReturn | Pending | RTS | Shipped | Partial | Returned */
  status: string;
  /** unpaid = "PAYMENT NOT RECEIVED", none = payment status nai (return) */
  payment: 'paid' | 'unpaid' | 'none';
  statusTags: string[];
  orderTags: string[];
  amount: number;
  createdTs: number;
  approvedTs: number;
  courierTs: number;
  method: string;
  source: string;
  tracking: string;
  takenBy: string;
}

export const REPORT_USERS = ['Md. Eamin', 'mahima N', 'Smita E', 'Shakib N'];
export const REPORT_SOURCES = [
  'Facebook',
  'Website',
  'Direct',
  'Unknown',
  'Instagram',
  'TikTok',
  'WhatsApp',
  'Exchange',
  'MESSENGER',
  'Phone Call',
];
export const REPORT_COURIERS = ['Pathao', 'Steadfast'];
export const STATUS_TAGS_ALERT = [
  'Customer Fraud',
  'Amount Mismatch (Dashboard)',
  'Amount Mismatch (Courier)',
  'Delivery Charge Mismatch',
];
export const STATUS_TAGS_PLAIN = [
  'Return (Paid)',
  'Return (Cancel By Customer)',
  'Merchant Cancel',
  'COD Mismatch',
  'Partial Delivery',
  'Exchange',
];
export const ORDER_TAGS = [
  'Qty Change',
  'Non-COD',
  'Repeat',
  'Rider Assigned',
  'Manual',
  'Followup',
  'Custom 1',
  'Custom 2',
  'Custom 3',
  'Custom 4',
  'Custom 5',
];
export const DISTRICTS = [
  'Missing district', 'B. Baria', 'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria',
  'Chandpur', 'Chapainawabganj', 'Chattogram', 'Chuadanga', "Cox's Bazar", 'Cumilla', 'Dhaka', 'Dinajpur', 'Faridpur',
  'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore', 'Jhalakathi', 'Jhenaidah', 'Joypurhat',
  'Khagrachhari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura',
  'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi',
  'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi',
  'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon',
];

/** Dhaka local time (hour 24h, minute) -> UTC ms, 1 Sep 2026 */
const at = (h: number, m: number) => Date.UTC(2026, 8, 1, h - 6, m);
const PRODUCT = { name: 'korean loket 780 taka', sku: 'korean loket 780 taka', qty: 1 };
const RET = 'Return (Cancel By Customer)';

type Seed = [name: string, mobile: string, district: string, h: number, m: number, kind: 'u' | 'p' | 'r', tag?: string, source?: string];

const SEEDS: Seed[] = [
  ['Sorif', '01782556253', 'Dhaka', 19, 36, 'u'],
  ['আরিফ হোসেন', '01713542141', 'Gazipur', 19, 33, 'u'],
  ['Liza', '01689811103', 'Dhaka', 19, 31, 'u'],
  ['Jakaria', '01711965251', 'Narayanganj', 19, 29, 'u'],
  ['Abdus sattar', '01811149561', 'Cumilla', 19, 27, 'u'],
  ['SM Mukter Hossain', '01633366869', 'Chattogram', 14, 31, 'u'],
  ['Chonel Tripura', '01868266479', 'Khagrachhari', 14, 26, 'r', RET],
  ['Rahim Uddin', '01912340981', 'Dhaka', 14, 20, 'u'],
  ['Nusrat Jahan', '01534982210', 'Sylhet', 14, 14, 'r', RET, 'Facebook'],
  ['Mizanur Rahman', '01777120344', 'Rajshahi', 13, 58, 'u'],
  ['Tania Akter', '01844567012', 'Dhaka', 13, 42, 'u', undefined, 'Facebook'],
  ['Sumon Mia', '01621908874', 'Mymensingh', 13, 30, 'r', 'Return (Paid)'],
  ['Farhana Yesmin', '01955673120', 'Khulna', 12, 55, 'u'],
  ['Kamal Hossain', '01316782245', 'Bogura', 12, 40, 'u'],
  ['Shirin Sultana', '01740083391', 'Dhaka', 12, 22, 'p'],
  ['Habibur Rahman', '01898231756', 'Gazipur', 11, 58, 'p'],
  ['Rina Begum', '01611274409', 'Barishal', 11, 40, 'u'],
];

const TRACK = [
  291090057, 291090052, 291090044, 291090035, 291090025, 291090018, 291090010, 291090003, 291089995, 291089988,
  291089979, 291089970, 291089963, 291089955, 291089946, 291089938, 291089930,
];

export const reportOrders: ReportOrder[] = SEEDS.map(([name, mobile, district, h, m, kind, tag, source], i) => ({
  id: `EH-${15367 - i}`,
  invoice: `EH-${15367 - i}`,
  name,
  mobile,
  district,
  product: PRODUCT,
  status: kind === 'r' ? 'PendingReturn' : 'Delivered',
  payment: kind === 'u' ? 'unpaid' : kind === 'p' ? 'paid' : 'none',
  statusTags: tag ? [tag] : [],
  orderTags: [],
  amount: 780,
  createdTs: at(h - 1, m),
  approvedTs: at(h, m),
  courierTs: at(20, 35),
  method: 'Steadfast',
  source: source ?? 'Website',
  tracking: String(TRACK[i]),
  takenBy: REPORT_USERS[i % REPORT_USERS.length],
}));
