// LOCAL E2E of the dashboard's POLAR side (POLAR-PLAN §4.4, §7.3) — against the
// LOCAL STACK only (EC `npm run local`), with the server's Polar branch stood in
// for: until the Functions emulator can open Polar checkouts (WP3) and the stack has
// a mock Polar (WP5), this script answers webCheckoutStart's START and STATUS calls
// itself (Playwright routing; the PREVIEW goes to the real emulated function and
// only gains `provider: 'polar'`), serves the mock Polar checkout page on the mock's
// origin, and writes the plan to the event document as the webhook would (Firestore
// emulator, owner token). Everything else is the real local stack: sign-in, event
// creation, the event document the page follows. Refuses unless every URL is
// loopback and the emulator answers for demo-sharecam; nothing leaves this Mac
// (requests to polar.sh or Paddle's CDN fail the run).
//
// What it proves is the PANEL: driverFor('polar') with the mock embed (the real
// driver logic of polarEmbed.ts), the provider-aware footnote and receipt line, the
// state machine (close → packages, success → applying → done → the event's page
// with ?paid=&via=polar), the pending payment remembered with its provider, the
// return from Polar's HOSTED checkout (…/host/?checkout_id=<uuid>: applied /
// not yet applied / refused / not ours) and the 8 s fallback to the hosted page.
// The server side of the same flows is the E2E_PROVIDER=polar run of local-host.mjs.
//
//   node e2e/local-polar-panel.mjs [--headed]     (npm run e2e:local:polar-panel)
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(HERE, '..', 'package.json'));
const { chromium } = require('playwright-core');

const HEADED = process.argv.includes('--headed');
const WEB = 'http://127.0.0.1:5187';
const MOCK = 'http://127.0.0.1:8797';
const FUNCTIONS = 'http://127.0.0.1:5380/demo-sharecam/europe-west3';
const FS = 'http://127.0.0.1:8380/v1/projects/demo-sharecam/databases/(default)/documents';
const PASSWORD = 'sharecam-local';
const FRAME = 'iframe[title="Local test checkout (Polar)"]';

for (const u of [WEB, MOCK, FUNCTIONS, FS]) {
  const h = new URL(u).hostname;
  if (h !== '127.0.0.1' && h !== 'localhost') throw new Error(`refusing: ${u} is not loopback`);
}

let failures = 0;
let passes = 0;
const log = (...a) => console.log(...a);
function ok(cond, msg) {
  if (cond) { passes += 1; log(`  ✓ ${msg}`); }
  else { failures += 1; log(`  ✗ ${msg}`); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms = 20_000, step = 300) {
  const end = Date.now() + ms;
  let last;
  while (Date.now() < end) {
    last = await fn().catch(() => null);
    if (last) return last;
    await sleep(step);
  }
  return last;
}

// ---------------------------------------------------------------- Firestore emulator (owner)
function decode(v) {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields ?? {}).map(([k, x]) => [k, decode(x)]));
  return v;
}
async function getDoc(path) {
  const r = await fetch(`${FS}/${path}`, { headers: { Authorization: 'Bearer owner' } });
  if (r.status === 404) return null;
  const j = await r.json();
  return Object.fromEntries(Object.entries(j.fields ?? {}).map(([k, v]) => [k, decode(v)]));
}
/** What the webhook's apply writes that the page reads to say "done" (planFields). */
async function applyPlan(eventId, planId) {
  const q = ['planId', 'planPurchasedAt'].map((f) => `updateMask.fieldPaths=${f}`).join('&');
  const r = await fetch(`${FS}/events/${eventId}?${q}`, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { planId: { stringValue: planId }, planPurchasedAt: { integerValue: String(Date.now()) } } }),
  });
  if (!r.ok) throw new Error(`applyPlan ${eventId}: ${r.status}`);
}

async function guard() {
  const r = await fetch(`${MOCK}/healthz`).catch(() => null);
  const j = r && r.ok ? await r.json() : null;
  if (!j || j.project !== 'demo-sharecam') throw new Error('the local stack is not running (EC: npm run local)');
  if (!(await fetch(`${FS}/config/web`, { headers: { Authorization: 'Bearer owner' } }).catch(() => null))?.ok) throw new Error('Firestore emulator for demo-sharecam not reachable');
}

// ---------------------------------------------------------------- the stand-in server + mock Polar page
const orders = new Map(); // po_<uuid> → { status, planId, eventId }
const starts = [];
const hostedVisits = [];
const forbidden = [];
let neverLoad = false;

