'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, BarChart3, ChevronDown, CreditCard, ExternalLink, GitBranch, Laptop, ListChecks, Phone, PhoneOutgoing, ShieldCheck, UserCog, UserRoundCheck, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FU_EMPLOYEES } from '@/lib/followupStore';

const card = 'border-ed-line rounded-xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)]';
const input = 'border-ed-line focus:border-ed-brand/50 h-11 w-full rounded-lg border bg-white px-3.5 text-[14.5px] outline-none';

const TABS = [
  ['pkg', '১. প্যাকেজ ও রিচার্জ', CreditCard],
  ['agents', '২. কল এজেন্ট', UserCog],
  ['group', '৩. কল গ্রুপ সেটিংস', GitBranch],
  ['mine', '৪. আমার সেটআপ', Laptop],
  ['missed', '৫. মিসড ও কলব্যাক', ListChecks],
  ['report', '৬. রিপোর্ট', BarChart3],
] as const;
type Tab = (typeof TABS)[number][0];

/** TODO: API — plans from VoiceDrive */
const PLANS = [
  { name: 'Micro', agents: 3, channels: 2, price: 350 },
  { name: 'Starter', agents: 6, channels: 3, price: 500 },
  { name: 'Growth - Best Seller', agents: 10, channels: 6, price: 1000 },
  { name: 'Business', agents: 20, channels: 10, price: 1500 },
  { name: 'Scale', agents: 40, channels: 15, price: 2100 },
  { name: 'Enterprise', agents: 0, channels: 0, price: 0 },
];
const EXTRA_AGENT = 100;
const EXTRA_CHANNEL = 150;

