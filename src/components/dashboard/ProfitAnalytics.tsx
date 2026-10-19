'use client';

import { useEffect, useState, type PointerEvent } from 'react';
import { CircleHelp } from 'lucide-react';
import { profitRanges, profitSeries } from '@/data/dashboard';
import { Card } from './Card';
import { useWidth } from './charts';
import { Dropdown } from './Dropdown';

// legend + tooltip order
const ORDER = ['adSpend', 'courierCost', 'netProfit', 'productCost', 'revenue'] as const;
const seriesByKey = Object.fromEntries(profitSeries.map((s) => [s.key, s]));

// demo data: pore API theke ene replace korben
const valueOf = (_label: string, _key: string) => 0;
const money = (n: number) => `৳${n.toLocaleString('en-US')}`;

export function ProfitAnalytics() {
  const [by, setBy] = useState('Day');
  const [hover, setHover] = useState<number | null>(null);
  const labels = profitRanges[by];
  const [ref, width] = useWidth<HTMLDivElement>();

  // touch: tooltip tap-e thake, chart-er baire tap korle bondho hoy
  useEffect(() => {
    if (hover === null) return;
    const onDown = (e: globalThis.PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setHover(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [hover, ref]);

  const H = width < 560 ? 230 : 280;
  const L = 44;
  const R = 16;
  const T = 14;
  const B = 34;
  const plotW = Math.max(width - L - R, 10);
  const plotH = H - T - B;
  const ticks = [4, 3, 2, 1, 0];
  const step = Math.ceil(labels.length / 6);
  const xAt = (i: number) => L + ((i + 0.5) / labels.length) * plotW;
  const yAt = (v: number) => T + (1 - v / 4) * plotH;

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < L || x > L + plotW) return setHover(null);
    setHover(Math.min(labels.length - 1, Math.floor(((x - L) / plotW) * labels.length)));
  };

  // tooltip flips to the left side near the right edge
  const tipX = hover === null ? 0 : xAt(hover);
  const flip = tipX > width - 200;

  return (
    <Card className="rounded-2xl sm:rounded-xl">
      <div className="border-ed-line flex items-center justify-between gap-3 border-b px-6 py-3.5">
        <h2 className="text-[22px] font-medium sm:text-[17px]">Profit Analytics</h2>
        <div className="flex items-center gap-3">
          <span className="text-ed-muted text-sm max-sm:hidden">Show by</span>
          <Dropdown
            options={Object.keys(profitRanges)}
            onChange={(v) => {
              setBy(v);
              setHover(null);
            }}
            className="[&>button]:h-9 [&>button]:min-w-24 [&>button]:justify-between [&>button]:shadow-none sm:[&>button]:min-w-28"
          />
          <CircleHelp className="text-ed-muted size-4" aria-label="Help" />
        </div>
      </div>

      <div ref={ref} className="relative px-3 pt-4 pb-5 sm:px-6">
        <svg
          width={width || undefined}
          viewBox={`0 0 ${Math.max(width, 280)} ${H}`}
          height={H}
          className="block touch-pan-y"
          role="img"
          aria-label="Profit analytics chart"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={L}
                x2={L + plotW}
                y1={yAt(t)}
                y2={yAt(t)}
                stroke="#e4e0ec"
                strokeDasharray="3 4"
              />
              <text
                x={L - 10}
                y={yAt(t) + 3.5}
                textAnchor="end"
                fontSize="10"
                fill="#8b869a"
              >
                ৳{t}
              </text>
            </g>
          ))}

          {labels.map((l, i) =>
            i % step === 0 ? (
              <text
                key={l}
                x={xAt(i)}
                y={H - 10}
                textAnchor="middle"
                fontSize="11"
                fill="#6e6980"
              >
                {l}
              </text>
            ) : null,
          )}

          {hover !== null && (
            <line
              x1={xAt(hover)}
              x2={xAt(hover)}
              y1={T}
              y2={yAt(0)}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          )}

          {profitSeries.map((s) => (
            <g key={s.key}>
              {labels.length > 1 && (
                <polyline
                  points={labels
                    .map((l, i) => `${xAt(i)},${yAt(valueOf(l, s.key))}`)
                    .join(' ')}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="1.5"
                />
              )}
              {labels.map((l, i) => (
                <circle
                  key={l}
                  cx={xAt(i)}
                  cy={yAt(valueOf(l, s.key))}
                  r="3"
                  fill={hover === i ? s.color : '#fff'}
                  stroke={s.color}
                  strokeWidth="1.5"
                />
              ))}
            </g>
          ))}
        </svg>

        {hover !== null && (
          <div
            className="border-ed-line pointer-events-none absolute z-10 rounded-lg border bg-white px-3 py-2 text-sm shadow-lg"
            style={{
              top: T + 4 + 16,
              left: flip ? undefined : tipX + 12 + 12,
              right: flip ? width - tipX + 12 - 12 : undefined,
            }}
          >
            <p className="text-ed-text mb-1 font-medium">{labels[hover]}</p>
            {ORDER.map((k) => (
              <p
                key={k}
                className="leading-6 whitespace-nowrap"
                style={{ color: seriesByKey[k].color }}
              >
                {k} : {money(valueOf(labels[hover], k))}
              </p>
            ))}
          </div>
        )}

        <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs">
          {ORDER.map((k) => (
            <li
              key={k}
              className="flex items-center gap-1.5"
              style={{ color: seriesByKey[k].color }}
            >
              <span
                className="size-3 rounded-full"
                style={{ background: seriesByKey[k].color }}
              />
              {k}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
