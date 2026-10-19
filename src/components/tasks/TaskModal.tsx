'use client';

import { Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { ASSIGNEES, getStatuses, priorityNames, taskActions, type Priority, type Space, type Status, type Task } from '@/lib/taskStore';
import { cn } from '@/lib/utils';
import { Sel, violet } from './ui';

const field = 'border-ed-line placeholder:text-ed-muted/80 focus:border-[#7c1ee6] focus:ring-2 focus:ring-[#7c1ee6]/25 h-9 w-full rounded-lg border bg-[#fafafa] px-3 text-[13.5px] outline-none';

function L({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-ed-text/70 mb-1.5 block text-[10.5px] font-medium tracking-wide uppercase">{label}</span>
      {children}
    </label>
  );
}

function Shell({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={cn('thin-scroll relative max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl', wide ? 'max-w-[520px]' : 'max-w-[448px]')}>
        <button type="button" aria-label="Close" onClick={onClose} className="text-ed-text/70 hover:text-ed-text absolute top-5 right-5"><X className="size-4" /></button>
        <h3 className="text-[18px] font-semibold">{title}</h3>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export interface TaskDraft { spaceId: string; list?: string; status?: Status; assignee?: string | null }

/** Create (task = null) ba edit (task = existing) */
export function TaskModal({ spaces, labels, task, draft, onClose }: { spaces: Space[]; labels: string[]; task: Task | null; draft?: TaskDraft; onClose: () => void }) {
  const first = spaces.find((s) => s.id === (task?.spaceId ?? draft?.spaceId)) ?? spaces[0];
  const [spaceId, setSpaceId] = useState(first.id);
  const space = spaces.find((s) => s.id === spaceId) ?? first;
  const [list, setList] = useState(task?.list ?? draft?.list ?? space.lists[0]);
  const [title, setTitle] = useState(task?.title ?? '');
  const [desc, setDesc] = useState(task?.description ?? '');
  const [status, setStatus] = useState<Status>(task?.status ?? draft?.status ?? getStatuses(first.id)[0].name);
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'None');
  const [assignee, setAssignee] = useState(task?.assignee ?? draft?.assignee ?? 'Unassigned');
  const [due, setDue] = useState(task?.due ?? '');
  const [picked, setPicked] = useState<string[]>(task?.labels ?? []);
  const [check, setCheck] = useState(task?.checklist ?? []);
  const [item, setItem] = useState('');
  const [err, setErr] = useState('');

  const changeSpace = (name: string) => {
    const s = spaces.find((x) => x.name === name);
    if (s) { setSpaceId(s.id); setList(s.lists[0]); const names = getStatuses(s.id).map((d) => d.name); if (!names.includes(status)) setStatus(names[0]); }
  };

  const submit = () => {
    if (!title.trim()) return setErr('Title is required.');
    const data = { title: title.trim(), description: desc.trim(), spaceId, list: space.lists.includes(list) ? list : space.lists[0], status, priority, assignee: assignee === 'Unassigned' ? null : assignee, due, labels: picked, checklist: check };
    if (task) taskActions.update(task.id, data); else taskActions.add(data);
    onClose();
  };

  return (
    <Shell title={task ? 'Edit Task' : 'Create New Task'} onClose={onClose}>
      <div className="space-y-4">
        <L label="Space / Department"><Sel label="Space" value={space.name} onChange={changeSpace} options={spaces.map((s) => s.name)} icon={space.icon} className="h-9" /></L>
        <L label="List"><Sel label="List" value={list} onChange={setList} options={space.lists} className="h-9" /></L>
        <L label="Title"><input value={title} onChange={(e) => { setTitle(e.target.value); setErr(''); }} placeholder="Follow up on Steadfast parcel status" className={field} autoFocus /></L>
        <L label="Description"><input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Notes and context..." className={field} /></L>
        <div className="grid grid-cols-2 gap-3">
          <L label="Status"><Sel label="Status" value={status} onChange={(v) => setStatus(v as Status)} options={getStatuses(spaceId).map((d) => d.name)} className="h-9" /></L>
          <L label="Priority"><Sel label="Priority" value={priority} onChange={(v) => setPriority(v as Priority)} options={['None', ...priorityNames()]} className="h-9" /></L>
          <L label="Assignee"><Sel label="Assignee" value={assignee} onChange={setAssignee} options={['Unassigned', ...ASSIGNEES]} className="h-9" /></L>
          <L label="Due Date"><input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={field} /></L>
        </div>

        <div>
          <span className="text-ed-text/70 mb-1.5 block text-[10.5px] font-medium tracking-wide uppercase">Labels</span>
          {labels.length === 0
            ? <p className="text-ed-muted text-[12px] italic">No labels configured. Create some in Settings.</p>
            : <div className="flex flex-wrap gap-1.5">{labels.map((l) => (
                <button key={l} type="button" onClick={() => setPicked((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]))}
                  className={cn('rounded-full border px-3 py-1 text-[12px]', picked.includes(l) ? 'border-[#7c1ee6] bg-[#f3e9fd] text-[#6d17d0]' : 'border-ed-line text-ed-text/70')}>{l}</button>
              ))}</div>}
        </div>

        {task && (
          <div>
            <span className="text-ed-text/70 mb-1.5 block text-[10.5px] font-medium tracking-wide uppercase">Checklist</span>
            <ul className="space-y-1.5">
              {check.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={c.done} onChange={() => setCheck(check.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)))} className="accent-[#7c1ee6]" />
                  <span className={cn('flex-1', c.done && 'text-ed-muted line-through')}>{c.text}</span>
                  <button type="button" aria-label="Remove item" onClick={() => setCheck(check.filter((x) => x.id !== c.id))} className="text-ed-muted hover:text-ed-red"><X className="size-3.5" /></button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2">
              <input value={item} onChange={(e) => setItem(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && item.trim()) { e.preventDefault(); setCheck([...check, { id: `c${Date.now()}`, text: item.trim(), done: false }]); setItem(''); } }} placeholder="Add checklist item" className={field} />
              <button type="button" aria-label="Add item" onClick={() => { if (item.trim()) { setCheck([...check, { id: `c${Date.now()}`, text: item.trim(), done: false }]); setItem(''); } }} className="border-ed-line flex size-9 shrink-0 items-center justify-center rounded-lg border"><Plus className="size-4" /></button>
            </div>
          </div>
        )}

        {err && <p role="alert" className="text-ed-red text-[12.5px]">{err}</p>}
        <button type="button" onClick={submit} className={cn('h-9 w-full rounded-lg text-[13.5px] font-semibold text-white', violet)}>{task ? 'Save Changes' : 'Create Task'}</button>
        {task && (
          <button type="button" onClick={() => { if (confirm('Delete this task?')) { taskActions.remove(task.id); onClose(); } }} className="text-ed-red flex w-full items-center justify-center gap-1.5 text-[12.5px]"><Trash2 className="size-3.5" />Delete task</button>
        )}
      </div>
    </Shell>
  );
}

