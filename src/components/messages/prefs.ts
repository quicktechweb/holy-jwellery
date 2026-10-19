'use client';

import { useCallback, useEffect, useState } from 'react';

export type InboxSort = 'longest' | 'newest' | 'unread';

export interface InboxPrefs {
  sort: InboxSort;
  sound: boolean;
  browserAlerts: boolean;
  sendInvoice: boolean;
  sendMessage: boolean;
}

export const defaultPrefs: InboxPrefs = {
  sort: 'newest',
  sound: false,
  browserAlerts: false,
  sendInvoice: true,
  sendMessage: false,
};

const KEY = 'ecomdrive:inbox-prefs';

/** Inbox preference gulo localStorage e save hoy, reload dileo thake */
export function useInboxPrefs() {
  const [prefs, setPrefs] = useState<InboxPrefs>(defaultPrefs);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPrefs({ ...defaultPrefs, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  const update = useCallback((patch: Partial<InboxPrefs>) => {
    setPrefs((cur) => {
      const next = { ...cur, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return [prefs, update] as const;
}

/** Sound on korle ekta soft chime baje (preview) */
export function playChime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const now = ctx.currentTime;
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.45);
    });
    setTimeout(() => ctx.close(), 900);
  } catch {
    /* ignore */
  }
}
