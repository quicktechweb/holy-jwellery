'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

type Lang = 'bn' | 'en';
type L = { bn: string; en: string };

const DASH = '/dashboard/inventory?section=smart-restock';

const toc: { id: string; label: L }[] = [
  { id: 'intro', label: { bn: 'ভূমিকা', en: 'Introduction' } },
  { id: 'dashboard', label: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' } },
  { id: 'status-logic', label: { bn: 'স্টক স্ট্যাটাস লজিক', en: 'Stock status logic' } },
  { id: 'abc', label: { bn: 'ABC এনালাইসিস', en: 'ABC analysis' } },
  { id: 'dead-stock', label: { bn: 'ডেড স্টক', en: 'Dead stock' } },
  { id: 'avg-sales', label: { bn: 'গড় দৈনিক বিক্রি', en: 'Average daily sales' } },
  { id: 'reorder', label: { bn: 'রিঅর্ডার পয়েন্ট', en: 'Reorder point' } },
  { id: 'faq', label: { bn: 'প্রশ্নোত্তর (FAQ)', en: 'FAQ' } },
  { id: 'tips', label: { bn: 'টিপস ও অনুশীলন', en: 'Tips & practice' } },
];

const tone = {
  gray: '#9ca3af', red: '#ef4444', orange: '#f97316', amber: '#f5b301', green: '#10b981',
} as const;

function Badge({ color, children }: { color: keyof typeof tone; children: ReactNode }) {
  return (
    <span className="border-ed-line inline-flex items-center gap-1.5 rounded-md border bg-white px-2 py-0.5 text-[12px] whitespace-nowrap">
      <i className="size-1.5 rounded-full" style={{ background: tone[color] }} />{children}
    </span>
  );
}

const H2 = ({ children }: { children: ReactNode }) => <h2 className="text-[32px] leading-[1.2] font-bold tracking-tight sm:text-[38px]">{children}</h2>;
const H3 = ({ children }: { children: ReactNode }) => <h3 className="mt-7 text-[19px] font-bold tracking-tight">{children}</h3>;
const P = ({ children, className }: { children: ReactNode; className?: string }) => <p className={cn('text-ed-text/75 mt-3 text-[15.5px] leading-[1.75]', className)}>{children}</p>;
const Bullets = ({ items }: { items: string[] }) => (
  <ul className="mt-3 space-y-2.5">
    {items.map((i) => <li key={i} className="text-ed-text/80 flex gap-3.5 text-[15.5px] leading-[1.6]"><i className="mt-[10px] size-1.5 shrink-0 rounded-full bg-[#b9b5c6]" />{i}</li>)}
  </ul>
);
const Box = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('border-ed-line overflow-hidden rounded-xl border bg-white', className)}>{children}</div>
);
const Formula = ({ children }: { children: ReactNode }) => (
  <div className="bg-ed-brand-soft/60 border-ed-brand/15 text-ed-brand mt-4 rounded-xl border px-5 py-4 text-[15px] font-medium">{children}</div>
);

