import type { Backend } from './types';

// Production: the real project, sharecam.app. This is the ONLY backend a
// `vite build` can bundle (vite.config.ts), and it has no emulator code path.
//
// Buradaki değerler İSTEMCİ YAPILANDIRMASIDIR, gizli değildir (uygulamanın
// app.json'ında da açıkta duruyor). Güvenliği firestore.rules ve storage.rules
// sağlıyor. Değerler src/firebase.ts'in 24 Eyl 2026 öncesi hâliyle BİREBİR aynı.
const SITE = 'https://sharecam.app';

export const backend: Backend = {
  kind: 'prod',
  firebaseConfig: {
    apiKey: 'AIzaSyCEFM3WDbee5oR7jW4JXKF-lhQUCUR9P8c',
    authDomain: 'sharecam-1997boz.firebaseapp.com',
    projectId: 'sharecam-1997boz',
    storageBucket: 'sharecam-1997boz.firebasestorage.app',
    messagingSenderId: '299822660999',
    appId: '1:299822660999:ios:7bedf621b740f80d846722',
  },
  connect: () => {
    /* the real services, nothing to redirect */
  },
  siteOrigin: SITE,
  guestLink: (code) => `${SITE}/e/${encodeURIComponent(code)}`,
  wallLink: (code) => `${SITE}/wall/?code=${encodeURIComponent(code)}`,
  albumLink: (code) => (code ? `${SITE}/album?code=${encodeURIComponent(code)}` : `${SITE}/album`),
  mediaUrl: (url) => url,
  badge: null,
};
