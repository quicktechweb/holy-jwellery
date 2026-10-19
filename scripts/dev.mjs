// Fast dev: Turbopack diye server chalay, tarpor shob page aage theke compile (warm-up) kore rakhe,
// jate click korle 2-5 second compile er jonno wait korte na hoy.
import { spawn } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.env.PORT || '3000';
const base = `http://localhost:${PORT}`;
const turbo = !process.argv.includes('--webpack');

/** src/app theke shob page route khuje ber kore ([id] -> 1, (group) bad, api bad) */
function routes(dir = join(root, 'src', 'app'), prefix = '') {
  const out = [];
  if (existsSync(join(dir, 'page.tsx'))) out.push(prefix || '/');
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name === 'api' || d.name.startsWith('_')) continue;
    let seg = d.name;
    if (seg.startsWith('(') && seg.endsWith(')')) seg = '';
    else if (seg.startsWith('[[')) seg = '';
    else if (seg.startsWith('[')) seg = '1';
    out.push(...routes(join(dir, d.name), seg ? `${prefix}/${seg}` : prefix));
  }
  return [...new Set(out)];
}

const nextBin = join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const args = [nextBin, 'dev', '-p', PORT, ...(turbo ? ['--turbopack'] : [])];
const child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit' });
const stop = () => child.kill();
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
child.on('exit', (c) => process.exit(c ?? 0));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function warm() {
  // server ready howar jonno wait
  for (let i = 0; i < 120; i++) {
    try { await fetch(base, { redirect: 'manual' }); break; } catch { await sleep(500); }
  }
  const list = routes().sort((a, b) => (a.startsWith('/dashboard') ? -1 : 0) - (b.startsWith('/dashboard') ? -1 : 0));
  const t0 = Date.now();
  console.log(`\n[warm-up] ${list.length} ta page aage theke compile hocche...`);
  let i = 0;
  const worker = async () => {
    while (i < list.length) {
      const r = list[i++];
      try { await fetch(base + r, { redirect: 'manual' }); } catch { /* ignore */ }
    }
  };
  await Promise.all([worker(), worker()]); // 2 ta ekshathe
  console.log(`[warm-up] shesh - ${((Date.now() - t0) / 1000).toFixed(1)}s. Ekhon shob page-e click korle sathe sathe khulbe.\n`);
}
warm();
