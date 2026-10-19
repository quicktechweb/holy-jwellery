'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  BellRing,
  BookOpen,
  ChevronRight,
  Clock3,
  FileText,
  MessageSquareText,
  Radio,
  SlidersHorizontal,
  Tags,
  Volume2,
  X,
  Clock,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/products/ui';
import { playChime, type InboxPrefs, type InboxSort } from './prefs';

export const sortOptions: { value: InboxSort; label: string; desc: string; icon: LucideIcon }[] = [
  { value: 'longest', label: 'Longest waiting', desc: 'Oldest unanswered customer first', icon: Clock3 },
  { value: 'newest', label: 'Newest message', desc: 'Most recent activity on top', icon: Sparkles },
  { value: 'unread', label: 'Unread first', desc: 'Everything unread, then the rest by time', icon: Clock },
];

const links: { label: string; hint: string; href: string; icon: LucideIcon }[] = [
  { label: 'Reply Report', hint: 'Response time & agent stats', href: '/dashboard/messages/report', icon: BarChart3 },
  { label: 'Guide', hint: 'How the business inbox works', href: '/help/guides/business-inbox', icon: BookOpen },
  { label: 'Manage tags', hint: 'Create and edit chat tags', href: '/dashboard/messages/tags', icon: Tags },
  { label: 'Channel settings', hint: 'Connect Facebook, Instagram & more', href: '/dashboard/messages/channels', icon: Radio },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-ed-muted mb-2.5 text-[11px] font-semibold tracking-[0.08em] uppercase">{children}</p>;
}

function SettingRow({
  icon: Icon,
  title,
  desc,
  on,
  onChange,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="border-ed-line flex items-start gap-3 rounded-xl border bg-white p-3.5 transition-colors hover:border-ed-brand/25">
      <span
        className={cn(
          'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
          on ? 'bg-ed-brand text-white' : 'bg-ed-brand-soft text-ed-brand',
        )}
      >
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold">{title}</p>
        <p className="text-ed-muted mt-0.5 text-[12px] leading-snug">{desc}</p>
      </div>
      <Switch small on={on} onChange={onChange} label={title} />
    </div>
  );
}

export function InboxOptions({
  prefs,
  onChange,
  onClose,
}: {
  prefs: InboxPrefs;
  onChange: (patch: Partial<InboxPrefs>) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const toggleSound = (v: boolean) => {
    onChange({ sound: v });
    if (v) playChime();
  };

  const toggleAlerts = async (v: boolean) => {
    if (!v) return onChange({ browserAlerts: false });
    if (typeof Notification === 'undefined') return onChange({ browserAlerts: true });
    const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    onChange({ browserAlerts: perm === 'granted' });
  };

  return (
    <div
      className="animate-fade fixed inset-0 z-50 flex items-center justify-center bg-[#1b1630]/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Inbox options"
        className="animate-pop border-ed-line flex max-h-[92vh] w-full max-w-[780px] flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_24px_60px_-12px_rgba(40,12,60,0.35)]"
      >
        {/* Header */}
        <div className="border-ed-line flex items-center gap-3 border-b px-6 py-4">
          <span className="bg-ed-brand-soft text-ed-brand flex size-10 items-center justify-center rounded-xl">
            <SlidersHorizontal className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] leading-tight font-semibold">Options</h3>
            <p className="text-ed-muted text-[12.5px]">Customize how your inbox sorts, notifies and follows up</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-ed-muted hover:bg-ed-bg hover:text-ed-text flex size-8 items-center justify-center rounded-lg transition"
          >
            <X className="size-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="thin-scroll grid flex-1 overflow-y-auto md:grid-cols-2">
          {/* Left column */}
          <div className="border-ed-line space-y-6 p-6 md:border-r">
            <section>
              <SectionLabel>Sort by</SectionLabel>
              <div role="radiogroup" aria-label="Sort by" className="space-y-2">
                {sortOptions.map((o) => {
                  const active = prefs.sort === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => onChange({ sort: o.value })}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition',
                        active
                          ? 'border-ed-brand bg-ed-brand-soft/60 shadow-[0_0_0_3px_rgba(63,19,85,0.07)]'
                          : 'border-ed-line hover:border-ed-brand/30 bg-white',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 transition',
                          active ? 'border-ed-brand' : 'border-[#c9c5d6]',
                        )}
                      >
                        <i className={cn('size-2 rounded-full transition', active ? 'bg-ed-brand' : 'bg-transparent')} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-semibold">{o.label}</span>
                        <span className="text-ed-muted block text-[12px] leading-snug">{o.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <SectionLabel>Preferences</SectionLabel>
              <div className="space-y-2">
                <SettingRow
                  icon={Volume2}
                  title="Sound"
                  desc="Chime for new texts in your or unassigned chats, and chats handed to you"
                  on={prefs.sound}
                  onChange={toggleSound}
                />
                <SettingRow
                  icon={BellRing}
                  title="Browser alerts"
                  desc="Desktop notification for new texts in your or unassigned chats, and chats handed to you — on any EcomDrive page"
                  on={prefs.browserAlerts}
                  onChange={toggleAlerts}
                />
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="bg-[#fbfafd] space-y-6 p-6">
            <section>
              <SectionLabel>After an order</SectionLabel>
              <div className="space-y-2">
                <SettingRow
                  icon={FileText}
                  title="Send invoice after order"
                  desc="When an order is created from a chat, its invoice picture is sent into that chat. For this whole Business."
                  on={prefs.sendInvoice}
                  onChange={(v) => onChange({ sendInvoice: v })}
                />
                <SettingRow
                  icon={MessageSquareText}
                  title="Send message after order"
                  desc="When an order is created from a chat, your message is sent into that chat. For this whole Business."
                  on={prefs.sendMessage}
                  onChange={(v) => onChange({ sendMessage: v })}
                />
              </div>
            </section>

            <section>
              <SectionLabel>Open</SectionLabel>
              <div className="border-ed-line divide-ed-line divide-y overflow-hidden rounded-xl border bg-white">
                {links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={onClose}
                    className="group hover:bg-ed-brand-soft/50 flex items-center gap-3 px-3.5 py-3 transition-colors"
                  >
                    <span className="bg-ed-bg text-ed-muted group-hover:bg-white group-hover:text-ed-brand flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors">
                      <l.icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold">{l.label}</span>
                      <span className="text-ed-muted block truncate text-[11.5px]">{l.hint}</span>
                    </span>
                    <ChevronRight className="text-ed-muted group-hover:text-ed-brand size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-ed-line flex items-center justify-between gap-3 border-t bg-white px-6 py-3.5">
          <p className="text-ed-muted text-[12px]">Changes are saved automatically</p>
          <button
            type="button"
            onClick={onClose}
            className="bg-ed-brand h-10 rounded-lg px-7 text-[13.5px] font-medium text-white shadow-[0_3px_8px_rgba(63,19,85,0.3)] transition hover:brightness-110"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
