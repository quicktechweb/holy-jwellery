import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { overviewKpis, type DeltaTone } from '@/data/dashboard';
import { cn } from '@/lib/utils';
import { Card } from './Card';

const tones: Record<DeltaTone, { text: string; down: boolean }> = {
  up: { text: 'text-ed-muted', down: false },
  bad: { text: 'text-ed-red', down: true },
  good: { text: 'text-ed-green', down: true },
  down: { text: 'text-ed-text/70', down: true },
};

export function OverviewKpis() {
  return (
    <section aria-labelledby="main-numbers">
      <h2 id="main-numbers" className="text-ed-muted mb-3 text-sm font-medium">
        Main Numbers
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {overviewKpis.map((k) => {
          const tone = tones[k.tone];
          const Arrow = tone.down ? ArrowDownRight : ArrowUpRight;
          return (
            <Card key={k.title} className="rounded-2xl p-4 sm:rounded-xl">
              <h3 className="text-ed-muted sm:text-ed-text/80 truncate text-[15px]">
                {k.title}
              </h3>
              <p className="mt-2 text-[26px] leading-tight font-medium sm:text-[28px]">
                <span className="decoration-ed-muted/60 underline decoration-dotted underline-offset-[6px]">
                  {k.value}
                </span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span
                  className={cn('flex items-center gap-1 text-sm font-medium', tone.text)}
                >
                  <Arrow className="size-3.5" />
                  {k.delta}
                </span>
                <span className="text-ed-muted text-xs">Previous {k.previous}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
