'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, PhoneCall, ShieldCheck, Workflow, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { card } from './ui';

interface Sec {
  title: string;
  icon?: LucideIcon;
  intro?: string;
  paras?: string[];
  bullets?: string[];
  steps?: string[];
  chips?: string[];
}
interface Copy {
  title: string;
  subtitle: string;
  language: string;
  back: string;
  secs: Sec[];
}

const chips = ['Rule Name', 'Order Type', 'Order Status', 'Schedule Type', 'Date', 'Time Slots', 'Custom Voices', 'Keypad Actions'];

const en: Copy = {
  title: 'Auto Call Rules Guide',
  subtitle: 'Step-by-step setup guide for scheduled status-based auto calls.',
  language: 'Language',
  back: 'Back to Auto Call Center',
  secs: [
    {
      title: '1) What Auto Call Rules Do',
      icon: BookOpen,
      paras: [
        'Auto Call Rules let you schedule automatic calls based on the current status of a Web Order or an Approved Order.',
        'At each selected time, the system checks which orders are in the selected status right then and sends calls only to matching numbers.',
        'Each rule can also define its own keypad actions and optional rule-level voice override for Auto Call Center.',
      ],
    },
    {
      title: '2) Before You Start',
      icon: ShieldCheck,
      paras: ['Make sure these are already set up first:', 'If integration is inactive, rules can be created but they will not dispatch calls successfully.'],
      bullets: [
        'Auto Call Center integration is active in the Setup tab.',
        'Your voice and DTMF settings are saved and tested.',
        'Your system setup is complete so scheduled rules can run automatically.',
      ],
    },
    {
      title: '3) How to Create a Rule',
      icon: Workflow,
      steps: [
        'Open Auto Call Center and go to the Rules tab.',
        'Click Create Rule.',
        'Fill in the required fields.',
        'Choose Web Order if the call should target web orders, or Approved Order if the call should target confirmed ecom orders.',
        'Choose one status and up to three time slots.',
        'Optionally enable Custom Voices For This Rule to replace the global Auto Call Center voices for that rule only.',
        'Optionally configure Keypad Actions for keys like 1 and 2.',
        'Save the rule and keep it active.',
      ],
      chips,
    },
    {
      title: '4) Schedule Types',
      icon: Clock,
      paras: [
        'Everyday: runs every day at the selected times.',
        'Today Only: runs only on the selected date at the selected times.',
        'Time matching uses Asia/Dhaka.',
      ],
    },
    {
      title: '5) Rule Voice Override',
      paras: [
        'By default, rules use the saved global Auto Call Center voices from the Setup tab.',
        'If you enable Custom Voices For This Rule, that rule will use its own question voice and DTMF option voices instead of the global ones.',
        'Rule voices must be selected from the approved voice library.',
      ],
    },
    {
      title: '6) Keypad Actions',
      icon: PhoneCall,
      paras: [
        'You can configure what happens when the customer presses keys like 1 or 2 for each rule.',
        'A single key can run multiple actions in sequence, like update status, then add tag, then create task.',
        'Web Order rules may include confirm actions.',
        'Approved Order rules cannot confirm again, but they can update approved-order status, add tag, send SMS, create task, and add note.',
      ],
    },
    {
      title: '7) Call Limit and Matching Rules',
      icon: PhoneCall,
      paras: [
        'Each rule uses a fixed limit of 3 calls.',
        'The system applies a global per-phone daily cap, so one number will not receive more than 3 rule-driven calls per Dhaka day even if multiple rules match.',
        'If the same phone appears in multiple matching orders in the same slot, the system keeps only one target for that slot.',
      ],
    },
    {
      title: '8) Important Behavior',
      paras: [
        'Rule-driven calls do not replace the existing manual Auto Call Center or the existing workflow-based Web Order auto-call flow.',
        'Those older flows stay active and continue using the legacy queue and finalizer logic.',
        'You can pause any rule at any time with the Rule Active switch.',
      ],
    },
  ],
};

