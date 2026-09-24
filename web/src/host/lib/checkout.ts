import { checkoutDriver } from '../../backend/checkout';
import type { CheckoutEvent, PaddleEnv } from '../../backend/types';
import { fn } from './data';
import type { PlanId, Tier } from './plans';

// The web checkout, the part that is the same everywhere (plan §2.2, §3.4): the
// SERVER decides what may be sold and opens the transaction (webCheckoutStart
// reads the event document and config/web, records the order, sets checkout.url);
// the browser only hands the transaction id to the checkout driver — Paddle.js in
// production (backend/paddleJs.ts), the mock checkout on the local stack.
export { checkoutDriver };
export type { CheckoutEvent, PaddleEnv };

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
  env: PaddleEnv;
  tier: Tier;
  current: string;
  catalog: number;
  refunded: boolean;
  options: PreviewOption[];
  needsDeclaration: boolean;
}

/** Read-only, no Paddle call; works signed out (prices before sign-in). */
export async function preview(args: { eventId?: string; tier?: Tier }): Promise<Preview> {
  const { data } = await fn.webCheckoutStart({ preview: true, ...args });
  return data as Preview;
}

export async function startCheckout(eventId: string, planId: PlanId): Promise<{ transactionId: string; env: PaddleEnv; reused?: boolean }> {
  const { data } = await fn.webCheckoutStart({ eventId, planId });
  return data as { transactionId: string; env: PaddleEnv; reused?: boolean };
}

/** Order status for the caller's own order (the dashboard cannot read webOrders). */
export async function orderStatus(txn: string): Promise<{ status: string; planId: string | null; eventId: string | null }> {
  const { data } = await fn.webCheckoutStart({ status: txn });
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

/** The face-matching text version shown in the declaration step (the app's
 *  DECL_TEXT_VERSION, EC/src/services/index.ts:128; the server keeps the set). */
export const DECL_TEXT_VERSION = '2026-09-23';

// ---- a payment on its way, remembered across reloads and tabs
// Paddle's "completed" reaches only the tab that paid, and the plan reaches the
// event document only when the webhook lands. Until then a reload must not look
// like "nothing bought yet". Per browser, best effort; the server refuses a
// second checkout anyway (payment-pending).
const PENDING_KEY = 'sharecam.host.pendingPayment';
const PENDING_TTL_MS = 30 * 60_000;
export interface PendingPayment { eventId: string; plan: PlanId; txn: string | null; at: number; purchasedAt: number | null }

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
    return { eventId: p.eventId, plan: p.plan as PlanId, txn: typeof p.txn === 'string' ? p.txn : null, at: p.at, purchasedAt: typeof p.purchasedAt === 'number' ? p.purchasedAt : null };
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
