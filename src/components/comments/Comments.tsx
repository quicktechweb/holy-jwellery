'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart3,
  Bookmark,
  CheckCheck,
  Eye,
  EyeOff,
  Heart,
  Layers,
  RefreshCw,
  Search,
  SendHorizontal,
  SlidersHorizontal,
  Trash2,
  Undo2,
  Zap,
  Check,
  Plus,
  X,
  MessageSquareOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  initialComments,
  initialPosts,
  type CommentChannel,
  type CommentItem,
  type Post,
  type ReplyState,
} from '@/data/comments';
import { FacebookIcon, InstagramIcon } from './icons';

/* ------------------------------------------------------------------ */
/* types & constants                                                   */
/* ------------------------------------------------------------------ */

type ChannelKey = 'ALL' | CommentChannel;
type ReplyFilter = 'all' | ReplyState;
type Flag = 'unread' | 'liked' | 'hidden' | 'deleted' | 'filtered';
type ViewMode = 'post' | 'comments';

interface Filters {
  channel: ChannelKey;
  reply: ReplyFilter;
  flags: Flag[];
  q: string;
}

interface SavedView {
  id: string;
  name: string;
  filters: Filters;
}

const replyChips: { key: ReplyFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'awaiting', label: 'Awaiting reply' },
  { key: 'replied', label: 'Replied' },
  { key: 'none', label: 'No reply needed' },
];
const flagChips: { key: Flag; label: string }[] = [
  { key: 'unread', label: 'Unread' },
  { key: 'liked', label: 'Liked' },
  { key: 'hidden', label: 'Hidden' },
  { key: 'deleted', label: 'Deleted' },
  { key: 'filtered', label: 'Filtered' },
];
const DEFAULTS: Filters = { channel: 'ALL', reply: 'awaiting', flags: [], q: '' };
const VIEWS_KEY = 'ecomdrive:comment-views';
const POLL_MS = 15000;

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function ago(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function useClickAway(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && close();
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('keydown', key);
    };
  }, [open, close]);
  return ref;
}

function ChannelBadge({ channel, className }: { channel: CommentChannel; className?: string }) {
  return channel === 'INSTAGRAM' ? (
    <InstagramIcon className={cn('size-4', className)} />
  ) : (
    <FacebookIcon className={cn('size-4', className)} />
  );
}

/* ------------------------------------------------------------------ */
/* small UI pieces                                                     */
/* ------------------------------------------------------------------ */

const pill =
  'border-ed-line text-ed-muted hover:text-ed-brand hover:border-ed-brand/30 flex h-9 items-center gap-1.5 rounded-lg border bg-white px-3 text-[12.5px] font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50';

function TogglePill({ label, on, onClick, icon }: { label: string; on: boolean; onClick: () => void; icon: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(pill, on && 'border-ed-brand/40 bg-ed-brand-soft text-ed-brand')}
    >
      {icon}
      {label}: {on ? 'On' : 'Off'}
    </button>
  );
}

function Chip({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: ReactNode; count?: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-7 items-center gap-1.5 rounded-full px-3 text-[11.5px] font-medium transition-colors',
        active ? 'bg-ed-brand text-white shadow-sm' : 'text-ed-text/70 hover:bg-ed-brand-soft hover:text-ed-brand',
      )}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className={cn('rounded-full px-1.5 text-[10px]', active ? 'bg-white/25' : 'bg-ed-brand-soft text-ed-brand')}>{count}</span>
      )}
    </button>
  );
}

