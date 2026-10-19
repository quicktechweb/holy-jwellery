// Demo data - pore API theke ene replace korben

export const kpis = [
  { title: 'Total Orders', value: '0', delta: '100.0%', previous: '6', hasFilter: true },
  { title: 'Revenue', value: '৳0', delta: '100.0%', previous: '৳4,597', hasFilter: true },
  { title: 'Profit', value: '৳0', delta: '100.0%', previous: '৳561', hasFilter: true },
  { title: 'Pending Web Orders', value: '1', hasFilter: false },
] as const;

const counts = [
  82, 60, 61, 46, 45, 41, 13, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 27, 44, 31, 18, 8, 0, 24,
  19, 27, 38, 5, 0,
];

// Sep 13 -> Oct 12 (30 din)
export const orderCounts = counts.map((value, i) => ({
  label: i < 18 ? `Sep ${13 + i}` : `Oct ${i - 17}`,
  value,
}));

export const hours = [
  '12AM',
  '1AM',
  '2AM',
  '3AM',
  '4AM',
  '5AM',
  '6AM',
  '7AM',
  '8AM',
  '9AM',
  '10AM',
  '11AM',
  '12PM',
  '1PM',
  '2PM',
  '3PM',
  '4PM',
  '5PM',
  '6PM',
  '7PM',
  '8PM',
  '9PM',
  '10PM',
  '11PM',
];

/* ---------------- Overview ---------------- */
export type DeltaTone = 'up' | 'bad' | 'good' | 'down';

export const overviewKpis: {
  title: string;
  value: string;
  delta: string;
  previous: string;
  tone: DeltaTone;
}[] = [
  { title: 'Orders Received', value: '1', delta: '0.0%', previous: '1', tone: 'up' },
  { title: 'Total Orders', value: '0', delta: '100.0%', previous: '6', tone: 'bad' },
  { title: 'Confirmed', value: '0', delta: '100.0%', previous: '6', tone: 'bad' },
  { title: 'Shipped Orders', value: '0', delta: '0.0%', previous: '0', tone: 'up' },
  { title: 'Delivered Orders', value: '0', delta: '0.0%', previous: '0', tone: 'up' },
  { title: 'Cancelled Orders', value: '0', delta: '100.0%', previous: '1', tone: 'good' },
  { title: 'Return Orders', value: '0', delta: '0.0%', previous: '0', tone: 'up' },
  { title: 'Revenue', value: '৳0', delta: '100.0%', previous: '৳4,597', tone: 'bad' },
  { title: 'Profit', value: '৳0', delta: '100.0%', previous: '৳561', tone: 'bad' },
  { title: 'Ad Spend', value: '৳0', delta: '0.0%', previous: '৳0', tone: 'up' },
  { title: 'Courier Cost', value: '৳0', delta: '100.0%', previous: '৳580', tone: 'good' },
  {
    title: 'Pending COD Amount',
    value: '৳0',
    delta: '100.0%',
    previous: '৳4,597',
    tone: 'down',
  },
];

export interface FunnelStage {
  label: string;
  value: number;
  pct: string;
}

export const funnels: Record<string, FunnelStage[]> = {
  Web: [
    { label: 'Web Orders', value: 1, pct: '100%' },
    { label: 'Confirmed', value: 0, pct: '-100%' },
    { label: 'Ready Sent', value: 0, pct: '0%' },
    { label: 'Delivered', value: 0, pct: '0%' },
  ],
  Incomplete: [
    { label: 'Incomplete', value: 0, pct: '0%' },
    { label: 'Recovered', value: 0, pct: '0%' },
    { label: 'Confirmed', value: 0, pct: '0%' },
    { label: 'Delivered', value: 0, pct: '0%' },
  ],
  'Confirmed only': [
    { label: 'Confirmed', value: 0, pct: '0%' },
    { label: 'Ready Sent', value: 0, pct: '0%' },
    { label: 'Delivered', value: 0, pct: '0%' },
  ],
};

export const profitSeries = [
  { key: 'revenue', color: '#2563eb' },
  { key: 'productCost', color: '#64748b' },
  { key: 'adSpend', color: '#f59e0b' },
  { key: 'courierCost', color: '#9333ea' },
  { key: 'netProfit', color: '#16a34a' },
] as const;

const day = (n: number) => `Oct ${n}`;
export const profitRanges: Record<string, string[]> = {
  Day: [day(12)],
  Week: [6, 7, 8, 9, 10, 11, 12].map(day),
  Month: Array.from({ length: 12 }, (_, i) => day(i + 1)),
};

export const orderCountsToday = [{ label: 'Oct 12', value: 0 }];

/* ---------------- Operations ---------------- */
export const operationsKpis = [
  { label: 'Awaiting confirmation stuck', value: 0 },
  { label: 'Packaging pending stuck', value: 0 },
  { label: 'Ready to send stuck', value: 0 },
  { label: 'Courier upload failed', value: 0 },
  { label: 'Courier sent delayed', value: 0 },
  { label: 'Delivery delayed', value: 0 },
  { label: 'Return stuck', value: 0 },
  { label: 'COD settlement stuck', value: 0 },
  { label: 'Stock issue', value: 0 },
  { label: 'Preorder due', value: 0 },
];

export const courierTabs = [
  { label: 'Orders Not Sent To Courier', empty: 'No unsent courier orders found' },
  { label: 'Courier Performance', empty: 'No courier performance data found' },
];
