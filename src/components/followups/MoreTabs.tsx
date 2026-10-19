'use client';

import { ChevronDown, ChevronsUpDown, HelpCircle, MessageSquareText, Phone, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useFollowUps } from '@/lib/followupStore';
import { Empty, card, inputCls } from './ui';

const BRAND = 'bg-ed-brand';
const sel = 'border-ed-line h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-[14px] outline-none focus:border-ed-brand focus:ring-2 focus:ring-ed-brand/20';

/** tiny localStorage-backed state. TODO: API */
function usePersisted<T>(key: string, init: T) {
  const [v, setV] = useState<T>(init);
  useEffect(() => { try { const r = window.localStorage.getItem(key); if (r) setV(JSON.parse(r)); } catch { /* ignore */ } }, [key]);
  const set = (n: T) => { setV(n); try { window.localStorage.setItem(key, JSON.stringify(n)); } catch { /* ignore */ } };
  return [v, set] as const;
}

/* ───────────── FAQ Management ───────────── */
interface Faq { id: string; forType: string; target: string; q: string; a: string }
const FAQ_FOR = ['Product', 'Audience', 'Category', 'Everyone'] as const;
const PRODUCTS = ['korean leaf nacklace with 2 gift'];
const CATEGORIES = ['Jewellery', 'Fashion', 'Accessories'];
const blank = () => ({ q: '', a: '' });

