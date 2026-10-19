export interface Product {
  id: string;
  code: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  /** image url na thakle "No Image" placeholder dekhabe */
  image?: string;
  /** image na thakle placeholder tint (demo) */
  tint?: string;
}

export const IMG_DIAMOND =
  'https://elishinebd.com/wp-content/uploads/2025/09/fghf-300x300-1.webp';
export const IMG_898 =
  'https://elishinebd.com/wp-content/uploads/2026/10/898-taka-new-poster-768x768-1.jpeg';

// image: product er photo URL. image na thakle tint/No Image placeholder dekhabe.
export const products: Product[] = [
  { id: 'p1', code: '2026', sku: '2026', name: 'Korian top Earring', price: 895, stock: 60 },
  { id: 'p2', code: '28451', sku: '28451', name: 'rotatable Necklace', price: 785, stock: -1236, tint: '#d9b8a0' },
  { id: 'p3', code: '28670', sku: '28670', name: 'purple neckless', price: 799, stock: -558, tint: '#9b86b8' },
  { id: 'p4', code: '28722', sku: '28722', name: 'purple pearl neckless', price: 840, stock: -669, tint: '#d9c3d6' },
  { id: 'p5', code: '27967', sku: '27967', name: 'round diamond set', price: 1150, stock: -34, image: IMG_DIAMOND },
  { id: 'p6', code: '28745', sku: '28745', name: '6 BUDS NECKLESS', price: 780, stock: -10, tint: '#7a5a3a' },
  { id: 'p7', code: '2874577', sku: '2874577', name: 'pearl set full combo', price: 849, stock: 0, tint: '#2f6f5a' },
  { id: 'p8', code: '2874599', sku: '2874599', name: 'ITALIAN EARRING 785 TAKA', price: 785, stock: 0, tint: '#b9772f' },
  { id: 'p9', code: '53995', sku: '53995', name: 'HEART SHAPE DIAMOND CART SET', price: 998, stock: 0, image: IMG_DIAMOND },
  { id: 'p10', code: '55462', sku: '55462', name: '898 taka combo nacklace', price: 898, stock: 0, image: IMG_898 },
  { id: 'p11', code: '56784', sku: '56784', name: 'Black cup set', price: 1190, stock: 97 },
  { id: 'p12', code: '768989', sku: '768989', name: 'Winter cup combo', price: 990, stock: 0 },
  { id: 'p13', code: '3040', sku: '3040', name: 'leaf 750', price: 750, stock: -20 },
  { id: 'p14', code: '3045', sku: '3045', name: 'Bracelet for female', price: 850, stock: 70 },
  { id: 'p15', code: '33334', sku: '33334', name: 'Butterfly nacklace', price: 777, stock: 233 },
];

export const cities: Record<string, Record<string, string[]>> = {
  Rangpur: {
    'Rangpur Sadar(Kotowali Thana)': ['Modern Mor', 'Station Road', 'Jahaj Company Mor'],
    'Badarganj Thana': ['Badarganj Bazar'],
  },
  Dhaka: {
    Dhanmondi: ['Dhanmondi 27', 'Kalabagan', 'Science Lab'],
    Kalabagan: ['Lake Circus', 'Kalabagan 1st Lane'],
    Mirpur: ['Mirpur 1', 'Mirpur 10', 'Pallabi'],
    'Mirpur 11': ['Mirpur 11 Block A', 'Mirpur 11 Block B'],
    Uttara: ['Sector 4', 'Sector 7', 'Sector 11'],
  },
  Chattogram: {
    Kotwali: ['Anderkilla', 'Chawkbazar'],
    Panchlaish: ['GEC Circle', 'Khulshi'],
  },
  "Cox's Bazar": {
    Chakaria: ['Chakaria Bazar', 'Fashiakhali'],
    "Cox's Bazar Sadar": ['Kolatoli', 'Laldighi'],
  },
  Sylhet: {
    'Sylhet Sadar': ['Zindabazar', 'Ambarkhana'],
  },
};

export const deliveryMethods = ['PATAW', 'Steadfast', 'RedX', 'Pathao', 'Sundarban', 'Paperfly'];
export const orderSources = ['Unknown', 'Facebook', 'Instagram', 'WhatsApp', 'Website', 'Incomplete Order', 'Phone Call'];

// ───────── Customer record (mobile number dile) ─────────
export interface CourierStat {
  rate: number | null; // success rate %, null = no data
  total: number;
  success: number;
  cancelled: number;
}
export interface CustomerRecordData {
  isNew: boolean;
  ordersLabel: string;
  web: { label: string; count: number; tone?: 'blue' | 'red' }[];
  info?: { name: string; email: string; address: string };
  couriers: Record<string, CourierStat>;
}

export const couriers = [
  { id: 'overall', name: 'Overall' },
  { id: 'pathao', name: 'Pathao' },
  { id: 'steadfast', name: 'Steadfast' },
  { id: 'redx', name: 'RedX' },
  { id: 'carrybee', name: 'CarryBee' },
] as const;

const emptyStat: CourierStat = { rate: null, total: 0, success: 0, cancelled: 0 };

/** Demo lookup. Real backend ready hole ei function e API call boshaben. */
export function lookupCustomer(mobile: string): CustomerRecordData {
  const known = mobile === '01793805795';
  return {
    isNew: true,
    ordersLabel: 'No orders yet',
    web: [{ label: 'Processing', count: 1 }],
    info: known
      ? { name: 'Tonmoy Sarkar', email: 'tonmoy202512q@gmail.com', address: 'dhaka' }
      : undefined,
    couriers: Object.fromEntries(couriers.map((c) => [c.id, { ...emptyStat }])),
  };
}
