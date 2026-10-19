'use client';

import { Archive, ChevronDown, ChevronRight, LayoutGrid, List, ListChecks, Plus, Search, Settings, ClipboardList } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ME, useTaskState, type Status, type Task } from '@/lib/taskStore';
import { cn } from '@/lib/utils';
import { BoardView } from './BoardView';
import { ListView } from './ListView';
import { SopsView } from './SopsView';
import { TaskDetail } from './TaskDetail';
import { SettingsPanel, type SettingsTab } from './SettingsPanel';
import { TaskModal, type TaskDraft } from './TaskModal';
import { violet } from './ui';

type View = { k: 'my' } | { k: 'sops' } | { k: 'archived' } | { k: 'space'; id: string; list?: string };

const navItem = 'flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13.5px] transition';

export function TaskHub() {
  const { spaces, tasks, labels } = useTaskState();
  const params = useSearchParams();
  const [view, setView] = useState<View>(() => (params.get('view') === 'sops' ? { k: 'sops' } : { k: 'space', id: 'operations' }));
  const [open, setOpen] = useState<string[]>(['operations']);
  const [mode, setMode] = useState<'board' | 'list'>('board');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState<null | { task: Task | null; draft?: TaskDraft }>(null);
  const [detail, setDetail] = useState<string | null>(() => params.get('task'));
  const [cfg, setCfg] = useState<null | SettingsTab>(null);

  const openTask = (id: string | null) => {
    setDetail(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('task', id); else url.searchParams.delete('task');
    window.history.replaceState(null, '', url);
  };

  const go = (v: View) => {
    setView(v);
    setCfg(null);
    const url = new URL(window.location.href);
    if (v.k === 'sops') url.searchParams.set('view', 'sops'); else url.searchParams.delete('view');
    window.history.replaceState(null, '', url);
  };

  const space = view.k === 'space' ? spaces.find((s) => s.id === view.id) ?? spaces[0] : null;
  const live = tasks.filter((t) => !t.archived);

  // tasks for the active view
  const scoped =
    view.k === 'my' ? live.filter((t) => t.assignee === ME)
    : view.k === 'archived' ? tasks.filter((t) => t.archived)
    : space ? live.filter((t) => t.spaceId === space.id && (!('list' in view) || !view.list || t.list === view.list))
    : [];
  const shown = view.k === 'space' ? scoped.filter((t) => !q.trim() || t.title.toLowerCase().includes(q.trim().toLowerCase())) : scoped;

  const title = view.k === 'my' ? 'My Tasks' : view.k === 'archived' ? 'Archived Tasks' : space?.name ?? '';
  const newTask = (status?: Status) =>
    setModal({ task: null, draft: { spaceId: space?.id ?? 'operations', list: view.k === 'space' ? view.list : undefined, status, assignee: view.k === 'my' ? ME : null } });

  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  const sub = view.k === 'space' ? 'tabs' : view.k === 'sops' ? 'none' : 'list';

  return (
    <div className="-mb-20 flex h-[calc(100vh-5.5rem)] min-h-[560px] gap-1.5 pt-2 max-lg:h-auto max-lg:flex-col">
      {/* ───── hub sidebar ───── */}
      <aside className="border-ed-line flex w-[240px] shrink-0 flex-col rounded-xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)] max-lg:w-full">
        <div className="border-ed-line flex items-center justify-between border-b px-4 py-[18px]">
          <div className="flex items-center gap-2.5">
            <span className="rounded-md bg-[#7c1ee6] px-1.5 py-[3px] text-[10px] leading-none font-bold text-white">V2</span>
            <span className="text-[15.5px] font-medium">Task Hub</span>
          </div>
          <button type="button" aria-label="Task settings" onClick={() => setCfg('priorities')} className="text-ed-text/65 hover:text-[#7c1ee6]"><Settings className="size-4" /></button>
        </div>

        <nav className="thin-scroll flex-1 overflow-y-auto p-2">
          <button type="button" onClick={() => go({ k: 'my' })} className={cn(navItem, view.k === 'my' ? 'bg-[#f1f0f6] font-medium' : 'text-ed-text/75 hover:bg-ed-bg')}><ListChecks className="size-4" />My Tasks</button>
          <button type="button" onClick={() => go({ k: 'sops' })} className={cn(navItem, 'mt-1.5', view.k === 'sops' ? cn(violet, 'font-medium text-white shadow-[0_3px_8px_rgba(124,30,230,0.35)]') : 'text-ed-text/75 hover:bg-ed-bg')}><ClipboardList className="size-4" />My SOPs &amp; Checklists</button>

          <p className="text-ed-text/60 mt-6 mb-2 px-3 text-[11px] font-medium tracking-wider uppercase">Spaces</p>
          {spaces.map((s) => {
            const isOpen = open.includes(s.id);
            const active = view.k === 'space' && view.id === s.id;
            return (
              <div key={s.id} className="mb-1">
                <div className={cn('flex h-9 items-center rounded-lg pr-2 text-[13.5px]', active && !('list' in view && view.list) ? 'bg-[#f1f0f6]' : 'hover:bg-ed-bg')}>
                  <button type="button" aria-label={isOpen ? `Collapse ${s.name}` : `Expand ${s.name}`} onClick={() => toggle(s.id)} className="text-ed-text/60 flex h-full w-8 items-center justify-center">
                    {isOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                  </button>
                  <button type="button" onClick={() => { go({ k: 'space', id: s.id }); if (!isOpen) toggle(s.id); }} className="flex h-full flex-1 items-center gap-2.5 text-left">
                    <span className="flex size-5 items-center justify-center text-[15px] leading-none">{s.icon}</span>{s.name}
                  </button>
                </div>
                {isOpen && s.lists.map((l) => (
                  <button key={l} type="button" onClick={() => go({ k: 'space', id: s.id, list: l })}
                    className={cn('text-ed-text/70 hover:text-ed-text flex h-8 w-full items-center gap-2.5 pl-10 text-left text-[13px]', active && view.k === 'space' && view.list === l && 'font-semibold text-[#6d17d0]')}>
                    <i className="size-1.5 rounded-full bg-[#b5b2c0]" />{l}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="border-ed-line border-t p-2">
          <button type="button" onClick={() => go({ k: 'archived' })} className={cn(navItem, 'py-5', view.k === 'archived' ? 'bg-[#f1f0f6] font-medium' : 'text-ed-text/75 hover:bg-ed-bg')}><Archive className="size-4" />Archived Tasks</button>
        </div>
      </aside>

      {/* ───── content ───── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {cfg && <SettingsPanel spaceId={space?.id ?? spaces[0].id} initialTab={cfg} onClose={() => setCfg(null)} />}
        {!cfg && view.k !== 'sops' && (
          <header className="border-ed-line flex flex-wrap items-stretch gap-x-5 rounded-xl border bg-white pr-4 pl-5 shadow-[0_1px_3px_rgba(30,20,50,0.05)]">
            <div className="flex items-center gap-3 py-3.5">
              {space && <span className="flex size-7 items-center justify-center text-[20px] leading-none">{space.icon}</span>}
              {view.k === 'my' && <ListChecks className="size-5" />}{view.k === 'archived' && <Archive className="size-5" />}
              <h1 className="text-[19px] font-semibold tracking-tight">{title}{view.k === 'space' && view.list && <span className="text-ed-text/55 ml-1.5 text-[14px] font-normal">/ {view.list}</span>}</h1>
            </div>
            {sub === 'tabs' && (
              <div role="tablist" className="border-ed-line ml-1 flex items-stretch gap-5 border-l pl-5">
                {([['board', 'Board', LayoutGrid], ['list', 'List', List]] as const).map(([k, label, Icon]) => (
                  <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)}
                    className={cn('flex items-center gap-2 border-b-2 px-1 text-[14px]', mode === k ? 'border-[#7c1ee6] font-medium text-[#7c1ee6]' : 'text-ed-text/60 hover:text-ed-text border-transparent')}><Icon className="size-4" />{label}</button>
                ))}
              </div>
            )}
            <div className="ml-auto flex items-center gap-2.5 py-2.5">
              <div className="relative w-[222px] max-sm:w-[160px]">
                <Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks..." className="border-ed-line placeholder:text-ed-muted h-10 w-full rounded-lg border bg-[#f9f8fb] pr-3 pl-9 text-[13.5px] outline-none focus:border-[#7c1ee6]" />
              </div>
              {space && <button type="button" onClick={() => setCfg('spaces')} className="border-ed-line hover:text-[#7c1ee6] flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[14px] font-medium"><Settings className="size-4" />Configure</button>}
              <button type="button" onClick={() => newTask()} className={cn('flex h-10 items-center gap-2 rounded-lg px-4 text-[14px] font-semibold text-white', violet)}><Plus className="size-4" />New Task</button>
            </div>
          </header>
        )}

        {!cfg && view.k === 'sops' && <SopsView />}
        {!cfg && view.k === 'space' && mode === 'board' && <BoardView tasks={shown} onOpen={(t) => openTask(t.id)} spaceId={space?.id ?? 'operations'} list={view.list ?? space?.lists[0]} />}
        {!cfg && view.k !== 'sops' && !(view.k === 'space' && mode === 'board') && (
          <ListView tasks={view.k === 'space' ? scoped : shown} spaces={spaces} q={q} setQ={setQ} onOpen={(t) => openTask(t.id)} />
        )}
      </div>

      {modal && <TaskModal spaces={spaces} labels={labels} task={modal.task} draft={modal.draft} onClose={() => setModal(null)} />}
      {detail && tasks.find((t) => t.id === detail) && (
        <TaskDetail task={tasks.find((t) => t.id === detail)!} spaces={spaces} labels={labels} onClose={() => openTask(null)} />
      )}
    </div>
  );
}
