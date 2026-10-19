'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, Toggle, card, field, ghostBtn, lbl, primaryBtn } from './ui';

export const GUIDE_PATH = '/dashboard/orders/auto-call/rules-guide';
const STORE = 'ed.autocall.rules';

const webStatuses = ['Processing', 'Incomplete', 'Good But No Response', 'No Response', 'Advance Payment', 'On Hold'];
const approvedStatuses = ['Pending', 'Ready to Ship', 'Shifted', 'Delivering'];
const webActions = ['Confirm Web Order', 'Update status', 'Add tag', 'Send SMS', 'Create task', 'Add note'];
const approvedActions = ['Update approved-order status', 'Add tag', 'Send SMS', 'Create task', 'Add note'];
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface KeyAction {
  id: number;
  key: string;
  action: string;
}
interface Rule {
  id: number;
  name: string;
  orderType: string;
  status: string;
  schedule: string;
  date: string;
  times: string[];
  active: boolean;
  customVoices: boolean;
  keyActions: KeyAction[];
}

function load(): Rule[] {
  try {
    return JSON.parse(window.localStorage.getItem(STORE) ?? '[]');
  } catch {
    return [];
  }
}
function save(r: Rule[]) {
  try {
    window.localStorage.setItem(STORE, JSON.stringify(r));
  } catch {
    /* ignore */
  }
}
const t12 = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

