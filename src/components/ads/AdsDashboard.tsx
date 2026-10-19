'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, BarChart3, CalendarDays, ChevronDown, ChevronLeft, Sparkles, Wallet } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { cn } from '@/lib/utils';
import { ADS_ROUTES, FbIcon, GoogleIcon, TikTokIcon } from './brand';

const ranges = ['Today', 'Yesterday', '7D', '30D', 'This month'];

const kpis = [
  { label: 'Ad Spend', value: '৳0', cls: '' },
  { label: 'Tracked Revenue', value: '৳0', cls: '' },
  { label: 'True ROAS', value: '—', cls: 'text-ed-red', sub: 'Revenue − cost + spend' },
  { label: 'Adjusted Profit', value: '৳0', cls: 'text-ed-green' },
  { label: 'Orders From Ads', value: '0', cls: '' },
];

export function AdsDashboard() {
  const [range, setRange] = useState('7D');
  const [open, setOpen] = useState(false);

  const channels = [
    { name: 'Meta Ads', href: ADS_ROUTES.meta, icon: <FbIcon />, tint: 'bg-[#eef4ff] border-[#cfe0fb]', note: 'Connect →' },
    { name: 'TikTok Ads', href: ADS_ROUTES.tiktok, icon: <TikTokIcon />, tint: 'bg-[#fbfaf8] border-ed-line', note: 'Connect →' },
    { name: 'Google Ads', href: ADS_ROUTES.google, icon: <GoogleIcon />, tint: 'bg-[#eefbf6] border-[#bfeedd]', note: 'Connect →' },
    {
      name: 'Ad Spend',
      href: ADS_ROUTES.spend,
      icon: <Wallet className="size-5 text-[#d97706]" />,
      tint: 'bg-[#fffbe9] border-[#f6e7a8]',
      note: 'Recorded ad expense',
      value: '৳0',
    },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="text-ed-brand mt-1 size-6" strokeWidth={1.5} />
          <div>
            <h1 className="text-[24px] leading-tight font-medium tracking-tight">AI Ads Dashboard</h1>
            <p className="text-ed-text/65 text-[14px]">What to scale, what to kill, and where money is leaking — at a glance.</p>
          </div>
        </div>

        <div className="relative flex items-center">
          <div className="border-ed-line flex h-10 items-center rounded-xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
            <button type="button" aria-label="Previous range" className="text-ed-muted hover:text-ed-brand flex h-full w-9 items-center justify-center">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={() => setOpen((o) => !o)} className="flex h-full items-center gap-2 px-3 text-[14px] font-medium">
              <CalendarDays className="text-ed-muted size-4" />
              {range}
              <ChevronDown className="text-ed-muted size-4" />
            </button>
          </div>
          {open && (
            <ul className="border-ed-line absolute top-12 right-0 z-20 w-36 overflow-hidden rounded-xl border bg-white py-1 shadow-lg">
              {ranges.map((r) => (
                <li key={r}>
                  <button
                    type="button"
                    onClick={() => { setRange(r); setOpen(false); }}
                    className={cn('hover:bg-ed-bg w-full px-3 py-2 text-left text-[13.5px]', r === range && 'text-ed-brand font-semibold')}
                  >
                    {r}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <Card className="flex flex-col items-center px-6 py-12 text-center">
        <BarChart3 className="text-ed-text/70 size-11" strokeWidth={1.5} />
        <p className="mt-4 text-[17px] font-medium">No campaign data for this period</p>
        <p className="text-ed-muted mt-2 max-w-[460px] text-[14px] leading-6">
          Connect a Meta, TikTok or Google ad account, or pick a wider date range, to unlock scale/kill recommendations and
          money-leak alerts. Recorded ad expense is still shown below.
        </p>
        <Link
          href={ADS_ROUTES.meta}
          className="bg-ed-brand mt-5 inline-flex h-11 items-center rounded-lg px-5 text-[14px] font-medium text-white transition hover:opacity-90"
        >
          Connect ad account
        </Link>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <p className="text-ed-muted text-[11px] font-medium tracking-wide uppercase">{k.label}</p>
            <p className={cn('mt-3 text-[22px] font-medium', k.cls)}>{k.value}</p>
            {k.sub && <p className="text-ed-muted mt-2 text-[11px]">{k.sub}</p>}
          </Card>
        ))}
      </div>

      {/* Click korle oi page e niye jabe */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {channels.map((c) => (
          <Link
            key={c.name}
            href={c.href}
            className={cn('group block rounded-xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md', c.tint)}
          >
            <div className="flex items-start justify-between">
              <span className="flex size-10 items-center justify-center rounded-lg bg-white shadow-sm">{c.icon}</span>
              <ArrowUpRight className="text-ed-muted group-hover:text-ed-brand size-4 transition" />
            </div>
            <p className="mt-4 text-[15px] font-medium">{c.name}</p>
            {c.value && <p className="mt-1 text-[18px] font-medium">{c.value}</p>}
            <p className="text-ed-muted mt-1 text-[12px]">{c.note}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
