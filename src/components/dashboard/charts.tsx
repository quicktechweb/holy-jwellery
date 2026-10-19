'use client';

import { useEffect, useRef, useState } from 'react';
import { hours } from '@/data/dashboard';

/* ---------------- Donut ---------------- */
interface Segment {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  segments,
  size = 200,
  thickness = 40,
  className,
}: {
  segments: Segment[];
  size?: number;
  thickness?: number;
  className?: string;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Total ${total}`}
      className={`-rotate-90 ${className ?? ''}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#eeebf3"
        strokeWidth={thickness}
      />
      {segments.map((s) => {
        const len = total ? (s.value / total) * c : 0;
        const el = (
          <circle
            key={s.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

/* ---------------- Bar ---------------- */
export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const top = Math.ceil(max / 25) * 25;

  return (
    <div>
      <div className="relative h-56">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-ed-line/70 absolute inset-x-0 border-t"
            style={{ top: `${i * 25}%` }}
          />
        ))}
        <div className="relative flex h-full items-end">
          {data.map((d) => (
            <div
              key={d.label}
              className="group relative flex h-full flex-1 items-end justify-center"
            >
              <div className="bg-ed-bg/70 absolute inset-0 hidden group-hover:block" />
              <div
                className="bg-ed-blue relative w-[78%] rounded-t-[3px]"
                style={{ height: `${(d.value / top) * 100}%` }}
              />
              <div className="bg-ed-text pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-md px-2 py-1 text-[11px] whitespace-nowrap text-white group-hover:block">
                {d.label}: {d.value}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex">
        {data.map((d, i) => (
          <div key={d.label} className="flex flex-1 justify-center">
            <span className="text-ed-muted relative text-[11px] whitespace-nowrap">
              <span className="max-sm:hidden">
                {data.length <= 7 || i % 2 === 1 ? d.label : ''}
              </span>
              <span className="sm:hidden">
                {data.length <= 7 || i % 7 === 1 ? d.label : ''}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Area (hourly) ---------------- */
const H = 150;
const X0 = 34;
const Y0 = 8;
const Y1 = 126;

export function useWidth<T extends HTMLElement>(initial = 640) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    setW(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function series(fn: (h: number) => number, x1: number) {
  const pts: [number, number][] = [];
  for (let h = 0; h <= 23; h += 0.25) {
    const x = X0 + (h / 23) * (x1 - X0);
    const y = Y1 - fn(h) * (Y1 - Y0);
    pts.push([x, y]);
  }
  const line = pts
    .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  const area = `${line} L${x1},${Y1} L${X0},${Y1} Z`;
  return { line, area };
}

export function HourlyChart({ focus }: { focus: 'Today' | 'Yesterday' }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  // mobile (<sm): real pixel size, readable text; desktop: original 640 viewBox scaled
  const mobile = width < 560;
  const W = mobile ? Math.max(width, 240) : 640;
  const X1 = W - (mobile ? 22 : 12);
  const today = series((h) => Math.exp(-((h - 10) ** 2) / (2 * 0.55 ** 2)), X1);
  const yesterday = series((h) => Math.exp(-(h ** 2) / (2 * 0.45 ** 2)), X1);
  const yTicks = [
    ['1', 0],
    ['.75', 0.25],
    ['.5', 0.5],
    ['.25', 0.75],
    ['0', 1],
  ] as const;
  // mobile: 12 AM, 3 AM ... 6 PM, 11 PM
  const showHour = (i: number) => (mobile ? (i % 3 === 0 && i <= 18) || i === 23 : true);
  const label = (h: string) => (mobile ? h.replace(/(AM|PM)/, ' $1') : h);

  return (
    <div ref={ref} className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={mobile ? W : undefined}
        height={mobile ? H : undefined}
        className={mobile ? 'block' : 'h-auto w-full'}
        role="img"
        aria-label="Hourly orders"
      >
        {yTicks.map(([t, f]) => {
          const y = Y0 + f * (Y1 - Y0);
          return (
            <g key={t}>
              <line x1={X0} x2={X1} y1={y} y2={y} stroke="#eeebf3" />
              <text
                x={X0 - 6}
                y={y + 3}
                textAnchor="end"
                fontSize={mobile ? 10 : 8}
                fill="#6e6980"
              >
                {t}
              </text>
            </g>
          );
        })}

        <path
          d={yesterday.area}
          fill="#9ca3af"
          opacity={focus === 'Yesterday' ? 0.45 : 0.25}
        />
        <path d={yesterday.line} fill="none" stroke="#9ca3af" strokeDasharray="2 2" />
        <path d={today.area} fill="#2fb36d" opacity={focus === 'Today' ? 0.55 : 0.25} />
        <path d={today.line} fill="none" stroke="#2fb36d" strokeWidth="1.2" />

        {hours.map((h, i) =>
          showHour(i) ? (
            <text
              key={h}
              x={X0 + (i / 23) * (X1 - X0)}
              y={H - 8}
              textAnchor="middle"
              fontSize={mobile ? 10 : 7.5}
              fill="#6e6980"
            >
              {label(h)}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
