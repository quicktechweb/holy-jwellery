'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AutoCallReport } from './AutoCallReport';
import { IntegrationTab } from './IntegrationTab';
import { RulesTab } from './RulesTab';
import { Section, Select, card, field, ghostBtn, lbl, primaryBtn } from './ui';

const tabs = ['Auto Call Center', 'Broadcast', 'Leads', 'My Leads', 'Auto Call Report', 'Rules', 'Integration Setup'] as const;
type Tab = (typeof tabs)[number];

export function AutoCallCenter() {
  const sp = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => tabs.find((t) => t === sp.get('tab')) ?? 'Auto Call Center');
  return (
    <div className="pt-4">
      <nav aria-label="Auto call sections" className="border-ed-line bg-white/70 mb-4 flex max-w-[1020px] overflow-x-auto rounded-xl border p-1 shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            aria-current={tab === t ? 'page' : undefined}
            onClick={() => setTab(t)}
            className={cn(
              'h-10 min-w-[110px] flex-1 rounded-lg px-4 text-[14.5px] font-medium whitespace-nowrap transition-colors',
              tab === t ? 'bg-ed-brand text-white shadow-[0_3px_8px_rgba(63,19,85,0.35)]' : 'text-ed-text/80 hover:text-ed-brand',
            )}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === 'Auto Call Center' && <CenterTab />}
      {tab === 'Broadcast' && <BroadcastTab />}
      {tab === 'Leads' && <LeadsTab />}
      {tab === 'My Leads' && <MyLeadsTab />}
      {tab === 'Auto Call Report' && <AutoCallReport />}
      {tab === 'Rules' && <RulesTab />}
      {tab === 'Integration Setup' && <IntegrationTab />}
    </div>
  );
}

/* ───────────────────────── Auto Call Center ───────────────────────── */

interface CallOrder {
  no: string;
  customer: string;
  phone: string;
  source: string;
  created: string;
}
const o = (no: string, customer: string, phone: string, source: string, time: string): CallOrder => ({
  no,
  customer,
  phone,
  source,
  created: `10/13/2026, ${time}`,
});
const callOrders: CallOrder[] = [
  o('#55640', 'FARJANA Easmin', '01717530608', 'fb', '9:03:46 AM'),
  o('#55639', 'Bp', '01341714549', 'fb', '8:33:54 AM'),
  o('#55638', 'Md', '01723295542', 'other', '8:18:18 AM'),
  o('#55637', 'সামিয়া', '01720093179', 'other', '7:46:46 AM'),
  o('#55636', 'বিবিখাদিজা', '01629017925', 'other', '6:16:48 AM'),
  o('#55634', 'MdAman', '01787585336', 'other', '4:44:38 AM'),
  o('#55633', 'Sakwat', '01602734144', 'fb', '3:27:13 AM'),
  o('#55632', 'Raj', '01876889760', 'fb', '1:56:05 AM'),
  o('#55631', 'Md', '01786254783', 'other', '1:33:57 AM'),
  o('#55630', 'Shahriar', '01715235416', 'other', '1:03:04 AM'),
  o('#55629', 'Shahana Akhter', '01748234468', 'fb', '12:59:12 AM'),
  o('#55628', 'Mahbub', '01721048385', 'fb', '12:56:40 AM'),
  o('#55627', 'ফারহানা আনাম', '01712180747', 'fb', '12:52:20 AM'),
  o('#55626', 'KhodezaBegum', '01914221528', 'fb', '12:47:51 AM'),
];

const webStatuses = ['Processing', 'Incomplete', 'Good But No Response', 'No Response', 'Advance Payment', 'On Hold'];
const actionOptions = ['Tag only, no status change', 'Confirm Web Order', 'Cancel Web Order', 'Move to On Hold'];
const tagFor = (key: 1 | 2) => [`Auto Call Pressed ${key}`, 'Call Again', 'Confirmed', 'Cancelled by customer'];

interface Act {
  id: number;
  action: string;
  tag: string;
}
interface Run {
  id: number;
  at: string;
  orders: CallOrder[];
}

