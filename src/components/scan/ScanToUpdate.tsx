'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Camera, RefreshCw, CheckCircle2, Clock, Copy, Download, Info, Keyboard, ScanLine, Send, Volume2, XCircle } from 'lucide-react';
import { allOrders } from '@/data/approvedOrders';
import { cn } from '@/lib/utils';

type Mode = 'Scan To Shipping' | 'Scan To Return' | 'Scan To RTS';
type Result = 'success' | 'failed' | 'duplicate';
interface Entry { id: number; invoice: string; mode: Mode; result: Result; text: string; time: string }

const modes: Mode[] = ['Scan To Shipping', 'Scan To Return', 'Scan To RTS'];
const slug: Record<Mode, string> = { 'Scan To Shipping': 'shipping', 'Scan To Return': 'return', 'Scan To RTS': 'rts' };
const handlingOptions = ['Automatic', 'Restock to inventory', 'Mark as damaged', 'Manual review'];
const target: Record<Mode, string> = { 'Scan To Shipping': 'Shipped', 'Scan To Return': 'Returned', 'Scan To RTS': 'RTS' };
const vol = { Low: 0.05, Med: 0.15, High: 0.4 } as const;
const stat = (r: Result) =>
  ({ success: 'text-emerald-700 bg-emerald-50', failed: 'text-rose-700 bg-rose-50', duplicate: 'text-amber-700 bg-amber-50' })[r];