/** The mock Polar checkout page (the contract for EC/local/mockPolar.mjs): posts the
 *  embed's messages plus the mock's source tag to the embed_origin it is given. */
function checkoutPage(url) {
  const u = new URL(url);
  const id = u.pathname.split('/').pop();
  const success = `${WEB}/host/?checkout_id=${u.searchParams.get('cid') ?? ''}`;
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Local test checkout (Polar)</title>
<body style="font:16px -apple-system,sans-serif;padding:20px"><p>Mock Polar · ${id}</p>
<button id="pay">Pay</button> <button id="close" aria-label="Close checkout">×</button>
<script>
  const to = new URLSearchParams(location.search).get('embed_origin');
  const post = (event, extra) => parent.postMessage(Object.assign({ type: 'POLAR_CHECKOUT', source: 'sharecam-mock-polar', event }, extra || {}), to);
  document.getElementById('pay').onclick = () => { post('confirmed'); setTimeout(() => post('success', { successURL: ${JSON.stringify(success)}, redirect: true }), 300); };
  document.getElementById('close').onclick = () => post('close');
  ${neverLoad ? '' : "post('loaded');"}
</script></body></html>`;
}

async function wire(ctx, page) {
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    if (!['127.0.0.1', 'localhost'].includes(u.hostname)) {
      forbidden.push(req.url());
      return route.abort('blockedbyclient');
    }
    if (u.origin === MOCK && u.pathname.startsWith('/polar/checkout/')) {
      if (req.isNavigationRequest() && req.frame() === page.mainFrame()) {
        hostedVisits.push(req.url());
        return route.fulfill({ status: 204, body: '' }); // recorded; the page stays inspectable
      }
      return route.fulfill({ status: 200, contentType: 'text/html', body: checkoutPage(req.url()) });
    }
    if (req.url() === `${FUNCTIONS}/webCheckoutStart` && req.method() === 'POST') {
      const data = (JSON.parse(req.postData() || '{}').data) ?? {};
      const headers = { 'access-control-allow-origin': req.headers().origin || WEB, vary: 'Origin', 'content-type': 'application/json' };
      if (data.preview) {
        const real = await route.fetch();
        const body = await real.json();
        if (body.result) body.result.provider = 'polar';
        return route.fulfill({ status: real.status(), headers, body: JSON.stringify(body) });
      }
      if (typeof data.status === 'string') {
        const o = orders.get(data.status);
        if (!o) return route.fulfill({ status: 404, headers, body: JSON.stringify({ error: { status: 'NOT_FOUND', message: 'order-not-found' } }) });
        return route.fulfill({ status: 200, headers, body: JSON.stringify({ result: o }) });
      }
      if (data.eventId && data.planId) {
        const cid = randomUUID();
        const orderId = `po_${cid}`;
        orders.set(orderId, { status: 'created', planId: data.planId, eventId: data.eventId });
        starts.push({ orderId, planId: data.planId, eventId: data.eventId });
        const url = `${MOCK}/polar/checkout/polar_c_local_${cid.replace(/-/g, '')}${neverLoad ? '_never' : ''}?cid=${cid}`;
        return route.fulfill({ status: 200, headers, body: JSON.stringify({ result: { provider: 'polar', env: 'sandbox', orderId, url, reused: false } }) });
      }
    }
    return route.continue();
  });
}

// ---------------------------------------------------------------- browser
const browser = await chromium.launch({ channel: 'chrome', headless: !HEADED });
const pageErrors = [];
let ctx = null;
let page = null;
async function freshPage() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await ctx.newPage();
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|ERR_ABORTED|Failed to load resource|ERR_BLOCKED_BY_CLIENT/.test(m.text())) pageErrors.push(`console: ${m.text().slice(0, 240)}`);
  });
  await wire(ctx, page);
}
const go = async (hash) => {
  await page.goto(`${WEB}/host/${hash}`);
  await sleep(300);
};
async function signIn(who) {
  await freshPage();
  await go('#/signin');
  await page.locator('input[type=email]').first().fill(`${who}@sharecam.local`);
  await page.locator('input[type=password]').first().fill(PASSWORD);
  await page.locator('form button[type=submit]').first().click();
  await page.waitForURL((u) => !u.hash.startsWith('#/signin'), { timeout: 20_000 });
}
const frame = () => page.frameLocator(FRAME);
const pending = () => page.evaluate(() => JSON.parse(localStorage.getItem('sharecam.host.pendingPayment') || 'null'));
const hashQ = () => new URLSearchParams(new URL(page.url()).hash.split('?')[1] ?? '');
async function landedPaid(id, plan, timeout = 30_000) {
  await page.waitForURL((u) => {
    const q = new URLSearchParams(u.hash.split('?')[1]);
    return u.hash.startsWith(`#/e/${id}?`) && q.get('paid') === plan && q.get('via') === 'polar';
  }, { timeout });
  await page.locator(`[data-paid-notice="${plan}"]`).waitFor({ timeout });
}

