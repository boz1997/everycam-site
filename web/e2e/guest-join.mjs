// TARAYICI misafiri, uçtan uca, ÜRETİME karşı — misafirlerin çoğunun aldığı yol:
// basılı QR → sharecam.app/e/KOD → (404.html) → /join/?code=KOD → isim → galeri →
// yükleme. Hiçbir şey mock değil: geçici bir etkinlik açılır, kurulu Chrome
// (playwright-core, headless) linki masaüstü ve iPhone olarak açar, katılır,
// bir kareyi dosya seçiciyle, bir kareyi sürükle-bırakla yükler; sonra
// Firestore, Storage ve Auth'tan sayfanın GERÇEKTEN ne yaptığı okunur. Açtığı
// her şey silinir.
//
// Doğru olmak zorunda olanlar:
//   • /e/KOD hem masaüstünde hem iPhone'da /join/?code=KOD'a düşer
//   • web istemcisi etkinliği ADIYLA açar — "No event found" yok
//   • masaüstünde "Add a folder" var, iPhone'da YOK (webkitdirectory desteklenmez)
//   • seçiciyle ve bırakmayla yüklenen iki kare: 2 medya dokümanı, 2 Storage
//     nesnesi + thumb, photoCount 2 (sunucu sayacı), ızgarada 2 görsel, ekranda
//     "Upload failed" yok
//   • tam olarak BİR anonim hesap açıldı, o hesap misafir dokümanı, hata loglamadı;
//     sayfa yakalanmamış hata fırlatmadı, Firebase'e giden hiçbir istek düşmedi
//
// Kullanım (web/ içinden):  node e2e/guest-join.mjs [--headed] [--keep]
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright-core';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT = 'sharecam-1997boz';
const BUCKET = 'sharecam-1997boz.firebasestorage.app';
const FS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const SITE = process.env.SITE || 'https://sharecam.app';
const args = process.argv.slice(2);
const keep = args.includes('--keep');

// İstemci anahtarı gizli değil; web/src/firebase.ts içinde duruyor.
const key = readFileSync(join(HERE, '..', 'src/firebase.ts'), 'utf8').match(/apiKey:\s*'([^']+)'/)[1];
const admin = { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' };
const s = (v) => ({ stringValue: v }), b = (v) => ({ booleanValue: v }), n = (v) => ({ integerValue: String(v) }), nul = { nullValue: null };
const val = (v) => v?.stringValue ?? (v?.integerValue !== undefined ? Number(v.integerValue) : v?.booleanValue ?? null);

let failed = 0;
const mark = (ok, what, detail = '') => { console.log(`${ok ? '✅' : '❌'} ${what}${detail ? ' — ' + detail : ''}`); if (!ok) failed++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- 1. fikstür: geçici anonim host + Spark etkinlik (eventService.create alan seti) ----
const host = await (await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) })).json();
const alphabet = 'ACDEFGHJKMNPQRTUVWXY34679';
const code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
const eventId = `zze2e-web-${Date.now()}`;
const name = 'ZZ E2E web — ignore';
const created = await fetch(`${FS}/events?documentId=${eventId}`, { method: 'POST', headers: admin, body: JSON.stringify({ fields: {
  code: s(code), name: s(name), date: nul, coverUri: nul, mode: s('open'), revealAt: nul, timeZone: s('Europe/Istanbul'),
  planId: s('spark'), hostId: s(host.localId), guestCanDownload: b(true), joinPaused: b(false),
  aiPeoplePurchased: b(false), aiPeopleEnabled: b(false), createdAt: n(Date.now()), photoCount: n(0), videoCount: n(0), activeGuestCount: n(0),
} }) });
mark(created.status === 200, 'fikstür: etkinlik açıldı', `${eventId} · kod ${code}`);