let actSeq = 10;
function KeyActions({ k, acts, setActs }: { k: 1 | 2; acts: Act[]; setActs: (a: Act[]) => void }) {
  const upd = (id: number, patch: Partial<Act>) => setActs(acts.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  return (
    <div className="border-ed-line rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-[14.5px] font-medium">Key {k} Actions</h4>
          <p className="text-ed-muted text-[12px]">Multiple actions run in order for the same key press.</p>
        </div>
        <button
          type="button"
          onClick={() => setActs([...acts, { id: ++actSeq, action: actionOptions[0], tag: tagFor(k)[0] }])}
          className="border-ed-line hover:text-ed-brand h-10 rounded-lg border bg-[#f7f7fa] px-4 text-[14px]"
        >
          Add Action
        </button>
      </div>
      {acts.map((a) => (
        <div key={a.id} className="border-ed-line mt-3 grid grid-cols-1 items-end gap-3 rounded-xl border p-3 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <span className={lbl}>Action</span>
            <Select label="Action" value={a.action} onChange={(v) => upd(a.id, { action: v })} options={actionOptions} />
          </div>
          <div>
            <span className={lbl}>Tag</span>
            <Select label="Tag" value={a.tag} onChange={(v) => upd(a.id, { tag: v })} options={tagFor(k)} />
          </div>
          <button type="button" onClick={() => setActs(acts.filter((x) => x.id !== a.id))} className="hover:text-ed-red h-10 px-3 text-[14px]">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function CenterTab() {
  const [mode, setMode] = useState<'online' | 'approved'>('online');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('Processing');
  const [source, setSource] = useState('All sources');
  const [outcome, setOutcome] = useState('All outcomes');
  const [attempt, setAttempt] = useState('All attempts');
  const [tag, setTag] = useState('All tags');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [maxAttempts, setMaxAttempts] = useState('2');
  const [gap, setGap] = useState('15');
  const [k1, setK1] = useState<Act[]>([{ id: 1, action: actionOptions[0], tag: 'Auto Call Pressed 1' }]);
  const [k2, setK2] = useState<Act[]>([{ id: 2, action: actionOptions[0], tag: 'Auto Call Pressed 2' }]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [runs, setRuns] = useState<Run[]>([]);

  const rows = useMemo(() => {
    if (mode === 'approved' || status !== 'Processing') return [];
    const t = q.trim().toLowerCase();
    return callOrders.filter(
      (r) =>
        (!t || [r.no, r.customer, r.phone].some((x) => x.toLowerCase().includes(t))) &&
        (source === 'All sources' || r.source === source),
    );
  }, [mode, status, q, source]);

  const allOn = rows.length > 0 && rows.every((r) => picked.has(r.no));
  const toggleAll = () => setPicked(allOn ? new Set() : new Set(rows.map((r) => r.no)));
  const toggle = (no: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(no)) n.delete(no);
      else n.add(no);
      return n;
    });

  const start = () => {
    const chosen = callOrders.filter((r) => picked.has(r.no));
    if (!chosen.length) return;
    setRuns((rs) => [{ id: rs.length + 1, at: new Date().toLocaleString('en-US'), orders: chosen }, ...rs]);
    setPicked(new Set());
  };

  const seg = (on: boolean) =>
    cn('h-9 rounded-lg px-5 text-[14.5px] font-medium transition-colors', on ? 'bg-ed-brand text-white shadow-[0_3px_8px_rgba(63,19,85,0.35)]' : 'text-ed-text/70 hover:text-ed-brand');

  return (
    <div className="space-y-4">
      <section className={card}>
        <div className="px-6 pt-5 pb-4 max-sm:px-4">
          <h1 className="text-[26px] leading-tight font-medium tracking-tight">Auto Call Center by EcomDrive</h1>
        </div>
        <div className="border-ed-line text-ed-muted flex flex-wrap gap-x-5 gap-y-1 border-t px-6 py-3.5 text-[14px] max-sm:px-4">
          {[
            ['Mode', 'Central Auto Call Center'],
            ['Balance', '0.00 TK'],
            ['Hold', '0.00 TK'],
            ['Available', '0.00 TK'],
            ['Rate', '1.00 TK/min'],
          ].map(([k, v]) => (
            <span key={k}>
              {k}: <span className="text-ed-text font-medium">{v}</span>
            </span>
          ))}
        </div>
      </section>

      <Section
        title="Manual Call Batches"
        right={
          <div role="tablist" className="border-ed-line flex rounded-xl border bg-[#f7f7fa] p-1">
            <button role="tab" aria-selected={mode === 'online'} type="button" onClick={() => setMode('online')} className={seg(mode === 'online')}>Online Order</button>
            <button role="tab" aria-selected={mode === 'approved'} type="button" onClick={() => setMode('approved')} className={seg(mode === 'approved')}>Approved Orders</button>
          </div>
        }
      >
        <div className="p-6 max-sm:p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="block"><span className={lbl}>Search</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Phone, customer, order id" className={field} /></label>
            <div><span className={lbl}>Web Order Status</span><Select label="Web Order Status" value={status} onChange={setStatus} options={webStatuses} /></div>
            <div><span className={lbl}>Order Source</span><Select label="Order Source" value={source} onChange={setSource} options={['All sources', 'fb', 'other']} /></div>
            <div><span className={lbl}>Auto Call Outcome</span><Select label="Auto Call Outcome" value={outcome} onChange={setOutcome} options={['All outcomes', 'Pressed 1', 'Pressed 2', 'No Answer', 'Busy', 'Failed']} /></div>
            <div><span className={lbl}>Attempt</span><Select label="Attempt" value={attempt} onChange={setAttempt} options={['All attempts', 'Attempt 1', 'Attempt 2', 'Attempt 3']} /></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-[1.1fr_1fr_1fr_1fr_1.2fr]">
            <div className="max-md:col-span-2"><span className={lbl}>Tag</span><Select label="Tag" value={tag} onChange={setTag} options={['All tags', 'Auto Call Pressed 1', 'Auto Call Pressed 2', 'Call Again']} /></div>
            <label className="block"><span className={lbl}>From Date</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={field} /></label>
            <label className="block"><span className={lbl}>To Date</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={field} /></label>
            <label className="block"><span className={lbl}>Max Attempts (Override)</span><input inputMode="numeric" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value.replace(/\D/g, ''))} className={field} /></label>
            <label className="block"><span className={lbl}>Retry Gap Minutes (Override)</span><input inputMode="numeric" value={gap} onChange={(e) => setGap(e.target.value.replace(/\D/g, ''))} className={field} /></label>
          </div>

          <p className="text-ed-muted mt-4 text-[13.5px]">
            Tag only keeps the Web Order status unchanged. To approve an order, choose Confirm Web Order. Actions run only for the pressed key.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <KeyActions k={1} acts={k1} setActs={setK1} />
            <KeyActions k={2} acts={k2} setActs={setK2} />
          </div>

          <div className="mt-5 flex items-center gap-4">
            <button type="button" disabled={picked.size === 0} onClick={start} className={cn(primaryBtn, 'h-11 px-4')}>Start Auto Call</button>
            <span className="text-ed-muted text-[14px]">{picked.size ? `${picked.size} selected` : 'No orders selected'}</span>
          </div>

          <div className="border-ed-line mt-4 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[900px] text-left text-[14px]">
              <thead>
                <tr className="border-ed-line border-b font-medium">
                  <th className="w-[60px] px-3 py-3"><input type="checkbox" aria-label="Select all" checked={allOn} onChange={toggleAll} className="size-4 accent-[#4a1a63]" /></th>
                  {['Order', 'Customer', 'Phone', 'Status', 'Source', 'Auto Call', 'Attempt', 'Created'].map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={9} className="text-ed-muted px-3 py-10 text-center">No orders found for these filters.</td></tr>
                )}
                {rows.map((r) => (
                  <tr key={r.no} className="border-ed-line hover:bg-ed-bg/60 border-b last:border-b-0">
                    <td className="px-3 py-2.5"><input type="checkbox" aria-label={`Select ${r.no}`} checked={picked.has(r.no)} onChange={() => toggle(r.no)} className="size-4 accent-[#4a1a63]" /></td>
                    <td className="px-3 py-2.5">{r.no}</td>
                    <td className="px-3 py-2.5">{r.customer}</td>
                    <td className="px-3 py-2.5 font-mono text-[12.5px] font-semibold">{r.phone}</td>
                    <td className="px-3 py-2.5 uppercase">{status}</td>
                    <td className="px-3 py-2.5">{r.source}</td>
                    <td className="px-3 py-2.5">-</td>
                    <td className="px-3 py-2.5">-</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{r.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button type="button" disabled className="border-ed-line text-ed-muted h-10 rounded-lg border bg-[#f7f7fa] px-4 text-[14px]">Previous</button>
            <span className="text-ed-blue text-[12px]">Page 1 of 1</span>
            <button type="button" disabled className="border-ed-line text-ed-muted h-10 rounded-lg border bg-[#f7f7fa] px-4 text-[14px]">Next</button>
          </div>
        </div>
      </Section>

      <Section title="Recent Runs">
        {runs.length === 0 ? (
          <p className="text-ed-muted px-6 py-3.5 text-[14px] max-sm:px-4">No runs yet.</p>
        ) : (
          <ul className="divide-ed-line divide-y text-[14px]">
            {runs.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 max-sm:px-4">
                <span>Run #{r.id} · {r.orders.length} order{r.orders.length > 1 ? 's' : ''}</span>
                <span className="text-ed-muted text-[13px]">{r.at}</span>
                <span className="rounded-full bg-[#e4eeff] px-2.5 py-0.5 text-[12px] text-ed-blue">Queued</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Live Run Activity">
        {runs.length === 0 ? (
          <p className="text-ed-muted px-6 py-3.5 text-[14px] max-sm:px-4">Start a run to see real-time call activity.</p>
        ) : (
          <ul className="divide-ed-line divide-y text-[14px]">
            {runs[0].orders.map((r) => (
              <li key={r.no} className="flex items-center justify-between gap-2 px-6 py-2.5 max-sm:px-4">
                <span>{r.no} · {r.customer} · <span className="font-mono text-[12.5px]">{r.phone}</span></span>
                <span className="text-ed-muted text-[13px]">Waiting to dial</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

/* ───────────────────────── Broadcast ───────────────────────── */

const SAMPLE_CSV = 'name,phone\nRahim,01700000000\nKarim,01800000000\n';

function BroadcastTab() {
  const [name, setName] = useState('');
  const [mode, setMode] = useState('IVR (auto-dial)');
  const [file, setFile] = useState<File | null>(null);
  const [campaigns, setCampaigns] = useState<{ name: string; mode: string; file: string }[]>([]);
  const ready = name.trim() !== '' && !!file;

  const sample = () => {
    const url = URL.createObjectURL(new Blob([SAMPLE_CSV], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-contacts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Section title="New broadcast campaign" subtitle="Upload your own customer list (CSV) and call it as a campaign. Numbers are validated and de-duplicated automatically.">
        <div className="p-6 max-sm:p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block"><span className={lbl}>Campaign name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Eid offer — repeat customers" className={cn(field, 'h-11')} /></label>
            <div>
              <span className={lbl}>Mode</span>
              <Select label="Mode" value={mode} onChange={setMode} options={['IVR (auto-dial)', 'Agent (manual)']} />
              <p className="text-ed-muted mt-2 text-[12px]">
                {mode.startsWith('IVR') ? 'The system auto-dials every contact and plays your recorded message.' : 'Contacts are assigned to agents who call them manually.'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className={lbl}>Contact list (.csv)</span>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={cn(field, 'h-11 flex-1 py-2.5 file:mr-2 file:cursor-pointer file:border-0 file:bg-transparent file:p-0')} />
              <button
                type="button"
                disabled={!ready}
                onClick={() => {
                  setCampaigns((c) => [{ name: name.trim(), mode, file: file!.name }, ...c]);
                  setName('');
                  setFile(null);
                }}
                className={cn(primaryBtn, 'h-11 px-5')}
              >
                <Upload className="size-4" /> Create campaign
              </button>
            </div>
            <button type="button" onClick={sample} className="text-ed-blue mt-2 text-[12.5px] underline">Download sample CSV</button>
          </div>
        </div>
      </Section>

      <h3 className="mt-6 mb-5 text-[15px] font-medium">Campaigns</h3>
      {campaigns.length === 0 ? (
        <p className="text-ed-muted mt-10 text-center text-[14px]">No campaigns yet. Upload a contact list above to create one.</p>
      ) : (
        <ul className="space-y-2">
          {campaigns.map((c, i) => (
            <li key={i} className={cn(card, 'flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[14px]')}>
              <span className="font-medium">{c.name}</span>
              <span className="text-ed-muted text-[13px]">{c.mode} · {c.file}</span>
              <span className="rounded-full bg-[#e4eeff] px-2.5 py-0.5 text-[12px] text-ed-blue">Draft</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ───────────────────────── Leads / My Leads ───────────────────────── */

const followUps = ['All statuses', 'New', 'Interested', 'Not interested', 'Call back', 'Confirmed'];

function LeadsTab() {
  const [campaign, setCampaign] = useState('All campaigns');
  const [assigned, setAssigned] = useState('Everyone');
  const [fu, setFu] = useState('All statuses');
  const [q, setQ] = useState('');
  const [ready, setReady] = useState(false);
  return (
    <Section title="Leads" subtitle="Every contact from your broadcast campaigns, and who is working it.">
      <div className="p-6 max-sm:p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div><span className={lbl}>Campaign</span><Select label="Campaign" value={campaign} onChange={setCampaign} options={['All campaigns']} /></div>
          <div><span className={lbl}>Assigned to</span><Select label="Assigned to" value={assigned} onChange={setAssigned} options={['Everyone', 'Unassigned', 'Smita']} /></div>
          <div><span className={lbl}>Follow-up status</span><Select label="Follow-up status" value={fu} onChange={setFu} options={followUps} /></div>
          <label className="block"><span className={lbl}>Search</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or phone" className={field} /></label>
        </div>
        <label className="mt-4 flex items-center gap-2 text-[14px]">
          <input type="checkbox" checked={ready} onChange={(e) => setReady(e.target.checked)} className="size-4 accent-[#4a1a63]" />
          Ready to call <span className="text-ed-muted text-[12px]">— manual campaigns, plus hybrid leads the auto caller has finished with</span>
        </label>
        <p className="text-ed-muted my-10 text-center text-[14px]">No contacts match these filters.</p>
      </div>
    </Section>
  );
}

function MyLeadsTab() {
  const [fu, setFu] = useState('All statuses');
  const [q, setQ] = useState('');
  const [ready, setReady] = useState(false);
  return (
    <Section title="My Leads" subtitle="Contacts from your business's broadcast campaigns that are assigned to you. Call them, then set how it went.">
      <div className="p-6 max-sm:p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div><span className={lbl}>Follow-up status</span><Select label="Follow-up status" value={fu} onChange={setFu} options={followUps} /></div>
          <label className="block"><span className={lbl}>Search</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or phone" className={field} /></label>
        </div>
        <label className="mt-4 flex items-center gap-2 text-[14px]">
          <input type="checkbox" checked={ready} onChange={(e) => setReady(e.target.checked)} className="size-4 accent-[#4a1a63]" />
          Ready to call <span className="text-ed-muted text-[12px]">— hides leads the auto caller is still working through</span>
        </label>
        <p className="text-ed-muted my-12 text-center text-[14px]">No leads are assigned to you right now.</p>
      </div>
    </Section>
  );
}

export { ghostBtn };