export function SmartRestockGuide() {
  const [lang, setLang] = useState<Lang>('bn');
  const [active, setActive] = useState(toc[0].id);
  const [open, setOpen] = useState<number | null>(0);
  const t = (bn: string, en: string) => (lang === 'bn' ? bn : en);

  useEffect(() => {
    const els = toc.map((x) => document.getElementById(x.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => { const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (hit) setActive(hit.target.id); },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (id: string) => { setActive(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const rules: [string, string, keyof typeof tone, string][] = [
    ['যদি স্টক = ০', 'If stock = 0', 'red', 'Out of Stock'],
    ['যদি ডেড স্টক (৯০+ দিন বিক্রি নেই)', 'If dead stock (no sales for 90+ days)', 'green', 'Sufficient'],
    ['যদি স্টক ≤ ৫ (সেফটি স্টক)', 'If stock ≤ 5 (safety stock)', 'orange', 'Critical'],
    ['যদি স্টক ≤ ১০ (রিঅর্ডার পয়েন্ট)', 'If stock ≤ 10 (reorder point)', 'amber', 'Low Stock'],
    ['অন্যথায়', 'Otherwise', 'green', 'Sufficient'],
  ];
  const signals: [string, keyof typeof tone, string, string, string, string][] = [
    ['Total Products', 'gray', 'আপনার মোট প্রোডাক্ট সংখ্যা। শুধু তথ্যের জন্য।', 'Your total number of products. For information only.', '', ''],
    ['Out of Stock', 'red', 'যেগুলোর স্টক ০ (শেষ)।', 'Products with 0 stock (sold out).', 'এখনই অর্ডার দিন', 'Order now'],
    ['Critical', 'orange', 'স্টক শেষ হওয়ার পথে (৫ বা তার কম)।', 'About to run out (5 or fewer).', 'দ্রুত অর্ডার দিন', 'Order quickly'],
    ['Low Stock', 'amber', 'স্টক কমে যাচ্ছে (১০ বা তার কম)।', 'Stock is getting low (10 or fewer).', 'এই সপ্তাহে অর্ডার দিন', 'Order this week'],
    ['Sufficient', 'green', 'পর্যাপ্ত স্টক আছে। চিন্তার কিছু নেই।', 'Enough stock. Nothing to worry about.', '', ''],
    ['Stock / Sell Value', 'gray', 'Stock = মোট স্টকের কস্ট প্রাইস · Sell = বিক্রি করলে কত পাবেন।', 'Stock = total cost price of your stock · Sell = what you get if it all sells.', '', ''],
  ];
  const abc: [string, string, string, string, string][] = [
    ['A', 'bg-[#dcf7e6] text-emerald-700', 'সবচেয়ে বেশি আয়ের প্রোডাক্ট — মোট আয়ের প্রথম ৮০%।', 'Top earners — the first 80% of total revenue.', 'কখনো স্টক শেষ হতে দেবেন না।|Never let these run out.'],
    ['B', 'bg-[#fdf0c3] text-amber-700', 'মাঝারি আয়ের প্রোডাক্ট — পরের ১৫%।', 'Mid earners — the next 15%.', 'নিয়মিত নজর রাখুন।|Keep a regular eye on them.'],
    ['C', 'bg-[#eceaf1] text-slate-600', 'কম আয়ের প্রোডাক্ট — শেষ ৫%।', 'Low earners — the last 5%.', 'অল্প কিনুন, বেশি জমাবেন না।|Buy small, don’t overstock.'],
  ];
  const faq: [string, string, string, string][] = [
    ['Recalculate Analytics কখন চাপব?', 'When should I press Recalculate Analytics?', 'দিনে অন্তত একবার, অথবা অনেক অর্ডার ও স্টক পরিবর্তনের পর চাপুন। এটি গত ৯০ দিনের অর্ডার হিস্ট্রি বিশ্লেষণ করে ড্যাশবোর্ড নতুন করে সাজায়।', 'Press it at least once a day, or after many orders and stock changes. It analyses your last 90 days of order history and refreshes the dashboard.'],
    ['ড্যাশবোর্ডে সবকিছু ০ দেখাচ্ছে কেন?', 'Why does the dashboard show 0 everywhere?', 'প্রথমবার Recalculate Analytics না চাপা পর্যন্ত কোনো ডেটা তৈরি হয় না। “Welcome to Smart Restock!” বক্সের Get Started চাপুন।', 'No data is built until you press Recalculate Analytics for the first time. Use Get Started in the “Welcome to Smart Restock!” box.'],
    ['ডেড স্টক কেন “Critical” দেখায় না?', 'Why is dead stock never shown as “Critical”?', 'কারণ যে প্রোডাক্ট বিক্রিই হচ্ছে না, সেটা রিস্টক করার দরকার নেই। তাই ডেড স্টক সবসময় Sufficient ধরা হয়।', 'A product that is not selling does not need restocking, so dead stock is always treated as Sufficient.'],
    ['কিছু প্রোডাক্টের স্টক হিস্ট্রি কেন রেকর্ড হয় না?', 'Why is stock history not recorded for some products?', 'প্রোডাক্টের “Manage Stock” বন্ধ থাকলে স্টক ট্র্যাকিং হয় না। প্রোডাক্ট সেটিংসে এটি চালু করুন।', 'If “Manage Stock” is off for a product, its stock is not tracked. Turn it on in the product settings.'],
    ['নেগেটিভ স্টক কেন হয়, কীভাবে ঠিক করব?', 'Why does negative stock happen and how do I fix it?', 'স্টকের চেয়ে বেশি পরিমাণ ডেলিভারি রেকর্ড হলে স্টক ০-এর নিচে যায়। Stock Ledger-এ Add Adjustment দিয়ে সঠিক সংখ্যা ঠিক করে নিন।', 'It happens when more units are recorded as delivered than were in stock. Fix it with Add Adjustment in the Stock Ledger.'],
  ];
  const tips: [string, string][] = [
    ['সকালে ড্যাশবোর্ড খুলে আগে Out of Stock ও Critical দেখুন।', 'Open the dashboard each morning and check Out of Stock and Critical first.'],
    ['Recalculate Analytics চেপে ডেটা নতুন করে নিন।', 'Press Recalculate Analytics to refresh the data.'],
    ['“Products Needing Reorder” তালিকা থেকে সাপ্লায়ারকে অর্ডার দিন।', 'Place orders with suppliers from the “Products Needing Reorder” list.'],
    ['সপ্তাহে একবার ডেড স্টক দেখে অফার বা ছাড় ঠিক করুন।', 'Once a week, review dead stock and decide on offers or discounts.'],
    ['মাসে একবার ABC এনালাইসিস দেখে A ক্যাটাগরির প্রোডাক্ট নিশ্চিত করুন।', 'Once a month, check ABC analysis and make sure Category A products are covered.'],
  ];

  return (
    <div className="-mx-4 min-h-full bg-white lg:-mx-6">
      <div className="border-ed-line sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[64px] max-w-[1104px] items-center justify-between gap-4 px-4 lg:px-0">
          <div className="flex min-w-0 items-center gap-4 text-[14px]">
            <Link href={DASH} className="hover:text-ed-brand flex items-center gap-2 whitespace-nowrap"><ArrowLeft className="size-4" />{t('ড্যাশবোর্ড', 'Dashboard')}</Link>
            <span className="bg-ed-line h-5 w-px" />
            <span className="text-ed-muted flex items-center gap-2 whitespace-nowrap">Smart Restock <ChevronRight className="size-3.5" /> <b className="text-ed-text font-bold">{t('গাইড', 'Guide')}</b></span>
          </div>
          <div role="group" aria-label="Language" className="border-ed-line flex rounded-lg border bg-white p-0.5 text-[13px]">
            {([['bn', 'বাংলা'], ['en', 'English']] as const).map(([k, l]) => (
              <button key={k} type="button" aria-pressed={lang === k} onClick={() => setLang(k)} className={cn('h-8 rounded-md px-3.5 transition', lang === k ? 'bg-black font-medium text-white' : 'text-ed-text/70 hover:text-ed-text')}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1104px] gap-x-12 px-4 pt-8 pb-24 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-0 lg:pt-10">
        <aside className="lg:sticky lg:top-[88px] lg:self-start">
          <p className="text-ed-muted mb-2 hidden px-3 text-[13px] lg:block">{t('সূচিপত্র', 'Contents')}</p>
          <nav aria-label="Contents" className="thin-scroll -mx-1 flex gap-1 overflow-x-auto px-1 pb-2 lg:mx-0 lg:block lg:space-y-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
            {toc.map((x, i) => (
              <a key={x.id} href={`#${x.id}`} onClick={(e) => { e.preventDefault(); go(x.id); }}
                className={cn('flex shrink-0 items-center gap-4 rounded-lg px-3 py-2.5 text-[14.5px] whitespace-nowrap transition', active === x.id ? 'bg-[#f3f2f6] text-ed-text' : 'text-ed-text/70 hover:bg-[#f8f7fb]')}>
                <span className={cn('font-mono text-[11px]', active === x.id ? 'text-[#0f9d7a]' : 'text-ed-muted')}>{String(i + 1).padStart(2, '0')}</span>{t(x.label.bn, x.label.en)}
              </a>
            ))}
          </nav>
          <div className="border-ed-line mt-4 hidden border-t pt-4 lg:block">
            <Link href={DASH} target="_blank" className="flex items-center gap-2 px-3 text-[13.5px] text-[#0f9d7a] hover:underline">{t('ড্যাশবোর্ড খুলুন', 'Open dashboard')} <ExternalLink className="size-3.5" /></Link>
          </div>
        </aside>

        <article className="mx-auto w-full max-w-[817px] min-w-0 lg:mx-0">
          <header id="intro" className="scroll-mt-24">
            <p className="text-[13px] font-medium text-[#0f9d7a]">{t('ডকুমেন্টেশন', 'Documentation')}</p>
            <h1 className="mt-1 text-[40px] leading-[1.15] font-bold tracking-tight sm:text-[48px]">{t('স্মার্ট রিস্টক গাইড', 'Smart Restock Guide')}</h1>
            <p className="text-ed-text/75 mt-5 max-w-[700px] text-[16px] leading-[1.75]">{t('ইনভেন্টরি ম্যানেজমেন্টের সম্পূর্ণ রেফারেন্স—ড্যাশবোর্ড পড়া, স্ট্যাটাস বোঝা, ABC এনালাইসিস, ডেড স্টক, রিঅর্ডার পয়েন্ট এবং প্রতিদিনের অনুশীলন।', 'A complete reference for inventory management — reading the dashboard, understanding statuses, ABC analysis, dead stock, reorder points and daily practice.')}</p>
            <p className="text-ed-muted mt-5 flex flex-wrap items-center gap-x-3 text-[12.5px]">
              <span>{t('৯ অধ্যায়', '9 chapters')}</span><i className="size-1 rounded-full bg-[#cfcbd9]" /><span>{t('~৪ মিনিট পড়া', '~4 min read')}</span><i className="size-1 rounded-full bg-[#cfcbd9]" /><span>{t('আপডেট: ডিসেম্বর ২০২৫', 'Updated: December 2025')}</span>
            </p>
            <hr className="border-ed-line mt-8" />

            <div className="pt-12">
              <H2>{t('ভূমিকা', 'Introduction')}</H2>
              <P>{t('স্মার্ট রিস্টক সিস্টেম আপনার ইনভেন্টরি ম্যানেজমেন্টকে সহজ করে দেয়। ডেটা থেকে সরাসরি সিদ্ধান্ত—কোনটা কিনবেন, কখন কিনবেন, কোনটা বাদ দেবেন।', 'Smart Restock makes inventory management simple. It turns your data into direct decisions — what to buy, when to buy, and what to skip.')}</P>
              <p className="mt-5 text-[15.5px]">{t('এই সিস্টেম আপনাকে বলে দেবে:', 'The system tells you:')}</p>
              <Bullets items={lang === 'bn'
                ? ['কোন প্রোডাক্ট কিনতে হবে (রিস্টক করতে হবে)', 'কত পিস কিনতে হবে', 'কোন প্রোডাক্ট বিক্রি হচ্ছে না (ডেড স্টক)', 'কোন প্রোডাক্ট সবচেয়ে বেশি বিক্রি হচ্ছে']
                : ['Which products to buy (restock)', 'How many pieces to buy', 'Which products are not selling (dead stock)', 'Which products sell the most']} />
            </div>
          </header>

          <section id="dashboard" className="border-ed-line mt-12 scroll-mt-24 border-t pt-12">
            <H2>{t('ড্যাশবোর্ড বুঝুন', 'Understand the dashboard')}</H2>
            <P>{t('ড্যাশবোর্ডের উপরের স্ট্যাট কার্ডগুলো ছয়টি আলাদা প্রশ্নের উত্তর দেয়।', 'The stat cards at the top of the dashboard answer six different questions.')}</P>
            <H3>{t('স্ট্যাট কার্ডগুলো কী বোঝায়?', 'What do the stat cards mean?')}</H3>
            <Box className="mt-4">
              <div className="thin-scroll overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead><tr className="text-ed-muted border-ed-line border-b bg-[#faf9fc] text-[11px] tracking-wider uppercase">
                    <th className="px-4 py-3.5 font-medium">Signal</th><th className="px-4 font-medium">Meaning</th><th className="px-4 font-medium">Action</th>
                  </tr></thead>
                  <tbody>
                    {signals.map(([name, c, mbn, men, abn, aen]) => (
                      <tr key={name} className="border-ed-line border-b text-[14px] last:border-b-0">
                        <td className="px-4 py-4 align-middle"><Badge color={c}>{name}</Badge></td>
                        <td className="px-4 py-4">{t(mbn, men)}</td>
                        <td className="text-ed-text/70 px-4 py-4 text-[13px]">{abn ? t(abn, aen) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Box>
          </section>

          <section id="status-logic" className="border-ed-line mt-12 scroll-mt-24 border-t pt-12">
            <H2>{t('স্টক স্ট্যাটাস লজিক', 'Stock status logic')}</H2>
            <P>{t('সিস্টেম এই ক্রমে চেক করে—উপরের শর্ত মিললে নিচেরটা দেখা হয় না।', 'The system checks in this order — once an upper rule matches, the ones below are skipped.')}</P>
            <Box className="mt-5">
              {rules.map(([bn, en, c, label]) => (
                <div key={label + bn} className="border-ed-line flex items-center justify-between gap-3 border-b px-5 py-3.5 text-[14px] last:border-b-0">
                  <span>{t(bn, en)}</span><Badge color={c}>{label}</Badge>
                </div>
              ))}
            </Box>
            <div role="note" className="mt-5 rounded-xl border border-[#f3d27a] bg-[#fffbeb] px-5 py-4">
              <p className="flex items-center gap-2.5 text-[14.5px] font-bold text-amber-900"><AlertTriangle className="size-4" />{t('গুরুত্বপূর্ণ', 'Important')}</p>
              <p className="mt-1.5 pl-[26px] text-[14.5px] leading-relaxed text-amber-950/85">
                {lang === 'bn'
                  ? <><b>ডেড স্টক কখনো “Critical” দেখাবে না।</b> কারণ যে প্রোডাক্ট বিক্রিই হচ্ছে না, সেটা রিস্টক করার দরকার নেই।</>
                  : <><b>Dead stock is never shown as “Critical”.</b> A product that is not selling does not need restocking.</>}
              </p>
            </div>
            <h3 className="mt-8 text-[18px] font-bold">{t('উদাহরণ', 'Examples')}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { n: t('উদাহরণ ১', 'Example 1'), l: t('স্টক ৩ পিস · প্রতিদিন ১ পিস বিক্রি', 'Stock 3 pcs · sells 1 pc per day'), b: <Badge color="orange">Critical</Badge>, c: t('৩ দিনে শেষ হয়ে যাবে।', 'Will run out in 3 days.') },
                { n: t('উদাহরণ ২', 'Example 2'), l: t('স্টক ৩ পিস · ৯০ দিন বিক্রি নেই', 'Stock 3 pcs · no sales in 90 days'), b: <Badge color="green">Sufficient · Dead</Badge>, c: t('রিস্টকের দরকার নেই।', 'No restock needed.') },
              ].map((x) => (
                <div key={x.n} className="border-ed-line rounded-xl border bg-white p-5">
                  <p className="text-ed-muted text-[12px]">{x.n}</p>
                  <p className="mt-2.5 text-[14.5px]">{x.l}</p>
                  <div className="mt-3">{x.b}</div>
                  <p className="text-ed-text/70 mt-3 text-[13px]">{x.c}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="abc" className="border-ed-line mt-12 scroll-mt-24 border-t pt-12">
            <H2>{t('ABC এনালাইসিস', 'ABC analysis')}</H2>
            <P>{t('গত ৯০ দিনের বিক্রির আয় অনুযায়ী প্রোডাক্টকে তিন ভাগে ভাগ করা হয়—কোনটায় আগে নজর দেবেন তা বোঝার জন্য।', 'Products are split into three groups by revenue over the last 90 days, so you know where to focus first.')}</P>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {abc.map(([k, cls, bn, en, tip]) => {
                const [tb, te] = tip.split('|');
                return (
                  <div key={k} className="border-ed-line rounded-xl border bg-white p-5">
                    <span className={cn('flex size-9 items-center justify-center rounded-lg text-[15px] font-bold', cls)}>{k}</span>
                    <p className="mt-3 text-[14px] leading-relaxed">{t(bn, en)}</p>
                    <p className="text-ed-text/65 mt-2 text-[13px]">{t(tb, te)}</p>
                  </div>
                );
              })}
            </div>
            <P>{t('A ক্যাটাগরির কোনো প্রোডাক্ট Low Stock হলে সবার আগে সেটার অর্ডার দিন।', 'When a Category A product turns Low Stock, order it before anything else.')}</P>
          </section>

          <section id="dead-stock" className="border-ed-line mt-12 scroll-mt-24 border-t pt-12">
            <H2>{t('ডেড স্টক', 'Dead stock')}</H2>
            <P>{t('যে প্রোডাক্ট ৯০ বা তার বেশি দিন ধরে একটাও বিক্রি হয়নি, সেটাই ডেড স্টক। এতে আপনার টাকা আটকে থাকে।', 'A product with no sales for 90 days or more is dead stock. It keeps your money locked up.')}</P>
            <H3>{t('ডেড স্টকে কী করবেন?', 'What to do with dead stock')}</H3>
            <Bullets items={lang === 'bn'
              ? ['নতুন করে অর্ডার দেবেন না', 'ডিসকাউন্ট বা কম্বো অফারে বিক্রির চেষ্টা করুন', 'ওয়েবসাইট বা অ্যাডে ফিচার করে দেখুন', 'সম্ভব হলে সাপ্লায়ারকে ফেরত দিন']
              : ['Do not reorder it', 'Try selling it with a discount or combo offer', 'Feature it on the website or in ads', 'Return it to the supplier if possible']} />
          </section>

          <section id="avg-sales" className="border-ed-line mt-12 scroll-mt-24 border-t pt-12">
            <H2>{t('গড় দৈনিক বিক্রি', 'Average daily sales')}</H2>
            <P>{t('একটি প্রোডাক্ট প্রতিদিন গড়ে কত পিস বিক্রি হয় তা দিয়ে বোঝা যায় স্টক কত দিন চলবে। Fast Moving ও Slow Moving তালিকাও এর উপর ভিত্তি করে তৈরি।', 'Average daily sales tell you how many days your stock will last. The Fast Moving and Slow Moving lists are built from it.')}</P>
            <Formula>{t('গড় দৈনিক বিক্রি = গত ৯০ দিনের মোট বিক্রি ÷ ৯০', 'Average daily sales = units sold in the last 90 days ÷ 90')}</Formula>
            <Formula>{t('স্টক কত দিন চলবে = বর্তমান স্টক ÷ গড় দৈনিক বিক্রি', 'Days of stock left = current stock ÷ average daily sales')}</Formula>
            <P>{t('উদাহরণ: ৯০ দিনে ২৭০ পিস বিক্রি হলে গড় ৩ পিস/দিন। স্টক ১২ পিস থাকলে চলবে ৪ দিন।', 'Example: 270 pcs sold in 90 days is 3 pcs/day. With 12 pcs in stock, it lasts 4 days.')}</P>
          </section>

          <section id="reorder" className="border-ed-line mt-12 scroll-mt-24 border-t pt-12">
            <H2>{t('রিঅর্ডার পয়েন্ট', 'Reorder point')}</H2>
            <P>{t('যে স্টক লেভেলে পৌঁছালে নতুন অর্ডার দেওয়া উচিত তাকে রিঅর্ডার পয়েন্ট বলে। সিস্টেমে সেফটি স্টক ৫ পিস এবং রিঅর্ডার পয়েন্ট ১০ পিস ধরা হয়।', 'The stock level at which you should place a new order is the reorder point. The system uses 5 pcs as safety stock and 10 pcs as the reorder point.')}</P>
            <Formula>{t('রিঅর্ডার পয়েন্ট = (গড় দৈনিক বিক্রি × সাপ্লাই আসতে দিন) + সেফটি স্টক', 'Reorder point = (average daily sales × supplier lead time in days) + safety stock')}</Formula>
            <P>{t('উদাহরণ: দিনে ৩ পিস বিক্রি, সাপ্লাই আসতে ৪ দিন, সেফটি স্টক ৫ — তাহলে রিঅর্ডার পয়েন্ট (৩ × ৪) + ৫ = ১৭ পিস।', 'Example: 3 pcs sold per day, 4 days for supply, safety stock 5 — the reorder point is (3 × 4) + 5 = 17 pcs.')}</P>
          </section>

          <section id="faq" className="border-ed-line mt-12 scroll-mt-24 border-t pt-12">
            <H2>{t('প্রশ্নোত্তর (FAQ)', 'FAQ')}</H2>
            <Box className="mt-5">
              {faq.map(([qb, qe, ab, ae], i) => (
                <div key={qe} className="border-ed-line border-b last:border-b-0">
                  <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium">
                    {t(qb, qe)}<ChevronDown className={cn('text-ed-muted size-4 shrink-0 transition', open === i && 'rotate-180')} />
                  </button>
                  {open === i && <p className="text-ed-text/75 px-5 pb-5 text-[14.5px] leading-[1.75]">{t(ab, ae)}</p>}
                </div>
              ))}
            </Box>
          </section>

          <section id="tips" className="border-ed-line mt-12 scroll-mt-24 border-t pt-12">
            <H2>{t('টিপস ও অনুশীলন', 'Tips & practice')}</H2>
            <P>{t('প্রতিদিনের এই ছোট রুটিন মেনে চললে স্টক শেষ হওয়া ও টাকা আটকে যাওয়া দুটোই কমবে।', 'Following this short daily routine reduces both stock-outs and money stuck in stock.')}</P>
            <ol className="mt-5 space-y-3">
              {tips.map(([bn, en], i) => (
                <li key={en} className="border-ed-line flex items-start gap-4 rounded-xl border bg-white px-5 py-4">
                  <span className="bg-ed-brand-soft text-ed-brand flex size-7 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold">{i + 1}</span>
                  <span className="text-[14.5px] leading-relaxed">{t(bn, en)}</span>
                </li>
              ))}
            </ol>
          </section>
        </article>
      </div>
    </div>
  );
}
