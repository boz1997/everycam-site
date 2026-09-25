// Fails a build whose output could talk to anything but production (plan §5,
// "Production build that cannot reach emulators"). Runs as `postbuild`, and on
// its own: `node scripts/check-dist.mjs [dir]` (default: ../join, the folder
// GitHub Pages serves as sharecam.app/join/).
//
// It checks ALL FOUR pages — guest /join/, uploader /join/upload/, album
// /join/album/, dashboard /join/host/ — because they share chunks: one stray
// import of the local backend in any page would land in a chunk the others load.
//
//   1. every page's index.html exists and every script/style it references exists;
//   2. no file carries a local-stack trace: the demo project, the mock Paddle or
//      Polar, the local badge, the local backend's guard text, VITE_LOCAL_* names,
//      local price / transaction / key ids, 127.0.0.1, or the stack's ports — and
//      no file carries anything shaped like a Polar access token (polar_oat_…) or
//      a webhook secret (whsec_…): the server's secrets never belong in a page
//      (POLAR-PLAN §4.4);
//   3. the production Firebase project is present (the build really is prod), and
//      so is Polar's embedded checkout (@polar-sh/checkout): the provider is
//      chosen at run time (config/web.provider), so every build carries both.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(process.argv[2] || join(HERE, '..', '..', 'join'));
const PAGES = ['index.html', 'upload/index.html', 'album/index.html', 'host/index.html'];

// Only strings the local stack introduces — never SDK internals (the Firebase
// SDK itself mentions "http://localhost" and "connectFirestoreEmulator(" in its
// own emulator plumbing and error messages, so those prove nothing).
const FORBIDDEN = [
  /demo-sharecam/,
  /sharecam-mock-paddle/,
  /sharecam-mock-polar/,
  /data-mock-polar/,
  /local-stack-badge/,
  /Local · demo/,
  /local backend loaded outside/,
  /local checkout loaded outside/,
  /VITE_LOCAL_/,
  /pri_local_/,
  /txn_local_/,
  /pdl_sdbx_apikey_local/,
  /pdl_live_apikey_local/,
  /127\.0\.0\.1/,
  /localhost:(?:5187|8796|8797|9380|8380|9385|5380|9480|4380|4381|4382)/,
  // The local stack's ports as a quoted or host:port literal.
  /["':](?:5187|8796|8797|9380|8380|9385|5380|9480|4380|4381|4382|9383|9384)(?![0-9])/,
  // Server secrets: a Polar organisation access token, a Standard Webhooks secret.
  /polar_oat_/,
  /whsec_/,
];

const problems = [];
const files = [];
if (!existsSync(DIR)) {
  console.error(`check-dist: ${DIR} does not exist (build first)`);
  process.exit(1);
}
(function walk(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(js|mjs|css|html|json|map|txt|svg|webmanifest)$/i.test(name)) files.push(p);
  }
})(DIR);

// 1. pages and their assets
for (const page of PAGES) {
  const p = join(DIR, page);
  if (!existsSync(p)) { problems.push(`${page}: missing`); continue; }
  const html = readFileSync(p, 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((m) => m[1]);
  if (!refs.some((r) => r.endsWith('.js'))) problems.push(`${page}: no script`);
  for (const r of refs) {
    if (/^https?:/.test(r)) continue;
    if (!existsSync(resolve(dirname(p), r))) problems.push(`${page}: references missing ${r}`);
  }
}

// 2. local-stack traces
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  for (const re of FORBIDDEN) {
    const m = text.match(re);
    if (m) {
      const at = m.index ?? 0;
      problems.push(`${relative(DIR, f)}: ${re} → …${text.slice(Math.max(0, at - 40), at + 40).replace(/\s+/g, ' ')}…`);
    }
  }
}

// 3. production project present
if (!files.some((f) => f.endsWith('.js') && readFileSync(f, 'utf8').includes('sharecam-1997boz'))) {
  problems.push('no chunk names the production project sharecam-1997boz');
}
// The embed's message type and Polar's two origins (@polar-sh/checkout 0.4.1 embed.js).
if (!files.some((f) => f.endsWith('.js') && /POLAR_CHECKOUT[\s\S]*https:\/\/sandbox\.polar\.sh/.test(readFileSync(f, 'utf8')))) {
  problems.push('no chunk carries Polar\'s embedded checkout (@polar-sh/checkout/embed)');
}

if (problems.length) {
  console.error(`check-dist: FAILED (${DIR}):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}

// 4. (warning, not a failure) Paddle client-side tokens. They are public by design
// and come from the build env (VITE_PADDLE_TOKEN_SANDBOX / _LIVE, e.g. a committed
// web/.env.production). A build without one shows "coming soon" on every package
// page — right before go-live C/E, a silent mistake after it (review P2).
const js = files.filter((f) => f.endsWith('.js')).map((f) => readFileSync(f, 'utf8'));
const tokens = { sandbox: js.some((t) => /["'`]test_[A-Za-z0-9]{16,}["'`]/.test(t)), live: js.some((t) => /["'`]live_[A-Za-z0-9]{16,}["'`]/.test(t)) };
if (!tokens.sandbox && !tokens.live) {
  console.warn('check-dist: WARNING — no Paddle client token in this build: every package page says "coming soon". Fine until go-live C/E; from then on build with VITE_PADDLE_TOKEN_SANDBOX / VITE_PADDLE_TOKEN_LIVE (web/.env.production).');
} else {
  console.log(`check-dist: Paddle client token(s) in the build: ${Object.entries(tokens).filter(([, v]) => v).map(([k]) => k).join(' + ')}`);
}
console.log(`check-dist: ok — ${files.length} files, 4 pages (${PAGES.join(', ')}), no emulator host/port, demo project or mock in ${relative(process.cwd(), DIR) || DIR}`);