/** Configure (space lists) + Settings (labels) */
export function ConfigModal({ mode, space, labels, onClose }: { mode: 'space' | 'labels'; space?: Space; labels: string[]; onClose: () => void }) {
  const [v, setV] = useState('');
  const add = () => {
    const n = v.trim();
    if (!n) return;
    if (mode === 'space' && space) taskActions.addList(space.id, n); else taskActions.addLabel(n);
    setV('');
  };
  const items = mode === 'space' ? space?.lists ?? [] : labels;
  return (
    <Shell title={mode === 'space' ? `Configure ${space?.name}` : 'Task Settings'} onClose={onClose}>
      <p className="text-ed-text/70 mb-2 text-[10.5px] font-medium tracking-wide uppercase">{mode === 'space' ? 'Lists' : 'Labels'}</p>
      <div className="flex gap-2">
        <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder={mode === 'space' ? 'New list name' : 'New label name'} className={field} autoFocus />
        <button type="button" onClick={add} className={cn('h-9 shrink-0 rounded-lg px-4 text-[13px] font-medium text-white', violet)}>Add</button>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.length === 0 && <li className="text-ed-muted text-[12.5px] italic">Nothing here yet.</li>}
        {items.map((i) => (
          <li key={i} className="border-ed-line flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px]">
            {i}
            {mode === 'labels' && <button type="button" aria-label={`Remove ${i}`} onClick={() => taskActions.removeLabel(i)} className="text-ed-muted hover:text-ed-red"><X className="size-3" /></button>}
          </li>
        ))}
      </ul>
    </Shell>
  );
}