function Pane({ title, hint, children, className }: { title?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('border-ed-line flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-white', className)}>
      {title && (
        <header className="border-ed-line flex items-center justify-between gap-2 border-b px-4 py-3.5">
          <h2 className="text-[14px] font-semibold">{title}</h2>
          {hint && <p className="text-ed-muted truncate text-[11.5px]">{hint}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

function ActionBtn({ label, icon, onClick, active }: { label: string; icon: ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border-ed-line text-ed-text/75 hover:border-ed-brand/30 hover:text-ed-brand flex h-8 items-center gap-1.5 rounded-lg border bg-white px-2.5 text-[11.5px] font-medium transition-colors [&_svg]:size-3.5',
        active && 'border-ed-brand/40 bg-ed-brand-soft text-ed-brand',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

export function Comments() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  /* ---- filters (URL synced) ---- */
  const filters: Filters = useMemo(() => {
    const ch = params.get('channel');
    const rp = params.get('reply');
    const fl = (params.get('flags') ?? '').split(',').filter(Boolean) as Flag[];
    return {
      channel: ch === 'FACEBOOK_COMMENTS' || ch === 'INSTAGRAM' ? ch : 'ALL',
      reply: rp === 'all' || rp === 'awaiting' || rp === 'replied' || rp === 'none' ? rp : DEFAULTS.reply,
      flags: fl.filter((f) => flagChips.some((c) => c.key === f)),
      q: params.get('q') ?? '',
    };
  }, [params]);

  const setFilters = useCallback(
    (patch: Partial<Filters>) => {
      const next = { ...filters, ...patch };
      const sp = new URLSearchParams();
      if (next.channel !== 'ALL') sp.set('channel', next.channel);
      sp.set('reply', next.reply);
      if (next.flags.length) sp.set('flags', next.flags.join(','));
      if (next.q) sp.set('q', next.q);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [filters, pathname, router],
  );

  const toggleFlag = (f: Flag) =>
    setFilters({ flags: filters.flags.includes(f) ? filters.flags.filter((x) => x !== f) : [...filters.flags, f] });

  const clearFilters = () => router.replace(`${pathname}?reply=all`, { scroll: false });
  const hasFilters = filters.reply !== 'all' || filters.flags.length > 0 || !!filters.q || filters.channel !== 'ALL';

  /* ---- data ---- */
  const [posts] = useState<Post[]>(initialPosts);
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [view, setView] = useState<ViewMode>('post');
  const [postId, setPostId] = useState<string | null>(null);
  const [commentId, setCommentId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  /* ---- toggles ---- */
  const [autoReply, setAutoReply] = useState(false);
  const [moderation, setModeration] = useState(false);

  /* ---- live refresh ---- */
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(() => {
    setRefreshing(true);
    // TODO: backend connect hole ekhane comments fetch hobe
    setTimeout(() => setRefreshing(false), 600);
  }, []);
  useEffect(() => {
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  /* ---- saved views ---- */
  const [saved, setSaved] = useState<SavedView[]>([]);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [viewName, setViewName] = useState('');
  const viewsRef = useClickAway(viewsOpen, () => setViewsOpen(false));
  useEffect(() => {
    try {
      const raw = localStorage.getItem(VIEWS_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);
  const persistViews = (v: SavedView[]) => {
    setSaved(v);
    try {
      localStorage.setItem(VIEWS_KEY, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  };
  const saveView = () => {
    const name = viewName.trim();
    if (!name) return;
    persistViews([...saved, { id: String(Date.now()), name, filters }]);
    setViewName('');
  };
  const applyView = (v: SavedView) => {
    setFilters(v.filters);
    setViewsOpen(false);
  };

  /* ---- derived ---- */
  const matches = useCallback(
    (c: CommentItem) => {
      if (filters.channel !== 'ALL' && c.channel !== filters.channel) return false;
      if (filters.reply !== 'all' && c.reply !== filters.reply) return false;
      if (!filters.flags.includes('deleted') && c.deleted) return false;
      if (filters.flags.some((f) => !c[f])) return false;
      const q = filters.q.trim().toLowerCase();
      if (q && !`${c.author} ${c.text}`.toLowerCase().includes(q)) return false;
      return true;
    },
    [filters],
  );

  const matching = useMemo(() => comments.filter(matches), [comments, matches]);
  const awaitingCount = comments.filter((c) => c.reply === 'awaiting' && !c.deleted).length;
  const unreadCount = comments.filter((c) => c.unread && !c.deleted).length;

  const visiblePosts = useMemo(() => {
    const ids = new Set(matching.map((c) => c.postId));
    return posts.filter((p) => ids.has(p.id));
  }, [posts, matching]);

  const post = posts.find((p) => p.id === postId) ?? null;
  const threadComments = post ? matching.filter((c) => c.postId === post.id) : [];
  const selected = comments.find((c) => c.id === commentId) ?? null;

  const patchComment = (id: string, patch: Partial<CommentItem>) =>
    setComments((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const openComment = (c: CommentItem) => {
    setPostId(c.postId);
    setCommentId(c.id);
    setDraft('');
    if (c.unread) patchComment(c.id, { unread: false });
  };

  const markMatchingRead = () => {
    const ids = new Set(matching.map((c) => c.id));
    setComments((cs) => cs.map((c) => (ids.has(c.id) ? { ...c, unread: false } : c)));
  };

  const sendReply = () => {
    const text = draft.trim();
    if (!selected || !text) return;
    patchComment(selected.id, {
      reply: 'replied',
      replies: [...selected.replies, { id: String(Date.now()), text, at: new Date().toISOString() }],
    });
    setDraft('');
  };

  /* ---------------------------------------------------------------- */

  const unreadInMatching = matching.filter((c) => c.unread).length;

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[600px] flex-col gap-4 pt-5">
      {/* Title row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h1 className="text-[26px] leading-none font-semibold">Comments</h1>
        <p className="text-ed-muted flex flex-wrap items-center gap-x-2 text-[13px]">
          <span><b className="text-orange-600">{awaitingCount}</b> awaiting reply</span>
          <span aria-hidden="true">·</span>
          <span><b className="text-ed-text">{unreadCount}</b> unread</span>
          <span aria-hidden="true">·</span>
          <span><b className="text-ed-text">{matching.length}</b> matching</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5 text-[11.5px]">
            <i className="relative flex size-2">
              <i className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
              <i className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </i>
            Live <span className="text-ed-muted/80">· checked every 15s</span>
          </span>
        </p>
        <button
          type="button"
          onClick={refresh}
          className="text-ed-text hover:text-ed-brand flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium transition-colors"
        >
          <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Channel" className="bg-ed-bg flex rounded-xl p-1">
          {(
            [
              ['ALL', 'All channels', null],
              ['FACEBOOK_COMMENTS', 'Facebook', <FacebookIcon key="f" className="size-3.5" />],
              ['INSTAGRAM', 'Instagram', <InstagramIcon key="i" className="size-3.5" />],
            ] as [ChannelKey, string, ReactNode][]
          ).map(([k, label, icon]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={filters.channel === k}
              onClick={() => setFilters({ channel: k })}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-medium transition',
                filters.channel === k ? 'text-ed-text bg-white shadow-sm' : 'text-ed-muted hover:text-ed-text',
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <label className="border-ed-line focus-within:border-ed-brand/50 flex h-9 w-[230px] items-center gap-2 rounded-lg border bg-white px-3 transition-colors">
          <Search className="text-ed-muted size-3.5 shrink-0" />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
            placeholder="Search comments or people..."
            className="placeholder:text-ed-muted/80 w-full bg-transparent text-[12.5px] outline-none"
          />
        </label>

        <div ref={viewsRef} className="relative">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={viewsOpen}
            onClick={() => setViewsOpen((o) => !o)}
            className={cn(pill, 'text-ed-text', viewsOpen && 'border-ed-brand/40 text-ed-brand')}
          >
            <SlidersHorizontal className="size-4" />
            Filters <span className="text-ed-muted">&amp; saved views</span>
          </button>
          {viewsOpen && (
            <div className="animate-pop border-ed-line absolute top-full left-0 z-30 mt-2 w-[300px] rounded-xl border bg-white p-3 shadow-[0_12px_32px_-8px_rgba(40,12,60,0.25)]">
              <p className="text-ed-muted mb-2 text-[11px] font-semibold tracking-[0.08em] uppercase">Saved views</p>
              {saved.length === 0 ? (
                <p className="text-ed-muted border-ed-line rounded-lg border border-dashed px-3 py-3 text-center text-[12px]">
                  No saved views yet. Set your filters, then save them below.
                </p>
              ) : (
                <ul className="thin-scroll max-h-[180px] space-y-1 overflow-y-auto">
                  {saved.map((v) => (
                    <li key={v.id} className="group hover:bg-ed-bg flex items-center rounded-lg">
                      <button type="button" onClick={() => applyView(v)} className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-[12.5px]">
                        <Bookmark className="text-ed-brand size-3.5 shrink-0" />
                        <span className="truncate">{v.name}</span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${v.name}`}
                        onClick={() => persistViews(saved.filter((x) => x.id !== v.id))}
                        className="text-ed-muted hover:text-ed-red mr-1 flex size-6 items-center justify-center rounded-md opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="border-ed-line mt-3 flex gap-2 border-t pt-3">
                <input
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveView()}
                  placeholder="Name this view"
                  className="border-ed-line focus:border-ed-brand/50 h-8 min-w-0 flex-1 rounded-lg border px-2.5 text-[12.5px] outline-none"
                />
                <button
                  type="button"
                  disabled={!viewName.trim()}
                  onClick={saveView}
                  className="bg-ed-brand flex h-8 items-center gap-1 rounded-lg px-3 text-[12px] font-medium text-white transition enabled:hover:brightness-110 disabled:opacity-50"
                >
                  <Plus className="size-3.5" /> Save
                </button>
              </div>
            </div>
          )}
        </div>

        <TogglePill label="Auto Reply" on={autoReply} onClick={() => setAutoReply((v) => !v)} icon={<Zap className="size-4" />} />
        <TogglePill
          label="Moderation"
          on={moderation}
          onClick={() => setModeration((v) => !v)}
          icon={moderation ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        />

        <button type="button" disabled={unreadInMatching === 0} onClick={markMatchingRead} className={pill}>
          <CheckCheck className="size-4" /> Mark matching read
        </button>

        <Link href="/dashboard/messages/report" className={cn(pill, 'text-ed-text')}>
          <BarChart3 className="size-4" /> Reports
        </Link>
      </div>

      {/* Status chips + view toggle */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
        {replyChips.map((c) => (
          <Chip key={c.key} active={filters.reply === c.key} onClick={() => setFilters({ reply: c.key })}>
            {c.label}
          </Chip>
        ))}
        <span className="bg-ed-line mx-1.5 h-4 w-px" aria-hidden="true" />
        {flagChips.map((c) => (
          <Chip
            key={c.key}
            active={filters.flags.includes(c.key)}
            onClick={() => toggleFlag(c.key)}
            count={c.key === 'unread' ? unreadCount : undefined}
          >
            {c.label}
          </Chip>
        ))}
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasFilters}
          className="text-ed-text hover:text-ed-brand ml-2 text-[12px] font-medium transition-colors disabled:opacity-40"
        >
          Clear filters
        </button>

        <div role="tablist" aria-label="View" className="bg-ed-bg ml-auto flex rounded-xl p-1">
          {(
            [
              ['post', 'By post'],
              ['comments', 'By comments'],
            ] as [ViewMode, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={view === k}
              onClick={() => setView(k)}
              className={cn(
                'h-8 rounded-lg px-3.5 text-[12.5px] font-medium transition',
                view === k ? 'text-ed-text bg-white shadow-sm' : 'text-ed-muted hover:text-ed-text',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 3 panes */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 pb-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        {/* Posts / Comments list */}
        <Pane
          title={view === 'post' ? 'Posts' : 'Comments'}
          hint={view === 'post' ? 'Select a post to read and reply' : 'Select a comment to reply'}
        >
          <div className="thin-scroll flex-1 overflow-y-auto">
            {(view === 'post' ? visiblePosts.length : matching.length) === 0 ? (
              <p className="text-ed-muted px-5 py-5 text-[13px] leading-relaxed">No posts match these filters. Try clearing the filters.</p>
            ) : view === 'post' ? (
              <ul className="divide-ed-line divide-y">
                {visiblePosts.map((p) => {
                  const n = matching.filter((c) => c.postId === p.id);
                  const unread = n.filter((c) => c.unread).length;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setPostId(p.id);
                          setCommentId(null);
                        }}
                        className={cn('hover:bg-ed-bg/70 flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors', postId === p.id && 'bg-ed-brand-soft/60')}
                      >
                        <ChannelBadge channel={p.channel} className="mt-0.5 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 block text-[13px] font-medium">{p.title}</span>
                          <span className="text-ed-muted mt-0.5 block text-[11px]">
                            {n.length} comment{n.length === 1 ? '' : 's'} · {ago(p.createdAt)}
                          </span>
                        </span>
                        {unread > 0 && <span className="bg-ed-brand mt-0.5 rounded-full px-1.5 text-[10px] font-semibold text-white">{unread}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="divide-ed-line divide-y">
                {matching.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => openComment(c)}
                      className={cn('hover:bg-ed-bg/70 w-full px-4 py-3 text-left transition-colors', commentId === c.id && 'bg-ed-brand-soft/60')}
                    >
                      <span className="flex items-center gap-1.5">
                        <ChannelBadge channel={c.channel} className="size-3.5" />
                        <span className={cn('truncate text-[12.5px]', c.unread ? 'font-semibold' : 'font-medium')}>{c.author}</span>
                        <span className="text-ed-muted ml-auto shrink-0 text-[10.5px]">{ago(c.createdAt)}</span>
                      </span>
                      <span className="text-ed-text/75 mt-1 line-clamp-2 block text-[12px]">{c.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Pane>

        {/* Thread */}
        <Pane className="hidden lg:flex">
          {!post ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="bg-ed-brand-soft text-ed-brand flex size-12 items-center justify-center rounded-2xl">
                <Layers className="size-5" />
              </span>
              <p className="text-ed-muted text-[14px]">Select a post to see its comments and replies.</p>
            </div>
          ) : (
            <>
              <header className="border-ed-line flex items-center gap-2.5 border-b px-5 py-3.5">
                <ChannelBadge channel={post.channel} className="size-5" />
                <div className="min-w-0">
                  <h2 className="truncate text-[14px] font-semibold">{post.title}</h2>
                  <p className="text-ed-muted text-[11.5px]">
                    {threadComments.length} matching comment{threadComments.length === 1 ? '' : 's'}
                  </p>
                </div>
              </header>
              <div className="thin-scroll flex-1 space-y-2.5 overflow-y-auto p-4">
                {threadComments.length === 0 ? (
                  <div className="text-ed-muted flex h-full flex-col items-center justify-center gap-2 text-[13px]">
                    <MessageSquareOff className="size-5" />
                    No comments match the filters for this post.
                  </div>
                ) : (
                  threadComments.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => openComment(c)}
                      className={cn(
                        'w-full rounded-xl border p-3.5 text-left transition',
                        commentId === c.id ? 'border-ed-brand/50 bg-ed-brand-soft/50' : 'border-ed-line hover:border-ed-brand/25 bg-white',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="bg-ed-brand-soft text-ed-brand flex size-7 items-center justify-center rounded-full text-[11px] font-semibold">
                          {c.author.slice(0, 1).toUpperCase()}
                        </span>
                        <span className={cn('text-[13px]', c.unread ? 'font-semibold' : 'font-medium')}>{c.author}</span>
                        {c.unread && <i className="bg-ed-brand size-1.5 rounded-full" />}
                        <span className="text-ed-muted ml-auto text-[11px]">{ago(c.createdAt)}</span>
                      </span>
                      <span className="text-ed-text/85 mt-2 block text-[13px] leading-relaxed">{c.text}</span>
                      <span className="mt-2 flex items-center gap-1.5">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10.5px] font-medium',
                            c.reply === 'awaiting' && 'bg-orange-50 text-orange-600',
                            c.reply === 'replied' && 'bg-emerald-50 text-emerald-600',
                            c.reply === 'none' && 'bg-ed-bg text-ed-muted',
                          )}
                        >
                          {c.reply === 'awaiting' ? 'Awaiting reply' : c.reply === 'replied' ? 'Replied' : 'No reply needed'}
                        </span>
                        {c.liked && <Heart className="size-3.5 fill-pink-500 text-pink-500" />}
                        {c.hidden && <EyeOff className="text-ed-muted size-3.5" />}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </Pane>

        {/* Detail */}
        <Pane className={cn('hidden border-dashed xl:flex', selected && 'border-solid')}>
          {!selected ? (
            <div className="text-ed-muted flex flex-1 items-center justify-center px-6 text-center text-[14px]">Click a comment to open it here.</div>
          ) : (
            <>
              <header className="border-ed-line flex items-center gap-2.5 border-b px-4 py-3.5">
                <span className="bg-ed-brand-soft text-ed-brand flex size-9 items-center justify-center rounded-full text-[13px] font-semibold">
                  {selected.author.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold">{selected.author}</p>
                  <p className="text-ed-muted flex items-center gap-1 text-[11px]">
                    <ChannelBadge channel={selected.channel} className="size-3" /> {ago(selected.createdAt)}
                  </p>
                </div>
              </header>
              <div className="thin-scroll flex-1 space-y-3 overflow-y-auto p-4">
                <p className="bg-ed-bg rounded-xl rounded-tl-sm px-3.5 py-3 text-[13px] leading-relaxed">{selected.text}</p>
                {selected.replies.map((r) => (
                  <div key={r.id} className="ml-6">
                    <p className="bg-ed-brand rounded-xl rounded-tr-sm px-3.5 py-3 text-[13px] leading-relaxed text-white">{r.text}</p>
                    <p className="text-ed-muted mt-1 text-right text-[10.5px]">{ago(r.at)}</p>
                  </div>
                ))}
              </div>
              <div className="border-ed-line space-y-3 border-t p-3.5">
                <div className="flex flex-wrap gap-1.5">
                  <ActionBtn label={selected.liked ? 'Liked' : 'Like'} active={selected.liked} icon={<Heart className={selected.liked ? 'fill-current' : ''} />} onClick={() => patchComment(selected.id, { liked: !selected.liked })} />
                  <ActionBtn label={selected.hidden ? 'Unhide' : 'Hide'} icon={selected.hidden ? <Eye /> : <EyeOff />} onClick={() => patchComment(selected.id, { hidden: !selected.hidden })} />
                  <ActionBtn label="No reply needed" active={selected.reply === 'none'} icon={<Check />} onClick={() => patchComment(selected.id, { reply: selected.reply === 'none' ? 'awaiting' : 'none' })} />
                  {selected.deleted ? (
                    <ActionBtn label="Restore" icon={<Undo2 />} onClick={() => patchComment(selected.id, { deleted: false })} />
                  ) : (
                    <ActionBtn label="Delete" icon={<Trash2 />} onClick={() => { patchComment(selected.id, { deleted: true }); setCommentId(null); }} />
                  )}
                </div>
                <div className="border-ed-line focus-within:border-ed-brand/50 flex items-end gap-2 rounded-xl border p-2 transition-colors">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply();
                    }}
                    rows={2}
                    placeholder="Write a reply..."
                    className="placeholder:text-ed-muted/80 max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-1.5 py-1 text-[13px] outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Send reply"
                    disabled={!draft.trim()}
                    onClick={sendReply}
                    className="bg-ed-brand flex size-9 shrink-0 items-center justify-center rounded-lg text-white transition enabled:hover:brightness-110 disabled:opacity-40"
                  >
                    <SendHorizontal className="size-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </Pane>
      </div>
    </div>
  );
}
