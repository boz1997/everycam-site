import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import type { Backend } from './types';

// LOCAL STACK ONLY (EC/local, `npm run local`): the Firebase emulators of the
// demo-sharecam project, the mock Paddle, seeded fake data. Nothing real.
//
// Three independent locks keep this file out of anything real:
//   1. vite.config.ts resolves backend/active.ts here only for the DEV SERVER in
//      `--mode localstack`, and refuses to BUILD in that mode — a production
//      bundle's module graph never contains this file;
//   2. the checks below: a dev server (import.meta.env.DEV) AND the explicit
//      VITE_LOCAL_STACK=1 flag from .env.localstack AND a loopback hostname;
//   3. scripts/check-dist.mjs (postbuild) fails every build whose output
//      mentions the demo project, the emulator ports or the mock.
const env = import.meta.env;
if (!env.DEV || env.VITE_LOCAL_STACK !== '1') {
  throw new Error('local backend loaded outside the local stack');
}
if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) {
  throw new Error('local backend served from a non-loopback host');
}

const HOST = '127.0.0.1';
const port = (name: string): number => {
  const n = Number(env[name]);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`${name} missing from .env.localstack`);
  return n;
};
const PORTS = {
  auth: port('VITE_LOCAL_AUTH_PORT'),
  firestore: port('VITE_LOCAL_FIRESTORE_PORT'),
  functions: port('VITE_LOCAL_FUNCTIONS_PORT'),
  storage: port('VITE_LOCAL_STORAGE_PORT'),
};
const SITE = env.VITE_LOCAL_SITE_ORIGIN || `http://${HOST}:8796`;
const WEB = env.VITE_LOCAL_WEB_ORIGIN || window.location.origin;
const PROD_STORAGE = 'https://firebasestorage.googleapis.com/';

// A module re-run (HMR) must not connect the same SDK instance twice: the SDKs
// throw once an instance has been used.
const connected = new WeakSet<object>();

export const backend: Backend = {
  kind: 'local',
  // demo-* projects never reach Google: the emulators accept any key. The bucket
  // is the one functions/src/admin.ts and derive.ts name; the Storage emulator
  // serves it under the demo project (EC/local/config.mjs BUCKET).
  firebaseConfig: {
    apiKey: 'demo-sharecam-local-key',
    authDomain: 'demo-sharecam.firebaseapp.com',
    projectId: 'demo-sharecam',
    storageBucket: 'sharecam-1997boz.firebasestorage.app',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:00000000000000local',
  },
  connect({ app, auth, db, storage }) {
    if (connected.has(app)) return;
    connected.add(app);
    connectAuthEmulator(auth, `http://${HOST}:${PORTS.auth}`, { disableWarnings: true });
    connectFirestoreEmulator(db, HOST, PORTS.firestore);
    connectStorageEmulator(storage, HOST, PORTS.storage);
    // Every callable in the web app uses getFunctions(app, 'europe-west3'): the
    // same cached instance per app, now pointed at the emulator.
    connectFunctionsEmulator(getFunctions(app, 'europe-west3'), HOST, PORTS.functions);
    console.info(`[local stack] Firebase app "${app.name}" → demo-sharecam emulators`);
  },
  siteOrigin: SITE,
  // The local guest page (loopback: a phone scanning a local QR cannot reach it,
  // and nothing opens an account on the live project).
  guestLink: (code) => `${WEB}/?code=${encodeURIComponent(code)}`,
  wallLink: (code) => `${SITE}/wall/?code=${encodeURIComponent(code)}`,
  albumLink: (code) => (code ? `${WEB}/album/?code=${encodeURIComponent(code)}` : `${WEB}/album/`),
  // Server code builds download URLs with the production host (exportZip.ts,
  // archive.ts, derive.ts); the bytes live in the Storage emulator.
  mediaUrl: (url) => (url.startsWith(PROD_STORAGE) ? `http://${HOST}:${PORTS.storage}/${url.slice(PROD_STORAGE.length)}` : url),
  badge: 'Local · demo-sharecam emulators',
};
