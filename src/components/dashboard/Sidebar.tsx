'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronsUpDown, Search } from 'lucide-react';
import { isActiveHref, navSections, type NavItem } from '@/config/dashboard';
import { useActivePath } from '@/lib/navState';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
}

export function Sidebar({ collapsed, mobileOpen }: SidebarProps) {
  const pathname = useActivePath();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const searchRef = useRef<HTMLInputElement>(null);
  const hide = collapsed ? 'lg:hidden' : '';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggle = (label: string) => setOpen((o) => ({ ...o, [label]: !o[label] }));

  return (
    <aside
      className={cn(
        'border-ed-line fixed inset-y-0 left-0 z-40 flex w-[264px] shrink-0 flex-col border-r bg-gradient-to-b from-[#fcfbfe] to-white transition-[width,transform] duration-300 ease-out lg:static',
        collapsed ? 'lg:w-[76px]' : 'lg:w-[264px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      {/* workspace switcher */}
      <div className="px-3.5 pt-4">
        <button
          type="button"
          className="border-ed-line flex h-14 w-full items-center gap-3 rounded-xl border bg-white px-3 text-left shadow-[0_2px_8px_rgba(30,20,50,0.06)]"
        >
          <span className="bg-ed-brand flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white">
            E
          </span>
          <span className={cn('flex-1 truncate text-[15px] font-semibold', hide)}>
            Elishine
          </span>
          <ChevronsUpDown className={cn('text-ed-muted size-4', hide)} />
        </button>
      </div>

      {/* quick search */}
      <div className="px-3.5 pt-3">
        <div className={cn('relative', hide)}>
          <Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            ref={searchRef}
            placeholder="Quick Search"
            className="border-ed-line placeholder:text-ed-muted focus:border-ed-brand/40 focus:ring-ed-brand/10 h-10 w-full rounded-xl border bg-white pr-16 pl-9 text-[13px] transition outline-none focus:ring-2"
          />
          <kbd className="bg-ed-bg text-ed-muted absolute top-1/2 right-2 -translate-y-1/2 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider">
            CTRL K
          </kbd>
        </div>
        {collapsed && (
          <button
            type="button"
            aria-label="Quick search"
            onClick={() => searchRef.current?.focus()}
            className="border-ed-line text-ed-muted hidden size-10 items-center justify-center rounded-xl border bg-white lg:mx-auto lg:flex"
          >
            <Search className="size-4" />
          </button>
        )}
      </div>

      {/* navigation */}
      <nav className="thin-scroll mt-3 flex-1 overflow-x-hidden overflow-y-auto px-3.5 pb-4">
        {navSections.map((section, si) => (
          <div key={si} className={cn(section.title ? 'mt-6' : 'space-y-1')}>
            {section.title && (
              <p
                className={cn(
                  'text-ed-muted/80 mb-2 px-3 text-[11px] font-semibold tracking-[0.12em] uppercase',
                  hide,
                )}
              >
                {section.title}
              </p>
            )}
            {section.title && collapsed && (
              <div className="bg-ed-line mx-3 mb-2 hidden h-px lg:block" />
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavRow
                  key={item.label}
                  item={item}
                  collapsed={collapsed}
                  active={item.href === pathname}
                  pathname={pathname}
                  isOpen={
                    open[item.label] ??
                    !!item.children?.some((c) => isActiveHref(c.href, pathname))
                  }
                  onToggle={() => toggle(item.label)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* plan */}
      <div className={cn('p-3.5', hide)}>
        <div className="border-ed-line flex items-center justify-between rounded-xl border bg-white px-3 py-3 shadow-[0_2px_8px_rgba(30,20,50,0.05)]">
          <span className="bg-ed-brand-soft text-ed-brand ring-ed-brand/15 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider ring-1">
            BASIC
          </span>
          <span className="text-ed-muted text-xs">Expires 2026-10-31</span>
        </div>
      </div>
    </aside>
  );
}

function NavRow({
  item,
  collapsed,
  active,
  pathname,
  isOpen,
  onToggle,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const hide = collapsed ? 'lg:hidden' : '';
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;

  const childActive = !!item.children?.some((c) => isActiveHref(c.href, pathname));

  const cls = cn(
    'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[14px] transition-colors',
    collapsed && 'lg:justify-center lg:px-0',
    active
      ? 'bg-ed-brand-soft font-semibold text-ed-brand'
      : childActive
        ? 'bg-[#f1eef6] font-semibold text-ed-text'
        : 'font-medium text-ed-text hover:bg-ed-bg',
  );

  const content = (
    <>
      <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
      <span className={cn('flex-1 truncate text-left', hide)}>{item.label}</span>
      {hasChildren && (
        <ChevronRight
          className={cn(
            'text-ed-muted size-4 shrink-0 transition-transform duration-300',
            isOpen && 'rotate-90',
            hide,
          )}
        />
      )}
    </>
  );

  return (
    <div>
      {hasChildren ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          title={item.label}
          className={cls}
        >
          {content}
        </button>
      ) : (
        <Link href={item.href ?? '#'} title={item.label} className={cls}>
          {content}
        </Link>
      )}

      {hasChildren && (
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-out',
            isOpen && !collapsed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            collapsed && 'lg:hidden',
          )}
        >
          <div className="overflow-hidden">
            <ul className="mt-1 mb-1 ml-8 space-y-0.5">
              {item.children!.map((child) => (
                <li key={child.label}>
                  <Link
                    href={child.href}
                    aria-current={isActiveHref(child.href, pathname) ? 'page' : undefined}
                    className={cn(
                      'flex h-9 items-center rounded-lg px-3 text-[13.5px] font-medium transition-colors',
                      isActiveHref(child.href, pathname)
                        ? 'bg-ed-brand-soft text-ed-text'
                        : 'text-ed-text/85 hover:bg-ed-bg hover:text-ed-brand',
                    )}
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
