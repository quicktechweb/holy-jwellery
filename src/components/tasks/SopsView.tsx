import { CheckSquare, Sparkles } from 'lucide-react';

export function SopsView() {
  return (
    <div className="mx-auto w-full max-w-[1024px] px-2 pt-6">
      <section className="rounded-[26px] px-6 py-6 text-white shadow-[0_8px_24px_rgba(60,20,120,0.25)]" style={{ background: 'linear-gradient(100deg,#6a1fb8 0%,#43228f 45%,#1b1a4b 100%)' }}>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-medium"><Sparkles className="size-3" />Daily Operations Checklist</span>
        <h1 className="mt-3 text-[26px] leading-tight font-bold tracking-tight">My SOPs &amp; Compliance</h1>
        <p className="mt-1 max-w-[560px] text-[14.5px] leading-snug text-white/75">Acknowledge new standard procedures and complete your daily checklists to ensure consistent merchant service quality.</p>
      </section>

      <section className="border-ed-line mt-5 flex min-h-[288px] flex-col items-center justify-center rounded-2xl border border-dashed bg-white px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-[#f4f3f7] text-[#4b5160]"><CheckSquare className="size-5" /></span>
        <h2 className="mt-5 text-[18px] font-semibold">No SOPs Assigned</h2>
        <p className="text-ed-text/65 mt-1 max-w-[360px] text-[14px] leading-snug">You do not have any published SOPs assigned to your departments or business-wide yet.</p>
      </section>
    </div>
  );
}
