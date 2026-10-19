'use client';

import { useMemo, useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Download, FileSpreadsheet, History, PhoneCall, Plus, Search, Shield, Tag, Trash2 } from 'lucide-react';
import { allParcels, entryOrders, entryRows, returnStats } from '@/data/courier';
import { cn } from '@/lib/utils';
import { Avatar, AmPm, Btn, CallIcons, GuideBtn, GuideModal, Modal, Sel, download } from './ui';
import { tagCls } from '@/data/courierTags';

function SectionHead({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  return (
    <div className="mt-7 flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-[24px] leading-tight font-medium tracking-tight">{title}</h2><p className="text-ed-muted mt-1 text-[13px]">{sub}</p></div>
      {right && <div className="flex flex-wrap items-center gap-3">{right}</div>}
    </div>
  );
}

function DatePill({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const i = options.indexOf(value);
  return (
    <div className="border-ed-line flex h-10 items-center rounded-lg border bg-white shadow-sm">
      <button type="button" aria-label="Previous" disabled={i <= 0} onClick={() => onChange(options[i - 1])} className="text-ed-muted h-full px-2.5 disabled:opacity-40"><ChevronLeft className="size-3.5" /></button>
      <div className="relative">
        <Calendar className="text-ed-muted pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <select aria-label="Date range" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 cursor-pointer appearance-none bg-transparent pr-7 pl-8 text-[13.5px] outline-none">
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown className="text-ed-muted pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2" />
      </div>
    </div>
  );
}

/* ---------- Return Management ---------- */
const rangeRows: Record<string, number> = { Today: 2, Yesterday: 5, 'Last 7 days': 20, '30D': 50 };
export function ReturnManagement({ tags }: { tags: string[] }) {
  const [tab, setTab] = useState<'Return Pending' | 'Returned'>('Return Pending');
  const [range, setRange] = useState('Today');
  const [tagFilter, setTagFilter] = useState('');
  const [who, setWho] = useState('Everyone');
  const [over, setOver] = useState<Record<string, string>>({});
  const [guide, setGuide] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    const base = allParcels.filter((p) => p.filter === (tab === 'Returned' ? 'RETURNED' : 'RETURN_PENDING')).slice(0, tab === 'Returned' ? 1 : rangeRows[range]);
    const noTag = base.filter(() => true);
    return noTag.filter((p) => !tagFilter || (over[p.id] ?? p.tags[0]) === tagFilter);
  }, [tab, range, tagFilter, over]);
  const tagOf = (id: string, def?: string) => over[id] ?? def;

  return (
    <div>
      <SectionHead title="Return Management" sub="Manage financial tags and resolve issues for returned parcels" right={<GuideBtn onClick={() => setGuide(true)} />} />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2.5">
          {(['Return Pending', 'Returned'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={cn('h-10 rounded-lg border px-4 text-[13.5px]', tab === t ? 'bg-ed-brand border-ed-brand font-medium text-white' : 'border-ed-line bg-white')}>{t}</button>
          ))}
        </div>
        <DatePill value={range} onChange={setRange} options={['Today', 'Yesterday', 'Last 7 days', '30D']} />
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <div className="relative w-[230px]">
          <Tag className="text-ed-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <select aria-label="Tags" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="border-ed-line h-10 w-full appearance-none rounded-lg border bg-white pr-8 pl-9 text-[13.5px] outline-none">
            <option value="">{tags.length} tags</option>
            {tags.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <Sel label="In charge" value={who} onChange={setWho} options={['Everyone', 'Smita E', 'mahima N', 'Rafi K', 'Nusrat J']} className="w-[180px]" />
      </div>
      <p className="mt-5 text-[13.5px] font-medium">Total {tab} Parcels: {rows.length}</p>
      <p className="mt-2 text-[11.5px] text-blue-600">Showing {rows.length} parcel{rows.length === 1 ? '' : 's'}</p>
      <div className="border-ed-line mt-3 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[1150px] text-left">
          <thead>
            <tr className="border-ed-line border-b bg-[#f8f7fb] text-[12.5px]">
              <th className="w-10 px-3 py-3"><input type="checkbox" aria-label="Select all" checked={rows.length > 0 && rows.every((r) => sel.has(r.id))} onChange={(e) => setSel(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())} className="size-4" /></th>
              {['Invoice#', 'Products', 'Customer', 'Customer calls', 'Amount', 'Del. Charge', 'Courier', 'Rider calls', 'Active Tags', 'In charge', 'Actions'].map((h) => <th key={h} className="px-2 py-3 font-normal">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={12} className="text-ed-muted py-12 text-center text-[13px]">No parcels found.</td></tr>}
            {rows.map((p) => {
              const t = tagOf(p.id, p.tags[0]);
              const locked = t === 'Returned Without Charge' || tab === 'Returned';
              return (
                <tr key={p.id} className="border-ed-line border-b last:border-b-0">
                  <td className="px-3"><input type="checkbox" aria-label={`Select ${p.invoice}`} checked={sel.has(p.id)} onChange={() => setSel((s) => { const n = new Set(s); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; })} className="size-4" /></td>
                  <td className="px-2"><a href="#" onClick={(e) => e.preventDefault()} className="font-mono text-[11px] text-blue-600 underline">{p.invoice}</a></td>
                  <td className="px-2"><Avatar bg={p.avatar} /></td>
                  <td className="px-2 py-3"><p className="text-[13px] font-medium">{p.name}</p><p className="text-ed-muted text-[11px]">{p.mobile}<CallIcons /></p></td>
                  <td className="px-2"><AmPm /></td>
                  <td className="px-2 text-[13px] tabular-nums">{p.amount}</td>
                  <td className="px-2 text-right text-[13px] tabular-nums">{p.delCharge}</td>
                  <td className="px-2 text-[12px]">{p.courier}</td>
                  <td className="px-2"><AmPm /></td>
                  <td className="px-2">{t ? <span className={cn('inline-block max-w-[120px] rounded-full px-2.5 py-1 text-[11px] leading-tight', tagCls(t))}>{t}</span> : <span className="text-ed-muted">-</span>}</td>
                  <td className="text-ed-muted px-2 text-[12px]">-</td>
                  <td className="px-2">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="size-4" /><History className="size-4" />
                      {[['Short Pay', 'Charge Discrepancy'], ['Charge Received', 'Returned With Charge'], ['Courier Fraud', 'Courier Fraud']].map(([l, tag], i) => (
                        <button key={l} type="button" disabled={locked} onClick={() => setOver((o) => ({ ...o, [p.id]: tag }))}
                          className={cn('h-8 rounded-lg border px-2.5 text-[12px] whitespace-nowrap disabled:opacity-45', i === 2 ? 'border-[#f5c9d0] bg-[#fff5f6] text-[#c8223a]' : 'border-ed-line bg-white')}>{l}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {guide && <GuideModal title="Return Management guide" onClose={() => setGuide(false)} points={['Return Pending lists parcels on their way back from the courier.', 'Use Short Pay when the courier paid less, Charge Received when the return charge is settled, and Courier Fraud to flag a dispute.', 'Parcels tagged "Returned Without Charge" have nothing left to resolve, so the actions are disabled.']} />}
    </div>
  );
}

/* ---------- Return Analysis ---------- */
const reasonRows = [
  { key: 'Returned With Charge', n: returnStats.withCharge, color: '#a855f7' },
  { key: 'Returned Without Charge', n: returnStats.withoutCharge, color: '#10b981' },
  { key: 'Charge Discrepancy', n: returnStats.discrepancy, color: '#ec4899' },
];
const productPool = ['korean loket 780 taka', '898 taka combo nacklace', 'diamond pendant set', 'gold plated bracelet', 'pearl earrings'];

export function ReturnAnalysis() {
  const [range, setRange] = useState('30D');
  const [pick, setPick] = useState<string | null>('Returned With Charge');
  const pct = (n: number) => `${((n / returnStats.total) * 100).toFixed(1)}%`;
  const kpis = [
    ['Total returned', returnStats.total, 'text-ed-text', 'Parcels returned in this range'],
    ['With charge', returnStats.withCharge, 'text-amber-600', 'Return cost paid to courier'],
    ['Without charge', returnStats.withoutCharge, 'text-emerald-600', 'Returned free of charge'],
    ['Discrepancy', returnStats.discrepancy, 'text-rose-600', 'Charge mismatch to review'],
  ];
  const card = 'border-ed-line rounded-xl border bg-white';
  const prods = pick ? productPool.map((p, i) => ({ p, n: Math.max(1, Math.round((reasonRows.find((r) => r.key === pick)?.n ?? returnStats.untagged) / (i + 2))) })) : [];
  return (
    <div>
      <SectionHead title="Return Reason Analysis" sub="Why parcels came back, and which products keep returning for each reason." right={<DatePill value={range} onChange={setRange} options={['Today', 'Last 7 days', '30D']} />} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([l, v, c, s]) => (
          <div key={l as string} className={cn(card, 'px-4 py-3.5')}>
            <p className="text-ed-muted text-[11px] tracking-wide uppercase">{l}</p>
            <p className={cn('mt-1 text-[24px] font-medium', c as string)}>{range === 'Today' ? Math.round((v as number) / 30) : range === 'Last 7 days' ? Math.round((v as number) / 4) : v}</p>
            <p className="mt-1 text-[11px] text-blue-600">{s}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className={cn(card, 'overflow-hidden')}>
          <div className="px-5 pt-5 pb-3"><h3 className="text-[15.5px] font-medium">Return Reasons</h3><p className="text-ed-muted mt-1 text-[11.5px]">Click a reason to see which products keep coming back for it.</p></div>
          <div className="border-ed-line border-t px-4 py-4">
            <p className="text-ed-muted mb-2 text-[10.5px] tracking-wider uppercase">Custom tags</p>
            <p className="border-ed-line text-ed-muted rounded-lg border border-dashed px-3 py-2.5 text-[11.5px] leading-snug">No custom return tags used yet. Create tags like &quot;Packaging Problem&quot; or &quot;Size Problem&quot; in Courier Management → tag manager, then tag returned parcels to see this breakdown.</p>
            <p className="text-ed-muted mt-5 mb-2 text-[10.5px] tracking-wider uppercase">Delivery charge</p>
            {reasonRows.map((r) => (
              <button key={r.key} type="button" onClick={() => setPick(r.key)} className={cn('mb-1 block w-full rounded-lg px-3 py-2.5 text-left', pick === r.key && 'bg-[#faf3fb]')}>
                <span className="flex items-center gap-2.5 text-[13.5px]"><i className="size-2.5 rounded-full" style={{ background: r.color }} />{r.key}<b className="ml-auto font-normal">{r.n}</b><span className="text-ed-muted w-12 text-right text-[11.5px]">{pct(r.n)}</span></span>
                <span className="mt-2 block h-1.5 rounded-full bg-[#f1eff4]"><i className="block h-full rounded-full" style={{ width: pct(r.n), background: r.color }} /></span>
              </button>
            ))}
            <p className="text-ed-muted mt-4 mb-2 text-[10.5px] tracking-wider uppercase">Coverage</p>
            <button type="button" onClick={() => setPick('Untagged')} className={cn('block w-full rounded-lg px-3 py-2.5 text-left', pick === 'Untagged' && 'bg-[#faf3fb]')}>
              <span className="flex items-center gap-2.5 text-[13.5px]"><i className="size-2.5 rounded-full bg-slate-300" />Untagged<b className="ml-auto font-normal">{returnStats.untagged}</b><span className="text-ed-muted w-12 text-right text-[11.5px]">{pct(returnStats.untagged)}</span></span>
              <span className="mt-2 block h-1.5 rounded-full bg-[#f1eff4]"><i className="block h-full rounded-full bg-slate-300" style={{ width: pct(returnStats.untagged) }} /></span>
            </button>
          </div>
        </div>
        <div className={cn(card, 'min-h-[400px]')}>
          <div className="px-5 pt-5 pb-3"><h3 className="text-[15.5px] font-medium">Products</h3><p className="mt-1 text-[11.5px] text-blue-600">{pick ? `Products behind "${pick}".` : 'Select a return reason to see the products behind it.'}</p></div>
          <div className="border-ed-line border-t">
            {!pick ? <p className="text-ed-muted pt-16 text-center text-[13px]">Pick a reason from the Return Reasons panel.</p> : (
              <ul className="divide-ed-line divide-y px-5">
                {prods.map((x) => <li key={x.p} className="flex items-center justify-between py-3 text-[13.5px]"><span>{x.p}</span><span className="text-ed-muted tabular-nums">{x.n} returned</span></li>)}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Courier Entry ---------- */
export function CourierEntry() {
  const [monthOff, setMonthOff] = useState(0);
  const [courier, setCourier] = useState('All Couriers');
  const [limit, setLimit] = useState('50 rows');
  const [open, setOpen] = useState<{ date: string; courier: string; parcels: number } | null>(null);
  const [guide, setGuide] = useState(false);
  const rows = entryRows.filter((r) => courier === 'All Couriers' || r.courier === courier).slice(0, parseInt(limit));
  const label = monthOff === 0 ? 'Sep 01 - Oct 14, 2026' : 'Aug 01 - Aug 31, 2026';
  const exportCsv = () => download('courier-entry.csv', [['Entry Date', 'Courier', 'Parcels'], ...rows.map((r) => [r.date, r.courier, r.parcels])]);
  return (
    <div>
      <SectionHead title="Courier Entry" sub="Check parcel entry counts by courier and entry date" right={<><GuideBtn onClick={() => setGuide(true)} /><Btn onClick={exportCsv}><FileSpreadsheet className="size-4" /> Export Excel</Btn><Btn onClick={exportCsv}><Download className="size-4" /> Export CSV</Btn></>} />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="border-ed-line flex h-10 items-center rounded-lg border bg-white">
          <button type="button" aria-label="Previous range" onClick={() => setMonthOff(1)} className="text-ed-muted px-2.5"><ChevronLeft className="size-3.5" /></button>
          <span className="border-ed-line flex w-[215px] items-center gap-2.5 border-x px-3 text-[13.5px]"><Calendar className="size-4" />{label}</span>
          <button type="button" aria-label="Next range" onClick={() => setMonthOff(0)} className="text-ed-muted px-2.5"><ChevronRight className="size-3.5" /></button>
        </div>
        <Sel label="Courier" value={courier} onChange={setCourier} options={['All Couriers', 'PATAW', 'Steadfast']} className="w-[198px]" />
        <Sel label="Rows" value={limit} onChange={setLimit} options={['25 rows', '50 rows', '100 rows']} className="w-[144px]" />
      </div>
      <div className="mt-4 flex items-center justify-between text-[13px]"><span className="font-medium">Total Courier Entry Rows: {monthOff === 0 ? rows.length : 0}</span><span className="text-ed-muted text-[11px]">Showing {monthOff === 0 ? rows.length : 0} rows</span></div>
      <div className="border-ed-line mt-2 max-h-[550px] overflow-y-auto rounded-xl border bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="sticky top-0 bg-[#f8f7fb]"><tr className="border-ed-line border-b"><th className="px-3 py-3 font-normal">Entry Date</th><th className="px-3 font-normal">Courier</th><th className="px-3 text-right font-normal">Parcels</th><th className="w-[300px] px-3 text-center font-normal">Actions</th></tr></thead>
          <tbody>
            {monthOff === 1 && <tr><td colSpan={4} className="text-ed-muted py-12 text-center">No courier entries in this range.</td></tr>}
            {monthOff === 0 && rows.map((r) => (
              <tr key={r.date} className="border-ed-line h-[51px] border-b last:border-b-0">
                <td className="px-3">{r.date}</td><td className="px-3 text-[12.5px]">{r.courier}</td><td className="px-3 text-right font-medium tabular-nums">{r.parcels}</td>
                <td className="px-3 text-center"><button type="button" onClick={() => setOpen(r)} className="border-ed-line hover:text-ed-brand h-8 rounded-lg border px-3.5 text-[12.5px]">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-ed-muted mt-4 flex items-center justify-between text-[11.5px]"><span>Page 1 of 1</span><span className="flex gap-2"><Btn disabled className="h-9 text-[12.5px]"><ChevronLeft className="size-3.5" /> Previous</Btn><Btn disabled className="h-9 text-[12.5px]">Next <ChevronRight className="size-3.5" /></Btn></span></div>
      {open && <EntryModal row={open} onClose={() => setOpen(null)} />}
      {guide && <GuideModal title="Courier Entry guide" onClose={() => setGuide(false)} points={['Each row shows how many parcels were handed to a courier on that entry date.', 'Press View to see the individual orders, search them and export the list.', 'Use Export Excel / CSV to download the visible rows.']} />}
    </div>
  );
}

function EntryModal({ row, onClose }: { row: { date: string; courier: string; parcels: number }; onClose: () => void }) {
  const [q, setQ] = useState('');
  const all = useMemo(() => entryOrders(row.parcels, row.parcels * 31), [row]);
  const list = all.filter((o) => !q.trim() || Object.values(o).join(' ').toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Modal wide title={`Courier Entry Orders - ${row.courier} (${row.date})`} onClose={onClose}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-[405px] max-w-full"><Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoice, phone, customer, product, SKU..." className="border-ed-brand/60 ring-ed-brand/10 h-10 w-full rounded-lg border bg-white pl-9 text-[13px] ring-2 outline-none" /></div>
        <div className="flex items-center gap-3 text-[13px]">Orders: {list.length}<Btn onClick={() => download(`entry-${row.date}.csv`, [['Invoice', 'Customer', 'Mobile', 'Address', 'Tracking', 'Status', 'Product', 'Amount'], ...list.map((o) => [o.invoice, o.name, o.mobile, o.address, o.tracking, o.status, o.product, o.price * o.qty])])}><Download className="size-4" /> Export</Btn></div>
      </div>
      <div className="border-ed-line mt-3 max-h-[580px] overflow-auto rounded-lg border">
        <table className="w-full min-w-[900px] text-left text-[12px]">
          <thead className="sticky top-0 bg-[#f8f7fb] text-[12.5px]"><tr>{['Invoice', 'Customer', 'Address', 'Tracking', 'Status', 'Products', 'Amount'].map((h, i) => <th key={h} className={cn('px-3 py-3 font-normal', i === 6 && 'text-right')}>{h}</th>)}</tr></thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.invoice} className="border-ed-line border-t">
                <td className="max-w-[56px] px-3 py-2 break-all">{o.invoice}</td>
                <td className="px-3"><p className="text-[13px] font-medium">{o.name}</p><p className="text-ed-muted text-[11px]">{o.mobile}</p></td>
                <td className="text-ed-muted max-w-[190px] px-3">{o.address}</td>
                <td className="px-3 font-mono text-[10.5px]">{o.tracking}</td>
                <td className="px-3"><span className="rounded-full bg-[#eaf0ff] px-2.5 py-0.5 text-[11px] text-blue-700">{o.status}</span></td>
                <td className="max-w-[360px] px-3"><p className="text-[12.5px]">{o.product}</p><p className="text-ed-muted text-[10.5px]">SKU: {o.sku} | Qty: {o.qty} | Price: BDT {o.price.toFixed(2)} | Total: BDT {(o.price * o.qty).toFixed(2)}</p></td>
                <td className="px-3 text-right text-[13px] whitespace-nowrap">BDT {(o.price * o.qty).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-ed-muted mt-4 flex items-center justify-between text-[11.5px]"><span>Page 1 of 1</span><span className="flex gap-2"><Btn disabled className="h-9 text-[12.5px]"><ChevronLeft className="size-3.5" /> Previous</Btn><Btn disabled className="h-9 text-[12.5px]">Next <ChevronRight className="size-3.5" /></Btn></span></div>
    </Modal>
  );
}

/* ---------- Courier Settings ---------- */
export function CourierSettings() {
  const [perms, setPerms] = useState<{ user: string; access: string[] }[]>([]);
  const [open, setOpen] = useState(false);
  const [guide, setGuide] = useState(false);
  const [user, setUser] = useState('Smita E');
  const [access, setAccess] = useState<string[]>(['View parcels']);
  const levels = ['View parcels', 'Manage tags', 'Resolve returns', 'Courier entry'];
  return (
    <div>
      <SectionHead title="Courier Management Permissions" sub="Manage who can access courier management features" right={<><GuideBtn onClick={() => setGuide(true)} /><Btn primary onClick={() => setOpen(true)} className="h-10"><Plus className="size-4" /> Grant Permission</Btn></>} />
      <div className="border-ed-line mt-5 rounded-xl border bg-white shadow-sm">
        {perms.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-[60px] text-center"><Shield className="text-ed-muted size-9" strokeWidth={1.4} /><p className="text-ed-text/70 mt-3 text-[17px]">No permissions granted yet</p><p className="text-ed-muted mt-1.5 text-[13px]">Click &quot;Grant Permission&quot; to give a user access</p></div>
        ) : (
          <ul className="divide-ed-line divide-y">
            {perms.map((p) => (
              <li key={p.user} className="flex items-center justify-between px-5 py-4 text-[14px]">
                <div><p className="font-medium">{p.user}</p><p className="text-ed-muted text-[12px]">{p.access.join(' · ')}</p></div>
                <button type="button" aria-label={`Revoke ${p.user}`} onClick={() => setPerms((l) => l.filter((x) => x.user !== p.user))} className="hover:text-ed-red p-1.5"><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {open && (
        <Modal title="Grant Permission" onClose={() => setOpen(false)}>
          <label className="text-[13px] font-medium">User<Sel label="User" value={user} onChange={setUser} options={['Smita E', 'mahima N', 'Rafi K', 'Nusrat J']} className="mt-1.5 font-normal" /></label>
          <div className="mt-4 space-y-2">
            {levels.map((l) => (
              <label key={l} className="flex items-center gap-2.5 text-[13.5px]"><input type="checkbox" checked={access.includes(l)} onChange={() => setAccess((a) => (a.includes(l) ? a.filter((x) => x !== l) : [...a, l]))} className="size-4" />{l}</label>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3"><Btn onClick={() => setOpen(false)}>Cancel</Btn><Btn primary disabled={!access.length} onClick={() => { setPerms((l) => [...l.filter((x) => x.user !== user), { user, access }]); setOpen(false); }}>Grant</Btn></div>
        </Modal>
      )}
      {guide && <GuideModal title="Permissions guide" onClose={() => setGuide(false)} points={['Only granted users can open the rebuilt courier surface.', 'Choose exactly which courier features each user can reach.', 'Revoke access any time with the bin icon.']} />}
    </div>
  );
}
