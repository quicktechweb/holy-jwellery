'use client';

import { CalendarDays, ChevronDown, FileText, ListFilter, MessageSquareText, Phone, Plus, Search, Sparkles, Tag, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FU_CUSTOMERS, FU_EMPLOYEES, FU_TOTAL, useFollowUps, type Progress } from '@/lib/followupStore';
import { Box, Empty, Modal, card, th, inputCls } from './ui';
import { PbxPanel, ProductRecPanel, SmsTemplatesPanel } from './MoreTabs';

const filterBtn = 'border-ed-line flex h-10 items-center justify-between gap-2 rounded-lg border bg-white px-3.5 text-[14px] hover:bg-[#f7f6fa]';

export function AudienceTab() {
  const { audiences } = useFollowUps();
  const [q, setQ] = useState('');
  const list = audiences.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="text-[20px] font-medium">Audiences</h2>
          <p className="text-ed-muted mt-1 text-[14px]">Follow assignment progress and order results for each list · {list.length} of {audiences.length} audiences</p>
        </div>
        <div className="relative w-[384px] max-sm:w-full">
          <Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input style={{ outline: 'none' }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search audiences..." className={inputCls} />
        </div>
      </div>
      {list.length === 0 ? (
        <div className="border-ed-line border-t"><Empty icon={<ListFilter className="size-9" />} title="No audiences yet" hint="Select customers from the Customer List tab, then choose Create Audience." /></div>
      ) : (
        <table className="border-ed-line w-full border-t text-left text-[14px]">
          <thead><tr className="border-ed-line border-b"><th className={th}>Audience</th><th className={th}>Customers</th><th className={th}>Created</th></tr></thead>
          <tbody>{list.map((a) => <tr key={a.id} className="border-ed-line border-b last:border-0"><td className="px-4 py-3.5 font-medium">{a.name}</td><td className="px-4">{a.customerIds.length}</td><td className="px-4">{a.createdAt}</td></tr>)}</tbody>
        </table>
      )}
    </section>
  );
}

