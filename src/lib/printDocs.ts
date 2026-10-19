import type { ApprovedOrder } from '@/data/approvedOrders';

export const BUSINESS = {
  name: 'Elishine',
  phone: '01725397048',
  address: 'mirpur borobag bosoti houseing road get no 5 house 10/1',
};

/* ───────────────────────── Code 128 (set B) barcode ───────────────────────── */

// bar/space widths for symbols 0..106 (106 = stop)
const PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];

export function code128Widths(text: string): number[] {
  const clean = [...text].map((c) => (c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126 ? c : '-')).join('');
  const codes: number[] = [104]; // Start B
  let sum = 104;
  [...clean].forEach((ch, i) => {
    const v = ch.charCodeAt(0) - 32;
    codes.push(v);
    sum += v * (i + 1);
  });
  codes.push(sum % 103, 106);
  return codes.flatMap((c) => PATTERNS[c].split('').map(Number));
}

export function code128Svg(text: string, opts: { module?: number; height?: number } = {}): string {
  const mod = opts.module ?? 1.5;
  const height = opts.height ?? 34;
  const quiet = 10;
  const widths = code128Widths(text);
  const total = widths.reduce((a, b) => a + b, 0) + quiet * 2;
  let x = quiet;
  let bars = '';
  widths.forEach((w, i) => {
    if (i % 2 === 0) bars += `<rect x="${x * mod}" y="0" width="${w * mod}" height="${height}"/>`;
    x += w;
  });
  const W = +(total * mod).toFixed(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}" shape-rendering="crispEdges" fill="#000">${bars}</svg>`;
}

/* ───────────────────────── helpers ───────────────────────── */

const esc = (v: string | number) =>
  String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n: number) => String(n).padStart(2, '0');
/** Dhaka time (UTC+6) */
const dhaka = (ts: number) => new Date(ts + 6 * 3_600_000);
const shortDate = (ts: number) => {
  const d = dhaka(ts);
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${String(d.getUTCFullYear()).slice(2)}`;
};
const longDate = (ts: number) => {
  const d = dhaka(ts);
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
};
const money = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/** Hidden iframe e print kore — notun window/tab khole na, tai pichone app ta thakbe (popup block o hoy na) */
function openPrintWindow(title: string, css: string, body: string): boolean {
  if (typeof document === 'undefined') return false;
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;';
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    return false;
  }
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}</style></head><body>${body}</body></html>`);
  doc.close();

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    frame.remove();
  };
  const imgs = Array.from(doc.images);
  const ready = Promise.all(
    imgs.map((im) => (im.complete ? Promise.resolve() : new Promise<void>((r) => { im.onload = im.onerror = () => r(); }))),
  );
  void Promise.race([ready, new Promise((r) => setTimeout(r, 2500))]).then(() => {
    setTimeout(() => {
      win.addEventListener('afterprint', () => setTimeout(cleanup, 300));
      win.focus();
      win.print();
      setTimeout(cleanup, 120_000); // fallback
    }, 150);
  });
  return true;
}