try {
  await guard();
  log('local stack ok (demo-sharecam) · webCheckoutStart start/status and the mock Polar page stood in for by this script');

  log('\ncreate + buy through Polar (#/new?plan=party)');
  await signIn('host');
  await go('#/new?plan=party');
  await page.locator('.tile[data-plan="party"]').waitFor();
  const fn = page.locator('.footnote[data-provider]');
  await fn.waitFor();
  ok((await fn.getAttribute('data-provider')) === 'polar' && /Payments are processed by Polar, our merchant of record/.test(await fn.innerText()) && !/Paddle/.test(await fn.innerText()), `create page footnote: "${(await fn.innerText()).slice(0, 90)}…" (Polar, no Paddle)`);
  await page.locator('input.input').first().fill('Polar party (e2e)');
  await page.locator('form button[type=submit]').click();
  await page.waitForURL((u) => /#\/e\/[^/]+\/plan/.test(u.hash), { timeout: 20_000 });
  const id = /#\/e\/([^/?]+)/.exec(page.url())[1];
  await page.locator(FRAME).waitFor({ timeout: 20_000 });
  ok(starts.length === 1 && starts[0].planId === 'party' && starts[0].eventId === id, `fresh create opened the Polar checkout by itself (${starts[0]?.orderId})`);
  const src = await page.locator(FRAME).getAttribute('src');
  const q = new URL(src).searchParams;
  ok(src.startsWith(`${MOCK}/polar/checkout/`) && q.get('embed') === 'true' && q.get('embed_origin') === WEB && q.get('theme') === 'light', `embedded: ${src.split('?')[0]} (embed=true, embed_origin ${q.get('embed_origin')})`);
  await page.getByText('Finish the payment in the checkout window.').waitFor({ timeout: 10_000 });
  ok(true, 'loaded → the page says "Finish the payment in the checkout window."');
  await frame().locator('#close').click();
  await page.locator(FRAME).waitFor({ state: 'detached', timeout: 10_000 });
  await page.getByText('Your event is on Spark (free)').waitFor({ timeout: 10_000 });
  ok(true, 'close → the checkout goes, the package page says the event is on Spark (fresh create)');
  ok((await pending()) === null && (await getDoc(`events/${id}`)).planId === 'spark', 'nothing remembered, event still Spark');
  const pfn = page.locator('.footnote[data-provider]');
  ok((await pfn.getAttribute('data-provider')) === 'polar' && /Polar/.test(await pfn.innerText()), 'package page footnote names Polar');
  ok(await page.locator('[data-sandbox]').count() === 1, 'sandbox badge');

  log('\npay → applying → done');
  await page.locator('.tile[data-plan="party"]').click();
  await page.locator('[data-buy]').click();
  await page.locator(FRAME).waitFor({ timeout: 20_000 });
  const order = starts[starts.length - 1].orderId;
  await frame().locator('#pay').click();
  await page.getByText('Payment received').first().waitFor({ timeout: 10_000 });
  ok(await page.locator(FRAME).count() === 0 && new URL(page.url()).pathname === '/host/', 'success → the checkout closes, the page stays (no redirect to success_url), "Payment received"');
  const p = await pending();
  ok(p?.provider === 'polar' && p?.txn === order && p?.plan === 'party' && p?.eventId === id, `pending payment remembered: ${JSON.stringify(p && { provider: p.provider, txn: p.txn, plan: p.plan })}`);
  await page.reload();
  await page.getByText('Payment received').first().waitFor({ timeout: 10_000 });
  ok(true, 'a reload keeps "applying" (the pending payment, provider polar)');
  await applyPlan(id, 'party');
  await landedPaid(id, 'party');
  const notice = await page.locator('[data-paid-notice]').innerText();
  ok(/Party package is active\. Polar sends the receipt to your email\./.test(notice), `the event's own page (?paid=party&via=polar): "${notice.replace(/\s+/g, ' ').trim()}"`);
  ok((await pending()) === null, 'pending payment forgotten');

  log("\nPolar's hosted checkout returns (…/host/?checkout_id=<uuid>)");
  const ret = async (status, planId, eventId = id) => {
    const cid = randomUUID();
    orders.set(`po_${cid}`, { status, planId, eventId });
    await page.goto(`${WEB}/host/?checkout_id=${cid}`);
    return cid;
  };
  // applied → the event's own page at once
  await ret('applied', 'party');
  await landedPaid(id, 'party', 20_000);
  ok(!new URL(page.url()).searchParams.has('checkout_id'), 'applied → #/e/<id>?paid=party&via=polar, ?checkout_id dropped');
  // not applied yet → the package page waits, then done when the plan lands
  await ret('created', 'wedding');
  await page.waitForURL((u) => u.hash === `#/e/${id}/plan`, { timeout: 20_000 });
  await page.getByText('Payment received').first().waitFor({ timeout: 10_000 });
  ok(!new URL(page.url()).searchParams.has('checkout_id') && (await pending())?.provider === 'polar', 'not applied yet → the package page, "Payment received" (pending payment, provider polar), parameter dropped');
  await applyPlan(id, 'wedding');
  await landedPaid(id, 'wedding');
  ok(/Wedding package is active\. Polar sends the receipt/.test(await page.locator('[data-paid-notice]').innerText()), 'webhook lands → done → "Wedding package is active. Polar sends the receipt…"');
  // refused by the server → the package page asks the order at once and says why
  await ret('mismatch', 'unlimited');
  await page.waitForURL((u) => u.hash === `#/e/${id}/plan`, { timeout: 20_000 });
  await page.locator('.status.bad').waitFor({ timeout: 20_000 });
  ok(/could not be applied/.test(await page.locator('.status.bad').innerText()), 'refused order (mismatch) → "Your payment could not be applied"');
  // not ours (or none) → nothing opens
  const cid = randomUUID();
  await page.goto(`${WEB}/host/?checkout_id=${cid}`);
  await page.waitForURL((u) => !u.search.includes('checkout_id'), { timeout: 15_000 });
  await sleep(800);
  ok(new URL(page.url()).hash === '' || new URL(page.url()).hash === '#/', `an order that is not the caller's → parameter dropped, the list stays (${new URL(page.url()).hash || '(no hash)'})`);
  await page.goto(`${WEB}/host/?checkout_id=not-a-uuid`);
  await sleep(1500);
  ok(new URL(page.url()).searchParams.get('checkout_id') === 'not-a-uuid' && !(await page.locator('.status').count()), 'a malformed checkout_id is ignored (no status call)');

  log('\nfallback: the frame never loads → hosted checkout after 8 s');
  await go('#/e/c1-spark-web/plan');
  await page.locator('.tile[data-plan="party"]').click();
  neverLoad = true;
  const t0 = Date.now();
  await page.locator('[data-buy]').click();
  await page.getByText('Opening the secure checkout…').waitFor({ timeout: 5_000 });
  ok(true, 'while it waits: "Opening the secure checkout…"');
  const visited = await until(async () => (hostedVisits.length ? hostedVisits[0] : null), 15_000);
  const ms = Date.now() - t0;
  neverLoad = false;
  ok(!!visited && new URL(visited).searchParams.get('embed') === null && ms >= 7500 && ms < 14_000, `after ${ms} ms the page goes to the hosted checkout ${visited?.split('?')[0]}`);
  ok(await page.locator('[data-mock-polar]').count() === 0, 'the half-made frame was swept before leaving');
  ok((await pending()) === null && (await getDoc('events/c1-spark-web')).planId === 'spark', 'nothing remembered before the hosted page (it returns through ?checkout_id)');

  log('\nfinish');
  ok(forbidden.length === 0, `no request left loopback — no Paddle.js, no polar.sh (${forbidden.slice(0, 3).join(', ')})`);
  ok(pageErrors.length === 0, `page errors: ${pageErrors.length}${pageErrors.length ? `\n    ${pageErrors.slice(0, 8).join('\n    ')}` : ''}`);
} catch (e) {
  failures += 1;
  log(`  ✗ aborted: ${e.stack || e.message}`);
} finally {
  await browser.close();
}
log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
