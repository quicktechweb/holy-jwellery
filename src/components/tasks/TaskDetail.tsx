'use client';

import {
  Archive, Calendar, CheckSquare, ChevronDown, Flag, Link2, MoreHorizontal, Mic, Paperclip, Square, Tag, Trash2, User, X, ChevronRight, Check, FileText,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ASSIGNEES, ME, getStatuses, priorityColor, priorityNames, taskActions, type Priority, type Space, type Task } from '@/lib/taskStore';
import { cn } from '@/lib/utils';
import { Avatar, fmtDay, fmtStamp, StatusChip, useOutside, violet } from './ui';


/* ───── small pieces ───── */
function Prop({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: ReactNode }) {
  return (
    <div className="flex h-10 items-center">
      <span className="text-ed-text/65 flex w-[108px] shrink-0 items-center gap-2.5 text-[13px] font-medium"><Icon className="size-[15px]" />{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Pop({ trigger, children, align = 'left' }: { trigger: ReactNode; children: (close: () => void) => ReactNode; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside<HTMLDivElement>(() => setOpen(false), open);
  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="hover:bg-ed-bg -mx-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px]">{trigger}</button>
      {open && (
        <div className={cn('border-ed-line absolute top-full z-30 mt-1 min-w-[170px] rounded-lg border bg-white p-1 shadow-[0_12px_32px_rgba(30,20,50,0.16)]', align === 'right' ? 'right-0' : 'left-0')}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
const item = 'hover:bg-ed-bg flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-[13px]';

function DateCell({ value, empty, onChange }: { value: string; empty: string; onChange: (v: string) => void }) {
  return (
    <div className="relative inline-flex items-center">
      <span className={cn('hover:bg-ed-bg -mx-2 rounded-md px-2 py-1 text-[13px]', value ? 'text-ed-text' : 'text-ed-muted')} suppressHydrationWarning>{value ? fmtDay(value) : empty}</span>
      <input type="date" value={value} aria-label={empty} onChange={(e) => onChange(e.target.value)} onClick={(e) => e.currentTarget.showPicker?.()} className="absolute inset-0 cursor-pointer opacity-0" />
      {value && <button type="button" aria-label="Clear date" onClick={() => onChange('')} className="text-ed-muted hover:text-ed-red ml-1.5"><X className="size-3.5" /></button>}
    </div>
  );
}

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(Math.round(n / 1024), 1)} KB`);

/* ───── modal ───── */
export function TaskDetail({ task, spaces, labels, onClose }: { task: Task; spaces: Space[]; labels: string[]; onClose: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description);
  const [tab, setTab] = useState<'comments' | 'activity'>('comments');
  const [comment, setComment] = useState('');
  const [copied, setCopied] = useState(false);
  const [recording, setRecording] = useState(false);
  const [err, setErr] = useState('');
  const rec = useRef<MediaRecorder | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const space = spaces.find((s) => s.id === task.spaceId);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const saveTitle = () => {
    const t = title.trim();
    if (!t) return setTitle(task.title);
    if (t !== task.title) taskActions.update(task.id, { title: t });
  };
  const saveDesc = () => desc !== task.description && taskActions.update(task.id, { description: desc });
  const send = () => { if (comment.trim()) { taskActions.comment(task.id, comment.trim()); setComment(''); } };

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      if (f.size > 10 * 1024 * 1024) return setErr(`${f.name} is larger than 10 MB.`);
      setErr('');
      taskActions.addAttachment(task.id, { name: f.name, size: f.size, kind: 'file', url: URL.createObjectURL(f) });
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  const toggleRec = async () => {
    if (recording) { rec.current?.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: mr.mimeType });
        taskActions.addAttachment(task.id, { name: 'Voice note', size: blob.size, kind: 'voice', url: URL.createObjectURL(blob) });
        setRecording(false);
      };
      mr.start();
      rec.current = mr;
      setRecording(true);
      setErr('');
    } catch {
      setErr('Microphone access was blocked or is unavailable.');
    }
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setErr('Could not copy the link.'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={`Task: ${task.title}`} className="flex h-[min(810px,calc(100vh-2rem))] w-full max-w-[1152px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* header */}
        <header className="border-ed-line flex items-center justify-between gap-3 border-b px-6 py-3.5">
          <nav aria-label="Location" className="flex min-w-0 items-center gap-3 text-[13px]">
            <span className="font-medium text-[#6d28d9]">{space?.name}</span>
            <ChevronRight className="text-ed-muted size-3.5" />
            <span className="text-ed-text/65">{task.list}</span>
            <span className="flex items-center gap-1.5 rounded-md bg-[#f1e9fd] px-2 py-1 text-[10.5px] font-bold tracking-wide text-[#7c1ee6] uppercase"><CheckSquare className="size-3" />Task</span>
          </nav>
          <div className="text-ed-text/65 flex items-center gap-4 text-[12px]">
            <span className="whitespace-nowrap max-sm:hidden" suppressHydrationWarning>Created {fmtDay(task.createdAt)}</span>
            <button type="button" aria-label="Copy link" onClick={copyLink} className="hover:text-[#7c1ee6]">{copied ? <Check className="size-4 text-[#10b981]" /> : <Link2 className="size-4" />}</button>
            <Pop align="right" trigger={<MoreHorizontal className="size-4" />}>
              {(close) => (
                <>
                  <button type="button" className={item} onClick={() => { taskActions.update(task.id, { archived: !task.archived }); close(); onClose(); }}><span className="flex items-center gap-2"><Archive className="size-3.5" />{task.archived ? 'Unarchive' : 'Archive'}</span></button>
                  <button type="button" className={cn(item, 'text-ed-red')} onClick={() => { if (confirm('Delete this task?')) { taskActions.remove(task.id); onClose(); } }}><span className="flex items-center gap-2"><Trash2 className="size-3.5" />Delete</span></button>
                </>
              )}
            </Pop>
            <button type="button" aria-label="Close" onClick={onClose} className="text-ed-text hover:text-[#7c1ee6]"><X className="size-[18px]" /></button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 max-md:flex-col max-md:overflow-y-auto">
          {/* main */}
          <div className="thin-scroll min-w-0 flex-1 overflow-y-auto px-6 pb-8 max-md:overflow-visible">
            <div className="max-w-[672px]">
              <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} aria-label="Task title"
                className="placeholder:text-ed-muted w-full bg-transparent pt-7 pb-5 text-[24px] leading-tight font-bold tracking-tight outline-none" />
              <div className="border-ed-line border-t" />
              <div className="grid grid-cols-2 gap-x-8 py-3 max-sm:grid-cols-1">
                <Prop icon={CheckSquare} label="Status">
                  <Pop trigger={<><StatusChip status={task.status} solid spaceId={task.spaceId} /><ChevronDown className="text-ed-text/60 size-3.5" /></>}>
                    {(close) => getStatuses(task.spaceId).map((d) => d.name).map((s) => (
                      <button key={s} type="button" className={item} onClick={() => { taskActions.update(task.id, { status: s }); close(); }}><StatusChip status={s} solid spaceId={task.spaceId} />{s === task.status && <Check className="size-3.5 text-[#7c1ee6]" />}</button>
                    ))}
                  </Pop>
                </Prop>
                <Prop icon={Flag} label="Priority">
                  <Pop trigger={<><span className={task.priority === 'None' ? 'text-ed-muted' : 'flex items-center gap-1.5'}>{task.priority === 'None' ? 'No Priority' : <><Flag style={{ color: priorityColor(task.priority) }} className="size-3.5 fill-current" />{task.priority}</>}</span><ChevronDown className="text-ed-text/60 size-3.5" /></>}>
                    {(close) => ['None', ...priorityNames()].map((p) => (
                      <button key={p} type="button" className={item} onClick={() => { taskActions.update(task.id, { priority: p }); close(); }}>
                        <span className="flex items-center gap-2"><Flag style={p === 'None' ? undefined : { color: priorityColor(p) }} className={cn('size-3.5', p === 'None' ? 'text-ed-muted' : 'fill-current')} />{p === 'None' ? 'No Priority' : p}</span>{p === task.priority && <Check className="size-3.5 text-[#7c1ee6]" />}
                      </button>
                    ))}
                  </Pop>
                </Prop>
                <Prop icon={Calendar} label="Start Date"><DateCell value={task.startDate} empty="No start date" onChange={(v) => taskActions.update(task.id, { startDate: v })} /></Prop>
                <Prop icon={Calendar} label="Due Date"><DateCell value={task.due} empty="No due date" onChange={(v) => taskActions.update(task.id, { due: v })} /></Prop>
                <Prop icon={User} label="Assignee">
                  <Pop trigger={<>{task.assignee ? <span className="flex items-center gap-2"><Avatar name={task.assignee} />{task.assignee}</span> : <span className="text-ed-text/70">Unassigned</span>}<ChevronDown className="text-ed-text/60 size-3.5" /></>}>
                    {(close) => ['Unassigned', ...ASSIGNEES].map((a) => (
                      <button key={a} type="button" className={item} onClick={() => { taskActions.update(task.id, { assignee: a === 'Unassigned' ? null : a }); close(); }}>
                        <span className="flex items-center gap-2">{a !== 'Unassigned' && <Avatar name={a} />}{a}{a === ME && <span className="text-ed-muted text-[11px]">(you)</span>}</span>{(task.assignee ?? 'Unassigned') === a && <Check className="size-3.5 text-[#7c1ee6]" />}
                      </button>
                    ))}
                  </Pop>
                </Prop>
                <Prop icon={Tag} label="Labels">
                  <Pop trigger={task.labels.length ? <span className="flex flex-wrap gap-1">{task.labels.map((l) => <span key={l} className="rounded-full bg-[#f3e9fd] px-2 py-0.5 text-[11.5px] text-[#6d17d0]">{l}</span>)}</span> : <span className="text-ed-muted">Select labels</span>}>
                    {() => labels.length === 0
                      ? <p className="text-ed-muted px-2.5 py-2 text-[12px] italic">No labels configured. Create some in Settings.</p>
                      : labels.map((l) => (
                        <button key={l} type="button" className={item} onClick={() => taskActions.update(task.id, { labels: task.labels.includes(l) ? task.labels.filter((x) => x !== l) : [...task.labels, l] })}>
                          {l}{task.labels.includes(l) ? <Check className="size-3.5 text-[#7c1ee6]" /> : <Square className="text-ed-muted/50 size-3.5" />}
                        </button>
                      ))}
                  </Pop>
                </Prop>
              </div>
              <div className="border-ed-line border-t" />
            </div>

            <h3 className="text-ed-text/65 mt-7 text-[11.5px] font-bold tracking-wider uppercase">Description</h3>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} onBlur={saveDesc} placeholder="Add a detailed description for this task..." rows={5} aria-label="Description"
              className="placeholder:text-ed-muted mt-3 min-h-[110px] w-full resize-y bg-transparent text-[14px] leading-relaxed outline-none" />

            <h3 className="text-ed-text/65 border-ed-line mt-8 flex items-center gap-2 border-b pb-3 text-[11.5px] font-bold tracking-wider uppercase"><Paperclip className="size-3.5" />Attachments</h3>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <input ref={fileRef} type="file" multiple hidden onChange={(e) => onFiles(e.target.files)} />
              <button type="button" onClick={() => fileRef.current?.click()} className="border-ed-line hover:text-[#7c1ee6] flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[13px] font-medium shadow-sm"><Paperclip className="size-4" />Upload File</button>
              <button type="button" onClick={toggleRec} className={cn('flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[13px] font-medium shadow-sm', recording ? 'border-[#ef4444] text-[#ef4444]' : 'border-ed-line hover:text-[#7c1ee6]')}>
                <Mic className={cn('size-4', recording ? 'animate-pulse' : 'text-[#ef6b7e]')} />{recording ? 'Stop Recording' : 'Record Voice'}
              </button>
            </div>
            {err && <p role="alert" className="text-ed-red mt-3 text-[12.5px]">{err}</p>}
            {task.attachments.length === 0
              ? <p className="text-ed-text/60 mt-6 text-[13px] italic">No attachments yet.</p>
              : <ul className="mt-5 space-y-2.5">{task.attachments.map((a) => (
                  <li key={a.id} className="border-ed-line flex items-center gap-3 rounded-lg border px-3 py-2.5 text-[13px]">
                    {a.kind === 'voice' ? <Mic className="size-4 text-[#ef6b7e]" /> : <FileText className="text-ed-text/60 size-4" />}
                    {a.kind === 'voice' ? <audio controls src={a.url} className="h-8 max-w-[260px] flex-1" /> : <a href={a.url} download={a.name} className="min-w-0 flex-1 truncate hover:text-[#7c1ee6]">{a.name}</a>}
                    <span className="text-ed-muted text-[11.5px]">{kb(a.size)}</span>
                    <button type="button" aria-label={`Remove ${a.name}`} onClick={() => taskActions.removeAttachment(task.id, a.id)} className="text-ed-muted hover:text-ed-red"><X className="size-4" /></button>
                  </li>
                ))}</ul>}
          </div>

          {/* comments / activity */}
          <aside className="border-ed-line flex w-[340px] shrink-0 flex-col border-l max-md:min-h-[420px] max-md:w-full max-md:border-t max-md:border-l-0">
            <div className="p-2">
              <div role="tablist" className="grid grid-cols-2 rounded-lg bg-[#f6f5f9] p-1 text-[13px]">
                {(['comments', 'activity'] as const).map((k) => (
                  <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md py-2 capitalize', tab === k ? 'font-semibold shadow-[0_1px_3px_rgba(30,20,50,0.12)] bg-white' : 'text-ed-text/60 hover:text-ed-text')}>{k}</button>
                ))}
              </div>
            </div>

            <div className="thin-scroll flex-1 overflow-y-auto px-4 py-3">
              {tab === 'comments' && (task.comments.length === 0
                ? <p className="mt-9 text-center text-[12.5px] text-[#6b73a0]">No comments yet. Write one below!</p>
                : <ul className="space-y-4">{task.comments.map((c) => (
                    <li key={c.id} className="flex gap-2.5">
                      <Avatar name={c.author} />
                      <div className="min-w-0 flex-1"><p className="text-[12.5px]"><span className="font-semibold">{c.author}</span> <span className="text-ed-muted ml-1 text-[11px]" suppressHydrationWarning>{fmtStamp(c.at)}</span></p><p className="mt-0.5 text-[13px] break-words whitespace-pre-wrap">{c.text}</p></div>
                    </li>
                  ))}</ul>)}
              {tab === 'activity' && (task.activity.length === 0
                ? <p className="mt-9 text-center text-[12.5px] text-[#6b73a0]">No activity yet.</p>
                : <ul className="space-y-3.5">{task.activity.map((a) => (
                    <li key={a.id} className="flex gap-2.5 text-[12.5px]">
                      <Avatar name={a.by} />
                      <p className="min-w-0 flex-1"><span className="font-semibold">{a.by}</span> {a.text}<span className="text-ed-muted block text-[11px]" suppressHydrationWarning>{fmtStamp(a.at)}</span></p>
                    </li>
                  ))}</ul>)}
            </div>

            <div className="border-ed-line border-t p-3">
              <div className="border-ed-line focus-within:border-[#7c1ee6] rounded-xl border bg-white p-2.5 shadow-[0_1px_3px_rgba(30,20,50,0.05)]">
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); } }} placeholder="Write a comment..." rows={2} aria-label="Write a comment"
                  className="placeholder:text-ed-muted h-[52px] w-full resize-none bg-transparent px-0.5 text-[13px] outline-none" />
                <div className="border-ed-line flex justify-end border-t pt-2">
                  <button type="button" onClick={send} disabled={!comment.trim()} className={cn('rounded-md px-3.5 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50', violet)}>Send</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
