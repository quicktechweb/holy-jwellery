'use client';

import { useSyncExternalStore } from 'react';

export type Status = string;
export type Priority = string; // 'None' ba configured priority name
export type StatusType = 'Active' | 'Done' | 'Cancelled';
export interface StatusDef { id: string; name: string; type: StatusType; color: string }
export interface PriorityDef { name: string; color: string }
export type Role = 'Manager' | 'Member' | 'Guest';
export interface Member { name: string; role: Role }
export const ROLES: Role[] = ['Manager', 'Member', 'Guest'];
/** TODO: API (users list) */
export const TEAM = ['Shakib N', 'Rafi Ahmed', 'Nusrat Jahan', 'Tanvir H', 'Smita E'] as const;
/** TODO: API (users list). */
export const ASSIGNEES = ['Shakib N', 'Rafi Ahmed', 'Nusrat Jahan', 'Tanvir H'] as const;
export const ME = 'Shakib N';

export interface CheckItem { id: string; text: string; done: boolean }
export interface Comment { id: string; author: string; text: string; at: string }
export interface Activity { id: string; text: string; at: string; by: string }
export interface Attachment { id: string; name: string; size: number; kind: 'file' | 'voice'; url: string }
export interface Task {
  id: string;
  title: string;
  description: string;
  spaceId: string;
  list: string;
  status: Status;
  priority: Priority;
  assignee: string | null;
  due: string; // YYYY-MM-DD or ''
  startDate: string; // YYYY-MM-DD or ''
  labels: string[];
  checklist: CheckItem[];
  createdAt: string; // YYYY-MM-DDTHH:mm (local)
  updatedAt: string; // YYYY-MM-DDTHH:mm (local)
  comments: Comment[];
  activity: Activity[];
  attachments: Attachment[];
  archived?: boolean;
}
export interface Space { id: string; name: string; icon: string; color: string; lists: string[] }

interface State {
  spaces: Space[]; tasks: Task[]; labels: string[];
  labelColors: Record<string, string>;
  statuses: Record<string, StatusDef[]>; // spaceId -> columns
  priorities: PriorityDef[];
  members: Record<string, Member[]>; // spaceId -> access list
}

const DEFAULT_COLUMNS = (): StatusDef[] => [
  { id: 'st-todo', name: 'To Do', type: 'Active', color: '#6b7280' },
  { id: 'st-prog', name: 'In Progress', type: 'Active', color: '#3b82f6' },
  { id: 'st-done', name: 'Completed', type: 'Done', color: '#10b981' },
  { id: 'st-canc', name: 'Cancelled', type: 'Cancelled', color: '#ef4444' },
];

const p = (n: number) => String(n).padStart(2, '0');
export const nowLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const T = (id: string, title: string, status: Status, updatedAt: string): Task => ({
  id, title, description: '', spaceId: 'operations', list: 'General', status, priority: 'None', assignee: null, due: '', startDate: '', labels: [], checklist: [], createdAt: updatedAt, updatedAt, comments: [], activity: [], attachments: [],
});

/** TODO: API. Screenshot er 4 ta task hubohu. */
const seed: State = {
  spaces: [
    { id: 'operations', name: 'Operations', icon: '⚙️', color: '#7c3aed', lists: ['General'] },
    { id: 'marketing', name: 'Marketing', icon: '📣', color: '#7c3aed', lists: ['General'] },
    { id: 'accounts', name: 'Accounts', icon: '💰', color: '#7c3aed', lists: ['General'] },
    { id: 'support', name: 'Customer Support', icon: '🎧', color: '#7c3aed', lists: ['General'] },
    { id: 'inventory', name: 'Inventory', icon: '📦', color: '#7c3aed', lists: ['General'] },
  ],
  tasks: [
    T('t1', 'test', 'To Do', '2026-10-18T10:52'),
    T('t2', 'processing', 'In Progress', '2026-10-18T10:53'),
    T('t3', 'fulltask', 'Completed', '2026-10-18T10:53'),
    T('t4', 'test', 'Cancelled', '2026-10-18T10:53'),
  ],
  labels: [],
  labelColors: {},
  statuses: Object.fromEntries(['operations', 'marketing', 'accounts', 'support', 'inventory'].map((id) => [id, DEFAULT_COLUMNS()])),
  priorities: [
    { name: 'Urgent', color: '#ef4444' },
    { name: 'High', color: '#f59e0b' },
    { name: 'Normal', color: '#3b82f6' },
    { name: 'Low', color: '#22c55e' },
  ],
  members: { operations: [{ name: 'Smita E', role: 'Manager' }] },
};

