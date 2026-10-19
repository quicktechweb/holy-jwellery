'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  MoreVertical,
  RefreshCw,
} from 'lucide-react';
import { dashboardTabs, dateOptions } from '@/config/dashboard';
import { cn } from '@/lib/utils';
import { Dropdown } from './Dropdown';

function useDhakaTime() {
  const [time, setTime] = useState('--:--:--');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const squareBtn =
  'flex size-8 items-center justify-center rounded-lg border border-ed-line bg-white text-ed-text/80 shadow-sm transition-colors hover:text-ed-brand sm:size-10';

export function DashboardHeader({
  active,
  onChange,
}: {
  active: string;
  onChange: (tab: string) => void;
}) {
  const setActive = onChange;
  const [spinning, setSpinning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const time = useDhakaTime();

  const refresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 700);
  };

  return (
    <div className="border-ed-line flex flex-wrap items-center justify-between gap-x-2 gap-y-3 border-b pt-4 pb-3 sm:items-end sm:gap-x-6 sm:pt-8 sm:pb-0">
      {/* mobile: tabs -> title dropdown */}
      <div className="relative sm:hidden">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-1.5 text-[17px] leading-none font-semibold"
        >
          {active}
          <ChevronDown
            className={cn(
              'text-ed-muted size-4 transition-transform',
              menuOpen && 'rotate-180',
            )}
          />
        </button>
        {menuOpen && (
          <ul
            role="listbox"
            className="border-ed-line absolute top-full left-0 z-30 mt-2 min-w-44 rounded-lg border bg-white p-1 shadow-lg"
          >
            {dashboardTabs.map((tab) => (
              <li key={tab}>
                <button
                  type="button"
                  role="option"
                  aria-selected={tab === active}
                  onClick={() => {
                    setActive(tab);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    'hover:bg-ed-bg w-full rounded-md px-2.5 py-2 text-left text-sm',
                    tab === active && 'text-ed-brand font-semibold',
                  )}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="thin-scroll -mb-px hidden max-w-full gap-7 overflow-x-auto sm:flex">
        {dashboardTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={cn(
              'border-b-2 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              tab === active
                ? 'border-ed-brand text-ed-text'
                : 'text-ed-muted hover:text-ed-text border-transparent',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 sm:mb-2 sm:gap-2">
        <div className="border-ed-line hidden rounded-lg border bg-white px-2.5 py-1 text-center sm:block">
          <p className="text-ed-muted text-[8px] font-semibold tracking-[0.15em]">
            DHAKA TIME
          </p>
          <p className="font-mono text-xs font-bold tabular-nums">{time}</p>
        </div>
        <div className="border-ed-line flex items-center max-sm:overflow-hidden max-sm:rounded-lg max-sm:border max-sm:bg-white max-sm:shadow-sm sm:gap-2">
          <button
            type="button"
            aria-label="Previous period"
            className="text-ed-muted max-sm:bg-ed-bg flex size-8 items-center justify-center hover:bg-white max-sm:h-8 max-sm:w-[26px] sm:rounded-md"
          >
            <ChevronLeft className="size-4" />
          </button>
          <Dropdown
            options={dateOptions}
            icon={<Calendar />}
            className="max-sm:[&>button]:h-8 max-sm:[&>button]:rounded-none max-sm:[&>button]:border-0 max-sm:[&>button]:px-2 max-sm:[&>button]:text-[13px] max-sm:[&>button]:shadow-none"
          />
        </div>
        <button
          type="button"
          aria-label="Refresh"
          onClick={refresh}
          className={squareBtn}
        >
          <RefreshCw className={cn('size-4', spinning && 'animate-spin')} />
        </button>
        {active === dashboardTabs[0] && (
          <button type="button" aria-label="More options" className={squareBtn}>
            <MoreVertical className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
