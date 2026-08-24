import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Uzak hata günlüğü — uygulamadaki src/utils/errorLog.ts'in web karşılığı,
// AYNI koleksiyon ve AYNI alanlar (`errorLogs`, kural: firestore.rules).
//
// Neden gerek: misafirin tarayıcısında olan hatayı GÖREMİYORUZ. 2026-08-23'te
// bir misafir "misafir limiti doldu" hatası aldı, sayfayı yenileyince girdi ve
// elimizde tek satır kanıt yoktu — çünkü joinEvent'in catch'i hata nesnesini
// hiç bağlamıyordu. Bu dosya o körlüğü kapatır.
//
// SINIRI BİL: kural yazana `request.auth.uid` şartı koyuyor, yani arıza
// "kimlik yok" ise BU GÜNLÜK DE YAZILAMAZ. Bu yüzden tek teşhis kanalı değil —
// hata kodu kullanıcının ekranında da gösteriliyor.
//
// EN İYİ ÇABA: kendi hatasını yutar, çağıran akışı ASLA bloke etmez.
const LOG_TTL_DAYS = 30;

export function errorCode(error: unknown): string {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : 'unknown';
}

export async function logError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>,
): Promise<void> {
  const e = error as { message?: string } | null;
  const message = e?.message ?? String(error);
  try {
    await addDoc(collection(db, 'errorLogs'), {
      context,
      message: String(message).slice(0, 1000),
      code: errorCode(error),
      // Donmuş uid ile CANLI uid yan yana: ikisi ayrışmışsa arıza oturum
      // takasıdır ve bu tek alan onu tek kayıtta ispatlar.
      extra: { ...(extra ?? {}), authUid: auth.currentUser?.uid ?? null },
      uid: auth.currentUser?.uid ?? null,
      platform: 'web',
      appVersion: null,
      createdAt: serverTimestamp(),
      expireAt: Timestamp.fromMillis(Date.now() + LOG_TTL_DAYS * 86_400_000),
    });
  } catch {
    /* günlükleme asla hata fırlatmaz */
  }
}