export function CallCenterSetup() {
  const [tab, setTab] = useState<Tab>('pkg');
  return (
    <div className="mx-auto max-w-[1248px] pt-8 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="flex items-center gap-3 text-[28px] leading-tight font-medium tracking-tight"><Phone className="size-7 text-emerald-600" strokeWidth={1.75} />VoiceDrive PBX</h1>
            <span className="border-ed-line rounded-md border bg-white px-2.5 py-1 text-[13px] shadow-sm">Powered by VoiceDrive</span>
          </div>
          <p className="text-ed-muted mt-2 text-[14.5px]">Manage PBX users, package purchase, prepaid outgoing call balance, softphone setup, ring groups, and routing from EcomDrive.</p>
        </div>
        <span className="rounded-full bg-[#0f172a] px-3.5 py-1 text-[12px] font-semibold tracking-wide text-white">UNAVAILABLE</span>
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-[#f2dd9b] bg-[#fffaeb] px-5 py-4 text-[#7a4a05]">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="text-[16px] font-medium">PBX is not available for this business yet</p>
          <p className="mt-0.5 text-[14.5px]">Contact Super Admin to enable VoiceDrive PBX. Once available, this page shows package purchase, prepaid outgoing call balance, user provisioning, and softphone setup.</p>
        </div>
      </div>

      <section className={cn(card, 'mt-5')}>
        <h2 className="border-ed-line border-b px-6 py-5 text-[18px] font-medium">How this PBX service works</h2>
        <div className="grid gap-6 px-6 py-5 text-[14.5px] md:grid-cols-3">
          {[
            ['1. Super Admin readies PBX', 'Super Admin enables the service for a business, sets caller ID or DID, and confirms the PBX bridge is ready.'],
            ['2. Business buys package', 'The PBX package controls a single concurrent seats/channels limit. Monthly package billing is separate from prepaid outgoing call balance.'],
            ['3. Users place calls', 'Outgoing calls reserve and settle prepaid balance inside EcomDrive. Incoming calls are free. Outgoing usage is charged by per-second pulse from the package rate per 60 seconds plus fixed 15% VAT.'],
          ].map(([t, d]) => (
            <div key={t}><p className="font-medium">{t}</p><p className="text-ed-muted mt-1.5 leading-relaxed">{d}</p></div>
          ))}
        </div>
      </section>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Stat label="লাইনের অবস্থা" icon={<Phone className="size-4 text-emerald-600" />}><span className="mt-3 inline-block rounded-full bg-[#4b5563] px-2.5 py-0.5 text-[13px] font-medium text-white">নিষ্ক্রিয় (Unavailable)</span></Stat>
        <Stat label="আউটগোয়িং কল ব্যালেন্স" icon={<CreditCard className="size-4 text-emerald-600" />}><p className="mt-2"><span className="text-[28px] font-medium text-emerald-600">0.00</span> <span className="text-ed-muted text-[14px]">টাকা (TK)</span></p></Stat>
        <Stat label="একই সাথে সক্রিয় এজেন্ট সীমা" icon={<UserRoundCheck className="size-4 text-emerald-600" />}><p className="mt-2"><span className="text-[28px] font-medium">0</span> <span className="text-ed-muted text-[14px]">জন</span></p></Stat>
      </div>

      <nav className="bg-ed-bg/70 mt-5 grid grid-cols-2 gap-1 rounded-xl p-1 md:grid-cols-6">
        {TABS.map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={cn('flex h-10 items-center justify-center gap-2 rounded-lg text-[14.5px] transition-colors', tab === id ? 'border-ed-line border bg-white font-medium shadow-sm' : 'text-ed-text/75 hover:text-ed-brand')}>
            <Icon className="size-4" />{label}
          </button>
        ))}
      </nav>

      <div className="mt-5">
        {tab === 'pkg' && <PackageTab />}
        {tab === 'agents' && <AgentsTab />}
        {tab === 'group' && <Notice solid>গ্রুপ কলিং এবং রুট সেটিংস ব্যবহার করতে হলে প্রথমে ভয়েস ড্রাইভ সেটআপ সচল করতে হবে।</Notice>}
        {tab === 'mine' && <Notice>আপনার জন্য কোনো ফোন লাইন এখনো বরাদ্দ করা হয়নি। অনুগ্রহ করে আপনার এডমিনকে বলুন আপনার ব্যবহারকারীকে একটি ডিভাইস নম্বর (Extension) বরাদ্দ দিতে।</Notice>}
        {tab === 'missed' && <Notice>মিসড কল ও কলব্যাক দেখতে প্রথমে ভয়েস ড্রাইভ সেটআপ সচল করতে হবে।</Notice>}
        {tab === 'report' && (
          <section className={card}>
            <header className="border-ed-line border-b px-6 py-5">
              <h2 className="flex items-center gap-2.5 text-[18px] font-medium"><BarChart3 className="size-[18px]" />PBX Reports</h2>
              <p className="text-ed-muted mt-1.5 text-[14.5px]">Agent calls, missed calls, call results, recordings, and live PBX status.</p>
            </header>
            <div className="p-6">
              <Link href="/dashboard/call-center/report" className="inline-flex h-11 items-center gap-2.5 rounded-lg bg-[#0f172a] px-5 text-[14.5px] font-medium text-white hover:opacity-90">রিপোর্ট খুলুন <ExternalLink className="size-4" /></Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className={cn(card, 'p-5')}>
      <div className="text-ed-muted flex items-center justify-between text-[14px]">{label}{icon}</div>
      {children}
    </div>
  );
}

function Notice({ children, solid }: { children: ReactNode; solid?: boolean }) {
  return <div className={cn('text-ed-text/90 rounded-xl border px-6 py-12 text-center text-[14.5px]', solid ? 'border-ed-line bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)]' : 'border-dashed border-[#d9d5e2]')}>{children}</div>;
}

function Head({ icon, title, sub, right }: { icon: ReactNode; title: string; sub: string; right?: ReactNode }) {
  return (
    <header className="border-ed-line flex flex-wrap items-start justify-between gap-3 border-b px-6 py-5">
      <div>
        <h2 className="flex items-center gap-2.5 text-[18px] font-medium">{icon}{title}</h2>
        <p className="text-ed-muted mt-1.5 text-[14.5px]">{sub}</p>
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </header>
  );
}

function Pill({ children, tone }: { children: ReactNode; tone?: 'green' }) {
  return <span className={cn('rounded-full border px-3 py-1 text-[13px]', tone === 'green' ? 'border-emerald-600 bg-emerald-600 font-medium text-white' : 'border-ed-line bg-white')}>{children}</span>;
}

/* ── 1. package & recharge ── */
function PackageTab() {
  const [plan, setPlan] = useState(PLANS[0].name);
  const [months, setMonths] = useState(1);
  const [exAgents, setExAgents] = useState(0);
  const [exCh, setExCh] = useState(0);
  const [amount, setAmount] = useState(500);
  const p = PLANS.find((x) => x.name === plan) ?? PLANS[0];
  const total = (p.price + exAgents * EXTRA_AGENT + exCh * EXTRA_CHANNEL) * months;

  return (
    <section className={card}>
      <Head icon={<PhoneOutgoing className="size-[18px] text-emerald-600" />} title="প্যাকেজ ক্রয় এবং আউটগোয়িং মিনিট রিচার্জ" sub="নিচ থেকে মাসিক প্যাকেজ কিনুন এবং আউটগোয়িং কলের ব্যালেন্স রিচার্জ করুন। ইনকামিং কল ফ্রি। সব মূল্য ভ্যাট সহ হিসাব করা।" />
      <div className="space-y-5 p-6 max-sm:p-4">
        <div className="flex items-center gap-3 rounded-lg border border-[#f2dd9b] bg-[#fffaeb] px-4 py-3 text-[14.5px] text-[#7a4a05]"><AlertTriangle className="size-4 shrink-0" />লাইনটি প্রস্তুত করার জন্য অনুগ্রহ করে সুপার এডমিনের সাথে যোগাযোগ করুন। লাইন সচল করার পর প্যাকেজ কেনা ও কল করা যাবে।</div>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <div className="border-ed-line rounded-xl border p-5">
            <h3 className="border-ed-line border-b pb-3 text-[16px] font-medium">১. মাসিক প্যাকেজ নবায়ন / পরিবর্তন</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PLANS.map((x) => (
                <button key={x.name} type="button" onClick={() => setPlan(x.name)} className={cn('rounded-lg border p-3 text-left text-[12.5px] leading-snug', plan === x.name ? 'border-ed-brand bg-ed-brand-soft/50' : 'border-ed-line hover:border-ed-brand/40')}>
                  <p className="text-[14px] font-medium">{x.name}</p>
                  {x.price ? (
                    <>
                      <p className="text-ed-muted mt-1">সর্বোচ্চ {x.agents} জন কলিং কর্মী • {x.channels}টি concurrent call</p>
                      <p className="text-ed-muted mt-1.5">{x.price} টাকা / মাস</p>
                      <p className="text-ed-muted">আউটগোয়িং ০.৪০ টাকা / ৬০ সেকেন্ড + ভ্যাট</p>
                    </>
                  ) : (
                    <>
                      <p className="text-ed-muted mt-1">Custom employee limit • Custom concurrent calls</p>
                      <p className="text-ed-muted mt-1.5">Custom pricing — সাপোর্টে যোগাযোগ করুন</p>
                    </>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block text-[13.5px] font-medium">প্যাকেজ নির্বাচন করুন
                <span className="relative mt-1.5 block">
                  <select value={plan} onChange={(e) => setPlan(e.target.value)} className={cn(input, 'appearance-none pr-9 font-normal')}>
                    {PLANS.filter((x) => x.price).map((x) => <option key={x.name} value={x.name}>{x.name} — {x.agents} জন / {x.channels}টি channel — {x.price} টাকা</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
                </span>
              </label>
              <label className="block text-[13.5px] font-medium">কয় মাসের জন্য
                <input type="number" min={1} value={months} onChange={(e) => setMonths(Math.max(1, +e.target.value || 1))} className={cn(input, 'mt-1.5 font-normal')} />
              </label>
            </div>
            <label className="mt-3 block text-[13.5px] font-medium">অতিরিক্ত কলিং কর্মী (যদি technically allowed হয়)
              <input type="number" min={0} value={exAgents} onChange={(e) => setExAgents(Math.max(0, +e.target.value || 0))} className={cn(input, 'mt-1.5 font-normal')} />
            </label>
            <label className="mt-3 block text-[13.5px] font-medium">অতিরিক্ত concurrent channel
              <input type="number" min={0} value={exCh} onChange={(e) => setExCh(Math.max(0, +e.target.value || 0))} className={cn(input, 'mt-1.5 font-normal')} />
            </label>
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] text-emerald-800">
              সর্বমোট সীমা: <b>{p.agents + exAgents} জন কলিং কর্মী</b> এবং <b>{p.channels + exCh}টি concurrent call</b>। অতিরিক্ত কর্মী {EXTRA_AGENT} টাকা/মাস এবং অতিরিক্ত channel {EXTRA_CHANNEL} টাকা/মাস।
            </p>
            <button type="button" disabled className="mt-4 h-11 w-full rounded-lg bg-emerald-600 text-[14.5px] font-medium text-white opacity-50">বিকাশ (bKash) দিয়ে {total} টাকা পরিশোধ করুন</button>
          </div>

          <div className="border-ed-line flex flex-col rounded-xl border p-5">
            <h3 className="border-ed-line border-b pb-3 text-[16px] font-medium">২. আউটগোয়িং কল ব্যালেন্স রিচার্জ <span className="text-ed-muted text-[14px] font-normal">(Top-up)</span></h3>
            <label className="mt-4 block text-[13.5px] font-medium">রিচার্জের পরিমাণ (টাকায়)
              <input type="number" min={100} value={amount} onChange={(e) => setAmount(+e.target.value || 0)} className={cn(input, 'mt-1.5 font-normal')} />
            </label>
            <ul className="bg-ed-bg/70 mt-4 list-disc space-y-1.5 rounded-lg py-3.5 pr-4 pl-8 text-[12.5px] leading-relaxed">
              <li>শুধু আউটগোয়িং কলের খরচ ব্যবহৃত সেকেন্ড অনুযায়ী কাটা হবে।</li>
              <li>সব package-এ ০.৪০ টাকা / ৬০ সেকেন্ড; ১-সেকেন্ড pulse-এ হিসাব হবে। এর সাথে ১৫% ভ্যাট যুক্ত হবে (৬০ সেকেন্ডে মোট ০.৪৬ টাকা)।</li>
              <li>ইনকামিং কলের জন্য কোনো মিনিট চার্জ নেই।</li>
              <li>সর্বনিম্ন ১০০ টাকা রিচার্জ করা যাবে।</li>
            </ul>
            <button type="button" disabled className="mt-auto h-11 w-full rounded-lg bg-[#3b6cf2] pt-0 text-[14.5px] font-medium text-white opacity-50">বিকাশ (bKash) দিয়ে {amount} টাকা রিচার্জ করুন</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 2. call agents ── */
function Toggle({ on, onChange, disabled }: { on: boolean; onChange?: () => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={onChange} className={cn('relative h-7 w-12 shrink-0 rounded-full transition', on ? 'bg-ed-brand' : 'bg-[#e4e1ea]', disabled && 'opacity-60')}>
      <span className={cn('absolute top-0.5 size-6 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

function AgentsTab() {
  const [days, setDays] = useState('15');
  const [adv, setAdv] = useState(false);
  const [opts, setOpts] = useState({ browser: true, record: true, auto: true, manual: false });
  const flip = (k: keyof typeof opts) => setOpts((o) => ({ ...o, [k]: !o[k] }));
  const [allowed, setAllowed] = useState<Record<string, boolean>>({});

  const cards: [keyof typeof opts, string, string][] = [
    ['browser', 'ব্রাউজার থেকে সরাসরি কল', 'এজেন্টদেরকে সরাসরি ব্রাউজার বা ড্যাশবোর্ড থেকে কল করার সুবিধা দিতে এটি সচল রাখুন।'],
    ['record', 'কল রেকর্ড চালু রাখুন (Record Calls)', 'সব এজেন্টের সকল কল রেকর্ড করে রাখতে এবং পরবর্তীতে শোনার জন্য এটি সচল রাখুন।'],
    ['auto', 'স্বয়ংক্রিয় ফোন লাইন সেটাআপ (Auto Line Setup)', 'এজেন্টদের জন্য স্বয়ংক্রিয়ভাবে ফোনের লাইন রেডি করতে এটি সচল রাখুন।'],
    ['manual', 'ম্যানুয়াল ডায়াল', 'গ্লোবাল PBX উইজেট থেকে হাতে নম্বর লিখে কল করার সুবিধা চালু করুন।'],
  ];

  return (
    <section className={card}>
      <Head
        icon={<Phone className="size-[18px] text-emerald-600" />}
        title="কল এজেন্ট ও ফোন লাইন সেটিংস"
        sub="আপনার কল সেন্টারের কোন কোন এজেন্ট ফোন কল রিসিভ করতে পারবে তা এখান থেকে সিলেক্ট করুন।"
        right={<><Pill>{FU_EMPLOYEES.length} জন মোট এজেন্ট</Pill><Pill>0/0 জন সক্রিয় এজেন্ট</Pill><Pill tone="green">0 জন প্রস্তুত</Pill></>}
      />
      <div className="space-y-5 p-6 max-sm:p-4">
        <label className="block text-[14px]">Business DID
          <input readOnly value="সেট করা নেই" className={cn(input, 'bg-ed-bg/60 mt-2 max-w-[592px]')} />
        </label>
        <button type="button" onClick={() => setAdv((a) => !a)} className="border-ed-line flex h-11 w-full items-center gap-2 rounded-lg border px-4 text-left text-[14px]">উন্নত সেটিংস দেখুন <span className="text-ed-muted">(Advanced Configuration)</span><ChevronDown className={cn('size-4 transition-transform', adv && 'rotate-180')} /></button>
        {adv && <div className="border-ed-line text-ed-muted rounded-lg border border-dashed px-4 py-6 text-center text-[13.5px]">উন্নত কনফিগারেশন সুপার এডমিন সচল করার পর পাওয়া যাবে।</div>}

        <label className="block text-[14px]">কল কত দিনের ওয়েব অর্ডারের সাথে মেলানো হবে
          <input type="number" value={days} onChange={(e) => setDays(e.target.value)} className={cn(input, 'bg-ed-bg/60 mt-2 max-w-[594px]')} />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          {cards.map(([k, t, d]) => (
            <div key={k} className="border-ed-line flex items-center justify-between gap-4 rounded-lg border px-4 py-4">
              <div><p className="text-[14.5px]">{t}</p><p className="text-ed-muted mt-1 text-[12.5px]">{d}</p></div>
              <Toggle on={opts[k]} onChange={() => flip(k)} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="h-11 rounded-lg bg-emerald-600 px-5 text-[14.5px] font-medium text-white hover:opacity-90">সেটিংস সংরক্ষণ করুন</button>
          <button type="button" disabled className="border-ed-line text-ed-muted h-11 rounded-lg border px-5 text-[14.5px] opacity-70">এজেন্টদের ফোন লাইন চালু করুন</button>
          <button type="button" disabled className="border-ed-line text-ed-muted h-11 rounded-lg border px-5 text-[14.5px] opacity-70">লাইন রিফ্রেশ করুন</button>
        </div>

        <div className="border-ed-line overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[900px] text-left text-[14px]">
            <thead>
              <tr className="border-ed-line border-b">
                {['কল সুবিধা দিন', 'এজেন্টের নাম ও বিবরণ', 'এজেন্টের নম্বর', 'ম্যানুয়াল কল', 'লাইনের অবস্থা', 'সংযোগ অবস্থা'].map((h) => <th key={h} className="px-4 py-3.5 text-[14.5px] font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {FU_EMPLOYEES.map((e) => (
                <tr key={e.email} className="border-ed-line border-b last:border-0">
                  <td className="px-4 py-4"><label className="flex items-center gap-2"><input type="checkbox" checked={!!allowed[e.email]} onChange={() => setAllowed((a) => ({ ...a, [e.email]: !a[e.email] }))} className="size-4" />{allowed[e.email] ? 'চালু' : 'বন্ধ'}</label></td>
                  <td className="px-4 py-4"><p>{e.name}</p><p className="text-ed-muted text-[13px]">{e.email}</p></td>
                  <td className="text-ed-muted px-4 py-4 text-[13px]">মোবাইল / ডেস্ক অ্যাপ -<br />ব্রাউজার ফোন -</td>
                  <td className="px-4 py-4"><span className="flex items-center gap-2"><Toggle on={false} disabled /><span className="text-ed-muted">বন্ধ</span></span></td>
                  <td className="px-4 py-4"><span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[13px] text-amber-700">অপ্রস্তুত</span></td>
                  <td className="px-4 py-4"><span className="text-ed-muted flex items-center gap-2"><Wifi className="size-4 opacity-50" />অফলাইন (Offline)</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
