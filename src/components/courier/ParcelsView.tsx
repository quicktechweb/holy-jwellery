'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock, Columns3, History, Package, PhoneCall, RefreshCw, Replace, Search, Tag, Truck, UserCog, Plus, X, UserRound } from 'lucide-react';
import { allParcels, couriers, parcelFilters, type FilterKey, type Parcel } from '@/data/courier';
import { systemTags } from '@/data/courierTags';
import { cn } from '@/lib/utils';
import { Avatar, Popover } from './ui';
import { BulkTagPopover, CallDots, ChargePopover, HistoryDrawer, RecordCallModal, TagPill, TagPopover } from './parts';
import { ParcelDetail } from './ParcelDetail';
import { people, type ParcelStore } from './store';

const PAGE = 50;
type PopKind = 'tag' | 'charge' | 'bulk-add' | 'bulk-remove' | 'bulk-replace' | 'columns';
interface Pop { kind: PopKind; rect: DOMRect; id?: string }

const columns = ['Products', 'Customer', 'Customer calls', 'Amount', 'Courier tracking', 'Counts', 'Rider', 'Rider calls', 'Tags', 'In charge'] as const;

const sel = 'border-ed-line focus:border-ed-brand/40 h-10 w-full cursor-pointer appearance-none rounded-lg border bg-white pr-8 text-[13.5px] outline-none';

function IconSelect({ icon, value, onChange, options, label, className }: { icon: React.ReactNode; value: string; onChange: (v: string) => void; options: string[]; label: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <span className="text-ed-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 [&_svg]:size-4">{icon}</span>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={cn(sel, icon ? 'pl-9' : 'pl-3')}>{options.map((o) => <option key={o}>{o}</option>)}</select>
      <svg className="text-ed-muted pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
    </div>
  );
}

