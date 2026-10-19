'use client';

import { ChevronDown, Columns3, History, ListChecks, Search, SquareCheckBig, UserCheck, UserPlus, UserX, Users, Filter, X } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FU_CUSTOMERS, FU_EMPLOYEES, FU_TOTAL, useFollowUps } from '@/lib/followupStore';
import { AssignFollowUpsModal } from './AssignFollowUpsModal';
import { Box, Modal, card, th, BRAND } from './ui';

type Seg = 'all' | 'assigned' | 'unassigned' | 'never' | 'previous';

function Stat({ icon, label, value, tone, active, onClick }: { icon: ReactNode; label: string; value: number; tone: string; active?: boolean; onClick: () => void }) {
  const dark = tone === 'dark';
  return (
    <button type="button" aria-pressed={active} onClick={onClick}
      className={cn('flex h-14 w-full items-center gap-3 rounded-xl border px-4 text-left transition hover:brightness-[0.97]', dark ? 'border-transparent text-white' : 'text-ed-text', active && 'ring-2 ring-[#3f1355] ring-offset-1')}
      style={dark ? { background: 'linear-gradient(135deg,#3f0f6b,#5b1593)' } : { background: tone }}>
      <span className={dark ? 'text-white/80' : 'text-ed-text/70'}>{icon}</span>
      <div>
        <div className={cn('text-[10.5px] leading-none font-medium tracking-wide uppercase', dark ? 'text-white/85' : 'text-ed-text/70')}>{label}</div>
        <div className="mt-1 text-[19px] leading-none font-semibold">{value.toLocaleString('en-US')}</div>
      </div>
    </button>
  );
}

