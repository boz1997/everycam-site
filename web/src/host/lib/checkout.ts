import { driverFor, paddleDriver } from '../../backend/checkout';
import type { CheckoutEvent, CheckoutSession, WebEnv, WebProvider } from '../../backend/types';
import { fn } from './data';
import type { PlanId, Tier } from './plans';

// The web checkout, the part that is the same everywhere (plan §2.2, §3.4): the
// SERVER decides what may be sold, through which provider (config/web.provider,
// POLAR-PLAN P1) and opens the checkout (webCheckoutStart reads the event document
// and config/web, records the order); the browser only hands what the server
// opened to that provider's driver — Paddle.js (backend/paddleJs.ts) or Polar's
// embedded checkout (backend/polarEmbed.ts) in production, the mocks on the local
// stack.
export { driverFor, paddleDriver };
export type { CheckoutEvent, CheckoutSession, WebEnv, WebProvider };

export type PreviewReason =
  | 'link-account' | 'not-found' | 'not-host' | 'code-not-pro' | 'maxed' | 'off' | 'sandbox-only' | 'no-prices' | 'no-key';

export interface PreviewOption {
  planId: PlanId;
  productId: string;
  usd: number;
  cents: number;
  /** Frozen at purchase (config/web.catalog). -1 = unlimited. */
  limits: { photos: number; videos: number; guests: number; retentionDays: number };
  flags: { ai: boolean; wall: boolean; hostOnly: boolean };
  available: boolean;
}

/** functions/src/webPurchase.ts previewCheckout — server truth. */
export interface Preview {
  open: boolean;
  reason: PreviewReason | null;
  /** Who sells new checkouts (config/web.provider). A server that does not say is Paddle. */
  provider: WebProvider;
  env: WebEnv;
  tier: Tier;
  current: string;
  catalog: number;
  refunded: boolean;
  options: PreviewOption[];
  needsDeclaration: boolean;
}

const providerOf = (v: unknown): WebProvider => (v === 'polar' ? 'polar' : 'paddle');

/** Read-only, no provider call; works signed out (prices before sign-in). */
export async function preview(args: { eventId?: string; tier?: Tier }): Promise<Preview> {
  const { data } = await fn.webCheckoutStart({ preview: true, ...args });
  const pv = data as Omit<Preview, 'provider'> & { provider?: unknown };
  return { ...pv, provider: providerOf(pv.provider) };
}

/** Opens the checkout on the server. Paddle replies `{ transactionId, env, reused }`
 *  (unchanged), Polar `{ provider: 'polar', env, orderId: 'po_<checkout uuid>', url,
 *  reused }` (POLAR-PLAN §3.1); both become one CheckoutSession. */
export async function startCheckout(eventId: string, planId: PlanId): Promise<CheckoutSession & { reused?: boolean }> {
  const { data } = await fn.webCheckoutStart({ eventId, planId });
  const d = (data ?? {}) as { provider?: unknown; env?: unknown; orderId?: unknown; transactionId?: unknown; url?: unknown; reused?: unknown };
  const provider = providerOf(d.provider);
  const orderId = typeof d.orderId === 'string' ? d.orderId : typeof d.transactionId === 'string' ? d.transactionId : '';
  const env: WebEnv = d.env === 'live' ? 'live' : 'sandbox';
  if (!orderId || (provider === 'polar' && (!/^po_[0-9a-f-]{36}$/.test(orderId) || typeof d.url !== 'string'))) throw new Error('checkout-unavailable');
  return { provider, env, orderId, ...(typeof d.url === 'string' ? { url: d.url } : {}), reused: d.reused === true };
}

/** Order status for the caller's own order (the dashboard cannot read webOrders):
 *  Paddle `txn_…` or Polar `po_<checkout uuid>`. */
export async function orderStatus(orderId: string): Promise<{ status: string; planId: string | null; eventId: string | null }> {
  const { data } = await fn.webCheckoutStart({ status: orderId });
  return data as { status: string; planId: string | null; eventId: string | null };
}

/** A Paddle payment link's transaction (`?_ptxn=txn_…`, D13), or null. */
export function paymentLinkTxn(): string | null {
  try {
    const txn = new URL(window.location.href).searchParams.get('_ptxn');
    return txn && /^txn_[a-z0-9]+$/i.test(txn) ? txn : null;
  } catch {
    return null;
  }
}
/** Forget a payment link that isn't the signed-in host's: nothing opens, and a
 *  reload doesn't try again. */
export function dropPaymentLink(): void {
  try {
    const u = new URL(window.location.href);
    if (!u.searchParams.has('_ptxn')) return;
    u.searchParams.delete('_ptxn');
    window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash);
  } catch {
    /* nothing to drop */
  }
}

/** Polar's return after a hosted checkout (the embed's fallback, POLAR-PLAN P3):
 *  success_url is …/join/host/?checkout_id={CHECKOUT_ID}, which Polar fills with
 *  the checkout's uuid. Its order is `po_<uuid>`; null when there is none. */
export function polarReturnOrder(): string | null {
  try {
    const id = new URL(window.location.href).searchParams.get('checkout_id');
    return id && /^[0-9a-f-]{36}$/i.test(id) ? `po_${id.toLowerCase()}` : null;
  } catch {
    return null;
  }
}
/** Drop ?checkout_id= once read: a reload does not ask again. */
export function dropPolarReturn(): void {
  try {
    const u = new URL(window.location.href);
    if (!u.searchParams.has('checkout_id')) return;
    u.searchParams.delete('checkout_id');
    window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash);
  } catch {
    /* nothing to drop */
  }
}

/** The face-matching text version shown in the declaration step (the app's
 *  DECL_TEXT_VERSION, EC/src/services/index.ts:128; the server keeps the set). */
export const DECL_TEXT_VERSION = '2026-09-23';

// ---- a payment on its way, remembered across reloads and tabs
// The checkout's "completed" reaches only the tab that paid, and the plan reaches
// the event document only when the webhook lands. Until then a reload must not
// look like "nothing bought yet". Per browser, best effort; the server refuses a
// second checkout anyway (payment-pending). `provider` picks the receipt line
// ("Polar sends the receipt …"); an entry written before it existed is Paddle's.
// `outcome` is an order's end already known when the entry is written (Polar's
// hosted return, App.tsx: 'duplicate' or a refusal): the package page says it at
// once, whatever plan the event has by then.
const PENDING_KEY = 'sharecam.host.pendingPayment';
const PENDING_TTL_MS = 30 * 60_000;
export interface PendingPayment { eventId: string; plan: PlanId; txn: string | null; at: number; purchasedAt: number | null; provider: WebProvider; outcome?: string }

export function rememberPayment(p: PendingPayment): void {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(p));
  } catch {
    /* storage blocked */
  }
}
export function pendingPayment(eventId: string, now = Date.now()): PendingPayment | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<PendingPayment>;
    if (p.eventId !== eventId || typeof p.plan !== 'string' || typeof p.at !== 'number') return null;
    if (now - p.at > PENDING_TTL_MS || p.at > now + 60_000) return null;
    return {
      eventId: p.eventId, plan: p.plan as PlanId, txn: typeof p.txn === 'string' ? p.txn : null, at: p.at, purchasedAt: typeof p.purchasedAt === 'number' ? p.purchasedAt : null, provider: providerOf(p.provider),
      ...(typeof p.outcome === 'string' ? { outcome: p.outcome } : {}),
    };
  } catch {
    return null;
  }
}
export function forgetPayment(eventId: string): void {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (raw && (JSON.parse(raw) as Partial<PendingPayment>).eventId === eventId) localStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage blocked */
  }
}
