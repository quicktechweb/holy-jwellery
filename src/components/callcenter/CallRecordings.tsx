'use client';

import { useState } from 'react';
import { Mic } from 'lucide-react';
import { CallFilterBar, EMPTY, type FilterState } from './CallFilterBar';

/** TODO: API — recording rows (AI summary, audio url, etc.) */
interface Recording { id: string; at: string; employee: string; direction: string; source: string; status: string; phone: string; summary: string }
const RECORDINGS: Recording[] = [];

export function CallRecordings() {
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState<FilterState>({ range: { from: today, to: today }, picked: EMPTY, phone: '', business: 'Active business' });
  const { range, picked, phone } = f;

  const rows = RECORDINGS.filter((r) =>
    r.at.slice(0, 10) >= range.from && r.at.slice(0, 10) <= range.to
    && (!picked.employee.length || picked.employee.includes(r.employee))
    && (!picked.direction.length || picked.direction.includes(r.direction))
    && (!picked.source.length || picked.source.includes(r.source))
    && (!picked.status.length || picked.status.includes(r.status))
    && (!phone || r.phone.includes(phone)));

  return (
    <div className="pt-8 pb-10">
      <h1 className="text-[32px] leading-tight font-medium tracking-tight">Call recordings</h1>
      <p className="text-ed-muted mt-1 text-[14.5px]">Listen to your team&apos;s recorded calls. Filter by date, business, employee, direction or phone number.</p>

      <div className="mt-5"><CallFilterBar onChange={setF} /></div>

      {/* list */}
      <section className="border-ed-line mt-5 rounded-xl border bg-white shadow-[0_1px_3px_rgba(30,20,50,0.05)]">
        <header className="border-ed-line border-b px-6 py-5">
          <h2 className="flex items-center gap-2.5 text-[18px] font-medium"><Mic className="size-[18px]" strokeWidth={1.75} />Recordings to review</h2>
          <p className="text-ed-muted mt-2 text-[14.5px]">Listen to calls with their AI summaries. Narrow the list with the report filters above — employee, direction, or a phone number.</p>
        </header>
        <div className="p-6 max-sm:p-4">
          {rows.length === 0 ? (
            <div className="text-ed-muted rounded-xl border border-dashed border-[#d9d5e2] px-6 py-12 text-center text-[14.5px]">No recordings are ready for this range.</div>
          ) : (
            <ul className="space-y-3">
              {rows.map((r) => (
                <li key={r.id} className="border-ed-line rounded-xl border p-4 text-[14px]">
                  <div className="flex flex-wrap items-center justify-between gap-2"><b>{r.phone}</b><span className="text-ed-muted">{r.at} · {r.employee}</span></div>
                  <p className="text-ed-muted mt-1">{r.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
