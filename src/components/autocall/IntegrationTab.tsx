'use client';

import { useState } from 'react';
import { Play, Phone, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, card, field, ghostBtn, primaryBtn } from './ui';

const methods = ['Steadfast', 'Pathao', 'RedX', 'CarryBee', 'Paperfly'];
const UNAVAILABLE = 'Steadfast';
const optKeys = Array.from({ length: 9 }, (_, i) => `Key ${i + 1}`);
const panel = 'border-ed-line rounded-xl border p-4';
const sub = 'text-ed-muted text-[12px]';
const playBtn = 'border-ed-line text-ed-muted flex size-10 shrink-0 items-center justify-center rounded-lg border bg-[#f7f7fa] disabled:cursor-not-allowed';
const fieldLbl = 'mb-1.5 block text-[14.5px] font-medium';
const stat = 'text-ed-muted text-[12.5px]';

let seq = 0;
const clamp = (v: string, lo: number, hi: number, fb: number) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? String(Math.min(hi, Math.max(lo, n))) : String(fb);
};

export function IntegrationTab() {
  const [balance, setBalance] = useState(0);
  const [topup, setTopup] = useState('');
  const [method, setMethod] = useState(UNAVAILABLE);
  const [test, setTest] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const [label, setLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploads, setUploads] = useState<{ id: number; name: string }[]>([]);
  const [opts, setOpts] = useState([{ id: 1, key: 'Key 1' }, { id: 2, key: 'Key 2' }]);
  const [maxA, setMaxA] = useState('2');
  const [gap, setGap] = useState('15');
  const [dur, setDur] = useState('3');
  const [saved, setSaved] = useState('');
  const [spin, setSpin] = useState(false);

  const flash = (m: string) => {
    setSaved(m);
    setTimeout(() => setSaved(''), 2400);
  };
  const topNum = Number(topup);
  const validPhone = /^01\d{9}$/.test(test);
  const used = new Set(opts.map((o) => o.key));

  return (
    <div className="space-y-4">
      <section className={cn(card, 'overflow-hidden')}>
        <header className="border-ed-line flex items-center gap-3 border-b px-6 py-4 max-sm:px-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#d9f5ec] text-teal-600"><Phone className="size-5" /></span>
          <div>
            <h2 className="text-[26px] leading-tight font-medium tracking-tight">Auto Call Center by EcomDrive</h2>
            <p className="text-ed-muted text-[14px]">Central mode is active. Calls are routed through the Auto Call Center.</p>
          </div>
        </header>

        <div className="space-y-5 p-6 max-sm:p-4">
          <div className="border-ed-line rounded-xl border bg-[#fbfafd] p-3.5">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[['Wallet Balance', `${balance.toFixed(2)} TK`], ['Pending Hold', '0.00 TK'], ['Available Balance', `${balance.toFixed(2)} TK`], ['Current Rate', '1.00 TK/min']].map(([k, v]) => (
                <div key={k}><p className={stat}>{k}</p><p className="mt-0.5 text-[15px]">{v}</p></div>
              ))}
            </div>
            <div className="mt-3 flex gap-3">
              <input inputMode="decimal" value={topup} onChange={(e) => setTopup(e.target.value.replace(/[^\d.]/g, ''))} placeholder="Top-up amount (TK)" className={cn(field, 'h-11 max-w-[220px] bg-white')} />
              <button type="button" disabled={!(topNum > 0)} onClick={() => { setBalance((b) => b + topNum); setTopup(''); flash(`Added ${topNum.toFixed(2)} TK`); }} className="border-ed-line h-11 rounded-lg border bg-white px-4 text-[14px] enabled:hover:text-ed-brand disabled:text-ed-muted/60">Add Balance</button>
            </div>
          </div>

          <div>
            <span className={fieldLbl}>Default Delivery Method for Auto-Confirmed Orders</span>
            <div className="max-w-[704px]"><Select label="Default delivery method" value={method} onChange={setMethod} options={methods} /></div>
            {method === UNAVAILABLE && <p className="mt-2 text-[12.5px] text-orange-700">A saved delivery method is unavailable right now; choose an active method to replace it.</p>}
          </div>

          <div className={panel}>
            <span className={fieldLbl}>Test Call Mobile Number</span>
            <div className="flex gap-3">
              <input value={test} inputMode="numeric" maxLength={11} onChange={(e) => { setTest(e.target.value.replace(/\D/g, '')); setTestMsg(''); }} placeholder="01XXXXXXXXX" className={cn(field, 'h-11 flex-1 bg-[#f7f7fa]')} />
              <button type="button" disabled={!validPhone} onClick={() => setTestMsg(balance < 1 ? 'Insufficient balance. Add balance to place a test call.' : `Test call queued to ${test}.`)} className="border-ed-line h-11 rounded-lg border bg-white px-5 text-[14px] enabled:hover:text-ed-brand disabled:text-ed-muted/60">Test Call</button>
            </div>
            <p className={cn(sub, 'mt-2')}>Send one live test call using current Auto Call Center settings.</p>
            {testMsg && <p role="status" className="mt-2 text-[12.5px] text-orange-700">{testMsg}</p>}
          </div>

          <div className={panel}>
            <span className={fieldLbl}>Upload Voice File</span>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.5fr_1.2fr_auto]">
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Voice label (optional)" className={cn(field, 'h-11')} />
              <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={cn(field, 'h-11 py-2.5 file:mr-2 file:cursor-pointer file:border-0 file:bg-transparent file:p-0')} />
              <button type="button" disabled={!file} onClick={() => { setUploads((u) => [{ id: ++seq, name: label.trim() || file!.name }, ...u]); setLabel(''); setFile(null); flash('Voice uploaded, waiting for approval'); }} className="border-ed-line h-11 rounded-lg border bg-white px-4 text-[14px] enabled:hover:text-ed-brand disabled:text-ed-muted/70">Upload to Voice Library</button>
            </div>
            <p className={cn(sub, 'mt-2')}>Uploaded voices require Super Admin approval before they can be used.</p>
            {uploads.length > 0 && (
              <ul className="mt-2 space-y-1 text-[13px]">
                {uploads.map((u) => <li key={u.id} className="flex items-center gap-2">{u.name}<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-700">Pending approval</span></li>)}
              </ul>
            )}
            <p className="mt-4 text-[14.5px] font-medium">Question Voice (Approved)</p>
            <p className={sub}>Only voices approved for this business are shown.</p>
            <div className="mt-2 flex gap-3">
              <div className="flex-1"><Select label="Question voice" value="Select approved question voice" onChange={() => {}} options={['Select approved question voice']} /></div>
              <button type="button" disabled aria-label="Play voice" className={playBtn}><Play className="size-4" /></button>
            </div>
          </div>

          <div className={panel}>
            <div className="flex items-center justify-between">
              <span className="text-[14.5px] font-medium">DTMF Options</span>
              <button type="button" disabled={opts.length >= 9} onClick={() => { const k = optKeys.find((x) => !used.has(x)); if (k) setOpts([...opts, { id: ++seq + 100, key: k }]); }} className="border-ed-line hover:text-ed-brand h-10 rounded-lg border bg-[#f7f7fa] px-4 text-[14px] disabled:opacity-50">Add Option</button>
            </div>
            <p className={cn(sub, 'mt-3 mb-3')}>Use unique keys between 1 and 9. First pressed key determines outcome.</p>
            <div className="space-y-2">
              {opts.map((o) => (
                <div key={o.id} className="grid grid-cols-[110px_1fr_auto_auto] items-center gap-3 max-sm:grid-cols-[100px_1fr_auto]">
                  <Select label="Key" value={o.key} onChange={(v) => setOpts(opts.map((x) => (x.id === o.id ? { ...x, key: v } : x)))} options={optKeys.filter((k) => k === o.key || !used.has(k))} />
                  <Select label="Option voice" value="No option voice" onChange={() => {}} options={['No option voice']} />
                  <button type="button" disabled aria-label="Play voice" className={cn(playBtn, 'max-sm:hidden')}><Play className="size-4" /></button>
                  <button type="button" onClick={() => setOpts(opts.filter((x) => x.id !== o.id))} className="h-10 rounded-lg border border-red-300 bg-white px-4 text-[14px] text-red-600 hover:bg-red-50">Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="block"><span className={fieldLbl}>Default Max Attempts (1-3)</span><input inputMode="numeric" value={maxA} onChange={(e) => setMaxA(e.target.value.replace(/\D/g, ''))} onBlur={() => setMaxA(clamp(maxA, 1, 3, 2))} className={cn(field, 'h-11')} /></label>
            <label className="block"><span className={fieldLbl}>Default Retry Gap Minutes (5-120)</span><input inputMode="numeric" value={gap} onChange={(e) => setGap(e.target.value.replace(/\D/g, ''))} onBlur={() => setGap(clamp(gap, 5, 120, 15))} className={cn(field, 'h-11')} /></label>
            <label className="block"><span className={fieldLbl}>Default Per-Call Duration (minutes)</span><input inputMode="numeric" value={dur} onChange={(e) => setDur(e.target.value.replace(/\D/g, ''))} onBlur={() => setDur(clamp(dur, 1, 10, 3))} className={cn(field, 'h-11')} /></label>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" onClick={() => { setMaxA(clamp(maxA, 1, 3, 2)); setGap(clamp(gap, 5, 120, 15)); setDur(clamp(dur, 1, 10, 3)); flash('Settings saved'); }} className={cn(primaryBtn, 'h-12 px-5')}>Save Settings</button>
            {saved && <p role="status" className="text-[13px] font-medium text-green-700">{saved}</p>}
          </div>
        </div>
      </section>

      <section className={cn(card, 'overflow-hidden')}>
        <header className="border-ed-line flex items-center justify-between gap-3 border-b px-6 py-4 max-sm:px-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e3ecfd] text-ed-blue"><Phone className="size-5" /></span>
            <div>
              <h2 className="text-[26px] leading-tight font-medium tracking-tight">Call Logs</h2>
              <p className="text-ed-muted text-[14px]">Recent auto-call verification attempts and results</p>
            </div>
          </div>
          <button type="button" onClick={() => { setSpin(true); setTimeout(() => setSpin(false), 700); }} className={cn(ghostBtn, 'h-11 px-5')}><RefreshCw className={cn('size-4', spin && 'animate-spin')} /> Refresh</button>
        </header>
        <p className="text-ed-muted px-6 py-12 text-center text-[15px]">No call logs yet. Logs will appear here when auto-call verification is triggered.</p>
      </section>
    </div>
  );
}
