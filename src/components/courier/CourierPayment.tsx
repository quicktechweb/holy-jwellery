'use client';

import { useState, type FormEvent } from 'react';
import { CircleHelp, Search, Trash2, Upload } from 'lucide-react';
import { allOrders } from '@/data/approvedOrders';
import { allParcels } from '@/data/courier';
import { Btn, GuideModal, Modal, Sel } from './ui';

interface Line { invoice: string; name: string; amount: number; courier: string }
const accounts = ['No account selected', 'Cash in hand', 'bKash Merchant', 'Nagad Merchant', 'City Bank'];

function lookup(q: string): Line | null {
  const k = q.trim().toLowerCase();
  const p = allParcels.find((x) => x.invoice.toLowerCase() === k);
  if (p) return { invoice: p.invoice, name: p.name, amount: p.amount, courier: p.courier };
  const o = allOrders.find((x) => x.invoice.toLowerCase() === k);
  return o ? { invoice: o.invoice, name: o.name, amount: o.total, courier: 'Steadfast' } : null;
}

export function CourierPayment() {
  const [section, setSection] = useState('Manual Entry');
  const [q, setQ] = useState('');
  const [cod, setCod] = useState('0');
  const [acct, setAcct] = useState(accounts[0]);
  const [lines, setLines] = useState<Line[]>([]);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [history, setHistory] = useState<{ at: string; count: number; total: number }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [guide, setGuide] = useState(false);

  const add = (e: FormEvent) => {
    e.preventDefault();
    setMsg('');
    const raw = q.trim();
    if (!raw) return;
    if (lines.some((l) => l.invoice.toLowerCase() === raw.toLowerCase())) return setErr('This invoice is already added.');
    const l = lookup(raw);
    if (!l) return setErr(`No order found for "${raw}".`);
    setErr('');
    setLines((x) => [...x, l]);
    setQ('');
  };

  const codPct = Math.min(100, Math.max(0, Number(cod) || 0));
  const gross = lines.reduce((s, l) => s + l.amount, 0);
  const charge = Math.round((gross * codPct) / 100);
  const net = gross - charge;

  const save = () => {
    setHistory((h) => [{ at: new Date().toLocaleString(), count: lines.length, total: net }, ...h]);
    setMsg(`Payment updated for ${lines.length} order${lines.length > 1 ? 's' : ''}. Net settlement ৳${net.toLocaleString()}${acct !== accounts[0] ? ` deposited to ${acct}` : ''}.`);
    setLines([]);
  };

  const input = 'border-ed-line focus:border-ed-brand/40 focus:ring-ed-brand/10 h-10 w-full rounded-lg border bg-[#faf9fc] px-3 text-[13.5px] outline-none focus:ring-2';

  return (
    <div className="pt-6">
      <h1 className="text-[24px] leading-tight font-medium tracking-tight">Update Courier Payment</h1>
      <p className="mt-5 text-[13px]">Select Section</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        <Sel label="Section" value={section} onChange={setSection} options={['Manual Entry', 'CSV Upload']} className="w-[403px] max-w-full [&_select]:bg-[#faf9fc]" />
        <Btn onClick={() => setShowHistory(true)} className="bg-[#faf9fc]">Invoice History</Btn>
        <Btn onClick={() => setGuide(true)} className="ml-auto bg-[#faf9fc]"><CircleHelp className="size-4" /> Invalid ফিক্স গাইড</Btn>
      </div>

      <section className="border-ed-line mt-5 rounded-xl border bg-white shadow-[0_1px_2px_rgba(30,20,50,0.04)]">
        <h2 className="border-ed-line border-b px-5 py-3.5 text-[15.5px] font-medium">{section === 'Manual Entry' ? 'Search & Add Orders' : 'Upload Courier Invoice'}</h2>
        <div className="px-5 py-2.5">
          {section === 'Manual Entry' ? (
            <form onSubmit={add} className="flex gap-3 max-sm:flex-col">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Enter invoice number" className={input} />
              <button type="submit" className="bg-ed-brand flex h-10 items-center gap-2.5 rounded-lg px-5 text-[13.5px] font-medium whitespace-nowrap text-white hover:brightness-110"><Search className="size-4" /> Search &amp; Add</button>
            </form>
          ) : (
            <label className="border-ed-line text-ed-muted hover:text-ed-brand flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-[13px]">
              <Upload className="size-5" /> Choose a courier CSV / Excel file
              <input type="file" accept=".csv,.xlsx,.xls" className="sr-only" onChange={(e) => e.target.files?.[0] && setMsg(`${e.target.files[0].name} selected. Parsing runs on the server once connected.`)} />
            </label>
          )}
          {err && <p role="alert" className="mt-2 text-[12.5px] text-rose-600">{err}</p>}

          <div className="mt-3 grid gap-x-3.5 gap-y-1 md:grid-cols-2">
            <label className="text-[13px]">COD Charge (%)<input type="number" min={0} max={100} value={cod} onChange={(e) => setCod(e.target.value)} className={`${input} mt-1`} /></label>
            <label className="text-[13px]">Deposit Account (Optional)<Sel label="Deposit account" value={acct} onChange={setAcct} options={accounts} className="mt-1 [&_select]:bg-[#faf9fc]" /></label>
          </div>
          <p className="text-ed-muted mt-3 mb-3 text-[12.5px]">If an account is selected, this save&apos;s settlement is deposited and its COD charge is withdrawn as an expense.</p>
        </div>
      </section>

      {msg && <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-[13px] font-medium text-green-700">{msg}</p>}

      {lines.length > 0 && (
        <section className="border-ed-line mt-5 overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-left text-[13.5px]">
            <thead><tr className="border-ed-line text-ed-muted border-b bg-[#f8f7fb] text-[12.5px]">{['Invoice', 'Customer', 'Courier', 'Amount', ''].map((h) => <th key={h} className="px-5 py-3 font-normal">{h}</th>)}</tr></thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.invoice} className="border-ed-line border-b last:border-b-0">
                  <td className="px-5 py-3 font-mono text-[12px]">{l.invoice}</td><td className="px-5">{l.name}</td><td className="px-5">{l.courier}</td><td className="px-5 tabular-nums">৳{l.amount.toLocaleString()}</td>
                  <td className="px-5 text-right"><button type="button" aria-label={`Remove ${l.invoice}`} onClick={() => setLines((x) => x.filter((y) => y.invoice !== l.invoice))} className="hover:text-ed-red"><Trash2 className="size-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-ed-line flex flex-wrap items-center justify-between gap-3 border-t bg-[#faf9fc] px-5 py-4 text-[13px]">
            <span className="text-ed-muted">Gross ৳{gross.toLocaleString()} − COD charge ({codPct}%) ৳{charge.toLocaleString()} = <b className="text-ed-text font-medium">Net ৳{net.toLocaleString()}</b></span>
            <Btn primary onClick={save}>Update Payment</Btn>
          </div>
        </section>
      )}

      {showHistory && (
        <Modal title="Invoice History" onClose={() => setShowHistory(false)}>
          {history.length === 0 ? <p className="text-ed-muted text-[13.5px]">No payment updates in this session yet.</p> : (
            <ul className="divide-ed-line divide-y text-[13.5px]">{history.map((h, i) => <li key={i} className="flex justify-between py-2.5"><span>{h.at}</span><span className="text-ed-muted">{h.count} orders · ৳{h.total.toLocaleString()}</span></li>)}</ul>
          )}
        </Modal>
      )}
      {guide && <GuideModal title="Invalid ফিক্স গাইড" onClose={() => setGuide(false)} points={['Invoice খুঁজে না পেলে সম্পূর্ণ invoice নম্বর (যেমন EH-16719) লিখুন।', 'একই invoice দুইবার যোগ করা যায় না।', 'COD Charge % দিলে Net settlement থেকে সেই অংশ কেটে নেওয়া হবে।', 'Deposit Account বাছাই করলে settlement জমা হবে এবং COD charge খরচ হিসেবে লেখা হবে।']} />}
    </div>
  );
}
