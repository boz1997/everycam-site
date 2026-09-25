// POLAR EMBED DRIVER E2E (POLAR-PLAN P3, §4.4, §7.3) — the production driver
// src/backend/polarEmbed.ts with the REAL @polar-sh/checkout 0.4.1 embed, in the
// installed Chrome (playwright-core, headless), against FAKE Polar pages.
//
// Polar's embed accepts messages only from https://polar.sh and
// https://sandbox.polar.sh, so the local stack's mock Polar cannot exercise it.
// Here every request to https://sandbox.polar.sh/ is answered by this script
// (Playwright routing: the frame really has that origin, so the embed's own
// origin check runs) and every other non-loopback request is aborted — nothing
// reaches Polar, Firebase or anything else. No local stack needed: a Vite dev
// server on a free loopback port serves the module to a blank page.
//
//   node e2e/polar-embed.mjs [--headed]      (npm run e2e:polar-embed)
//
// Cases: loaded → ready (frame, query parameters, scroll lock); confirmed → locked
// and a close is refused; success → completed with preventDefault (no redirect to
// successURL, frame and scroll lock gone); close → closed; a second open replaces
// the first; URLs outside https://*.polar.sh refused; the 8 s fallback to the hosted
// checkout when the frame never says `loaded` (half-made frame swept first); the
// same fallback at once when the embed chunk cannot load, and no late frame when
// the chunk arrives after the deadline.
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const require = createRequire(join(ROOT, 'package.json'));
const { chromium } = require('playwright-core');

const HEADED = process.argv.includes('--headed');
const POLAR = 'https://sandbox.polar.sh';
const OK_URL = `${POLAR}/checkout/polar_c_e2e_ok`;
const NEVER_URL = `${POLAR}/checkout/polar_c_e2e_never`;
const TEST_PATH = '/__polar-embed-e2e';

