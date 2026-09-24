// LOCAL END-TO-END of the host dashboard (plan §5 "Local e2e", WP-D) — against the
// LOCAL STACK only (EC `npm run local`: demo-sharecam emulators + mock Paddle).
// Refuses to run unless every URL is loopback and the Firestore emulator answers
// for demo-sharecam. Nothing real is touched; no production URL is ever opened.
//
// Drives the dashboard in the installed Chrome (playwright-core, headless) through
// every flow of plan §3.2-§3.4, asserts the documents the SERVER wrote (Firestore
// emulator REST with the emulator's owner token), and screenshots every state at
// 1440 and 390 px wide (same state, viewport resized) into $SHOTS (default: the
// working scratchpad) as D-<step>-<width>.png.
//
//   node e2e/local-host.mjs [--headed] [--no-shots] [--only=<step,...>] [--shots=<dir>]
//
// Steps (in order; each needs the ones before only where noted):
//   signin        sign-in page, wrong password, sign in as host@
//   list          event list (groups, deletion dates, storage-ends-soon panel)
//   c1            C1 overview / gallery (hide, show, delete) / guests (remove, restore)
//                 / settings (pause joins, read back) / package / downloads
//   buy           create "Web party" as Party via #/new (no kept-until / no-date line, the
//                 date through the site's date picker: keyboard contract, no past days)
//                 → declaration-free checkout
//                 → mock Pay → applied → the event's own page (?paid=party), not the list;
//                 every event field equal to what redeemEventPlan
//                 writes for the same product (EC main's inline code), ledger row the
//                 same shape, D8 create shape → done → redeliver (duplicate) → an
//                 AllShots transaction + adjustment: silent 200, no write, no alert →
//                 ?_ptxn=<that order> on the list lands on the event
//   upgrade       Party → Wedding on the package page: full $24.99 price (not the
//                 difference), fields again equal to redeem's
//   refund        refund the Wedding order (Party still paid → marked only), then the
//                 Party order → suspended (Spark quotas, AI off, retention kept,
//                 nothing deleted) → Refunded chip → ZIP refused → buy again → reactivated
//   chargeback    chargeback on C3's web order → suspended (nothing deleted) + unmuted
//                 alert → reverse → plan + limits back
//   discount      100 %-discount payment on C1 (Party) → failed state, event still Spark,
//                 alert; a 0.00 payment without a discount → no plan, alert
//   soon          purchases off → coming soon; empty@ (not a sandbox host) → coming soon
//   pro           pro@: create Pro 1000 via #/new?tier=pro → declaration → pay → done;
//                 overview (upload link, owner code), downloads (archive), L2 ladder,
//                 L3 asks for the declaration, P1 awaiting package
//   paired        pair with code PDCK34 (anonymous app host) → link-first banner, no
//                 Delete account / Delete event → link-account on the package page →
//                 linking an email that has an account → "already has an account" →
//                 link a new email → uid unchanged, package page opens
//   finish        0 page errors, 0 dashboard errorLogs
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(HERE, '..', 'package.json'));
const { chromium } = require('playwright-core');

const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a === `--${k}` || a.startsWith(`--${k}=`));
const value = (k) => flag(k)?.split('=').slice(1).join('=');
const HEADED = !!flag('headed');
const SHOTS = !flag('no-shots');
const ONLY = value('only') ? new Set(value('only').split(',')) : null;
const OUT = value('shots') || process.env.SHOTS || '/private/tmp/claude-501/-Users-berk/3220683d-4315-4acf-8db6-a71d91333cfb/scratchpad/sharecam-web/impl/shots';

const WEB = 'http://127.0.0.1:5187';
const MOCK = 'http://127.0.0.1:8797';
const FS = 'http://127.0.0.1:8380/v1/projects/demo-sharecam/databases/(default)/documents';
const STORAGE = 'http://127.0.0.1:9480/v0/b/sharecam-1997boz.firebasestorage.app';
const PASSWORD = 'sharecam-local';

// ---------------------------------------------------------------- guards
for (const u of [WEB, MOCK, FS, STORAGE]) {
  const h = new URL(u).hostname;
  if (h !== '127.0.0.1' && h !== 'localhost') throw new Error(`refusing: ${u} is not loopback`);
}
async function guard() {
  const r = await fetch(`${MOCK}/healthz`).catch(() => null);
  const j = r && r.ok ? await r.json() : null;
  if (!j || j.project !== 'demo-sharecam') throw new Error('the local stack is not running (EC: npm run local)');
  const f = await fetch(`${FS}/config/web`, { headers: { Authorization: 'Bearer owner' } }).catch(() => null);
  if (!f || !f.ok) throw new Error('Firestore emulator for demo-sharecam not reachable');
}