export function FaqTab() {
  const { audiences } = useFollowUps();
  const [faqs, setFaqs] = usePersisted<Faq[]>('ed.fu.faqs.v1', []);
  const [q, setQ] = useState('');
  const [tf, setTf] = useState('All targets');
  const [tfOpen, setTfOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [forType, setForType] = useState<(typeof FAQ_FOR)[number]>('Product');
  const [target, setTarget] = useState('');
  const [items, setItems] = useState([blank()]);

  const opts = forType === 'Product' ? PRODUCTS : forType === 'Audience' ? audiences.map((a) => a.name) : forType === 'Category' ? CATEGORIES : [];
  const close = () => { setOpen(false); setForType('Product'); setTarget(''); setItems([blank()]); };
  const valid = items.filter((i) => i.q.trim() && i.a.trim());
  const ok = valid.length > 0 && (forType === 'Everyone' || !!target);
  const save = () => {
    setFaqs([...valid.map((i, n) => ({ id: `${Date.now()}-${n}`, forType, target: forType === 'Everyone' ? 'Everyone' : target, q: i.q.trim(), a: i.a.trim() })), ...faqs]);
    close();
  };
  const list = faqs.filter((f) => (tf === 'All targets' || f.forType === tf) && `${f.q} ${f.target}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <section className={card}>
      <div className="flex items-center justify-between gap-3 rounded-t-xl bg-[#f8f3fc] p-5">
        <div className="flex gap-3"><HelpCircle className="mt-1 size-5 text-[#6b21a8]" /><div><h2 className="text-[19px] font-medium">FAQ Management</h2><p className="text-ed-muted text-[14px]">Add quick answers for a Product, Audience, Category or everyone.</p></div></div>
        <button type="button" onClick={() => setOpen(true)} className={cn('flex h-11 items-center gap-2 rounded-lg px-5 text-[14.5px] font-semibold text-white', BRAND)}><Plus className="size-4" />Add FAQs</button>
      </div>
      <div className="p-6">
        <div className="flex gap-3">
          <div className="relative flex-1"><Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" /><input style={{ outline: 'none' }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search question or target..." className={inputCls} /></div>
          <div className="relative w-[176px]">
            <button type="button" onClick={() => setTfOpen((o) => !o)} className="border-ed-line flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 text-[14px]">{tf}<ChevronDown className="size-4" /></button>
            {tfOpen && <ul className="border-ed-line absolute right-0 left-0 z-20 mt-1 rounded-lg border bg-white p-1 shadow-lg">{['All targets', ...FAQ_FOR].map((o) => <li key={o}><button type="button" onClick={() => { setTf(o); setTfOpen(false); }} className="w-full rounded-md px-3 py-2 text-left text-[13px] hover:bg-[#f4eef8]">{o}</button></li>)}</ul>}
          </div>
        </div>
        {list.length === 0 ? (
          <div className="border-ed-line mt-4 rounded-xl border border-dashed"><Empty icon={<HelpCircle className="size-10" strokeWidth={1.6} />} title="No FAQs yet" hint="Add one or more answers for a Product, Audience, Category or everyone." /></div>
        ) : (
          <ul className="mt-4 space-y-2">{list.map((f) => (
            <li key={f.id} className="border-ed-line flex items-start justify-between gap-3 rounded-xl border p-4">
              <div><div className="text-ed-muted text-[12px]">{f.forType} · {f.target}</div><div className="mt-1 font-medium">{f.q}</div><p className="mt-1 text-[13.5px] whitespace-pre-wrap">{f.a}</p></div>
              <button type="button" aria-label="Delete FAQ" onClick={() => setFaqs(faqs.filter((x) => x.id !== f.id))}><Trash2 className="size-4 text-[#e5243b]" /></button>
            </li>))}</ul>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div role="dialog" aria-modal="true" className="relative max-h-[calc(100vh-2rem)] w-full max-w-[672px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <button type="button" aria-label="Close" onClick={close} className="absolute top-5 right-5"><X className="size-4" /></button>
            <h2 className="text-[18px] font-semibold">Add FAQs</h2>
            <p className="text-ed-muted mt-1 max-w-[560px] text-[14px]">Choose who it is for — a Product, Audience, Category or every customer — then add the answers agents need.</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <label className="text-[14px] font-medium">FAQ For
                <div className="relative mt-1.5"><select style={{ outline: 'none' }} value={forType} onChange={(e) => { setForType(e.target.value as typeof forType); setTarget(''); }} className={cn(sel, 'border-ed-brand ring-2 ring-ed-brand/20')}>{FAQ_FOR.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" /></div>
              </label>
              {forType !== 'Everyone' && (
                <label className="text-[14px] font-medium">{forType}
                  <div className="relative mt-1.5"><select style={{ outline: 'none' }} value={target} onChange={(e) => setTarget(e.target.value)} className={sel}><option value="">Select {forType.toLowerCase()}...</option>{opts.map((o) => <option key={o}>{o}</option>)}</select><ChevronsUpDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" /></div>
                </label>
              )}
            </div>
            {items.map((it, i) => (
              <div key={i} className="border-ed-line mt-4 rounded-xl border bg-[#fcfbfd] p-4">
                <div className="flex items-center justify-between"><span className="text-[14px] font-semibold">FAQ {i + 1}</span>{items.length > 1 && <button type="button" aria-label="Remove FAQ" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 className="size-4 text-[#e5243b]" /></button>}</div>
                <label className="mt-3 block text-[14px] font-medium">Question<input style={{ outline: 'none' }} value={it.q} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} placeholder="Customer question" className="border-ed-line mt-1.5 h-10 w-full rounded-lg border bg-white px-3 text-[14px] font-normal outline-none focus:border-ed-brand" /></label>
                <label className="mt-3 block text-[14px] font-medium">Answer<textarea style={{ outline: 'none' }} value={it.a} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} placeholder="Short, clear answer" className="border-ed-line mt-1.5 block h-[110px] w-full resize-y rounded-lg border bg-white p-3 text-[14px] font-normal outline-none focus:border-ed-brand" /></label>
              </div>
            ))}
            <button type="button" onClick={() => setItems([...items, blank()])} className="border-ed-line mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border bg-white text-[14px] font-medium hover:bg-[#f7f6fa]"><Plus className="size-4" />Add another FAQ</button>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={close} className="border-ed-line h-10 rounded-lg border px-5 text-[14px] font-medium">Cancel</button>
              <button type="button" disabled={!ok} onClick={save} className={cn('h-10 rounded-lg px-5 text-[14px] font-semibold text-white disabled:opacity-50', BRAND)}>Add {valid.length || items.length} FAQ{(valid.length || items.length) > 1 ? 's' : ''}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ───────────── Blacklist Management ───────────── */
export function BlacklistTab() {
  const [q, setQ] = useState('');
  const rows: { name: string; mobile: string }[] = []; // TODO: API
  const list = rows.filter((r) => `${r.name} ${r.mobile}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className={cn(card, 'w-[200px] p-4')}><div className="text-ed-text/70 text-[11px] tracking-wide uppercase">Blacklisted customers</div><div className="mt-1 text-[26px] leading-none font-semibold">{rows.length}</div></div>
        <div className="relative w-[320px] max-sm:w-full"><Search className="text-ed-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" /><input style={{ outline: 'none' }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or number" className={cn(inputCls, 'bg-white')} /></div>
      </div>
      <div className="border-ed-line text-ed-muted mt-4 rounded-xl border border-dashed bg-white/60 py-8 text-center text-[14px]">
        {list.length === 0 ? 'No customer is blacklisted.' : null}
      </div>
    </div>
  );
}

/* ───────────── Settings: SMS Templates ───────────── */
interface Tpl { bnTitle: string; enTitle: string; bnMsg: string; enMsg: string }
const newTpl = (): Tpl => ({ bnTitle: 'নতুন টেমপ্লেট', enTitle: 'New template', bnMsg: 'প্রিয় {{name}}, ', enMsg: 'Dear {{name}}, ' });
const seedTpl: Tpl[] = [
  { bnTitle: 'মিসড কল', enTitle: 'Missed call', bnMsg: 'প্রিয় {{name}}, আপনার সাথে যোগাযোগের চেষ্টা করেছিলাম কিন্তু সংযোগ করা সম্ভব হয়নি। শীঘ্রই আবার কল করব।', enMsg: 'Dear {{name}}, we tried to contact you but could not connect. We will call you again soon.' },
  { bnTitle: 'অর্ডার নিশ্চিত', enTitle: 'Order confirmed', bnMsg: 'প্রিয় {{name}}, আপনার অর্ডারটি কনফার্ম হয়েছে। দ্রুত ডেলিভারি দেওয়া হবে। ধন্যবাদ।', enMsg: 'Dear {{name}}, your order has been confirmed and will be delivered soon. Thank you.' },
  { bnTitle: 'অফার ও ক্যাটালগ', enTitle: 'Offers & catalog', bnMsg: 'প্রিয় {{name}}, আমাদের স্পেশাল অফার ও পণ্য কালেকশন দেখতে আমাদের পেজ ভিজিট করুন।', enMsg: 'Dear {{name}}, visit our page to see our special offers and product collection.' },
  newTpl(), newTpl(),
];
const MAX_TPL = 12;
const tin = 'border-ed-line w-full rounded-lg border bg-[#f7f6fb] px-3 text-[14px] outline-none focus:border-ed-brand focus:bg-white';

export function SmsTemplatesPanel() {
  const [tpls, setTpls] = usePersisted<Tpl[]>('ed.fu.sms.v1', seedTpl);
  const [draft, setDraft] = useState<Tpl[] | null>(null);
  const [saved, setSaved] = useState(false);
  const cur = draft ?? tpls;
  const upd = (i: number, k: keyof Tpl, v: string) => setDraft(cur.map((t, j) => (j === i ? { ...t, [k]: v.slice(0, k.endsWith('Msg') ? 500 : 80) } : t)));
  return (
    <section className={cn(card, 'mt-4')}>
      <div className="border-ed-line border-b p-6">
        <h2 className="flex items-center gap-2 text-[19px] font-medium"><MessageSquareText className="size-5 text-[#7c3aed]" />Agent Follow-up SMS Templates</h2>
        <p className="text-ed-muted mt-1 text-[14px]">These templates are used only in Agent Cockpit. They are completely separate from SMS Marketing templates.</p>
      </div>
      <div className="p-6">
        <div className="flex justify-end"><button type="button" disabled={cur.length >= MAX_TPL} onClick={() => setDraft([...cur, newTpl()])} className="border-ed-line flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-[14px] font-medium disabled:opacity-50"><Plus className="size-4" />Add Template</button></div>
        <div className="mt-4 space-y-4">
          {cur.map((t, i) => (
            <div key={i} className="border-ed-line rounded-xl border p-4">
              <div className="flex items-center justify-between"><h3 className="text-[16px] font-medium">Template {i + 1}</h3><button type="button" aria-label={`Delete template ${i + 1}`} onClick={() => setDraft(cur.filter((_, j) => j !== i))}><Trash2 className="size-[18px] text-[#dc2626]" /></button></div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <label className="text-[14px]">Bangla title<input style={{ outline: 'none' }} value={t.bnTitle} onChange={(e) => upd(i, 'bnTitle', e.target.value)} className={cn(tin, 'mt-1.5 h-10')} /></label>
                <label className="text-[14px]">English title<input style={{ outline: 'none' }} value={t.enTitle} onChange={(e) => upd(i, 'enTitle', e.target.value)} className={cn(tin, 'mt-1.5 h-10')} /></label>
                <label className="text-[14px]">Bangla message<textarea style={{ outline: 'none' }} value={t.bnMsg} onChange={(e) => upd(i, 'bnMsg', e.target.value)} className={cn(tin, 'mt-1.5 block h-20 resize-y py-2.5')} /></label>
                <label className="text-[14px]">English message<textarea style={{ outline: 'none' }} value={t.enMsg} onChange={(e) => upd(i, 'enMsg', e.target.value)} className={cn(tin, 'mt-1.5 block h-20 resize-y py-2.5')} /></label>
              </div>
            </div>
          ))}
        </div>
        <p className="text-ed-muted mt-4 text-[12.5px]">Use {'{{name}}'} or {'{{customerName}}'} to insert the customer name. Maximum {MAX_TPL} templates, 500 characters per message.</p>
        <button type="button" onClick={() => { if (draft) setTpls(draft); setDraft(null); setSaved(true); setTimeout(() => setSaved(false), 1800); }} className={cn('mt-3 flex h-11 items-center gap-2 rounded-lg px-5 text-[14.5px] font-semibold text-white', BRAND)}><Save className="size-4" />{saved ? 'Saved ✓' : 'Save Templates'}</button>
      </div>
    </section>
  );
}

/* ───────────── Settings: Product Recommendations ───────────── */
const RULES = [
  { id: 'history', t: 'Customer Purchase History', d: 'Products from the customer’s current and recent orders.' },
  { id: 'related', t: 'Related Categories', d: 'Products from categories related to the customer’s orders.' },
  { id: 'featured', t: 'Featured Products', d: 'Active products marked as Featured in Product Settings.' },
  { id: 'latest', t: 'Latest Products', d: 'The newest active products in the business catalog.' },
];

export function ProductRecPanel() {
  const [rule, setRule] = usePersisted('ed.fu.rec.rule', 'history');
  const [count, setCount] = usePersisted('ed.fu.rec.count', 8);
  const [r, setR] = useState<string | null>(null);
  const [n, setN] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const curRule = r ?? rule;
  const curN = n ?? String(count);
  const num = Number(curN);
  const valid = Number.isInteger(num) && num >= 1 && num <= 12;
  return (
    <section className={cn(card, 'mt-4 max-w-[896px]')}>
      <div className="border-ed-line border-b p-6">
        <h2 className="flex items-center gap-2 text-[19px] font-medium"><span className="text-[#9333ea]">✦</span>Product Recommendation Rule</h2>
        <p className="text-ed-muted mt-1 text-[14px]">Select one rule. Agent Cockpit will use only that rule to recommend active products from the current business.</p>
      </div>
      <div className="p-6">
        <div role="radiogroup" className="grid gap-3 md:grid-cols-2">
          {RULES.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={curRule === o.id} onClick={() => setR(o.id)} className={cn('border-ed-line flex gap-3 rounded-xl border p-4 text-left transition hover:bg-[#faf8fc]', curRule === o.id && 'border-ed-brand/40 bg-[#faf6fd]')}>
              <span className={cn('mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px]', curRule === o.id ? 'border-ed-brand' : 'border-[#9a97a8]')}>{curRule === o.id && <span className="bg-ed-brand size-2 rounded-full" />}</span>
              <span><span className="block text-[14.5px] font-medium">{o.t}</span><span className="text-ed-text/80 mt-0.5 block text-[13.5px]">{o.d}</span></span>
            </button>
          ))}
        </div>
        <label className="mt-6 block text-[14px] font-medium">Number of products
          <input style={{ outline: 'none' }} type="number" min={1} max={12} value={curN} onChange={(e) => setN(e.target.value)} className="border-ed-line mt-1.5 block h-11 w-[320px] max-w-full rounded-lg border bg-[#f7f6fb] px-3 text-[14px] font-normal outline-none focus:border-ed-brand focus:bg-white" />
        </label>
        <p className={cn('mt-1.5 text-[12.5px]', valid ? 'text-ed-muted' : 'text-[#e5243b]')}>Choose from 1 to 12.</p>
        <button type="button" disabled={!valid} onClick={() => { setRule(curRule); setCount(num); setR(null); setN(null); setSaved(true); setTimeout(() => setSaved(false), 1800); }} className={cn('mt-4 flex h-11 items-center gap-2 rounded-lg px-5 text-[14.5px] font-semibold text-white disabled:opacity-50', BRAND)}><Save className="size-4" />{saved ? 'Saved ✓' : 'Save Rule'}</button>
      </div>
    </section>
  );
}

/* ───────────── Settings: PBX Rules ───────────── */
export function PbxPanel() {
  return (
    <section className={cn(card, 'mt-4 flex max-w-[768px] gap-3 p-4')}>
      <Phone className="text-ed-text/70 mt-0.5 size-[18px]" />
      <div><h2 className="text-[15.5px] font-medium">PBX service is not active here</h2><p className="text-ed-muted mt-0.5 text-[13px]">These rules decide when an agent must call through PBX before saving a follow-up. They switch on once this Business has PBX.</p></div>
    </section>
  );
}
