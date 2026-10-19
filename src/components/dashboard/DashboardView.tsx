'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Hammer } from 'lucide-react';
import { dashboardTabs } from '@/config/dashboard';
import { EmptyState } from './Card';
import { DashboardHeader } from './DashboardHeader';
import { MyDashboard } from './MyDashboard';
import { Operations } from './Operations';
import { Overview } from './Overview';

const slug = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function DashboardView() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const view = params.get('view');
  const active = dashboardTabs.find((t) => slug(t) === view) ?? dashboardTabs[0];

  const onChange = (tab: string) => {
    const url = tab === dashboardTabs[0] ? pathname : `${pathname}?view=${slug(tab)}`;
    router.replace(url, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <DashboardHeader active={active} onChange={onChange} />
      {active === 'My Dashboard' && <MyDashboard />}
      {active === 'Overview' && <Overview />}
      {active === 'Operations' && <Operations />}
      {!['My Dashboard', 'Overview', 'Operations'].includes(active) && (
        <EmptyState
          className="h-72 bg-white"
          icon={<Hammer className="size-5" />}
          title={`${active} is coming soon`}
          description="This view is being built and will appear here."
        />
      )}
    </div>
  );
}
