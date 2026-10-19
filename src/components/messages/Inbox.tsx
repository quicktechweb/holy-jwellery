'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  CheckSquare,
  Filter,
  MessageCircle,
  PanelRight,
  Pin,
  Search,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InboxOptions, sortOptions } from './InboxOptions';
import { useInboxPrefs } from './prefs';

const chips = [
  { key: 'unread', label: 'Unread', dot: '' },
  { key: 'awaiting', label: 'Awaiting', dot: 'bg-orange-500' },
  { key: 'orders', label: 'Orders', dot: 'bg-emerald-600' },
  { key: 'pin', label: 'Pin tags', dot: '', pin: true },
];

function IconBtn({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'text-ed-muted flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-ed-brand-soft hover:text-ed-brand',
        active && 'bg-ed-brand-soft text-ed-brand',
      )}
    >
      {children}
    </button>
  );
}

export function Inbox() {
  const [prefs, update] = useInboxPrefs();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(true);
  const [active, setActive] = useState<string[]>([]);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const down = (e: MouseEvent) => !sortRef.current?.contains(e.target as Node) && setSortOpen(false);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setSortOpen(false);
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('keydown', key);
    };
  }, [sortOpen]);

  const toggleChip = (k: string) => setActive((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  return (
    <div className="border-ed-line mt-4 flex h-[calc(100vh-7rem)] min-h-[520px] overflow-hidden rounded-2xl border bg-white shadow-sm">
      {/* Conversation list */}
      <aside className="border-ed-line flex w-full shrink-0 flex-col border-r md:w-[340px]">
        <div className="flex items-center gap-1.5 px-3.5 pt-3.5">
          <button
            type="button"
            className="border-ed-line text-ed-text hover:border-ed-brand/30 flex h-8 items-center gap-1.5 rounded-lg border bg-white px-3 text-xs font-medium transition-colors"
          >
            <Filter className="size-3.5" /> Filter
          </button>

          <div ref={sortRef} className="relative">
            <button
              type="button"
              aria-label="Sort conversations"
              aria-haspopup="menu"
              aria-expanded={sortOpen}
              onClick={() => setSortOpen((o) => !o)}
              className={cn(
                'text-ed-muted flex h-8 items-center gap-0.5 rounded-lg px-2 transition-colors hover:bg-ed-brand-soft hover:text-ed-brand',
                sortOpen && 'bg-ed-brand-soft text-ed-brand',
              )}
            >
              <ArrowDownUp className="size-4" />
              <ChevronDown className={cn('size-3.5 transition-transform', sortOpen && 'rotate-180')} />
            </button>
            {sortOpen && (
              <div
                role="menu"
                className="animate-pop border-ed-line absolute top-full left-0 z-30 mt-1.5 w-[250px] rounded-xl border bg-white p-1.5 shadow-[0_12px_32px_-8px_rgba(40,12,60,0.25)]"
              >
                {sortOptions.map((o) => {
                  const on = prefs.sort === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={on}
                      onClick={() => {
                        update({ sort: o.value });
                        setSortOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors',
                        on ? 'bg-ed-brand-soft' : 'hover:bg-ed-bg',
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-semibold">{o.label}</span>
                        <span className="text-ed-muted block text-[11px] leading-snug">{o.desc}</span>
                      </span>
                      {on && <Check className="text-ed-brand mt-0.5 size-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-0.5">
            <IconBtn label="Select conversations">
              <CheckSquare className="size-4" />
            </IconBtn>
            <IconBtn label="Options" onClick={() => setOptionsOpen(true)} active={optionsOpen}>
              <Settings className="size-4" />
            </IconBtn>
            <IconBtn label={contextOpen ? 'Hide context panel' : 'Show context panel'} onClick={() => setContextOpen((c) => !c)} active={contextOpen}>
              <PanelRight className="size-4" />
            </IconBtn>
          </div>
        </div>

        <div className="px-3.5 pt-3">
          <label className="border-ed-line focus-within:border-ed-brand/50 flex h-9 items-center gap-2 rounded-lg border bg-white px-3 transition-colors">
            <Search className="text-ed-muted size-3.5" />
            <input
              type="search"
              placeholder="Search conversations..."
              className="placeholder:text-ed-muted/80 w-full bg-transparent text-xs outline-none"
            />
          </label>
        </div>

        <div className="border-ed-line flex flex-wrap gap-1.5 border-b px-3.5 pt-2.5 pb-3">
          {chips.map((c) => {
            const on = active.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggleChip(c.key)}
                className={cn(
                  'flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium transition-colors',
                  on ? 'bg-ed-brand text-white' : 'bg-ed-bg text-ed-text/75 hover:text-ed-brand',
                )}
              >
                {c.dot && <i className={cn('size-1.5 rounded-full', c.dot)} />}
                {c.pin && <Pin className="size-3" />}
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <span className="bg-ed-brand-soft text-ed-brand mb-3 flex size-11 items-center justify-center rounded-full">
            <MessageCircle className="size-5" />
          </span>
          <p className="text-[13.5px] font-semibold">No channel connected yet</p>
          <p className="text-ed-muted mt-1 text-xs">Connect a Facebook Page in Channel Settings.</p>
        </div>
      </aside>

      {/* Conversation view */}
      <section className="bg-ed-bg/40 hidden min-w-0 flex-1 items-center justify-center md:flex">
        <div className="max-w-[300px] text-center">
          <span className="border-ed-line text-ed-brand mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border bg-white shadow-sm">
            <MessageCircle className="size-6" />
          </span>
          <p className="text-[15px] font-semibold">Select a conversation</p>
          <p className="text-ed-muted mt-1.5 text-xs leading-relaxed">
            Choose a customer thread from the inbox to read messages and access order contexts.
          </p>
        </div>
      </section>

      {/* Context panel */}
      {contextOpen && (
        <aside className="border-ed-line hidden w-[320px] shrink-0 border-l p-5 xl:block">
          <h2 className="text-[16px] font-semibold">Context</h2>
          <p className="text-ed-muted mt-2 text-xs leading-relaxed">
            Select a customer conversation from the list to display linked CRM attributes.
          </p>
        </aside>
      )}

      {optionsOpen && <InboxOptions prefs={prefs} onChange={update} onClose={() => setOptionsOpen(false)} />}
    </div>
  );
}