let state = seed;
const subs = new Set<() => void>();
const set = (next: State) => { state = next; subs.forEach((f) => f()); };

export const useTaskState = () =>
  useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, () => state, () => seed);

/** live getters (components TaskHub er state diye re-render hoy) */
const FALLBACK = '#6b7280';
export const getStatuses = (spaceId: string): StatusDef[] => state.statuses[spaceId] ?? DEFAULT_COLUMNS();
export const allStatusNames = (): string[] => [...new Set(state.spaces.flatMap((sp) => getStatuses(sp.id).map((d) => d.name)))];
const findStatus = (name: string, spaceId?: string) => (spaceId ? getStatuses(spaceId).find((d) => d.name === name) : undefined) ?? Object.values(state.statuses).flat().find((d) => d.name === name);
export const statusColor = (name: string, spaceId?: string) => findStatus(name, spaceId)?.color ?? FALLBACK;
export const isClosed = (name: string, spaceId?: string) => { const d = findStatus(name, spaceId); return d ? d.type !== 'Active' : false; };
export const priorityNames = () => state.priorities.map((x) => x.name);
export const priorityColor = (name: string) => state.priorities.find((x) => x.name === name)?.color ?? FALLBACK;
export const labelColor = (name: string) => state.labelColors[name] ?? '#7c1ee6';

function move<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const next = arr.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

