export interface ProductImage { src?: string; bg?: string }
export interface Product {
  id: string; code: string; name: string; category: string; brand: string;
  manageStock: boolean; costPrice: number; sellPrice: number; webPrice: number; qty: number;
  active: boolean; alertQty: number; stockInAlert: number; featured: boolean; weight: number; weightUnit: 'kg' | 'g';
  shippingNote: string; adminNote: string; warranty: string; shortDesc: string; longDesc: string;
  extraCategories: string[]; images: ProductImage[]; tags: string[];
}

const base = { brand: '', webPrice: 0, alertQty: 0, stockInAlert: 5, featured: false, weight: 0, weightUnit: 'kg' as const, shippingNote: '', adminNote: '', warranty: '', shortDesc: '', longDesc: '', extraCategories: [] as string[], tags: [] as string[], active: true };
const mk = (n: number, code: string, name: string, category: string, manageStock: boolean, costPrice: number, sellPrice: number, bg: string, images = 1): Product => ({
  ...base, id: `prod-${n}`, code, name, category, manageStock, costPrice, sellPrice, qty: 0, images: Array.from({ length: images }, () => ({ bg })),
});

/** TODO: real API theke ashbe - ekhane sudhu screenshot er 7 ta product */
export const productSeed: Product[] = [
  mk(1, 'leaf nacklace n 699', 'LEAF LOKET WITH NACKLACE AND NOSE PIN', '', false, 300, 699, 'linear-gradient(135deg,#7a1020,#2b0a10)', 2),
  mk(2, 'leaf nacklace n', 'korean leaf nacklace with 2 gift', 'Necklace', true, 489.3, 699, 'linear-gradient(135deg,#a23a45,#3a0f18)'),
  mk(3, '55462', '898 taka combo nacklace', 'Uncategorized', false, 628.6, 898, 'linear-gradient(135deg,#4a3a22,#14100a)'),
  mk(4, '55223', '885 taka nacklace combo', 'Uncategorized', true, 626.5, 895, 'linear-gradient(135deg,#f3e2d0,#d8b9a5)'),
  mk(5, '54361', '970 diamond look jewellery', 'Uncategorized', true, 679, 970, 'linear-gradient(135deg,#1c2f5e,#0a0f20)'),
  mk(6, '53995', 'HEART SHAPE DIAMOND CART SET', 'Uncategorized', false, 0, 998, 'linear-gradient(135deg,#222,#050505)'),
  mk(7, '51844', 'rotate nacklace 760 taka', 'Uncategorized', false, 532, 760, 'linear-gradient(135deg,#e9d8b5,#a9803c)'),
];

export const categorySeed = [{ id: 1, name: 'Bracelet black' }, { id: 2, name: 'Necklace' }, { id: 3, name: 'Necklace' }, { id: 4, name: 'Uncategorized' }];
export const brandSeed: { id: number; name: string }[] = [];
export const productStats = { products: 88, stock: '44,222', sellValue: '3,39,77,970', costValue: '2,38,07,210' };
/** Active tags - ekhono kono tag banano nei ("Create a tag first") */
export const activeProductTags: string[] = [];
export const money = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
