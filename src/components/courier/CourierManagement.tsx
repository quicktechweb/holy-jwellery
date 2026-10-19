'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart3, ClipboardList, FlaskConical, Package, RotateCcw, Settings, Tag, Undo2, X, Plus, Copy } from 'lucide-react';
import { parcelFilters, type FilterKey } from '@/data/courier';
import { returnTagNames } from '@/data/courierTags';
import { cn } from '@/lib/utils';
import { Btn, LinkBtn, Modal } from './ui';
import { BookOpen } from 'lucide-react';
import { useParcelStore } from './store';
import { ParcelsView } from './ParcelsView';
import { CourierEntry, CourierSettings, ReturnAnalysis, ReturnManagement } from './BetaViews';

const tabs = [
  { key: 'parcels', label: 'All Parcels', icon: Package },
  { key: 'returns', label: 'Return Management', icon: RotateCcw },
  { key: 'return-analysis', label: 'Return Analysis', icon: BarChart3 },
  { key: 'courier-entry', label: 'Courier Entry', icon: ClipboardList },
  { key: 'settings', label: 'Courier Settings', icon: Settings },
] as const;
type TabKey = (typeof tabs)[number]['key'];

export function CourierManagement() {
  const router = useRouter();
  const params = useSearchParams();
  const tabParam = params.get('tab') as TabKey | null;
  const beta = !!tabParam && tabs.some((t) => t.key === tabParam);
  const tab: TabKey = beta ? tabParam! : 'parcels';
  const filter = (parcelFilters.find((f) => f.key === params.get('parcelFilter'))?.key ?? 'IN_TRANSIT') as FilterKey;

  const store = useParcelStore();
  const [tags, setTags] = useState<string[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const go = (qs: string) => router.push(`?${qs}`, { scroll: false });
  const goTab = (k: TabKey) => go(k === 'parcels' && !beta ? `parcelFilter=${filter}` : `tab=${k}`);

  const copyDebug = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify({ tab, filter, tags, at: new Date().toISOString() }, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };

  const nav = (
    <div role="tablist" className={cn('flex flex-wrap gap-1.5', beta ? 'mt-5 px-1' : 'pt-4')}>
      {tabs.map((t) => {
        const on = t.key === tab;
        const Icon = t.icon;
        return (
          <button key={t.key} role="tab" aria-selected={on} type="button" onClick={() => goTab(t.key)}
            className={cn('flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13.5px] transition', on ? 'bg-ed-brand-soft text-ed-brand border-ed-brand/15 border shadow-sm' : 'text-ed-text/70 hover:text-ed-brand border border-transparent')}>
            <Icon className="size-3.5" /> {t.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div>
      {!beta && nav}
      <div className="mx-auto max-w-[1354px]">
        <header className={cn('flex flex-wrap items-start justify-between gap-4', beta ? 'pt-7' : 'pt-6')}>
          <div>
            <h1 className="flex items-center gap-2.5 text-[24px] leading-tight font-medium tracking-tight">
              Courier Management
              {beta && <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">Beta</span>}
            </h1>
            <p className="text-ed-text/70 mt-1 text-[13.5px]">{beta ? 'The rebuilt courier surface. Only you can see this.' : 'Track and manage parcels in transit, returns, and cancellations'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {beta ? (
              <>
                <Btn onClick={() => go(`parcelFilter=${filter}`)}><Undo2 className="size-4" /> Back to stable</Btn>
                <Btn onClick={copyDebug}><Copy className="size-4" /> {copied ? 'Copied!' : 'Copy debug log'}</Btn>
              </>
            ) : (
              <Btn onClick={() => go('tab=parcels')}><FlaskConical className="size-4" /> Switch to Beta</Btn>
            )}
            <Btn onClick={() => setTagsOpen(true)}><Tag className="size-4" /> Manage Tags</Btn>
            <LinkBtn href="/dashboard/orders/courier-management/guide#delivery-assignment"><BookOpen className="size-4" /> Guide</LinkBtn>
          </div>
        </header>

        {beta && nav}

        {tab === 'parcels' && <ParcelsView store={store} custom={tags} filter={filter} onFilter={(f) => go(beta ? `tab=parcels&parcelFilter=${f}` : `parcelFilter=${f}`)} />}
        {tab === 'returns' && <ReturnManagement tags={[...returnTagNames, ...tags]} />}
        {tab === 'return-analysis' && <ReturnAnalysis />}
        {tab === 'courier-entry' && <CourierEntry />}
        {tab === 'settings' && <CourierSettings />}
      </div>

      {tagsOpen && <TagsModal tags={tags} setTags={setTags} onClose={() => setTagsOpen(false)} />}
    </div>
  );
}

function TagsModal({ tags, setTags, onClose }: { tags: string[]; setTags: (t: string[]) => void; onClose: () => void }) {
  const [v, setV] = useState('');
  const add = () => {
    const t = v.trim();
    if (t && !tags.some((x) => x.toLowerCase() === t.toLowerCase())) setTags([...tags, t]);
    setV('');
  };
  return (
    <Modal title="Manage Tags" onClose={onClose}>
      <div className="flex gap-2">
        <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="New tag name" className="border-ed-line focus:border-ed-brand/40 h-10 flex-1 rounded-lg border px-3 text-[13.5px] outline-none" />
        <Btn primary onClick={add} disabled={!v.trim()}><Plus className="size-4" /> Add</Btn>
      </div>
      <ul className="mt-4 max-h-[320px] space-y-1.5 overflow-y-auto">
        {tags.map((t) => (
          <li key={t} className="border-ed-line flex items-center justify-between rounded-lg border px-3 py-2 text-[13.5px]">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-ed-red"><X className="size-4" /></button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
