'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setPending, usePending } from '@/lib/navState';

/** Internal link click korle top e progress bar chole - page ashar aagei feedback pawa jay */
export function NavProgress() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const pending = usePending();
  const [bar, setBar] = useState({ w: 0, show: false });
  const key = `${pathname}?${sp.toString()}`;

  // click capture (Next Link nijer preventDefault korar aage dhore)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-no-progress')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname + url.search === window.location.pathname + window.location.search) return;
      setPending(url.pathname + url.search);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // route bodlale pending clear
  useEffect(() => { setPending(null); }, [key]);

  useEffect(() => {
    if (pending) {
      setBar({ w: 12, show: true });
      const t = setInterval(() => setBar((b) => ({ ...b, w: b.w + (92 - b.w) * 0.1 })), 150);
      const kill = setTimeout(() => setPending(null), 10000); // safety: kokhono atke thakbe na
      return () => { clearInterval(t); clearTimeout(kill); };
    }
    setBar((b) => (b.show ? { w: 100, show: true } : b));
    const h = setTimeout(() => setBar({ w: 0, show: false }), 250);
    return () => clearTimeout(h);
  }, [pending]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[60] h-[3px] w-full">
      <div
        className="bg-ed-brand h-full shadow-[0_0_8px_rgba(63,19,85,0.55)] transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${bar.w}%`, opacity: bar.show ? 1 : 0 }}
      />
    </div>
  );
}
