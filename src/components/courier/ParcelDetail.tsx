'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Box, Check, CircleDot, ExternalLink, History, PhoneCall, RefreshCw, Tag, Tag as TagIcon, UserCog, User, Truck, Wallet, Bike, Info, X } from 'lucide-react';
import type { Parcel } from '@/data/courier';
import { cn } from '@/lib/utils';
import { CallIcons } from './ui';
import { TagPill } from './parts';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const areas = ['Pabna › Ishwardi', 'Dhaka › Mirpur', 'Chattogram › Patiya', 'Rajshahi › Boalia', 'Gazipur › Tongi'];
export const courierLabel = (c: string) => (c === 'PATAW' ? 'Pathao' : c);

interface Ev { t: string; title: string; reason?: string; sub?: string; bad?: boolean }

function build(p: Parcel) {
  const s = new Date(2026, 9, 14);
  s.setDate(s.getDate() - Math.min(p.age, 400));
  const at = (d: number, hm: string) => { const x = new Date(s); x.setDate(x.getDate() + d); return `${x.getDate()} ${MON[x.getMonth()]} ${hm}`; };
  const returned = p.cStatus === 'Return Requested';
  const ready: Ev[] = [
    returned
      ? { t: at(3, '19:44'), title: 'Return initiated by rider.', reason: 'কাস্টমার পার্সেল গ্রহণ করতে অস্বীকার করেছেন', sub: 'Feroj Ahmmed · Feroj Ahmmed' }
      : { t: at(3, '12:05'), title: 'Out for delivery.', sub: 'Feroj Ahmmed · Ishwardi Hub' },
    { t: at(3, '11:38'), title: 'Assigned to Feroj Ahmmed (01846512040) for delivery.', sub: 'Feroj Ahmmed · Ishwardi Hub' },
    { t: at(3, '10:32'), title: 'Assigned to Md.Asif Hossain Rabby (01349279681) for delivery.', sub: 'Md.Asif Hossain Rabby · Ishwardi Hub' },
    { t: at(3, '10:09'), title: 'Assigned to Md. Nahid Hasan (01765640579) for delivery.', sub: 'Md. Nahid Hasan · Ishwardi Hub' },
    { t: at(2, '14:22'), title: 'Delivery on hold.', reason: 'Customer is unreachable over the phone', sub: 'Prince Sodoruddin Aga Khan · Prince Sodoruddin Aga Khan', bad: true },
    { t: at(2, '10:20'), title: 'Assigned to Prince Sodoruddin Aga Khan (01701607171) for delivery.', sub: 'Prince Sodoruddin Aga Khan · Ishwardi Hub' },
    { t: at(1, '19:15'), title: 'Delivery on hold.', reason: 'Customer is unreachable over the phone', sub: 'Prince Sodoruddin Aga Khan · Prince Sodoruddin Aga Khan', bad: true },
    { t: at(1, '15:13'), title: 'Assigned to Prince Sodoruddin Aga Khan (01701607171) for delivery.', sub: 'Prince Sodoruddin Aga Khan · Ishwardi Hub' },
    { t: at(1, '14:57'), title: 'Reached at Pabna-Ishwardi.', sub: 'Abu Jafor Md. Jubair · Ishwardi Hub' },
  ];
  const transit: Ev[] = [
    { t: at(1, '08:14'), title: 'Dispatched from Sirajgonj Sorting.', sub: 'Md. Durjoy Sheikh-Sirajgonj Sorting · Md. Zahidul Islam Sirajganj Sorting' },
    { t: at(1, '08:01'), title: 'Reached at Sirajgonj Sorting.', sub: 'Md. Selim Reza Sirajgonj Sorting House · Md. Selim Reza Sirajgonj Sorting House' },
    { t: at(1, '02:17'), title: 'Dispatched from Central Processing OSD.', sub: 'Md. Salim Khan · Sorting Operations' },
    { t: at(0, '23:17'), title: 'Dispatched from Mirpur-1.', sub: 'Central OSD · 1 Hub' },
  ];
  const picked: Ev[] = [
    { t: at(0, '22:30'), title: 'Received at pickup hub: Mirpur-1.', sub: 'Md. Musa · 1 Hub' },
    { t: at(0, '22:30'), title: 'Order weight updated from 0.2kg to 0.25kg', sub: 'masuf · 1 Hub' },
    { t: at(0, '18:52'), title: 'Assigned to Md.Sahan Ahmed for pickup.', sub: 'Pathao System · Pathao System' },
    { t: at(0, '18:52'), title: 'Pickup requested.' },
  ];
  const tl = {
    Delivery: [at(3, '11:38'), at(3, '10:32'), at(3, '10:09'), at(2, '10:20'), at(1, '15:13')].map((t) => ({ t, title: 'Assigned for Delivery' })),
    'In transit': [
      { t: at(2, '14:22'), title: 'On Hold: Customer is unreachable over the phone', bad: true },
      { t: at(1, '19:15'), title: 'On Hold: Customer is unreachable over the phone', bad: true },
      { t: at(1, '14:57'), title: 'Received at Last Mile Hub' },
      { t: at(0, '23:17'), title: 'In Transit' },
      { t: at(0, '22:30'), title: 'At the Sorting Hub' },
    ] as Ev[],
    Pickup: [{ t: at(0, '22:30'), title: 'Order Updated' }, { t: at(0, '18:52'), title: 'Order Created' }, { t: at(0, '18:52'), title: 'Assigned For Pickup' }] as Ev[],
  };
  return { ready, transit, picked, tl, reason: returned ? 'কাস্টমার পার্সেল গ্রহণ করতে অস্বীকার করেছেন' : '' };
}

