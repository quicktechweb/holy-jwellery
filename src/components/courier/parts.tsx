'use client';

import { useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import type { Parcel } from '@/data/courier';
import { systemTags, SOLVED, tagCls, customCls } from '@/data/courierTags';
import { cn } from '@/lib/utils';
import { Modal, Popover } from './ui';
import { OUTCOMES, outcomeColor, people, SLOTS, type CallMap, type HistoryItem, type Outcome, type ParcelStore, type Slot, type Target } from './store';

export function TagPill({ name }: { name: string }) {
  return <span className={cn('inline-block max-w-[120px] rounded-md px-2 py-0.5 text-[10.5px] leading-tight', tagCls(name))}>{name}</span>;
}

export function CallDots({ map }: { map: CallMap }) {
  const dot = (s: Slot) => <i key={s} title={map[s] ?? 'Not called'} className="size-2.5 rounded-full" style={{ background: map[s] ? outcomeColor[map[s]!] : '#ebe9f0' }} />;
  return (
    <div className="text-ed-muted space-y-1 text-[10px]">
      <div className="flex items-center gap-1.5"><span className="w-5">AM</span>{dot('Morning 10AM')}{dot('Morning 1PM')}</div>
      <div className="flex items-center gap-1.5"><span className="w-5">PM</span>{dot('Evening 4PM')}{dot('Evening 7PM')}</div>
    </div>
  );
}

/* ---- single parcel tag popover ---- */
export function TagPopover({ anchor, parcel, store, custom, onClose }: { anchor: DOMRect; parcel: Parcel; store: ParcelStore; custom: string[]; onClose: () => void }) {
  const [q, setQ] = useState('');
  const has = store.tagsOf(parcel);
  const match = (n: string) => n.toLowerCase().includes(q.trim().toLowerCase());
  const groups = (['Problem Tags', 'Issue Tags', 'Financial Tags'] as const).map((g) => ({ g, items: systemTags.filter((t) => t.group === g && match(t.name)).map((t) => t.name) }));
  const customs = custom.filter(match);
  const row = (n: string) => (
    <button key={n} type="button" onClick={() => store.editTags([parcel], n, 'toggle')} className={cn('flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13.5px]', has.includes(n) ? 'bg-[#f3eef9]' : 'hover:bg-ed-bg')}>
      {n}{has.includes(n) && <Check className="text-ed-brand size-3.5" />}
    </button>
  );
  return (
    <Popover anchor={anchor} width={286} onClose={onClose}>
      <div className="px-4 pt-3 pb-2"><p className="text-[13.5px] font-medium">Manage Parcel Tags</p><p className="text-ed-muted text-[11px]">System courier tags and merchant custom tags</p></div>
      <div className="border-ed-line relative border-y"><Search className="text-ed-muted absolute top-1/2 left-4 size-3.5 -translate-y-1/2" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tags..." className="h-10 w-full pl-10 text-[13px] outline-none" /></div>
      <div className="max-h-[260px] overflow-y-auto px-2 py-1.5">
        {[...groups, { g: 'Custom Tags', items: customs }].filter((x) => x.items.length).map((x) => (
          <div key={x.g} className="mb-1"><p className="text-ed-muted px-2 pt-2 pb-1 text-[10.5px] font-medium">{x.g}</p>{x.items.map(row)}</div>
        ))}
        {!groups.some((x) => x.items.length) && !customs.length && <p className="text-ed-muted py-6 text-center text-[12.5px]">No tags match.</p>}
      </div>
      <div className="border-ed-line border-t px-4 py-2.5">
        <button type="button" onClick={() => { store.resolveProblems(parcel); onClose(); }} className="text-ed-muted hover:text-ed-brand text-[13px]">Resolve All Problems</button>
      </div>
      <span className="hidden">{SOLVED}{customCls}</span>
    </Popover>
  );
}

/* ---- bulk tag picker (apply / remove / replace) ---- */
export function BulkTagPopover({ anchor, mode, parcels, store, custom, onClose }: { anchor: DOMRect; mode: 'add' | 'remove' | 'replace'; parcels: Parcel[]; store: ParcelStore; custom: string[]; onClose: () => void }) {
  const present = new Set(parcels.flatMap((p) => store.tagsOf(p)));
  const all = [...systemTags.map((t) => t.name), SOLVED, ...custom];
  const list = mode === 'remove' ? all.filter((n) => present.has(n)) : all;
  const title = { add: 'Apply tag to', remove: 'Remove tag from', replace: 'Replace tags on' }[mode];
  return (
    <Popover anchor={anchor} width={270} onClose={onClose}>
      <p className="px-4 pt-3 pb-2 text-[13.5px] font-medium">{title} {parcels.length} parcel{parcels.length > 1 ? 's' : ''}</p>
      <div className="border-ed-line max-h-[260px] overflow-y-auto border-t px-2 py-1.5">
        {list.length === 0 && <p className="text-ed-muted py-5 text-center text-[12.5px]">No tags to remove.</p>}
        {list.map((n) => <button key={n} type="button" onClick={() => { store.editTags(parcels, n, mode); onClose(); }} className="hover:bg-ed-bg block w-full rounded-lg px-3 py-2 text-left text-[13.5px]">{n}</button>)}
      </div>
    </Popover>
  );
}

/* ---- set in charge ---- */
export function ChargePopover({ anchor, parcels, store, onClose }: { anchor: DOMRect; parcels: Parcel[]; store: ParcelStore; onClose: () => void }) {
  const [open, setOpen] = useState(true);
  const count = (n: string) => parcels.filter((p) => store.chargeOf(p) === n).length;
  return (
    <Popover anchor={anchor} width={246} onClose={onClose}>
      <div className="p-3">
        <p className="mb-2 text-[13px] font-medium">Put {parcels.length} parcel{parcels.length > 1 ? 's' : ''} in someone&apos;s charge</p>
        <button type="button" onClick={() => setOpen((o) => !o)} className="border-ed-line flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 text-[13.5px]">Choose a person<ChevronDown className="size-4" /></button>
      </div>
      {open && (
        <div className="border-ed-line mx-3 mb-3 rounded-lg border bg-white py-1 shadow-sm">
          {people.map((n) => <button key={n} type="button" onClick={() => { store.setInCharge(parcels.map((p) => p.id), n); onClose(); }} className="hover:bg-ed-bg block w-full px-4 py-2 text-left text-[13.5px]">{n} ({count(n)})</button>)}
          <button type="button" onClick={() => { store.setInCharge(parcels.map((p) => p.id), ''); onClose(); }} className="hover:bg-ed-bg block w-full px-4 py-2 text-left text-[13.5px]">Nobody (clear)</button>
        </div>
      )}
    </Popover>
  );
}

/* ---- record call ---- */
export function RecordCallModal({ parcel, store, onClose }: { parcel: Parcel; store: ParcelStore; onClose: () => void }) {
  const [target, setTarget] = useState<Target>('customer');
  const [slot, setSlot] = useState<Slot>('Morning 1PM');
  const [outcome, setOutcome] = useState<Outcome | ''>('');
  const [note, setNote] = useState('');
  const radio = (checked: boolean, label: string, on: () => void) => (
    <label key={label} className="flex cursor-pointer items-center gap-1.5 text-[13.5px]"><input type="radio" checked={checked} onChange={on} className="accent-[#3f1355]" />{label}</label>
  );
  return (
    <Modal title="Record Call" onClose={onClose}>
      <div className="max-w-[360px]">
        <p className="text-[13px] font-medium">Call Target</p>
        <div className="mt-1.5 flex gap-4">{radio(target === 'customer', 'Customer', () => setTarget('customer'))}{radio(target === 'rider', 'Rider', () => setTarget('rider'))}</div>
        <p className="mt-4 text-[13px] font-medium">Call Slot</p>
        <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-2">{SLOTS.map((s) => radio(slot === s, s.replace('Morning ', 'Morning ').replace('Ad-hoc', 'Ad-hoc'), () => setSlot(s)))}</div>
        <p className="mt-4 text-[13px] font-medium">Outcome</p>
        <div className="relative mt-1.5">
          <select value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome)} className="border-ed-brand/60 ring-ed-brand/10 h-10 w-full appearance-none rounded-lg border bg-white pl-3 text-[13.5px] ring-2 outline-none">
            <option value="">Select outcome</option>{OUTCOMES.map((o) => <option key={o}>{o}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
        </div>
        <p className="mt-4 text-[13px] font-medium">Notes (optional)</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add any notes about this call..." rows={3} className="border-ed-line mt-1.5 w-full resize-y rounded-lg border p-3 text-[13px] outline-none" />
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={onClose} className="border-ed-line h-10 rounded-lg border px-4 text-[13.5px]">Cancel</button>
          <button type="button" disabled={!outcome} onClick={() => { store.recordCall(parcel.id, target, slot, outcome as Outcome, note.trim()); onClose(); }} className="bg-ed-brand h-10 rounded-lg px-4 text-[13.5px] font-medium text-white disabled:opacity-45">Record Call</button>
        </div>
      </div>
    </Modal>
  );
}

/* ---- history drawer ---- */
const ago = (t: number) => { const s = Math.floor((Date.now() - t) / 1000); return s < 60 ? 'just now' : s < 3600 ? `${Math.floor(s / 60)}m ago` : `${Math.floor(s / 3600)}h ago`; };
export function HistoryDrawer({ parcel, items, store, onClose }: { parcel: Parcel; items: HistoryItem[]; store: ParcelStore; onClose: () => void }) {
  const [note, setNote] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside role="dialog" aria-label="Parcel History" className="flex h-full w-full max-w-[360px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-3"><h3 className="text-[16.5px] font-medium">Parcel History <span className="text-ed-muted text-[12px] font-normal">· {parcel.invoice}</span></h3><button type="button" aria-label="Close" onClick={onClose}><X className="size-4" /></button></div>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {items.length === 0 && <p className="text-ed-muted pt-10 text-center text-[13px]">No history yet.</p>}
          {items.map((h) => (
            <div key={h.id} className="border-ed-line flex gap-3 rounded-xl border p-3.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#eaf0ff] text-blue-600"><Check className="size-4" /></span>
              <div><p className="flex items-center gap-2 text-[11px]"><b className="rounded-md bg-[#eaf0ff] px-1.5 py-0.5 text-[10px] font-medium text-blue-700">{h.kind}</b><span className="text-ed-muted">{ago(h.at)}</span></p><p className="mt-1.5 text-[13.5px]">{h.text}</p><p className="text-ed-muted mt-0.5 text-[11px]">by {h.by}</p></div>
            </div>
          ))}
        </div>
        <div className="border-ed-line border-t p-4">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." rows={3} className="border-ed-line w-full resize-none rounded-lg border p-3 text-[13px] outline-none" />
          <button type="button" disabled={!note.trim()} onClick={() => { store.addNote(parcel.id, note.trim()); setNote(''); }} className="bg-ed-brand mt-2.5 h-10 w-full rounded-lg text-[13.5px] font-medium text-white disabled:opacity-50">Add Note</button>
        </div>
      </aside>
    </div>
  );
}
