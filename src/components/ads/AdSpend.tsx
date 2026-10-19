'use client';

import { useMemo, useState } from 'react';
import { BookOpen, CalendarDays, ChevronDown, ChevronLeft, ChevronsUpDown, Download, FileText, LayoutGrid, Megaphone, Plus, Receipt, Search, SlidersHorizontal, TrendingUp, X } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { cn } from '@/lib/utils';

interface Entry {
  id: number;
  date: string;
  amount: number;
  usd: number;
  platform: string;
  account: string;
  note: string;
}

const platforms = ['Meta Ads', 'TikTok Ads', 'Google Ads', 'Other'];
const periods = ['Today', 'Week', 'Month', 'Year', 'All'];
const tabs = [
  { key: 'Overview', icon: LayoutGrid },
  { key: 'Expense', icon: Receipt },
  { key: 'Income', icon: TrendingUp },
  { key: 'Settings', icon: SlidersHorizontal },
] as const;
type Tab = (typeof tabs)[number]['key'];

const today = () => new Date().toISOString().slice(0, 10);
const bdt = (n: number) => `৳${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

function inPeriod(date: string, period: string) {
  if (period === 'All') return true;
  const d = new Date(`${date}T00:00:00`);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'Today') return d >= start;
  if (period === 'Week') return d >= new Date(start.getTime() - 6 * 864e5);
  if (period === 'Month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  return d.getFullYear() === now.getFullYear();
}

const field =
  'border-ed-line focus:border-ed-brand/40 focus:ring-ed-brand/10 h-10 w-full rounded-lg border bg-white px-3 text-[13.5px] outline-none focus:ring-2';

export function AdSpend() {
  const [tab, setTab] = useState<Tab>('Expense');
  const [period, setPeriod] = useState('Month');
  const [pOpen, setPOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [modal, setModal] = useState(false);
  const [platform, setPlatform] = useState('All Platforms');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ key: 'date' | 'amount' | 'usd' | 'platform'; dir: 1 | -1 }>({ key: 'date', dir: -1 });
  const [rows, setRows] = useState(10);
  const [page, setPage] = useState(1);
  const [guide, setGuide] = useState(false);

  const scoped = useMemo(() => entries.filter((e) => inPeriod(e.date, period)), [entries, period]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return scoped
      .filter((e) => (platform === 'All Platforms' || e.platform === platform) && (!t || `${e.note} ${e.account} ${e.platform}`.toLowerCase().includes(t)))
      .sort((a, b) => {
        const x = a[sort.key], y = b[sort.key];
        return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
      });
  }, [scoped, platform, q, sort]);

  const pages = Math.max(1, Math.ceil(list.length / rows));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * rows, cur * rows);
  const total = scoped.reduce((s, e) => s + e.amount, 0);
  const totalUsd = scoped.reduce((s, e) => s + e.usd, 0);

  const toggleSort = (key: typeof sort.key) => setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }));

  const exportCsv = () => {
    const csv = ['Date,Amount,USD,Platform,Payment Account,Note', ...list.map((e) => [e.date, e.amount, e.usd, e.platform, e.account, `"${e.note.replace(/"/g, '""')}"`].join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'ad-expenses.csv';
    a.click();
  };

  const Th = ({ k, children }: { k: typeof sort.key; children: string }) => (
    <th className="px-4 py-3 text-left font-medium">
      <button type="button" onClick={() => toggleSort(k)} className="flex items-center gap-1.5">
        {children}
        <ChevronsUpDown className="text-ed-muted size-3.5" />
      </button>
    </th>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-tight font-medium tracking-tight">Ad Spend</h1>
          <p className="text-ed-text/65 mt-1 text-[14px]">Track ad expenses in one place</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <div className="border-ed-line flex h-10 items-center rounded-xl border bg-white">
              <button type="button" aria-label="Previous" className="text-ed-muted flex h-full w-9 items-center justify-center">
                <ChevronLeft className="size-4" />
              </button>
              <button type="button" onClick={() => setPOpen((o) => !o)} className="bg-ed-bg/70 flex h-full items-center gap-2 rounded-r-xl px-3 text-[14px] font-medium">
                <CalendarDays className="text-ed-muted size-4" /> {period} <ChevronDown className="text-ed-muted size-4" />
              </button>
            </div>
            {pOpen && (
              <ul className="border-ed-line absolute top-12 right-0 z-20 w-36 rounded-xl border bg-white py-1 shadow-lg">
                {periods.map((p) => (
                  <li key={p}>
                    <button type="button" onClick={() => { setPeriod(p); setPOpen(false); setPage(1); }} className={cn('hover:bg-ed-bg w-full px-3 py-2 text-left text-[13.5px]', p === period && 'text-ed-brand font-semibold')}>{p}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" onClick={() => setModal(true)} className="bg-ed-brand inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[14px] font-medium text-white">
            <Megaphone className="size-4" /> New Ad Expense
          </button>
          <button type="button" onClick={() => setGuide((g) => !g)} className="border-ed-line hover:bg-ed-bg inline-flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[14px]">
            <BookOpen className="size-4" /> Guide
          </button>
        </div>
      </header>

      {guide && (
        <Card className="bg-ed-brand-soft/40 p-4 text-[13.5px] leading-6">
          Click <b>New Ad Expense</b>, pick the platform (Meta, TikTok, Google) and enter the BDT amount. Synced platform spend appears here automatically once an ad account is connected.
        </Card>
      )}

      <nav className="flex gap-1">
        {tabs.map(({ key, icon: Icon }) => (
          <button key={key} type="button" onClick={() => setTab(key)} className={cn('flex h-10 items-center gap-2 rounded-lg px-3.5 text-[14px] transition', tab === key ? 'bg-ed-brand-soft text-ed-brand font-medium ring-ed-brand/10 ring-1' : 'text-ed-text/75 hover:bg-ed-bg')}>
            <Icon className="size-4" /> {key}
          </button>
        ))}
      </nav>

      {tab !== 'Expense' && tab !== 'Overview' ? (
        <Card className="text-ed-muted border-dashed px-6 py-12 text-center text-[14px]">Nothing to show in {tab} yet.</Card>
      ) : (
        <>
          {tab === 'Overview' && scoped.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {[['Total Ad Spend', bdt(total)], ['Total (USD)', `$${totalUsd.toFixed(2)}`], ['Entries', String(scoped.length)]].map(([a, b]) => (
                <Card key={a} className="p-5"><p className="text-ed-muted text-[11px] uppercase">{a}</p><p className="mt-3 text-[22px] font-medium">{b}</p></Card>
              ))}
            </div>
          ) : (
            <>
              <Card className="text-ed-muted border-dashed px-6 py-8 text-center text-[14px]">
                {scoped.length ? `Total ad spend this period: ${bdt(total)}` : 'Nothing recorded in this period.'}
              </Card>
              <Card className="text-ed-muted border-dashed px-6 py-8 text-center text-[14px]">
                {scoped.length ? `${scoped.length} expense${scoped.length > 1 ? 's' : ''} recorded in this period.` : 'No expenses recorded in this period.'}
              </Card>
            </>
          )}

          <section>
            <p className="text-ed-text/70 text-[12px] font-semibold tracking-wide uppercase">All entries</p>
            <p className="text-ed-muted text-[12.5px]">The full list, with sorting, selection and exports.</p>

            <Card className="mt-3 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-[200px]">
                  <select aria-label="Platform" value={platform} onChange={(e) => { setPlatform(e.target.value); setPage(1); }} className={cn(field, 'appearance-none pr-9')}>
                    <option>All Platforms</option>
                    {platforms.map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
                </div>
                <div className="relative w-[240px]">
                  <Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search expenses..." className={cn(field, 'pl-9')} />
                </div>
                <button type="button" aria-label="Download CSV" onClick={exportCsv} className="border-ed-line hover:bg-ed-bg flex size-10 items-center justify-center rounded-lg border"><Download className="size-4" /></button>
                <button type="button" aria-label="Print" onClick={() => window.print()} className="border-ed-line hover:bg-ed-bg flex size-10 items-center justify-center rounded-lg border"><FileText className="size-4" /></button>
              </div>
            </Card>

            <Card className="mt-4 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-[13.5px]">
                  <thead className="border-ed-line border-b">
                    <tr>
                      <th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Select all" className="size-4" /></th>
                      <Th k="date">Date</Th><Th k="amount">Amount</Th><Th k="usd">USD</Th><Th k="platform">Platform</Th>
                      <th className="px-4 py-3 text-left font-medium">Payment Account</th>
                      <th className="px-4 py-3 text-left font-medium">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-10 text-center">No results.</td></tr>
                    ) : shown.map((e) => (
                      <tr key={e.id} className="border-ed-line hover:bg-ed-bg/50 border-b last:border-0">
                        <td className="px-4 py-3"><input type="checkbox" aria-label="Select row" className="size-4" /></td>
                        <td className="px-4 py-3">{e.date}</td>
                        <td className="px-4 py-3">{bdt(e.amount)}</td>
                        <td className="px-4 py-3">{e.usd ? `$${e.usd.toFixed(2)}` : '—'}</td>
                        <td className="px-4 py-3">{e.platform}</td>
                        <td className="px-4 py-3">{e.account || '—'}</td>
                        <td className="px-4 py-3">{e.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[14px]">
              <label className="flex items-center gap-2">
                Rows per page
                <select value={rows} onChange={(e) => { setRows(Number(e.target.value)); setPage(1); }} className="border-ed-line h-10 rounded-lg border bg-white px-3">
                  {[10, 25, 50].map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>
              <div className="flex items-center gap-2">
                <button type="button" disabled={cur <= 1} onClick={() => setPage(cur - 1)} className="border-ed-line h-10 rounded-lg border px-4 disabled:opacity-40">Previous</button>
                <span>Page {list.length ? cur : 1} of {list.length ? pages : 0}</span>
                <button type="button" disabled={cur >= pages} onClick={() => setPage(cur + 1)} className="border-ed-line h-10 rounded-lg border px-4 disabled:opacity-40">Next</button>
              </div>
            </div>
          </section>
        </>
      )}

      {modal && (
        <NewExpense
          onClose={() => setModal(false)}
          onSave={(e) => { setEntries((l) => [{ ...e, id: Date.now() }, ...l]); setModal(false); }}
        />
      )}
    </div>
  );
}

function NewExpense({ onClose, onSave }: { onClose: () => void; onSave: (e: Omit<Entry, 'id'>) => void }) {
  const [f, setF] = useState({ date: today(), amount: '', usd: '', platform: platforms[0], account: '', note: '' });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const ok = Number(f.amount) > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onMouseDown={onClose}>
      <div role="dialog" aria-label="New Ad Expense" onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-medium">New Ad Expense</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-ed-muted"><X className="size-5" /></button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-[12.5px]">Date<input type="date" value={f.date} onChange={set('date')} className={cn(field, 'mt-1')} /></label>
          <label className="text-[12.5px]">Platform
            <select value={f.platform} onChange={set('platform')} className={cn(field, 'mt-1')}>{platforms.map((p) => <option key={p}>{p}</option>)}</select>
          </label>
          <label className="text-[12.5px]">Amount (BDT)<input type="number" min="0" value={f.amount} onChange={set('amount')} className={cn(field, 'mt-1')} /></label>
          <label className="text-[12.5px]">USD (optional)<input type="number" min="0" value={f.usd} onChange={set('usd')} className={cn(field, 'mt-1')} /></label>
          <label className="col-span-2 text-[12.5px]">Payment Account<input value={f.account} onChange={set('account')} className={cn(field, 'mt-1')} /></label>
          <label className="col-span-2 text-[12.5px]">Note<input value={f.note} onChange={set('note')} className={cn(field, 'mt-1')} /></label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="border-ed-line h-10 rounded-lg border px-4 text-[14px]">Cancel</button>
          <button type="button" disabled={!ok} onClick={() => onSave({ date: f.date, amount: Number(f.amount), usd: Number(f.usd) || 0, platform: f.platform, account: f.account, note: f.note })} className="bg-ed-brand h-10 rounded-lg px-4 text-[14px] font-medium text-white disabled:opacity-40">Save</button>
        </div>
      </div>
    </div>
  );
}
