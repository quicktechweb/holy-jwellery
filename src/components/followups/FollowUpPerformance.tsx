'use client';

import { BarChart3, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock, Crosshair, MoreHorizontal, Package, ShoppingCart, Sparkles, Trophy, Users, Wallet } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FU_EMPLOYEES, useFollowUps, type Assignment } from '@/lib/followupStore';
import { CustomerReport } from './CustomerReport';
import { card, th } from './ui';

/* ── date helpers ── */
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

type Preset = 'today' | 'yest' | '7d' | '30d' | 'month' | 'lastmonth' | 'year' | 'lastyear' | 'lifetime' | 'date' | 'custom';
interface Range { from?: string; to?: string; label: string }

function rangeOf(p: Preset, offset: number, a: string, b: string): Range {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const span = (days: number, end: Date): Range => {
    const e = addDays(end, offset * days);
    const s = addDays(e, -(days - 1));
    return { from: iso(s), to: iso(e), label: days === 1 ? iso(e) : `${iso(s)} → ${iso(e)}` };
  };
  switch (p) {
    case 'today': return span(1, t);
    case 'yest': return span(1, addDays(t, -1));
    case '7d': return span(7, t);
    case '30d': return span(30, t);
    case 'month': case 'lastmonth': {
      const base = new Date(t.getFullYear(), t.getMonth() - (p === 'lastmonth' ? 1 : 0) + offset, 1);
      const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      return { from: iso(base), to: iso(end), label: base.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
    }
    case 'year': case 'lastyear': {
      const y = t.getFullYear() - (p === 'lastyear' ? 1 : 0) + offset;
      return { from: `${y}-01-01`, to: `${y}-12-31`, label: String(y) };
    }
    case 'date': return { from: a, to: a, label: a };
    case 'custom': return { from: a || undefined, to: b || undefined, label: `${a || '…'} → ${b || '…'}` };
    default: return { label: 'Lifetime' };
  }
}

const QUICK: [Preset, string][] = [['today', 'Today'], ['yest', 'Yest.'], ['7d', '7D'], ['30d', '30D']];
const EXT: [Preset, string][] = [['month', 'This month'], ['lastmonth', 'Last month'], ['year', 'This year'], ['lastyear', 'Last year'], ['lifetime', 'Lifetime']];

/** TODO: API. Owned customers (relationship owner) baseline per employee */
const OWNED: Record<string, number> = { 'mahima N': 2769, 'Md. Eamin': 1112, 'Shakib N': 2270, 'Smita E': 5370 };
const ORDER = ['mahima N', 'Md. Eamin', 'Shakib N', 'Smita E'];

/* ── small UI ── */
function Dd({ value, options, onChange, w }: { value: string; options: string[]; onChange: (v: string) => void; w: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const d = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', d); return () => document.removeEventListener('mousedown', d); }, []);
  return (
    <div ref={ref} className={cn('relative', w)}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="border-ed-line flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3.5 text-[14.5px]">{value}<ChevronDown className="size-4" /></button>
      {open && <ul className="border-ed-line absolute z-30 mt-1 w-full rounded-lg border bg-white p-1 shadow-lg">{options.map((o) => <li key={o}><button type="button" onClick={() => { onChange(o); setOpen(false); }} className={cn('w-full rounded-md px-3 py-2 text-left text-[13.5px] hover:bg-[#f4eef8]', o === value && 'bg-[#f4eef8] font-medium')}>{o}</button></li>)}</ul>}
    </div>
  );
}

function Mini({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: string; tone?: string }) {
  return (
    <div className={cn(card, 'p-3.5')}>
      <div className="text-ed-text/70 text-[11px] tracking-wide uppercase">{label}</div>
      <div className={cn('mt-1 text-[22px] leading-tight font-semibold', tone)}>{value}</div>
      {sub && <div className={cn('mt-0.5 text-[11.5px]', tone === 'text-[#16a34a]' || tone === 'text-[#d97706]' ? tone : 'text-ed-muted')}>{sub}</div>}
    </div>
  );
}
function Big({ label, value, sub, icon, tone }: { label: string; value: ReactNode; sub: string; icon: ReactNode; tone?: string }) {
  return (
    <div className={cn(card, 'p-5')}>
      <div className="flex items-start justify-between"><span className={cn('text-[12.5px] tracking-wide uppercase', tone ?? 'text-ed-text/80')}>{label}</span><span className={tone ?? 'text-ed-text/70'}>{icon}</span></div>
      <div className={cn('mt-3 text-[34px] leading-none font-semibold', tone)}>{value}</div>
      <div className="text-ed-muted mt-3 text-[13px]">{sub}</div>
    </div>
  );
}
const H = ({ t, s }: { t: string; s: string }) => <div className="mt-8 mb-3"><h2 className="text-[16px] font-semibold">{t}</h2><p className="text-ed-muted text-[12.5px]">{s}</p></div>;
const Panel = ({ t, s, children }: { t: string; s: string; children: ReactNode }) => (
  <div className={card}><div className="border-ed-line border-b p-5"><h3 className="text-[17px] font-medium">{t}</h3><p className="text-ed-muted text-[13.5px]">{s}</p></div>{children}</div>
);
const money = (n: number) => `৳${n.toLocaleString('en-US')}`;
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : '—');

const TABS = [['perf', 'Performance', BarChart3], ['report', 'Customer Report', Users], ['expense', 'Follow-up Expense', Wallet], ['emp', 'Employee Performance', Trophy]] as const;

export function FollowUpPerformance() {
  const { assignments } = useFollowUps();
  const [preset, setPreset] = useState<Preset>('today');
  const [offset, setOffset] = useState(0);
  const [a, setA] = useState(iso(new Date()));
  const [b, setB] = useState(iso(new Date()));
  const [more, setMore] = useState(false);
  const [timeOn, setTimeOn] = useState(false);
  const [emp, setEmp] = useState('All employees');
  const [kind, setKind] = useState('All follow-ups');
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('perf');
  const moreRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const d = (e: MouseEvent) => { if (!moreRef.current?.contains(e.target as Node)) setMore(false); }; document.addEventListener('mousedown', d); return () => document.removeEventListener('mousedown', d); }, []);

  const range = useMemo(() => rangeOf(preset, offset, a, b), [preset, offset, a, b]);
  const pick = (p: Preset) => { setPreset(p); setOffset(0); if (p !== 'date' && p !== 'custom') setMore(false); };
  const shiftable = preset !== 'lifetime' && preset !== 'date' && preset !== 'custom';

  /** filtered follow-ups: all current ones are Order follow-ups */
  const rows: Assignment[] = useMemo(() => assignments.filter((x) =>
    (!range.from || x.assignedAt >= range.from) && (!range.to || x.assignedAt <= range.to)
    && (emp === 'All employees' || x.employee === emp)
    && (kind === 'All follow-ups' || kind === 'Order follow-ups')), [assignments, range, emp, kind]);

  const emps = ORDER.filter((n) => emp === 'All employees' || n === emp);
  const per = (n: string) => {
    const r = rows.filter((x) => x.employee === n);
    const done = r.filter((x) => x.progress === 'Completed').length;
    const inprog = r.filter((x) => x.progress === 'In Progress').length;
    const pend = r.filter((x) => x.progress === 'Pending').length;
    return { r, done, inprog, pend, open: pend + inprog, worked: done + inprog, owned: (OWNED[n] ?? 0) + assignments.filter((x) => x.employee === n && x.relationshipOwner).length };
  };
  const worked = rows.filter((x) => x.progress !== 'Pending').length;
  const done = rows.filter((x) => x.progress === 'Completed').length;
  const pend = rows.filter((x) => x.progress === 'Pending').length;
  const inprog = rows.filter((x) => x.progress === 'In Progress').length;
  const high = rows.filter((x) => x.priority === 'HIGH' || x.priority === 'URGENT').length;
  const completion = rows.length ? Math.round((done / rows.length) * 100) : 0;
  const ordersTaken = 0, delivered = 0, sales = 0, profit = 0; // TODO: API (orders created from follow-ups)
  const contactable = rows.filter((x) => x.progress !== 'Pending');

  return (
    <div className="pt-8 pb-10">
      <h1 className="text-[32px] leading-tight font-semibold tracking-tight">Follow-up Performance</h1>
      <p className="text-ed-text/70 mt-1 text-[17px]">How follow-ups assigned in this range were worked, how customers responded, and how many became orders.</p>

      <div className="mt-5 flex flex-wrap items-start gap-3">
        <div className="border-ed-line flex items-center gap-1 rounded-lg border bg-white p-1">
          <button type="button" disabled={!shiftable} aria-label="Previous period" onClick={() => setOffset((o) => o - 1)} className="flex size-9 items-center justify-center rounded-md hover:bg-[#f4eef8] disabled:opacity-40"><ChevronLeft className="size-4" /></button>
          {offset < 0 && <button type="button" aria-label="Next period" onClick={() => setOffset((o) => o + 1)} className="flex size-9 items-center justify-center rounded-md hover:bg-[#f4eef8]"><ChevronRight className="size-4" /></button>}
          {QUICK.map(([id, l]) => <button key={id} type="button" onClick={() => pick(id)} className={cn('h-9 rounded-md px-3 text-[13.5px] font-medium', preset === id ? 'bg-ed-brand text-white shadow' : 'text-ed-text/75 hover:bg-[#f4eef8]')}>{l}</button>)}
          <div ref={moreRef} className="relative">
            <button type="button" aria-label="More ranges" onClick={() => setMore((o) => !o)} className={cn('border-ed-line ml-1 flex h-9 w-11 items-center justify-center rounded-md border', !QUICK.some(([id]) => id === preset) && 'bg-ed-brand border-transparent text-white')}><MoreHorizontal className="size-4" /></button>
            {more && (
              <div className="border-ed-line absolute left-0 z-30 mt-2 w-[220px] rounded-xl border bg-white p-2 shadow-xl">
                <div className="text-ed-muted px-3 py-1.5 text-[10.5px] font-semibold tracking-wide uppercase">Extended range</div>
                {EXT.map(([id, l]) => <button key={id} type="button" onClick={() => pick(id)} className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[14px] hover:bg-[#f4eef8]', preset === id && 'bg-[#f4eef8] font-medium')}>{id === 'lifetime' ? <Sparkles className="size-4" /> : <CalendarDays className="size-4" />}{l}</button>)}
                <div className="border-ed-line mt-1 border-t pt-1">
                  <div className="text-ed-muted px-3 py-1.5 text-[10.5px] font-semibold tracking-wide uppercase">Custom</div>
                  <button type="button" onClick={() => pick('date')} className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[14px] hover:bg-[#f4eef8]', preset === 'date' && 'bg-[#f4eef8] font-medium')}><CalendarDays className="size-4" />Select a date</button>
                  <button type="button" onClick={() => pick('custom')} className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[14px] hover:bg-[#f4eef8]', preset === 'custom' && 'bg-[#f4eef8] font-medium')}><CalendarDays className="size-4" />Custom range</button>
                  {preset === 'date' && <input style={{ outline: 'none' }} type="date" value={a} onChange={(e) => setA(e.target.value)} className="border-ed-line mx-3 my-1.5 h-9 w-[calc(100%-1.5rem)] rounded-md border px-2 text-[13px]" />}
                  {preset === 'custom' && <div className="space-y-1.5 px-3 py-1.5"><input style={{ outline: 'none' }} type="date" value={a} onChange={(e) => setA(e.target.value)} className="border-ed-line h-9 w-full rounded-md border px-2 text-[13px]" /><input style={{ outline: 'none' }} type="date" value={b} min={a} onChange={(e) => setB(e.target.value)} className="border-ed-line h-9 w-full rounded-md border px-2 text-[13px]" /></div>}
                </div>
                <div className="border-ed-line mt-1 flex items-center justify-between border-t px-3 pt-2.5 pb-1.5">
                  <span className="text-ed-muted flex items-center gap-2 text-[10.5px] font-semibold tracking-wide uppercase"><Clock className="size-3.5" />Custom time</span>
                  <button type="button" role="switch" aria-checked={timeOn} onClick={() => setTimeOn((t) => !t)} className={cn('relative h-6 w-11 rounded-full transition', timeOn ? 'bg-ed-brand' : 'bg-[#e4e1ea]')}><span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', timeOn ? 'left-[22px]' : 'left-0.5')} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Dd w="w-[200px]" value={emp} options={['All employees', ...FU_EMPLOYEES.map((e) => e.name)]} onChange={setEmp} />
        <Dd w="w-[200px]" value={kind} options={['All follow-ups', 'Order follow-ups', 'Customer follow-ups']} onChange={setKind} />
        <span className="text-ed-muted self-center text-[13px]">{range.label}</span>
      </div>
      <p className="text-ed-text/75 mt-3 text-[13px]">Counts follow-ups <b>assigned</b> in this range; orders they produce may arrive later, so a very recent range understates the booking rate. Order and Customer follow-ups convert at structurally different rates — filter above to compare them fairly.</p>

      <nav className="mt-4 flex flex-wrap gap-2">
        {TABS.map(([id, l, Icon]) => <button key={id} type="button" onClick={() => setTab(id)} className={cn('flex h-10 items-center gap-2 rounded-lg px-3.5 text-[14.5px] font-medium', tab === id ? 'bg-[#efeaf5] shadow-[inset_0_0_0_1px_#ddd3e8]' : 'text-ed-text/75 hover:bg-[#f4eef8]')}><Icon className="size-4" />{l}</button>)}
      </nav>

      {tab === 'perf' && (
        <>
          <H t="Lead board" s="Who carries how many leads now, and what they did in this range." />
          <div className={cn(card, 'overflow-x-auto')}>
            <table className="w-full min-w-[1000px] text-left text-[14.5px]">
              <thead><tr className="border-ed-line border-b">{['Employee', 'Open follow-ups', 'Assigned customers', 'Owned customers', 'Worked', 'Orders', 'Order amount', 'Delivered', 'Delivered amount', 'Delivery rate'].map((h, i) => <th key={h} className={cn(th, 'py-4 text-[14px]', i > 0 && 'text-center')}>{h}</th>)}</tr></thead>
              <tbody>
                {emps.map((n) => { const p = per(n); return (
                  <tr key={n} className="border-ed-line border-b last:border-0 hover:bg-[#faf9fc]">
                    <td className="px-4 py-4">{n}</td>
                    {[p.open, p.r.length, p.owned.toLocaleString('en-US'), p.worked, 0, 0, 0, 0].map((v, i) => <td key={i} className="px-4 text-center">{v}</td>)}
                    <td className="px-4 text-center">—</td>
                  </tr>); })}
              </tbody>
            </table>
          </div>

          <H t="Outcome" s="What the work in this range produced." />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <Mini label="Worked" value={worked} sub="Follow-ups touched in this range" />
            <Mini label="Completion" value={`${completion}%`} sub="Target 40%" tone={completion >= 40 ? 'text-[#16a34a]' : 'text-[#d97706]'} />
            <Mini label="Orders taken" value={ordersTaken} />
            <Mini label="Orders delivered" value={delivered} sub="No orders yet" />
            <Mini label="Sales" value={money(sales)} tone="text-[#16a34a]" />
            <Mini label="Profit" value={money(profit)} tone="text-[#16a34a]" />
          </div>

          <H t="Conversion" s="How assigned follow-ups turned into orders." />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Big label="Assigned" value={rows.length} sub="Follow-ups handed out in this range" icon={<Users className="size-5" />} />
            <Big label="Orders created" value={ordersTaken} sub="Orders taken from these follow-ups" icon={<ShoppingCart className="size-5" />} />
            <Big label="Follow-ups that became orders" value={`${ordersTaken} of ${rows.length}`} sub={`${pct(ordersTaken, rows.length) === '—' ? '0%' : pct(ordersTaken, rows.length)} booking rate`} icon={<Crosshair className="size-5" />} tone="text-[#059669]" />
            <Big label="Orders that reached the customer" value={`${delivered} of ${ordersTaken}`} sub="0% delivery rate" icon={<Package className="size-5" />} />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Panel t="Reach" s={`of ${rows.length} assigned`}>
              {rows.length === 0 ? <p className="text-ed-text/80 py-8 text-center text-[14.5px]">No follow-ups were assigned in this range.</p> : (
                <ul className="space-y-2.5 p-5 text-[14px]">{[['Reached', contactable.length], ['Not reached yet', pend]].map(([l, v]) => <li key={l as string} className="flex justify-between"><span>{l}</span><b>{v} · {pct(v as number, rows.length)}</b></li>)}</ul>)}
            </Panel>
            <Panel t="Customer response" s={`of ${contactable.length} connected`}>
              {contactable.length === 0 ? <p className="text-ed-text/80 py-8 text-center text-[14.5px]">No calls connected in this range.</p> : (
                <ul className="space-y-2.5 p-5 text-[14px]">{[['In conversation', inprog], ['Finished', done]].map(([l, v]) => <li key={l as string} className="flex justify-between"><span>{l}</span><b>{v} · {pct(v as number, contactable.length)}</b></li>)}</ul>)}
            </Panel>
            <Panel t="Result" s={`of ${contactable.length} connected`}>
              {contactable.length === 0 ? <p className="text-ed-text/80 py-8 text-center text-[14.5px]">No calls connected in this range.</p> : (
                <ul className="space-y-2.5 p-5 text-[14px]">{[['Became orders', ordersTaken], ['No order', contactable.length - ordersTaken]].map(([l, v]) => <li key={l as string} className="flex justify-between"><span>{l}</span><b>{v} · {pct(v as number, contactable.length)}</b></li>)}</ul>)}
            </Panel>
          </div>

          <H t="Workload" s="The shape of what was assigned in this range." />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <Mini label="Assigned" value={rows.length} />
            <Mini label="Pending" value={pend} />
            <Mini label="In progress" value={inprog} />
            <Mini label="Completed" value={done} tone="text-[#16a34a]" />
            <Mini label="High priority" value={high} />
            <Mini label="Past schedule" value={0} sub="Avg close 0h" />
          </div>

          <H t="By employee — outcome" s="Volume and money, per agent." />
          <Panel t="Employee performance" s="Pending and In Progress show current open workload. “Assigned” here is who owns a follow-up now, not who worked it — after a reassignment those differ. See Team Performance for results credited to the employee who actually did the work.">
            <EmpTable rows={emps.map((n) => ({ n, p: per(n) })).filter((x) => x.p.r.length)} cols={['Assigned', 'Pending', 'In progress', 'Completed', 'Orders', 'Sales']} get={(p) => [p.r.length, p.pend, p.inprog, p.done, 0, money(0)]} empty="No data available for the selected period" />
          </Panel>

          <H t="By employee — call quality" s="Who reaches customers, and what happens when they do." />
          <Panel t="Employee performance" s="“Handled” counts the follow-ups an employee actually worked, so diverting work does not move someone else’s results onto them. “Open now” is what they currently hold — that is what Divert acts on. Ignore the rates when an employee has only handled a handful.">
            <EmpTable rows={emps.map((n) => ({ n, p: per(n) })).filter((x) => x.p.r.length)} cols={['Handled', 'Open now', 'Reach rate', 'Completion']} get={(p) => [p.worked, p.open, pct(p.worked, p.r.length), pct(p.done, p.r.length)]} empty="No follow-ups were assigned in this range." />
          </Panel>
        </>
      )}

      {tab === 'report' && <CustomerReport rows={rows} />}

      {tab === 'expense' && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Mini label="Total expense" value={money(0)} /><Mini label="Cost per follow-up" value={money(0)} /><Mini label="Cost per order" value={money(0)} /><Mini label="Follow-ups" value={rows.length} />
          </div>
          <div className={cn(card, 'text-ed-text/80 mt-4 py-14 text-center text-[14.5px]')}>No follow-up expense recorded in this range.</div>
        </>
      )}

      {tab === 'emp' && (
        <div className={cn(card, 'mt-6')}>
          <EmpTable rows={emps.map((n) => ({ n, p: per(n) }))} cols={['Assigned', 'Open now', 'Worked', 'Completed', 'Completion']} get={(p) => [p.r.length, p.open, p.worked, p.done, pct(p.done, p.r.length)]} empty="No data available for the selected period" />
        </div>
      )}
    </div>
  );
}

function EmpTable<P>({ rows, cols, get, empty }: { rows: { n: string; p: P }[]; cols: string[]; get: (p: P) => (string | number)[]; empty: string }) {
  if (rows.length === 0) return <p className="text-ed-text/80 py-14 text-center text-[16px]">{empty}</p>;
  return (
    <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-[14px]">
      <thead><tr className="border-ed-line border-b"><th className={cn(th, 'py-3.5')}>Employee</th>{cols.map((c) => <th key={c} className={cn(th, 'py-3.5 text-center')}>{c}</th>)}</tr></thead>
      <tbody>{rows.map(({ n, p }) => <tr key={n} className="border-ed-line border-b last:border-0"><td className="px-4 py-3.5">{n}</td>{get(p).map((v, i) => <td key={i} className="px-4 text-center">{v}</td>)}</tr>)}</tbody>
    </table></div>
  );
}
