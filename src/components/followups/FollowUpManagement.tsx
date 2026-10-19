'use client';

import { BadgeX, FileText, HelpCircle, Layers, ListFilter, RefreshCw, Settings2, ShoppingCart, UserSquare2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ByStatusTab } from './ByStatusTab';
import { BlacklistTab, FaqTab } from './MoreTabs';
import { AudienceTab, BatchesTab, EmployeeProfileTab, ScriptsTab, SettingsTab } from './OtherTabs';

const tabs = [
  { id: 'status', label: 'Follow-ups by Status', icon: ShoppingCart },
  { id: 'audience', label: 'Audience', icon: ListFilter },
  { id: 'profile', label: 'Assigned Employee Profile', icon: UserSquare2 },
  { id: 'batches', label: 'Assignment Batches', icon: RefreshCw },
  { id: 'scripts', label: 'Call Scripts', icon: FileText },
  { id: 'faq', label: 'FAQ Management', icon: HelpCircle },
  { id: 'blacklist', label: 'Blacklist Management', icon: BadgeX },
  { id: 'settings', label: 'Settings', icon: Settings2 },
] as const;
type Id = (typeof tabs)[number]['id'];

export function FollowUpManagement() {
  const [tab, setTab] = useState<Id>('status');
  return (
    <div className="pt-4">
      <nav aria-label="Follow-up sections" className="border-ed-line mb-4 flex overflow-x-auto border-b">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}
            className={cn('-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-[14.5px] font-medium whitespace-nowrap transition-colors', tab === id ? 'border-ed-brand text-ed-brand' : 'text-ed-text/75 hover:text-ed-brand border-transparent')}>
            <Icon className="size-4" />{label}
          </button>
        ))}
      </nav>
      {tab === 'status' && <ByStatusTab />}
      {tab === 'audience' && <AudienceTab />}
      {tab === 'profile' && <EmployeeProfileTab />}
      {tab === 'batches' && <BatchesTab />}
      {tab === 'scripts' && <ScriptsTab />}
      {tab === 'faq' && <FaqTab />}
      {tab === 'blacklist' && <BlacklistTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  );
}
