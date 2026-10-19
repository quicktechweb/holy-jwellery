export type TagGroup = 'Problem Tags' | 'Issue Tags' | 'Financial Tags';
export interface TagDef { name: string; group: TagGroup; cls: string }

export const systemTags: TagDef[] = [
  { name: 'Customer Delay', group: 'Problem Tags', cls: 'bg-[#fdf3c8] text-amber-800' },
  { name: 'Rider Problem', group: 'Problem Tags', cls: 'bg-[#ffe9d1] text-orange-700' },
  { name: 'Wrong Parcel', group: 'Issue Tags', cls: 'bg-[#e6ebff] text-indigo-700' },
  { name: 'Parcel Damage', group: 'Issue Tags', cls: 'bg-[#fde4ea] text-rose-700' },
  { name: 'Parcel Lost', group: 'Issue Tags', cls: 'bg-[#fde0e4] text-red-700' },
  { name: 'Check No Charge', group: 'Issue Tags', cls: 'bg-[#e8edf7] text-slate-700' },
  { name: 'Returned With Charge', group: 'Financial Tags', cls: 'bg-[#f3e4fd] text-purple-700' },
  { name: 'Returned Without Charge', group: 'Financial Tags', cls: 'bg-[#eeedf2] text-ed-text' },
  { name: 'Delivery Charge Discrepancy', group: 'Financial Tags', cls: 'bg-[#fde4f1] text-pink-700' },
  { name: 'Customer Fraud', group: 'Financial Tags', cls: 'bg-[#fde0e4] text-red-700' },
  { name: 'Courier Fraud', group: 'Financial Tags', cls: 'bg-[#fcd9de] text-red-700' },
  { name: 'Customer Short Pay', group: 'Financial Tags', cls: 'bg-[#ffecd0] text-amber-700' },
  { name: 'Delivery Charge Received', group: 'Financial Tags', cls: 'bg-[#d5f5ea] text-teal-700' },
];
export const SOLVED = 'Problem Solved';
export const solvedCls = 'bg-[#d9f7e5] text-emerald-700';
export const customCls = 'bg-[#eef0f8] text-slate-700';
export const problemTagNames = systemTags.filter((t) => t.group === 'Problem Tags' || t.group === 'Issue Tags').map((t) => t.name);

export const tagCls = (name: string) => (name === SOLVED ? solvedCls : systemTags.find((t) => t.name === name)?.cls ?? customCls);
/** Return Management er tag filter */
export const returnTagNames = ['Returned With Charge', 'Returned Without Charge', 'Delivery Charge Discrepancy', 'Customer Fraud', 'Courier Fraud', 'Customer Short Pay', 'Delivery Charge Received', SOLVED];
