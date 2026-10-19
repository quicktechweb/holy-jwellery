'use client';

import { Archive, ArrowUpDown, Check, ChevronDown, FileText, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { allStatusNames, ASSIGNEES, getStatuses, isClosed, priorityNames, taskActions, type Space, type Status, type Task } from '@/lib/taskStore';
import { cn } from '@/lib/utils';
import { Avatar, fmtUpdated, PriorityBadge, Sel, StatusChip, StatusPill, useOutside } from './ui';

type SortKey = 'title' | 'due' | 'updatedAt';
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

function Box({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} aria-label={label} onClick={onChange}
      className={cn('flex size-4 items-center justify-center rounded-[5px] border-[1.5px] transition', on ? 'border-[#7c1ee6] bg-[#7c1ee6] text-white' : 'border-[#3a3548] bg-white')}>
      {on && <Check className="size-3" strokeWidth={3} />}
    </button>
  );
}

function StatusMenu({ t }: { t: Task }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside<HTMLDivElement>(() => setOpen(false), open);
  return (
    <div ref={ref} className="relative inline-flex items-center gap-1">
      <StatusPill status={t.status} spaceId={t.spaceId} />
      <button type="button" aria-label="Change status" onClick={() => setOpen((o) => !o)} className="text-ed-text/60"><ChevronDown className="size-3.5" /></button>
      {open && (
        <div className="border-ed-line absolute top-full left-0 z-20 mt-1 w-[150px] rounded-lg border bg-white p-1 shadow-[0_12px_32px_rgba(30,20,50,0.16)]">
          {getStatuses(t.spaceId).map((d) => d.name).map((s) => (
            <button key={s} type="button" onClick={() => { taskActions.update(t.id, { status: s }); setOpen(false); }} className="hover:bg-ed-bg flex w-full items-center justify-between rounded-md px-2.5 py-2 text-[12.5px]">
              <StatusPill status={s} spaceId={t.spaceId} />{s === t.status && <Check className="size-3.5 text-[#7c1ee6]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const th = 'px-3 py-4 text-[12.5px] font-medium text-ed-text/75 whitespace-nowrap';

export function ListView({ tasks, spaces, q, setQ, onOpen }: { tasks: Task[]; spaces: Space[]; q: string; setQ: (v: string) => void; onOpen: (t: Task) => void }) {
  const [fs, setFs] = useState('All Statuses');
  const [fp, setFp] = useState('All Priorities');
  const [fa, setFa] = useState('All Assignees');
  const [sort, setSort] = useState<{ k: SortKey; d: 1 | -1 }>({ k: 'updatedAt', d: -1 });
  const [sel, setSel] = useState<string[]>([]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    const f = tasks.filter((t) =>
      (!s || t.title.toLowerCase().includes(s)) &&
      (fs === 'All Statuses' || t.status === fs) &&
      (fp === 'All Priorities' || t.priority === fp) &&
      (fa === 'All Assignees' || (fa === 'Unassigned' ? !t.assignee : t.assignee === fa)));
    return f.sort((a, b) => (a[sort.k] ?? '').toString().localeCompare((b[sort.k] ?? '').toString()) * sort.d);
  }, [tasks, q, fs, fp, fa, sort]);

  const toggleSort = (k: SortKey) => setSort((p) => (p.k === k ? { k, d: (p.d * -1) as 1 | -1 } : { k, d: 1 }));
  const Sort = ({ k, label }: { k: SortKey; label: string }) => (
    <button type="button" onClick={() => toggleSort(k)} className="flex items-center gap-1.5 hover:text-[#7c1ee6]">{label}<ArrowUpDown className="size-3.5 opacity-70" /></button>
  );
  const allOn = rows.length > 0 && rows.every((r) => sel.includes(r.id));
  const spaceName = (id: string) => spaces.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="flex-1 px-5 pt-5 pb-6">
      <div className="border-ed-line flex flex-wrap items-center gap-2 rounded-xl border bg-white p-3 shadow-[0_1px_3px_rgba(30,20,50,0.05)]">
        <div className="relative w-[256px] max-sm:w-full">
          <Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks..." className="border-ed-line placeholder:text-ed-muted h-10 w-full rounded-lg border bg-[#f9f8fb] pr-3 pl-9 text-[13.5px] outline-none focus:border-[#7c1ee6]" />
        </div>
        <Sel label="Status filter" value={fs} onChange={setFs} options={['All Statuses', ...allStatusNames()]} className="h-10 w-[144px]" />
        <Sel label="Priority filter" value={fp} onChange={setFp} options={['All Priorities', ...priorityNames()]} className="h-10 w-[144px]" />
        <Sel label="Assignee filter" value={fa} onChange={setFa} options={['All Assignees', 'Unassigned', ...ASSIGNEES]} className="h-10 w-[144px]" />
        {sel.length > 0 && (
          <div className="ml-auto flex items-center gap-2 text-[12.5px]">
            <span className="text-ed-text/70">{sel.length} selected</span>
            <button type="button" onClick={() => { taskActions.updateMany(sel, { status: 'Completed' }); setSel([]); }} className="border-ed-line h-8 rounded-lg border px-3 hover:text-[#7c1ee6]">Mark completed</button>
            <button type="button" onClick={() => { taskActions.updateMany(sel, { archived: true }); setSel([]); }} className="border-ed-line h-8 rounded-lg border px-3 hover:text-[#7c1ee6]">Archive</button>
            <button type="button" onClick={() => setSel([])} className="text-ed-muted px-1">Clear</button>
          </div>
        )}
      </div>

      <div className="border-ed-line mt-4 overflow-hidden rounded-xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left">
            <thead>
              <tr className="border-ed-line border-b">
                <th className="w-[60px] pr-0 pl-6"><Box on={allOn} onChange={() => setSel(allOn ? [] : rows.map((r) => r.id))} label="Select all" /></th>
                <th className={th}><Sort k="title" label="Task Title" /></th><th className={th}>Space / List</th><th className={th}>Status</th>
                <th className={th}>Priority</th><th className={th}>Assignee</th><th className={th}><Sort k="due" label="Due Date" /></th>
                <th className={th}>Checklist</th><th className={th}><Sort k="updatedAt" label="Last Updated" /></th><th className={cn(th, 'text-right')}>Info</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {allStatusNames().map((s: Status) => {
                const g = rows.filter((r) => r.status === s);
                if (!g.length) return null;
                return [
                  <tr key={`h-${s}`} className="border-ed-line border-y bg-[#f8f7fb]">
                    <td colSpan={10} className="px-4 py-2"><span className="flex items-center gap-2"><StatusChip status={s} /><span className="text-ed-text/60 text-[11.5px]">{g.length}</span></span></td>
                  </tr>,
                  ...g.map((t) => {
                    const done = t.checklist.filter((c) => c.done).length;
                    const late = t.due && t.due <= today() && !isClosed(t.status, t.spaceId);
                    return (
                      <tr key={t.id} className="border-ed-line group border-b last:border-b-0 hover:bg-[#fcfbfe] [&_td]:py-5">
                        <td className="pr-0 pl-6"><Box on={sel.includes(t.id)} onChange={() => setSel((p) => (p.includes(t.id) ? p.filter((x) => x !== t.id) : [...p, t.id]))} label={`Select ${t.title}`} /></td>
                        <td className="px-3"><button type="button" onClick={() => onOpen(t)} className="text-left font-medium hover:text-[#7c1ee6]">{t.title}</button></td>
                        <td className="px-3"><p className="flex items-center gap-1.5 font-medium"><i className="size-1.5 rounded-full bg-[#4f46e5]" />{spaceName(t.spaceId)}</p><p className="text-ed-muted pl-3 text-[10.5px] leading-tight">{t.list}</p></td>
                        <td className="px-3"><StatusMenu t={t} /></td>
                        <td className="px-3"><PriorityBadge priority={t.priority} /></td>
                        <td className="px-3">{t.assignee ? <span className="flex items-center gap-2"><Avatar name={t.assignee} />{t.assignee}</span> : <span className="text-ed-muted">Unassigned</span>}</td>
                        <td className={cn('px-3', late ? 'font-medium text-[#e5243b]' : 'text-ed-muted')} suppressHydrationWarning>{t.due || '-'}</td>
                        <td className="text-ed-muted px-3">{t.checklist.length ? `${done}/${t.checklist.length}` : '-'}</td>
                        <td className="text-ed-text/80 px-3 whitespace-nowrap">{fmtUpdated(t.updatedAt)}</td>
                        <td className="px-3">
                          <span className="text-ed-muted flex items-center justify-end gap-2">
                            {t.description && <span title={t.description}><FileText className="size-4" /></span>}
                            <button type="button" aria-label="Archive task" onClick={() => taskActions.update(t.id, { archived: !t.archived })} className="opacity-0 transition group-hover:opacity-100 hover:text-[#7c1ee6] focus:opacity-100"><Archive className="size-4" /></button>
                          </span>
                        </td>
                      </tr>
                    );
                  }),
                ];
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="text-ed-muted py-14 text-center text-[13px]">No tasks found.</p>}
      </div>
    </div>
  );
}
