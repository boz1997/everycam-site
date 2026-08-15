import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase web SDK — mobil uygulamanın AYNI projesi.
//
// Buradaki değerler İSTEMCİ YAPILANDIRMASIDIR, gizli değildir (uygulamanın
// app.json'ında da açıkta duruyor). Güvenliği firestore.rules ve storage.rules
// sağlıyor: kota, ban, gizli mod ve paket kilidi hep orada zorlanıyor, bu yüzden
// web istemcisinin mobil istemciden daha fazla yetkisi yok.
//
// NOT: mobil taraf @react-native-firebase (native) kullanıyor çünkü JS SDK RN'de
// JS thread'ini kilitliyordu. Tarayıcıda öyle bir sorun yok — JS SDK burada
// doğru seçim.
const app = initializeApp({
  apiKey: 'AIzaSyCEFM3WDbee5oR7jW4JXKF-lhQUCUR9P8c',
  authDomain: 'sharecam-1997boz.firebaseapp.com',
  projectId: 'sharecam-1997boz',
  storageBucket: 'sharecam-1997boz.firebasestorage.app',
  messagingSenderId: '299822660999',
  appId: '1:299822660999:ios:7bedf621b740f80d846722',
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Anonim oturum. Misafirden hesap İSTENMEZ — QR'ı okutan kişi saniyeler içinde
 * yüklemeye başlayabilmeli (ürün kuralı: misafir kaydı yok, yalnız isim).
 *
 * Oturum tarayıcıda kalıcıdır: aynı cihazdan geri dönen misafir kendi
 * karelerini görmeye devam eder.
 */
export function ensureAnon(): Promise<string> {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      (user: User | null) => {
        unsub();
        if (user) {
          resolve(user.uid);
          return;
        }
        signInAnonymously(auth)
          .then((cred) => resolve(cred.user.uid))
          .catch(reject);
      },
      reject,
    );
  });
}