export function RulesTab() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => setRules(load()), []);
  const commit = (r: Rule[]) => {
    setRules(r);
    save(r);
  };

  return (
    <>
      <section className={cn(card, 'overflow-hidden')}>
        <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 max-sm:px-4">
          <div>
            <h2 className="text-[28px] leading-tight font-medium tracking-tight">Auto Call Rules</h2>
            <p className="text-ed-muted mt-1 text-[14.5px]">Create scheduled status-based calls for Web Orders and Approved Orders.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={GUIDE_PATH} className={cn(ghostBtn, 'h-12 px-5')}><BookOpen className="size-4" /> How it Works</Link>
            <button type="button" onClick={() => setOpen(true)} className={cn(primaryBtn, 'h-12 px-5')}>Create Rule</button>
          </div>
        </header>
        <div className="border-ed-line border-t">
          {rules.length === 0 ? (
            <p className="text-ed-muted px-6 py-4 text-[14.5px] max-sm:px-4">No rules yet. Create a rule to auto-call orders by status.</p>
          ) : (
            <ul className="divide-ed-line divide-y">
              {rules.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 max-sm:px-4">
                  <div className="min-w-[200px] flex-1">
                    <p className="text-[15px] font-medium">{r.name}</p>
                    <p className="text-ed-muted mt-0.5 text-[12.5px]">
                      {r.orderType} · {r.status} · {r.schedule === 'Today Only' ? `Today Only (${r.date})` : 'Everyday'}
                    </p>
                  </div>
                  <p className="text-ed-muted flex items-center gap-1.5 text-[13px]"><Clock className="size-3.5" />{r.times.map(t12).join(', ')}</p>
                  <p className="text-ed-muted text-[13px]">Limit 3 · {r.keyActions.length} key action{r.keyActions.length === 1 ? '' : 's'}</p>
                  <span className="flex items-center gap-2 text-[13px]">
                    <Toggle on={r.active} label={`Toggle ${r.name}`} onChange={(v) => commit(rules.map((x) => (x.id === r.id ? { ...x, active: v } : x)))} />
                    {r.active ? 'Active' : 'Paused'}
                  </span>
                  <button type="button" aria-label={`Delete ${r.name}`} onClick={() => window.confirm(`Delete rule "${r.name}"?`) && commit(rules.filter((x) => x.id !== r.id))} className="text-ed-muted hover:text-ed-red">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {open && (
        <RuleModal
          onClose={() => setOpen(false)}
          onCreate={(r) => {
            commit([{ ...r, id: Date.now() }, ...rules]);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

let seq = 0;

function RuleModal({ onClose, onCreate }: { onClose: () => void; onCreate: (r: Rule) => void }) {
  const [name, setName] = useState('');
  const [orderType, setOrderType] = useState('Web Order');
  const [status, setStatus] = useState('Processing');
  const [schedule, setSchedule] = useState('Everyday');
  const [date, setDate] = useState('');
  const [times, setTimes] = useState<{ id: number; v: string }[]>([{ id: 0, v: '10:00' }]);
  const [active, setActive] = useState(true);
  const [customVoices, setCustomVoices] = useState(false);
  const [acts, setActs] = useState<KeyAction[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isWeb = orderType === 'Web Order';
  const statuses = isWeb ? webStatuses : approvedStatuses;
  const actions = isWeb ? webActions : approvedActions;

  const changeType = (v: string) => {
    setOrderType(v);
    setStatus(v === 'Web Order' ? webStatuses[0] : approvedStatuses[0]);
    setActs([]);
  };
  const usedKeys = new Set(acts.map((a) => a.key));
  const addKey = () => {
    const k = keys.find((x) => !usedKeys.has(x));
    if (k) setActs([...acts, { id: ++seq, key: k, action: actions[0] }]);
  };

  const submit = () => {
    if (!name.trim()) return setErr('Rule name is required.');
    if (schedule === 'Today Only' && !date) return setErr('Choose a date for a Today Only rule.');
    if (times.some((t) => !t.v)) return setErr('Fill in every time slot.');
    onCreate({
      id: 0,
      name: name.trim(),
      orderType,
      status,
      schedule,
      date,
      times: times.map((t) => t.v),
      active,
      customVoices,
      keyActions: acts,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Create Rule" onClick={(e) => e.stopPropagation()} className="relative my-4 w-full max-w-[896px] rounded-xl bg-white p-6 shadow-2xl max-sm:p-4">
        <button type="button" aria-label="Close" onClick={onClose} className="text-ed-muted hover:text-ed-text absolute top-5 right-5"><X className="size-[18px]" /></button>
        <h3 className="text-[20px] font-medium tracking-tight">Create Rule</h3>

        <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
          <label className="block">
            <span className={lbl}>Rule Name</span>
            <input autoFocus value={name} onChange={(e) => { setName(e.target.value); setErr(''); }} placeholder="Hold orders follow-up" className={cn(field, 'h-11 border-ed-brand ring-2 ring-ed-brand/15')} />
          </label>
          <div><span className={lbl}>Order Type</span><Select label="Order Type" value={orderType} onChange={changeType} options={['Web Order', 'Approved Order']} /></div>
          <div><span className={lbl}>Order Status</span><Select label="Order Status" value={status} onChange={setStatus} options={statuses} /></div>
          <div><span className={lbl}>Schedule Type</span><Select label="Schedule Type" value={schedule} onChange={setSchedule} options={['Everyday', 'Today Only']} /></div>
          {schedule === 'Today Only' && (
            <label className="block md:col-span-2"><span className={lbl}>Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} /></label>
          )}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium">Time Slots</span>
            <button type="button" disabled={times.length >= 3} onClick={() => setTimes([...times, { id: ++seq, v: '12:00' }])} className="border-ed-line hover:text-ed-brand h-10 rounded-lg border bg-[#f7f7fa] px-4 text-[14px] disabled:opacity-50">Add Time</button>
          </div>
          <div className="mt-2 space-y-2">
            {times.map((t) => (
              <div key={t.id} className="flex gap-3">
                <input type="time" aria-label="Time slot" value={t.v} onChange={(e) => setTimes(times.map((x) => (x.id === t.id ? { ...x, v: e.target.value } : x)))} className={cn(field, 'h-11 flex-1')} />
                <button type="button" disabled={times.length === 1} onClick={() => setTimes(times.filter((x) => x.id !== t.id))} className="border-ed-line text-ed-muted h-11 rounded-lg border bg-[#f7f7fa] px-5 text-[14px] enabled:hover:text-ed-red disabled:cursor-not-allowed">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block"><span className={lbl}>Call Limit</span><input readOnly value="3" className={cn(field, 'h-11 bg-white')} /></label>
          <div className="border-ed-line flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
            <div>
              <p className="text-[14px] font-medium">Rule Active</p>
              <p className="text-ed-muted text-[12px]">Disabled rules will not auto-trigger.</p>
            </div>
            <Toggle on={active} onChange={setActive} label="Rule Active" />
          </div>
        </div>

        <div className="border-ed-line mt-4 rounded-xl border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-medium">Custom Voices For This Rule</p>
              <p className="text-ed-muted mt-0.5 text-[12px]">If enabled, this rule will override the global Auto Call Center voices.</p>
            </div>
            <Toggle on={customVoices} onChange={setCustomVoices} label="Custom Voices For This Rule" />
          </div>
          {customVoices ? (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div><span className={lbl}>Question Voice</span><Select label="Question voice" value="Select approved question voice" onChange={() => {}} options={['Select approved question voice']} /></div>
              <div><span className={lbl}>Option Voice</span><Select label="Option voice" value="No option voice" onChange={() => {}} options={['No option voice']} /></div>
              <p className="text-ed-muted text-[12px] md:col-span-2">No approved voices yet. Upload one in Integration Setup.</p>
            </div>
          ) : (
            <p className="text-ed-muted mt-4 text-[14px]">Using global Auto Call Center voices for this rule.</p>
          )}
        </div>

        <div className="border-ed-line mt-4 rounded-xl border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-medium">Keypad Actions</p>
              <p className="text-ed-muted mt-0.5 text-[12px]">Configure what happens when the customer presses each key.</p>
            </div>
            <button type="button" disabled={acts.length >= keys.length} onClick={addKey} className="border-ed-line hover:text-ed-brand h-10 rounded-lg border bg-white px-4 text-[14px] shadow-[0_1px_2px_rgba(30,20,50,0.05)] disabled:opacity-50">Add Key</button>
          </div>
          {acts.length === 0 ? (
            <p className="text-ed-muted mt-4 text-[14px]">No key actions configured. Press results will still be logged.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {acts.map((a) => (
                <div key={a.id} className="grid grid-cols-[110px_1fr_auto] items-center gap-3">
                  <Select label="Key" value={`Key ${a.key}`} onChange={(v) => !usedKeys.has(v.slice(4)) && setActs(acts.map((x) => (x.id === a.id ? { ...x, key: v.slice(4) } : x)))} options={keys.filter((k) => k === a.key || !usedKeys.has(k)).map((k) => `Key ${k}`)} />
                  <Select label="Action" value={a.action} onChange={(v) => setActs(acts.map((x) => (x.id === a.id ? { ...x, action: v } : x)))} options={actions} />
                  <button type="button" onClick={() => setActs(acts.filter((x) => x.id !== a.id))} className="hover:text-ed-red h-10 px-3 text-[14px]">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {err && <p role="alert" className="mt-3 text-[13px] text-red-600">{err}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={cn(ghostBtn, 'h-12 px-5 font-medium')}>Cancel</button>
          <button type="button" onClick={submit} className={cn(primaryBtn, 'h-12 px-5')}>Create Rule</button>
        </div>
      </div>
    </div>
  );
}
