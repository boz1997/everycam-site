// ORİJİNAL YÜKLEME — fotoğrafçının masaüstü sayfası (21 Eyl 2026).
//
// Misafir istemcisinden farkı: dosya TARAYICIDA KÜÇÜLTÜLMEZ. Orijinal olduğu
// gibi `events/{eventId}/{hostUid}/orig/{stem}.{ext}` yoluna gider; 2048px
// kopyayı ve hafif thumb'ı sunucu üretir (functions/src/derive.ts) ve medya
// dokümanını o açar. Bu sayfa medya dokümanı YAZMAZ.
//
// Kimlik: sayfa etkinlik sahibinin oturumuyla çalışır — isimli 'host' Firebase
// uygulaması (src/hostSession.ts, plan D2): uygulamayla eşleştirme (custom token,
// uploadLink.ts) ya da panelde (/join/host) açılmış oturum. storage.rules `orig/`
// yolunu yalnız klasör sahibine (uid == ownerId) açar; misafir (varsayılan,
// anonim) oturumu buraya hiç dokunmaz.
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { hostDb as db, hostStorage as storage } from '../hostSession';
import { makeThumb, prepare, VIDEO_MAX_BYTES } from '../events';

/**
 * İÇERİK kimliği: ilk 4 MB'ın SHA-256'sı + boyut. Misafir yükleyicisi ad|boyut|mtime
 * kullanır; fotoğrafçıda o yetmez — Lightroom'dan yeniden export edilen ya da
 * kopyalanan klasörde mtime değişir ve aynı kare ikinci kez yüklenirdi. 4 MB'lık
 * hash masaüstünde ~10 ms; aynı içerik = aynı kimlik = medya dokümanı zaten var.
 */
export async function originalId(file: File, uid: string): Promise<string> {
  const head = await file.slice(0, 4 * 1024 * 1024).arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', head);
  const hex = Array.from(new Uint8Array(digest)).slice(0, 10).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `o${hex}${file.size.toString(36)}_${uid}`;
}

// Sunucu (sharp, prebuilt libvips) açabildiği biçimler. HEIC/HEIF BİLEREK yok:
// HEVC çözücü lisans yüzünden prebuilt sharp'ta bulunmuyor; fotoğrafçı zaten
// JPEG export eder. RAW da yok (aynı sebep + tarayıcı önizleyemez).
const ORIGINAL_EXT: Record<string, string> = {
  jpg: 'jpg',
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  tif: 'tif',
  tiff: 'tif',
};
export const ORIGINAL_MAX_BYTES = 200 * 1024 * 1024; // storage.rules ile aynı

export type OriginalVerdict = 'ok' | 'unsupported' | 'too-large' | 'video';

/** Paketin video kotası doldu ya da pakette video yok: kural medya dokümanını reddetti. */
export class VideoQuotaError extends Error {}

/** Bu dosya orijinal olarak yüklenebilir mi? */
export function originalVerdict(file: File): OriginalVerdict {
  // Video (2 Eki 2026, Berk: "her şeyi aç"): orijinal yoluna DEĞİL, misafir
  // istemcisinin video yoluna gider (uploadVideo) — sunucu türetmesi yok, kapak
  // karesini tarayıcı çıkarır. Kota (paket video limiti) firestore.rules'ta.
  if (file.type.startsWith('video/')) return file.size > VIDEO_MAX_BYTES ? 'too-large' : 'video';
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ORIGINAL_EXT[ext]) return 'unsupported';
  if (file.size >= ORIGINAL_MAX_BYTES) return 'too-large';
  return 'ok';
}

export type OriginalResult = 'uploaded' | 'exists';

/**
 * Tek orijinali yükler. Medya dokümanı zaten varsa (aynı dosya daha önce
 * yüklenmiş ve türetilmiş) baytları hiç göndermez — aynı klasörü ikinci kez
 * bırakan fotoğrafçı için tek maliyet dosya başına 1 okuma.
 */