export function ParcelsView({ filter, onFilter, store, custom }: { filter: FilterKey; onFilter: (f: FilterKey) => void; store: ParcelStore; custom: string[] }) {
  const [ageFrom, setAgeFrom] = useState('');
  const [ageTo, setAgeTo] = useState('');
  const [atFrom, setAtFrom] = useState('');
  const [atTo, setAtTo] = useState('');
  const [q, setQ] = useState('');
  const [courier, setCourier] = useState('All couriers');
  const [tagF, setTagF] = useState('All tags');
  const [who, setWho] = useState('Everyone');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [pop, setPop] = useState<Pop | null>(null);
  const [detail, setDetail] = useState<Parcel | null>(null);
  const [callFor, setCallFor] = useState<Parcel | null>(null);
  const [histFor, setHistFor] = useState<Parcel | null>(null);
  const [updatedAt, setUpdatedAt] = useState(() => Date.now() - 57_000);
  const [, tick] = useState(0);
  const [toast, setToast] = useState('');
  const meta = parcelFilters.find((f) => f.key === filter)!;

  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 15_000); return () => clearInterval(t); }, []);
  useEffect(() => { setSelected(new Set()); }, [filter]);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2400); };

  const rows = useMemo(() => {
    const key = q.trim().toLowerCase();
    const num = (v: string) => (v === '' ? null : Number(v));
    const [af, at, rf, rt] = [num(ageFrom), num(ageTo), num(atFrom), num(atTo)];
    return allParcels.filter((p) =>
      p.filter === filter &&
      (af === null || p.age >= af) && (at === null || p.age <= at) &&
      (rf === null || (p.attempt ?? 0) >= rf) && (rt === null || (p.attempt ?? 0) <= rt) &&
      (courier === 'All couriers' || p.courier === courier) &&
      (tagF === 'All tags' || store.tagsOf(p).includes(tagF)) &&
      (who === 'Everyone' || store.chargeOf(p) === who) &&
      (!key || [p.invoice, p.name, p.mobile].some((v) => v.toLowerCase().includes(key))));
  }, [filter, ageFrom, ageTo, atFrom, atTo, q, courier, tagF, who, store]);
  const shown = rows.slice(0, PAGE);
  const selParcels = shown.filter((p) => selected.has(p.id));
  const allOn = shown.length > 0 && shown.every((r) => selected.has(r.id));
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const open = (kind: PopKind, e: React.MouseEvent, id?: string) => setPop({ kind, rect: e.currentTarget.getBoundingClientRect(), id });
  const popParcel = pop?.id ? allParcels.find((p) => p.id === pop.id) : undefined;
  const eligible = selParcels.filter((p) => p.courier === 'Steadfast').length;
  const show = (c: string) => !hidden.has(c);
  const secs = Math.max(1, Math.round((Date.now() - updatedAt) / 1000));
  const agoTxt = secs < 60 ? `${secs} seconds ago` : `${Math.round(secs / 60)} minute${Math.round(secs / 60) === 1 ? '' : 's'} ago`;
  const allTagOptions = ['All tags', ...systemTags.map((t) => t.name), ...custom];

  const range = (a: string, sa: (v: string) => void, b: string, sb: (v: string) => void) => (
    <div className="flex gap-2">
      {[['From', a, sa], ['To', b, sb]].map(([ph, v, set]) => (
        <input key={ph as string} type="number" min={0} placeholder={ph as string} value={v as string} onChange={(e) => (set as (v: string) => void)(e.target.value)} className="border-ed-line placeholder:text-ed-muted/70 h-9 w-[86px] rounded-lg border bg-white px-3 text-[13px] outline-none" />
      ))}
    </div>
  );

  const actionBtn = 'border-ed-line hover:text-ed-brand relative flex size-8 items-center justify-center rounded-lg border bg-white shadow-sm';
  const barBtn = 'border-ed-line flex h-9 items-center gap-2 rounded-lg border bg-white px-3.5 text-[13px] text-ed-text/70 hover:text-ed-brand';

  return (
    <div>
      <div className="mt-6 flex flex-wrap gap-2.5">
        {parcelFilters.map((f) => (
          <button key={f.key} type="button" onClick={() => onFilter(f.key)}
            className={cn('h-10 rounded-lg border px-3.5 text-[13.5px] transition', f.key === filter ? 'bg-ed-brand border-ed-brand font-medium text-white shadow-[0_3px_8px_rgba(63,19,85,0.3)]' : 'border-ed-line bg-white hover:text-ed-brand')}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="border-ed-line mt-5 rounded-xl border bg-[#faf9fc] p-4">
        <div className="grid gap-4 md:grid-cols-2 md:gap-x-16">
          <div><p className="text-ed-muted mb-1.5 text-[10.5px] tracking-wider uppercase">Courier age</p>{range(ageFrom, setAgeFrom, ageTo, setAgeTo)}<p className="text-ed-muted mt-2 text-[10.5px]">Days since sent to courier. Blank To means plus.</p></div>
          <div><p className="text-ed-muted mb-1.5 text-[10.5px] tracking-wider uppercase">Rider attempt</p>{range(atFrom, setAtFrom, atTo, setAtTo)}<p className="text-ed-muted mt-2 text-[10.5px]">Latest rider attempt number. Blank To means plus.</p></div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <IconSelect label="Courier" icon={<Truck />} value={courier} onChange={setCourier} options={['All couriers', ...couriers]} className="w-[190px]" />
          <div className="relative w-[288px] max-w-full"><Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Invoice, phone or name" className="border-ed-line h-10 w-full rounded-lg border bg-white pl-9 text-[13.5px] outline-none" /></div>
          <IconSelect label="Tags" icon={<Tag />} value={tagF} onChange={setTagF} options={allTagOptions} className="w-[190px]" />
          <IconSelect label="In charge" icon={null} value={who} onChange={setWho} options={['Everyone', ...people]} className="w-[173px]" />
        </div>
      </div>

      {selParcels.length > 0 && (
        <div className="border-ed-line mt-4 flex flex-wrap items-center gap-2 rounded-xl border bg-[#faf9fc] px-3 py-2">
          <span className="px-1 text-[13.5px]">{selParcels.length} selected</span>
          <span className="text-ed-muted mr-2 text-[11px]">{custom.length ? `${custom.length} active custom tag${custom.length > 1 ? 's' : ''}` : 'No active custom tags'}</span>
          <button type="button" className={barBtn} onClick={(e) => open('bulk-add', e)}><Plus className="size-3.5" /> Apply tag...</button>
          <button type="button" className={barBtn} onClick={(e) => open('bulk-remove', e)}><X className="size-3.5" /> Remove tag...</button>
          <button type="button" className={barBtn} onClick={(e) => open('bulk-replace', e)}><Replace className="size-3.5" /> Replace tag...</button>
          <button type="button" className={cn(barBtn, 'text-ed-text')} onClick={(e) => open('charge', e)}><UserCog className="size-3.5" /> Set in charge...</button>
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto px-3 text-[13.5px]">Clear selection</button>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-ed-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px]">
          <span>{rows.length.toLocaleString()} parcels{rows.length > PAGE && ` · showing ${PAGE}`}</span>
          <span>Courier status updated {agoTxt}</span>
          <button type="button" onClick={() => { setUpdatedAt(Date.now()); flash('Courier status refreshed'); }} className="text-ed-text flex items-center gap-1.5 text-[12px]"><RefreshCw className="size-3.5" /> Refresh</button>
        </p>
        <button type="button" onClick={(e) => open('columns', e)} className="border-ed-line flex h-10 items-center gap-2.5 rounded-lg border bg-white px-4 text-[13.5px] shadow-sm"><Columns3 className="size-4" /> Columns</button>
      </div>
      {toast && <p role="status" className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-[13px] font-medium text-green-700">{toast}</p>}

      {filter === 'ASSIGNED_FOR_DELIVERY' && (
        <div className="border-ed-line mt-3 rounded-xl border bg-[#faf9fc] p-3 text-[13px]">
          <p className="flex items-center gap-2 px-1 py-1.5"><Clock className="size-4" /><span><b className="font-medium">39 more parcels</b> are with a courier without a rider assignment reported yet, so they are not listed below. Your courier&apos;s own panel may show a higher number.</span></p>
          {[['Steadfast', 29], ['PATAW', 10]].map(([n, c]) => (
            <div key={n} className="border-ed-line mt-2 rounded-lg border bg-white px-4 py-2.5">
              <p className="flex items-center gap-2"><Clock className="size-3.5" /><b className="font-medium">{n}</b><span className="text-ed-muted">· {c} parcels · Waiting for the courier</span></p>
              <p className="text-ed-muted mt-0.5 pl-5 text-[11px]">These parcels are with the courier but no rider assignment has been reported yet. They appear here as soon as one arrives.</p>
            </div>
          ))}
        </div>
      )}

      <div className="border-ed-line mt-3 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[1150px] text-left">
          <thead>
            <tr className="border-ed-line border-b bg-[#f8f7fb] text-[13px]">
              <th className="w-10 px-3 py-3.5"><input type="checkbox" checked={allOn} onChange={() => setSelected(allOn ? new Set() : new Set(shown.map((r) => r.id)))} aria-label="Select all" className="size-4 rounded-full" /></th>
              <th className="px-2 font-normal">Invoice</th>
              {columns.filter(show).map((h) => <th key={h} className="px-2 font-normal">{h}</th>)}
              <th className="px-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={13} className="text-ed-muted py-14 text-center text-[13px]"><Package className="mx-auto mb-2 size-5" />No parcels found.</td></tr>}
            {shown.map((p) => {
              const hot = (p.attempt ?? 0) >= 3 || p.age >= 30;
              const tags = store.tagsOf(p);
              return (
                <tr key={p.id} className={cn('border-ed-line border-b align-middle last:border-b-0', hot ? 'bg-[#fdf1f1]' : 'hover:bg-ed-bg/50')}>
                  <td className="w-10 px-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} aria-label={`Select ${p.invoice}`} className="accent-ed-brand size-4 rounded-full" /></td>
                  <td className="max-w-[72px] px-2 py-3">
                    <button type="button" onClick={() => setDetail(p)} className="font-mono text-[11px] break-all text-blue-600 underline">{p.invoice}</button>
                    {p.ourStatus && <p className="text-ed-muted mt-1 text-[10.5px]">{p.ourStatus}</p>}
                  </td>
                  {show('Products') && <td className="px-2"><Avatar bg={p.avatar} /></td>}
                  <CustomerCell p={p} />
                  {show('Customer calls') && <td className="px-2"><CallDots map={store.callsOf(p.id, 'customer')} /></td>}
                  {show('Amount') && <td className="px-2 text-center text-[13px] tabular-nums">{p.amount.toLocaleString()}</td>}
                  {show('Courier tracking') && (
                    <td className="px-2 text-[11px]">
                      <p className="text-[11.5px]">{p.courier}</p>
                      {p.cStatus && <p className="text-ed-muted max-w-[90px] text-[10px] leading-tight">{p.cStatus}</p>}
                      {p.filter !== 'CANCELLED' && <a href="#" onClick={(e) => e.preventDefault()} className="block font-mono text-[10px] break-all text-blue-600 underline">{p.tracking}</a>}
                      {p.tracking2 && <a href="#" onClick={(e) => e.preventDefault()} className="block font-mono text-[10px] text-blue-600 underline">{p.tracking2}</a>}
                    </td>
                  )}
                  {show('Counts') && (
                    <td className="px-2">
                      <div className="flex flex-col items-center gap-1 text-[11px]">
                        {p.attempt && <span className={cn('rounded-full px-2.5 py-0.5', p.attempt === 1 ? 'bg-[#dff7ea] text-emerald-700' : p.attempt === 2 ? 'bg-[#fdf0c3] text-amber-700' : 'bg-[#fde8ea] text-[#c8223a]')}>Attempt {p.attempt}</span>}
                        <span className={cn('rounded-full px-2.5 py-0.5 whitespace-nowrap', p.age === 0 ? 'bg-[#dff7ea] text-emerald-700' : 'bg-[#fde8ea] text-[#c8223a]')}>Courier age {p.age}d</span>
                      </div>
                    </td>
                  )}
                  {show('Rider') && <td className="px-2 text-[12px]">{p.rider ? <><p>{p.rider.name}</p><p className="text-ed-muted text-[11px]">{p.rider.mobile}</p></> : <span className="text-ed-muted">-</span>}</td>}
                  {show('Rider calls') && <td className="px-2"><CallDots map={store.callsOf(p.id, 'rider')} /></td>}
                  {show('Tags') && <td className="px-2"><div className="flex max-w-[130px] flex-col items-start gap-1">{tags.length ? tags.map((t) => <TagPill key={t} name={t} />) : <span className="text-ed-muted text-[12px]">-</span>}</div></td>}
                  {show('In charge') && <td className="text-ed-muted px-2 text-[12px]">{store.chargeOf(p)}</td>}
                  <td className="px-3">
                    <div className="flex gap-1.5">
                      <button type="button" aria-label="Record call" onClick={() => setCallFor(p)} className={actionBtn}><PhoneCall className="size-3.5" /></button>
                      <button type="button" aria-label="Manage tags" onClick={(e) => open('tag', e, p.id)} className={actionBtn}><Tag className="size-3.5" />{tags.length > 0 && <b className="bg-ed-text absolute -right-1.5 -bottom-1 flex size-3.5 items-center justify-center rounded-full text-[9px] text-white">{tags.length}</b>}</button>
                      <button type="button" aria-label="Parcel history" onClick={() => setHistFor(p)} className={actionBtn}><History className="size-3.5" /></button>
                      <button type="button" aria-label="Courier details" title="Courier details" onClick={() => setDetail(p)} className={actionBtn}><span className="flex size-3.5 items-center justify-center rounded-full bg-rose-500"><i className="size-1.5 rounded-full bg-white" /></span></button>
                      <button type="button" aria-label="Set in charge" onClick={(e) => open('charge', e, p.id)} className={actionBtn}><UserRound className="size-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selParcels.length > 0 && (
        <div className="border-ed-line sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap items-center justify-between gap-3 border-t bg-white/95 px-6 py-3 backdrop-blur lg:-mx-6">
          <div><p className="text-[13.5px]">{eligible} orders selected <span className="text-ed-muted text-[11px]">({selParcels.length - eligible} ineligible will be skipped)</span></p><p className="text-ed-muted text-[11px]">Fetches the latest Steadfast rider attempt for each selected order</p></div>
          <div className="flex items-center gap-5"><button type="button" onClick={() => setSelected(new Set())} className="text-[13.5px]">Clear</button>
            <button type="button" disabled={!eligible} onClick={() => { setUpdatedAt(Date.now()); flash(`Rider attempt refreshed for ${eligible} order${eligible > 1 ? 's' : ''}`); }} className="bg-ed-brand flex h-10 items-center gap-2 rounded-lg px-5 text-[13.5px] font-medium text-white disabled:opacity-50"><RefreshCw className="size-4" /> Refresh Rider Attempt</button></div>
        </div>
      )}

      {pop?.kind === 'tag' && popParcel && <TagPopover anchor={pop.rect} parcel={popParcel} store={store} custom={custom} onClose={() => setPop(null)} />}
      {pop?.kind === 'charge' && (popParcel ? [popParcel] : selParcels).length > 0 && <ChargePopover anchor={pop.rect} parcels={popParcel ? [popParcel] : selParcels} store={store} onClose={() => setPop(null)} />}
      {pop && pop.kind.startsWith('bulk-') && <BulkTagPopover anchor={pop.rect} mode={pop.kind === 'bulk-add' ? 'add' : pop.kind === 'bulk-remove' ? 'remove' : 'replace'} parcels={selParcels} store={store} custom={custom} onClose={() => setPop(null)} />}
      {pop?.kind === 'columns' && (
        <Popover anchor={pop.rect} width={210} onClose={() => setPop(null)}>
          <p className="px-4 pt-3 pb-1 text-[13px] font-medium">Visible columns</p>
          <div className="px-2 pb-2">{columns.filter((c) => c !== 'Customer').map((c) => (
            <label key={c} className="hover:bg-ed-bg flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px]"><input type="checkbox" checked={show(c)} onChange={() => setHidden((h) => { const n = new Set(h); n.has(c) ? n.delete(c) : n.add(c); return n; })} className="accent-ed-brand size-3.5" />{c}</label>
          ))}</div>
        </Popover>
      )}
      {callFor && <RecordCallModal parcel={callFor} store={store} onClose={() => setCallFor(null)} />}
      {histFor && <HistoryDrawer parcel={histFor} items={store.hist[histFor.id] ?? []} store={store} onClose={() => setHistFor(null)} />}
      {detail && (
        <ParcelDetail parcel={detail} tags={store.tagsOf(detail)} onClose={() => setDetail(null)}
          onAction={(k, rect) => { if (k === 'call') setCallFor(detail); else if (k === 'history') setHistFor(detail); else { setPop({ kind: k === 'tag' ? 'tag' : 'charge', rect, id: detail.id }); } }} />
      )}
    </div>
  );
}

function CustomerCell({ p }: { p: Parcel }) {
  return (
    <td className="max-w-[270px] px-2 py-2.5">
      <p className="text-[12.5px] font-medium">{p.name}</p>
      <p className="text-ed-muted text-[11px]">{p.mobile}<span className="ml-1.5 inline-flex items-center gap-2 align-middle"><PhoneCall className="size-3.5 text-blue-600" /><svg className="size-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.2-5.4A8.5 8.5 0 1 1 21 11.5Z" /></svg><PhoneCall className="size-3.5 text-violet-400" /></span></p>
      <p className="text-ed-muted line-clamp-2 text-[11px]">{p.address}</p>
    </td>
  );
}
