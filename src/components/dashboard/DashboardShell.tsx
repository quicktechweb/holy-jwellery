'use client';

import { Suspense, useState, type ReactNode } from 'react';
import { MessageSquare } from 'lucide-react';
import { usePending } from '@/lib/navState';
import { cn } from '@/lib/utils';
import { NavProgress } from './NavProgress';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pending = usePending();

  const toggleSidebar = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) setCollapsed((c) => !c);
    else setMobileOpen((o) => !o);
  };

  return (
    <div
      className="bg-ed-bg font-dash text-ed-text flex h-screen overflow-hidden"
      style={{ colorScheme: 'light' }}
    >
      <Suspense fallback={null}><NavProgress /></Suspense>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleSidebar={toggleSidebar} />
        <main aria-busy={!!pending} className={cn('thin-scroll flex-1 overflow-x-hidden overflow-y-auto transition-opacity duration-150', pending && 'opacity-60')}>
          <div className="mx-auto w-full max-w-[1600px] px-4 pb-20 lg:px-6">
            {children}
          </div>
        </main>
      </div>

      <button
        type="button"
        aria-label="Open chat"
        className="bg-ed-brand fixed right-4 bottom-4 z-20 flex size-11 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 sm:right-5 sm:bottom-5 sm:size-12"
      >
        <MessageSquare className="size-5" />
      </button>
    </div>
  );
}
