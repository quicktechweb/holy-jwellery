'use client';

import { useState } from 'react';
import { AlertTriangle, ListChecks, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LangToggle, Stat, WORK_ITEMS, card, chip, type Lang } from './ui';

const BN: Record<string, string> = {
  'Work Control Center': 'ওয়ার্ক কন্ট্রোল সেন্টার', Open: 'ওপেন', Unassigned: 'অ্যাসাইন হয়নি', Overdue: 'ওভারডিউ', 'Due today': 'আজকের ডিউ', 'No tasks': 'কোনো কাজ নেই',
};
type Tab = 'open' | 'today' | 'overdue' | 'unassigned';
const TABS: [Tab, string][] = [['open', 'Open'], ['today', 'Due today'], ['overdue', 'Overdue'], ['unassigned', 'Unassigned']];

export function WorkControl() {
  const [lang, setLang] = useState<Lang>('en');
  const t = (k: string) => (lang === 'bn' ? BN[k] ?? k : k);
  const [tab, setTab] = useState<Tab>('open');

  const today = new Date().toISOString().slice(0, 10);
  const open = WORK_ITEMS.filter((w) => w.status !== 'done');
  const rows = open.filter((w) => (tab === 'open' ? true : tab === 'today' ? w.due === today : tab === 'overdue' ? w.due < today : !w.assignee));

  return (
    <div className="mx-auto max-w-[1280px] pt-8 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] leading-tight font-medium tracking-tight">{t('Work Control Center')}</h1>
        <LangToggle lang={lang} onChange={setLang} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Stat label={t('Open')} value={open.length} icon={<ListChecks className="size-5" />} />
        <Stat label={t('Unassigned')} value={open.filter((w) => !w.assignee).length} icon={<UserPlus className="size-5" />} />
        <Stat label={t('Overdue')} value={WORK_ITEMS.length ? open.filter((w) => w.due < today).length : '-'} icon={<AlertTriangle className="size-5" />} />
      </div>

      <nav className={cn(card, 'mt-5 flex flex-wrap gap-2 p-3.5')}>
        {TABS.map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={chip(tab === k)}>{t(l)}</button>)}
      </nav>

      <section className={cn(card, 'mt-5')}>
        {rows.length === 0 ? (
          <p className="text-ed-muted px-6 py-[38px] text-center text-[14.5px]">{t('No tasks')}</p>
        ) : (
          <ul>
            {rows.map((w) => (
              <li key={w.id} className="border-ed-line flex items-center justify-between gap-3 border-b px-5 py-4 text-[14.5px] last:border-0">
                <div className="min-w-0"><p className="truncate font-medium">{w.title}</p><p className="text-ed-muted truncate text-[13px]">{w.customer} · {w.phone} · {w.reason}</p></div>
                <span className="text-ed-muted shrink-0 text-[13px]">{w.assignee ?? 'Unassigned'} · {w.due}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
