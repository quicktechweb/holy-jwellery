'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, BellOff, BellRing, Check, ChevronLeft, ChevronRight, Clock, ListChecks, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LangToggle, Stat, WORK_ITEMS, card, chip, type Lang } from './ui';

const REASONS = ['All reasons', 'Pending return', 'Returned order', 'Shipping delay', 'Web order delay', 'RTS not sent', 'Courier hold', 'Customer callback', 'Manual task', 'Courier issue', 'Unassigned work', 'Chat follow-up', 'Chat task'];
const SOURCES = ['All sources', 'APPROVED ORDER', 'WEB ORDER', 'CUSTOMER', 'FOLLOWUP', 'TASK', 'SYSTEM', 'CONVERSATION'];
const BUSINESSES = ['All businesses', 'Elishine'];

const BN: Record<string, string> = {
  'My Work': 'আমার কাজ', Open: 'ওপেন', Overdue: 'ওভারডিউ', 'Due today': 'আজকের ডিউ', Urgent: 'জরুরি', 'Done today': 'আজ সম্পন্ন', Done: 'সম্পন্ন',
  'কাজ চলছে': 'কাজ চলছে', 'All due': 'সব ডিউ', 'Alerts off': 'অ্যালার্ট বন্ধ', 'Alerts on': 'অ্যালার্ট চালু', 'Select loaded page': 'লোড হওয়া পেজ সিলেক্ট করুন',
  'Complete selected': 'সিলেক্ট করা সম্পন্ন করুন', 'No tasks': 'কোনো কাজ নেই', 'Search invoice, customer, phone': 'ইনভয়েস, কাস্টমার, ফোন সার্চ করুন',
  'All businesses': 'সব বিজনেস', 'All reasons': 'সব কারণ', 'All sources': 'সব সোর্স',
};
const todayIso = () => new Date().toISOString().slice(0, 10);

