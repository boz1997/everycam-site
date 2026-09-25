import { polarCheckout, type EmbedFactory, type EmbedInstance } from './polarEmbed';
import { checkoutEventFrom, type CheckoutDriver, type CheckoutEvent, type WebCheckoutDriver } from './types';

// Local stack only (imported by localCheckout.ts): stands in for the Paddle
// overlay and for Polar's embedded checkout.
//
// Paddle: the mock Paddle (EC/local/mockPaddle.mjs) serves a checkout page for
// the transaction webCheckoutStart opened on it; that page talks back with
// postMessage in Paddle's event names. Messages are accepted only from the
// mock's origin AND from this iframe's window AND with the mock's source tag.
//
// Polar: the REAL driver logic (polarEmbed.ts polarCheckout: 8 s fallback,
// success/close/confirmed handling) with a mock embed in place of
// @polar-sh/checkout's, whose messages are accepted only from polar.sh. The page
// is the checkout url the server got from the mock Polar API (loopback only); it
// posts the embed's own messages — { type: 'POLAR_CHECKOUT', event: 'loaded' |
// 'confirmed' | 'success' | 'close', successURL?, redirect? } — plus the mock's
// source tag, to the embed_origin it is given, as Polar's page does.

const SOURCE = 'sharecam-mock-paddle';
const POLAR_SOURCE = 'sharecam-mock-polar';
const POLAR_TYPE = 'POLAR_CHECKOUT';

export function mockCheckout(origin: string): CheckoutDriver {
  let teardown: (() => void) | null = null;

  return {
    configured: () => true,
    configuredFor: () => true,
    resumePaymentLink: () => {
      /* Paddle payment links do not exist on the local stack */
    },
    async open(transactionId, env, onEvent: (e: CheckoutEvent) => void) {
      teardown?.();

      const scrim = document.createElement('div');
      scrim.setAttribute('data-mock-checkout', '');
      Object.assign(scrim.style, {
        position: 'fixed', inset: '0', zIndex: '1000', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', background: 'rgba(20,43,32,.5)',
      });
      const frame = document.createElement('iframe');
      frame.title = 'Local test checkout';
      frame.src = `${origin}/checkout/${encodeURIComponent(transactionId)}?env=${encodeURIComponent(env)}`;
      Object.assign(frame.style, {
        width: 'min(480px, 100%)', height: 'min(640px, 100%)', border: '0', borderRadius: '16px', background: '#FBF8F0',
      });
      scrim.appendChild(frame);

      const onMessage = (m: MessageEvent) => {
        if (m.origin !== origin || m.source !== frame.contentWindow) return;
        const data = m.data as { source?: string; name?: string } | null;
        if (!data || data.source !== SOURCE || typeof data.name !== 'string') return;
        const ev = checkoutEventFrom(data.name);
        if (!ev) return;
        teardown?.();
        onEvent(ev);
      };
      window.addEventListener('message', onMessage);
      teardown = () => {
        window.removeEventListener('message', onMessage);
        scrim.remove();
        teardown = null;
      };
      document.body.appendChild(scrim);
    },
  };
}

const loopback = (u: URL) => u.protocol === 'http:' && (u.hostname === '127.0.0.1' || u.hostname === 'localhost');

/** PolarEmbedCheckout's behaviour, for a loopback page: the same query parameters
 *  (embed, embed_origin, theme), a cancelable event per message, and the embed's
 *  default actions when a listener does not prevent them (close unless confirmed;
 *  success → redirect to successURL when asked) — so a driver that forgot
 *  preventDefault() shows here too. */
const mockPolarEmbed: EmbedFactory = {
  create(url, options) {
    const u = new URL(url);
    u.searchParams.set('embed', 'true');
    u.searchParams.set('embed_origin', window.location.origin);
    if (options?.theme) u.searchParams.set('theme', options.theme);

    const scrim = document.createElement('div');
    scrim.setAttribute('data-mock-polar', '');
    Object.assign(scrim.style, {
      position: 'fixed', inset: '0', zIndex: '1000', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', background: 'rgba(20,43,32,.5)',
    });
    const frame = document.createElement('iframe');
    frame.title = 'Local test checkout (Polar)';
    frame.src = u.toString();
    Object.assign(frame.style, {
      width: 'min(480px, 100%)', height: 'min(640px, 100%)', border: '0', borderRadius: '16px', background: '#FBF8F0',
    });
    scrim.appendChild(frame);

    const target = new EventTarget();
    let closable = true;
    let loaded = false;
    const instance: EmbedInstance = {
      addEventListener: (type, listener) => target.addEventListener(type, listener),
      close: () => {
        window.removeEventListener('message', onMessage);
        scrim.remove();
      },
    };
    let resolveLoaded: (e: EmbedInstance) => void = () => undefined;
    const onMessage = (m: MessageEvent) => {
      if (m.origin !== u.origin || m.source !== frame.contentWindow) return;
      const d = m.data as { type?: string; source?: string; event?: string; successURL?: string; redirect?: boolean } | null;
      if (!d || d.type !== POLAR_TYPE || d.source !== POLAR_SOURCE || typeof d.event !== 'string') return;
      const ev = new CustomEvent(d.event, { detail: d, cancelable: true });
      target.dispatchEvent(ev);
      if (d.event === 'loaded' && !loaded) {
        loaded = true;
        resolveLoaded(instance);
      }
      if (ev.defaultPrevented) return;
      if (d.event === 'confirmed') closable = false;
      else if (d.event === 'close' && closable) instance.close();
      else if (d.event === 'success') {
        closable = true;
        if (d.redirect && typeof d.successURL === 'string') window.location.href = d.successURL;
      }
    };
    window.addEventListener('message', onMessage);
    document.body.appendChild(scrim);
    return new Promise<EmbedInstance>((resolve) => {
      resolveLoaded = resolve;
    });
  },
};

export function mockPolarCheckout(): WebCheckoutDriver {
  return polarCheckout({
    load: async () => mockPolarEmbed,
    urlOk: loopback,
    sweep: () => document.querySelectorAll('[data-mock-polar]').forEach((n) => n.remove()),
    redirect: (url) => window.location.assign(url),
  });
}
