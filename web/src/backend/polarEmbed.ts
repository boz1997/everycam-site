import { checkoutEventFrom, type CheckoutEvent, type WebCheckoutDriver } from './types';

// Polar on the dashboard (POLAR-PLAN P3, §4.4). The checkout is created by the
// SERVER (webCheckoutStart: POST /v1/checkouts/ with exactly one product, our
// metadata, success_url, return_url and embed_origin https://sharecam.app, §3.3);
// the browser only shows its page, embedded over the dashboard with
// @polar-sh/checkout's embed — pinned at exactly 0.4.1 (package.json) and loaded
// by a dynamic import when a checkout opens, so nothing of it is fetched before.
// Polar needs no client-side token.
//
// The embed's messages (EmbedCheckoutMessage.event, types.ts checkoutEventFrom):
//   loaded    → ready      the frame is up (create() resolves only then)
//   confirmed → locked     Polar is taking the payment; a close is refused until
//                          success (the embed's own rule, kept here)
//   success   → completed  preventDefault(): the embed would send the whole page
//                          to success_url; the dashboard stays and shows
//                          "applying" until the webhook's plan reaches the event
//                          document (same as Paddle)
//   close     → closed     the buyer left the checkout
//
// Fallback (P3): the frame must say `loaded` within LOAD_TIMEOUT_MS. If it does not
// — the embed chunk failed to load, Polar refused the frame (its CSP names only the
// checkout's embed_origin as frame-ancestor, so any other host never loads), or the
// network is slow — the page goes to the same checkout HOSTED (Checkout.url). Polar
// then returns to success_url (…/join/host/?checkout_id=…, App.tsx) or return_url
// (the event's package tab). The hosted page also has Apple Pay / Google Pay, which
// the embed lacks until Polar validates the domain (embed.md L323-330).
//
// The logic sits in polarCheckout(deps) so the local stack runs the SAME code with a
// mock embed (mockCheckout.ts mockPolarCheckout): Polar's embed accepts messages
// only from https://polar.sh and https://sandbox.polar.sh.

export const LOAD_TIMEOUT_MS = 8_000;

type EmbedEventName = 'loaded' | 'close' | 'confirmed' | 'success';

/** What the driver uses of an embedded checkout (PolarEmbedCheckout's instance). */
export interface EmbedInstance {
  addEventListener(type: EmbedEventName, listener: (e: Event) => void): void;
  close(): void;
}
/** PolarEmbedCheckout's static side: create() resolves when the frame says `loaded`. */
export interface EmbedFactory {
  create(url: string, options?: { theme?: 'light' | 'dark' }): Promise<EmbedInstance>;
}

export interface PolarDeps {
  load(): Promise<EmbedFactory>;
  /** The only checkout pages this driver opens (embedded or by redirect). */
  urlOk(u: URL): boolean;
  /** Removes what a create() that never loaded left on the page (frame, spinner,
   *  scroll lock): create() gives nothing back before `loaded`. */
  sweep(u: URL): void;
  /** The hosted fallback. */
  redirect(url: string): void;
  loadTimeoutMs?: number;
}

export function polarCheckout(deps: PolarDeps): WebCheckoutDriver {
  let shown: EmbedInstance | null = null;

  return {
    configuredFor: () => true,
    async open(session, onEvent) {
      let u: URL | null = null;
      try {
        u = new URL(session.url ?? '');
      } catch {
        u = null;
      }
      if (!u || !deps.urlOk(u)) throw new Error('polar-url');
      const url = u.toString();
      shown?.close();
      shown = null;

      // A chunk that arrives after the deadline must not put a frame over a page
      // that is already on its way to the hosted checkout.
      let gaveUp = false;
      let timer = 0;
      const late = new Promise<null>((resolve) => {
        timer = window.setTimeout(() => {
          gaveUp = true;
          resolve(null);
        }, deps.loadTimeoutMs ?? LOAD_TIMEOUT_MS);
      });
      let embed: EmbedInstance | null;
      try {
        embed = await Promise.race([deps.load().then((f) => (gaveUp ? null : f.create(url, { theme: 'light' }))), late]);
      } catch {
        embed = null;
      }
      window.clearTimeout(timer);
      if (!embed) {
        gaveUp = true;
        deps.sweep(u);
        deps.redirect(url);
        return;
      }

      const me = embed;
      shown = me;
      let locked = false;
      const finish = (ev: CheckoutEvent) => {
        me.close();
        if (shown === me) shown = null;
        onEvent(ev);
      };
      const onMessage = (e: Event) => {
        const ev = checkoutEventFrom(e.type, 'polar');
        if (ev === 'locked') {
          locked = true;
          onEvent(ev);
        } else if (ev === 'closed') {
          e.preventDefault();
          if (!locked) finish(ev);
        } else if (ev === 'completed') {
          e.preventDefault();
          locked = false;
          finish(ev);
        }
      };
      for (const name of ['confirmed', 'close', 'success'] as const) me.addEventListener(name, onMessage);
      onEvent('ready');
    },
  };
}

/** Polar's own checkout pages: https on polar.sh or a subdomain of it (sandbox.polar.sh
 *  today; the live host is not verified against a live checkout yet). */
const polarHost = (u: URL) => u.protocol === 'https:' && (u.hostname === 'polar.sh' || u.hostname.endsWith('.polar.sh'));

export const polarEmbedCheckout: WebCheckoutDriver = polarCheckout({
  load: async () => (await import('@polar-sh/checkout/embed')).PolarEmbedCheckout,
  urlOk: polarHost,
  sweep(u) {
    document.querySelectorAll('iframe').forEach((f) => {
      try {
        const s = new URL(f.src);
        if (s.origin === u.origin && s.pathname === u.pathname) f.remove();
      } catch {
        /* not ours */
      }
    });
    document.querySelectorAll('.polar-loader-spinner').forEach((s) => s.parentElement?.remove());
    document.body.classList.remove('polar-no-scroll');
  },
  redirect: (url) => window.location.assign(url),
});
