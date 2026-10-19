'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Box, ClipboardList, DollarSign, Languages, Settings, UserCog, RotateCcw } from 'lucide-react';
import { systemTags, SOLVED, tagCls } from '@/data/courierTags';
import { cn } from '@/lib/utils';
import { outcomeColor, OUTCOMES } from './store';

type L = { en: string; bn: string };
interface Card { title: L; body: L }
interface Section { id: string; tab: L; icon: typeof Box; heading: L; sub: L; cards: Card[] }

const sections: Section[] = [
  {
    id: 'delivery-assignment', tab: { en: 'Delivery', bn: 'ডেলিভারি' }, icon: Box,
    heading: { en: 'Section A: Delivery Assignment & Tracking', bn: 'সেকশন A: ডেলিভারি অ্যাসাইনমেন্ট ও ট্র্যাকিং' },
    sub: { en: 'Managing parcels currently with delivery riders (Assign for Delivery status)', bn: 'যে পার্সেলগুলো এখন ডেলিভারি রাইডারের কাছে আছে (Assign for Delivery স্ট্যাটাস) সেগুলো ম্যানেজ করা' },
    cards: [
      { title: { en: 'Total Parcel Count & Filter-Based Loading', bn: 'মোট পার্সেল সংখ্যা ও ফিল্টার-ভিত্তিক লোডিং' },
        body: { en: 'When the manager applies a filter, the total number of parcels currently with the delivery man will be prominently highlighted at the top of the screen. Example: Total Assign for Delivery Parcels = 90. This list is built from what the courier tells us — Pathao, Carrybee and Paperfly report a rider assignment automatically, while Steadfast needs the courier email and password saved on the delivery method. If any parcels are missing — whether the list is empty or just shorter than you expect — the page says how many are unaccounted for, which couriers they are with, and why. Note that this count can read a little lower than the same filter inside your courier’s own app: this list only holds parcels that are still in progress, so one that was delivered or returned an hour ago correctly drops off here while the courier still lists it.',
          bn: 'ম্যানেজার কোনো ফিল্টার দিলে ডেলিভারি ম্যানের কাছে থাকা মোট পার্সেলের সংখ্যা স্ক্রিনের উপরে স্পষ্টভাবে দেখানো হবে। উদাহরণ: Total Assign for Delivery Parcels = 90। এই তালিকা কুরিয়ারের পাঠানো তথ্য থেকে তৈরি — Pathao, Carrybee ও Paperfly স্বয়ংক্রিয়ভাবে রাইডার অ্যাসাইনমেন্ট জানায়, আর Steadfast-এর জন্য ডেলিভারি মেথডে কুরিয়ারের ইমেইল ও পাসওয়ার্ড সেভ করা থাকতে হয়। কোনো পার্সেল না এলে পেজ জানিয়ে দেয় কতগুলো বাদ পড়েছে, কোন কুরিয়ারের কাছে আছে এবং কেন। মনে রাখবেন, কুরিয়ারের নিজের অ্যাপের একই ফিল্টারের চেয়ে সংখ্যা একটু কম দেখাতে পারে, কারণ এখানে শুধু চলমান পার্সেল থাকে।' } },
      { title: { en: 'Courier Age & Rider Attempt', bn: 'কুরিয়ার এজ ও রাইডার অ্যাটেম্পট' },
        body: { en: 'Courier age is the number of days since the parcel was sent to the courier. Rider attempt is the latest delivery attempt number reported by the rider. Use the From / To boxes to narrow the list; leaving To blank means “this many or more”. Rows shaded red need attention: three or more attempts, or a very old parcel.',
          bn: 'কুরিয়ার এজ মানে পার্সেল কুরিয়ারকে দেওয়ার পর কত দিন হয়েছে। রাইডার অ্যাটেম্পট মানে রাইডারের জানানো সর্বশেষ ডেলিভারি চেষ্টার নম্বর। From / To বক্সে সীমা দিন; To ফাঁকা রাখলে “এত বা তার বেশি” বোঝায়। লাল রঙের সারিতে মনোযোগ দিন: তিন বা তার বেশি চেষ্টা, অথবা খুব পুরনো পার্সেল।' } },
      { title: { en: 'Recording Calls', bn: 'কল রেকর্ড করা' },
        body: { en: 'Press the phone button on a row, choose Customer or Rider, pick the call slot and the outcome. The AM / PM dots in the Customer calls and Rider calls columns take the colour of the outcome, so the team can see at a glance who has already been called today.',
          bn: 'সারির ফোন বাটনে চাপ দিন, Customer বা Rider বাছুন, কল স্লট ও ফলাফল নির্বাচন করুন। Customer calls ও Rider calls কলামের AM / PM ডটগুলো ফলাফল অনুযায়ী রং নেয়, ফলে আজ কাকে কল করা হয়েছে এক নজরে বোঝা যায়।' } },
    ],
  },
  {
    id: 'in-charge', tab: { en: 'In Charge', bn: 'ইন চার্জ' }, icon: UserCog,
    heading: { en: 'Section B: In-Charge Management', bn: 'সেকশন B: ইন-চার্জ ম্যানেজমেন্ট' },
    sub: { en: 'Assign parcels to a team member so one person owns every follow-up', bn: 'পার্সেল টিম মেম্বারকে দিন, যাতে প্রতিটি ফলো-আপের দায়িত্ব একজনের থাকে' },
    cards: [
      { title: { en: 'Setting someone in charge', bn: 'কাউকে দায়িত্ব দেওয়া' },
        body: { en: 'Tick one or more parcels and press “Set in charge…” in the bar that appears, then choose a person. The number beside each name is how many of the selected parcels they already own. Choose “Nobody (clear)” to remove the owner. Every change is written to the parcel history.',
          bn: 'এক বা একাধিক পার্সেল টিক দিন, উপরে আসা বারে “Set in charge…” চাপুন এবং একজনকে বাছুন। প্রতিটি নামের পাশের সংখ্যা বোঝায় নির্বাচিত পার্সেলের মধ্যে কয়টি ইতিমধ্যে তার দায়িত্বে। মালিক সরাতে “Nobody (clear)” বাছুন। প্রতিটি পরিবর্তন পার্সেল হিস্ট্রিতে লেখা হয়।' } },
      { title: { en: 'Refresh Rider Attempt', bn: 'রাইডার অ্যাটেম্পট রিফ্রেশ' },
        body: { en: 'With parcels selected, the bar at the bottom fetches the latest Steadfast rider attempt for each eligible order. Parcels from other couriers are skipped and the bar tells you how many.',
          bn: 'পার্সেল সিলেক্ট করলে নিচের বার প্রতিটি যোগ্য অর্ডারের সর্বশেষ Steadfast রাইডার অ্যাটেম্পট নিয়ে আসে। অন্য কুরিয়ারের পার্সেল বাদ যায় এবং বার সংখ্যাটি জানিয়ে দেয়।' } },
    ],
  },
  {
    id: 'returns', tab: { en: 'Returns', bn: 'রিটার্ন' }, icon: RotateCcw,
    heading: { en: 'Section C: Returns & Financial Tags', bn: 'সেকশন C: রিটার্ন ও ফাইন্যান্সিয়াল ট্যাগ' },
    sub: { en: 'Resolve charges on parcels that are coming back', bn: 'ফেরত আসা পার্সেলের চার্জ নিষ্পত্তি করুন' },
    cards: [
      { title: { en: 'Return Management', bn: 'রিটার্ন ম্যানেজমেন্ট' },
        body: { en: 'Return Pending lists parcels on their way back. Use Short Pay when the courier paid less than expected, Charge Received once the return charge is settled and Courier Fraud to flag a dispute. Parcels tagged “Returned Without Charge” need no action.',
          bn: 'Return Pending-এ ফেরত আসা পার্সেল দেখায়। কুরিয়ার কম টাকা দিলে Short Pay, রিটার্ন চার্জ মিটে গেলে Charge Received এবং বিরোধ হলে Courier Fraud ব্যবহার করুন। “Returned Without Charge” ট্যাগ থাকলে কিছু করার নেই।' } },
      { title: { en: 'Return Analysis', bn: 'রিটার্ন অ্যানালাইসিস' },
        body: { en: 'Shows why parcels come back and which products keep returning for each reason. Click a reason to see the products behind it. Tag returned parcels with your own custom tags to grow the breakdown.',
          bn: 'পার্সেল কেন ফেরত আসে এবং প্রতিটি কারণে কোন পণ্য বারবার ফেরত আসে তা দেখায়। কারণে ক্লিক করলে পণ্যের তালিকা দেখা যায়। নিজস্ব কাস্টম ট্যাগ দিয়ে ফেরত পার্সেল ট্যাগ করলে বিশ্লেষণ আরও বিস্তারিত হয়।' } },
    ],
  },
  {
    id: 'damage-lost', tab: { en: 'Damage & Lost', bn: 'ড্যামেজ ও লস্ট' }, icon: DollarSign,
    heading: { en: 'Section D: Damage & Lost', bn: 'সেকশন D: ড্যামেজ ও লস্ট' },
    sub: { en: 'Track parcels the courier has damaged or lost', bn: 'কুরিয়ারের হাতে নষ্ট বা হারিয়ে যাওয়া পার্সেল ট্র্যাক করুন' },
    cards: [
      { title: { en: 'Claiming compensation', bn: 'ক্ষতিপূরণ দাবি' },
        body: { en: 'Tag the parcel Parcel Damage or Parcel Lost, add a note with the courier’s reply, and keep the parcel in the Damage & Lost list until the money arrives. Press “Resolve All Problems” in the tag menu once it is settled — the parcel gets the Problem Solved tag.',
          bn: 'পার্সেলে Parcel Damage বা Parcel Lost ট্যাগ দিন, কুরিয়ারের উত্তর নোটে লিখুন এবং টাকা না আসা পর্যন্ত Damage & Lost তালিকায় রাখুন। নিষ্পত্তি হলে ট্যাগ মেনুর “Resolve All Problems” চাপুন — পার্সেলে Problem Solved ট্যাগ বসবে।' } },
    ],
  },
  {
    id: 'courier-entry', tab: { en: 'Courier Entry', bn: 'কুরিয়ার এন্ট্রি' }, icon: ClipboardList,
    heading: { en: 'Section E: Courier Entry', bn: 'সেকশন E: কুরিয়ার এন্ট্রি' },
    sub: { en: 'Check how many parcels were handed to each courier each day', bn: 'প্রতিদিন কোন কুরিয়ারকে কতগুলো পার্সেল দেওয়া হয়েছে তা মিলিয়ে দেখুন' },
    cards: [
      { title: { en: 'Daily entry counts', bn: 'দৈনিক এন্ট্রি সংখ্যা' },
        body: { en: 'Pick a date range and a courier. Each row shows the parcels entered on that date; press View to see the orders, search them and export the list. Use Export Excel or Export CSV for the whole table.',
          bn: 'তারিখের পরিসর ও কুরিয়ার বাছুন। প্রতিটি সারি সেই তারিখের পার্সেল সংখ্যা দেখায়; View চাপলে অর্ডারগুলো দেখা, সার্চ ও এক্সপোর্ট করা যায়। পুরো টেবিলের জন্য Export Excel বা Export CSV ব্যবহার করুন।' } },
    ],
  },
  {
    id: 'settings', tab: { en: 'Settings', bn: 'সেটিংস' }, icon: Settings,
    heading: { en: 'Section F: Settings & Permissions', bn: 'সেকশন F: সেটিংস ও পারমিশন' },
    sub: { en: 'Control who can use courier management', bn: 'কে কুরিয়ার ম্যানেজমেন্ট ব্যবহার করতে পারবে তা নিয়ন্ত্রণ করুন' },
    cards: [
      { title: { en: 'Granting permission', bn: 'পারমিশন দেওয়া' },
        body: { en: 'Press Grant Permission, choose a user and tick the features they may reach. Revoke any time with the bin icon. Only granted users can open the rebuilt courier surface.',
          bn: 'Grant Permission চাপুন, ইউজার বাছুন এবং যেসব ফিচার ব্যবহার করতে পারবে সেগুলো টিক দিন। যেকোনো সময় বিন আইকন দিয়ে বাতিল করা যায়। শুধু অনুমোদিত ইউজাররাই নতুন কুরিয়ার সার্ফেস খুলতে পারবে।' } },
    ],
  },
];

