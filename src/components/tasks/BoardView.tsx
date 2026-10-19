'use client';

import { Archive, Calendar, CheckSquare, Flag, MoreHorizontal, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getStatuses, isClosed, priorityColor, taskActions, type Status, type Task } from '@/lib/taskStore';
import { cn } from '@/lib/utils';
import { Avatar, fmtShort, StatusChip, todayStr, useOutside } from './ui';

function ColumnMenu({ onAdd, onArchive }: { onAdd: () => void; onArchive: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside<HTMLDivElement>(() => setOpen(false), open);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="Column options" onClick={() => setOpen((o) => !o)} className="text-ed-text/55 hover:text-ed-text flex size-6 items-center justify-center"><MoreHorizontal className="size-4" /></button>
      {open && (
        <div className="border-ed-line absolute top-full right-0 z-20 mt-1 w-[170px] rounded-lg border bg-white p-1 text-[13px] shadow-[0_12px_32px_rgba(30,20,50,0.16)]">
          <button type="button" onClick={() => { setOpen(false); onAdd(); }} className="hover:bg-ed-bg flex w-full items-center gap-2 rounded-md px-2.5 py-2"><Plus className="size-3.5" />Add task</button>
          <button type="button" onClick={() => { setOpen(false); onArchive(); }} className="hover:bg-ed-bg flex w-full items-center gap-2 rounded-md px-2.5 py-2"><Archive className="size-3.5" />Archive all</button>
        </div>
      )}
    </div>
  );
}