export function EmployeeProfileTab() {
  const { assignments, assign, setProgress } = useFollowUps();
  const [q, setQ] = useState('');
  const [who, setWho] = useState('mahima N');
  const [prog, setProg] = useState<'All progress' | Progress>('All progress');
  const [progOpen, setProgOpen] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const [target, setTarget] = useState(false);

  const stat = (e: string) => {
    const a = assignments.filter((x) => x.employee === e);
    const f = (p: Progress) => a.filter((x) => x.progress === p).length;
    return { cur: a.length, total: a.reduce((s, x) => s + x.times, 0), pending: f('Pending'), inprog: f('In Progress'), done: f('Completed') };
  };
  const emps = FU_EMPLOYEES.filter((e) => `${e.name} ${e.email}`.toLowerCase().includes(q.toLowerCase()));
  const mine = assignments.filter((a) => a.employee === who && (prog === 'All progress' || a.progress === prog));
  const initials = (n: string) => n.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4">
      <section className={cn(card, 'flex flex-wrap items-start justify-between gap-3 p-5')}>
        <div>
          <h2 className="text-[20px] font-medium">Assigned Employee Profile</h2>
          <p className="text-ed-muted mt-1 text-[14px]">Choose a date and employee, review their customer book, then reassign only the selected customers.</p>
        </div>
        <div>
          <span className="mb-1 block text-[13.5px] font-medium">Assignment date</span>
          <button type="button" className={filterBtn}><CalendarDays className="size-4" />All assignment dates</button>
        </div>
      </section>

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div><h3 className="text-[17px] font-medium">Employees</h3><p className="text-ed-muted text-[13.5px]">{emps.length} of {FU_EMPLOYEES.length} employees</p></div>
          <div className="relative w-[384px] max-sm:w-full"><Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" /><input style={{ outline: 'none' }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search employee name or email..." className={inputCls} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="border-ed-line w-full min-w-[820px] border-t text-left text-[14px]">
            <thead><tr className="border-ed-line border-b"><th className={th}>Employee</th>{['Current Customers', 'Total Assigned', 'Pending', 'In Progress', 'Completed'].map((h) => <th key={h} className={cn(th, 'text-right')}>{h}</th>)}<th className={cn(th, 'text-right')}>Action</th></tr></thead>
            <tbody>
              {emps.map((e) => {
                const s = stat(e.name);
                return (
                  <tr key={e.email} className={cn('border-ed-line border-b last:border-0', who === e.name && 'bg-[#f6f5fa]')}>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-3"><span className="bg-ed-bg flex size-9 items-center justify-center rounded-full text-[12px] font-medium">{initials(e.name)}</span><div><div className="font-medium">{e.name}</div><div className="text-ed-muted text-[12.5px]">{e.email}</div></div></div></td>
                    {[s.cur, s.total, s.pending, s.inprog, s.done].map((v, i) => <td key={i} className="px-4 text-right">{v}</td>)}
                    <td className="px-4 text-right"><button type="button" onClick={() => { setWho(e.name); setSel([]); }} className="border-ed-line h-9 rounded-lg border bg-white px-4 text-[14px] hover:bg-[#f7f6fa]">View Customers</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className={cn(card, 'text-ed-text/90 flex items-center gap-2.5 px-4 py-3 text-[14px]')}>
        <span className="font-semibold">{(FU_TOTAL - assignments.length).toLocaleString('en-US')}</span> customers are currently unassigned across the business.
      </div>

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div><h3 className="text-[17px] font-medium">{who}’s assigned customers</h3><p className="text-ed-muted text-[13.5px]">{mine.length} records match this profile and date.</p></div>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-[240px]"><Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" /><input style={{ outline: 'none' }} placeholder="Name or mobile" className={inputCls} /></div>
            <div className="relative">
              <button type="button" onClick={() => setProgOpen((o) => !o)} className={cn(filterBtn, 'w-[176px]')}>{prog}<ChevronDown className="size-4" /></button>
              {progOpen && <ul className="border-ed-line absolute z-20 mt-1 w-full rounded-lg border bg-white p-1 shadow-lg">{(['All progress', 'Pending', 'In Progress', 'Completed'] as const).map((p) => <li key={p}><button type="button" onClick={() => { setProg(p); setProgOpen(false); }} className="w-full rounded-md px-3 py-2 text-left text-[13px] hover:bg-[#f4eef8]">{p}</button></li>)}</ul>}
            </div>
            <button type="button" disabled={!sel.length} onClick={() => setTarget(true)} className="h-10 rounded-lg bg-ed-brand px-4 text-[14px] font-semibold text-white disabled:opacity-50">⇄ Reassign ({sel.length})</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="border-ed-line w-full min-w-[900px] border-t text-left text-[14px]">
            <thead><tr className="border-ed-line border-b"><th className="w-[56px] pl-4"><Box on={mine.length > 0 && sel.length === mine.length} label="Select all" onChange={() => setSel(sel.length === mine.length ? [] : mine.map((m) => m.customerId))} /></th>{['Customer', 'Mobile', 'District', 'Progress', 'Recent Note', 'Schedule', 'Times Assigned', 'Assigned Date'].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
            <tbody>
              {mine.length === 0 && <tr><td colSpan={9} className="text-ed-muted py-12 text-center text-[14px]">No customers match these filters.</td></tr>}
              {mine.map((a) => {
                const c = FU_CUSTOMERS.find((x) => x.id === a.customerId);
                return (
                  <tr key={a.customerId} className="border-ed-line border-b last:border-0">
                    <td className="pl-4"><Box on={sel.includes(a.customerId)} label="Select" onChange={() => setSel((s) => (s.includes(a.customerId) ? s.filter((x) => x !== a.customerId) : [...s, a.customerId]))} /></td>
                    <td className="px-4 py-3.5">{c?.name}</td><td className="px-4">{c?.mobile}</td><td className="px-4">-</td>
                    <td className="px-4"><button type="button" onClick={() => setProgress(a.customerId, a.progress === 'Pending' ? 'In Progress' : a.progress === 'In Progress' ? 'Completed' : 'Pending')} className="border-ed-line rounded-full border px-2.5 py-0.5 text-[12px]">{a.progress}</button></td>
                    <td className="text-ed-muted max-w-[200px] truncate px-4">{a.note || '-'}</td><td className="px-4">-</td><td className="px-4">{a.times}</td><td className="px-4">{a.assignedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {target && (
        <Modal title={`Reassign ${sel.length} customers`} sub="Pick the employee who takes over these follow-ups." onClose={() => setTarget(false)}>
          <div className="space-y-1">
            {FU_EMPLOYEES.filter((e) => e.name !== who).map((e) => (
              <button key={e.email} type="button" onClick={() => { assign(sel, { employee: e.name, priority: 'MEDIUM', note: '', relationshipOwner: false }); setTarget(false); setSel([]); }} className="hover:bg-[#f4eef8] w-full rounded-lg px-3 py-2.5 text-left text-[14px]">{e.name}</button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

export function BatchesTab() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState('All dates');
  const ranges = [['', ['All dates']], ['Quick select', ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days']], ['Extended range', ['This month', 'Last month', 'This year', 'Last year', 'Lifetime']], ['Custom', ['Select a date', 'Custom range']]] as const;
  return (
    <section className={cn(card, 'p-6')}>
      <h2 className="text-[20px] font-medium">Assignment batches</h2>
      <p className="text-ed-muted mt-1 text-[14px]">A repeating batch starts its next round when its last open follow-up is completed. Restart forces the next round when follow-ups are left untouched and the round can never finish on its own.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="relative min-w-[260px] flex-1"><Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" /><input style={{ outline: 'none' }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by employee name..." className={inputCls} /></div>
        <button type="button" className={cn(filterBtn, 'w-[150px]')}>Open<ChevronDown className="size-4" /></button>
        <button type="button" className={cn(filterBtn, 'w-[160px]')}>All batches<ChevronDown className="size-4" /></button>
        <button type="button" className={filterBtn}>Assigned to</button>
        <div className="relative">
          <button type="button" onClick={() => setOpen((o) => !o)} className={filterBtn}><CalendarDays className="size-4" />{range}<ChevronDown className={cn('size-4', open && 'rotate-180')} /></button>
          {open && (
            <div className="border-ed-line absolute right-0 z-20 mt-2 w-[220px] rounded-xl border bg-white p-2 shadow-xl">
              {ranges.map(([title, items]) => (
                <div key={title} className="border-ed-line border-b py-1 last:border-0">
                  {title && <div className="text-ed-muted px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase">{title}</div>}
                  {items.map((i) => <button key={i} type="button" onClick={() => { setRange(i); setOpen(false); }} className={cn('w-full rounded-md px-3 py-2 text-left text-[14px] hover:bg-[#f4eef8]', range === i && 'bg-[#f4eef8] font-medium')}>{i}</button>)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-ed-line mt-4 border-t pt-4 text-[14px]">
        <p>No assignment batches match these filters.</p>
        <p className="text-ed-muted mt-3">0 batches</p>
      </div>
    </section>
  );
}

export function ScriptsTab() {
  const { scripts, saveScript, removeScript } = useFollowUps();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('All other calls (Default)');
  const [body, setBody] = useState('');
  const [active, setActive] = useState(true);
  const close = () => { setOpen(false); setName(''); setBody(''); setTarget('All other calls (Default)'); setActive(true); };
  return (
    <section className={card}>
      <div className="flex items-center justify-between gap-3 rounded-t-xl bg-[#f6effb] p-5">
        <div className="flex gap-3"><FileText className="text-[#9333ea] mt-1 size-5" /><div><h2 className="text-[19px] font-medium">Call Scripts</h2><p className="text-ed-muted text-[14px]">Manage the exact BN and EN scripts agents see during a call.</p></div></div>
        <button type="button" onClick={() => setOpen(true)} className="flex h-11 items-center gap-2 rounded-lg bg-ed-brand px-5 text-[14.5px] font-semibold text-white"><Plus className="size-4" />Create Script</button>
      </div>
      <div className="p-6">
        <div className="relative w-[448px] max-w-full"><Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" /><input style={{ outline: 'none' }} placeholder="Search scripts or targets..." className={inputCls} /></div>
        {scripts.length === 0 ? (
          <div className="border-ed-line mt-5 rounded-xl border border-dashed"><Empty icon={<FileText className="size-10" />} title="No call scripts yet" hint="Create a default script first, then add targeted scripts when needed." /></div>
        ) : (
          <ul className="mt-5 space-y-2">{scripts.map((s) => (
            <li key={s.id} className="border-ed-line flex items-start justify-between gap-3 rounded-xl border p-4">
              <div><div className="font-medium">{s.name} {!s.active && <span className="text-ed-muted text-[12px]">(inactive)</span>}</div><div className="text-ed-muted text-[12.5px]">{s.target}</div><p className="mt-2 text-[13.5px] whitespace-pre-wrap">{s.body}</p></div>
              <button type="button" aria-label="Delete" onClick={() => removeScript(s.id)}><X className="size-4" /></button>
            </li>))}</ul>
        )}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div role="dialog" aria-modal="true" className="relative max-h-[calc(100vh-2rem)] w-full max-w-[768px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <button type="button" aria-label="Close" onClick={close} className="absolute top-5 right-5"><X className="size-4" /></button>
            <h2 className="text-[18px] font-semibold">Create Call Script</h2>
            <p className="text-ed-muted mt-1 text-[13px]">Agents will see the matching language when they switch BN/EN in the Cockpit.</p>
            <label className="mt-5 block text-[14px] font-medium">Script Name
              <input style={{ outline: 'none' }} autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Example: Default welcome call" className="mt-1.5 h-11 w-full rounded-lg border border-ed-brand px-3 text-[14px] font-normal outline-none ring-2 ring-ed-brand/10" />
            </label>
            <label className="mt-5 block text-[14px] font-medium">Show This Script For
              <select style={{ outline: 'none' }} value={target} onChange={(e) => setTarget(e.target.value)} className="border-ed-line mt-1.5 block h-10 w-[350px] max-w-full rounded-lg border bg-white px-3 text-[14px] font-normal outline-none">
                <option>All other calls (Default)</option><option>Audience</option><option>Delivered customers</option><option>RTS customers</option>
              </select>
              <span className="text-ed-muted mt-2 block text-[13.5px] font-normal">Audience has the highest matching priority.</span>
            </label>
            <label className="mt-5 block text-[14px] font-medium">Script
              <textarea style={{ outline: 'none' }} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the call script in the language your agents use..." className="border-ed-line mt-1.5 block h-[190px] w-full resize-y rounded-lg border p-3 text-[14px] font-normal outline-none focus:border-ed-brand/50" />
            </label>
            <div className="border-ed-line mt-5 flex items-center justify-between rounded-xl border p-4">
              <div><div className="text-[14px] font-medium">Active</div><div className="text-ed-muted text-[13px]">Inactive scripts stay saved but never appear in the Cockpit.</div></div>
              <button type="button" role="switch" aria-checked={active} onClick={() => setActive((a) => !a)} className={cn('relative h-6 w-11 rounded-full transition', active ? 'bg-ed-brand' : 'bg-[#d9d6e2]')}><span className={cn('absolute top-0.5 size-5 rounded-full bg-white transition-all', active ? 'left-[22px]' : 'left-0.5')} /></button>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={close} className="border-ed-line h-10 rounded-lg border px-5 text-[14px] font-medium">Cancel</button>
              <button type="button" disabled={!name.trim() || !body.trim()} onClick={() => { saveScript({ name: name.trim(), target, body: body.trim(), active }); close(); }} className="h-10 rounded-lg bg-ed-brand px-5 text-[14px] font-semibold text-white disabled:opacity-50">Save Script</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type Group = { key: string; title: string; sub: string; tags: string[]; hide?: boolean; max: number };
const seedGroups: Group[] = [
  { key: 'quick', title: 'দ্রুত নোট', sub: 'কলের সময় এক ক্লিকে note-এ যোগ হবে।', max: 12, tags: ['কথা হয়েছে', 'পরে অর্ডার করবে', 'দাম বেশি বলেছে', 'ডেলিভারি দ্রুত চায়', 'অফিসে ডেলিভারি', 'পণ্য নিশ্চিত করেছে'] },
  { key: 'opinion', title: 'কাস্টমারের মতামত', sub: 'কাস্টমার কেমন সাড়া দিয়েছে, এক ক্লিকে বেছে নেওয়া যাবে।', max: 12, hide: true, tags: ['দাম বেশি বলেছে', 'অভিযোগ আছে', 'এখন প্রয়োজন নেই', 'আগ্রহী, ভাবছে', 'নিরপেক্ষ'] },
  { key: 'agent', title: 'এজেন্টের পর্যবেক্ষণ', sub: 'Agent-এর common observations দ্রুত note-এ যোগ হবে।', max: 12, hide: true, tags: ['নিয়মিত কাস্টমার', 'দ্রুত ডেলিভারি চায়', 'ডিসকাউন্ট চেয়েছে', 'বেশি পণ্য নেবে', 'অভিযোগকারী', 'আন্তরিক ব্যবহার'] },
  { key: 'interest', title: 'কাস্টমারের আগ্রহ / ক্যাটাগরি', sub: 'Call schedule section থেকে customer interest চিহ্নিত করা যাবে।', max: 12, hide: true, tags: ['নতুন পণ্যে আগ্রহী', 'ফিচার্ড পণ্যে আগ্রহী', 'একই ক্যাটাগরির পণ্য চায়'] },
];

export function SettingsTab() {
  const [sub, setSub] = useState('Call Panel');
  const [groups, setGroups] = useState(seedGroups);
  const [req, setReq] = useState<Record<string, boolean>>({});
  const [hide, setHide] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const subs = [['Call Panel', Tag], ['SMS Templates', MessageSquareText], ['Product Recommendations', Sparkles], ['PBX Rules', Phone]] as const;
  const upd = (k: string, fn: (t: string[]) => string[]) => setGroups((g) => g.map((x) => (x.key === k ? { ...x, tags: fn(x.tags) } : x)));
  const toggle = (on: boolean, set: () => void, label: string) => (
    <label className="flex cursor-pointer items-center gap-2 text-[14px]"><button type="button" role="switch" aria-checked={on} aria-label={label} onClick={set} className={cn('relative h-5 w-9 rounded-full transition', on ? 'bg-ed-brand' : 'bg-[#e4e1ea]')}><span className={cn('absolute top-0.5 size-4 rounded-full bg-white shadow transition-all', on ? 'left-[18px]' : 'left-0.5')} /></button>{label}</label>
  );
  return (
    <div>
      <nav className="border-ed-line flex gap-1 border-b">{subs.map(([s, Icon]) => <button key={s} type="button" onClick={() => setSub(s)} className={cn('-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-[14.5px] font-medium', sub === s ? 'border-ed-brand text-ed-brand' : 'text-ed-text/70 border-transparent')}><Icon className="size-4" />{s}</button>)}</nav>
      {sub === 'SMS Templates' ? <SmsTemplatesPanel /> : sub === 'Product Recommendations' ? <ProductRecPanel /> : sub === 'PBX Rules' ? <PbxPanel /> : (
        <section className={cn(card, 'mt-4 p-6')}>
          <h2 className="flex items-center gap-2 text-[20px] font-semibold"><Tag className="size-5 text-[#7c3aed]" />কল প্যানেলের ট্যাগ ও লেবেল</h2>
          <p className="text-ed-muted mt-1 text-[14px]">ট্যাগের নাম যেভাবে লিখবেন, বাংলা ও English দুই ভাষাতেই সেভাবেই দেখাবে।</p>
          <div className="border-ed-line mt-5 space-y-4 border-t pt-5">
            {groups.map((g) => (
              <div key={g.key} className="border-ed-line rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><div className="text-[16px] font-semibold">{g.title} <span className="text-ed-muted text-[13px] font-normal">· {g.tags.length}/{g.max}</span></div><div className="text-ed-muted text-[12.5px]">{g.sub}</div></div>
                  <div className="flex items-center gap-4">
                    {g.hide && toggle(!!hide[g.key], () => setHide((h) => ({ ...h, [g.key]: !h[g.key] })), 'Hide')}
                    {toggle(!!req[g.key], () => setReq((r) => ({ ...r, [g.key]: !r[g.key] })), 'Required')}
                    <button type="button" disabled={g.tags.length >= g.max} onClick={() => upd(g.key, (t) => [...t, 'নতুন ট্যাগ'])} className="border-ed-line flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13.5px] font-medium disabled:opacity-50"><Plus className="size-4" />নতুন ট্যাগ</button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {g.tags.map((t, i) => (
                    <span key={i} className="border-ed-line flex items-center gap-2 rounded-lg border bg-[#f9f8fb] px-3 py-1.5 text-[13.5px]">
                      <input style={{ outline: 'none' }} value={t} onChange={(e) => upd(g.key, (a) => a.map((x, j) => (j === i ? e.target.value : x)))} size={Math.max(t.length, 6)} className="bg-transparent outline-none" />
                      <button type="button" aria-label="Remove tag" onClick={() => upd(g.key, (a) => a.filter((_, j) => j !== i))}><X className="text-ed-muted size-3.5" /></button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="border-ed-line flex items-start justify-between rounded-xl border p-4">
              <div><div className="text-[16px] font-semibold">কল শিডিউল</div><div className="text-ed-muted text-[12.5px]">চালু থাকলে কথা হওয়া কলেও পরের কল শিডিউল করতে হবে। ধরেনি কলে সবসময় ঐচ্ছিক।</div></div>
              {toggle(!!req.schedule, () => setReq((r) => ({ ...r, schedule: !r.schedule })), 'Required')}
            </div>
            <button type="button" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }} className="h-11 rounded-lg bg-ed-brand px-5 text-[14.5px] font-semibold text-white">{saved ? 'সেভ হয়েছে ✓' : 'পরিবর্তন সেভ করুন'}</button>
          </div>
        </section>
      )}
    </div>
  );
}

export function PlaceholderTab({ title }: { title: string }) {
  return <section className={card}><Empty icon={<ListFilter className="size-9" />} title={title} hint="এই অংশ শীঘ্রই আসছে।" /></section>;
}
