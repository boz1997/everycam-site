import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

// The one seam between the web pages and the world they run against (plan §3.1,
// §5; ported from AllShots web-host/src/backend). Two implementations, picked at
// BUILD time by vite.config.ts:
//   prod.ts   the real project sharecam-1997boz, sharecam.app links —
//             the only one a production build can ever contain;
//   local.ts  the demo-sharecam emulators + the mock Paddle / Polar of EC/local
//             (`npm run local`), reachable only from `vite --mode localstack`.
// Both are checked against this interface by tsc (each is declared `: Backend`).
//
// The checkout drivers are a SEPARATE seam (checkout.ts → paddleJs.ts +
// polarEmbed.ts, or localCheckout.ts → mockCheckout.ts on the local stack) so the
// guest, uploader and album pages — which import firebase.ts, and therefore this
// backend — never carry checkout code (D20: pages the app opens or shares have
// nothing to buy). WHICH driver opens a checkout is decided at RUN time by the
// provider the server names (config/web.provider, POLAR-PLAN P1): checkout.ts
// driverFor(provider).

export type WebEnv = 'sandbox' | 'live';
/** Paddle.js's name for the same thing (paddleJs.ts, unchanged since WP-D). */
export type PaddleEnv = WebEnv;
/** Who sells a web checkout: config/web.provider (missing = 'paddle'), returned
 *  by the server's preview and start (POLAR-PLAN P1, §3.1). */
export type WebProvider = 'paddle' | 'polar';

/** What the checkout UI reacts to. A declined card is not here on purpose:
 *  Paddle and Polar keep their checkout open and let the buyer try another card.
 *  Polar also says `ready` (the embedded checkout loaded) and `locked` (Polar is
 *  taking the payment: the checkout cannot be closed until it succeeds). */
export type CheckoutEvent = 'completed' | 'closed' | 'error' | 'ready' | 'locked';

/** A checkout the SERVER opened (webCheckoutStart `{eventId, planId}`), as the
 *  dashboard drives it (host/lib/checkout.ts startCheckout normalises the reply). */
export interface CheckoutSession {
  provider: WebProvider;
  env: WebEnv;
  /** The webOrders id — what orderStatus takes: Paddle `txn_…`, Polar `po_<checkout uuid>`. */
  orderId: string;
  /** Polar: the checkout's page (Checkout.url), embedded or — the fallback — opened
   *  hosted. Paddle: none (Paddle.js opens the transaction by its id). */
  url?: string;
}

/** One provider's checkout on the dashboard (checkout.ts driverFor). */
export interface WebCheckoutDriver {
  /** Whether this build can open a checkout in `env`: Paddle needs a client-side
   *  token for it; Polar needs none (always true). */
  configuredFor(env: WebEnv): boolean;
  /** Opens the checkout the SERVER created. */
  open(session: CheckoutSession, onEvent: (e: CheckoutEvent) => void, opts?: { email?: string | null; locale?: string }): Promise<void>;
}

/** The Paddle.js driver's own shape (paddleJs.ts; mockCheckout.ts on the local
 *  stack). driverFor('paddle') wraps it with fromPaddleDriver. */
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

/** The Paddle.js driver behind the provider-neutral seam: the session's order id
 *  IS the Paddle transaction id. */
export function fromPaddleDriver(d: CheckoutDriver): WebCheckoutDriver {
  return {
    configuredFor: (env) => d.configuredFor(env),
    open: (s, onEvent, opts) => d.open(s.orderId, s.env, onEvent, opts),
  };
}

/** Checkout event names → what the page acts on. Paddle.js / mock Paddle:
 *  `checkout.*`. Polar (@polar-sh/checkout embed, EmbedCheckoutMessage.event;
 *  the mock Polar page speaks the same): success → completed, close → closed,
 *  confirmed → locked, loaded → ready (POLAR-PLAN §4.4). */
export function checkoutEventFrom(name: string, provider: WebProvider = 'paddle'): CheckoutEvent | null {
  if (provider === 'polar') {
    if (name === 'success') return 'completed';
    if (name === 'close') return 'closed';
    if (name === 'confirmed') return 'locked';
    if (name === 'loaded') return 'ready';
    return null;
  }
  if (name === 'checkout.completed') return 'completed';
  if (name === 'checkout.closed') return 'closed';
  if (name === 'checkout.error') return 'error';
  // checkout.payment.failed: the overlay stays open and offers a retry, so the
  // page must not reset underneath it.
  return null;
}