function Card({ t, onOpen }: { t: Task; onOpen: (t: Task) => void }) {
  const hasMeta = t.priority !== 'None' || t.assignee || t.due;
  return (
    <div draggable onDragStart={(e) => e.dataTransfer.setData('text/task', t.id)} onClick={() => onOpen(t)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onOpen(t)}
      className="border-ed-line cursor-pointer rounded-lg border bg-white px-3.5 py-3 shadow-[0_1px_3px_rgba(30,20,50,0.06)] transition hover:shadow-[0_4px_12px_rgba(30,20,50,0.1)]">
      <p className="text-[14px] font-medium">{t.title}</p>
      {t.labels.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1">{t.labels.map((l) => <span key={l} className="rounded-full bg-[#f3e9fd] px-2 py-0.5 text-[10.5px] text-[#6d17d0]">{l}</span>)}</div>}
      {hasMeta && <div className="border-ed-line mt-3 border-t" />}
      {hasMeta && (
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          {t.priority !== 'None' && <Flag aria-label={`${t.priority} priority`} style={{ color: priorityColor(t.priority) }} className="size-3.5 fill-current" />}
          {t.due && (
            <span suppressHydrationWarning className={cn('flex items-center gap-1 rounded-md border px-1.5 py-[3px] font-medium', t.due <= todayStr() && !isClosed(t.status, t.spaceId) ? 'border-[#fbcaca] bg-[#fff1f1] text-[#dc2626]' : 'border-ed-line text-ed-text/70')}>
              <Calendar className="size-3" />{fmtShort(t.due)}
            </span>
          )}
          {t.assignee && <span className="ml-auto"><Avatar name={t.assignee} /></span>}
        </div>
      )}
    </div>
  );
}

function QuickAdd({ onSubmit, onCancel }: { onSubmit: (title: string) => void; onCancel: () => void }) {
  const [v, setV] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const submit = () => { const n = v.trim(); if (n) onSubmit(n); else onCancel(); };
  return (
    <div className="border-ed-line mt-2.5 rounded-lg border bg-white p-2.5 shadow-[0_1px_3px_rgba(30,20,50,0.06)]">
      <input ref={ref} style={{ outline: 'none' }} value={v} onChange={(e) => setV(e.target.value)} placeholder="Task name..."
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
        className="h-10 w-full rounded-lg border-2 border-[#7c1ee6] bg-white px-3 text-[13px] shadow-none placeholder:text-ed-text/45" />
      <div className="mt-2.5 flex items-center justify-end gap-3 pr-1">
        <button type="button" onClick={onCancel} className="text-ed-text/60 hover:text-ed-text text-[11px] font-semibold">Cancel</button>
        <button type="button" onClick={submit} className="h-8 rounded-lg bg-[#7c1ee6] px-3.5 text-[11px] font-semibold text-white transition hover:bg-[#6d17d0]">Add</button>
      </div>
    </div>
  );
}

function EmptyColumn({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border-ed-line mt-4 flex flex-col items-center rounded-xl border border-dashed px-3 py-5 text-center">
      <CheckSquare className="size-[22px] text-[#c3cad6]" strokeWidth={1.6} />
      <p className="text-ed-text/55 mt-2.5 text-[11px] font-semibold">No tasks here yet</p>
      <p className="text-ed-text/40 mt-1 text-[9.5px]">Drag tasks here or add a new one</p>
      <button type="button" onClick={onAdd} className="border-ed-line text-ed-text/80 mt-3 flex h-[26px] items-center gap-1.5 rounded-md border bg-white px-3 text-[10.5px] font-semibold shadow-[0_1px_2px_rgba(30,20,50,0.06)] transition hover:border-[#7c1ee6] hover:text-[#7c1ee6]"><Plus className="size-3" />Add Task</button>
    </div>
  );
}

export function BoardView({ tasks, onOpen, spaceId, list }: { tasks: Task[]; onOpen: (t: Task) => void; spaceId: string; list?: string }) {
  const [over, setOver] = useState<Status | null>(null);
  const [adding, setAdding] = useState<Status | null>(null);
  const create = (s: Status, title: string) => {
    taskActions.add({ title, description: '', spaceId, list: list ?? 'General', status: s, priority: 'None', assignee: null, due: '', labels: [], checklist: [] });
    setAdding(null);
  };
  return (
    <div className="purple-scroll flex flex-1 gap-4 overflow-x-auto px-6 pt-5 pb-3">
      {getStatuses(spaceId).map((d) => d.name).map((s) => {
        const col = tasks.filter((t) => t.status === s);
        return (
          <section key={s} onDragOver={(e) => { e.preventDefault(); setOver(s); }} onDragLeave={() => setOver(null)}
            onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('text/task'); if (id) taskActions.update(id, { status: s }); }}
            className={cn('border-ed-line flex min-h-[215px] w-[318px] shrink-0 flex-col self-start rounded-xl border bg-white p-4 shadow-[0_1px_3px_rgba(30,20,50,0.05)] transition', over === s && 'border-[#7c1ee6] ring-2 ring-[#7c1ee6]/20')}>
            <header className="flex items-center gap-2">
              <StatusChip status={s} solid spaceId={spaceId} />
              <span className="text-ed-text/60 text-[12px]">{col.length}</span>
              <span className="ml-auto flex items-center gap-1.5">
                <ColumnMenu onAdd={() => setAdding(s)} onArchive={() => taskActions.updateMany(col.map((t) => t.id), { archived: true })} />
                <button type="button" aria-label={`Add task to ${s}`} onClick={() => setAdding(s)} className="text-ed-text/55 hover:text-ed-text flex size-6 items-center justify-center"><Plus className="size-4" /></button>
              </span>
            </header>
            {col.length === 0 && adding !== s && <EmptyColumn onAdd={() => setAdding(s)} />}
            {col.length > 0 && <div className="mt-4 space-y-2.5">{col.map((t) => <Card key={t.id} t={t} onOpen={onOpen} />)}</div>}
            {adding === s
              ? <QuickAdd onSubmit={(title) => create(s, title)} onCancel={() => setAdding(null)} />
              : col.length > 0 && <button type="button" onClick={() => setAdding(s)} className="text-ed-text/55 hover:text-ed-text mt-auto flex items-center gap-2 pt-6 text-[13px]"><Plus className="size-3.5" />Add Task</button>}
          </section>
        );
      })}
    </div>
  );
}