const uid = (p: string) => `${p}${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
const LABEL: Partial<Record<keyof Task, string>> = { title: 'title', status: 'status', priority: 'priority', assignee: 'assignee', due: 'due date', startDate: 'start date' };
const show = (v: unknown) => (v === null || v === '' || v === undefined ? 'none' : String(v));

/** Patch apply + activity log (kon field bodlalo) */
const apply = (t: Task, patch: Partial<Task>): Task => {
  const at = nowLocal();
  const logs: Activity[] = (Object.keys(LABEL) as (keyof Task)[])
    .filter((k) => k in patch && patch[k] !== t[k])
    .map((k) => ({ id: uid('a'), by: ME, at, text: `changed ${LABEL[k]} from ${show(t[k])} to ${show(patch[k])}` }));
  return { ...t, ...patch, activity: [...logs, ...t.activity], updatedAt: at };
};

export const taskActions = {
  add: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'startDate' | 'comments' | 'activity' | 'attachments'> & Partial<Pick<Task, 'startDate'>>) => {
    const at = nowLocal();
    const id = uid('t');
    set({ ...state, tasks: [{ startDate: '', ...t, id, createdAt: at, updatedAt: at, comments: [], attachments: [], activity: [{ id: uid('a'), by: ME, at, text: 'created this task' }] }, ...state.tasks] });
    return id;
  },
  update: (id: string, patch: Partial<Task>) => set({ ...state, tasks: state.tasks.map((t) => (t.id === id ? apply(t, patch) : t)) }),
  updateMany: (ids: string[], patch: Partial<Task>) => set({ ...state, tasks: state.tasks.map((t) => (ids.includes(t.id) ? apply(t, patch) : t)) }),
  remove: (id: string) => set({ ...state, tasks: state.tasks.filter((t) => t.id !== id) }),
  comment: (id: string, text: string) =>
    set({ ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, comments: [...t.comments, { id: uid('c'), author: ME, text, at: nowLocal() }] } : t)) }),
  addAttachment: (id: string, a: Omit<Attachment, 'id'>) =>
    set({ ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, attachments: [...t.attachments, { ...a, id: uid('f') }], activity: [{ id: uid('a'), by: ME, at: nowLocal(), text: `added ${a.kind === 'voice' ? 'a voice note' : 'file ' + a.name}` }, ...t.activity] } : t)) }),
  removeAttachment: (id: string, fid: string) =>
    set({ ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, attachments: t.attachments.filter((a) => a.id !== fid) } : t)) }),
  addList: (spaceId: string, name: string) =>
    set({ ...state, spaces: state.spaces.map((s) => (s.id === spaceId && !s.lists.includes(name) ? { ...s, lists: [...s.lists, name] } : s)) }),
  addLabel: (name: string, color = '#7c1ee6') => !state.labels.includes(name) && set({ ...state, labels: [...state.labels, name], labelColors: { ...state.labelColors, [name]: color } }),
  removeLabel: (name: string) => set({ ...state, labels: state.labels.filter((l) => l !== name), tasks: state.tasks.map((t) => ({ ...t, labels: t.labels.filter((l) => l !== name) })) }),

  /* ───── settings: spaces ───── */
  addSpace: (name: string, icon: string, color: string) => {
    const n = name.trim();
    if (!n || state.spaces.some((s) => s.name.toLowerCase() === n.toLowerCase())) return null;
    const id = uid('sp');
    set({ ...state, spaces: [...state.spaces, { id, name: n, icon, color, lists: ['General'] }], statuses: { ...state.statuses, [id]: DEFAULT_COLUMNS() } });
    return id;
  },
  removeSpace: (id: string) => {
    if (state.spaces.length <= 1) return;
    const { [id]: _s, ...statuses } = state.statuses; const { [id]: _m, ...members } = state.members;
    set({ ...state, spaces: state.spaces.filter((s) => s.id !== id), tasks: state.tasks.filter((t) => t.spaceId !== id), statuses, members });
  },
  reorderSpaces: (from: number, to: number) => set({ ...state, spaces: move(state.spaces, from, to) }),

  /* lists */
  removeList: (spaceId: string, name: string) => {
    const sp = state.spaces.find((s) => s.id === spaceId);
    if (!sp || sp.lists.length <= 1) return;
    const fallback = sp.lists.find((l) => l !== name)!;
    set({ ...state, spaces: state.spaces.map((s) => (s.id === spaceId ? { ...s, lists: s.lists.filter((l) => l !== name) } : s)), tasks: state.tasks.map((t) => (t.spaceId === spaceId && t.list === name ? { ...t, list: fallback } : t)) });
  },
  reorderLists: (spaceId: string, from: number, to: number) => set({ ...state, spaces: state.spaces.map((s) => (s.id === spaceId ? { ...s, lists: move(s.lists, from, to) } : s)) }),

  /* status columns */
  addStatus: (spaceId: string, d: Omit<StatusDef, 'id'>) => {
    const n = d.name.trim();
    const cur = getStatuses(spaceId);
    if (!n || cur.some((x) => x.name.toLowerCase() === n.toLowerCase())) return;
    set({ ...state, statuses: { ...state.statuses, [spaceId]: [...cur, { ...d, name: n, id: uid('st') }] } });
  },
  removeStatus: (spaceId: string, id: string) => {
    const cur = getStatuses(spaceId);
    const gone = cur.find((x) => x.id === id);
    if (!gone || cur.length <= 1) return;
    const rest = cur.filter((x) => x.id !== id);
    set({ ...state, statuses: { ...state.statuses, [spaceId]: rest }, tasks: state.tasks.map((t) => (t.spaceId === spaceId && t.status === gone.name ? { ...t, status: rest[0].name } : t)) });
  },
  reorderStatuses: (spaceId: string, from: number, to: number) => set({ ...state, statuses: { ...state.statuses, [spaceId]: move(getStatuses(spaceId), from, to) } }),

  /* priorities */
  addPriority: (name: string, color: string) => {
    const n = name.trim();
    if (!n || n === 'None' || state.priorities.some((x) => x.name.toLowerCase() === n.toLowerCase())) return;
    set({ ...state, priorities: [...state.priorities, { name: n, color }] });
  },
  removePriority: (name: string) => set({ ...state, priorities: state.priorities.filter((x) => x.name !== name), tasks: state.tasks.map((t) => (t.priority === name ? { ...t, priority: 'None' } : t)) }),
  reorderPriorities: (from: number, to: number) => set({ ...state, priorities: move(state.priorities, from, to) }),

  /* members */
  addMember: (spaceId: string, name: string, role: Role) => {
    const cur = state.members[spaceId] ?? [];
    set({ ...state, members: { ...state.members, [spaceId]: cur.some((m) => m.name === name) ? cur.map((m) => (m.name === name ? { ...m, role } : m)) : [...cur, { name, role }] } });
  },
  setMemberRole: (spaceId: string, name: string, role: Role) => set({ ...state, members: { ...state.members, [spaceId]: (state.members[spaceId] ?? []).map((m) => (m.name === name ? { ...m, role } : m)) } }),
  removeMember: (spaceId: string, name: string) => set({ ...state, members: { ...state.members, [spaceId]: (state.members[spaceId] ?? []).filter((m) => m.name !== name) } }),
};
