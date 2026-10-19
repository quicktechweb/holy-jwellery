import { productSeed } from '@/data/products';

/** TODO: real API theke ashbe - ekhane screenshot er moto seed data */
export const businesses = ['All Businesses', 'Elishine'];

export type RangeKey = 'today' | 'yest' | '7d' | '30d' | 'month' | 'lastMonth' | 'year' | 'lastYear' | 'lifetime';
export const rangeLabels: Record<RangeKey, string> = {
  today: 'Today', yest: 'Yesterday', '7d': 'Last 7 days', '30d': 'Last 30 days', month: 'This month',
  lastMonth: 'Last month', year: 'This year', lastYear: 'Last year', lifetime: 'Lifetime',
};
const factor: Record<RangeKey, number> = { today: 0, yest: 0, '7d': 0, '30d': 1, month: 1, lastMonth: 1.4, year: 6, lastYear: 8, lifetime: 14 };

export interface SalesStat {
  id: string; name: string; sku: string; bg: string; price: number; cost: number; stock: number;
  units: { today: number; yest: number; d7: number; d30: number };
  deliveredPct: number; returnedPct: number; cancelled: number; trend: number;
}
const stat = (n: number, today: number, yest: number, d7: number, d30: number, deliveredPct: number, returnedPct: number, cancelled: number, trend: number, stock: number): SalesStat => {
  const p = productSeed[n];
  return { id: p.id, name: p.name, sku: p.code, bg: p.images[0]?.bg ?? '#eee', price: p.sellPrice, cost: p.costPrice, stock, units: { today, yest, d7, d30 }, deliveredPct, returnedPct, cancelled, trend };
};
export const salesStats: SalesStat[] = [
  stat(1, 4, 16, 31, 118, 0, 0, 0, -75, 0),
  stat(0, 0, 3, 14, 52, 71, 12, 4, -5, 0),
  stat(2, 0, 0, 9, 36, 80, 8, 2, 4, 0),
  stat(3, 0, 1, 6, 21, 74, 10, 1, -2, 0),
  stat(4, 0, 0, 4, 12, 69, 14, 1, -8, 0),
  stat(6, 0, 0, 0, 3, 66, 16, 0, -1, 0),
];
export const unitsFor = (s: SalesStat, r: RangeKey) =>
  r === 'today' ? s.units.today : r === 'yest' ? s.units.yest : r === '7d' ? s.units.d7 : Math.round(s.units.d30 * factor[r]);

export const webStatuses = ['Processing', 'Incomplete', 'Good but no response', 'No response', 'Advance payment', 'On hold', 'Approved', 'Cancel'] as const;
export interface WebRow { id: string; name: string; sku: string; bg: string; orders: number; qty: number; amount: number; by: Record<string, number> }
export const webRows: WebRow[] = [
  { id: 'prod-2', name: 'korean leaf nacklace with 2 gift', sku: 'leaf nacklace n', bg: productSeed[1].images[0].bg ?? '#eee', orders: 5, qty: 5, amount: 3495, by: { Processing: 4, Incomplete: 1 } },
];

export const stockRows = [
  { sku: '888889', name: 'Butterfly nacklace', qty: 549, cost: 600, sell: 777, category: 'Necklace', lastSold: 2 },
  { sku: 'BB36', name: 'Bracelet black', qty: 100, cost: 1000, sell: 1200, category: 'Bracelet black', lastSold: 11 },
  { sku: 'BB38', name: 'rotate necklace', qty: 293, cost: 700, sell: 800, category: 'Necklace', lastSold: 1 },
  { sku: '3045', name: 'Bracelet for female', qty: 70, cost: 700, sell: 850, category: 'Uncategorized', lastSold: 64 },
  { sku: '20009', name: 'Benny chain', qty: 79, cost: 1000, sell: 1150, category: 'Uncategorized', lastSold: 97 },
  { sku: '768989', name: 'Winter cup combo', qty: 17, cost: 1100, sell: 1999, category: 'Uncategorized', lastSold: 120 },
];
export const inventoryTotals = { products: 53742, cost: 29_360_600.1, sell: 41_944_200 };
