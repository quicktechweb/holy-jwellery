'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FU_EMPLOYEES } from '@/lib/followupStore';
import { LangToggle, card, type Lang } from './ui';
import { RULES, type Rule, type Unit, type Who } from './rules';

const WHO: [Who, string][] = [['took', 'Person who took the order'], ['specific', 'A specific staff member'], ['web', 'Person assigned to web orders'], ['unassigned', 'Unassigned list']];
const IMPORTANCE = ['Low', 'Medium', 'High', 'Urgent'] as const;
const UNITS: Unit[] = ['minutes', 'hours', 'days'];

const field = 'border-ed-line focus:border-ed-brand/50 h-11 rounded-lg border bg-white px-3.5 text-[14.5px] outline-none';
const panel = 'bg-ed-bg/50 rounded-lg p-3.5';
const muted = 'text-ed-text/65 text-[14px] leading-relaxed';

interface RuleState { on: boolean; waitValue: number; waitUnit: Unit; finish: number; oldest: number; importance: Rule['importance']; who: Who; staff: string; skipPaid: boolean }
const initial = (r: Rule): RuleState => ({ on: false, waitValue: r.wait?.value ?? 0, waitUnit: r.wait?.unit ?? 'minutes', finish: r.finish, oldest: 7, importance: r.importance, who: r.who, staff: FU_EMPLOYEES[0]?.name ?? '', skipPaid: false });

