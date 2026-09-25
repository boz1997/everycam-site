import { mockCheckout, mockPolarCheckout } from './mockCheckout';
import { fromPaddleDriver, type WebCheckoutDriver, type WebProvider } from './types';

// LOCAL STACK ONLY: vite.config.ts resolves backend/checkout.ts here for the dev
// server in `--mode localstack` (and refuses to build in that mode). Same guards
// as local.ts; scripts/check-dist.mjs fails a build that contains either. Same
// exports as checkout.ts: the mock Paddle stands in for Paddle.js, the mock Polar
// page for Polar's embedded checkout (both served by EC/local).
const env = import.meta.env;
if (!env.DEV || env.VITE_LOCAL_STACK !== '1') {
  throw new Error('local checkout loaded outside the local stack');
}
if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) {
  throw new Error('local checkout served from a non-loopback host');
}
const mockPort = Number(env.VITE_LOCAL_MOCK_PORT);
if (!Number.isInteger(mockPort) || mockPort <= 0) throw new Error('VITE_LOCAL_MOCK_PORT missing from .env.localstack');

export const paddleDriver = mockCheckout(`http://127.0.0.1:${mockPort}`);

const DRIVERS: Record<WebProvider, WebCheckoutDriver> = {
  paddle: fromPaddleDriver(paddleDriver),
  polar: mockPolarCheckout(),
};
export const driverFor = (provider: WebProvider): WebCheckoutDriver => DRIVERS[provider];