const baseCss = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: Arial, Helvetica, 'Noto Sans Bengali', sans-serif; color: #111; font-size: 11px;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
`;

/* ───────────────────────── invoice ───────────────────────── */

const invoiceCss = `${baseCss}
.page { width: 100%; height: 296mm; padding: 14mm 15mm; break-after: page; overflow: hidden; }
.page:last-child { break-after: auto; }
.top { display: flex; align-items: center; justify-content: space-between; }
.brand { font-size: 20px; font-weight: 700; letter-spacing: .2px; }
.badge { background: #1b2540; color: #fff; font-size: 17px; padding: 10px 16px; border-radius: 7px; letter-spacing: .5px; }
hr { border: 0; border-top: 1px solid #d9d9de; margin: 12px 0 16px; }
.meta { display: grid; grid-template-columns: 1fr 1.25fr 1fr; gap: 18px; line-height: 1.5; font-size: 12.5px; }
.meta b { font-weight: 700; }
.meta .lbl { font-size: 12.5px; margin-bottom: 1px; }
.inv { text-align: left; }
.inv .bc { margin-top: 6px; }
.inv .code { margin: 2px 0 0 24px; font-size: 15px; letter-spacing: 1.5px; font-weight: 500; }
table.items { width: 100%; border-collapse: collapse; margin-top: 20px; }
table.items th { background: #1b2540; color: #fff; text-align: left; padding: 11px 14px; font-size: 12px; letter-spacing: .6px; }
table.items th.r, table.items td.r { text-align: right; }
table.items th.c, table.items td.c { text-align: center; }
table.items td { padding: 11px 14px; border-bottom: 1px solid #ececf1; font-size: 12px; }
.sum { margin: 12px 0 0 auto; width: 52%; font-size: 12px; }
.sum div { display: flex; justify-content: space-between; padding: 3px 0; }
.sum .tot { font-weight: 700; font-size: 13px; border-top: 1px solid #d9d9de; margin-top: 4px; padding-top: 6px; }
.note { margin-top: 18px; font-size: 11px; color: #555; }
`;

function invoicePage(o: ApprovedOrder): string {
  const sub = o.total - o.deliveryCharge + o.discountAmount;
  const unit = o.product.qty ? sub / o.product.qty : sub;
  return `<section class="page">
  <div class="top"><div class="brand">${esc(BUSINESS.name)}</div><div class="badge">INVOICE</div></div>
  <hr/>
  <div class="meta">
    <div><div class="lbl"><b>Billing To</b></div>${esc(o.name)}<br/>${esc(o.mobile)}<br/>${esc(o.address)}</div>
    <div><div class="lbl"><b>Contact Us</b></div><b>${esc(BUSINESS.name)}</b><br/>${esc(BUSINESS.phone)}<br/>${esc(BUSINESS.address)}</div>
    <div class="inv">Invoice No: ${esc(o.invoice)}<br/>Invoice Date: ${shortDate(o.ts)}
      <div class="bc">${code128Svg(o.invoice, { module: 1.35, height: 28 })}</div>
      <div class="code">${esc(o.invoice)}</div>
    </div>
  </div>
  <table class="items">
    <thead><tr><th>PRODUCTS</th><th class="c">QTY</th><th class="r">PRICE</th><th class="r">AMOUNT</th></tr></thead>
    <tbody><tr><td>${esc(o.product.name)}</td><td class="c">${o.product.qty}</td><td class="r">${money(unit)}</td><td class="r">${money(sub)}</td></tr></tbody>
  </table>
  <div class="sum">
    <div><span>Sub Total</span><span>${money(sub)}</span></div>
    <div><span>Delivery Charge</span><span>${money(o.deliveryCharge)}</span></div>
    ${o.discountAmount > 0 ? `<div><span>Discount</span><span>-${money(o.discountAmount)}</span></div>` : ''}
    <div class="tot"><span>Total:</span><span>${money(o.total)}</span></div>
  </div>
  ${o.note ? `<div class="note"><b>Note:</b> ${esc(o.note)}</div>` : ''}
</section>`;
}

export function printInvoices(list: ApprovedOrder[]): boolean {
  return openPrintWindow('Invoice', invoiceCss, list.map(invoicePage).join(''));
}

/** SKU wise group kore ekta page e dekhay (packing er jonno) */
export function printInvoicesGroupedBySku(list: ApprovedOrder[]): boolean {
  const groups = new Map<string, ApprovedOrder[]>();
  [...list]
    .sort((a, b) => a.product.sku.localeCompare(b.product.sku))
    .forEach((o) => groups.set(o.product.sku, [...(groups.get(o.product.sku) ?? []), o]));
  const pages = [...groups.entries()].map(([sku, rows]) => {
    const qty = rows.reduce((s, o) => s + o.product.qty, 0);
    const amount = rows.reduce((s, o) => s + o.total, 0);
    return `<section class="page">
  <div class="top"><div class="brand">${esc(BUSINESS.name)}</div><div class="badge">INVOICE · SKU GROUP</div></div>
  <hr/>
  <div class="meta" style="grid-template-columns:1fr 1fr">
    <div><div class="lbl"><b>SKU</b></div>${esc(sku)}<br/>${esc(rows[0].product.name)}</div>
    <div><div class="lbl"><b>Summary</b></div>Orders: ${rows.length}<br/>Total Qty: ${qty}</div>
  </div>
  <table class="items">
    <thead><tr><th>INVOICE</th><th>CUSTOMER</th><th class="c">QTY</th><th class="r">AMOUNT</th></tr></thead>
    <tbody>${rows
      .map(
        (o) =>
          `<tr><td>${esc(o.invoice)}</td><td>${esc(o.name)}<br/><span style="color:#666">${esc(o.mobile)}</span></td><td class="c">${o.product.qty}</td><td class="r">${money(o.total)}</td></tr>`,
      )
      .join('')}</tbody>
  </table>
  <div class="sum"><div class="tot"><span>Total:</span><span>${money(amount)}</span></div></div>
</section>`;
  });
  return openPrintWindow('Invoice', invoiceCss, pages.join(''));
}

/* ───────────────────────── sticker ───────────────────────── */

const stickerCss = `${baseCss}
.sheet { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 10px; padding: 5mm; }
.st { width: 152px; text-align: center; break-inside: avoid; padding: 0 0 4px; }
.st .brand { background: #000; color: #fff; font-style: italic; font-weight: 800; font-size: 19px; padding: 5px 0 6px; border-radius: 6px; font-family: 'Trebuchet MS', Arial, sans-serif; }
.st .id { font-weight: 800; font-size: 14px; margin: 8px 0 3px; }
.st .nm { font-size: 8px; margin-bottom: 4px; }
.st .ph { font-weight: 800; font-size: 10px; margin-bottom: 4px; }
.st .cod { display: inline-block; background: #000; color: #fff; font-weight: 800; font-size: 12px; padding: 3px 9px; border-radius: 7px; margin-bottom: 5px; }
.st .pr { font-weight: 800; font-size: 9px; margin-bottom: 3px; }
.st .nt { font-weight: 800; font-size: 9px; margin-bottom: 7px; }
.st .bc svg { display: block; margin: 0 auto; }
.st .bt { font-size: 5.5px; margin-top: 1px; letter-spacing: .3px; }
`;

export function printStickers(list: ApprovedOrder[]): boolean {
  const body = `<div class="sheet">${list
    .map(
      (o) => `<div class="st">
  <div class="brand">${esc(BUSINESS.name)}</div>
  <div class="id">ID - ${esc(o.trackingId ?? '')}</div>
  <div class="nm">${esc(o.name)}</div>
  <div class="ph">${esc(o.mobile)}</div>
  <div class="cod">COD - ${o.unpaid || o.total ? o.total.toFixed(2) : '0.00'}</div>
  <div class="pr">Products: (${esc(o.product.sku)}-${o.product.qty})</div>
  <div class="nt">Note - ${esc(o.note)}</div>
  <div class="bc">${code128Svg(o.invoice, { module: 1.15, height: 22 })}</div>
  <div class="bt">${esc(o.invoice)}</div>
</div>`,
    )
    .join('')}</div>`;
  return openPrintWindow('Order', stickerCss, body);
}

/* ───────────────────────── picking list & sheet ───────────────────────── */

const absUrl = (u?: string) => {
  if (!u) return '';
  try {
    return new URL(u, window.location.href).href;
  } catch {
    return u;
  }
};
const stamp = (ts: number) => {
  const d = dhaka(ts);
  const h = d.getUTCHours();
  return `${shortDate(ts)}, ${pad(h % 12 || 12)}:${pad(d.getUTCMinutes())} ${h >= 12 ? 'pm' : 'am'}`;
};
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonYear = (ts: number) => {
  const d = dhaka(ts);
  return `${pad(d.getUTCDate())} ${monthNames[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

const pickingCss = `${baseCss}
.wrap { padding: 12mm 14mm; font-size: 12px; }
.top { display: flex; justify-content: space-between; font-size: 11px; }
.ttl { text-align: center; margin: 22px 0 18px; line-height: 1.55; font-size: 12px; }
.ttl h1 { margin: 0 0 6px; font-size: 15px; font-weight: 700; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #cfcfd6; padding: 6px 8px; font-size: 12px; text-align: left; vertical-align: middle; }
th { background: #f2f2f5; font-weight: 700; }
tr { break-inside: avoid; }
td img { width: 38px; height: 38px; object-fit: cover; border-radius: 4px; display: block; }
td.ord { font-size: 9px; color: #333; word-break: break-word; }
.sign { margin-top: 26px; font-size: 12px; font-weight: 700; }
.sign .row { display: flex; justify-content: space-between; gap: 40px; margin-bottom: 18px; }
.sign .ln { display: inline-block; border-bottom: 1px solid #111; height: 14px; vertical-align: bottom; }
`;

export function printPicking(list: ApprovedOrder[]): boolean {
  const map = new Map<string, { name: string; image?: string; qty: number; invoices: string[] }>();
  list.forEach((o) => {
    const cur = map.get(o.product.sku) ?? { name: o.product.name, image: o.product.image, qty: 0, invoices: [] };
    cur.qty += o.product.qty;
    cur.invoices.push(o.invoice);
    map.set(o.product.sku, cur);
  });
  const rows = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const totalQty = rows.reduce((s, [, v]) => s + v.qty, 0);
  const now = Date.now();
  const body = `<div class="wrap">
  <div class="top"><span>${esc(longDate(now))}</span><span>Picking List</span><span></span></div>
  <div class="ttl"><h1>Picking List</h1>Total Orders: ${list.length}<br/>Total Products: ${totalQty}<br/>Date: ${esc(stamp(now))}</div>
  <table>
    <thead><tr><th style="width:56px">Image</th><th style="width:70px">SKU</th><th style="width:40px">Qty</th><th>Name</th><th style="width:150px">Order Numbers</th><th style="width:60px">Picked</th></tr></thead>
    <tbody>${rows
      .map(
        ([sku, v]) =>
          `<tr><td>${v.image ? `<img src="${esc(absUrl(v.image))}" alt=""/>` : ''}</td><td>${esc(sku)}</td><td>${v.qty}</td><td>${esc(v.name)}</td><td class="ord">${esc(v.invoices.join(', '))}</td><td></td></tr>`,
      )
      .join('')}</tbody>
  </table>
  <div class="sign">
    <div class="row"><span>Picked By: <span class="ln" style="width:150px"></span></span><span>Date: <span class="ln" style="width:150px"></span></span></div>
    <div>Signature: <span class="ln" style="width:100%;display:block"></span></div>
  </div></div>`;
  return openPrintWindow('Picking List', pickingCss, body);
}

const sheetCss = `${baseCss}
.wrap { padding: 12mm 14mm; font-size: 13px; }
.ttl { text-align: center; margin: 4px 0 18px; line-height: 1.5; font-size: 13px; }
.ttl h1 { margin: 0; font-size: 18px; font-weight: 700; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #dcdce2; padding: 8px 9px; font-size: 13px; text-align: left; }
th { font-weight: 700; }
tr { break-inside: avoid; }
`;

/** Courier (Pathao) parcel hand-over sheet */
export function printSheet(list: ApprovedOrder[]): boolean {
  const body = `<div class="wrap">
  <div class="ttl"><h1>PATHAO</h1>Total Parcels: ${list.length}<br/>Date: ${esc(dayMonYear(Date.now()))}</div>
  <table>
    <thead><tr><th style="width:44px">SL</th><th>Invoice Number</th><th>Name</th><th>Mobile Number</th><th style="width:80px">Total</th></tr></thead>
    <tbody>${list
      .map(
        (o, i) =>
          `<tr><td>${i + 1}</td><td>${esc(o.invoice)}</td><td>${esc(o.name)}</td><td>${esc(o.mobile)}</td><td>${money(o.total)}</td></tr>`,
      )
      .join('')}</tbody>
  </table></div>`;
  return openPrintWindow('Order Sheet', sheetCss, body);
}
