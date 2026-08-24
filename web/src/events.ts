import {
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { db, ensureAnon, storage } from './firebase';
import { errorCode, logError } from './errorLog';
import type { EventDoc, MediaDoc, MediaKind } from './types';

// Veri katmanı. Mobil uygulamanın src/services/firebase/* karşılığı —
// AYNI koleksiyonlar, AYNI alan adları.
//
// Kritik: buradaki hiçbir kontrol güvenlik değildir. Kota, ban, gizli mod ve
// duraklatma firestore.rules tarafından zorlanıyor; bu dosyadaki kontroller
// yalnız kullanıcıya DÜZGÜN MESAJ göstermek için. Sunucu her hâlükârda son sözü
// söylüyor, o yüzden reddedilen yazımları da yakalayıp anlamlı hataya çeviriyoruz.

const MAX_EDGE = 2048; // native mediaService ile aynı: 12MP HEIC → ~700KB JPEG
// storage.rules tavanıyla AYNI sayı olmak zorunda (uygulamada src/plans.ts >
// VIDEO_MAX_BYTES). Ayrışırsa istemci yükletir, kural reddeder ve kullanıcı
// sebebini göremez. 2026-08-24'te 50 → 200 MB: düğün videoları için darmış.
export const VIDEO_MAX_BYTES = 200 * 1024 * 1024;

export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

function toEvent(id: string, d: Record<string, unknown>): EventDoc {
  return {
    id,
    code: String(d.code ?? ''),
    name: String(d.name ?? ''),
    date: (d.date as string | null) ?? null,
    coverUri: (d.coverUri as string | null) ?? null,
    mode: d.mode === 'private' ? 'private' : 'open',
    joinPaused: d.joinPaused === true,
    guestCanDownload: d.guestCanDownload !== false,
    hostId: String(d.hostId ?? ''),
    activeGuestCount: Number(d.activeGuestCount ?? 0),
    photoCount: Number(d.photoCount ?? 0),
    videoCount: Number(d.videoCount ?? 0),
    planId: String(d.planId ?? 'spark'),
  };
}

/** Etkinlik dokümanı kodla bulunabilsin diye herkese açık okunur (kural: allow read: if true). */
export async function getByCode(code: string): Promise<EventDoc | null> {
  const snap = await getDocs(query(collection(db, 'events'), where('code', '==', normalizeCode(code)), limit(1)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return toEvent(d.id, d.data());
}

export type JoinResult = 'ok' | 'banned' | 'full' | 'paused' | 'error';

/**
 * Misafir kotaları — YALNIZ MESAJ SEÇMEK İÇİN. Kapının kendisi firestore.rules'ta;
 * buradaki sayı yanlış olsa bile kimse fazladan içeri giremez.
 *
 * DİKKAT, bu tablonun DÖRDÜNCÜ kopyasıdır: everycam/src/plans.ts,
 * everycam/functions/src/plans.ts ve everycam/firestore.rules > planLimits().
 * O üçü planSync.test.ts ile birbirine bağlı; bu dosya AYRI DEPODA olduğu için
 * o teste giremiyor. Paket limiti değişirse burayı da elle güncelle — sapması
 * hâlinde tek kaybedilen şey mesajın doğruluğudur, güvenlik değil.
 */
const GUEST_LIMITS: Record<string, number> = {
  spark: 10,
  mini: 25,
  party: 50,
  wedding: 100,
  unlimited: -1,
};

function guestLimitReached(d: Record<string, unknown>): boolean {
  const limit = GUEST_LIMITS[String(d.planId ?? 'spark')] ?? 10;
  return limit >= 0 && Number(d.activeGuestCount ?? 0) >= limit;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Misafir kaydı. Doküman id'si uid'dir; `uid` alanı AYRICA yazılır çünkü hesap
 * silme (Cloud Functions) misafir kayıtlarını koleksiyon GRUBU sorgusuyla buluyor
 * ve o sorgu ancak alan üzerinden yapılabilir.
 *
 * UID'Yİ ÇAĞIRANDAN ALMIYOR (Berk, 2026-08-23). Eskiden App.tsx sayfa açılışında
 * uid'yi state'e koyuyor, bu yazma dakikalar sonra o DONMUŞ uid ile gidiyordu;
 * oysa Firestore token'ı her istekte canlı currentUser'dan okuyor. İkisi
 * ayrıştığında ya da oturum hiç ispatlanmamışken yazma permission-denied alıyordu.
 *
 * REDDİ KOTA SANMA. Eski hâl catch'e düşen HER hatayı 'full'a çeviriyordu, üstelik
 * `catch {` ile hata nesnesini bağlamadan — yani "misafir limiti doldu" bir teşhis
 * değil, bilginin yokluğuydu. Şimdi: gerçek sebep etkinliğin taze hâlinden
 * doğrulanıyor, kota gerçekten dolu değilse oturum yeniden ispatlanıp SESSİZCE
 * bir kez daha deneniyor (kullanıcının elle yaptığı "sayfayı yenile"nin kod hâli),
 * ve hâlâ olmuyorsa dürüstçe 'error' dönülüyor — hata kodu hem ekrana hem
 * errorLogs'a yazılıyor.
 */
export async function joinEvent(
  event: EventDoc,
  name: string,
): Promise<{ result: JoinResult; uid: string; code?: string }> {
  // joinEvent ASLA fırlatmaz. Buradaki tek korumasız await ekranı sonsuza kadar
  // "Albüme katılıyorsun…" spinner'ında kilitliyordu: confirmName'de try/catch yok
  // ve o fazda çıkış düğmesi de yok, tek kurtuluş sayfayı yenilemek oluyordu.
  let uid: string;
  try {
    uid = await ensureAnon();
  } catch (e) {
    return { result: 'error', uid: '', code: errorCode(e) };
  }
  const guestRef = () => doc(db, 'events', event.id, 'guests', uid);
  const write = () => setDoc(guestRef(), { uid, name, joinedAt: Date.now(), banned: false });

  const existing = await getDoc(guestRef()).catch(() => null);
  if (existing?.exists()) {
    const data = existing.data();
    if (data.banned === true) return { result: 'banned', uid };
    // Ad güncellemesi katılımı bloke ETMEMELİ: düşerse misafir yine içeride.
    if (name && data.name !== name) await updateDoc(guestRef(), { name }).catch(() => undefined);
    return { result: 'ok', uid };
  }

  if (event.joinPaused) return { result: 'paused', uid };

  try {
    await write();
    return { result: 'ok', uid };
  } catch (first) {
    // Etkinlik dokümanı herkese açık okunur (kural: allow read: if true), yani
    // bu okuma kimlik sorunundan bağımsız olarak çalışır.
    const fresh = await getDoc(doc(db, 'events', event.id)).catch(() => null);
    const d = fresh?.exists() ? (fresh.data() as Record<string, unknown>) : null;

    if (d?.joinPaused === true) return { result: 'paused', uid };
    if (d && guestLimitReached(d)) {
      void logError('join.full', first, { uid, planId: d.planId, activeGuestCount: d.activeGuestCount });
      return { result: 'full', uid };
    }

    // Kota DOLU DEĞİL. Kalan en olası sebep oturumdur: yeniden ispatla ve bir kez
    // daha dene. ensureAnon token'ı tazeler, ölmüş oturumun yerine yenisini açar —
    // uid değişmişse yazma da yeni uid ile gider.
    await wait(400);
    uid = await ensureAnon().catch(() => uid);
    try {
      await write();
      // Sessiz kurtarma da kayda geçer: kullanıcı bir şey görmese de bu arızanın
      // sahada ne sıklıkta olduğunu ancak böyle öğreniriz.
      void logError('join.recovered', first, { uid, firstCode: errorCode(first) });
      return { result: 'ok', uid };
    } catch (second) {
      void logError('join.failed', second, {
        uid,
        firstCode: errorCode(first),
        secondCode: errorCode(second),
        eventId: event.id,
        activeGuestCount: d?.activeGuestCount ?? null,
        planId: d?.planId ?? null,
      });
      // Kod EKRANA da çıkar: errorLogs yazımı kural gereği kimlik istiyor, yani
      // arıza tam da "kimlik yok" olduğunda günlük de yazılamaz. Ekrandaki kod
      // o durumda elimizdeki TEK kanıt.
      return { result: 'error', uid, code: errorCode(second) };
    }
  }
}

export async function isBanned(eventId: string, uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'events', eventId, 'guests', uid)).catch(() => null);
  return !!snap?.exists() && snap.data().banned === true;
}

/**
 * Galeri akışı. GİZLİ MODDA sorgu KENDİ karelerimizle sınırlanır — bu bir
 * nezaket değil zorunluluk: kural gizli modda başkasının dokümanını okumayı
 * reddediyor ve koleksiyonun tamamını istersek sorgunun TAMAMI reddedilir.
 *
 * Beğeni sayıları likes alt koleksiyonundan derleniyor (media dokümanında
 * sayaç tutulmuyor: bir misafir başkasının media dokümanını güncelleyemez).
 */
export function subscribeMedia(
  event: EventDoc,
  uid: string,
  onData: (rows: MediaDoc[]) => void,
  onError: (e: unknown) => void,
): Unsubscribe {
  const col = collection(db, 'events', event.id, 'media');
  const q = event.mode === 'open' ? query(col) : query(col, where('ownerId', '==', uid));

  return onSnapshot(
    q,
    async (snap) => {
      const likeCounts = new Map<string, number>();
      const mine = new Set<string>();
      try {
        const likes = await getDocs(collection(db, 'events', event.id, 'likes'));
        likes.forEach((l) => {
          const data = l.data();
          const mid = String(data.mediaId);
          likeCounts.set(mid, (likeCounts.get(mid) ?? 0) + 1);
          if (data.uid === uid) mine.add(mid);
        });
      } catch {
        // beğeniler okunamadıysa galeri yine de gösterilsin
      }

      const rows: MediaDoc[] = snap.docs
        .map((d) => {
          const x = d.data();
          return {
            id: d.id,
            ownerId: String(x.ownerId ?? ''),
            ownerName: String(x.ownerName ?? ''),
            kind: (x.kind === 'video' ? 'video' : 'photo') as MediaKind,
            uri: String(x.uri ?? ''),
            thumbUri: x.thumbUri === undefined ? undefined : String(x.thumbUri),
            width: Number(x.width ?? 0),
            height: Number(x.height ?? 0),
            takenAt: Number(x.takenAt ?? 0),
            uploadedAt: Number(x.uploadedAt ?? 0),
            hidden: x.hidden === true,
            durationSec: typeof x.durationSec === 'number' ? x.durationSec : undefined,
            likeCount: likeCounts.get(d.id) ?? 0,
            likedByMe: mine.has(d.id),
          };
        })
        .filter((m) => !m.hidden || m.ownerId === uid)
        .sort((a, b) => b.uploadedAt - a.uploadedAt);

      onData(rows);
    },
    onError,
  );
}

export async function toggleLike(eventId: string, mediaId: string, uid: string, liked: boolean): Promise<void> {
  const ref = doc(db, 'events', eventId, 'likes', `${mediaId}~${uid}`);
  if (liked) await deleteDoc(ref);
  else await setDoc(ref, { mediaId, uid });
}

/** Kaynak imzasından türetilen kimlik — aynı dosyayı iki kez seçmek tek kayıt üretir. */
async function contentId(file: File, uid: string): Promise<string> {
  const seed = `${file.name}|${file.size}|${file.lastModified}`;
  const bytes = new TextEncoder().encode(seed);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${hex}_${uid}`;
}

interface Prepared {
  blob: Blob;
  ext: string;
  width: number;
  height: number;
  durationSec?: number;
}

/**
 * Fotoğrafı yüklemeden ÖNCE tarayıcıda küçültür (uzun kenar 2048px, JPEG).
 * Düğün wifi'ında farkı yaratan şey bu — native tarafta da aynı eşik var.
 * Video olduğu gibi gider; yalnız süresi ve boyutu okunur.
 */
async function prepare(file: File): Promise<Prepared> {
  if (file.type.startsWith('video/')) {
    const meta = await readVideoMeta(file);
    return { blob: file, ext: file.name.split('.').pop()?.toLowerCase() || 'mp4', ...meta };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-unavailable');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
  if (!blob) throw new Error('encode-failed');
  return { blob, ext: 'jpg', width: w, height: h };
}

// SAFARI BİR .mov İÇİN HİÇBİR ŞEY SÖYLEMEZ (Berk, 2026-08-24: web'de video yükleme
// %0'da donuyordu). Çözemediği bir blob için ne `loadedmetadata` ne `error`
// tetikleniyor; söz hiç sonuçlanmıyor, üstteki await hiç dönmüyor ve yükleme
// sonsuza kadar %0'da kalıyor — üstelik hiçbir şey fırlatılmadığı için çevredeki
// try/catch de hiçbir şey görmüyor. Kardeş üründe (GuestCam ba7bfe7) aynı sessizlik
// iki aylık misafir videosunu yutmuştu.
//
// Süre sınırı o sessizliği sıradan bir sonuca çeviriyor: ölçüler sıfır kalır,
// yükleme normal şekilde devam eder. Sıfır ölçü zaten kabul edilen bir durum —
// `onerror` dalı da bugüne kadar aynısını yapıyordu.
const VIDEO_META_TIMEOUT_MS = 4000;

function readVideoMeta(file: File): Promise<{ width: number; height: number; durationSec: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    let settled = false;
    const finish = (meta: { width: number; height: number; durationSec: number }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      v.removeAttribute('src');
      URL.revokeObjectURL(url);
      resolve(meta);
    };
    const timer = setTimeout(() => finish({ width: 0, height: 0, durationSec: 0 }), VIDEO_META_TIMEOUT_MS);

    v.preload = 'metadata';
    v.muted = true;
    v.playsInline = true;
    v.onloadedmetadata = () =>
      finish({
        width: v.videoWidth,
        height: v.videoHeight,
        durationSec: Number.isFinite(v.duration) ? Math.round(v.duration) : 0,
      });
    v.onerror = () => finish({ width: 0, height: 0, durationSec: 0 });
    v.src = url;
  });
}

export class UploadError extends Error {}

const THUMB_EDGE = 480;
const POSTER_TIMEOUT_MS = 8000;

/**
 * Izgara karesi. Fotoğrafta dosyanın kendisinden, videoda İLK KAREDEN üretilir —
 * ikisi de TARAYICIDA, yükleme öncesi. Üretilemezse null döner ve yükleme
 * etkilenmez; doküman thumbUri'siz yazılır, ızgara eski davranışına döner.
 */
async function makeThumb(file: File): Promise<Blob | null> {
  if (file.type.startsWith('video/')) return videoPoster(file);
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = scaledCanvas(bitmap.width, bitmap.height);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.7));
  } catch {
    return null;
  }
}

function scaledCanvas(w: number, h: number): HTMLCanvasElement {
  const scale = Math.min(1, THUMB_EDGE / Math.max(w, h)) || 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  return canvas;
}

/**
 * Videonun poster karesi. YEREL dosyadan okunur — uzaktaki mp4'e hiç dokunulmaz.
 *
 * iOS Safari burada üç yerde nazlı, üçü de sahada görüldü (Berk, 2026-08-24:
 * yüklenen videoların kapağı gelmedi):
 *   • `createImageBitmap(videoElement)` güvenilir değil — kareyi canvas'a DOĞRUDAN
 *     çizmek gerekiyor (GuestCam'de çalışan hâli de bu).
 *   • Eleman DOM'da değilse ve hiç oynatılmadıysa kare çözülmeyebiliyor; bu yüzden
 *     ekran dışına eklenip sessizce play/pause ediliyor.
 *   • `preload="metadata"` seek için yetmiyor, `auto` gerekiyor.
 * Yine de bazı .mov'lar hiç çözülmüyor — o zaman poster'siz devam edilir.
 */
function videoPoster(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    let settled = false;
    const finish = (out: Blob | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      v.pause();
      v.removeAttribute('src');
      v.remove();
      URL.revokeObjectURL(url);
      resolve(out);
    };
    const timer = setTimeout(() => finish(null), POSTER_TIMEOUT_MS);

    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0';
    document.body.appendChild(v);

    const grab = () => {
      try {
        const canvas = scaledCanvas(v.videoWidth, v.videoHeight);
        const ctx = canvas.getContext('2d');
        if (!ctx || !v.videoWidth) return finish(null);
        // Kareyi DOĞRUDAN elemandan çiz — createImageBitmap(video) Safari'de düşüyor.
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b) => finish(b), 'image/jpeg', 0.7);
      } catch {
        finish(null);
      }
    };

    v.onseeked = grab;
    v.onloadeddata = () => {
      // 0. saniye çoğu kodekte siyah kare veriyor; yarım saniye güvenli.
      const t = Math.min(0.5, (v.duration || 1) / 2);
      // play() iOS'ta çözücüyü uyandırıyor; seek zaten kareyi getirecek.
      void v.play().catch(() => undefined);
      try {
        v.currentTime = t;
      } catch {
        grab();
      }
    };
    v.onerror = () => finish(null);
    v.src = url;
  });
}

export async function uploadOne(
  event: EventDoc,
  uid: string,
  ownerName: string,
  file: File,
  onProgress: (p: number) => void,
): Promise<void> {
  if (file.type.startsWith('video/') && file.size > VIDEO_MAX_BYTES) {
    throw new UploadError('video-too-large');
  }

  const id = await contentId(file, uid);
  const prepared = await prepare(file);
  onProgress(0.1);

  const path = `events/${event.id}/${uid}/${id}.${prepared.ext}`;
  const task = uploadBytesResumable(storageRef(storage, path), prepared.blob, {
    contentType: prepared.blob.type || file.type,
  });

  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        if (snap.totalBytes > 0) onProgress(0.1 + 0.8 * (snap.bytesTransferred / snap.totalBytes));
      },
      reject,
      () => resolve(),
    );
  });

  const uri = await getDownloadURL(task.snapshot.ref);
  onProgress(0.92);

  // EN İYİ ÇABA: poster üretimi ya da yüklemesi düşerse ana yükleme etkilenmez.
  let thumbUri: string | null = null;
  let thumbPath: string | null = null;
  try {
    const blob = await makeThumb(file);
    if (blob) {
      thumbPath = `events/${event.id}/${uid}/${id}_thumb.jpg`;
      const tRef = storageRef(storage, thumbPath);
      await uploadBytesResumable(tRef, blob, { contentType: 'image/jpeg' });
      thumbUri = await getDownloadURL(tRef);
    }
  } catch {
    thumbUri = null;
    thumbPath = null;
  }
  onProgress(0.95);

  const payload: Record<string, unknown> = {
    eventId: event.id,
    ownerId: uid,
    ownerName,
    kind: file.type.startsWith('video/') ? 'video' : 'photo',
    uri,
    path,
    width: prepared.width,
    height: prepared.height,
    takenAt: file.lastModified || Date.now(),
    uploadedAt: Date.now(),
    hidden: false,
  };
  if (prepared.durationSec !== undefined) payload.durationSec = prepared.durationSec;
  if (thumbUri && thumbPath) {
    payload.thumbUri = thumbUri;
    payload.thumbPath = thumbPath;
  }

  const mediaRef = doc(db, 'events', event.id, 'media', id);
  try {
    await setDoc(mediaRef, payload);
  } catch (first) {
    // Kural reddetti. En sık sebep paket kotasının sert tavanı AMA katılımda
    // görüldüğü gibi (bkz. joinEvent) ölmüş bir oturum da aynı reddi üretiyor ve
    // "albüm dolu" demek o durumda düpedüz yalan oluyor. Önce oturumu yeniden
    // ispatlayıp bir kez daha dene; ancak o da düşerse kota de.
    const live = await ensureAnon().catch(() => uid);
    if (live !== uid) {
      // Oturum takas edildi: ownerId ve Storage yolu ESKİ uid'yi taşıyor, yani
      // ikinci deneme kural gereği kesin reddedilir (ownerId == auth.uid şartı ve
      // yeni uid'in guests kaydı yok). Denemek yerine dürüst ol — "albüm dolu"
      // demek burada düpedüz yalan olurdu.
      void logError('upload.session-changed', first, { uid, live, eventId: event.id });
      throw new UploadError('failed');
    }
    try {
      await setDoc(mediaRef, payload);
    } catch (second) {
      void logError('upload.failed', second, {
        firstCode: errorCode(first),
        secondCode: errorCode(second),
        eventId: event.id,
        kind: payload.kind,
      });
      throw new UploadError('quota-reached');
    }
  }
}