export function MyWork() {
  const [lang, setLang] = useState<Lang>('en');
  const t = (k: string) => (lang === 'bn' ? BN[k] ?? k : k);

  const [alerts, setAlerts] = useState(false);
  const [status, setStatus] = useState<'open' | 'progress' | 'done'>('open');
  const [due, setDue] = useState<'all' | 'today' | 'overdue'>('overdue');
  const [biz, setBiz] = useState(BUSINESSES[0]);
  const [reason, setReason] = useState('Shipping delay');
  const [source, setSource] = useState(SOURCES[0]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [q, setQ] = useState('');
  const [size, setSize] = useState(25);
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<string[]>([]);

  const today = todayIso();
  const rows = useMemo(() => WORK_ITEMS.filter((w) =>
    w.status === status
    && (due === 'all' || (due === 'today' ? w.due === today : w.due < today))
    && (biz === BUSINESSES[0] || w.business === biz)
    && (reason === REASONS[0] || w.reason === reason)
    && (source === SOURCES[0] || w.source === source)
    && (!from || w.due >= from) && (!to || w.due <= to)
    && (!q || `${w.title} ${w.customer} ${w.phone}`.toLowerCase().includes(q.toLowerCase()))), [status, due, biz, reason, source, from, to, q, today]);

  const pages = Math.max(1, Math.ceil(rows.length / size));
  const view = rows.slice((page - 1) * size, page * size);
  const stats = {
    open: WORK_ITEMS.filter((w) => w.status !== 'done').length,
    overdue: WORK_ITEMS.filter((w) => w.status !== 'done' && w.due < today).length,
    dueToday: WORK_ITEMS.filter((w) => w.status !== 'done' && w.due === today).length,
    urgent: WORK_ITEMS.filter((w) => w.status !== 'done' && w.urgent).length,
    done: WORK_ITEMS.filter((w) => w.status === 'done' && w.due === today).length,
  };
  const allOn = view.length > 0 && view.every((w) => sel.includes(w.id));
  const sc = 'border-ed-line focus:border-ed-brand/50 h-10 rounded-lg border bg-white px-3 text-[14.5px] outline-none';

  return (
    <div className="mx-auto max-w-[1280px] pt-8 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] leading-tight font-medium tracking-tight">{t('My Work')}</h1>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setAlerts((a) => !a)} className="border-ed-line hover:bg-ed-bg/60 flex h-11 items-center gap-2 rounded-xl border bg-white px-4 text-[14.5px] shadow-sm">
            {alerts ? <BellRing className="size-4" /> : <BellOff className="size-4" />}{t(alerts ? 'Alerts on' : 'Alerts off')}
          </button>
          <LangToggle lang={lang} onChange={setLang} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label={t('Open')} value={stats.open} icon={<ListChecks className="size-5" />} />
        <Stat label={t('Overdue')} value={stats.overdue} icon={<AlertTriangle className="size-5" />} />
        <Stat label={t('Due today')} value={stats.dueToday} icon={<Clock className="size-5" />} />
        <Stat label={t('Urgent')} value={stats.urgent} icon={<RefreshCw className="size-5" />} />
        <Stat label={t('Done today')} value={stats.done} icon={<Check className="size-5" />} />
      </div>

      <section className={cn(card, 'mt-5 p-3.5')}>
        <div className="border-ed-line flex flex-wrap items-center justify-between gap-3 border-b pb-3.5">
          <div className="flex gap-2">
            {([['open', 'Open'], ['progress', 'কাজ চলছে'], ['done', 'Done']] as const).map(([k, l]) => (
              <button key={k} type="button" onClick={() => { setStatus(k); setPage(1); }} className={chip(status === k)}>{t(l)}</button>
            ))}
          </div>
          <label className="border-ed-line focus-within:border-ed-brand/50 flex h-10 w-full max-w-[256px] items-center gap-2.5 rounded-lg border bg-white px-3">
            <Search className="text-ed-muted size-4" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t('Search invoice, customer, phone')} className="placeholder:text-ed-muted w-full text-[14px] outline-none" />
          </label>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <SlidersHorizontal className="text-ed-muted mx-1.5 size-4" />
          {([['all', 'All due'], ['today', 'Due today'], ['overdue', 'Overdue']] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => { setDue(k); setPage(1); }} className={chip(due === k)}>{t(l)}</button>
          ))}
          <select value={biz} onChange={(e) => setBiz(e.target.value)} className={sc}>{BUSINESSES.map((o) => <option key={o} value={o}>{t(o)}</option>)}</select>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className={cn(sc, 'min-w-[165px]')}>{REASONS.map((o) => <option key={o} value={o}>{t(o)}</option>)}</select>
          <select value={source} onChange={(e) => setSource(e.target.value)} className={cn(sc, 'min-w-[165px]')}>{SOURCES.map((o) => <option key={o} value={o}>{t(o)}</option>)}</select>
          <input type="date" aria-label="From date" value={from} onChange={(e) => setFrom(e.target.value)} className={sc} />
          <input type="date" aria-label="To date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={sc} />
        </div>
      </section>

      <section className={cn(card, 'mt-4 flex items-center justify-between gap-3 p-3.5')}>
        <label className="flex items-center gap-3 text-[14.5px]">
          <input type="checkbox" checked={allOn} onChange={() => setSel(allOn ? [] : view.map((w) => w.id))} className="border-ed-line size-4 rounded" />
          {t('Select loaded page')}
        </label>
        <button type="button" disabled={!sel.length} className="bg-ed-brand flex h-11 items-center gap-2 rounded-lg px-4 text-[14.5px] font-medium text-white transition-opacity disabled:opacity-50">
          <Check className="size-4" />{t('Complete selected')} ({sel.length})
        </button>
      </section>

      <section className={cn(card, 'mt-4 overflow-hidden')}>
        {view.length === 0 ? (
          <p className="text-ed-muted px-6 py-[38px] text-center text-[14.5px]">{t('No tasks')}</p>
        ) : (
          <ul>
            {view.map((w) => (
              <li key={w.id} className="border-ed-line flex items-center gap-3 border-b px-5 py-4 text-[14.5px]">
                <input type="checkbox" checked={sel.includes(w.id)} onChange={() => setSel((s) => (s.includes(w.id) ? s.filter((x) => x !== w.id) : [...s, w.id]))} className="size-4" />
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{w.title}</p><p className="text-ed-muted truncate text-[13px]">{w.customer} · {w.phone} · {w.reason}</p></div>
                <span className="text-ed-muted text-[13px]">{w.due}</span>
              </li>
            ))}
          </ul>
        )}
        <footer className="border-ed-line flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3.5">
          <p className="text-ed-muted text-[14.5px]">Page {page} of {pages} - {rows.length} work items</p>
          <div className="flex items-center gap-2">
            <select value={size} onChange={(e) => { setSize(+e.target.value); setPage(1); }} className={cn(sc, 'h-11')}>{[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}</select>
            <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="border-ed-line flex size-11 items-center justify-center rounded-lg border disabled:opacity-40"><ChevronLeft className="size-4" /></button>
            <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="border-ed-line flex size-11 items-center justify-center rounded-lg border disabled:opacity-40"><ChevronRight className="size-4" /></button>
          </div>
        </footer>
      </section>
    </div>
  );
}
