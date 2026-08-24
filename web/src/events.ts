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
const VIDEO_MAX_BYTES = 50 * 1024 * 1024; // storage.rules tavanı

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

function readVideoMeta(file: File): Promise<{ width: number; height: number; durationSec: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      const meta = {
        width: v.videoWidth,
        height: v.videoHeight,
        durationSec: Number.isFinite(v.duration) ? Math.round(v.duration) : 0,
      };
      URL.revokeObjectURL(url);
      resolve(meta);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0, durationSec: 0 });
    };
    v.src = url;
  });
}

export class UploadError extends Error {}

const THUMB_EDGE = 480;

/**
 * Izgara karesi. Fotoğrafta dosyanın kendisinden, videoda İLK KAREDEN üretilir —
 * ikisi de TARAYICIDA, yükleme öncesi. Üretilemezse null döner ve yükleme
 * etkilenmez; doküman thumbUri'siz yazılır, ızgara eski davranışına döner.
 */
async function makeThumb(file: File): Promise<Blob | null> {
  try {
    const bitmap = file.type.startsWith('video/') ? await firstVideoFrame(file) : await createImageBitmap(file);
    if (!bitmap) return null;
    const scale = Math.min(1, THUMB_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.7));
  } catch {
    return null;
  }
}

/** Videonun ilk karesi. YEREL dosyadan okunur — uzaktaki mp4'e hiç dokunulmaz. */
function firstVideoFrame(file: File): Promise<ImageBitmap | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    let settled = false;
    const done = (out: ImageBitmap | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve(out);
    };
    v.preload = 'metadata';
    v.muted = true;
    v.playsInline = true;
    v.onseeked = () => {
      createImageBitmap(v).then(done).catch(() => done(null));
    };
    v.onloadeddata = () => {
      // 0 saniye çoğu kodekte siyah kare veriyor; yarım saniye güvenli.
      v.currentTime = Math.min(0.5, v.duration || 0.5);
    };
    v.onerror = () => done(null);
    // Safari bazı .mov'larda hiç cevap vermiyor — poster uğruna yükleme bekletilmez.
    setTimeout(() => done(null), 4000);
    v.src = url;
  });
}

/**
 * Dosyayı Storage'a, metadata'yı Firestore'a yazar — native mediaService ile
 * aynı sıra ve aynı alanlar. Yol içinde ownerId olması kritik: storage.rules
 * "bu dosyayı kim yükledi" sorusunu Firestore'a gitmeden cevaplıyor.
 */
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