let failures = 0;
let passes = 0;
const log = (...a) => console.log(...a);
function ok(cond, msg) {
  if (cond) { passes += 1; log(`  ✓ ${msg}`); }
  else { failures += 1; log(`  ✗ ${msg}`); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- Vite (dev server, loopback, never a build)
const vite = await createServer({
  root: ROOT,
  configFile: join(ROOT, 'vite.config.ts'),
  mode: 'development',
  logLevel: 'warn',
  server: { host: '127.0.0.1', port: 5197, strictPort: false, hmr: false }, // the next free one if taken
  optimizeDeps: { include: ['@polar-sh/checkout/embed'] },
});
await vite.listen();
const addr = vite.httpServer.address();
const WEB = `http://127.0.0.1:${addr.port}`;
log(`vite dev server ${WEB} (loopback)`);

// ---------------------------------------------------------------- fake Polar
/** Polar's checkout page as the embed sees it: posts EmbedCheckoutMessage to the
 *  embed_origin it is given. `never` never says loaded (as when Polar's CSP
 *  refuses the frame). Without ?embed=true it is the HOSTED page. */
function polarPage(url) {
  const u = new URL(url);
  if (u.searchParams.get('embed') !== 'true') {
    return `<!doctype html><meta charset="utf-8"><title>Hosted</title><body data-hosted="${u.pathname}">Hosted Polar checkout (fake)</body>`;
  }
  const never = u.pathname.endsWith('_never');
  return `<!doctype html><meta charset="utf-8"><title>Embedded</title><body>
<button id="confirm">confirm</button><button id="success">success</button><button id="close">close</button>
<script>
  const to = new URLSearchParams(location.search).get('embed_origin');
  const post = (event, extra) => parent.postMessage(Object.assign({ type: 'POLAR_CHECKOUT', event }, extra || {}), to);
  document.getElementById('confirm').onclick = () => post('confirmed');
  document.getElementById('close').onclick = () => post('close');
  document.getElementById('success').onclick = () => post('success', { successURL: ${JSON.stringify(`${WEB}/__success`)}, redirect: true });
  ${never ? '' : "post('loaded');"}
</script></body>`;
}

const browser = await chromium.launch({ channel: 'chrome', headless: !HEADED });
const seen = { hosted: [], outside: [] };

async function freshPage({ breakEmbedChunk = false, slowEmbedChunkMs = 0 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    if (u.origin === WEB) {
      if (u.pathname === TEST_PATH) return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><title>polar embed e2e</title><body><main>dashboard</main></body>' });
      if (u.pathname === '/__success') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><body data-success>success_url</body>' });
      if (breakEmbedChunk && /@polar-sh_checkout_embed/.test(u.pathname)) return route.abort('failed');
      if (slowEmbedChunkMs && /@polar-sh_checkout_embed/.test(u.pathname)) await sleep(slowEmbedChunkMs);
      return route.continue();
    }
    if (u.origin === POLAR) {
      if (req.isNavigationRequest() && req.frame() === page.mainFrame()) {
        seen.hosted.push(req.url());
        // 204: the navigation is recorded and cancelled, so the page stays
        // inspectable (a real browser would now show Polar's hosted page).
        return route.fulfill({ status: 204, body: '' });
      }
      return route.fulfill({ status: 200, contentType: 'text/html', body: polarPage(req.url()) });
    }
    seen.outside.push(req.url());
    return route.abort('blockedbyclient');
  });
  await page.goto(`${WEB}${TEST_PATH}`);
  await page.evaluate(async () => {
    const m = await import('/src/backend/polarEmbed.ts');
    window.__events = [];
    window.__open = (url) => m.polarEmbedCheckout
      .open({ provider: 'polar', env: 'sandbox', orderId: 'po_00000000-0000-4000-8000-000000000000', url }, (e) => window.__events.push(e))
      .then(() => 'resolved', (e) => `rejected:${e.message}`);
  }).catch(async () => {
    // the module itself failed (only expected when the embed chunk is broken: it is
    // imported dynamically, so polarEmbed.ts still loads)
  });
  return { ctx, page, errors };
}
const events = (page) => page.evaluate(() => window.__events.slice());
const frames = (page) => page.evaluate(() => [...document.querySelectorAll('iframe')].map((f) => f.src));
const noScroll = (page) => page.evaluate(() => document.body.classList.contains('polar-no-scroll'));
const inFrame = (page) => page.frameLocator('iframe');

try {
  // ---------------------------------------------------------------- embedded
  log('\nembedded checkout');
  {
    const { ctx, page, errors } = await freshPage();
    const t0 = Date.now();
    const r = await page.evaluate((u) => window.__open(u), OK_URL);
    ok(r === 'resolved' && Date.now() - t0 < 5000, `open() resolves once the frame says loaded (${Date.now() - t0} ms)`);
    ok((await events(page)).join() === 'ready', `events: ${JSON.stringify(await events(page))} (loaded → ready)`);
    const [src] = await frames(page);
    const q = src ? new URL(src).searchParams : new URLSearchParams();
    ok(src?.startsWith(`${OK_URL}?`) && q.get('embed') === 'true' && q.get('embed_origin') === WEB && q.get('theme') === 'light', `frame ${src} (embed=true, embed_origin=${q.get('embed_origin')}, theme=light)`);
    ok(await noScroll(page), 'page scroll locked while the checkout is open (polar-no-scroll)');
    ok(await page.locator('.polar-loader-spinner').count() === 0, "embed's loading spinner removed on loaded");

    await inFrame(page).locator('#confirm').click();
    await sleep(300);
    ok((await events(page)).join() === 'ready,locked', 'confirmed → locked');
    await inFrame(page).locator('#close').click();
    await sleep(400);
    ok((await frames(page)).length === 1 && !(await events(page)).includes('closed'), 'close while Polar takes the payment → refused (frame stays, no closed)');

    const before = page.url();
    await inFrame(page).locator('#success').click();
    await sleep(1200);
    ok((await events(page)).join() === 'ready,locked,completed', `success → completed (${JSON.stringify(await events(page))})`);
    ok(page.url() === before, `preventDefault: the page stays (${page.url()}), no redirect to successURL`);
    ok((await frames(page)).length === 0 && !(await noScroll(page)), 'after success: frame removed, scroll lock lifted');

    await page.evaluate(() => { window.__events.length = 0; });
    ok(await page.evaluate((u) => window.__open(u), OK_URL) === 'resolved', 'a second checkout opens');
    await inFrame(page).locator('#close').click();
    await sleep(400);
    ok((await events(page)).join() === 'ready,closed' && (await frames(page)).length === 0 && !(await noScroll(page)), `close → closed, frame removed (${JSON.stringify(await events(page))})`);

    await page.evaluate(() => { window.__events.length = 0; });
    await page.evaluate((u) => window.__open(u), OK_URL);
    await page.evaluate((u) => window.__open(u), OK_URL);
    ok((await frames(page)).length === 1, 'opening again replaces the open checkout (one frame)');
    await inFrame(page).locator('#close').click();
    await sleep(300);

    for (const bad of ['https://evil.example/checkout/polar_c_x', 'http://sandbox.polar.sh/checkout/polar_c_x', 'https://sandbox.polar.sh.evil.example/checkout/x', 'javascript:alert(1)', '']) {
      const res = await page.evaluate((u) => window.__open(u), bad);
      ok(res === 'rejected:polar-url', `url ${JSON.stringify(bad)} → ${res}`);
    }
    ok((await frames(page)).length === 0 && seen.hosted.length === 0, 'refused urls: no frame, no navigation');
    ok(errors.length === 0, `no page errors (${errors.join(' | ')})`);
    await ctx.close();
  }

  // ---------------------------------------------------------------- fallback: the frame never loads
  log('\nfallback: no `loaded` within 8 s → hosted checkout');
  {
    const { ctx, page, errors } = await freshPage();
    const t0 = Date.now();
    const r = await page.evaluate((u) => window.__open(u), NEVER_URL);
    const ms = Date.now() - t0;
    ok(r === 'resolved' && ms >= 7800 && ms < 12_000, `open() gives up after ${ms} ms (LOAD_TIMEOUT_MS 8000)`);
    await sleep(500);
    ok(seen.hosted.length === 1 && seen.hosted[0] === NEVER_URL, `the page went to the hosted checkout ${seen.hosted[0]}`);
    ok((await frames(page)).length === 0 && !(await noScroll(page)) && await page.locator('.polar-loader-spinner').count() === 0, 'half-made frame, spinner and scroll lock swept before leaving');
    ok((await events(page)).length === 0, 'no checkout events');
    ok(errors.length === 0, `no page errors (${errors.join(' | ')})`);
    seen.hosted.length = 0;
    await ctx.close();
  }

  log('\nfallback: the embed chunk cannot load → hosted checkout at once');
  {
    const { ctx, page } = await freshPage({ breakEmbedChunk: true });
    const t0 = Date.now();
    const r = await page.evaluate((u) => window.__open(u), OK_URL);
    const ms = Date.now() - t0;
    await sleep(300);
    ok(r === 'resolved' && ms < 3000, `open() falls back in ${ms} ms`);
    ok(seen.hosted.length === 1 && seen.hosted[0] === OK_URL, `the page went to the hosted checkout ${seen.hosted[0]}`);
    ok((await frames(page)).length === 0, 'no frame');
    seen.hosted.length = 0;
    await ctx.close();
  }

  log('\nfallback: the embed chunk arrives after the deadline → hosted checkout, no late frame');
  {
    const { ctx, page, errors } = await freshPage({ slowEmbedChunkMs: 9500 });
    const t0 = Date.now();
    const r = await page.evaluate((u) => window.__open(u), OK_URL);
    const ms = Date.now() - t0;
    ok(r === 'resolved' && ms >= 7800 && ms < 9400, `open() gives up after ${ms} ms, before the chunk arrives`);
    await sleep(3000);
    ok(seen.hosted.length === 1 && seen.hosted[0] === OK_URL, `the page went to the hosted checkout ${seen.hosted[0]}`);
    ok((await frames(page)).length === 0 && !(await noScroll(page)) && (await events(page)).length === 0, 'the chunk that came late (9.5 s) put no frame, spinner or scroll lock on the page');
    ok(errors.length === 0, `no page errors (${errors.join(' | ')})`);
    seen.hosted.length = 0;
    await ctx.close();
  }

  ok(seen.outside.length === 0, `no request left loopback / the fake Polar (${seen.outside.slice(0, 3).join(', ')})`);
} catch (e) {
  failures += 1;
  log(`  ✗ aborted: ${e.stack || e.message}`);
} finally {
  await browser.close();
  await vite.close();
}
log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