// ---------------------------------------------------------------- helpers
let failures = 0;
let passes = 0;
const log = (...a) => console.log(...a);
function ok(cond, msg) {
  if (cond) { passes += 1; log(`  ✓ ${msg}`); }
  else { failures += 1; log(`  ✗ ${msg}`); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function decode(v) {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields ?? {}).map(([k, x]) => [k, decode(x)]));
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(decode);
  return v;
}
const isInt = (v) => v && 'integerValue' in v;
async function getDoc(path) {
  const r = await fetch(`${FS}/${path}`, { headers: { Authorization: 'Bearer owner' } });
  if (r.status === 404) return null;
  const j = await r.json();
  return { data: Object.fromEntries(Object.entries(j.fields ?? {}).map(([k, v]) => [k, decode(v)])), raw: j.fields ?? {} };
}
async function query(collection, field, op, val) {
  const body = { structuredQuery: { from: [{ collectionId: collection }], where: { fieldFilter: { field: { fieldPath: field }, op, value: typeof val === 'number' ? { integerValue: String(val) } : { stringValue: val } } } } };
  const r = await fetch(`${FS}:runQuery`, { method: 'POST', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const rows = await r.json();
  return rows.filter((x) => x.document).map((x) => ({ id: x.document.name.split('/').pop(), data: Object.fromEntries(Object.entries(x.document.fields ?? {}).map(([k, v]) => [k, decode(v)])) }));
}
async function mock(path, body) {
  const r = await fetch(`${MOCK}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) });
  return r.json().catch(() => ({}));
}
/** Count aggregation: a top-level collection (`parent` '') or a subcollection. */
async function countDocs(parent, collectionId) {
  const url = parent ? `${FS}/${parent}:runAggregationQuery` : `${FS}:runAggregationQuery`;
  const body = { structuredAggregationQuery: { structuredQuery: { from: [{ collectionId }] }, aggregations: [{ alias: 'n', count: {} }] } };
  const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const rows = await r.json();
  return Number(rows?.[0]?.result?.aggregateFields?.n?.integerValue ?? NaN);
}
/** Objects under events/<id>/ in the Storage emulator. */
async function countFiles(eventId) {
  let n = 0;
  let token = '';
  do {
    const r = await fetch(`${STORAGE}/o?prefix=${encodeURIComponent(`events/${eventId}/`)}&maxResults=1000${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`, { headers: { Authorization: 'Bearer owner' } });
    const j = await r.json();
    n += (j.items ?? []).length;
    token = j.nextPageToken ?? '';
  } while (token);
  return n;
}
/** What exists for an event: document, media, guests, files — refunds must delete none of it. */
async function inventory(eventId) {
  const [ev, media, guests, files] = await Promise.all([getDoc(`events/${eventId}`), countDocs(`events/${eventId}`, 'media'), countDocs(`events/${eventId}`, 'guests'), countFiles(eventId)]);
  return { event: !!ev, media, guests, files };
}
/** The alerts the server would have pushed (read from the emulator log by the mock). */
async function alerts() {
  const r = await fetch(`${MOCK}/api/alerts`);
  return r.json();
}

// ---------------------------------------------------------------- redeemEventPlan reference
// What the App Store path writes for the same product — transcribed from EC main
// (5f03a8e) functions/src/purchases.ts:141-168, the inline object as it was
// BEFORE the planWrite.ts refactor, with the catalog-2 values of
// functions/src/plans.ts limitsSnapshot() (plans.ts is unchanged on feat/web-host).
// The web order must produce exactly these event fields and nothing else.
const REDEEM_PLANS = {
  party: { tier: 'consumer', uploadPolicy: 'all', limits2: { photos: 200, videos: 5, guests: 50, retentionDays: 30 } },
  wedding: { tier: 'consumer', uploadPolicy: 'all', limits2: { photos: 500, videos: 20, guests: 100, retentionDays: 180 } },
  pro1000: { tier: 'pro', uploadPolicy: 'host', limits2: { photos: 1000, videos: 0, guests: -1, retentionDays: 90 } },
};
function redeemWrites(planId, current) {
  const p = REDEEM_PLANS[planId];
  const refundedNow = current.refunded === true;
  return {
    planId,
    planPurchasedAt: '<now>',
    limits: p.limits2,
    planCatalog: 2,
    uploadPolicy: current.uploadPolicy === 'host' ? 'host' : p.uploadPolicy,
    ...(p.tier === 'pro' ? { mode: 'open', revealAt: null, aiPeopleEnabled: true } : {}),
    ...(refundedNow ? { refunded: false, refundRestoredAt: '<now>', refundRestoredBy: 'repurchase', planBeforeRefund: null, retentionAnchorAt: null } : {}),
  };
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/** Field by field: every redeem field equal, and no other field of the event changed. */
function compareToRedeem(label, planId, before, after, t0, t1) {
  const want = redeemWrites(planId, before);
  for (const [k, v] of Object.entries(want)) {
    if (v === '<now>') ok(typeof after[k] === 'number' && after[k] >= t0 - 2000 && after[k] <= t1 + 2000, `${label}: ${k} = ${after[k]} (number, the time of the apply)`);
    else ok(same(after[k], v), `${label}: ${k} = ${JSON.stringify(after[k])} (redeem: ${JSON.stringify(v)})`);
  }
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((k) => !same(before[k], after[k]));
  const extra = changed.filter((k) => !(k in want));
  ok(extra.length === 0, `${label}: changed fields ⊆ redeem's (${changed.sort().join(', ')})${extra.length ? ` — EXTRA: ${extra.join(', ')}` : ''}`);
}
/** The ledger row: redeem's keys (purchases.ts:124-135 + rev 2 catalog/limits), Paddle values. */
function compareLedger(label, row, { uid, eventId, planId, txn }) {
  const keys = ['addon', 'catalog', 'environment', 'eventId', 'limits', 'planId', 'productId', 'purchasedAt', 'redeemedAt', 'store', 'storeTransactionId', 'uid'];
  ok(row && same(Object.keys(row).sort(), keys), `${label}: ledger keys = redeem's (${row ? Object.keys(row).sort().join(', ') : 'no row'})`);
  if (!row) return;
  const product = planId.startsWith('pro') ? `sharecam.pro.${planId.slice(3).toLowerCase()}` : `sharecam.event.${planId}`;
  ok(row.uid === uid && row.eventId === eventId && row.productId === product && row.planId === planId && row.addon === null, `${label}: ledger uid/event/product/plan/addon`);
  ok(row.storeTransactionId === txn && row.store === 'paddle' && row.environment === 'sandbox' && typeof row.purchasedAt === 'number' && !!row.redeemedAt, `${label}: ledger store paddle, storeTransactionId ${row.storeTransactionId}, env sandbox`);
  ok(row.catalog === 2 && same(row.limits, REDEEM_PLANS[planId].limits2), `${label}: ledger catalog 2 + limits ${JSON.stringify(row.limits)}`);
}
async function until(fn, ms = 30_000, step = 400) {
  const end = Date.now() + ms;
  let last;
  while (Date.now() < end) {
    last = await fn().catch(() => null);
    if (last) return last;
    await sleep(step);
  }
  return last;
}

// ---------------------------------------------------------------- browser
const browser = await chromium.launch({ channel: 'chrome', headless: !HEADED });
const pageErrors = [];
let ctx = null;
let page = null;
/** A new browser profile: no session, no storage (the way to "sign out" completely). */
async function freshPage() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await ctx.newPage();
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|ERR_ABORTED|Failed to load resource/.test(m.text())) pageErrors.push(`console: ${m.text().slice(0, 240)}`);
  });
}
await freshPage();
if (SHOTS) mkdirSync(OUT, { recursive: true });

async function shot(name, { both = true } = {}) {
  if (!SHOTS) return;
  await sleep(500);
  await page.screenshot({ path: join(OUT, `D-${name}-1440.png`), fullPage: true });
  if (both) {
    await page.setViewportSize({ width: 390, height: 844 });
    await sleep(700);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) { failures += 1; log(`  ✗ ${name}: horizontal overflow ${overflow}px at 390`); }
    await page.screenshot({ path: join(OUT, `D-${name}-390.png`), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    await sleep(300);
  }
}
const go = async (hash) => {
  await page.goto(`${WEB}/host/${hash}`);
  await sleep(300);
};
async function signOutAll() {
  await freshPage();
}
async function signIn(who) {
  await signOutAll();
  await go('#/signin');
  await page.locator('input[type=email]').first().fill(`${who}@sharecam.local`);
  await page.locator('input[type=password]').first().fill(PASSWORD);
  await page.locator('form button[type=submit]').first().click();
  await page.waitForURL((u) => !u.hash.startsWith('#/signin'), { timeout: 20_000 });
}
const frame = () => page.frameLocator('iframe[title="Local test checkout"]');
async function payInMock(button = '#pay') {
  await page.locator('iframe[title="Local test checkout"]').waitFor({ timeout: 20_000 });
  await frame().locator(button).click();
}
async function lastOrderFor(eventId) {
  const rows = await query('webOrders', 'eventId', 'EQUAL', eventId);
  return rows.sort((a, b) => (b.data.at ?? 0) - (a.data.at ?? 0))[0] ?? null;
}
const run = (step) => !ONLY || ONLY.has(step);
// Local calendar days (the picker's value is 'YYYY-MM-DD' in the browser's time zone = this machine's).
const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const plusDays = (n) => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate() + n, 12); };
const plusMonthsIso = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number);
  const last = new Date(y, m - 1 + n + 1, 0, 12).getDate();
  return isoLocal(new Date(y, m - 1 + n, Math.min(d, last), 12));
};
const focusedDay = () => page.evaluate(() => document.activeElement?.getAttribute('data-day') ?? null);
const pickerClosed = () => page.waitForFunction(() => !document.querySelector('dialog[open]'), null, { timeout: 5_000 });
/** After a payment the package page takes the host to the event's own page (?paid=<plan>). */
async function landedPaid(id, plan, timeout = 45_000) {
  await page.waitForURL((u) => u.hash.startsWith(`#/e/${id}?`) && new URLSearchParams(u.hash.split('?')[1]).get('paid') === plan, { timeout });
  await page.locator(`[data-paid-notice="${plan}"]`).waitFor({ timeout });
}

