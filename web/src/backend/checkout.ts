// The checkout driver this bundle uses: Paddle.js. Imported by the dashboard only
// (never by the guest, uploader or album pages). On the local stack's dev server
// vite.config.ts resolves THIS module to ./localCheckout.ts (the mock checkout).
export { paddleJsCheckout as checkoutDriver } from './paddleJs';
