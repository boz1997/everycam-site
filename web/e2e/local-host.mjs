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
//   buy           create "Web wedding" as Wedding via #/new → declaration-free checkout
//                 → mock Pay → applied (fields = plan §2.4, D8 create shape) → done
//                 → redeliver (duplicate) → an AllShots transaction stays silent
//   refund        full refund of that order → suspended (Spark quotas, AI off,
//                 retention kept) → Refunded chip → ZIP refused → buy again → reactivated
//   chargeback    chargeback on C3's web order → suspended → reverse → plan + limits back
//   discount      100 %-discount payment on C1 (Party) → failed state, event still Spark
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
const PASSWORD = 'sharecam-local';

// ---------------------------------------------------------------- guards
for (const u of [WEB, MOCK, FS]) {
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
    await page.locator('input[type=email]').fill('host@sharecam.local');
    await page.locator('input[type=password]').fill('wrong-password');
    await page.locator('form button[type=submit]').click();
    await page.locator('.err').waitFor({ timeout: 10_000 });
    ok(/Wrong email or password/.test(await page.locator('.err').innerText()), 'wrong password → "Wrong email or password."');
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
    log('\nbuy (create + pay)');
    await signIn('host');
    await go('#/new?plan=wedding');
    await page.locator('input.input').first().waitFor();
    await page.locator('.tile[data-plan="wedding"]').waitFor();
    await page.locator('input.input').first().fill('Web wedding (e2e)');
    await page.locator('input[type=date]').fill('2026-11-14');
    await shot('new-consumer');
    await page.locator('form button[type=submit]').click();
    await page.waitForURL((u) => /#\/e\/[^/]+\/plan/.test(u.hash), { timeout: 20_000 });
    const id = /#\/e\/([^/?]+)/.exec(page.url())[1];
    ctxState.buyId = id;
    const created = await getDoc(`events/${id}`);
    ok(isInt(created.raw.createdAt), 'D8: createdAt is a NUMBER');
    ok(created.data.date === '2026-11-14', 'D8: date written');
    ok(created.data.origin === 'web' && created.data.planId === 'spark' && created.data.code && !created.data.code.startsWith('P'), 'created as Spark, origin web, consumer code');
    await page.locator('iframe[title="Local test checkout"]').waitFor({ timeout: 20_000 });
    ok(true, 'fresh create with ?plan=wedding opens the checkout by itself');
    await shot('checkout-mock', { both: false });
    await payInMock('#pay');
    await page.locator('.status.done').waitFor({ timeout: 45_000 });
    ok(true, 'UI: applying → done');
    await shot('buy-done');
    const ev = (await getDoc(`events/${id}`)).data;
    ok(ev.planId === 'wedding' && ev.planCatalog === 2 && ev.limits?.photos === 500 && ev.limits?.retentionDays === 180, `applied fields: planId ${ev.planId}, catalog ${ev.planCatalog}, limits ${JSON.stringify(ev.limits)}`);
    const order = await lastOrderFor(id);
    ctxState.buyTxn = order?.id;
    ok(order?.data.status === 'applied' && order.data.env === 'sandbox', `order ${order?.id} applied (sandbox)`);
    const red = await getDoc(`redemptions/pd_${order?.id}`);
    ok(red?.data.store === 'paddle' && red.data.storeTransactionId === order?.id && red.data.planId === 'wedding', 'ledger row redemptions/pd_<txn> (store paddle)');
    const redeliver = await mock(`/api/orders/${order.id}/redeliver`);
    ok(redeliver.status === 200 && /duplicate/.test(redeliver.body ?? ''), `redeliver → ${redeliver.status} ${redeliver.body}`);
    const foreign = await mock('/api/foreign/transaction');
    ok(foreign.status === 200 && /silent/.test(foreign.body ?? ''), `AllShots transaction → ${foreign.body}`);
    await go(`#/e/${id}`);
    await page.locator('[data-code]').waitFor();
    await shot('buy-overview');
  }

  if (run('refund')) {
    log('\nrefund → suspended → buy again');
    const id = ctxState.buyId;
    const txn = ctxState.buyTxn;
    if (!id || !txn) throw new Error('refund needs the buy step');
    const r = await mock(`/api/orders/${txn}/refund`);
    ok(r.approved?.status === 200, `refund approved → ${r.approved?.status} ${r.approved?.body}`);
    const ev = await until(async () => { const d = (await getDoc(`events/${id}`)).data; return d.refunded === true ? d : null; });
    ok(ev?.planId === 'spark' && ev?.limits?.photos === 50 && ev?.limits?.retentionDays === 180 && ev?.aiPeopleEnabled === false && !ev?.retentionAnchorAt, `suspended: plan ${ev?.planId}, limits ${JSON.stringify(ev?.limits)}, no retentionAnchorAt`);
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
    await payInMock('#pay');
    await page.locator('.status.done').waitFor({ timeout: 45_000 });
    const back = (await getDoc(`events/${id}`)).data;
    ok(back.refunded === false && back.planId === 'party' && back.refundRestoredBy === 'repurchase', `bought again → refunded ${back.refunded}, plan ${back.planId}, restoredBy ${back.refundRestoredBy}`);
    ok((await getDoc(`refundState/${id}`)) === null, 'repurchase deleted refundState');
  }

  if (run('chargeback')) {
    log('\nchargeback on C3 → suspended → reverse');
    await signIn('host');
    const cb = await mock('/api/orders/txn_local_seed_0001/chargeback');
    ok(cb.status === 200, `chargeback → ${cb.status} ${cb.body}`);
    const s = await until(async () => { const d = (await getDoc('events/c3-wedding-web')).data; return d.refunded === true ? d : null; });
    ok(s?.planId === 'spark' && s?.aiPeopleEnabled === false && s?.limits?.retentionDays === 180, 'C3 suspended (Spark quotas, AI off, paid retention kept)');
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
    await shot('discount-failed');
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
    await payInMock('#pay');
    await page.locator('.status.done').waitFor({ timeout: 45_000 });
    const ev = (await getDoc(`events/${id}`)).data;
    ok(ev.planId === 'pro1000' && ev.uploadPolicy === 'host' && ev.aiPeopleEnabled === true && ev.mode === 'open', `applied: ${ev.planId}, uploadPolicy ${ev.uploadPolicy}, AI ${ev.aiPeopleEnabled}`);
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
    ok(await page.locator('[data-delete-event]').count() === 0, 'paired, not linked: no Delete event');
    await go('#/account');
    await page.locator('#acc-signins').waitFor();
    ok(await page.locator('[data-delete-account]').count() === 0, 'paired, not linked: no Delete account');
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
  }

  if (run('newsignedout')) {
    log('\ncreate while signed out → account step → created');
    await freshPage();
    await go('#/new');
    await page.locator('.tile[data-plan="spark"]').waitFor();
    await page.locator('input.input').first().fill('Garden brunch (e2e)');
    await page.locator('form button[type=submit]').click();
    await page.locator('.auth input[type=email]').first().waitFor();
    ok(/Sign in to save your event/.test(await page.locator('main').innerText()), 'signed out: the account step keeps the draft');
    await shot('new-account-step');
    await page.locator('.auth input[type=email]').first().fill('host@sharecam.local');
    await page.locator('.auth input[type=password]').first().fill(PASSWORD);
    await page.locator('.auth form button[type=submit]').first().click();
    await page.waitForURL((u) => /#\/e\/[^/?]+(\?new=1)?$/.test(u.hash), { timeout: 30_000 });
    const id = /#\/e\/([^/?]+)/.exec(page.url())[1];
    const d = (await getDoc(`events/${id}`)).data;
    ok(d.name === 'Garden brunch (e2e)' && d.planId === 'spark' && d.date === null, 'draft carried over: Spark event created after sign-in (date null, present)');
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
    await page.locator('.status.done').waitFor({ timeout: 30_000 });
    ok((await getDoc('events/c6-mini-legacy')).data.planId === 'party', 'slow → done (C6 Mini → Party)');
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
    ok(await page.locator('[data-delete-account]').count() === 1, 'linked account: Delete account & data offered');
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
