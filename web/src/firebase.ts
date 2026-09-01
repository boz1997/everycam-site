import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
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
 * KİMLİĞİ İSPATLANMIŞ anonim oturum. Bu üç adımın üçü de sahada yaşanmış bir
 * arızanın karşılığıdır — GuestCam'de aynı akış 1.0.1–1.0.8 arasında günde 1-3
 * kez "Missing or insufficient permissions" veriyordu (29 rapor) ve orada
 * `authStateReady` + `getIdToken` ile kapatıldı (EverybodyTakes 900b575).
 *
 * Sharecam'de bu boşluk GÖRÜNMEZDİ: etkinlik okuması herkese açık
 * (firestore.rules `allow read: if true`), isBanned reddi de yutuluyor — yani
 * kod ekranına kadar her şey kimliksiz de çalışıyor. Auth'un gerçekten şart
 * olduğu ilk işlem misafir kaydının yazılmasıdır, arıza da orada patlıyordu.
 *
 * Anonim oturum. Misafirden hesap İSTENMEZ — QR'ı okutan kişi saniyeler içinde
 * yüklemeye başlayabilmeli (ürün kuralı: misafir kaydı yok, yalnız isim).
 *
 * Oturum tarayıcıda kalıcıdır: aynı cihazdan geri dönen misafir kendi
 * karelerini görmeye devam eder.
 */
/**
 * KATILIM YAVAŞLIĞI ÖLÇÜMÜ (2026-09-01).
 *
 * Berk sahada "Safari'de 1-2 dakika döndü, uygulamada hiç giremedim" bildirdi;
 * aynı akış geliştirme makinesinde 999 ms sürüyor, yani YENİDEN ÜRETİLEMİYOR.
 * Tahminle auth yoluna dokunmak tehlikeli: aşağıdaki üç adım, GuestCam'de 29
 * rapor üreten bir arızanın çözümü. Bu yüzden önce ÖLÇÜYORUZ — hangi adımın
 * asıldığı bir dahaki sefere kayda geçsin.
 *
 * `authStateReady` en güçlü şüpheli: kalıcı oturumu IndexedDB'den okuyor ve
 * Safari'de (özellikle ITP / gizli sekme) IndexedDB dakikalarca asılabiliyor.
 * Ama kanıtsız kısaltmıyoruz: zaman aşımı koyup devam etmek, geri dönen misafiri
 * yeni bir anonim hesapla değiştirme riskini geri getirir.
 */
const phases: Record<string, number> = {};
function phase(name: string, startedAt: number) {
  phases[name] = Math.round(performance.now() - startedAt);
}
export function authPhases(): Record<string, number> {
  return { ...phases };
}

export async function ensureAnon(): Promise<string> {
  const t0 = performance.now();
  // (1) OTURUMUN GERİ YÜKLENMESİNİ BEKLE. QR'dan gelen soğuk açılışta kalıcı
  // oturum henüz IndexedDB'den okunmamış olabilir; eski hâl o anda currentUser'ı
  // null görüp GERİ DÖNEN misafiri yepyeni bir anonim hesapla değiştiriyordu.
  await auth.authStateReady();
  phase('authStateReady', t0);

  // (2) OTURUMU VARSAY DEĞİL, İSPATLA. Bir User nesnesi kimliği öldükten sonra
  // da elde kalır (hesap silinmiş, refresh token iptal edilmiş, yenileme
  // çevrimdışı düşmüş). Eski hâl "user var" deyip girişi atlıyor, sonraki her
  // yazma permission-denied dönüyordu. getIdToken token'ı tazeler ve oturum
  // gerçekten gitmişse fırlatır.
  const current = auth.currentUser;
  if (current) {
    try {
      await current.getIdToken();
      phase('getIdToken', t0);
      return current.uid;
    } catch (e) {
      // HER HATA "kimlik ölmüş" DEĞİLDİR. SDK oturumu yalnız iki kodda düşürüyor
      // (auth/user-disabled, auth/user-token-expired → isUserInvalidated); ağ
      // hatasında oturumu BİLEREK koruyor. Üstelik signInAnonymously mevcut anonim
      // kullanıcıda kısa devre yapıyor — yani currentUser hâlâ ayaktayken aşağı
      // düşmek aynı kullanıcıyı geri alıp aynı hatayı ikinci kez fırlatmaktan
      // ibaret olurdu. Oturum gerçekten düşürüldüyse currentUser null olur.
      if (auth.currentUser) throw e;
    }
  }

  // (3) TOKEN'I İLK FIRESTORE ÇAĞRISINDAN ÖNCE BAS. signInAnonymously hesap
  // oluşur oluşmaz çözülüyor; o boşlukta çıkan istek kimliksiz gidiyor ve
  // Firestore permission-denied ile cevaplıyor.
  const cred = await signInAnonymously(auth);
  phase('signInAnonymously', t0);
  await cred.user.getIdToken();
  phase('freshToken', t0);
  return cred.user.uid;
}
