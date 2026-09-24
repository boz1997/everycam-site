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
import { doc, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { hostDb as db, hostStorage as storage } from '../hostSession';

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

/** Bu dosya orijinal olarak yüklenebilir mi? */
export function originalVerdict(file: File): OriginalVerdict {
  if (file.type.startsWith('video/')) return 'video'; // v1: yalnız fotoğraf
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
