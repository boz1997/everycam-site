import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

// The one seam between the web pages and the world they run against (plan §3.1,
// §5; ported from AllShots web-host/src/backend). Two implementations, picked at
// BUILD time by vite.config.ts:
//   prod.ts   the real project sharecam-1997boz, Paddle.js, sharecam.app links —
//             the only one a production build can ever contain;
//   local.ts  the demo-sharecam emulators + the mock Paddle of EC/local
//             (`npm run local`), reachable only from `vite --mode localstack`.
// Both are checked against this interface by tsc (each is declared `: Backend`).
//
// The checkout driver is a SEPARATE seam (checkout.ts → paddleJs.ts, or
// localCheckout.ts → mockCheckout.ts on the local stack) so the guest, uploader
// and album pages — which import firebase.ts, and therefore this backend — never
// carry Paddle code (D20: pages the app opens or shares have nothing to buy).

export type PaddleEnv = 'sandbox' | 'live';

/** What the checkout UI reacts to. A declined card is not here on purpose:
 *  Paddle keeps its overlay open and lets the buyer try another card. */
export type CheckoutEvent = 'completed' | 'closed' | 'error';

export interface CheckoutDriver {
  /** Whether this build can open a checkout at all (a client-side token exists). */
  configured(): boolean;
  /** Whether it can open one in `env` (a client-side token for that environment). */
  configuredFor(env: PaddleEnv): boolean;
  /** Opens the checkout for a transaction the SERVER created (webCheckoutStart). */
  open(
    transactionId: string,
    env: PaddleEnv,
    onEvent: (e: CheckoutEvent) => void,
    opts?: { email?: string | null; locale?: string },
  ): Promise<void>;
  /** A Paddle payment link (…/join/host/?_ptxn=txn_…, D13) landed on the dashboard:
   *  let Paddle.js open that checkout. No-op where there is no Paddle.js. */
  resumePaymentLink(locale?: string): void;
}

export interface Backend {
  kind: 'prod' | 'local';
  firebaseConfig: FirebaseOptions;
  /** Runs once per Firebase app (the default one and the named 'host' one), right
   *  after its SDK objects exist and before anything uses them. The local backend
   *  also points Functions (europe-west3) of that app at the emulator. */
  connect(sdk: { app: FirebaseApp; auth: Auth; db: Firestore; storage: FirebaseStorage }): void;
  /** The marketing site: legal links, the album / wall pages. */
  siteOrigin: string;
  /** What an event's QR code and share link open. */
  guestLink(code: string): string;
  /** The live wall of an event. */
  wallLink(code: string): string;
  /** The couple's album page, with the code pre-filled. */
  albumLink(code?: string): string;
  /** A Storage download URL as this environment can fetch it. */
  mediaUrl(url: string): string;
  /** A small always-visible label, or null (production). */
  badge: string | null;
}

/** Paddle.js / mock checkout event names → what the page acts on. */
export function checkoutEventFrom(name: string): CheckoutEvent | null {
  if (name === 'checkout.completed') return 'completed';
  if (name === 'checkout.closed') return 'closed';
  if (name === 'checkout.error') return 'error';
  // checkout.payment.failed: the overlay stays open and offers a retry, so the
  // page must not reset underneath it.
  return null;
}
