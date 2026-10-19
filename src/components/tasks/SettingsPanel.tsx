'use client';

import { Check, ChevronDown, Flag, Folder, GripVertical, Layers, Plus, SlidersHorizontal, Trash2, Users, X, type LucideIcon } from 'lucide-react';
import { useState, type DragEvent, type ReactNode } from 'react';
import { getStatuses, ROLES, taskActions, TEAM, useTaskState, type Role, type StatusType } from '@/lib/taskStore';
import { cn } from '@/lib/utils';
import { useOutside } from './ui';

export type SettingsTab = 'spaces' | 'status' | 'priorities' | 'permissions';

const TABS: { k: SettingsTab; label: string; Icon: LucideIcon }[] = [
  { k: 'spaces', label: 'Spaces & Lists', Icon: Layers },
  { k: 'status', label: 'Status Columns', Icon: SlidersHorizontal },
  { k: 'priorities', label: 'Priorities & Labels', Icon: Flag },
  { k: 'permissions', label: 'Permissions & Members', Icon: Users },
];

const ICONS = ['📁', '⚙️', '📣', '💰', '🎧', '📦', '🛒', '🚚', '📞', '🧾', '📊', '🛠️', '👥', '🏷️', '⭐', '🔥'];
const TYPES: StatusType[] = ['Active', 'Done', 'Cancelled'];

const input = 'border-ed-line placeholder:text-ed-text/40 h-9 w-full rounded-lg border bg-[#fafafa] px-3 text-[12.5px] outline-none focus:border-[#7c1ee6]';
const plusBtn = 'flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#7c1ee6] text-white transition hover:bg-[#6d17d0]';
const row = 'border-ed-line flex h-10 items-center gap-2.5 rounded-lg border bg-white px-3 text-[12px] font-semibold';