const bn: Copy = {
  title: 'অটো কল রুলস গাইড',
  subtitle: 'শিডিউল করা স্ট্যাটাস-ভিত্তিক অটো কলের ধাপে ধাপে সেটআপ গাইড।',
  language: 'ভাষা',
  back: 'অটো কল সেন্টারে ফিরুন',
  secs: [
    {
      title: '১) অটো কল রুলস কী করে',
      icon: BookOpen,
      paras: [
        'অটো কল রুলস দিয়ে আপনি ওয়েব অর্ডার বা অ্যাপ্রুভড অর্ডারের বর্তমান স্ট্যাটাসের ওপর ভিত্তি করে স্বয়ংক্রিয় কল শিডিউল করতে পারেন।',
        'নির্বাচিত প্রতিটি সময়ে সিস্টেম দেখে কোন অর্ডারগুলো তখন নির্বাচিত স্ট্যাটাসে আছে এবং শুধু মিলে যাওয়া নম্বরে কল পাঠায়।',
        'প্রতিটি রুলে নিজস্ব কিপ্যাড অ্যাকশন এবং অটো কল সেন্টারের জন্য ঐচ্ছিক রুল-লেভেল ভয়েস ওভাররাইড সেট করা যায়।',
      ],
    },
    {
      title: '২) শুরু করার আগে',
      icon: ShieldCheck,
      paras: ['প্রথমে নিশ্চিত করুন নিচের বিষয়গুলো আগে থেকেই সেট করা আছে:', 'ইন্টিগ্রেশন নিষ্ক্রিয় থাকলে রুল তৈরি করা গেলেও কল সফলভাবে ডিসপ্যাচ হবে না।'],
      bullets: [
        'সেটআপ ট্যাবে অটো কল সেন্টার ইন্টিগ্রেশন সক্রিয় আছে।',
        'আপনার ভয়েস ও DTMF সেটিংস সেভ ও টেস্ট করা হয়েছে।',
        'আপনার সিস্টেম সেটআপ সম্পূর্ণ, যাতে শিডিউল করা রুল স্বয়ংক্রিয়ভাবে চলতে পারে।',
      ],
    },
    {
      title: '৩) কীভাবে রুল তৈরি করবেন',
      icon: Workflow,
      steps: [
        'অটো কল সেন্টার খুলে রুলস ট্যাবে যান।',
        'Create Rule ক্লিক করুন।',
        'প্রয়োজনীয় ফিল্ডগুলো পূরণ করুন।',
        'কল ওয়েব অর্ডারে হলে Web Order, নিশ্চিত করা ইকম অর্ডারে হলে Approved Order বেছে নিন।',
        'একটি স্ট্যাটাস এবং সর্বোচ্চ তিনটি টাইম স্লট বেছে নিন।',
        'চাইলে শুধু এই রুলের জন্য গ্লোবাল ভয়েসের বদলে Custom Voices For This Rule চালু করুন।',
        'চাইলে 1 ও 2 এর মতো কির জন্য কিপ্যাড অ্যাকশন কনফিগার করুন।',
        'রুল সেভ করুন এবং সক্রিয় রাখুন।',
      ],
      chips,
    },
    {
      title: '৪) শিডিউলের ধরন',
      icon: Clock,
      paras: [
        'Everyday: নির্বাচিত সময়গুলোতে প্রতিদিন চলে।',
        'Today Only: শুধু নির্বাচিত তারিখে নির্বাচিত সময়ে চলে।',
        'সময় মেলানো হয় Asia/Dhaka টাইমজোন অনুযায়ী।',
      ],
    },
    {
      title: '৫) রুল ভয়েস ওভাররাইড',
      paras: [
        'ডিফল্টভাবে রুলগুলো সেটআপ ট্যাবে সেভ করা গ্লোবাল অটো কল সেন্টার ভয়েস ব্যবহার করে।',
        'Custom Voices For This Rule চালু করলে ওই রুল গ্লোবাল ভয়েসের বদলে নিজস্ব প্রশ্নের ভয়েস ও DTMF অপশন ভয়েস ব্যবহার করবে।',
        'রুল ভয়েস অবশ্যই অনুমোদিত ভয়েস লাইব্রেরি থেকে বাছাই করতে হবে।',
      ],
    },
    {
      title: '৬) কিপ্যাড অ্যাকশন',
      icon: PhoneCall,
      paras: [
        'প্রতিটি রুলের জন্য কাস্টমার 1 বা 2 এর মতো কি চাপলে কী হবে তা আপনি ঠিক করতে পারেন।',
        'একটি কি একাধিক অ্যাকশন ক্রমানুসারে চালাতে পারে, যেমন স্ট্যাটাস আপডেট, তারপর ট্যাগ যোগ, তারপর টাস্ক তৈরি।',
        'ওয়েব অর্ডার রুলে কনফার্ম অ্যাকশন থাকতে পারে।',
        'অ্যাপ্রুভড অর্ডার রুল আবার কনফার্ম করতে পারে না, তবে অ্যাপ্রুভড-অর্ডার স্ট্যাটাস আপডেট, ট্যাগ যোগ, SMS পাঠানো, টাস্ক তৈরি ও নোট যোগ করতে পারে।',
      ],
    },
    {
      title: '৭) কল লিমিট ও ম্যাচিং নিয়ম',
      icon: PhoneCall,
      paras: [
        'প্রতিটি রুলে কল লিমিট নির্দিষ্ট ৩টি।',
        'সিস্টেম প্রতি ফোনের জন্য গ্লোবাল দৈনিক সীমা প্রয়োগ করে, তাই একাধিক রুল মিলে গেলেও ঢাকার একদিনে একটি নম্বরে ৩টির বেশি রুল-চালিত কল যাবে না।',
        'একই স্লটে একাধিক অর্ডারে একই ফোন নম্বর থাকলে সিস্টেম ওই স্লটের জন্য কেবল একটি টার্গেট রাখে।',
      ],
    },
    {
      title: '৮) গুরুত্বপূর্ণ আচরণ',
      paras: [
        'রুল-চালিত কল বিদ্যমান ম্যানুয়াল অটো কল সেন্টার বা বিদ্যমান ওয়ার্কফ্লো-ভিত্তিক ওয়েব অর্ডার অটো-কল ফ্লো প্রতিস্থাপন করে না।',
        'ওই পুরনো ফ্লোগুলো সক্রিয় থাকে এবং লিগ্যাসি কিউ ও ফাইনালাইজার লজিক ব্যবহার করে চলতে থাকে।',
        'Rule Active সুইচ দিয়ে যেকোনো সময় রুল থামিয়ে রাখতে পারেন।',
      ],
    },
  ],
};