const dotCls = { green: 'bg-emerald-500', blue: 'bg-sky-500', orange: 'bg-amber-500', red: 'bg-rose-500' };
function Group({ title, color, icon, events }: { title: string; color: 'green' | 'blue' | 'orange'; icon: React.ReactNode; events: Ev[] }) {
  const txt = { green: 'text-emerald-600', blue: 'text-sky-600', orange: 'text-amber-600' }[color];
  return (
    <div className="mb-5">
      <p className={cn('mb-3 flex items-center gap-2 border-b border-[#eceaf1] pb-2 text-[13.5px] font-medium', txt)}>{icon}{title}</p>
      <ul className="space-y-3.5">
        {events.map((e, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-ed-muted w-[62px] shrink-0 text-[10.5px] leading-[18px]">{e.t}</span>
            <i className={cn('mt-[5px] size-2 shrink-0 rounded-full', e.bad ? dotCls.red : dotCls[color])} />
            <div className="min-w-0">
              <p className={cn('text-[13px] leading-[18px]', e.bad && 'text-rose-600')}>{e.title}</p>
              {e.reason && <p className="text-ed-muted text-[11.5px]">Reason: {e.reason}</p>}
              {e.sub && <p className="text-ed-muted mt-0.5 text-[9.5px]">{e.sub}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Box2({ title, icon, children, className }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl bg-[#f8f7fb] p-3', className)}>
      <h4 className="mb-2 flex items-center gap-2.5 px-2 py-1 text-[14px] font-medium">{icon}{title}</h4>
      <dl className="rounded-lg bg-white px-3.5">{children}</dl>
    </section>
  );
}
const Row = ({ k, v, last, bold }: { k: string; v: React.ReactNode; last?: boolean; bold?: boolean }) => (
  <div className={cn('flex items-center justify-between gap-4 py-2.5 text-[12.5px]', !last && 'border-b border-[#f1eff5]')}><dt className="text-ed-muted text-[11.5px]">{k}</dt><dd className={cn('text-right', bold && 'font-medium')}>{v}</dd></div>
);

export function ParcelDetail({ parcel: p, tags, onClose, onAction }: { parcel: Parcel; tags: string[]; onClose: () => void; onAction: (kind: 'call' | 'tag' | 'history' | 'charge', rect: DOMRect) => void }) {
  const d = useMemo(() => build(p), [p]);
  const [readAt, setReadAt] = useState('just now');
  const [price, setPrice] = useState<number | null>(null);
  const [reported, setReported] = useState(false);
  const label = courierLabel(p.courier);
  const area = areas[p.invoice.length % areas.length];
  const stat = [['Status', p.ourStatus ?? p.cStatus ?? '—'], ['Age', `${p.age}d`], ['Amount', `৳ ${p.amount}`], ['Charge', String(p.delCharge)], [`${label.toUpperCase()} Charge`, 'Not asked']];
  const ab = 'border-ed-line hover:text-ed-brand flex size-7 items-center justify-center rounded-lg border bg-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label={`Parcel ${p.invoice}`} className="relative max-h-[92vh] w-full max-w-[806px] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <button type="button" aria-label="Close" onClick={onClose} className="text-ed-muted hover:text-ed-text absolute top-4 right-4"><X className="size-4" /></button>

        <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
          <div className="flex items-center gap-2.5"><span className="flex size-4 items-center justify-center rounded-full bg-rose-500"><i className="size-1.5 rounded-full bg-white" /></span><a href="#" onClick={(e) => e.preventDefault()} className="text-[16px] font-medium text-blue-600 underline">{p.invoice}</a><span className="block size-6 rounded-full" style={{ background: p.avatar }} /></div>
          <div className="flex items-center gap-3"><span className="font-mono text-[9.5px]">{p.tracking}</span><a href="#" onClick={(e) => e.preventDefault()} className="border-ed-line flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px]"><ExternalLink className="size-3.5" />{label} page</a></div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-6">
          {stat.map(([k, v], i) => (
            <div key={k} className={cn('rounded-lg border bg-white px-3 py-2', i === 1 && p.age >= 3 ? 'border-amber-300 ring-1 ring-amber-200' : 'border-ed-line')}>
              <p className="text-ed-muted text-[9.5px] tracking-wide uppercase">{k}</p><p className="mt-0.5 text-[15px] font-medium">{v}</p>
            </div>
          ))}
          <div className="border-ed-line rounded-lg border bg-white px-3 py-2"><p className="text-ed-muted text-[9.5px] tracking-wide uppercase">Actions</p>
            <div className="mt-1 flex gap-1.5">
              {([[PhoneCall, 'call'], [TagIcon, 'tag'], [History, 'history'], [UserCog, 'charge']] as const).map(([I, k]) => <button key={k} type="button" aria-label={k} className={ab} onClick={(e) => onAction(k, e.currentTarget.getBoundingClientRect())}><I className="size-3" /></button>)}
            </div>
          </div>
        </div>

        <div className="bg-ed-bg border-ed-line mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-[11.5px]">
          <span>Read from {label} {readAt} <span className="text-ed-muted ml-3">We say <b className="text-ed-text font-medium">{p.ourStatus ?? p.cStatus}</b></span>{price !== null && <span className="ml-3 text-emerald-700">Estimated price ৳{price}</span>}</span>
          <button type="button" onClick={() => setReadAt('just now')} className="flex items-center gap-2 text-[13px]"><RefreshCw className="size-3.5" /> Read again</button>
        </div>
        <div className="mt-3 flex gap-2.5">
          <button type="button" onClick={() => setReported(true)} className="border-ed-line flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px]"><Info className="size-3.5" />{reported ? 'Recipient reported' : 'Report recipient'}</button>
          <button type="button" onClick={() => setPrice(110)} className="border-ed-line flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px]"><Tag className="size-3.5" /> Get price</button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1.08fr_1fr]">
          <Box2 title="Recipient Details" icon={<User className="size-3.5" />}>
            <Row k="Name" v={p.name} bold /><Row k="Phone" v={<span>{p.mobile}<CallIcons /></span>} /><Row k="Address" v={p.address} /><Row k="Area" v={area} last />
          </Box2>
          <Box2 title="Cost of Delivery" icon={<Box className="size-3.5" />}>
            <Row k="Collectable amount" v={`৳ ${p.amount}`} /><Row k="Delivery fee" v="৳ 110" /><Row k="COD fee" v="0" />
            <div className="-mx-3.5 flex items-center justify-between rounded-b-lg bg-[#f3f1f7] px-3.5 py-3 text-[12.5px]"><dt className="text-[11.5px]">Total cost</dt><dd className="text-[14px] font-medium">৳ 110</dd></div>
          </Box2>
          <Box2 title="Rider" icon={<Bike className="size-3.5" />}>
            <Row k="Name" v={p.rider?.name ?? '—'} /><Row k={`${label} names`} v="Feroj Ahmmed" last />
          </Box2>
          <section className="rounded-xl bg-[#f8f7fb] p-3"><h4 className="mb-2 flex items-center gap-2.5 px-2 py-1 text-[14px] font-medium"><TagIcon className="size-3.5" />Tags</h4><div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-lg bg-white px-3.5 py-3 text-[12.5px]">{tags.length ? tags.map((t) => <TagPill key={t} name={t} />) : '-'}</div></section>
        </div>

        <Box2 className="mt-3" title="Delivery Info" icon={<Truck className="size-3.5" />}>
          <Row k="Consignment" v={<a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 underline">{p.tracking}</a>} />
          <Row k="Our invoice" v={<a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 underline">{p.invoice}</a>} />
          <Row k={`${label} status`} v={p.cStatus || '—'} /><Row k="Billing" v="Unpaid" /><Row k="Store" v="Holy Jewellery" /><Row k="Item" v="Parcel" /><Row k="Quantity" v="1" />
          <Row k="Description" v={`${p.amount}sdku (Qty: 1, Price: ${p.amount})`} /><Row k="Weight" v="0.25 kg" />
          <Row k="Public tracking" v={<a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-1 text-blue-600"><ExternalLink className="size-3" />Open</a>} last={!d.reason} />
          {d.reason && <div className="mb-3 flex items-start gap-3 rounded-lg bg-[#fff7d6] px-3 py-2.5"><AlertTriangle className="mt-0.5 size-4 text-amber-600" /><div><p className="text-[9.5px] tracking-wide text-amber-800 uppercase">{label}&apos;s reason</p><p className="text-[13px]">{d.reason}</p></div></div>}
        </Box2>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-[13.5px] font-medium"><Wallet className="size-3.5" />{label}&apos;s journey</h4>
            <Group title="Ready For Delivery" color="green" icon={<Check className="size-4 rounded-full bg-emerald-500 p-0.5 text-white" />} events={d.ready} />
            <Group title="In-Transit" color="blue" icon={<Check className="size-4 rounded-full bg-sky-500 p-0.5 text-white" />} events={d.transit} />
            <Group title="Picked" color="orange" icon={<Check className="size-4 rounded-full bg-amber-500 p-0.5 text-white" />} events={d.picked} />
          </div>
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-[13.5px] font-medium"><History className="size-3.5" />Our timeline</h4>
            <div className="mb-4 grid grid-cols-3 gap-1.5 text-[9.5px]">{[['Pickup', 'bg-amber-500'], ['In transit', 'bg-sky-500'], ['Delivery', 'bg-emerald-500']].map(([l, c]) => <div key={l}><i className={cn('mb-1 block h-1 rounded-full', c)} /><span className="text-ed-muted">{l}</span></div>)}</div>
            <Group title="Delivery" color="green" icon={<CircleDot className="size-4 text-emerald-500" />} events={d.tl.Delivery} />
            <Group title="In transit" color="blue" icon={<CircleDot className="size-4 text-sky-500" />} events={d.tl['In transit']} />
            <Group title="Pickup" color="orange" icon={<CircleDot className="size-4 text-amber-500" />} events={d.tl.Pickup} />
          </div>
        </div>
      </div>
    </div>
  );
}
