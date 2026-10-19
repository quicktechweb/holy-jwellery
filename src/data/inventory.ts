export type MoveType = 'Purchase' | 'Return' | 'Adjustment In' | 'Transfer In' | 'Order Sale' | 'Adjustment Out' | 'Transfer Out';
export const moveTypes: MoveType[] = ['Purchase', 'Return', 'Adjustment In', 'Transfer In', 'Order Sale', 'Adjustment Out', 'Transfer Out'];
export const isIn = (t: MoveType) => ['Purchase', 'Return', 'Adjustment In', 'Transfer In'].includes(t);

export interface StockMove { id: string; at: string; type: MoveType; qty: number; note?: string }
export interface InventoryProduct { id: string; name: string; sku: string; stock: number; manageStock: boolean; moves: StockMove[] }

/** TODO: real API theke ashbe. Ekhane sudhu screenshot er negative stock gulo. */
export const negativeStock: InventoryProduct[] = [
  { id: 'cmhkoq3t90ab5ql0kcm87uibg', name: '6 BUDS NECKLESS', sku: '28745', stock: -10, manageStock: false, moves: [] },
  { id: 'cmhkoq3t90ab5ql0kcm87p722', name: 'purple pearl neckless', sku: '28722', stock: -669, manageStock: true, moves: [] },
  { id: 'cmhkoq3t90ab5ql0kcm87p677', name: 'purple colar neckless 790', sku: '28677', stock: -4719, manageStock: true, moves: [] },
  { id: 'cmhkoq3t90ab5ql0kcm87p670', name: 'purple neckless', sku: '28670', stock: -558, manageStock: true, moves: [] },
];

export const stockHealth = { total: 88, healthy: 11, low: 1, out: 51, negative: 25 };
import { productSeed } from './products';
export const findProduct = (id: string): InventoryProduct | undefined => {
  const hit = negativeStock.find((p) => p.id === id);
  if (hit) return hit;
  const p = productSeed.find((x) => x.id === id);
  return p ? { id: p.id, name: p.name, sku: p.code, stock: p.qty, manageStock: p.manageStock, moves: [] } : undefined;
};

/** TODO: real API theke ashbe - live site e ekhon kono low stock alert nei */
export interface StockAlert { id: string; name: string; sku: string; category: string; stock: number; alertQty: number; bg?: string }
export const stockAlertSeed: StockAlert[] = [];