const days = [
  { d: 'Day 1', cls: 'bg-[#dcf7e6] text-emerald-700', t: { en: 'First delivery attempt (new)', bn: 'প্রথম ডেলিভারি চেষ্টা (নতুন)' } },
  { d: 'Day 2', cls: 'bg-[#fdf0c3] text-amber-700', t: { en: 'Second day — follow-up needed', bn: 'দ্বিতীয় দিন — ফলো-আপ দরকার' } },
  { d: 'Day 3', cls: 'bg-[#fde0e4] text-red-700', t: { en: 'Third day — urgent, final attempt', bn: 'তৃতীয় দিন — জরুরি, শেষ চেষ্টা' } },
];
const dotLabels: [string, string][] = [['Not Called', '#e2dfe8'], ...OUTCOMES.map((o) => [o, outcomeColor[o]] as [string, string])];

export function GuideView() {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [active, setActive] = useState(sections[0].id);
  const t = (x: L) => x[lang];

  useEffect(() => {
    const go = () => { const id = window.location.hash.slice(1); if (id) { setActive(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, []);

  const card = 'border-ed-line rounded-xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]';

  return (
    <div className="mx-auto max-w-[806px] pt-8 pb-10">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/orders/courier-management" className="hover:text-ed-brand flex items-center gap-2.5 text-[13.5px]"><ArrowLeft className="size-4" /> {lang === 'en' ? 'Back to Parcels' : 'পার্সেলে ফিরে যান'}</Link>
        <button type="button" onClick={() => setLang((l) => (l === 'en' ? 'bn' : 'en'))} className="border-ed-line flex h-10 items-center gap-2.5 rounded-lg border bg-white px-4 text-[13.5px] shadow-sm"><Languages className="size-4" />{lang === 'en' ? 'বাংলা' : 'English'}</button>
      </div>

      <header className="mt-9 text-center">
        <h1 className="text-[26px] font-medium tracking-tight">{lang === 'en' ? 'Courier Management Guide' : 'কুরিয়ার ম্যানেজমেন্ট গাইড'}</h1>
        <p className="text-ed-text/70 mt-2.5 text-[14.5px]">{lang === 'en' ? 'Step-by-step guide for managing delivery assignments and return parcels' : 'ডেলিভারি অ্যাসাইনমেন্ট ও রিটার্ন পার্সেল ম্যানেজ করার ধাপে ধাপে গাইড'}</p>
        <nav className="mt-6 flex flex-wrap justify-center gap-2.5">
          {sections.map((s) => {
            const I = s.icon;
            return (
              <a key={s.id} href={`#${s.id}`} onClick={() => setActive(s.id)} className={cn('flex h-10 items-center gap-2.5 rounded-lg border px-4 text-[13.5px] shadow-sm transition', active === s.id ? 'border-ed-brand/30 bg-ed-brand-soft text-ed-brand' : 'border-ed-line hover:text-ed-brand bg-white')}><I className="size-4" />{t(s.tab)}</a>
            );
          })}
        </nav>
      </header>

      <section className={cn(card, 'mt-6 overflow-hidden')}>
        <div className="border-ed-line border-b px-6 py-5"><h2 className="text-[16px] font-medium">{lang === 'en' ? 'Visual Legend' : 'ভিজ্যুয়াল লেজেন্ড'}</h2><p className="text-ed-muted mt-1 text-[12.5px]">{lang === 'en' ? 'Understand the icons, badges, and tags used in the system' : 'সিস্টেমে ব্যবহৃত আইকন, ব্যাজ ও ট্যাগ বুঝে নিন'}</p></div>
        <div className="space-y-6 px-6 py-5">
          <div><p className="text-[13.5px] font-medium">{lang === 'en' ? 'Call Status Dots' : 'কল স্ট্যাটাস ডট'}</p><div className="text-ed-text/80 mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">{dotLabels.map(([l, c]) => <span key={l} className="flex items-center gap-2"><i className="size-2.5 rounded-full" style={{ background: c }} />{l}</span>)}</div></div>
          <div><p className="text-[13.5px] font-medium">{lang === 'en' ? 'Assignment Day Badges' : 'অ্যাসাইনমেন্ট ডে ব্যাজ'}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">{days.map((d) => <span key={d.d} className="flex items-center gap-2"><b className={cn('rounded-md px-2 py-0.5 text-[11.5px] font-normal', d.cls)}>{d.d}</b><span className="text-ed-text/70">{t(d.t)}</span></span>)}</div></div>
          <div><p className="text-[13.5px] font-medium">{lang === 'en' ? 'Parcel Tags' : 'পার্সেল ট্যাগ'}</p><div className="mt-3 flex flex-wrap gap-2">{[...systemTags.map((x) => x.name), SOLVED].map((n) => <span key={n} className={cn('rounded-full px-3 py-1 text-[11px] tracking-wide uppercase', tagCls(n))}>{n}</span>)}</div></div>
        </div>
      </section>

      {sections.map((s) => (
        <section key={s.id} id={s.id} className="mt-12 scroll-mt-6">
          <h2 className="text-[20px] font-medium">{t(s.heading)}</h2>
          <p className="text-ed-text/70 mt-2 text-[13.5px]">{t(s.sub)}</p>
          <div className="mt-4 space-y-4">
            {s.cards.map((c) => (
              <article key={c.title.en} className={card}>
                <h3 className="border-ed-line flex items-center gap-3 border-b px-6 py-4 text-[14.5px] font-medium"><s.icon className="size-4" />{t(c.title)}</h3>
                <p className="text-ed-text/75 px-6 py-5 text-[13.5px] leading-[1.7]">{t(c.body)}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