export function ByStatusTab() {
  const { assignments, audiences, assign, addAudience, addToAudience } = useFollowUps();
  const [filters, setFilters] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const [all, setAll] = useState(false);
  const [modal, setModal] = useState(false);
  const [audPick, setAudPick] = useState(false);
  const [seg, setSeg] = useState<Seg>('all');
  const [detail, setDetail] = useState<string | null>(null);

  const byId = useMemo(() => new Map(assignments.map((a) => [a.customerId, a])), [assignments]);
  const assigned = assignments.length;
  const prev = assignments.filter((a) => a.times > 1).length;
  const segTotal: Record<Seg, number> = { all: FU_TOTAL, assigned, unassigned: FU_TOTAL - assigned, never: FU_TOTAL - assigned, previous: prev };
  const inSeg = (id: string) => {
    const a = byId.get(id);
    return seg === 'all' || (seg === 'assigned' && !!a) || ((seg === 'unassigned' || seg === 'never') && !a) || (seg === 'previous' && !!a && a.times > 1);
  };
  const rows = FU_CUSTOMERS.filter((r) => inSeg(r.id) && (!q || `${r.name} ${r.mobile} ${r.order}`.toLowerCase().includes(q.toLowerCase())));
  const total = segTotal[seg];
  const pick = (g: Seg) => { setSeg(g); setSel([]); setAll(false); };
  const n = all ? total : sel.length;
  const allOn = rows.length > 0 && rows.every((r) => sel.includes(r.id));
  const toggle = (id: string) => { setAll(false); setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])); };
  const clear = () => { setSel([]); setAll(false); };

  const createAudience = () => {
    const name = window.prompt('Audience name?')?.trim();
    if (name) { addAudience(name, sel); clear(); }
  };

  return (
    <div className="space-y-3">
      <div className={cn(card, 'flex items-center justify-between px-4 py-3')}>
        <span className="flex items-center gap-3 text-[14.5px] font-medium">
          <span className="bg-ed-bg flex size-8 items-center justify-center rounded-lg"><Filter className="size-4" /></span>Assignment Filters
        </span>
        <button type="button" onClick={() => setFilters((f) => !f)} className="text-ed-muted flex items-center gap-1.5 text-[13px]">
          {filters ? 'Hide' : 'Show'}<ChevronDown className={cn('size-4 transition', filters && 'rotate-180')} />
        </button>
      </div>
      {filters && (
        <div className={cn(card, 'flex flex-wrap gap-3 p-4 text-[13px]')}>
          {['All statuses', 'All products', 'All districts', 'All dates'].map((f) => (
            <span key={f} className="border-ed-line text-ed-muted rounded-lg border bg-[#f9f8fb] px-3 py-2">{f}</span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat tone="dark" active={seg === 'all'} onClick={() => pick('all')} icon={<Users className="size-5" />} label="Matching customers" value={FU_TOTAL} />
        <Stat tone="#f1f4fd" active={seg === 'assigned'} onClick={() => pick('assigned')} icon={<UserCheck className="size-5" />} label="Currently assigned" value={assigned} />
        <Stat tone="#fffaf0" active={seg === 'unassigned'} onClick={() => pick('unassigned')} icon={<UserX className="size-5" />} label="Currently unassigned" value={FU_TOTAL - assigned} />
        <Stat tone="#f0faf4" active={seg === 'never'} onClick={() => pick('never')} icon={<UserPlus className="size-5" />} label="Never assigned" value={FU_TOTAL - assigned} />
        <Stat tone="#fdf1f3" active={seg === 'previous'} onClick={() => pick('previous')} icon={<History className="size-5" />} label="Previously assigned" value={prev} />
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" disabled={!n} onClick={createAudience} className="border-ed-line flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[14px] font-medium enabled:hover:bg-[#f7f6fa] disabled:text-ed-text/40"><ListChecks className="size-4" />Create Audience ({n})</button>
        <div className="relative">
          <button type="button" disabled={!n || !audiences.length} onClick={() => setAudPick((o) => !o)} className="border-ed-line flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[14px] font-medium enabled:hover:bg-[#f7f6fa] disabled:text-ed-text/40"><UserPlus className="size-4" />Add to Existing Audience ({n})</button>
          {audPick && (
            <ul className="border-ed-line absolute right-0 z-20 mt-1 w-56 rounded-lg border bg-white p-1 shadow-lg">
              {audiences.map((a) => <li key={a.id}><button type="button" onClick={() => { addToAudience(a.id, sel); setAudPick(false); clear(); }} className="w-full rounded-md px-3 py-2 text-left text-[13px] hover:bg-[#f4eef8]">{a.name}</button></li>)}
            </ul>
          )}
        </div>
      </div>

      <section className={cn(card, 'overflow-hidden')}>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <h2 className="mr-auto text-[17px] font-semibold">{total.toLocaleString('en-US')} customers</h2>
          <div className="relative w-[320px] max-sm:w-full">
            <Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input style={{ outline: 'none' }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer or mobile..." className="border-ed-line placeholder:text-ed-muted h-10 w-full rounded-lg border bg-[#f9f8fb] pr-3 pl-9 text-[13.5px] outline-none focus:border-ed-brand/50" />
          </div>
          <button type="button" className="border-ed-line flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[14px] font-medium"><Columns3 className="size-4" />Columns</button>
          <button type="button" onClick={() => { setAll(true); setSel(rows.map((r) => r.id)); }} className="border-ed-line flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[14px] font-medium hover:bg-[#f7f6fa]"><SquareCheckBig className="size-4" />Select All ({total.toLocaleString('en-US')})</button>
          {n > 0 && <button type="button" onClick={clear} className="text-ed-text/80 flex h-10 items-center gap-1.5 text-[14px] font-medium"><X className="size-4" />Clear</button>}
          <button type="button" disabled={!n} onClick={() => setModal(true)} className="flex h-10 items-center gap-2 rounded-lg px-4 text-[14px] font-semibold text-white transition enabled:hover:brightness-110 disabled:opacity-50" style={{ backgroundColor: n ? BRAND : '#a98bb8' }}>
            <UserPlus className="size-4" />Assign Selected ({n.toLocaleString('en-US')})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-ed-line border-y">
                <th className="w-[56px] pl-4"><Box on={allOn} label="Select all" onChange={() => { setAll(false); setSel(allOn ? [] : rows.map((r) => r.id)); }} /></th>
                {['Order', 'Customer', 'Mobile', 'Status', 'Audience', 'Products', 'Assigned To', 'Times Assigned', 'Amount', 'Date'].map((h) => <th key={h} className={cn(th, h === 'Times Assigned' && 'text-center', h === 'Amount' && 'text-right')}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={11} className="text-ed-muted py-14 text-center text-[14px]">No customers in this segment yet.</td></tr>}
              {rows.map((r) => {
                const a = byId.get(r.id);
                const aud = audiences.find((x) => x.customerIds.includes(r.id));
                return (
                  <tr key={r.id} className={cn('border-ed-line border-b last:border-0 hover:bg-[#faf9fc]', sel.includes(r.id) && 'bg-[#f6f0fa]')}>
                    <td className="pl-4"><Box on={sel.includes(r.id)} label={`Select ${r.order}`} onChange={() => toggle(r.id)} /></td>
                    <td className="px-4 py-4">{r.order}</td>
                    <td className="px-4"><button type="button" onClick={() => setDetail(r.id)} className="text-left hover:text-ed-brand hover:underline">{r.name}</button></td>
                    <td className="px-4 text-[#4a1d9a]">{r.mobile}</td>
                    <td className="px-4"><span className="border-ed-line rounded-full border px-2.5 py-0.5 text-[12px] font-medium">{r.status}</span></td>
                    <td className={cn('px-4 text-[13px]', !aud && 'text-ed-muted')}>{aud?.name ?? 'No Audience'}</td>
                    <td className="px-4">{r.products}</td>
                    <td className={cn('px-4', !a && 'text-ed-muted')}>{a?.employee ?? 'Unassigned'}</td>
                    <td className="px-4 text-center">{a?.times ?? 0}</td>
                    <td className="px-4 text-right">৳ {r.amount}</td>
                    <td className="px-4 whitespace-nowrap">{r.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {detail && (() => {
        const c = FU_CUSTOMERS.find((x) => x.id === detail)!;
        const a = byId.get(detail);
        const aud = audiences.find((x) => x.customerIds.includes(detail));
        const items: [string, string][] = [
          ['Order', c.order], ['Mobile', c.mobile], ['Order status', c.status], ['Order date', c.date], ['Amount', `৳ ${c.amount}`], ['Products', c.products],
          ['Audience', aud?.name ?? 'No Audience'], ['Assigned to', a?.employee ?? 'Unassigned'], ['Times assigned', String(a?.times ?? 0)],
          ['Follow-up progress', a?.progress ?? '—'], ['Priority', a?.priority ?? '—'], ['Assigned date', a?.assignedAt ?? '—'],
          ['Relationship owner', a ? (a.relationshipOwner ? a.employee : 'No') : '—'], ['Note', a?.note || '—'],
        ];
        return (
          <Modal title={c.name} sub={`${c.order} · ${c.mobile}`} onClose={() => setDetail(null)}>
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {items.map(([k, v]) => <div key={k} className={cn(k === 'Products' || k === 'Note' ? 'sm:col-span-2' : '')}><dt className="text-ed-muted text-[12px] tracking-wide uppercase">{k}</dt><dd className="mt-0.5 text-[14.5px] font-medium">{v}</dd></div>)}
            </dl>
            <div className="mt-6 flex justify-end gap-3">
              <a href={`tel:${c.mobile}`} className="border-ed-line flex h-10 items-center rounded-lg border px-4 text-[14px] font-medium hover:bg-[#f7f6fa]">Call</a>
              <button type="button" onClick={() => { setSel([c.id]); setAll(false); setDetail(null); setModal(true); }} className="h-10 rounded-lg px-4 text-[14px] font-semibold text-white" style={{ backgroundColor: BRAND }}>{a ? 'Reassign' : 'Assign'}</button>
            </div>
          </Modal>
        );
      })()}

      {modal && (
        <AssignFollowUpsModal
          count={n}
          employees={FU_EMPLOYEES.map((e) => e.name)}
          onClose={() => setModal(false)}
          onSubmit={(p) => { assign(sel, p); setModal(false); clear(); }}
        />
      )}
    </div>
  );
}