/* ───── small building blocks ───── */
function Card({ title, right, children, className }: { title: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('border-ed-line min-w-0 rounded-xl border bg-white p-4 shadow-[0_1px_3px_rgba(30,20,50,0.05)]', className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[13.5px] font-semibold">{title}</h3>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Lbl({ children }: { children: ReactNode }) {
  return <span className="text-ed-text/70 mb-1.5 block text-[9.5px] font-semibold tracking-wide uppercase">{children}</span>;
}

function Color({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <input type="color" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
      className="border-ed-line h-9 w-14 shrink-0 cursor-pointer rounded-lg border bg-white p-1 [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0" />
  );
}

/** custom select: check mark + rounded popover (native select noy) */
function Drop({ value, options, onChange, label, className, small }: { value: string; options: string[]; onChange: (v: string) => void; label: string; className?: string; small?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside<HTMLDivElement>(() => setOpen(false), open);
  return (
    <div ref={ref} className={cn('relative', className)}>
      <button type="button" aria-label={label} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className={cn('border-ed-line flex w-full items-center justify-between gap-2 rounded-lg border bg-white text-left outline-none focus:border-[#7c1ee6]', small ? 'h-7 px-2.5 text-[10.5px]' : 'h-9 px-3 text-[12px]')}>
        <span className="truncate">{value}</span><ChevronDown className="text-ed-text/60 size-3.5 shrink-0" />
      </button>
      {open && (
        <ul role="listbox" className="border-ed-line absolute top-full right-0 z-30 mt-1 min-w-full rounded-lg border bg-white p-1 shadow-[0_12px_32px_rgba(30,20,50,0.16)]">
          {options.map((o) => (
            <li key={o}>
              <button type="button" role="option" aria-selected={o === value} onClick={() => { onChange(o); setOpen(false); }}
                className={cn('flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[12.5px] whitespace-nowrap hover:bg-[#f3e9fd]/60', o === value && 'bg-[#f3e9fd]')}>
                <span className="flex size-3.5 items-center justify-center">{o === value && <Check className="size-3.5 text-[#7c1ee6]" />}</span>{o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IconPick({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside<HTMLDivElement>(() => setOpen(false), open);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="Choose icon" onClick={() => setOpen((o) => !o)} className="border-ed-line flex h-9 w-12 items-center justify-center rounded-lg border bg-white text-[16px] outline-none hover:border-[#7c1ee6]">
        {value === '📁' ? <Folder className="size-4 fill-[#f5c04a] text-[#c98a12]" /> : value}
      </button>
      {open && (
        <div className="border-ed-line absolute top-full left-0 z-30 mt-1 grid w-[184px] grid-cols-4 gap-1 rounded-lg border bg-white p-2 shadow-[0_12px_32px_rgba(30,20,50,0.16)]">
          {ICONS.map((i) => <button key={i} type="button" onClick={() => { onChange(i); setOpen(false); }} className={cn('flex size-9 items-center justify-center rounded-md text-[17px] hover:bg-[#f3e9fd]', i === value && 'bg-[#f3e9fd]')}>{i}</button>)}
        </div>
      )}
    </div>
  );
}

/** HTML5 drag-to-reorder (grip handle) */
function useReorder(onMove: (from: number, to: number) => void) {
  const [from, setFrom] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const end = () => { setFrom(null); setOver(null); };
  return (i: number) => ({
    draggable: true,
    'data-over': over === i && from !== null && from !== i ? '' : undefined,
    onDragStart: (e: DragEvent) => { setFrom(i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); },
    onDragOver: (e: DragEvent) => { e.preventDefault(); setOver(i); },
    onDrop: (e: DragEvent) => { e.preventDefault(); if (from !== null) onMove(from, i); end(); },
    onDragEnd: end,
  });
}

const Grip = () => <GripVertical className="text-ed-text/35 size-3.5 shrink-0 cursor-grab" />;
const Trash = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button type="button" aria-label={label} onClick={(e) => { e.stopPropagation(); onClick(); }} className="text-ed-text/45 ml-auto shrink-0 hover:text-[#ef4444]"><Trash2 className="size-3.5" /></button>
);
const Empty = ({ children }: { children: ReactNode }) => <p className="text-ed-text/50 py-3 text-[12px] italic">{children}</p>;

/* ───── tab 1: spaces & lists ───── */
function SpacesTab({ initialSpaceId }: { initialSpaceId: string }) {
  const { spaces } = useTaskState();
  const [selId, setSelId] = useState(initialSpaceId);
  const sel = spaces.find((s) => s.id === selId) ?? spaces[0];
  const [icon, setIcon] = useState('📁');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#7c3aed');
  const [list, setList] = useState('');
  const dragSpace = useReorder(taskActions.reorderSpaces);
  const dragList = useReorder((f, t) => taskActions.reorderLists(sel.id, f, t));

  const addSpace = () => {
    const id = taskActions.addSpace(name, icon, color);
    if (id) { setSelId(id); setName(''); setIcon('📁'); }
  };
  const addList = () => { if (list.trim()) { taskActions.addList(sel.id, list.trim()); setList(''); } };
  const delSpace = (id: string, n: string) => {
    if (spaces.length <= 1) return alert('At least one space is required.');
    if (confirm(`Delete "${n}" and all its tasks?`)) taskActions.removeSpace(id);
  };

  return (
    <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
      <Card title="Create Department (Space)">
        <div className="flex items-end gap-2">
          <div><Lbl>Icon</Lbl><IconPick value={icon} onChange={setIcon} /></div>
          <label className="min-w-0 flex-1"><Lbl>Space name</Lbl><input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSpace()} placeholder="Customer Care" className={input} /></label>
          <div><Lbl>Color</Lbl><Color value={color} onChange={setColor} label="Space color" /></div>
          <button type="button" aria-label="Add space" onClick={addSpace} className={plusBtn}><Plus className="size-4" /></button>
        </div>
        <p className="text-ed-text/70 mt-6 mb-2 text-[9.5px] font-semibold tracking-wide uppercase">Existing spaces (drag to reorder)</p>
        <ul className="thin-scroll max-h-[212px] space-y-2 overflow-y-auto pr-1">
          {spaces.map((s, i) => (
            <li key={s.id} {...dragSpace(i)} onClick={() => setSelId(s.id)}
              className={cn(row, 'cursor-pointer data-[over]:border-[#7c1ee6]', s.id === sel.id && 'border-[#a78bfa] bg-[#faf7ff]')}>
              <Grip /><span className="text-[13px] leading-none">{s.icon}</span><span className="truncate">{s.name}</span>
              <Trash label={`Delete ${s.name}`} onClick={() => delSpace(s.id, s.name)} />
            </li>
          ))}
        </ul>
      </Card>

      <Card title={`Lists inside ${sel.name}`}>
        <div className="flex items-end gap-2">
          <label className="min-w-0 flex-1"><Lbl>List name</Lbl><input value={list} onChange={(e) => setList(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addList()} placeholder="Pathao Issues" className={input} /></label>
          <button type="button" aria-label="Add list" onClick={addList} className={plusBtn}><Plus className="size-4" /></button>
        </div>
        <p className="text-ed-text/70 mt-6 mb-2 text-[9.5px] font-semibold tracking-wide uppercase">Existing lists (drag to reorder)</p>
        <ul className="space-y-2">
          {sel.lists.map((l, i) => (
            <li key={l} {...dragList(i)} className={cn(row, 'data-[over]:border-[#7c1ee6]')}>
              <Grip /><span className="truncate">{l}</span>
              <Trash label={`Delete ${l}`} onClick={() => (sel.lists.length <= 1 ? alert('At least one list is required.') : taskActions.removeList(sel.id, l))} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ───── tab 2: status columns ───── */
function StatusTab({ initialSpaceId }: { initialSpaceId: string }) {
  const { spaces } = useTaskState();
  const [spaceId, setSpaceId] = useState(initialSpaceId);
  const space = spaces.find((s) => s.id === spaceId) ?? spaces[0];
  const cols = getStatuses(space.id);
  const [name, setName] = useState('');
  const [type, setType] = useState<StatusType>('Active');
  const [color, setColor] = useState('#6b7280');
  const drag = useReorder((f, t) => taskActions.reorderStatuses(space.id, f, t));
  const add = () => { if (name.trim()) { taskActions.addStatus(space.id, { name, type, color }); setName(''); } };

  return (
    <Card title="Custom Status Columns per Space" className="max-w-[575px]"
      right={<Drop label="Space" value={space.name} options={spaces.map((s) => s.name)} onChange={(n) => setSpaceId(spaces.find((s) => s.name === n)?.id ?? spaceId)} className="w-[192px]" />}>
      <div className="flex items-end gap-2">
        <label className="min-w-0 flex-1"><Lbl>Status column name</Lbl><input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Pending Courier Pick" className={input} /></label>
        <div className="w-[112px]"><Lbl>Type</Lbl><Drop label="Type" value={type} options={TYPES} onChange={(v) => setType(v as StatusType)} /></div>
        <div><Lbl>Color</Lbl><Color value={color} onChange={setColor} label="Status color" /></div>
        <button type="button" aria-label="Add status" onClick={add} className={plusBtn}><Plus className="size-4" /></button>
      </div>
      <p className="text-ed-text/70 mt-6 mb-2 text-[9.5px] font-semibold tracking-wide uppercase">Configured columns (drag to reorder)</p>
      <ul className="space-y-2">
        {cols.map((c, i) => (
          <li key={c.id} {...drag(i)} className={cn(row, 'h-[41px] data-[over]:border-[#7c1ee6]')}>
            <Grip /><i className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} /><span className="truncate">{c.name}</span>
            <span className="rounded px-1.5 py-[2px] text-[8.5px] font-semibold tracking-wide uppercase" style={{ backgroundColor: `${c.color}1f`, color: c.color }}>{c.type === 'Active' ? 'Active' : c.type}</span>
            <Trash label={`Delete ${c.name}`} onClick={() => (cols.length <= 1 ? alert('At least one status column is required.') : taskActions.removeStatus(space.id, c.id))} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ───── tab 3: priorities & labels ───── */
function PrioritiesTab() {
  const { priorities, labels, labelColors } = useTaskState();
  const [pName, setPName] = useState('');
  const [pColor, setPColor] = useState('#9ca3af');
  const [lName, setLName] = useState('');
  const [lColor, setLColor] = useState('#3b82f6');
  const drag = useReorder(taskActions.reorderPriorities);
  const addP = () => { if (pName.trim()) { taskActions.addPriority(pName, pColor); setPName(''); } };
  const addL = () => { if (lName.trim()) { taskActions.addLabel(lName.trim(), lColor); setLName(''); } };

  return (
    <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
      <Card title="Business Priorities">
        <div className="flex items-end gap-2">
          <label className="min-w-0 flex-1"><Lbl>Priority name</Lbl><input value={pName} onChange={(e) => setPName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addP()} placeholder="Urgent" className={input} /></label>
          <div><Lbl>Color</Lbl><Color value={pColor} onChange={setPColor} label="Priority color" /></div>
          <button type="button" aria-label="Add priority" onClick={addP} className={plusBtn}><Plus className="size-4" /></button>
        </div>
        <ul className="mt-5 space-y-2">
          {priorities.length === 0 && <Empty>No priorities yet.</Empty>}
          {priorities.map((p, i) => (
            <li key={p.name} {...drag(i)} className={cn(row, 'h-[41px] data-[over]:border-[#7c1ee6]')}>
              <Grip /><Flag className="size-3.5 shrink-0 fill-current" style={{ color: p.color }} /><span className="truncate">{p.name}</span>
              <Trash label={`Delete ${p.name}`} onClick={() => taskActions.removePriority(p.name)} />
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Task Labels">
        <div className="flex items-end gap-2">
          <label className="min-w-0 flex-1"><Lbl>Label name</Lbl><input value={lName} onChange={(e) => setLName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addL()} placeholder="Return Issue" className={input} /></label>
          <div><Lbl>Color</Lbl><Color value={lColor} onChange={setLColor} label="Label color" /></div>
          <button type="button" aria-label="Add label" onClick={addL} className={plusBtn}><Plus className="size-4" /></button>
        </div>
        <ul className="mt-5 space-y-2">
          {labels.length === 0 && <Empty>No labels yet.</Empty>}
          {labels.map((l) => (
            <li key={l} className={cn(row, 'h-[41px]')}>
              <i className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: labelColors[l] ?? '#7c1ee6' }} /><span className="truncate">{l}</span>
              <Trash label={`Delete ${l}`} onClick={() => taskActions.removeLabel(l)} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ───── tab 4: permissions & members ───── */
function PermissionsTab({ initialSpaceId }: { initialSpaceId: string }) {
  const { spaces, members } = useTaskState();
  const [spaceId, setSpaceId] = useState(initialSpaceId);
  const space = spaces.find((s) => s.id === spaceId) ?? spaces[0];
  const access = members[space.id] ?? [];
  const [who, setWho] = useState<string>(TEAM[0]);
  const [role, setRole] = useState<Role>('Member');

  return (
    <Card title="Space Access & Roles" className="max-w-[672px]"
      right={<Drop label="Space" value={space.name} options={spaces.map((s) => s.name)} onChange={(n) => setSpaceId(spaces.find((s) => s.name === n)?.id ?? spaceId)} className="w-[192px]" />}>
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1"><Lbl>Select team member</Lbl><Drop label="Team member" value={who} options={[...TEAM]} onChange={setWho} className="[&_ul]:left-0 [&_ul]:right-auto" /></div>
        <div className="w-[128px]"><Lbl>Role</Lbl><Drop label="Role" value={role} options={ROLES} onChange={(v) => setRole(v as Role)} /></div>
        <button type="button" aria-label="Give access" onClick={() => taskActions.addMember(space.id, who, role)} className={plusBtn}><Plus className="size-4" /></button>
      </div>
      <p className="text-ed-text/70 mt-6 mb-2 text-[9.5px] font-semibold tracking-wide uppercase">Current access list</p>
      <ul className="space-y-2">
        {access.length === 0 && <Empty>No one has been given access yet.</Empty>}
        {access.map((m) => (
          <li key={m.name} className="border-ed-line flex h-[50px] items-center gap-3 rounded-lg border bg-white px-3 text-[12px] font-semibold">
            <span className="truncate">{m.name}</span>
            <Drop label={`Role of ${m.name}`} small value={m.role} options={ROLES} onChange={(v) => taskActions.setMemberRole(space.id, m.name, v as Role)} className="ml-auto w-[112px] font-normal" />
            <Trash label={`Remove ${m.name}`} onClick={() => taskActions.removeMember(space.id, m.name)} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ───── panel ───── */
export function SettingsPanel({ spaceId, initialTab = 'spaces', onClose }: { spaceId: string; initialTab?: SettingsTab; onClose: () => void }) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  return (
    <section aria-label="Task Management Settings" className="border-ed-line mt-6 rounded-xl border bg-white p-6 shadow-[0_1px_3px_rgba(30,20,50,0.05)]">
      <div className="border-ed-line flex items-start justify-between border-b pb-5">
        <div>
          <h2 className="text-[19px] font-semibold tracking-tight">Task Management Settings</h2>
          <p className="text-ed-text/65 mt-0.5 text-[11.5px]">Configure spaces, lists, status columns, labels, and roles.</p>
        </div>
        <button type="button" aria-label="Close settings" onClick={onClose} className="text-ed-text/80 hover:text-ed-text mt-1 mr-2"><X className="size-4" /></button>
      </div>

      <div role="tablist" className="mt-6 flex flex-wrap gap-1 rounded-lg bg-[#f6f5fa] p-1">
        {TABS.map(({ k, label, Icon }) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={cn('flex h-8 items-center gap-2 rounded-md px-3 text-[11.5px] font-medium transition', tab === k ? 'text-ed-text bg-white shadow-[0_1px_3px_rgba(30,20,50,0.12)]' : 'text-ed-text/60 hover:text-ed-text')}>
            <Icon className="size-3.5" />{label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'spaces' && <SpacesTab initialSpaceId={spaceId} />}
        {tab === 'status' && <StatusTab initialSpaceId={spaceId} />}
        {tab === 'priorities' && <PrioritiesTab />}
        {tab === 'permissions' && <PermissionsTab initialSpaceId={spaceId} />}
      </div>
    </section>
  );
}