export function RulesGuide() {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const c = lang === 'en' ? en : bn;
  return (
    <div className="mx-auto max-w-[992px] pt-6 pb-10">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-tight font-medium tracking-tight">{c.title}</h1>
          <p className="text-ed-muted mt-0.5 text-[14.5px]">{c.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="border-ed-line flex items-center gap-2 rounded-xl border bg-white p-1.5 pl-3 shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
            <span className="text-ed-muted text-[12.5px]">{c.language}</span>
            {(['en', 'bn'] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={cn('h-9 rounded-lg px-4 text-[14.5px] font-medium transition-colors', lang === l ? 'bg-ed-brand text-white' : 'text-ed-text/80 hover:text-ed-brand')}
              >
                {l === 'en' ? 'English' : 'বাংলা'}
              </button>
            ))}
          </div>
          <Link href="/dashboard/orders/auto-call?tab=Rules" className="border-ed-line hover:text-ed-brand flex h-12 items-center gap-2.5 rounded-xl border bg-white px-5 text-[14.5px] shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
            <ArrowLeft className="size-4" /> {c.back}
          </Link>
        </div>
      </header>

      <div className="space-y-4">
        {c.secs.map((s) => {
          const Icon = s.icon;
          return (
            <section key={s.title} className={cn(card, 'overflow-hidden')}>
              <h2 className="border-ed-line flex items-center gap-3 border-b px-6 py-3.5 text-[17px] font-medium max-sm:px-4">
                {Icon && <Icon className="size-5" strokeWidth={1.6} />}
                {s.title}
              </h2>
              <div className="space-y-3 px-6 py-4 text-[14.5px] leading-[1.45] max-sm:px-4">
                {s.paras?.slice(0, s.bullets ? 1 : undefined).map((p) => <p key={p}>{p}</p>)}
                {s.paras && s.bullets && <p>{s.paras[1]}</p>}
                {s.bullets && (
                  <ul className="list-disc space-y-1 pl-10">
                    {s.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                )}
                {s.steps?.map((t, i) => <p key={t}>{lang === 'en' ? i + 1 : '১২৩৪৫৬৭৮'[i]}. {t}</p>)}
                {s.chips && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {s.chips.map((x) => <span key={x} className="rounded-full bg-[#f1f0f5] px-3 py-1 text-[13px]">{x}</span>)}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