export async function uploadOriginal(
  eventId: string,
  uid: string,
  ownerName: string,
  file: File,
  onProgress: (p: number) => void,
): Promise<OriginalResult> {
  const stem = await originalId(file, uid);
  const existing = await getDoc(doc(db, 'events', eventId, 'media', stem));
  if (existing.exists()) return 'exists';

  const ext = ORIGINAL_EXT[file.name.split('.').pop()?.toLowerCase() ?? ''] ?? 'jpg';
  const path = `events/${eventId}/${uid}/orig/${stem}.${ext}`;
  const task = uploadBytesResumable(storageRef(storage, path), file, {
    contentType: file.type || 'image/jpeg',
    // Sunucu türetirken okur: kimin adına, ne zaman çekildi (EXIF yoksa dosya
    // tarihi), orijinal dosya adı (indirmede geri verilir).
    customMetadata: { ownerName, takenAt: String(file.lastModified || Date.now()), origName: file.name.slice(0, 200) },
  });
  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        if (snap.totalBytes > 0) onProgress(snap.bytesTransferred / snap.totalBytes);
      },
      reject,
      () => resolve(),
    );
  });
  return 'uploaded';
}

/**
 * Tek videoyu yükler (fotoğrafçı sayfası). Misafir istemcisinin uploadOne'ıyla
 * aynı şekil — dosya olduğu gibi `events/{eventId}/{hostUid}/{id}.{ext}`, kapak
 * karesi `_thumb.jpg`, medya dokümanı kind:'video' — ama host oturumuyla
 * (isimli 'host' uygulaması). Kimlik içerikten (originalId): aynı klasörü ikinci
 * kez bırakan fotoğrafçıda video yeniden gitmez. Kural reddi = paket video
 * kotası (fotoğrafçı etkinliğinde yükleyen tek kişi host, üyelik sorunu olamaz).
 */
export async function uploadVideo(
  eventId: string,
  uid: string,
  ownerName: string,
  file: File,
  onProgress: (p: number) => void,
): Promise<OriginalResult> {
  const id = await originalId(file, uid);
  const mediaRef = doc(db, 'events', eventId, 'media', id);
  if ((await getDoc(mediaRef)).exists()) return 'exists';

  const prepared = await prepare(file);
  const path = `events/${eventId}/${uid}/${id}.${prepared.ext}`;
  const task = uploadBytesResumable(storageRef(storage, path), prepared.blob, {
    contentType: prepared.blob.type || file.type || 'video/mp4',
  });
  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        if (snap.totalBytes > 0) onProgress(0.9 * (snap.bytesTransferred / snap.totalBytes));
      },
      reject,
      () => resolve(),
    );
  });
  const uri = await getDownloadURL(task.snapshot.ref);

  // EN İYİ ÇABA: kapak karesi çıkmazsa video yine galeriye girer.
  let thumbUri: string | null = null;
  let thumbPath: string | null = null;
  try {
    const blob = await makeThumb(file);
    if (blob) {
      thumbPath = `events/${eventId}/${uid}/${id}_thumb.jpg`;
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
    eventId,
    ownerId: uid,
    ownerName,
    kind: 'video',
    uri,
    path,
    width: prepared.width,
    height: prepared.height,
    takenAt: file.lastModified || Date.now(),
    uploadedAt: Date.now(),
    hidden: false,
    origName: file.name.slice(0, 200),
  };
  if (prepared.durationSec !== undefined) payload.durationSec = prepared.durationSec;
  if (thumbUri && thumbPath) {
    payload.thumbUri = thumbUri;
    payload.thumbPath = thumbPath;
  }
  try {
    await setDoc(mediaRef, payload);
  } catch (e) {
    if ((e as { code?: string })?.code === 'permission-denied') throw new VideoQuotaError('video-quota');
    throw e;
  }
  return 'uploaded';
}

