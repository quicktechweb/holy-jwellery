'use client';

import { useEffect, useMemo, useState } from 'react';
import { Brush, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Kind = 'ip' | 'mobile' | 'device';
interface Row {
  id: string;
  value: string;
  blockedAt: string;
  permanent: boolean;
  expires: string;
  /** new block hole real expiry time; seed data te nai */
  expiresAt?: number;
}

const LIMIT = 2500;
const STORE = 'ed.blocklist.v1';

const cfg: Record<Kind, { tab: string; col: string; button: string; title: string; label: string; placeholder: string; submit: string }> = {
  ip: { tab: 'Blocked IPs', col: 'IP Address', button: 'Block New IP', title: 'Block IP Address', label: 'IP Address', placeholder: 'Enter IP address', submit: 'Block IP' },
  mobile: { tab: 'Blocked Mobile Numbers', col: 'Mobile Number', button: 'Block New Mobile', title: 'Block Mobile Number', label: 'Mobile Number', placeholder: 'Enter mobile number', submit: 'Block Mobile' },
  device: { tab: 'Blocked Devices', col: 'Device Key', button: 'Block New Device', title: 'Block Device', label: 'Device Key', placeholder: 'Enter device key', submit: 'Block Device' },
};

const t = (value: string, blockedAt: string, expires: string): Row => ({ id: `${value}-${blockedAt}`, value, blockedAt, permanent: false, expires });

const seedIps: Row[] = [
  t('103.152.103.84', '3 days ago', '27 days from now'),
  t('180.94.25.250', '8 days ago', 'almost 1418 years from now'),
  t('2404:1c40:1c0:249f:b0f9:8eff', '28 days ago', 'over 1493 years from now'),
  t('103.103.33.180', '29 days ago', 'over 113 years from now'),
  t('103.146.92.251', 'about 1 month ago', 'almost 144 years from now'),
  t('01731419732', 'about 1 month ago', 'about 2347 years from now'),
  t('37.111.194.168', 'about 1 month ago', 'almost 125 years from now'),
  t('2400:c600:5500:bb4::1', 'about 1 month ago', 'over 149 years from now'),
  t('161.248.241.194', 'about 1 month ago', 'almost 1654 years from now'),
  t('2401:1900:1f5:d34a::1', 'about 1 month ago', 'almost 868 years from now'),
  ...[
    '202.134.9.77', '45.64.201.18', '103.60.175.3', '114.130.42.200', '119.30.38.91', '27.147.185.14',
    '103.91.54.122', '36.255.68.9', '182.160.100.45', '103.108.140.66', '123.200.13.8', '43.229.12.150',
    '103.4.146.31', '59.153.100.27', '116.68.201.5', '203.76.108.19',
  ].map((ip, i) => t(ip, `${2 + (i % 4)} months ago`, `about ${[2347, 90, 12, 600][i % 4]} years from now`)),
];

const seedMobiles: Row[] = [
  t('01765591109', '3 days ago', '27 days from now'),
  t('01762415693', '25 days ago', 'Unknown expiry'),
  t('01710822124', '28 days ago', 'over 90 years from now'),
  t('01632393536', '29 days ago', 'over 1 year from now'),
  t('01333666333', 'about 1 month ago', 'about 9 years from now'),
  t('103.153.174.137', '2 months ago', 'about 2 years from now'),
  t('01304156548', '2 months ago', 'about 2347 years from now'),
  t('01965025392', '3 months ago', 'over 234 years from now'),
  t('01407134391', '3 months ago', 'about 2347 years from now'),
  t('01908031199', '3 months ago', 'about 2347 years from now'),
  t('01797602181', '3 months ago', 'about 2347 years from now'),
  t('01856120934', '3 months ago', 'about 2347 years from now'),
];

const seedDevices: Row[] = [
  { id: 'dev-1', value: 'a387cf6fb8f0d4e80ecad1cc9a0fd90f428933d7bb29a755f16485fac3b70955', blockedAt: '3 days ago', permanent: true, expires: 'Never' },
];

const seed: Record<Kind, Row[]> = { ip: seedIps, mobile: seedMobiles, device: seedDevices };

function fromNow(mins: number) {
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} from now`;
  if (mins < 1440) {
    const h = Math.round(mins / 60);
    return `${h} hour${h === 1 ? '' : 's'} from now`;
  }
  const d = Math.round(mins / 1440);
  return `${d} day${d === 1 ? '' : 's'} from now`;
}

const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
const ipv6 = /^[0-9a-f:]+$/i;
function validate(kind: Kind, v: string): string {
  if (!v) return `${cfg[kind].label} is required.`;
  if (kind === 'mobile' && !/^01\d{9}$/.test(v)) return 'Enter a valid 11-digit mobile number (01XXXXXXXXX).';
  if (kind === 'ip') {
    const ok = ipv4.test(v) ? v.split('.').every((n) => Number(n) <= 255) : v.includes(':') && ipv6.test(v);
    if (!ok) return 'Enter a valid IPv4 or IPv6 address.';
  }
  if (kind === 'device' && v.length < 16) return 'Device key looks too short.';
  return '';
}

export function OrderBlockList() {
  const [tab, setTab] = useState<Kind>('ip');
  const [data, setData] = useState<Record<Kind, Row[]>>(seed);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE);
      if (raw) setData(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);
  const commit = (next: Record<Kind, Row[]>) => {
    setData(next);
    try {
      window.localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };
  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 2400);
  };

  const now = Date.now();
  const status = (r: Row) => (r.expiresAt && r.expiresAt < now ? 'Expired' : 'Active');
  const rows = data[tab];
  const c = cfg[tab];

  const cleanup = () => {
    const keep = rows.filter((r) => status(r) === 'Active');
    const removed = rows.length - keep.length;
    if (removed) commit({ ...data, [tab]: keep });
    flash(removed ? `Removed ${removed} expired block${removed > 1 ? 's' : ''}` : 'No expired blocks to clean up');
  };

  const remove = (r: Row) => {
    if (!window.confirm(`Remove block for ${r.value}?`)) return;
    commit({ ...data, [tab]: rows.filter((x) => x.id !== r.id) });
    flash('Block removed');
  };

  const add = (value: string, permanent: boolean, minutes: number) => {
    const row: Row = {
      id: `${value}-${Date.now()}`,
      value,
      blockedAt: 'just now',
      permanent,
      expires: permanent ? 'Never' : fromNow(minutes),
      expiresAt: permanent ? undefined : Date.now() + minutes * 60_000,
    };
    commit({ ...data, [tab]: [row, ...rows] });
    setOpen(false);
    flash(`${c.label} blocked`);
  };

  return (
    <div className="pt-4">
      <section className="border-ed-line overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
        <h1 className="border-ed-line border-b px-6 py-[18px] text-[17px] font-medium max-sm:px-4">Order Block List</h1>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-2.5 pb-1 max-sm:px-4">
          <div role="tablist" className="border-ed-line flex max-w-full overflow-x-auto rounded-xl border bg-[#f7f7fa] p-1">
            {(Object.keys(cfg) as Kind[]).map((k) => {
              const on = tab === k;
              return (
                <button
                  key={k}
                  role="tab"
                  aria-selected={on}
                  type="button"
                  onClick={() => setTab(k)}
                  className={cn(
                    'flex h-10 items-center gap-2.5 rounded-lg px-3.5 text-[14.5px] font-medium whitespace-nowrap transition-colors',
                    on ? 'bg-ed-brand text-white shadow-[0_3px_8px_rgba(63,19,85,0.35)]' : 'text-ed-text/70 hover:text-ed-brand',
                  )}
                >
                  {cfg[k].tab}
                  <span className={cn('rounded-md px-2 py-0.5 text-[12px] font-medium tabular-nums', on ? 'bg-white/20' : 'text-ed-muted bg-white/70')}>
                    {data[k].length}/{LIMIT}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={cleanup} className="border-ed-line hover:text-ed-brand flex h-11 items-center gap-2.5 rounded-lg border bg-white px-5 text-[14.5px] shadow-[0_1px_2px_rgba(30,20,50,0.05)]">
              <Brush className="size-4" /> Cleanup Expired
            </button>
            <button type="button" onClick={() => setOpen(true)} className="bg-ed-brand flex h-11 items-center gap-2.5 rounded-lg px-5 text-[14.5px] font-medium text-white hover:brightness-110">
              <Plus className="size-4" /> {c.button}
            </button>
          </div>
        </div>

        {msg && <p role="status" className="mx-6 mt-3 rounded-lg bg-green-50 px-3 py-2 text-[13px] font-medium text-green-700">{msg}</p>}

        <div className="overflow-x-auto px-6 pb-4 max-sm:px-3">
          <table className="w-full min-w-[820px] text-left text-[15px]">
            <thead>
              <tr className="text-ed-muted border-ed-line border-b">
                {[c.col, 'Blocked At', 'Block Type', 'Expires', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-5 text-[14.5px] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={6} className="text-ed-muted px-4 py-14 text-center text-[14px]">No blocked entries yet.</td></tr>
              )}
              {rows.map((r) => {
                const st = status(r);
                return (
                  <tr key={r.id} className="border-ed-line hover:bg-ed-bg/50 h-[69px] border-b last:border-b-0">
                    <td className={cn('px-4', tab === 'device' && 'font-mono text-[12px]')}>{r.value}</td>
                    <td className="px-4">{r.blockedAt}</td>
                    <td className="px-4">
                      <span className={cn('rounded-full px-3 py-1 text-[14px]', r.permanent ? 'bg-[#fde8ea] text-ed-red' : 'bg-[#fdf1c7] text-amber-700')}>
                        {r.permanent ? 'Permanent' : 'Temporary'}
                      </span>
                    </td>
                    <td className="px-4">{r.expires}</td>
                    <td className="px-4">
                      <span className={cn('rounded-full px-3 py-1 text-[14px]', st === 'Active' ? 'bg-[#fde8ea] text-ed-red' : 'bg-[#eceaf0] text-ed-muted')}>{st}</span>
                    </td>
                    <td className="px-4">
                      <button type="button" aria-label={`Remove ${r.value}`} onClick={() => remove(r)} className="hover:text-ed-red p-1.5">
                        <Trash2 className="size-[18px]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {open && <BlockModal kind={tab} existing={rows.map((r) => r.value)} full={rows.length >= LIMIT} onClose={() => setOpen(false)} onSubmit={add} />}
    </div>
  );
}

function BlockModal({
  kind,
  existing,
  full,
  onClose,
  onSubmit,
}: {
  kind: Kind;
  existing: string[];
  full: boolean;
  onClose: () => void;
  onSubmit: (value: string, permanent: boolean, minutes: number) => void;
}) {
  const c = cfg[kind];
  const [value, setValue] = useState('');
  const [permanent, setPermanent] = useState(false);
  const [duration, setDuration] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const dupe = useMemo(() => existing.includes(value.trim()), [existing, value]);

  const submit = () => {
    const v = value.trim();
    const e = validate(kind, v);
    if (e) return setErr(e);
    if (dupe) return setErr(`${c.label} is already blocked.`);
    if (full) return setErr(`Block limit of ${LIMIT} reached.`);
    const mins = Number(duration);
    if (!permanent && !(Number.isInteger(mins) && mins > 0)) return setErr('Enter a duration in minutes (1 or more).');
    onSubmit(v, permanent, mins);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={c.title} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-[512px] rounded-xl bg-white p-6 shadow-2xl">
        <button type="button" aria-label="Close" onClick={onClose} className="text-ed-muted hover:text-ed-text absolute top-5 right-5"><X className="size-[18px]" /></button>
        <h2 className="text-[20px] font-medium tracking-tight">{c.title}</h2>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-[16px] font-medium">{c.label}</span>
          <input
            autoFocus
            value={value}
            inputMode={kind === 'mobile' ? 'numeric' : 'text'}
            onChange={(e) => { setValue(kind === 'mobile' ? e.target.value.replace(/\D/g, '').slice(0, 11) : e.target.value); setErr(''); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder={c.placeholder}
            className="border-ed-brand ring-ed-brand/20 h-12 w-full rounded-lg border-2 bg-white px-3.5 text-[15px] ring-2 outline-none placeholder:text-ed-muted/70"
          />
        </label>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={permanent}
            aria-label="Permanent Block"
            onClick={() => { setPermanent((p) => !p); setErr(''); }}
            className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', permanent ? 'bg-ed-brand' : 'bg-[#e6e2ec]')}
          >
            <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform', permanent && 'translate-x-5')} />
          </button>
          <span className="text-[15px] font-medium">Permanent Block</span>
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-[16px] font-medium">Duration (minutes)</span>
          <input
            inputMode="numeric"
            disabled={permanent}
            value={duration}
            onChange={(e) => { setDuration(e.target.value.replace(/\D/g, '')); setErr(''); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Enter duration in minutes"
            className="border-ed-line h-12 w-full rounded-lg border bg-white px-3.5 text-[15px] outline-none placeholder:text-ed-muted/70 focus:border-ed-brand/50 disabled:cursor-not-allowed disabled:bg-[#f7f7fa]"
          />
        </label>

        {err && <p role="alert" className="mt-3 text-[13px] text-red-600">{err}</p>}

        <button type="button" onClick={submit} className="bg-ed-brand mt-4 h-12 rounded-lg px-4 text-[14.5px] font-medium text-white hover:brightness-110">
          {c.submit}
        </button>
      </div>
    </div>
  );
}