// ---------------------------------------------------------------- steps
const ctxState = {};
try {
  await guard();
  log('local stack ok (demo-sharecam)');

  if (run('signin')) {
    log('\nsignin');
    await signOutAll();
    await go('#/');
    await page.waitForURL((u) => u.hash.startsWith('#/signin'), { timeout: 10_000 });
    ok(true, 'signed out → #/signin');
    await page.getByRole('button', { name: /Continue with Apple/ }).waitFor();
    ok(await page.getByRole('button', { name: /Continue with Apple/ }).isDisabled(), 'Apple sign-in shown as "coming" (no Services ID yet, D3)');
    await shot('signin');
    // Fix pass (review P1): a web-first host is never sent to the app first.
    ok((await page.locator('[data-new-cta]').getAttribute('href')) === '#/new', 'sign-in page: "Create your event — no app needed" → #/new');
    ok(!/do that first/.test(await page.locator('main').innerText()), 'no "sign in to the app first" advice on the sign-in page');
    await page.locator('[data-new-account]').click();
    await page.locator('form button[type=submit]', { hasText: 'Create account' }).waitFor();
    ok((await page.locator('[data-to-signin]').innerText()).trim() === 'Already have an account? Sign in', '"Create an account" → the form in create mode, "Already have an account? Sign in"');
    await page.locator('[data-to-signin]').click();
    await page.locator('input[type=email]').fill('host@sharecam.local');
    await page.locator('input[type=password]').fill('wrong-password');
    await page.locator('form button[type=submit]').click();
    await page.locator('.err').waitFor({ timeout: 10_000 });
    ok(/Wrong email or password/.test(await page.locator('.err').innerText()), 'wrong password → "Wrong email or password."');
    // An email with no account (the emulator says user-not-found; production's
    // enumeration protection says invalid-credential for both): offer to create it.
    await page.locator('input[type=email]').fill(`nobody-${Date.now()}@sharecam.local`);
    await page.locator('form button[type=submit]').click();
    await page.locator('[data-create-with-email]').waitFor({ timeout: 10_000 });
    ok(true, 'no account for this email → "Create an account with this email" offered');
    await shot('signin-error', { both: false });
    await page.getByRole('button', { name: 'Pair with the app' }).click();
    await page.locator('.pair-qr svg').waitFor({ timeout: 20_000 });
    ok(true, 'pairing QR shown (createUploadPairing on the guest session)');
    await shot('signin-pair');
    await signIn('host');
    ok(true, 'host@ signed in');
  }

  if (run('list')) {
    log('\nlist');
    if (!run('signin')) await signIn('host');
    await go('#/');
    await page.locator('.ev-row').first().waitFor();
    const n = await page.locator('.ev-row').count();
    ok(n >= 8, `host@ sees ${n} events`);
    ok(await page.locator('[data-event="c5-refunded-party"] .tag.danger').count() === 1, 'refunded event carries the Refunded chip');
    ok(await page.locator('.expiry-list [data-expiring]').count() >= 1, 'storage-ends-soon panel lists events within 14 days (D19)');
    ok(await page.locator('#g-pro').count() === 0, 'consumer account: no "Photographer events" group');
    await shot('list');
  }

  if (run('c1')) {
    log('\nc1');
    await signIn('host');
    await go('#/e/c1-spark-web');
    await page.locator('[data-code]').waitFor();
    ok((await page.locator('[data-code]').innerText()).trim() === 'CAKE34', 'overview shows the code');
    ok(await page.locator('.linkbox code').first().innerText().then((s) => s.includes('code=CAKE34')), 'guest link carries the code');
    await shot('c1-overview');
    // gallery
    await go('#/e/c1-spark-web/gallery');
    await page.locator('.gcell').first().waitFor();
    const before = (await getDoc('events/c1-spark-web')).data.photoCount;
    const firstId = await page.locator('.gcell').first().getAttribute('data-media');
    await page.locator('.gcell').first().hover();
    await page.locator('.gcell').first().locator('.acts button').first().click();
    await until(async () => (await getDoc(`events/c1-spark-web/media/${firstId}`)).data.hidden === true);
    ok((await getDoc(`events/c1-spark-web/media/${firstId}`)).data.hidden === true, 'hide → media.hidden = true');
    await shot('c1-gallery');
    // Lightbox by keyboard (review P1): focus goes in, Tab stays in, Escape returns it.
    await page.locator('.gcell').nth(1).locator('button.open').focus();
    await page.keyboard.press('Enter');
    await page.locator('.lb').waitFor();
    const inLb = () => page.evaluate(() => !!document.activeElement?.closest('.lb'));
    ok(await inLb(), 'lightbox opened by keyboard: focus is inside');
    for (let i = 0; i < 9; i += 1) await page.keyboard.press('Tab');
    ok(await inLb(), 'lightbox: Tab stays inside (focus trap)');
    await page.keyboard.press('Shift+Tab');
    ok(await inLb(), 'lightbox: Shift+Tab stays inside');
    await page.keyboard.press('Escape');
    await page.locator('.lb').waitFor({ state: 'detached' });
    ok(await page.evaluate(() => !!document.activeElement?.matches('.gcell button.open')), 'lightbox closed: focus back on the photo that opened it');
    await page.locator('.gcell').first().locator('button.open').click();
    await page.locator('.lb').waitFor();
    await shot('c1-lightbox');
    await page.locator('.lb-bar button', { hasText: 'Show to guests' }).click();
    await until(async () => (await getDoc(`events/c1-spark-web/media/${firstId}`)).data.hidden === false);
    ok((await getDoc(`events/c1-spark-web/media/${firstId}`)).data.hidden === false, 'show → media.hidden = false');
    await page.locator('.lb-bar button', { hasText: 'Delete' }).click();
    await page.locator('.dialog').waitFor();
    await shot('c1-delete-confirm', { both: false });
    await page.locator('.dialog button', { hasText: 'Delete' }).click();
    await until(async () => (await getDoc(`events/c1-spark-web/media/${firstId}`)) === null);
    ok((await getDoc(`events/c1-spark-web/media/${firstId}`)) === null, 'delete → media document gone');
    const after = await until(async () => { const c = (await getDoc('events/c1-spark-web')).data.photoCount; return c === before - 1 ? c : null; }, 20_000);
    ok(after === before - 1, `photoCount ${before} → ${after} (server counter)`);
    await page.keyboard.press('Escape');
    // reported filter
    await page.locator('.seg button', { hasText: 'Reported' }).click();
    ok(await page.locator('.gcell .tag.danger').count() >= 1, 'reported filter shows the reported photo');
    await shot('c1-gallery-reported', { both: false });
    // guests
    await go('#/e/c1-spark-web/guests');
    await page.locator('.grow-row').first().waitFor();
    const g = page.locator('.grow-row:not(.banned)').first();
    const gid = await g.getAttribute('data-guest');
    await g.locator('button').click();
    await page.locator('.dialog').waitFor();
    await page.locator('.dialog button', { hasText: 'Remove' }).click();
    await until(async () => (await getDoc(`events/c1-spark-web/guests/${gid}`)).data.banned === true);
    ok((await getDoc(`events/c1-spark-web/guests/${gid}`)).data.banned === true, 'remove guest → banned = true');
    await shot('c1-guests');
    await page.locator(`[data-guest="${gid}"] button`).click();
    await until(async () => (await getDoc(`events/c1-spark-web/guests/${gid}`)).data.banned === false);
    ok((await getDoc(`events/c1-spark-web/guests/${gid}`)).data.banned === false, 'restore guest → banned = false');
    // settings
    await go('#/e/c1-spark-web/settings');
    await page.locator('.setting').first().waitFor();
    await page.locator('.setting', { hasText: 'Pause new joins' }).click();
    await until(async () => (await getDoc('events/c1-spark-web')).data.joinPaused === true);
    ok((await getDoc('events/c1-spark-web')).data.joinPaused === true, 'pause joins → joinPaused = true (read back)');
    await shot('c1-settings');
    await page.locator('.setting', { hasText: 'Pause new joins' }).click();
    await until(async () => (await getDoc('events/c1-spark-web')).data.joinPaused === false);
    ok((await getDoc('events/c1-spark-web')).data.joinPaused === false, 'unpause → joinPaused = false');
    await page.locator('.setting', { hasText: 'Private mode' }).click();
    await until(async () => (await getDoc('events/c1-spark-web')).data.mode === 'private');
    ok((await getDoc('events/c1-spark-web')).data.mode === 'private', 'private mode on → mode = private');
    await page.locator('.setting', { hasText: 'Private mode' }).click();
    await page.locator('.dialog').waitFor();
    await shot('c1-reveal-confirm', { both: false });
    await page.locator('.dialog button', { hasText: 'Yes, open it' }).click();
    await until(async () => (await getDoc('events/c1-spark-web')).data.mode === 'open');
    ok((await getDoc('events/c1-spark-web')).data.mode === 'open', 'reveal → mode = open');
    // package + downloads
    await go('#/e/c1-spark-web/plan');
    await page.locator('.tile').first().waitFor();
    ok(await page.locator('.tile').count() === 3, 'Spark consumer event: Party / Wedding / Unlimited offered');
    ok(await page.locator('[data-sandbox]').count() === 1, 'sandbox badge (env sandbox)');
    ok(/Paddle, our merchant of record/.test(await page.locator('.footnote').last().innerText()), 'checkout footnote names Paddle as merchant of record');
    await shot('c1-plan');
    await go('#/e/c1-spark-web/downloads');
    await page.locator('[data-zip]').click();
    const zipOk = await page.locator('[data-zip-link]').waitFor({ timeout: 90_000 }).then(() => true).catch(() => false);
    ok(zipOk, 'createEventZip → download link');
    await shot('c1-downloads');
  }

  if (run('buy')) {
    log('\nbuy (create + pay Party)');
    await signIn('host');
    await go('#/new?plan=party');
    await page.locator('input.input').first().waitFor();
    await page.locator('.tile[data-plan="party"]').waitFor();
    // Empty name → the button takes you to the error (review P1).
    await page.locator('form button[type=submit]').click();
    await page.locator('#new-name-err').waitFor();
    ok(await page.evaluate(() => !!document.activeElement?.matches('[data-name-input]')) && (await page.locator('[data-name-input]').getAttribute('aria-describedby')) === 'new-name-err', 'empty name → focus on the name field, error tied to it (aria-describedby, role=alert)');
    // No "Kept until …" / no-date storage line next to the package, and no "(the same
    // rule as in the app)" aside (owner feedback, 24 Sep 2026).
    const newText = await page.locator('main').innerText();
    ok((await page.locator('[data-kept-until], [data-no-date-warn]').count()) === 0 && !/Kept until|storage starts today and ends on/.test(newText), 'create page: no "Kept until …" / no-date storage warning next to the package');
    ok(/Name and date can’t be changed later\./.test(newText) && !/same rule as in the app/.test(newText), 'create page: "Name and date can’t be changed later." without "(the same rule as in the app)"');
    await page.locator('input.input').first().fill('Web party (e2e)');
    // The date: the site's own calendar, not the browser's (WAI-ARIA date picker contract).
    ok(await page.locator('input[type=date]').count() === 0, 'no native <input type=date> on the create page');
    const TODAY = isoLocal(plusDays(0));
    await page.locator('[data-date-field]').click();
    await page.locator('dialog[open][data-date-dialog="popover"] [role=grid]').waitFor();
    ok(await focusedDay() === TODAY && (await page.locator(`button[data-day="${TODAY}"]`).getAttribute('aria-current')) === 'date', `picker (popover at 1440) opens on today ${TODAY}, marked aria-current=date`);
    ok((await page.locator('.dp-grid th').first().getAttribute('abbr')) === 'Sunday' && (await page.locator('dialog[open]').getAttribute('aria-labelledby')) === 'new-date-label', 'en: week starts on Sunday; the dialog is named by the field label');
    await page.keyboard.press('ArrowLeft');
    ok(await focusedDay() === TODAY, 'no past days (the app\'s minimumDate): ArrowLeft from today stays on today');
    await page.keyboard.press('ArrowRight');
    ok(await focusedDay() === isoLocal(plusDays(1)), 'ArrowRight → tomorrow');
    await page.keyboard.press('ArrowDown');
    ok(await focusedDay() === isoLocal(plusDays(8)), 'ArrowDown → a week later');
    await page.keyboard.press('Home');
    const wkStart = await focusedDay();
    await page.keyboard.press('End');
    const wkEnd = await focusedDay();
    ok(new Date(`${wkStart}T12:00:00`).getDay() === 0 && new Date(`${wkEnd}T12:00:00`).getDay() === 6, `Home / End → Sunday ${wkStart} / Saturday ${wkEnd}`);
    const m0 = await page.locator('.dp-month').innerText();
    await page.keyboard.press('PageDown');
    const m1 = await page.locator('.dp-month').innerText();
    ok(m1 !== m0 && await focusedDay() === plusMonthsIso(wkEnd, 1), `PageDown → next month (${m0} → ${m1})`);
    await page.keyboard.press('Shift+PageDown');
    ok(await focusedDay() === plusMonthsIso(wkEnd, 13), 'Shift+PageDown → a year on');
    await page.keyboard.press('Shift+PageUp');
    await page.keyboard.press('PageUp');
    ok(await focusedDay() === wkEnd, 'Shift+PageUp, PageUp → back');
    await page.keyboard.press('Escape');
    await pickerClosed();
    ok(await page.evaluate(() => !!document.activeElement?.matches('[data-date-field]')) && (await page.locator('[data-date-value]').getAttribute('data-date-value')) === '', 'Escape closes, focus back on the field, nothing picked');
    const TARGET = isoLocal(plusDays(51));
    await page.locator('[data-date-field]').click();
    await page.locator('dialog[open] [role=grid]').waitFor();
    for (let i = 0; i < 7; i += 1) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await pickerClosed();
    ok((await page.locator('[data-date-value]').getAttribute('data-date-value')) === TARGET && await page.evaluate(() => !!document.activeElement?.matches('[data-date-field]')), `Enter picks ${TARGET} ("${await page.locator('[data-date-value]').innerText()}"), focus back on the field`);
    await page.locator('[data-date-clear]').click();
    ok((await page.locator('[data-date-value]').getAttribute('data-date-value')) === '', 'Remove date (×) clears it');
    await page.locator('[data-date-field]').click();
    await page.locator('dialog[open] [role=grid]').waitFor();
    for (let i = 0; i < 3 && (await page.locator(`button[data-day="${TARGET}"]`).count()) === 0; i += 1) await page.locator('[data-dp-next]').click();
    await shot('new-date-picker');
    await page.locator(`button[data-day="${TARGET}"]`).click();
    await pickerClosed();
    ok((await page.locator('[data-date-value]').getAttribute('data-date-value')) === TARGET, `mouse: next month → ${TARGET}`);
    await shot('new-consumer');
    await page.locator('form button[type=submit]').click();
    await page.waitForURL((u) => /#\/e\/[^/]+\/plan/.test(u.hash), { timeout: 20_000 });
    const id = /#\/e\/([^/?]+)/.exec(page.url())[1];
    ctxState.buyId = id;
    const created = await getDoc(`events/${id}`);
    ok(isInt(created.raw.createdAt), 'D8: createdAt is a NUMBER');
    ok(created.data.date === TARGET, `D8: date written as before ('${created.data.date}', YYYY-MM-DD)`);
    ok(created.data.origin === 'web' && created.data.planId === 'spark' && created.data.code && !created.data.code.startsWith('P'), 'created as Spark, origin web, consumer code');
    await page.locator('iframe[title="Local test checkout"]').waitFor({ timeout: 20_000 });
    ok(true, 'fresh create with ?plan=party opens the checkout by itself');
    ok(/14[.,]99/.test(await frame().locator('body').innerText()), 'checkout shows $14.99');
    await shot('checkout-mock', { both: false });
    const before = (await getDoc(`events/${id}`)).data;
    const t0 = Date.now();
    await payInMock('#pay');
    await landedPaid(id, 'party');
    const t1 = Date.now();
    ok(/Party package is active/.test(await page.locator('[data-paid-notice]').innerText()) && (await page.locator('#pkg-h').innerText()).trim() === 'Party', 'UI: applying → done → the event\'s own page (not the list): "Party package is active", package card Party');
    ok(!/Kept until/.test(await page.locator('.ev-head').innerText()) && (await page.locator('[data-deletion]').count()) === 1, 'event header: no "Kept until …" line; the package card keeps its plain "Kept until" fact');
    await shot('buy-done');
    const ev = (await getDoc(`events/${id}`)).data;
    compareToRedeem('Party (web) vs redeem', 'party', before, ev, t0, t1);
    const order = await lastOrderFor(id);
    ctxState.buyTxn = order?.id;
    ok(order?.data.status === 'applied' && order.data.env === 'sandbox' && Number(order.data.amount) === 1499 && order.data.currency === 'USD', `order ${order?.id} applied (sandbox, ${order?.data.amount} ${order?.data.currency})`);
    const red = await getDoc(`redemptions/pd_${order?.id}`);
    compareLedger('Party ledger', red?.data, { uid: created.data.hostId, eventId: id, planId: 'party', txn: order?.id });
    const redeliver = await mock(`/api/orders/${order.id}/redeliver`);
    ok(redeliver.status === 200 && /duplicate/.test(redeliver.body ?? ''), `redeliver → ${redeliver.status} ${redeliver.body}`);
    // The other app on the shared Paddle account: silent 200, nothing written, nothing alerted (D12).
    const counts = async () => Object.fromEntries(await Promise.all(['webOrders', 'storeNotifications', 'redemptions', 'refundState', 'events'].map(async (c) => [c, await countDocs('', c)])));
    await sleep(1500); // let earlier log lines land
    const [c0, a0] = [await counts(), (await alerts()).count];
    const foreign = await mock('/api/foreign/transaction');
    ok(foreign.status === 200 && /other-app/.test(foreign.body ?? '') && /no webOrders doc/.test(foreign.body ?? ''), `AllShots transaction.completed → ${foreign.status} ${foreign.body}`);
    const foreignAdj = await mock('/api/foreign/adjustment');
    ok(foreignAdj.status === 200 && /other-app/.test(foreignAdj.body ?? '') && /no webOrders doc/.test(foreignAdj.body ?? ''), `AllShots refund (adjustment) → ${foreignAdj.status} ${foreignAdj.body}`);
    await sleep(1500);
    const [c1, a1] = [await counts(), (await alerts()).count];
    ok(same(c0, c1), `foreign traffic wrote nothing (${JSON.stringify(c1)})`);
    ok(a1 === a0, `foreign traffic raised no alert (${a0} → ${a1})`);
    await go(`#/e/${id}`);
    await page.locator('[data-code]').waitFor();
    await shot('buy-overview');
    // A Paddle payment link / return (…/join/host/?_ptxn=…, D13) opens the list: it
    // lands on the order's event instead, and a paid order is not opened again.
    await page.goto(`${WEB}/host/?_ptxn=${order.id}`);
    await landedPaid(id, 'party', 20_000);
    ok(!new URL(page.url()).searchParams.has('_ptxn'), `?_ptxn=<applied order> → #/e/${id} ("Party package is active"), the parameter dropped`);
  }

  if (run('upgrade')) {
    log('\nupgrade Party → Wedding (full price)');
    const id = ctxState.buyId;
    if (!id) throw new Error('upgrade needs the buy step');
    const pv = await mock('/api/call', { who: 'host', fn: 'webCheckoutStart', data: { preview: true, eventId: id } });
    const opts = pv.result?.options ?? [];
    ok(pv.ok && pv.result.current === 'party' && same(opts.map((o) => o.planId), ['wedding', 'unlimited']), `preview on a Party event offers ${opts.map((o) => `${o.planId} $${o.usd}`).join(', ')}`);
    ok(opts.find((o) => o.planId === 'wedding')?.usd === 24.99, 'Wedding offered at its full price $24.99 (D7), no difference SKU');
    await go(`#/e/${id}/plan`);
    await page.locator('.tile[data-plan="wedding"]').waitFor();
    const tiles = await page.locator('.tile').evaluateAll((els) => els.map((e) => e.getAttribute('data-plan')));
    ok(same(tiles, ['wedding', 'unlimited']), `package page tiles: ${tiles.join(', ')}`);
    ok(/24[.,]99/.test(await page.locator('.tile[data-plan="wedding"]').innerText()), 'Wedding tile shows $24.99');
    await page.locator('.tile[data-plan="wedding"]').click();
    await page.locator('[data-buy]').click();
    await page.locator('iframe[title="Local test checkout"]').waitFor({ timeout: 20_000 });
    const pending = await lastOrderFor(id);
    ok(pending?.data.status === 'created' && pending.data.productId === 'sharecam.event.wedding' && pending.data.priceId === 'pri_local_sbx_wedding' && pending.data.from === 'party', `order ${pending?.id}: ${pending?.data.productId}, price ${pending?.data.priceId}, from ${pending?.data.from}`);
    ok(/24[.,]99/.test(await frame().locator('body').innerText()), 'checkout shows $24.99 (full price)');
    await shot('upgrade-checkout', { both: false });
    const before = (await getDoc(`events/${id}`)).data;
    const t0 = Date.now();
    await payInMock('#pay');
    await landedPaid(id, 'wedding');
    const t1 = Date.now();
    ok((await page.locator('#pkg-h').innerText()).trim() === 'Wedding', 'upgrade done → the event\'s own page, package card Wedding');
    const ev = (await getDoc(`events/${id}`)).data;
    compareToRedeem('Party → Wedding (web) vs redeem', 'wedding', before, ev, t0, t1);
    const order = await getDoc(`webOrders/${pending.id}`);
    ok(order?.data.status === 'applied' && Number(order.data.amount) === 2499 && order.data.planBefore === 'party', `charged ${order?.data.amount} cents = the full Wedding price (not the $10.00 difference), planBefore ${order?.data.planBefore}`);
    const red = await getDoc(`redemptions/pd_${pending.id}`);
    compareLedger('Wedding ledger', red?.data, { uid: ev.hostId, eventId: id, planId: 'wedding', txn: pending.id });
    ctxState.upTxn = pending.id;
    await shot('upgrade-done');
  }

  if (run('refund')) {
    log('\nrefund → suspended (nothing deleted) → buy again');
    const id = ctxState.buyId;
    const txn = ctxState.buyTxn;
    const upTxn = ctxState.upTxn;
    if (!id || !txn || !upTxn) throw new Error('refund needs the buy and upgrade steps');
    // Give the event something to lose: a guest and two photos (files in Storage).
    await mock(`/api/events/${id}/guest`);
    await mock(`/api/events/${id}/photo`);
    await mock(`/api/events/${id}/photo`);
    const inv0 = await until(async () => { const i = await inventory(id); return i.media >= 2 && i.files >= 2 ? i : null; });
    ok(!!inv0, `before the refunds: ${JSON.stringify(inv0)}`);
    // 1) the Wedding order only: the Party payment still stands → not net-zero → the
    //    upgrade is ROLLED BACK to Party (fix pass, review P1): Party's quota, the paid
    //    storage kept, no refunded mark (Party's ZIP stays open), refundState 'rollback'.
    const r1 = await mock(`/api/orders/${upTxn}/refund`);
    ok(r1.approved?.status === 200 && /rolled-back/.test(r1.approved?.body ?? ''), `refund of the Wedding order → ${r1.approved?.status} ${r1.approved?.body}`);
    const m = await until(async () => { const d = (await getDoc(`events/${id}`)).data; return d.planId === 'party' ? d : null; });
    const rs = await getDoc(`refundState/${id}`);
    ok(m?.planId === 'party' && m?.limits?.photos === 200 && m?.limits?.retentionDays === 180 && m?.refunded !== true && rs?.data.mode === 'rollback' && rs?.data.planBeforeRefund === 'wedding',
      `not net-zero (Party still paid): rolled back to ${m?.planId}, limits ${JSON.stringify(m?.limits)}, refunded ${m?.refunded ?? false}, refundState ${rs?.data.mode}/${rs?.data.planBeforeRefund}`);
    await go(`#/e/${id}/downloads`);
    await page.locator('[data-zip]').waitFor();
    ok(true, 'rolled back: downloads stay on for the Party still paid');
    // 2) the Party order too → net-zero → suspended.
    const a0 = (await alerts()).count;
    const r = await mock(`/api/orders/${txn}/refund`);
    ok(r.approved?.status === 200, `refund of the Party order → ${r.approved?.status} ${r.approved?.body}`);
    const ev = await until(async () => { const d = (await getDoc(`events/${id}`)).data; return d.planId === 'spark' ? d : null; });
    ok(ev?.refunded === true && ev?.planId === 'spark' && ev?.limits?.photos === 50 && ev?.limits?.guests === 10 && ev?.limits?.retentionDays === 180 && ev?.aiPeopleEnabled === false && !ev?.retentionAnchorAt, `suspended: plan ${ev?.planId}, limits ${JSON.stringify(ev?.limits)}, AI ${ev?.aiPeopleEnabled}, no retentionAnchorAt`);
    const st = await getDoc(`refundState/${id}`);
    ok(st?.data.mode === 'suspend' && st?.data.planBeforeRefund === 'party' && st?.data.limitsBeforeRefund?.photos === 200, `refundState stash: ${st?.data.mode} ${st?.data.planBeforeRefund} ${JSON.stringify(st?.data.limitsBeforeRefund)}`);
    const inv1 = await inventory(id);
    ok(same(inv0, inv1), `nothing deleted: ${JSON.stringify(inv1)}`);
    const al = (await alerts()).alerts.slice(a0);
    ok(al.some((x) => /^Web iadesi/.test(x.title ?? '') && !x.muted), `web refund + suspension alerted (unmuted): ${al.map((x) => x.title).join(' | ')}`);
    await go('#/');
    await page.locator(`[data-event="${id}"] .tag.danger`).waitFor();
    ok(true, 'list: Refunded chip');
    await go(`#/e/${id}/downloads`);
    await page.locator('.notice.gold').first().waitFor();
    ok(/refunded/i.test(await page.locator('.notice.gold').first().innerText()), 'downloads off for refunded events');
    await shot('refund-downloads');
    await go(`#/e/${id}/plan`);
    await page.locator('.tile').first().waitFor();
    ok(/This event was refunded/.test(await page.locator('main').innerText()), 'package page: "This event was refunded; buying again reactivates it"');
    await shot('refund-plan');
    await page.locator('.tile[data-plan="party"]').click();
    await page.locator('[data-buy]').click();
    const before = (await getDoc(`events/${id}`)).data;
    const t0 = Date.now();
    await payInMock('#pay');
    await landedPaid(id, 'party');
    const back = (await getDoc(`events/${id}`)).data;
    compareToRedeem('repurchase after refund (web) vs redeem', 'party', before, back, t0, Date.now());
    ok((await getDoc(`refundState/${id}`)) === null, 'repurchase deleted refundState');
    ok(same(await inventory(id), inv0), 'still nothing deleted after the repurchase');
  }

  if (run('chargeback')) {
    log('\nchargeback on C3 → suspended → reverse');
    await signIn('host');
    const inv0 = await inventory('c3-wedding-web');
    await sleep(1500);
    const a0 = (await alerts()).count;
    const cb = await mock('/api/orders/txn_local_seed_0001/chargeback');
    ok(cb.status === 200, `chargeback → ${cb.status} ${cb.body}`);
    const s = await until(async () => { const d = (await getDoc('events/c3-wedding-web')).data; return d.refunded === true ? d : null; });
    ok(s?.planId === 'spark' && s?.aiPeopleEnabled === false && s?.limits?.retentionDays === 180 && s?.limits?.photos === 50 && !s?.retentionAnchorAt, `C3 suspended (Spark quotas ${JSON.stringify(s?.limits)}, AI off, paid retention kept, no deletion clock)`);
    const inv1 = await inventory('c3-wedding-web');
    ok(inv0.media > 0 && inv0.files > 0 && same(inv0, inv1), `chargeback deleted nothing: ${JSON.stringify(inv0)} → ${JSON.stringify(inv1)}`);
    const cbAlerts = await until(async () => { const al = (await alerts()).alerts.slice(a0); return al.some((x) => /^Chargeback/.test(x.title ?? '')) ? al : null; }, 15_000);
    const cbAlert = cbAlerts?.find((x) => /^Chargeback/.test(x.title ?? ''));
    ok(!!cbAlert && !cbAlert.muted, `chargeback alert (unmuted, D18): ${cbAlert ? `${cbAlert.title} — ${cbAlert.body}` : 'none'}`);
    await go('#/e/c3-wedding-web');
    await page.locator('[data-code]').waitFor();
    await shot('chargeback-overview');
    const rev = await mock('/api/orders/txn_local_seed_0001/chargeback-reverse');
    ok(rev.status === 200, `chargeback reverse → ${rev.status} ${rev.body}`);
    const back = await until(async () => { const d = (await getDoc('events/c3-wedding-web')).data; return d.refunded === false ? d : null; });
    ok(back?.planId === 'wedding' && back?.limits?.photos === 500, `restored: plan ${back?.planId}, limits ${JSON.stringify(back?.limits)}`);
  }

  if (run('discount')) {
    log('\n100 % discount → failed');
    await signIn('host');
    await go('#/e/c1-spark-web/plan');
    await page.locator('.tile[data-plan="party"]').click();
    await page.locator('[data-buy]').click();
    await payInMock('#hold');
    await page.locator('.status').first().waitFor({ timeout: 20_000 });
    const order = await lastOrderFor('c1-spark-web');
    const d = await mock(`/api/orders/${order.id}/discount100`);
    ok(d.status === 200 && /discounted/.test(d.body ?? ''), `100 % discount delivery → ${d.body}`);
    // A reload after 90 s lands on "slow", which asks the server about the order.
    await page.evaluate(() => {
      const raw = localStorage.getItem('sharecam.host.pendingPayment');
      if (raw) { const p = JSON.parse(raw); p.at = Date.now() - 100_000; localStorage.setItem('sharecam.host.pendingPayment', JSON.stringify(p)); }
    });
    await page.reload();
    await page.locator('.status.bad').waitFor({ timeout: 30_000 });
    ok(/could not be applied/.test(await page.locator('.status.bad').innerText()), 'UI: "Your payment could not be applied; we refund it"');
    ok((await getDoc('events/c1-spark-web')).data.planId === 'spark', 'event still Spark');
    ok((await getDoc(`redemptions/pd_${order.id}`)) === null && (await getDoc(`webOrders/${order.id}`))?.data.status === 'discounted', 'no ledger row, order "discounted"');
    const dAlert = (await until(async () => { const al = (await alerts()).alerts; return al.find((x) => (x.body ?? '').includes(order.id)) ?? null; }, 15_000));
    ok(!!dAlert && !dAlert.muted && /İndirimli ya da sıfır tutarlı/.test(dAlert.body ?? ''), `discount alert: ${dAlert ? `${dAlert.title} — ${dAlert.body}` : 'none'}`);
    await shot('discount-failed');
    // A 0.00 payment WITHOUT a discount code (a mis-set price or a $0 payment link): subtotal 0.
    const opened = await mock('/api/call', { who: 'host', fn: 'webCheckoutStart', data: { eventId: 'c1-spark-web', planId: 'party' } });
    const zTxn = opened.result?.transactionId;
    ok(opened.ok && /^txn_/.test(zTxn ?? ''), `second order opened through webCheckoutStart: ${zTxn}`);
    const z = await mock(`/api/orders/${zTxn}/zero-amount`);
    ok(z.status === 200 && /discounted|mismatch/.test(z.body ?? ''), `0.00 delivery → ${z.status} ${z.body}`);
    ok((await getDoc('events/c1-spark-web')).data.planId === 'spark' && (await getDoc(`redemptions/pd_${zTxn}`)) === null, 'still Spark, no ledger row');
    const zAlert = (await until(async () => { const al = (await alerts()).alerts; return al.find((x) => (x.body ?? '').includes(zTxn)) ?? null; }, 15_000));
    ok(!!zAlert && !zAlert.muted, `0.00 alert: ${zAlert ? `${zAlert.title} — ${zAlert.body}` : 'none'}`);
  }

  if (run('soon')) {
    log('\ncoming soon');
    await signIn('host');
    await mock('/api/config', { purchasesEnabled: false });
    await go('#/e/c1-spark-web/plan');
    await page.locator('.notice').first().waitFor();
    ok(/coming soon/i.test(await page.locator('main').innerText()), 'purchases off → coming soon');
    await shot('soon-off');
    await mock('/api/config', { purchasesEnabled: true });
    await signIn('empty');
    await go('#/');
    await page.locator('.empty').waitFor();
    await shot('empty-list');
    await go('#/new');
    await page.locator('.tile').first().waitFor();
    ok(await page.locator('.tile[data-plan="spark"][aria-pressed="true"]').count() === 1 && /come to the web soon/.test(await page.locator('main').innerText()), 'not a sandbox host: paid tiles "on the web soon", Spark picked');
    await shot('empty-new');
  }

  if (run('pro')) {
    log('\npro');
    await signIn('pro');
    await go('#/');
    await page.locator('#g-pro').waitFor();
    ok(true, 'photographer account: "Photographer events" group');
    await shot('pro-list');
    await go('#/new?tier=pro&plan=pro1000');
    await page.locator('.tile[data-plan="pro1000"]').waitFor();
    await page.locator('input.input').first().fill('Studio shoot (e2e)');
    await shot('new-pro');
    await page.locator('form button[type=submit]').click();
    await page.waitForURL((u) => /#\/e\/[^/]+\/plan/.test(u.hash), { timeout: 20_000 });
    const id = /#\/e\/([^/?]+)/.exec(page.url())[1];
    const c = (await getDoc(`events/${id}`)).data;
    ok(c.code.startsWith('P') && c.mode === 'open' && c.planId === 'spark', `pro intent created: code ${c.code}, open, Spark`);
    await page.locator('[data-declaration]').waitFor({ timeout: 20_000 });
    ok(true, 'declaration step before the pro checkout');
    await shot('pro-declaration');
    await page.locator('[data-decl-accept]').check();
    await page.locator('[data-declaration] button', { hasText: 'Accept' }).click();
    ok(await until(async () => (await getDoc(`faceHostDeclarations/${id}`)) !== null), 'faceHostDeclarations doc written by the server');
    const decl = (await getDoc(`faceHostDeclarations/${id}`)).data;
    ok(decl.declTextVersion === '2026-09-23' && decl.declLang === 'en', `declaration: text ${decl.declTextVersion}, lang ${decl.declLang}`);
    await page.locator('iframe[title="Local test checkout"]').waitFor({ timeout: 20_000 });
    ok(/79[.,]99/.test(await frame().locator('body').innerText()), 'checkout shows $79.99');
    const before = (await getDoc(`events/${id}`)).data;
    const t0 = Date.now();
    await payInMock('#pay');
    await landedPaid(id, 'pro1000');
    const ev = (await getDoc(`events/${id}`)).data;
    ok(ev.planId === 'pro1000' && ev.uploadPolicy === 'host' && ev.aiPeopleEnabled === true && ev.mode === 'open', `applied: ${ev.planId}, uploadPolicy ${ev.uploadPolicy}, AI ${ev.aiPeopleEnabled}`);
    compareToRedeem('Pro 1000 (web) vs redeem', 'pro1000', before, ev, t0, Date.now());
    const proOrder = await lastOrderFor(id);
    ok(proOrder?.data.status === 'applied' && Number(proOrder.data.amount) === 7999 && proOrder.data.tier === 'pro', `order ${proOrder?.id}: ${proOrder?.data.status}, ${proOrder?.data.amount} cents, tier ${proOrder?.data.tier}`);
    compareLedger('Pro 1000 ledger', (await getDoc(`redemptions/pd_${proOrder?.id}`))?.data, { uid: ev.hostId, eventId: id, planId: 'pro1000', txn: proOrder?.id });
    await go(`#/e/${id}`);
    await page.locator('[data-upload-link]').waitFor();
    ok((await page.locator('[data-upload-link]').getAttribute('href')) === `../upload/?event=${id}`, 'Upload originals → /join/upload/?event=<id>');
    ok(await page.locator('.qr-note').count() === 1, 'face matching on: QR carries the notice line');
    await page.locator('#owner-h').locator('..').locator('button').click();
    await page.locator('[data-owner-code]').waitFor();
    ok(/^[A-Z0-9]{6}$/.test((await page.locator('[data-owner-code]').innerText()).trim()), 'owner (couple) code created');
    await shot('pro-overview');
    await go('#/e/p2-pro1000-web/downloads');
    await page.locator('[data-archive="display"]').click();
    ok(await page.locator('[data-archive-part]').first().waitFor({ timeout: 120_000 }).then(() => true).catch(() => false), 'album archive part (2048 px) ready');
    await shot('pro-downloads');
    await go('#/e/l2-pro5000-nonp/plan');
    await page.locator('.tile').first().waitFor();
    const l2 = await page.locator('.tile').evaluateAll((els) => els.map((e) => e.getAttribute('data-plan')));
    ok(l2.join() === 'proUnlimited', `L2 (Pro 5000, non-P code) offers ${l2.join()}`);
    await go('#/e/l3-pro500-nodecl/plan');
    await page.locator('.tile').first().waitFor();
    await page.locator('.tile[data-plan="pro1000"]').click();
    await page.locator('[data-buy]').click();
    await page.locator('[data-declaration]').waitFor();
    ok(true, 'L3 (pro, no declaration doc) asks for the declaration (server needsDeclaration)');
    await shot('pro-l3-declaration', { both: false });
    await go('#/e/p1-pro-intent');
    await page.locator('#await-h').waitFor();
    ok(await page.locator('[data-code]').count() === 0, 'P1 awaiting package: no QR / code');
    await shot('pro-awaiting');
    await go('#/e/p2-pro1000-web/settings');
    await page.locator('.setting').first().waitFor();
    await shot('pro-settings');
  }

  if (run('paired')) {
    log('\npaired (anonymous app host)');
    await signOutAll();
    const code = await mock('/api/events/p5-anon-pro500/upload-code');
    const pairCode = /([A-Z0-9]{6})/.exec(code.body ?? '')?.[1] ?? 'PDCK34';
    await go('#/signin');
    await page.getByRole('button', { name: 'Pair with the app' }).click();
    await page.locator('input.code').fill(pairCode);
    await page.locator('.pair form button[type=submit]').click();
    await page.waitForURL((u) => !u.hash.startsWith('#/signin'), { timeout: 20_000 });
    await page.locator('.notice.dark').first().waitFor();
    ok(/Add a sign-in/.test(await page.locator('.notice.dark').first().innerText()), 'paired, not linked: "Add a sign-in to keep this account" banner');
    await shot('paired-list');
    const uidBefore = (await getDoc('events/p5-anon-pro500')).data.hostId;
    await go('#/e/p5-anon-pro500/settings');
    await page.locator('.setting').first().waitFor();
    await page.getByText('To delete this event, sign in on this computer').waitFor({ timeout: 10_000 });
    ok(await page.locator('[data-delete-event]').count() === 0, 'paired, not linked: no Delete event (note instead)');
    await go('#/account');
    await page.locator('#acc-signins').waitFor();
    await page.getByText('To delete the account, sign in on this computer').waitFor({ timeout: 10_000 });
    ok(await page.locator('[data-delete-account]').count() === 0, 'paired, not linked: no Delete account (note instead)');
    await go('#/e/p5-anon-pro500/plan');
    await page.locator('[data-link-account]').waitFor({ timeout: 20_000 });
    ok(true, 'package page → link-account first');
    await shot('paired-link');
    await page.locator('[data-link-account] input[type=email]').fill('host@sharecam.local');
    await page.locator('[data-link-account] input[type=password]').fill('another-password');
    await page.locator('[data-link-account] form button[type=submit]').click();
    await page.getByText('This sign-in already has a Sharecam account').waitFor({ timeout: 15_000 });
    ok(true, 'email of another account → "This sign-in already has a Sharecam account"');
    await shot('paired-inuse');
    await page.getByRole('button', { name: 'Try another sign-in' }).click();
    const fresh = `anon-host-${Date.now()}@sharecam.local`;
    await page.locator('[data-link-account] input[type=email]').fill(fresh);
    await page.locator('[data-link-account] input[type=password]').fill(PASSWORD);
    await page.locator('[data-link-account] form button[type=submit]').click();
    await page.locator('.tile').first().waitFor({ timeout: 30_000 });
    ok(true, 'linked → the package page opens (pick)');
    ok((await getDoc('events/p5-anon-pro500')).data.hostId === uidBefore, 'uid unchanged (the event stays with the account)');
    await shot('paired-linked-plan');
    // The account is linked now. A computer PAIRED to it later (custom token, from a
    // new app code) still must not delete anything (fix pass, review P2): hidden in
    // the UI, refused by the server (deleteAccountAndData checks sign_in_provider).
    await signOutAll();
    const code2 = await mock('/api/events/p5-anon-pro500/upload-code');
    const pairCode2 = /([A-Z0-9]{6})/.exec(code2.body ?? '')?.[1];
    ok(!!pairCode2, `a new upload code for the (now linked) account: ${pairCode2}`);
    await go('#/signin');
    await page.getByRole('button', { name: 'Pair with the app' }).click();
    await page.locator('input.code').fill(pairCode2);
    await page.locator('.pair form button[type=submit]').click();
    await page.waitForURL((u) => !u.hash.startsWith('#/signin'), { timeout: 20_000 });
    ok(await page.locator('.notice.dark').count() === 0, 'paired to a linked account: no "add a sign-in" banner');
    await go('#/account');
    await page.getByText('To delete the account, sign in on this computer').waitFor({ timeout: 10_000 });
    ok(await page.locator('[data-delete-account]').count() === 0, 'paired session of a LINKED account: no Delete account (custom-token session)');
    await go('#/e/p5-anon-pro500/settings');
    await page.getByText('To delete this event, sign in on this computer').waitFor({ timeout: 10_000 });
    ok(await page.locator('[data-delete-event]').count() === 0, 'paired session of a LINKED account: no Delete event');
    const del = await page.evaluate(async () => {
      try {
        const m = await import('/src/host/lib/data.ts');
        await m.fn.deleteAccountAndData({});
        return 'deleted';
      } catch (e) {
        return String(e?.code ?? e?.message ?? e);
      }
    });
    ok(/permission-denied/.test(del), `server: deleteAccountAndData from a paired session → ${del}`);
    ok((await getDoc('events/p5-anon-pro500')) !== null, 'the paired account and its event still exist');
  }

  if (run('newsignedout')) {
    log('\ncreate while signed out → account step → created');
    await freshPage();
    await go('#/new');
    await page.locator('.tile[data-plan="spark"]').waitFor();
    await page.locator('input.input').first().fill('Garden brunch (e2e)');
    await page.locator('form button[type=submit]').click();
    await page.locator('.auth input[type=email]').first().waitFor();
    ok(/Save your event to an account/.test(await page.locator('main').innerText()), 'signed out: the account step keeps the draft');
    // A new host (the bride) types a NEW email here: the form opens in create mode (review P1).
    ok((await page.locator('.auth form button[type=submit]').first().innerText()).trim() === 'Create account' && (await page.locator('.auth [data-to-signin]').innerText()).trim() === 'Already have an account? Sign in', 'account step opens in "Create account" (+ "Already have an account? Sign in")');
    await shot('new-account-step');
    const bride = `bride-${Date.now()}@sharecam.local`;
    await page.locator('.auth input[type=email]').first().fill(bride);
    await page.locator('.auth input[type=password]').first().fill(PASSWORD);
    await page.locator('.auth form button[type=submit]').first().click();
    await page.waitForURL((u) => /#\/e\/[^/?]+(\?new=1)?$/.test(u.hash), { timeout: 30_000 });
    const id = /#\/e\/([^/?]+)/.exec(page.url())[1];
    const d = (await getDoc(`events/${id}`)).data;
    ok(d.name === 'Garden brunch (e2e)' && d.planId === 'spark' && d.date === null, `draft carried over: new account ${bride} → Spark event created (date null, present)`);
    await page.locator('[data-code]').waitFor();
    await shot('new-created');
  }

  if (run('slow')) {
    log('\nslow → done (webhook late)');
    await signIn('host');
    await go('#/e/c6-mini-legacy/plan');
    await page.locator('.tile[data-plan="party"]').click();
    await page.locator('[data-buy]').click();
    await payInMock('#hold');
    await page.locator('.status').first().waitFor({ timeout: 20_000 });
    await page.evaluate(() => {
      const raw = localStorage.getItem('sharecam.host.pendingPayment');
      if (raw) { const p = JSON.parse(raw); p.at = Date.now() - 100_000; localStorage.setItem('sharecam.host.pendingPayment', JSON.stringify(p)); }
    });
    await page.reload();
    await page.getByText('Payment received — almost there').waitFor({ timeout: 20_000 });
    ok(true, 'a paid order not yet applied after 90 s → "slow"');
    await shot('slow');
    const order = await lastOrderFor('c6-mini-legacy');
    const del = await mock(`/api/orders/${order.id}/deliver`);
    ok(del.status === 200 && /applied/.test(del.body ?? ''), `held webhook delivered → ${del.body}`);
    await landedPaid('c6-mini-legacy', 'party', 30_000);
    ok((await getDoc('events/c6-mini-legacy')).data.planId === 'party', 'slow → done (C6 Mini → Party) → the event\'s own page');
  }

  if (run('covered')) {
    log('\ncovered (bought in the app while the web checkout was open)');
    await signIn('host');
    await go('#/e/c2-party-appstore/plan');
    await page.locator('.tile[data-plan="wedding"]').click();
    await page.locator('[data-buy]').click();
    await payInMock('#hold');
    await page.locator('.status').first().waitFor({ timeout: 20_000 });
    const app = await mock('/api/events/c2-party-appstore/appstore', { plan: 'unlimited' });
    ok(app.status === 200, `App Store purchase of Unlimited → ${app.status} ${app.body ?? ''}`);
    await page.locator('.status').filter({ hasText: 'already has Unlimited' }).waitFor({ timeout: 30_000 });
    ok(true, 'UI: "This event already has Unlimited. If you paid twice we refund the extra payment"');
    await shot('covered');
    const order = await lastOrderFor('c2-party-appstore');
    const del = await mock(`/api/orders/${order.id}/deliver`);
    ok(/duplicate/.test(del.body ?? ''), `the late web payment → ${del.body} (refund in Paddle)`);
  }

  if (run('files')) {
    log('\n.ics reminder and QR PNG');
    await signIn('host');
    await go('#/e/c1-spark-web');
    await page.locator('[data-code]').waitFor();
    const [ics] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Add a calendar reminder' }).first().click()]);
    const icsText = await ics.createReadStream().then(async (s) => { let b = ''; for await (const c of s) b += c; return b; });
    ok(/BEGIN:VCALENDAR/.test(icsText) && /DTSTART;VALUE=DATE:\d{8}/.test(icsText) && /TRIGGER:-P11D/.test(icsText), `.ics: ${ics.suggestedFilename()} (all-day entry, alarms)`);
    const [png] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download QR (PNG)' }).click()]);
    ok(/\.png$/.test(png.suggestedFilename()), `QR PNG: ${png.suggestedFilename()}`);
  }

  if (run('account')) {
    log('\naccount');
    await signIn('host');
    await go('#/account');
    await page.locator('#acc-signins').waitFor();
    ok(await page.locator('[data-delete-account]').waitFor({ timeout: 10_000 }).then(() => true).catch(() => false), 'email session: Delete account & data offered');
    ok(await page.locator('#acc-link').innerText().then((s) => !/Add email sign-in/.test(s)).catch(() => true), 'email account: no "Add email sign-in" offered again (only missing sign-ins)');
    await shot('account');
  }

  if (run('legacy')) {
    log('\nlegacy uploader session (D2 migration)');
    await freshPage();
    await go('#/signin');
    await page.getByRole('button', { name: 'Pair with the app' }).click();
    await page.locator('.pair-qr svg').waitFor({ timeout: 20_000 });
    // The old uploader signed the HOST into the default app and remembered its uid.
    const uid = await page.evaluate(() => new Promise((resolve) => {
      const req = indexedDB.open('firebaseLocalStorageDb');
      req.onsuccess = () => {
        const tx = req.result.transaction('firebaseLocalStorage', 'readonly');
        const all = tx.objectStore('firebaseLocalStorage').getAll();
        // firebase:authUser:<apiKey>:[DEFAULT] is the guest app; …:host would be the dashboard's.
        all.onsuccess = () => resolve((all.result || []).find((r) => String(r.fbase_key || '').endsWith(':[DEFAULT]'))?.value?.uid ?? null);
      };
      req.onerror = () => resolve(null);
    }));
    ok(!!uid, `default (guest) app has a session: ${uid}`);
    await page.evaluate((u) => localStorage.setItem('sharecam.uploadHostUid', u), uid);
    await page.reload();
    await page.getByText('Pair this computer again').waitFor({ timeout: 15_000 });
    ok(true, 'the legacy host session is signed out of the default app → "Pair this computer again" notice');
    ok(await page.evaluate(() => localStorage.getItem('sharecam.uploadHostUid')) === null, 'legacy key removed');
    await shot('legacy', { both: false });
  }

  if (run('region') && process.env.GEO_BLOCKED === '1') {
    log('\nregion blocked (stack started with --geo US-IL)');
    await signIn('pro');
    await go('#/new?tier=pro');
    await page.getByText('Not available in your region').waitFor({ timeout: 30_000 });
    ok(await page.locator('form button[type=submit]').isDisabled(), 'pro create: region blocked, no pro offered');
    await shot('region-new');
    await go('#/e/l3-pro500-nodecl/plan');
    await page.getByText('Not available in your region').waitFor({ timeout: 30_000 });
    ok(true, 'package page: region blocked');
    await shot('region-plan');
  }

  log('\nfinish');
  const logs = await query('errorLogs', 'appVersion', 'EQUAL', 'host-web-1');
  ok(logs.length === 0, `dashboard errorLogs: ${logs.length}${logs.length ? ` (${logs.map((l) => l.data.context).join(', ')})` : ''}`);
  ok(pageErrors.length === 0, `page errors: ${pageErrors.length}${pageErrors.length ? `\n    ${pageErrors.slice(0, 8).join('\n    ')}` : ''}`);
} catch (e) {
  failures += 1;
  log(`  ✗ aborted: ${e.stack || e.message}`);
  if (SHOTS) await page.screenshot({ path: join(OUT, 'D-e2e-abort-1440.png'), fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}
log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