export function ScanToUpdate() {
  const router = useRouter();
  const params = useSearchParams();
  const mode: Mode = modes.find((m) => slug[m] === params.get('tab')) ?? 'Scan To Shipping';
  const setMode = (m: Mode) => router.replace(`?tab=${slug[m]}`, { scroll: false });
  const [handling, setHandling] = useState(handlingOptions[0]);
  const [review, setReview] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [input, setInput] = useState<'keyboard' | 'camera'>('keyboard');
  const [value, setValue] = useState('');
  const [manual, setManual] = useState('');
  const [all, setAll] = useState(false);
  const [level, setLevel] = useState<keyof typeof vol>('High');
  const [filter, setFilter] = useState('All Status');
  const [log, setLog] = useState<Entry[]>([]);
  const [guide, setGuide] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [camErr, setCamErr] = useState('');
  const status = useRef<Record<string, string>>({});
  const scanned = useRef(new Set<string>());
  const seq = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const kbRef = useRef<HTMLInputElement>(null);

  const beep = useCallback((ok: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = ok ? 880 : 220;
      g.gain.value = vol[level];
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.12);
      o.onended = () => ctx.close();
    } catch {
      /* ignore */
    }
  }, [level]);

  const submit = useCallback((raw: string, fromCamera = false) => {
    const invoice = raw.trim().toUpperCase();
    if (!invoice) return;
    if (fromCamera && mode === 'Scan To Return' && review) { setPending(invoice); return; }
    const order = allOrders.find((o) => o.invoice.toUpperCase() === invoice);
    const to = target[mode];
    const key = `${mode}:${invoice}`;
    let result: Result;
    let text: string;
    if (!order) { result = 'failed'; text = all ? 'Order not found in any business' : 'Order not found'; }
    else if (scanned.current.has(key) || (status.current[invoice] ?? order.status) === to) { result = 'duplicate'; text = `Already ${to}`; }
    else { result = 'success'; text = `${order.status} → ${to}`; status.current[invoice] = to; scanned.current.add(key); }
    beep(result === 'success');
    setLog((l) => [{ id: ++seq.current, invoice, mode, result, text, time: new Date().toLocaleTimeString() }, ...l]);
  }, [mode, all, beep, review]);

  const stopCam = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  }, []);

  useEffect(() => { if (input !== 'camera' || mode !== 'Scan To Return') { setPending(null); } }, [input, mode]);
  useEffect(() => { if (input !== 'camera') stopCam(); }, [input, stopCam]);
  const flip = () => { setFacing((f) => (f === 'environment' ? 'user' : 'environment')); if (camOn) { stopCam(); setTimeout(() => startCam(), 150); } };
  useEffect(() => stopCam, [stopCam]);
  useEffect(() => { if (input === 'keyboard') kbRef.current?.focus(); }, [input, mode]);

  const startCam = async () => {
    setCamErr('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } });
      streamRef.current = s;
      setCamOn(true);
      requestAnimationFrame(async () => {
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = s;
        await v.play().catch(() => {});
        const BD = (window as unknown as { BarcodeDetector?: new (o: object) => { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
        if (!BD) { setCamErr('Auto-detect is not supported in this browser. Use manual entry below.'); return; }
        const det = new BD({ formats: ['code_128', 'code_39', 'qr_code', 'ean_13'] });
        let last = '';
        let lastAt = 0;
        const tick = async () => {
          if (!streamRef.current) return;
          try {
            const c = await det.detect(v);
            const code = c[0]?.rawValue;
            if (code && (code !== last || Date.now() - lastAt > 3000)) { last = code; lastAt = Date.now(); submit(code, true); }
          } catch { /* ignore */ }
          setTimeout(tick, 400);
        };
        tick();
      });
    } catch {
      setCamErr('Camera access is blocked. Use manual entry below.');
    }
  };

  const counts = useMemo(() => ({
    unique: new Set(log.map((e) => e.invoice)).size,
    success: log.filter((e) => e.result === 'success').length,
    failed: log.filter((e) => e.result === 'failed').length,
    duplicate: log.filter((e) => e.result === 'duplicate').length,
  }), [log]);

  const shown = log.filter((e) => filter === 'All Status' || e.result === filter.toLowerCase());

  const onKb = (e: FormEvent) => { e.preventDefault(); submit(value); setValue(''); };
  const onManual = (e: FormEvent) => { e.preventDefault(); submit(manual); setManual(''); };

  const exportCsv = () => {
    const csv = ['Invoice,Mode,Result,Detail,Time', ...log.map((e) => `${e.invoice},${e.mode},${e.result},"${e.text}",${e.time}`)].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `scan-result-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const cards = [
    { label: 'Unique Parcels', n: counts.unique, color: 'text-ed-brand', icon: <ScanLine className="size-5" /> },
    { label: 'Successful Updates', n: counts.success, color: 'text-emerald-700', icon: <CheckCircle2 className="size-5 text-emerald-600" /> },
    { label: 'Failed Attempts', n: counts.failed, color: 'text-rose-700', icon: <XCircle className="size-5 text-rose-600" /> },
    { label: 'Duplicate / Already Updated', n: counts.duplicate, color: 'text-amber-700', icon: <Copy className="size-5 text-amber-600" /> },
  ];

  const lift = 'border-ed-line rounded-xl border bg-white shadow-[0_2px_8px_rgba(30,20,50,0.06)]';

  return (
    <div className="mx-auto max-w-[1340px] pt-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-ed-brand text-[26px] leading-tight font-medium tracking-tight">Logistics Scanner Console</h1>
          <p className="text-ed-text/70 mt-1 text-[14.5px]">Scan order barcodes or invoices to perform high-speed state changes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setGuide((g) => !g)} className="border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[14px]"><BookOpen className="size-4" /> Guide</button>
          <button type="button" onClick={() => logRef.current?.scrollIntoView({ behavior: 'smooth' })} className="border-ed-line hover:text-ed-brand flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[14px]"><Clock className="size-4" /> Scan History</button>
          <button type="button" onClick={exportCsv} disabled={!log.length} className="bg-ed-brand flex h-10 items-center gap-2 rounded-lg px-4 text-[14px] font-medium text-white hover:brightness-110 disabled:opacity-60"><Download className="size-4" /> Export Result</button>
        </div>
      </header>

      <div className="border-ed-line mt-5 border-t" />
      <div role="tablist" className="border-ed-line flex gap-2 border-b">
        {modes.map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => setMode(m)}
            className={cn('-mb-px h-12 border-b-2 px-4 text-[15px] transition-colors', mode === m ? 'border-ed-brand text-ed-text font-medium' : 'text-ed-muted hover:text-ed-brand border-transparent')}>
            {m}
          </button>
        ))}
      </div>

      {mode === 'Scan To Return' && (
        <div className="border-ed-line mt-4 rounded-xl border bg-[#faf8fc] p-3">
          <label className="text-ed-text block px-1 text-[14.5px]">Returned stock handling
            <select value={handling} onChange={(e) => setHandling(e.target.value)} className="border-ed-line focus:border-ed-brand/40 mt-1.5 block h-11 w-full rounded-lg border bg-white px-3 text-[14.5px] outline-none">
              {handlingOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        </div>
      )}

      <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <section className={cn(lift, 'overflow-hidden')}>
            <h2 className="border-ed-line flex items-center gap-3 border-b px-6 py-[18px] text-[17px] font-medium"><ScanLine className="size-[18px]" /> {mode} Scanner Input</h2>
            <div className="p-6">
              <div className="flex gap-2.5">
                {([['keyboard', 'Keyboard scanner', Keyboard], ['camera', 'Use phone camera', Camera]] as const).map(([k, label, Icon]) => (
                  <button key={k} type="button" onClick={() => setInput(k)}
                    className={cn('flex h-10 items-center gap-2 rounded-xl border px-4 text-[13.5px] font-medium', input === k ? 'bg-ed-brand border-ed-brand text-white' : 'border-ed-brand/20 bg-ed-brand-soft/60 text-ed-brand')}>
                    <Icon className="size-4" /> {label}
                  </button>
                ))}
              </div>

              <div className="border-ed-line mt-5 rounded-xl border bg-white p-5">
                {input === 'keyboard' ? (
                  <form onSubmit={onKb}>
                    <p className="text-ed-muted flex items-center gap-2 text-[13px]"><ScanLine className="size-4" /> Click input to activate scanner or type manually</p>
                    <input ref={kbRef} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Scan or type invoice number and press Enter..."
                      className="border-ed-line placeholder:text-ed-muted focus:border-ed-brand/40 focus:ring-ed-brand/10 mt-3 h-[52px] w-full rounded-xl border bg-[#fbfafd] px-4 text-[15px] outline-none focus:ring-2" />
                  </form>
                ) : (
                  <div>
                    <div className="flex items-center justify-between"><p className="text-ed-muted flex items-center gap-2 text-[13px]"><Camera className="size-4" /> Tap start camera to scan from your phone</p><button type="button" onClick={flip} aria-label="Switch camera" className="text-ed-muted hover:text-ed-brand"><RefreshCw className="size-3.5" /></button></div>
                    <div className="border-ed-line mt-3 flex h-[220px] items-center justify-center overflow-hidden rounded-xl border bg-[#faf9fc]">
                      <video ref={videoRef} muted playsInline className={cn('size-full object-cover', !camOn && 'hidden')} />
                    </div>
                    <button type="button" onClick={camOn ? stopCam : startCam} className="bg-ed-brand mt-4 flex h-10 items-center gap-2 rounded-lg px-5 text-[14px] font-medium text-white hover:brightness-110">
                      <ScanLine className="size-4" /> {camOn ? 'Stop camera' : 'Start camera'}
                    </button>
                    {mode === 'Scan To Return' && (
                      <div className="border-ed-line mt-4 rounded-xl border bg-[#faf9fc] p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-ed-text text-[14px] font-medium">পার্সেল আগে চেক করুন</p>
                            <p className="text-ed-muted mt-1 text-[12px] leading-[1.45]">এই মোড চালু থাকলে ক্যামেরা স্ক্যান করার সাথে সাথে রিটার্ন হবে না। আগে পার্সেলের তথ্য, রিটার্ন তারিখ ও কারণ দেখাবে। সব ঠিক থাকলে &quot;Mark Returned&quot; চাপলে অর্ডার Returned হবে।</p>
                            <p className="text-ed-brand/80 mt-2.5 text-[11.5px]">Current camera workflow: {review ? 'Review before return' : 'Auto Return'}</p>
                          </div>
                          <button type="button" role="switch" aria-checked={review} aria-label="Check parcel first" onClick={() => setReview((r) => !r)} className={cn('relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors', review ? 'bg-ed-brand' : 'bg-[#e6e3ec]')}>
                            <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform', review && 'translate-x-5')} />
                          </button>
                        </div>
                        {pending && (() => {
                          const o = allOrders.find((x) => x.invoice.toUpperCase() === pending);
                          return (
                            <div className="border-ed-line mt-3 rounded-lg border bg-white p-3 text-[13px]">
                              {o ? (<><p className="font-medium">{o.invoice} · {o.name}</p><p className="text-ed-muted mt-0.5">{o.mobile} · Status: {status.current[pending] ?? o.status} · Return date: {new Date().toLocaleDateString()}</p><p className="text-ed-muted">Handling: {handling}</p></>) : (<p className="text-rose-700">Order {pending} not found</p>)}
                              <div className="mt-3 flex gap-2">
                                {o && <button type="button" onClick={() => { submit(pending); setPending(null); }} className="bg-ed-brand h-9 rounded-lg px-4 text-[13px] font-medium text-white">Mark Returned</button>}
                                <button type="button" onClick={() => { if (!o) submit(pending); setPending(null); }} className="border-ed-line h-9 rounded-lg border px-4 text-[13px]">{o ? 'Cancel' : 'Dismiss'}</button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    <p className="text-ed-muted mt-3 text-[11.5px]">{camErr || 'Camera mode keeps manual entry available below in case the barcode is damaged or camera access is blocked.'}</p>
                  </div>
                )}
              </div>

              <form onSubmit={onManual} className="border-ed-line mt-4 flex items-center gap-3 rounded-xl border bg-white px-5 py-3.5 max-sm:flex-wrap">
                <span className="text-ed-text text-[12px] font-semibold tracking-wider whitespace-nowrap uppercase">Manual Override:</span>
                <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Enter invoice # manually..." className="border-ed-line focus:border-ed-brand/40 h-10 min-w-0 flex-1 rounded-lg border px-3 text-[13.5px] outline-none" />
                <button type="submit" disabled={!manual.trim()} className="bg-ed-brand flex h-10 items-center gap-2 rounded-lg px-5 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"><Send className="size-4" /> Submit</button>
              </form>
            </div>
          </section>

          {guide && (
            <div className="border-ed-brand/25 bg-ed-brand-soft/30 mt-5 rounded-xl border border-dashed p-4">
              <p className="flex items-center gap-2 text-[13px] font-semibold"><Info className="size-4" /> Scanner Instructions &amp; Shortcuts</p>
              <ul className="text-ed-brand/90 mt-2 list-disc space-y-1.5 pl-6 text-[12.5px]">
                <li>For barcode hardware scanners, keep this page open and focused. No input click is necessary.</li>
                <li>Toggle between camera scan and keyboard scan modes using the selector buttons above.</li>
                <li>Adjust beep sounds, volume, and manual override fields inside the toolbar.</li>
              </ul>
            </div>
          )}

          <div className="border-ed-line mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-[#faf8fc] p-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="border-ed-line flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-3 py-2 text-[13.5px]">
                <button type="button" role="switch" aria-checked={all} onClick={() => setAll((a) => !a)} className={cn('relative h-6 w-11 rounded-full transition-colors', all ? 'bg-ed-brand' : 'bg-[#e6e3ec]')}>
                  <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform', all && 'translate-x-5')} />
                </button>
                Search all businesses
              </label>
              <div className="border-ed-line flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-[13.5px]">
                <Volume2 className="size-4" />
                <div className="flex rounded-lg bg-white p-0.5">
                  {(Object.keys(vol) as (keyof typeof vol)[]).map((l) => (
                    <button key={l} type="button" onClick={() => setLevel(l)} className={cn('rounded-md px-3 py-1', level === l ? 'bg-ed-brand-soft text-ed-brand font-medium' : 'text-ed-text')}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[12.5px] font-semibold tracking-wider uppercase">
              Filter
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border-ed-line h-10 rounded-lg border bg-white px-3 text-[13.5px] font-normal tracking-normal normal-case outline-none">
                {['All Status', 'Success', 'Failed', 'Duplicate'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <aside>
          <p className="text-ed-muted mt-3 mb-4 text-[12px] font-semibold tracking-wider uppercase">Scan Session Summary</p>
          <div className="space-y-4">
            {cards.map((c) => (
              <div key={c.label} className={cn(lift, 'flex items-center justify-between px-5 py-4')}>
                <div>
                  <p className="text-ed-muted text-[12px] font-semibold tracking-wider uppercase">{c.label}</p>
                  <p className={cn('mt-1 text-[32px] leading-tight font-semibold tabular-nums', c.color)}>{c.n}</p>
                </div>
                <span className="border-ed-line flex size-9 items-center justify-center rounded-lg border bg-white">{c.icon}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section ref={logRef} className="mt-12 scroll-mt-4">
        <h2 className="px-1 text-[13px] font-semibold tracking-wider uppercase">Scan Activity Log</h2>
        <div className="border-ed-line mt-4 rounded-2xl border border-dashed bg-white/60 px-4 py-6">
          {shown.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-center">
              <span className="bg-ed-brand-soft text-ed-brand flex size-[60px] items-center justify-center rounded-full"><ScanLine className="size-7" /></span>
              <p className="mt-4 text-[14.5px] font-medium">Ready to scan</p>
              <p className="text-ed-muted mt-1 text-[12px]">{log.length ? 'No entries match this filter' : 'No items scanned yet'}</p>
            </div>
          ) : (
            <ul className="divide-ed-line divide-y">
              {shown.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-3 px-2 py-3 text-[14px]">
                  <span className="min-w-24 font-medium">{e.invoice}</span>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[12px] font-medium capitalize', stat(e.result))}>{e.result}</span>
                  <span className="text-ed-muted flex-1">{e.text}</span>
                  <span className="text-ed-muted text-[12px]">{e.mode} · {e.time}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
