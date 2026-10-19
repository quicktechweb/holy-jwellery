'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Activity, ChevronDown, ChevronRight, ClipboardCheck, HelpCircle, LayoutGrid, Radio, SlidersHorizontal, Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CallFilterBar } from './CallFilterBar';

const card = 'border-ed-line rounded-xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)]';
const empty = 'text-ed-muted rounded-xl border border-dashed border-[#d9d5e2] px-6 text-center text-[14.5px]';

const TABS = [
  ['team', 'Team', LayoutGrid],
  ['attention', 'Needs attention', Sparkles],
  ['review', 'Call review', ClipboardCheck],
  ['more', 'More reports', Users],
] as const;
type Tab = (typeof TABS)[number][0];

export function CallCenterReport() {
  const [tab, setTab] = useState<Tab>('team');
  const [more, setMore] = useState(false);

  // TODO: API — real call stats for the selected range/filters
  const stats = { total: 0, answered: 0, connected: 0, talk: '0s', attention: 0 };

  return (
    <div className="pt-8 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[32px] leading-tight font-medium tracking-tight">Call center report</h1>
          <p className="text-ed-muted mt-1 text-[14.5px]">See how your team is performing, and which calls need you today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/call-center/setup" className="border-ed-line hover:bg-ed-bg/60 flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[14.5px]"><SlidersHorizontal className="size-4" />Scoring setup</Link>
          <button type="button" className="border-ed-line hover:bg-ed-bg/60 flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[14.5px]"><HelpCircle className="size-4" />How this report works</button>
        </div>
      </div>

      <div className="mt-5"><CallFilterBar onChange={() => {}} /></div>

      <nav className="mt-5 flex flex-wrap gap-2">
        {TABS.map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={cn('flex h-10 items-center gap-2 rounded-lg px-3.5 text-[14.5px] transition-colors', tab === id ? 'border-ed-line border bg-[#f3f1f7] font-medium shadow-[0_1px_2px_rgba(30,20,50,0.06)]' : 'text-ed-text/80 hover:text-ed-brand')}>
            <Icon className="size-4" />{label}
          </button>
        ))}
      </nav>

      {tab !== 'team' ? (
        <div className={cn(empty, 'mt-5 py-14')}>Nothing to show for this range yet.</div>
      ) : (
        <>
          <div className="mt-5 grid max-w-[1228px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Total calls" value={String(stats.total)} />
            <Kpi label="Answered" value={`${stats.answered}%`} sub={`${stats.connected} connected`} />
            <Kpi label="Talk time" value={stats.talk} />
            <Kpi label="Needs attention" value={String(stats.attention)} sub="Calls to review" arrow />
          </div>

          <button type="button" onClick={() => setMore((m) => !m)} className="text-ed-muted hover:text-ed-text mt-4 flex items-center gap-1.5 text-[14.5px]"><ChevronDown className={cn('size-4 transition-transform', more && 'rotate-180')} />More numbers</button>
          {more && (
            <div className="mt-3 grid max-w-[1228px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi label="Missed calls" value="0" />
              <Kpi label="Outbound calls" value="0" />
              <Kpi label="Inbound calls" value="0" />
              <Kpi label="Avg call length" value="0s" />
            </div>
          )}

          <h2 className="mt-6 text-[18px] font-medium">Employee performance</h2>
          <p className="text-ed-muted mt-1 text-[14.5px]">Tap any row to see the employee rating, every enabled rule, all tags, and the calls behind the result. Tick employees to compare them.</p>
          <div className={cn(empty, 'mt-3 py-12')}>No employees have PBX activity for this range yet.</div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Panel icon={<Activity className="size-4" />} title="Call activity over time"><div className={cn(empty, 'py-[88px]')}>No calls found for the selected range.</div></Panel>
            <Panel icon={<Radio className="size-4" />} title="Who is online now"><div className={cn(empty, 'py-9')}>No team members are on the phone right now.</div></Panel>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, sub, arrow }: { label: string; value: string; sub?: string; arrow?: boolean }) {
  return (
    <div className={cn(card, 'p-5')}>
      <div className="text-ed-muted flex items-center justify-between text-[14.5px]">{label}{arrow && <ChevronRight className="size-4" />}</div>
      <div className="mt-2 text-[32px] leading-tight font-medium">{value}</div>
      {sub && <div className="text-ed-muted mt-1 text-[13px]">{sub}</div>}
    </div>
  );
}

function Panel({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className={card}>
      <h3 className="border-ed-line flex items-center gap-2 border-b px-6 py-4 text-[17px] font-medium"><span className="text-ed-muted">{icon}</span>{title}</h3>
      <div className="p-6">{children}</div>
    </section>
  );
}