const accountsToDelete = new Set([host.localId]);
const t0 = Date.now();
const browser = await chromium.launch({ channel: 'chrome', headless: !args.includes('--headed') });
try {
  // ---- 2. funnel: masaüstü ve iPhone, ikisi de /join/?code= ----
  const desktop = await browser.newContext();
  const d = await desktop.newPage();
  await d.goto(`${SITE}/e/${code}`, { waitUntil: 'domcontentloaded' });
  await d.waitForURL((u) => u.pathname.startsWith('/join/'), { timeout: 15000 }).catch(() => {});
  mark(d.url() === `${SITE}/join/?code=${code}`, 'funnel (masaüstü): /e/KOD → /join/?code=KOD', d.url());
  // Masaüstünde klasör düğmesi görünmeli — iPhone'da görünmemeli (aşağıda).
  await d.getByPlaceholder('Your name').fill('ZZ desk');
  await d.getByRole('button', { name: 'Join the album' }).click();
  const folderBtn = d.getByRole('button', { name: 'Add a folder' });
  mark(await folderBtn.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false), 'masaüstü: "Add a folder" düğmesi var');
  mark(await d.locator('input[type=file][webkitdirectory]').count() === 1, 'masaüstü: klasör girişi (webkitdirectory) sayfada');
  await desktop.close();
  // Masaüstü bağlamı da bir misafir açtı; telefonun misafiri ondan ayrılsın.
  const deskUids = ((await (await fetch(`${FS}/events/${eventId}/guests?pageSize=10`, { headers: admin })).json()).documents || []).map((g) => g.name.split('/').pop());
  deskUids.forEach((u) => accountsToDelete.add(u));
  mark(deskUids.length === 1, 'masaüstü: katılım bir misafir dokümanı yazdı', deskUids.join(', ') || 'yok');

  const phone = await browser.newContext({ ...devices['iPhone 14'] });
  const page = await phone.newPage();
  const pageErrors = [], consoleErrors = [], failedRequests = [];
  page.on('pageerror', (e) => pageErrors.push(String(e?.message ?? e)));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('requestfailed', (r) => { if (/googleapis|sharecam\.app/.test(r.url())) failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText ?? ''}`); });

  await page.goto(`${SITE}/e/${code}`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL((u) => u.pathname.startsWith('/join/'), { timeout: 15000 }).catch(() => {});
  mark(page.url() === `${SITE}/join/?code=${code}`, 'funnel (iPhone): /e/KOD → /join/?code=KOD', page.url());

  // ---- 3. web istemcisi: etkinlik adıyla açılır, isimle katılım ----
  const heading = page.getByRole('heading', { name });
  const opened = await heading.waitFor({ state: 'visible', timeout: 60000 }).then(() => true).catch(() => false);
  const notFound = await page.getByText('No event found').isVisible().catch(() => false);
  mark(opened && !notFound, 'web istemcisi: etkinliği adıyla açtı', opened ? name : notFound ? '"No event found" gösterdi' : 'etkinlik adı hiç gelmedi');
  await page.getByPlaceholder('Your name').fill('ZZ e2e web');
  await page.getByRole('button', { name: 'Join the album' }).click();
  const addBtn = page.getByRole('button', { name: 'Add photos or videos' });
  mark(await addBtn.waitFor({ state: 'visible', timeout: 60000 }).then(() => true).catch(() => false), 'web istemcisi: katıldı, yükleme çubuğu geldi');
  mark(!(await page.getByRole('button', { name: 'Add a folder' }).isVisible().catch(() => false)), 'iPhone: "Add a folder" GİZLİ (dokunmatikte klasör seçici yok)');

  // ---- 4. yükleme: biri dosya seçiciyle, biri sürükle-bırakla (yeni yol) ----
  const dataUrl = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 640; c.height = 480;
    const x = c.getContext('2d'); x.fillStyle = '#1f3d2e'; x.fillRect(0, 0, 640, 480);
    x.fillStyle = '#f3eee2'; x.font = 'bold 56px sans-serif'; x.fillText('ZZ E2E', 180, 260);
    return c.toDataURL('image/jpeg', 0.85);
  });
  const jpeg = Buffer.from(dataUrl.split(',')[1], 'base64');
  await page.locator('input[type=file][accept="image/*,video/*"]').setInputFiles({ name: 'zz-picker.jpg', mimeType: 'image/jpeg', buffer: jpeg });
  // Bırakma: sayfada DataTransfer kur, window'a dragenter → drop. Örtü ("Drop
  // photos…") görünmeli, sonra kuyruğa girmeli. Ürün kodu window'u dinliyor.
  const dropped = await page.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 640; c.height = 480;
    const x = c.getContext('2d'); x.fillStyle = '#c79a2e'; x.fillRect(0, 0, 640, 480);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
    const dt = new DataTransfer();
    dt.items.add(new File([blob], 'zz-drop.jpg', { type: 'image/jpeg', lastModified: 1700000000000 }));
    dt.items.add(new File([new Uint8Array(8)], '.DS_Store', { type: '' }));         // elenmeli
    const ev = (t) => new DragEvent(t, { bubbles: true, cancelable: true, dataTransfer: dt });
    document.body.dispatchEvent(ev('dragenter'));
    await new Promise((r) => setTimeout(r, 100));
    const overlay = !!document.querySelector('.dropzone');
    document.body.dispatchEvent(ev('drop'));
    await new Promise((r) => setTimeout(r, 100));
    return { overlay, overlayGone: !document.querySelector('.dropzone') };
  });
  mark(dropped.overlay && dropped.overlayGone, 'sürükle-bırak: örtü çıktı ve bırakınca kalktı', JSON.stringify(dropped));

  let media = [];
  for (let i = 0; i < 45 && media.length < 2; i++) {
    await sleep(2000);
    media = (await (await fetch(`${FS}/events/${eventId}/media?pageSize=10`, { headers: admin })).json()).documents || [];
  }
  const docs = media.map((m) => Object.fromEntries(Object.entries(m.fields).map(([k, v]) => [k, val(v)])));
  mark(media.length === 2, 'yükleme: iki medya dokümanı yazıldı (seçici + bırakma)', `${media.length} doküman · ${docs.map((x) => x.kind).join(', ')}`);
  mark(docs.length === 2 && docs.every((x) => x.thumbUri), 'yükleme: ikisinin de thumb\'ı var (ızgara aslı çekmez)', docs.map((x) => (x.thumbUri ? 'thumb' : 'YOK')).join(', '));
  const objects = (await (await fetch(`https://storage.googleapis.com/storage/v1/b/${BUCKET}/o?prefix=${encodeURIComponent(`events/${eventId}/`)}`, { headers: admin })).json()).items || [];
  mark(objects.length === 4, 'storage: 2 kare + 2 thumb', `${objects.length} nesne`);
  const readable = docs[0]?.uri ? (await fetch(docs[0].uri, { method: 'HEAD' })).status === 200 : false;
  mark(readable, 'storage: kare indirme linkinden okunuyor', docs[0]?.uri ? 'HEAD 200' : 'uri yok');
  const inGallery = await page.locator('.grid img').nth(1).waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
  mark(inGallery, 'galeri: iki kare ekranda');
  mark(!(await page.getByText('Upload failed').isVisible().catch(() => false)), 'yükleme: ekranda "Upload failed" yok');

  // ---- 5. sayfanın yaptıkları: Firestore + Auth'tan geri oku ----
  let ev = {};
  for (let i = 0; i < 20; i++) {
    ev = Object.fromEntries(Object.entries((await (await fetch(`${FS}/events/${eventId}`, { headers: admin })).json()).fields || {}).map(([k, v]) => [k, val(v)]));
    if (ev.photoCount === 2 && ev.activeGuestCount === 2) break;
    await sleep(2000);
  }
  const guests = (await (await fetch(`${FS}/events/${eventId}/guests?pageSize=10`, { headers: admin })).json()).documents || [];
  const allUids = guests.map((g) => g.name.split('/').pop());
  allUids.forEach((u) => accountsToDelete.add(u));
  const guestUids = allUids.filter((u) => !deskUids.includes(u)); // telefonun misafiri
  mark(allUids.length === 2 && guestUids.length === 1 && ev.activeGuestCount === 2, 'firestore: iki misafir (masaüstü + iPhone), activeGuestCount 2 (trigger)', `${allUids.join(', ') || 'yok'} · activeGuestCount ${ev.activeGuestCount}`);
  mark(ev.photoCount === 2 && docs.every((x) => x.ownerId === guestUids[0]), 'firestore: photoCount 2 (trigger) ve kareler iPhone misafirinin', `photoCount ${ev.photoCount}`);

  const anon = (await allAnonymousAccounts()).filter((u) => +u.createdAt >= t0 - 2000).sort((a, c) => +a.createdAt - +c.createdAt);
  const ours = anon.filter((u) => guestUids.includes(u.localId));
  const at = (u) => `${u.localId} @ ${new Date(+u.createdAt).toISOString()}`;
  mark(ours.length === 1, 'auth: misafir yepyeni TEK bir anonim hesap', ours.map(at).join(', ') || 'yok');
  // Yarış imzası (AllShots 6 Eyl 2026): bizimkinin 1,5 sn yakınında açılmış
  // başka hesap. Masaüstü bağlamının hesabı bilinen, o hariç.
  const twins = anon.filter((u) => !ours.includes(u) && !deskUids.includes(u.localId) && ours.some((o) => Math.abs(+u.createdAt - +o.createdAt) < 1500));
  mark(twins.length === 0, 'auth: bizimkinin 1,5 sn yakınında başka hesap açılmadı', twins.map(at).join(', ') || 'temiz');

  const logs = await (await fetch(`${FS}:runQuery`, { method: 'POST', headers: admin, body: JSON.stringify({ structuredQuery: {
    from: [{ collectionId: 'errorLogs' }], where: { fieldFilter: { field: { fieldPath: 'createdAt' }, op: 'GREATER_THAN_OR_EQUAL', value: { timestampValue: new Date(t0).toISOString() } } }, limit: 50 } }) })).json();
  const mine = (Array.isArray(logs) ? logs : []).filter((r) => r.document && guestUids.includes(r.document.fields?.uid?.stringValue));
  mark(mine.length === 0, 'errorLogs: misafir hata loglamadı', mine.map((r) => `${r.document.fields.context?.stringValue}/${r.document.fields.code?.stringValue}`).join(', ') || 'temiz');
  mark(pageErrors.length === 0, 'tarayıcı: yakalanmamış hata yok', pageErrors.join(' | ') || 'temiz');
  mark(failedRequests.length === 0, 'tarayıcı: Firebase/site isteği düşmedi', failedRequests.join(' | ') || 'temiz');
  if (consoleErrors.length) console.log('   console.error (düşürmez):', consoleErrors.slice(0, 5).join(' | '));
  await phone.close();
} catch (e) {
  mark(false, 'beklenmeyen', String(e?.stack ?? e));
} finally {
  await browser.close();
  // ---- 6. arkada hiçbir şey kalmasın: event silinir → onEventDeleted cascade ----
  if (keep) console.log(`--keep: ${eventId} ve hesaplar ${[...accountsToDelete].join(', ')} bırakıldı`);
  else {
    // Masaüstü bağlamının misafirini de topla (yukarıda try düşmüşse eksik kalabilir).
    for (const g of (await (await fetch(`${FS}/events/${eventId}/guests?pageSize=10`, { headers: admin })).json()).documents || []) accountsToDelete.add(g.name.split('/').pop());
    await fetch(`${FS}/events/${eventId}`, { method: 'DELETE', headers: admin });
    let left = -1;
    for (let i = 0; i < 45; i++) {
      await sleep(2000);
      const objs = ((await (await fetch(`https://storage.googleapis.com/storage/v1/b/${BUCKET}/o?prefix=${encodeURIComponent(`events/${eventId}/`)}`, { headers: admin })).json()).items || []).length;
      const subs = ((await (await fetch(`${FS}/events/${eventId}/media?pageSize=5`, { headers: admin })).json()).documents || []).length
        + ((await (await fetch(`${FS}/events/${eventId}/guests?pageSize=5`, { headers: admin })).json()).documents || []).length;
      left = objs + subs;
      if (left === 0) break;
    }
    if (left !== 0) {
      for (const coll of ['media', 'guests']) for (const d of (await (await fetch(`${FS}/events/${eventId}/${coll}?pageSize=50`, { headers: admin })).json()).documents || []) await fetch(`https://firestore.googleapis.com/v1/${d.name}`, { method: 'DELETE', headers: admin });
      for (const o of (await (await fetch(`https://storage.googleapis.com/storage/v1/b/${BUCKET}/o?prefix=${encodeURIComponent(`events/${eventId}/`)}`, { headers: admin })).json()).items || []) await fetch(`https://storage.googleapis.com/storage/v1/b/${BUCKET}/o/${encodeURIComponent(o.name)}`, { method: 'DELETE', headers: admin });
    }
    const del = await (await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts:batchDelete`, { method: 'POST', headers: admin, body: JSON.stringify({ localIds: [...accountsToDelete], force: true }) })).json();
    const gone = (await fetch(`${FS}/events/${eventId}`, { headers: admin })).status === 404;
    mark(gone && left === 0 && !(del.errors || []).length, 'temizlik: onEventDeleted cascade (kareler, thumb\'lar, misafirler) + hesaplar silindi', left === 0 ? `cascade tamamlandı · ${accountsToDelete.size} hesap` : `cascade 90 s içinde bitmedi, elle süpürüldü (${left} kalmıştı)`);
  }
}
console.log(failed ? `\n🔴 ${failed} kontrol düştü` : '\n🟢 tarayıcı misafiri: funnel, katılım ve iki yolla yükleme gerçek sitede çalışıyor');
process.exit(failed ? 1 : 0);

async function accessToken() {
  const cfg = JSON.parse(readFileSync(`${homedir()}/.config/configstore/firebase-tools.json`, 'utf8'));
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
      refresh_token: cfg.tokens.refresh_token, grant_type: 'refresh_token',
    }),
  });
  return (await res.json()).access_token;
}
async function allAnonymousAccounts() {
  let next = null, all = [];
  do {
    const url = new URL(`https://identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts:batchGet`);
    url.searchParams.set('maxResults', '1000'); if (next) url.searchParams.set('nextPageToken', next);
    const page = await (await fetch(url, { headers: admin })).json();
    all = all.concat(page.users || []); next = page.nextPageToken;
  } while (next);
  return all.filter((u) => !(u.providerUserInfo || []).length);
}
