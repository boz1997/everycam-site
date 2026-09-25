import { paddleJsCheckout } from './paddleJs';
import { polarEmbedCheckout } from './polarEmbed';
import { fromPaddleDriver, type WebCheckoutDriver, type WebProvider } from './types';

// The checkout drivers this bundle carries: Paddle.js and Polar's embedded checkout.
// Imported by the dashboard only (never by the guest, uploader or album pages). The
// driver is chosen at RUN time from the provider the server names (preview and
// start reply, config/web.provider; POLAR-PLAN P1), so one build sells through
// either provider. Neither loads anything before it is needed: Paddle.js is a
// <script> added when a checkout opens or a payment link resumes, the Polar embed a
// dynamic import when a checkout opens. On the local stack's dev server
// vite.config.ts resolves THIS module to ./localCheckout.ts (the mocks).

/** Paddle.js itself: its payment links (?_ptxn=, D13) resume through it (App.tsx). */
export const paddleDriver = paddleJsCheckout;

const DRIVERS: Record<WebProvider, WebCheckoutDriver> = {
  paddle: fromPaddleDriver(paddleJsCheckout),
  polar: polarEmbedCheckout,
};
export const driverFor = (provider: WebProvider): WebCheckoutDriver => DRIVERS[provider];