export function WorkInboxSettings() {
  const [lang, setLang] = useState<Lang>('en');
  const [state, setState] = useState<Record<string, RuleState>>(() => Object.fromEntries(RULES.map((r) => [r.key, initial(r)])));
  const patch = (k: string, p: Partial<RuleState>) => setState((s) => ({ ...s, [k]: { ...s[k], ...p } }));

  return (
    <div className="mx-auto max-w-[1280px] pt-8 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] leading-tight font-medium tracking-tight">{lang === 'bn' ? 'ওয়ার্ক ইনবক্স সেটিংস' : 'Work Inbox Settings'}</h1>
        <LangToggle lang={lang} onChange={setLang} />
      </div>

      <section className={cn(card, 'mt-5 p-4')}>
        <h2 className="text-[18px] font-medium">What this page does</h2>
        <p className={cn(muted, 'mt-3 text-[14.5px]')}>Each rule below watches for one situation with your orders (like a return starting, or a parcel sitting too long). When a rule is on, EcomDrive automatically creates a task and gives it to the right person, so nothing slips through.</p>
        <p className="mt-3 text-[14.5px] font-medium">Every rule starts switched off. Nothing happens until an admin turns it on.</p>
        <p className={cn(muted, 'mt-3 text-[14.5px]')}>Turn on only the rules your team needs. When a rule is on, EcomDrive automatically creates a task for the right person whenever that situation happens.</p>
        <p className={cn(muted, 'mt-2 text-[14.5px]')}>For each rule you choose three things: when the task is created, who gets it, and how long they have to finish it.</p>
        <p className="bg-ed-bg/50 text-ed-text/80 mt-3 rounded-lg px-3.5 py-3 text-[14.5px]">EcomDrive checks your orders automatically in the background, about every 5 minutes. After you turn a rule on, the first tasks may take a few minutes to appear — that&apos;s normal.</p>
      </section>

      {RULES.map((r) => {
        const s = state[r.key];
        return (
          <section key={r.key} className={cn(card, 'mt-5 p-4')}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2.5 text-[18px] font-medium">
                  {r.title}
                  <span className={cn('rounded-md px-2 py-0.5 text-[12px] font-medium', s.on ? 'bg-emerald-100 text-emerald-700' : 'bg-ed-bg text-ed-text/70')}>{s.on ? 'On' : 'Off'}</span>
                </h2>
                <p className={cn(muted, 'mt-1.5 text-[14.5px]')}>{r.use}</p>
                <p className="text-ed-text/65 mt-3 text-[12.5px]">Right now</p>
                <p className={cn(muted, 'text-[14.5px]')}>{r.now}</p>
              </div>
              <button type="button" role="switch" aria-checked={s.on} onClick={() => patch(r.key, { on: !s.on })} className={cn('flex h-11 shrink-0 items-center gap-2 rounded-lg border px-4 text-[14.5px] transition-colors', s.on ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-ed-line hover:bg-ed-bg/60 bg-white')}>
                <SlidersHorizontal className="size-4" />{s.on ? 'On' : 'Off'}
              </button>
            </div>

            <div className="border-ed-line mt-4 grid gap-3 border-t pt-4 lg:grid-cols-4">
              {/* when */}
              <div className={panel}>
                {r.wait ? (
                  <>
                    <p className="text-[15px] font-medium">Create the task after waiting</p>
                    <div className="mt-3 flex gap-2">
                      <input type="number" min={0} value={s.waitValue} onChange={(e) => patch(r.key, { waitValue: Math.max(0, +e.target.value || 0) })} className={cn(field, 'w-[112px]')} />
                      <select value={s.waitUnit} onChange={(e) => patch(r.key, { waitUnit: e.target.value as Unit })} className={cn(field, 'w-[98px]')}>{UNITS.map((u) => <option key={u} value={u}>{u}</option>)}</select>
                    </div>
                    <p className={cn(muted, 'mt-3')}>{r.wait.text}</p>
                    <p className={cn(muted, 'mt-3')}>{r.now}</p>
                  </>
                ) : (
                  <>
                    <p className="text-[15px] font-medium">Created automatically</p>
                    <p className={cn(muted, 'mt-3')}>No waiting time needed. The task is created as soon as the order reaches this status (or at the scheduled callback time).</p>
                    <p className={cn(muted, 'mt-3')}>{r.now}</p>
                  </>
                )}
              </div>

              {/* finish */}
              <div className={panel}>
                <p className="text-[15px] font-medium">Time to finish</p>
                <div className="mt-3 flex items-center gap-2.5">
                  <input type="number" min={0} value={s.finish} onChange={(e) => patch(r.key, { finish: Math.max(0, +e.target.value || 0) })} className={cn(field, 'w-[112px]')} />
                  <span className={muted}>minutes to finish</span>
                </div>
                <p className={cn(muted, 'mt-3')}>How long the staff member has to finish the task before it is shown as overdue (late). This is separate from when the task is created.</p>
                <p className={cn(muted, 'mt-3')}>{r.finishNote}</p>
              </div>

              {/* oldest */}
              <div className={panel}>
                <p className="text-[15px] font-medium">Oldest orders to assign</p>
                <div className="mt-3 flex items-center gap-2.5">
                  <input type="number" min={1} value={s.oldest} onChange={(e) => patch(r.key, { oldest: Math.max(1, +e.target.value || 1) })} className={cn(field, 'w-[112px]')} />
                  <span className={muted}>days old</span>
                </div>
                <p className={cn(muted, 'mt-3')}>Older matching orders will be ignored automatically. Use this to avoid flooding employee inboxes with old backlog.</p>
              </div>

              {/* importance + who */}
              <div className={panel}>
                <p className="text-[15px] font-medium">Importance</p>
                <select value={s.importance} onChange={(e) => patch(r.key, { importance: e.target.value as Rule['importance'] })} className={cn(field, 'mt-3 w-full')}>{IMPORTANCE.map((i) => <option key={i} value={i}>{i}</option>)}</select>
                <p className="mt-4 text-[15px] font-medium">Who gets the task</p>
                <select value={s.who} onChange={(e) => patch(r.key, { who: e.target.value as Who })} className={cn(field, 'mt-3 w-full')}>{WHO.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                {s.who === 'specific' && (
                  <select value={s.staff} onChange={(e) => patch(r.key, { staff: e.target.value })} aria-label="Staff member" className={cn(field, 'mt-2 w-full')}>{FU_EMPLOYEES.map((e) => <option key={e.email} value={e.name}>{e.name}</option>)}</select>
                )}
                <p className={cn(muted, 'mt-3')}>{r.whoNote}</p>
              </div>
            </div>

            {r.skipPaid && (
              <label className="border-ed-line mt-3.5 flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3.5">
                <input type="checkbox" checked={s.skipPaid} onChange={() => patch(r.key, { skipPaid: !s.skipPaid })} className="mt-1 size-4" />
                <span>
                  <span className="block text-[15px]">Skip paid returns</span>
                  <span className={cn(muted, 'mt-0.5 block')}>When this is on, Pending_Return orders tagged as return with delivery charge will not create employee work.</span>
                </span>
              </label>
            )}

            <p className="mt-5 px-3 pb-2 text-[14.5px] text-[#e8890c]">Example: {r.example}</p>
          </section>
        );
      })}
    </div>
  );
}
