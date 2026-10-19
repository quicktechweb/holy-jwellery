'use client';

import {
  Bell,
  Languages,
  Megaphone,
  MessageSquare,
  MoreVertical,
  PanelLeft,
  Sparkles,
  Sun,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { isActiveHref, quickActions } from '@/config/dashboard';
import { useActivePath } from '@/lib/navState';
import { cn } from '@/lib/utils';

const iconBtn =
  'relative flex size-9 items-center justify-center rounded-full text-ed-text/80 transition-colors hover:bg-white hover:text-ed-brand';

// mobile e sudhu icon dekhabe: Search, New Order, Web Order List, Order List
const mobileActions = quickActions.slice(0, 4);

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const pathname = useActivePath();
  return (
    <header className="border-ed-line/60 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 max-sm:mx-4 max-sm:px-0 sm:gap-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-1 sm:gap-5">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="border-ed-line text-ed-text/80 hover:text-ed-brand mr-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-white shadow-sm transition-colors max-sm:size-[34px] sm:mr-0 sm:rounded-full"
        >
          <PanelLeft className="size-4" />
        </button>

        {/* mobile: icon-only quick actions */}
        <nav className="flex items-center sm:hidden">
          {mobileActions.map(({ label, icon: Icon, href }) => (
            <Link key={label} href={href} aria-label={label} className={iconBtn}>
              <Icon className="size-[17px]" />
            </Link>
          ))}
        </nav>

        <nav className="hidden items-center gap-3 xl:flex">
          {quickActions.map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                isActiveHref(href, pathname)
                  ? 'border-ed-line text-ed-text border bg-white shadow-sm'
                  : 'text-ed-text/75 hover:text-ed-brand',
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <span className="bg-ed-line mr-1 h-6 w-px sm:hidden" aria-hidden="true" />

        <button
          type="button"
          className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold hover:bg-white max-sm:hidden"
        >
          <Languages className="size-4" />
          BN
        </button>
        <button
          type="button"
          aria-label="Ask EcomDrive"
          className="border-ed-brand/80 text-ed-brand hover:border-ed-brand sm:border-ed-text/60 sm:text-ed-text sm:hover:text-ed-brand flex h-[30px] items-center justify-center gap-1.5 rounded-full border bg-white px-2.5 text-xs font-medium transition-colors sm:h-8 sm:px-3"
        >
          <Sparkles className="size-3.5" />
          <span className="max-sm:hidden">Ask EcomDrive</span>
        </button>
        <button
          type="button"
          aria-label="Announcements"
          className={`${iconBtn} max-sm:hidden`}
        >
          <Megaphone className="size-[18px]" />
          <span className="bg-ed-green ring-ed-bg absolute top-1.5 right-1.5 size-2 rounded-full ring-2" />
        </button>
        <button
          type="button"
          aria-label="Messages"
          className={`${iconBtn} max-sm:hidden`}
        >
          <MessageSquare className="size-[18px]" />
        </button>
        <button type="button" aria-label="Notifications" className={iconBtn}>
          <Bell className="size-[17px] sm:size-[18px]" />
          <span className="absolute top-0 right-0 flex size-[18px] items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-white sm:top-0.5 sm:size-4">
            2
          </span>
        </button>
        <button type="button" aria-label="Theme" className={`${iconBtn} max-sm:hidden`}>
          <Sun className="size-[18px]" />
        </button>
        <button type="button" aria-label="More" className={`${iconBtn} w-6 sm:hidden`}>
          <MoreVertical className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Account"
          className="flex size-[30px] items-center justify-center rounded-full bg-[#5b3df0] text-white sm:ml-1 sm:size-9"
        >
          <User className="size-4" />
        </button>
      </div>
    </header>
  );
}
