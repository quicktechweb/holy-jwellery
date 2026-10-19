'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Lightbulb, Link2, ShieldCheck, Sparkles } from 'lucide-react';
import { Card } from '@/components/dashboard/Card';
import { cn } from '@/lib/utils';
import { ADS_ROUTES } from './brand';

function Tabs({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (t: string) => void }) {
  return (
    <div className="border-ed-line flex flex-wrap gap-1 border-b">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            '-mb-px border-b-2 px-4 py-3 text-[14px] transition',
            t === value ? 'border-ed-brand text-ed-brand font-medium' : 'text-ed-text/70 hover:text-ed-brand border-transparent',
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <header>
      <h1 className="text-[24px] leading-tight font-medium tracking-tight">{title}</h1>
      <p className="text-ed-text/65 mt-1 text-[14px]">{sub}</p>
    </header>
  );
}

const Empty = ({ children }: { children: ReactNode }) => (
  <Card className="text-ed-muted px-6 py-12 text-center text-[14px]">{children}</Card>
);

/* ---------------- Meta ---------------- */
const metaTabs = ['Summary', 'Ad Performance', 'Campaign Quality', 'Account Limits', 'Expenses', 'Order Analysis', 'Hourly Analysis', 'Estimated Profit', 'Settings'];
export function MetaAds() {
  const [tab, setTab] = useState('Summary');
  const [p, setP] = useState('Today');
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h2 className="text-[17px] font-medium">Meta Ads Expense Report</h2>
        <p className="text-ed-muted text-[13px]">View and analyze expenses from all Meta Ads accounts</p>
      </Card>
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Head title="Meta Ads Report" sub="Campaign data, quality, spend, and product mapping." />
          <button type="button" className="bg-ed-brand inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[14px] font-medium text-white">
            <Sparkles className="size-4" /> Ask AI to optimize
          </button>
        </div>
        <div className="mt-4"><Tabs tabs={metaTabs} value={tab} onChange={setTab} /></div>
        {tab === 'Summary' ? (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="bg-ed-bg flex rounded-lg p-1">
                {['Today', 'Yest.', '30D'].map((x) => (
                  <button key={x} type="button" onClick={() => setP(x)} className={cn('rounded-md px-3 py-1.5 text-[13px]', p === x ? 'bg-ed-brand text-white' : 'text-ed-muted')}>{x}</button>
                ))}
              </div>
              {['Sync Today', 'Sync Last 7 Days', 'Custom Sync', 'Go to Expenses'].map((b) => (
                <button key={b} type="button" className="border-ed-line hover:bg-ed-bg h-10 rounded-lg border px-3.5 text-[13.5px]">{b}</button>
              ))}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[['Total Expense (USD)', '$0.00'], ['Total Expense (BDT)', '0'], ['Accounts', '0'], ['Spending Limits', '$0.00']].map(([a, b]) => (
                <Card key={a} className="p-5">
                  <p className="text-[16px] font-medium">{a}</p>
                  <p className="text-ed-blue mt-4 text-[17px]">{b}</p>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-4"><Empty>No data in “{tab}” yet. Connect a Meta ad account to get started.</Empty></div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- TikTok ---------------- */
export function TikTokAds() {
  const [tab, setTab] = useState('Instructions');
  return (
    <div className="space-y-5">
      <Head title="TikTok Ads" sub="Connect your TikTok advertiser account and manage campaigns, expenses, and results — all in one place." />
      <Tabs tabs={['Instructions', 'Connection', 'Campaigns', 'Expenses', 'Actual Results']} value={tab} onChange={setTab} />
      {tab !== 'Instructions' ? (
        <Empty>Connect TikTok first to see {tab.toLowerCase()}.</Empty>
      ) : (
        <>
          <Card className="bg-ed-brand-soft/40 flex gap-3 p-5">
            <Lightbulb className="text-ed-muted mt-0.5 size-5" />
            <div>
              <p className="font-medium">TikTok Ads Integration</p>
              <p className="text-ed-text/70 text-[14px]">Connect your TikTok advertiser accounts through EcomDrive’s shared TikTok app and browse campaign performance directly from the integrations page.</p>
            </div>
          </Card>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <p className="flex items-center gap-2 font-medium"><ShieldCheck className="size-4" /> Before You Connect</p>
              <p className="text-ed-muted mt-1 text-[13.5px]">EcomDrive uses its own approved TikTok API for Business app. Your team only needs to authorize access from TikTok.</p>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px]">
                <li>Make sure the TikTok account you want to use has access to the advertiser accounts you expect to see.</li>
                <li>When asked in TikTok, approve the authorization for the EcomDrive app.</li>
                <li>After approval, EcomDrive will sync every advertiser account exposed by that authorization.</li>
                <li>For Actual Results, use ID-based TikTok landing UTMs so orders can map back to campaigns, ad groups, and ads.</li>
              </ol>
              <div className="border-ed-line mt-4 rounded-lg border p-3">
                <p className="text-ed-muted text-[11px] uppercase">Redirect URI</p>
                <code className="text-[12px]">https://1.ecomdrivebd.com/api/integrations/tiktok/callback</code>
              </div>
              <a href="https://business-api.tiktok.com/portal/docs" target="_blank" rel="noreferrer" className="border-ed-line hover:bg-ed-bg mt-4 flex h-11 items-center justify-center gap-2 rounded-lg border text-[14px]">
                <ExternalLink className="size-4" /> Open TikTok Business API Docs
              </a>
            </Card>
            <Card className="p-5">
              <p className="flex items-center gap-2 font-medium"><Link2 className="size-4" /> Connect Flow</p>
              <p className="text-ed-muted mt-1 text-[13.5px]">This integration uses TikTok’s advertiser authorization flow.</p>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px]">
                <li>Click <b>Connect TikTok</b>.</li>
                <li>Approve the advertiser authorization in TikTok.</li>
                <li>After redirect, the app exchanges the auth code, stores the business authorization token, and syncs advertiser accounts automatically.</li>
                <li>Open the Campaigns tab to see all synced campaigns and metrics.</li>
                <li>Open Actual Results after syncing analytics to compare modeled and direct attributed performance.</li>
              </ol>
              <div className="border-ed-line mt-4 rounded-lg border p-3">
                <p className="text-ed-muted text-[11px] uppercase">Recommended TikTok landing URL tags</p>
                <code className="text-[12px] break-all">utm_source=tiktok&amp;utm_campaign={'{{campaign_id}}'}&amp;utm_term={'{{adgroup_id}}'}&amp;utm_content={'{{ad_id}}'}</code>
              </div>
              <button type="button" onClick={() => setTab('Connection')} className="bg-ed-brand mt-4 h-10 rounded-lg px-4 text-[14px] font-medium text-white">Connect TikTok</button>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Google ---------------- */
export function GoogleAds() {
  const [tab, setTab] = useState('Overview');
  return (
    <div className="space-y-5">
      <Head title="Google Ads" sub="Reporting, expenses, and EcomDrive Actual Results for selected Google Ads customer accounts." />
      <Tabs tabs={['Overview', 'Ads Data', 'Actual Results', 'Expenses', 'Settings']} value={tab} onChange={setTab} />
      {tab === 'Settings' ? (
        <Card className="p-6">
          <p className="font-medium">Connect Google Ads</p>
          <p className="text-ed-muted mt-1 text-[14px]">Authorize EcomDrive to read your Google Ads customer accounts.</p>
          <button type="button" className="bg-ed-brand mt-4 h-10 rounded-lg px-4 text-[14px] font-medium text-white">Connect Google Ads</button>
        </Card>
      ) : (
        <Card className="flex gap-3 p-5">
          <AlertCircle className="text-ed-muted mt-0.5 size-5" />
          <div>
            <p className="font-medium">Google Ads is not connected</p>
            <p className="text-ed-text/70 text-[14px]">
              Connect Google Ads from{' '}
              <button type="button" onClick={() => setTab('Settings')} className="text-ed-brand underline">Settings</button>{' '}
              before opening report data.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------------- Ad Profit Analysis ---------------- */
export function AdProfit() {
  return (
    <div className="space-y-5">
      <Head title="Ad Profit Analysis" sub="Revenue, cost and ad spend — true profit per channel." />
      <Empty>
        <CheckCircle2 className="mx-auto mb-3 size-8 opacity-50" />
        Connect an ad account on the <Link href={ADS_ROUTES.dashboard} className="text-ed-brand underline">Ads Dashboard</Link> to see profit analysis.
      </Empty>
    </div>
  );
}
