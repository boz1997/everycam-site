import { checkoutEventFrom, type CheckoutDriver, type CheckoutEvent, type PaddleEnv } from './types';

// Paddle Billing on the dashboard: the overlay checkout and nothing else (plan
// §3.4, ported from AllShots web-host/src/backend/paddleJs.ts). The transaction
// is created by the SERVER (webCheckoutStart decides the product from the event
// document and config/web, records the order and sets checkout.url, D13); the
// browser only hands its id to Paddle.js. Client-side tokens are public by
// design — one per environment, from the build env (VITE_PADDLE_TOKEN_SANDBOX /
// VITE_PADDLE_TOKEN_LIVE). No token → the dashboard shows "coming soon".

const TOKENS: Record<PaddleEnv, string | undefined> = {
  sandbox: import.meta.env.VITE_PADDLE_TOKEN_SANDBOX,
  live: import.meta.env.VITE_PADDLE_TOKEN_LIVE,
};

interface PaddleJs {
  Environment: { set: (env: PaddleEnv) => void };
  Initialize: (o: {
    token: string;
    checkout?: { settings?: Record<string, unknown> };
    eventCallback?: (e: { name: string; data?: unknown }) => void;
  }) => void;
  Checkout: {
    open: (o: { transactionId: string; customer?: { email: string }; settings?: Record<string, unknown> }) => void;
    close: () => void;
  };
}
declare global {
  interface Window {
    Paddle?: PaddleJs;
  }
}

// D25: no discount field in our checkouts (Paddle's default shows one). Hygiene
// only — the browser is the buyer's; the server refuses a discounted payment
// anyway (functions/src/paddle.ts paymentProblem). Set on Initialize too, so a
// checkout Paddle.js opens by itself from a ?_ptxn= payment link has it.
const NO_DISCOUNTS = { showAddDiscounts: false } as const;
// Paddle's overlay speaks these; anything else falls back to English.
const PADDLE_LOCALES = new Set(['en', 'tr', 'es', 'de', 'fr', 'it', 'pt', 'nl', 'pl']);

let loaded: Promise<PaddleJs> | null = null;
let initialisedFor: PaddleEnv | null = null;
let listener: ((e: CheckoutEvent) => void) | null = null;

function loadScript(): Promise<PaddleJs> {
  if (window.Paddle) return Promise.resolve(window.Paddle);
  loaded ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    s.async = true;
    s.onload = () => (window.Paddle ? resolve(window.Paddle) : reject(new Error('paddle-missing')));
    s.onerror = () => reject(new Error('paddle-load-failed'));
    document.head.appendChild(s);
  });
  return loaded;
}

/** Ready-to-open Paddle for `env`. Paddle.js binds itself to one environment per
 *  page load — config/web.env only flips with a deliberate change, so a second
 *  environment in one session is refused, not guessed. */
async function paddleFor(env: PaddleEnv, locale?: string): Promise<PaddleJs> {
  const token = TOKENS[env];
  if (!token) throw new Error(`paddle-token-${env}`);
  const paddle = await loadScript();
  if (initialisedFor && initialisedFor !== env) throw new Error('paddle-env-switch');
  if (!initialisedFor) {
    if (env === 'sandbox') paddle.Environment.set('sandbox');
    paddle.Initialize({
      token,
      checkout: { settings: { ...NO_DISCOUNTS, ...(locale && PADDLE_LOCALES.has(locale) ? { locale } : {}) } },
      eventCallback: (e) => {
        const ev = checkoutEventFrom(e.name);
        if (!ev || !listener) return;
        // The plan arrives on the event document (webhook); closing the overlay
        // lets the page's "applying" state be seen instead of Paddle's receipt.
        if (ev === 'completed') {
          try {
            paddle.Checkout.close();
          } catch {
            /* already closed */
          }
        }
        listener(ev);
      },
    });
    initialisedFor = env;
  }
  return paddle;
}

export const paddleJsCheckout: CheckoutDriver = {
  configured: () => !!(TOKENS.sandbox || TOKENS.live),
  configuredFor: (env) => !!TOKENS[env],
  async open(transactionId, env, onEvent, opts) {
    const paddle = await paddleFor(env, opts?.locale);
    listener = onEvent;
    // A pre-filled email skips a step; Paddle ignores it if it does not accept it.
    const email = opts?.email?.trim();
    const locale = opts?.locale && PADDLE_LOCALES.has(opts.locale) ? { locale: opts.locale } : {};
    paddle.Checkout.open({
      transactionId,
      ...(email ? { customer: { email } } : {}),
      settings: { displayMode: 'overlay', theme: 'light', ...locale, ...NO_DISCOUNTS },
    });
  },
  // D13: every Sharecam transaction sets checkout.url = https://sharecam.app/join/host/,
  // so a Paddle payment link opens this page with ?_ptxn=txn_…; Paddle.js opens
  // that checkout by itself once initialised. The id does not say which
  // environment it lives in; a live token wins when the build has one.
  resumePaymentLink(locale) {
    let txn: string | null = null;
    try {
      txn = new URL(window.location.href).searchParams.get('_ptxn');
    } catch {
      txn = null;
    }
    if (!txn || !/^txn_[a-z0-9]+$/i.test(txn)) return;
    const env: PaddleEnv | null = TOKENS.live ? 'live' : TOKENS.sandbox ? 'sandbox' : null;
    if (!env) return;
    paddleFor(env, locale).catch(() => {
      /* Paddle.js unreachable: nothing to resume */
    });
  },
};
