const p2 = (n: number) => String(n);

/** 22/4/2026, 3:28 pm */
export const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  const h = d.getHours();
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}, ${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};

/** ৳900.00 (grouping chhara, screenshot er moto) */
export const money2 = (n: number) => `৳${n.toFixed(2)}`;
/** 1396.5 – float noise soriye */
export const num = (n: number) => `${+n.toFixed(2)}`;

const ord = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return p2(n) + (s[(v - 20) % 10] || s[v] || s[0]);
};
/** October 18th, 2026 */
export const longDate = (isoDate: string) => {
  const d = new Date(`${isoDate}T00:00:00`);
  return `${d.toLocaleString('en-US', { month: 'long' })} ${ord(d.getDate())}, ${d.getFullYear()}`;
};
export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
