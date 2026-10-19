import { ordersFor, type WebOrder, type WebStatus } from '@/data/webOrders';

export const AUTO_PATH = '/dashboard/orders/auto';
const TOGGLE_KEY = 'ed.auto.openNext';
const TAKEN_KEY = 'ed.auto.taken';
const cursorKey = (s: string) => `ed.auto.cursor.${s}`;

export type QueueKey = Exclude<WebStatus, 'ALL' | 'APPROVED' | 'CANCEL'>;

/** dashboard er queue card gulo (count = screenshot er moto) */
export const queues: { key: QueueKey; label: string; count: number }[] = [
  { key: 'PROCESSING', label: 'Processing', count: 14 },
  { key: 'INCOMPLETE', label: 'Incomplete', count: 6926 },
  { key: 'GOOD_BUT_NO_RESPONSE', label: 'Good But No Response', count: 5 },
  { key: 'NO_RESPONSE', label: 'No Response', count: 0 },
  { key: 'ADVANCE_PAYMENT', label: 'Advance Payment', count: 66 },
  { key: 'ON_HOLD', label: 'On Hold', count: 141 },
];

export const isQueueKey = (v: string | null | undefined): v is QueueKey =>
  !!v && queues.some((q) => q.key === v);

const read = (k: string) => {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    window.localStorage.setItem(k, v);
  } catch {
    /* storage blocked - ignore */
  }
};

export const getAutoNext = () => read(TOGGLE_KEY) !== 'off';
export const setAutoNext = (on: boolean) => write(TOGGLE_KEY, on ? 'on' : 'off');
export const getTaken = () => Number(read(TAKEN_KEY)) || 0;

/** Queue theke porer order. Round-robin cursor; skipId = ekhon jeta khola ache. */
export function takeNext(status: QueueKey, skipId?: string): WebOrder | undefined {
  const q = ordersFor(status);
  if (!q.length) return undefined;
  if (q.length === 1 && q[0].id === skipId) return undefined;
  let i = (Number(read(cursorKey(status))) || 0) % q.length;
  if (q[i].id === skipId) i = (i + 1) % q.length;
  write(cursorKey(status), String((i + 1) % q.length));
  write(TAKEN_KEY, String(getTaken() + 1));
  return q[i];
}

export const autoOrderHref = (id: string, status: QueueKey) =>
  `/dashboard/orders/web/${id}?openBy=autoOpen&queueStatus=${status}`;
