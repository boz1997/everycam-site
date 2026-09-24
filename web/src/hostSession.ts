import { getApps, initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { backend } from './backend/active';
import { auth as guestAuth } from './firebase';

// ETKİNLİK SAHİBİNİN OTURUMU — isimli Firebase uygulaması 'host' (plan D2).
//
// Aynı origin'de (sharecam.app) misafir istemcisi de yaşar ve varsayılan
// uygulamanın ANONİM oturumunu kullanır (src/firebase.ts). Tek bir `currentUser`
// paylaşılsaydı, telefondan panele giriş yapan bir misafir signInWithEmail ile
// anonim uid'ini kaybeder, katıldığı her albümde "benim fotoğraflarım"
// sahipliğini yitirirdi. İsimli uygulamanın kalıcılık anahtarı ayrıdır
// (firebase:authUser:<apiKey>:host): iki oturum birbirini asla ezmez.
//
// Kullananlar: panel (/join/host) ve masaüstü yükleyici (/join/upload, WP-E).
// Misafir sayfası, çiftin albümü (/join/album) varsayılan uygulamada kalır.
// QR eşleştirmesi (createUploadPairing / claimUploadPairing) varsayılan anonim
// oturumla yürür; dönen custom token BU uygulamada oturum açar.
//
// Web'de ASLA anonim host oluşturulmaz (D3): bu uygulamada signInAnonymously
// çağrılmaz. Bir anonim uid'e ancak uygulamayla eşleştirerek (custom token)
// ulaşılır; satın almadan önce e-posta/Google bağlanır (linkWithCredential,
// uid korunur).

export const HOST_APP_NAME = 'host';

export const hostApp = getApps().find((a) => a.name === HOST_APP_NAME) ?? initializeApp(backend.firebaseConfig, HOST_APP_NAME);
export const hostAuth = getAuth(hostApp);
export const hostDb = getFirestore(hostApp);
export const hostStorage = getStorage(hostApp);
/** Callables of the host session (every Sharecam function runs in europe-west3). */
export const hostFunctions = getFunctions(hostApp, 'europe-west3');
backend.connect({ app: hostApp, auth: hostAuth, db: hostDb, storage: hostStorage });

/** The guest (default, anonymous) app's callables — pairing runs on this session. */
export const guestFunctions = () => getFunctions(guestAuth.app, 'europe-west3');

/**
 * ESKİ YÜKLEYİCİ OTURUMUNUN GÖÇÜ (plan D2, rev 2).
 *
 * 24 Eyl 2026 öncesi yükleyici, host'un custom token'ını VARSAYILAN uygulamaya
 * açıyor ve uid'i localStorage 'sharecam.uploadHostUid'e yazıyordu
 * (UploadApp.tsx:146-151). `ensureAnon` bulduğu currentUser'ı yeniden kullandığı
 * için o tarayıcıda /join/ misafir sayfası da HOST uid'i ile çalışmaya devam
 * ederdi. Panelin ya da yeni yükleyicinin ilk açılışında: varsayılan uygulamanın
 * uid'i o anahtara eşitse varsayılan uygulamadan çıkış yapılır ve anahtar
 * silinir. `true` → "uygulamayla yeniden eşleştir" notu gösterilmeli.
 *
 * Eşleşmiyorsa (anahtar kalmış ama oturum zaten misafir) yalnız anahtar silinir:
 * yeni kod onu hiçbir yerde okumuyor. Her okuma/yazma try/catch içinde (gizli
 * pencere, engellenmiş depolama).
 */
export const LEGACY_HOST_KEY = 'sharecam.uploadHostUid';

export async function migrateLegacyHostSession(): Promise<boolean> {
  let legacy: string | null = null;
  try {
    legacy = localStorage.getItem(LEGACY_HOST_KEY);
  } catch {
    return false;
  }
  if (!legacy) return false;
  await guestAuth.authStateReady();
  const signedInAsHost = guestAuth.currentUser?.uid === legacy;
  if (signedInAsHost) {
    try {
      await signOut(guestAuth);
    } catch {
      return true; // key kept: the next load tries again
    }
  }
  try {
    localStorage.removeItem(LEGACY_HOST_KEY);
  } catch {
    /* storage blocked: nothing else reads the key */
  }
  return signedInAsHost;
}
