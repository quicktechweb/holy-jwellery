'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Card } from '@/components/dashboard/Card';
import { suppliers, taka } from '@/data/purchase';
import { usePurchaseOrders } from '@/lib/purchaseStore';
import { Breadcrumb, Field, PageHead, SelectBox } from './ui';

function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: string }) {
  return (
    <Card className="mt-5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="text-ed-muted border-ed-line border-b bg-[#faf9fc] text-[12.5px]">
              {head.map((h) => <th key={h} className="px-5 py-3.5 font-normal">{h}</th>)}
            </tr>
          </thead>
          <tbody className="text-[13.5px] [&_td]:px-5 [&_td]:py-3.5 [&_tr]:border-ed-line [&_tr:not(:last-child)]:border-b">{children}</tbody>
        </table>
      </div>
      {empty && <p className="text-ed-muted py-14 text-center text-[13px]">{empty}</p>}
    </Card>
  );
}


/* ───────── Supplier Ledger ───────── */
export function SupplierLedger() {
  const orders = usePurchaseOrders();
  const [name, setName] = useState(suppliers[0].name);
  const entries = useMemo(() => {
    let bal = 0;
    return orders.filter((p) => p.supplier === name && p.amount > 0).sort((a, b) => a.date.localeCompare(b.date)).flatMap((p) => {
      const out = [{ key: `${p.id}-d`, date: p.date.slice(0, 10), ref: p.items[0]?.name ?? p.id, note: 'Purchase', debit: 0, credit: p.amount, bal: (bal += p.amount) }];
      if ((p.settled ? p.amount : p.paid) > 0) out.push({ key: `${p.id}-p`, date: p.date.slice(0, 10), ref: p.items[0]?.name ?? p.id, note: 'Payment', debit: p.settled ? p.amount : p.paid, credit: 0, bal: (bal -= p.settled ? p.amount : p.paid) });
      return out;
    });
  }, [name, orders]);
  const due = entries.at(-1)?.bal ?? 0;
  return (
    <div className="mx-auto max-w-[1400px] pt-7">
      <Breadcrumb page="Supplier Ledger" />
      <PageHead title="Supplier Ledger" sub="Purchases, payments and running balance per supplier" />
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div className="w-[280px]"><Field label="Supplier"><SelectBox label="Supplier" value={name} onChange={setName} options={suppliers.map((s) => s.name)} /></Field></div>
        <p className="text-[14px]">Outstanding balance: <span className="text-ed-red text-[18px] font-semibold">{taka(due)}</span></p>
      </div>
      <Table head={['Date', 'Item', 'Note', 'Debit (Paid)', 'Credit (Purchase)', 'Balance']} empty={entries.length ? undefined : 'No ledger entries for this supplier.'}>
        {entries.map((e) => (
          <tr key={e.key}><td className="text-ed-muted">{e.date}</td><td className="max-w-[200px] truncate">{e.ref}</td><td>{e.note}</td><td>{e.debit ? taka(e.debit) : '—'}</td><td>{e.credit ? taka(e.credit) : '—'}</td><td>{taka(e.bal)}</td></tr>
        ))}
      </Table>
    </div>
  );
}
