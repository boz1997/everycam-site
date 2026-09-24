import { checkoutEventFrom, type CheckoutDriver, type CheckoutEvent } from './types';

// Local stack only (imported by localCheckout.ts): stands in for the Paddle
// overlay. The mock Paddle (EC/local/mockPaddle.mjs) serves a checkout page for
// the transaction webCheckoutStart opened on it; that page talks back with
// postMessage in Paddle's event names. Messages are accepted only from the
// mock's origin AND from this iframe's window AND with the mock's source tag.

const SOURCE = 'sharecam-mock-paddle';

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
