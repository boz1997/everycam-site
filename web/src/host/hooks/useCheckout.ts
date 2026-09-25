import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import type { HostEvent } from '../lib/types';
import {
  DECL_TEXT_VERSION, driverFor, forgetPayment, orderStatus, pendingPayment, preview, rememberPayment, startCheckout,
  type CheckoutEvent, type Preview, type WebProvider,
} from '../lib/checkout';
import { callableError, fn } from '../lib/data';
import { logError } from '../lib/errorLog';
import { isLinked } from '../lib/auth';
import { rankOf, type PlanId } from '../lib/plans';
import { getLang } from '../i18n';

// The package page's state machine (plan §3.4; from AllShots useUpgrade.ts).
// The plan lands on the event document, never in a callback — the webhook is its
// only writer — so "applied" is read from the document the page already follows:
// PLAN_RANK[planId] ≥ target and planPurchasedAt moved = done; a plan ABOVE the
// target (bought in the app meanwhile) = covered.
//
//   loading → link-account | region-blocked | coming-soon | maxed | unavailable | pick
//   pick → (declaration, pro without the server's declaration doc) → opening → paying
//   paying → applying (completed) | pick (closed) | failed (checkout.error)
//   applying → done | covered | slow (> 90 s: poll the order) → done | covered | failed
//   loading → covered | failed (an order whose end the page already knows: Polar's hosted return)
//
// The provider (Paddle or Polar) is the server's: the preview names it, the
// start reply opens it (driverFor), and applying/slow/done carry it for the
// receipt line. Polar's embed also says `ready` / `locked`: nothing to change
// here (open() resolves once it is up; a locked checkout is Polar's to hold).

const APPLY_WAIT_MS = 90_000;
const POLL_MS = 8_000;
export const FAILED_STATUSES = new Set(['declaration-missing', 'cross-tier', 'mismatch', 'discounted', 'refunded-before-apply', 'orphan', 'unknown', 'env-mismatch']);

export type SoonWhy = 'off' | 'sandbox-only' | 'no-prices' | 'no-key' | 'no-token';
export type Phase =
  | { at: 'loading' }
  | { at: 'error' }
  | { at: 'unavailable'; why: string }
  | { at: 'link-account'; pv: Preview }
  | { at: 'region-blocked'; pv: Preview; reason: string }
  | { at: 'coming-soon'; pv: Preview; why: SoonWhy }
  | { at: 'maxed'; pv: Preview }
  | { at: 'pick'; pv: Preview; abandoned?: boolean }
  | { at: 'declaration'; pv: Preview; plan: PlanId; error?: string }
  | { at: 'opening' | 'paying'; pv: Preview; plan: PlanId }
  | { at: 'applying' | 'slow'; plan: PlanId; txn: string | null; provider: WebProvider }
  | { at: 'done'; plan: PlanId; provider: WebProvider }
  | { at: 'covered'; plan: string }
  | { at: 'failed'; plan: PlanId; why: string; pv?: Preview };

export function useCheckout(event: HostEvent, user: User, opts: { autoPlan?: PlanId; fresh?: boolean }) {
  const [phase, setPhase] = useState<Phase>({ at: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const timer = useRef<number | null>(null);
  const autoUsed = useRef(false);
  const linked = isLinked(user);
  const eventRef = useRef(event);
  eventRef.current = event;

  const clearTimer = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };
  const slowAfter = (plan: PlanId, txn: string | null, provider: WebProvider, ms: number) => {
    clearTimer();
    timer.current = window.setTimeout(() => setPhase((p) => (p.at === 'applying' ? { at: 'slow', plan, txn, provider } : p)), Math.max(0, ms));
  };

  // 1. Ask the server what may be offered — unless this browser is waiting for a payment it made.
  useEffect(() => {
    const waiting = pendingPayment(event.id);
    // Its end already known (App.tsx, Polar's hosted return): said before the rank
    // check — a duplicate is exactly an event that already has this plan or more.
    // Forgotten by effect 4 once shown, not here: StrictMode's second run must see it too.
    const outcome = waiting?.outcome;
    if (waiting && outcome && (outcome === 'duplicate' || FAILED_STATUSES.has(outcome))) {
      setPhase(outcome === 'duplicate' ? { at: 'covered', plan: event.planId } : { at: 'failed', plan: waiting.plan, why: outcome });
      return;
    }
    if (waiting && rankOf(event.refunded ? 'spark' : event.planId) < rankOf(waiting.plan)) {
      const age = Date.now() - waiting.at;
      setPhase({ at: age < APPLY_WAIT_MS ? 'applying' : 'slow', plan: waiting.plan, txn: waiting.txn, provider: waiting.provider });
      if (age < APPLY_WAIT_MS) slowAfter(waiting.plan, waiting.txn, waiting.provider, APPLY_WAIT_MS - age);
      return;
    }
    if (waiting) forgetPayment(event.id);
    let alive = true;
    setPhase({ at: 'loading' });
    void (async () => {
      try {
        const pv = await preview({ eventId: event.id });
        if (!alive) return;
        if (pv.reason === 'link-account') return setPhase({ at: 'link-account', pv });
        if (pv.reason === 'not-found' || pv.reason === 'not-host' || pv.reason === 'code-not-pro') return setPhase({ at: 'unavailable', why: pv.reason });
        if (pv.reason === 'maxed') return setPhase({ at: 'maxed', pv });
        if (pv.reason) return setPhase({ at: 'coming-soon', pv, why: pv.reason as SoonWhy });
        // No client-side token for this environment: Paddle only (Polar needs none).
        if (!driverFor(pv.provider).configuredFor(pv.env)) return setPhase({ at: 'coming-soon', pv, why: 'no-token' });
        if (pv.tier === 'pro') {
          // Region gate for face matching (included in every photographer package),
          // after sign-in and before a pro checkout — like the app's paywall.
          const r = await fn.faceGateCheck({}).then((x) => x.data).catch(() => ({ allowed: false, reason: 'error' }));
          if (!alive) return;
          if (!r.allowed) return setPhase({ at: 'region-blocked', pv, reason: String(r.reason ?? '') });
        }
        setPhase({ at: 'pick', pv });
      } catch (e) {
        void logError('host_checkout_preview', e, { eventId: event.id });
        if (alive) setPhase({ at: 'error' });
      }
    })();
    return () => {
      alive = false;
    };
    // event.planId is read once per ask on purpose: the effect below follows it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id, linked, attempt]);

  // 2. The document decides when a paid plan has arrived.
  useEffect(() => {
    if (phase.at !== 'applying' && phase.at !== 'slow') return;
    const want = rankOf(phase.plan);
    const have = rankOf(event.refunded ? 'spark' : event.planId);
    const p = pendingPayment(event.id);
    const moved = !p || p.purchasedAt === null || (event.planPurchasedAt ?? 0) !== p.purchasedAt;
    if (have === want && moved) {
      clearTimer();
      forgetPayment(event.id);
      setPhase({ at: 'done', plan: phase.plan, provider: phase.provider });
    } else if (have > want) {
      clearTimer();
      forgetPayment(event.id);
      setPhase({ at: 'covered', plan: event.planId });
    }
  }, [event.planId, event.refunded, event.planPurchasedAt, event.id, phase]);

  // 3. Slow: ask the server about the order (the dashboard cannot read webOrders).
  useEffect(() => {
    if (phase.at !== 'slow' || !phase.txn) return;
    let alive = true;
    const txn = phase.txn;
    const plan = phase.plan;
    const tick = async () => {
      try {
        const s = await orderStatus(txn);
        if (!alive) return;
        if (s.status === 'duplicate') {
          forgetPayment(event.id);
          setPhase({ at: 'covered', plan: eventRef.current.planId });
        } else if (FAILED_STATUSES.has(s.status)) {
          forgetPayment(event.id);
          setPhase({ at: 'failed', plan, why: s.status });
        }
      } catch {
        /* keep waiting */
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [phase, event.id]);

  // 4. A known end, once said, is not said again (a reload or "back" asks afresh).
  useEffect(() => {
    if (phase.at !== 'covered' && phase.at !== 'failed') return;
    if (pendingPayment(event.id)?.outcome) forgetPayment(event.id);
  }, [phase, event.id]);

  useEffect(() => clearTimer, []);

  const open = useCallback(
    async (pv: Preview, plan: PlanId) => {
      setPhase({ at: 'opening', pv, plan });
      const purchasedAt = eventRef.current.planPurchasedAt ?? null;
      let txn: string | null = null;
      let provider: WebProvider = pv.provider;
      const onEvent = (e: CheckoutEvent) => {
        if (e === 'completed') {
          rememberPayment({ eventId: event.id, plan, txn, at: Date.now(), purchasedAt, provider });
          setPhase({ at: 'applying', plan, txn, provider });
          slowAfter(plan, txn, provider, APPLY_WAIT_MS);
        } else if (e === 'closed') {
          setPhase((p) => (p.at === 'paying' || p.at === 'opening' ? { at: 'pick', pv, abandoned: true } : p));
        } else if (e === 'error') {
          setPhase((p) => (p.at === 'paying' || p.at === 'opening' ? { at: 'failed', plan, why: 'checkout-error', pv } : p));
        }
      };
      try {
        const session = await startCheckout(event.id, plan);
        txn = session.orderId;
        provider = session.provider;
        await driverFor(session.provider).open(session, onEvent, { email: user.email, locale: getLang() });
        setPhase((p) => (p.at === 'opening' ? { at: 'paying', pv, plan } : p));
      } catch (e) {
        const { code, message } = callableError(e);
        if (code === 'permission-denied' && /link-account/.test(message)) return setPhase({ at: 'link-account', pv });
        if (code === 'failed-precondition' && /host-declaration-required/.test(message)) return setPhase({ at: 'declaration', pv, plan });
        if (code === 'failed-precondition' && /payment-pending/.test(message)) {
          rememberPayment({ eventId: event.id, plan, txn: null, at: Date.now() - APPLY_WAIT_MS, purchasedAt, provider });
          return setPhase({ at: 'slow', plan, txn: null, provider });
        }
        if (code === 'failed-precondition' || code === 'resource-exhausted') {
          // Closed since the page asked (kill switch, price removed, not an upgrade any
          // more, the 20-a-day brake): ask again and show why.
          if (code === 'resource-exhausted') return setPhase({ at: 'failed', plan, why: 'too-many-orders', pv });
          setAttempt((n) => n + 1);
          return;
        }
        void logError('host_checkout_start', e, { eventId: event.id, plan });
        setPhase({ at: 'failed', plan, why: code || 'checkout-unavailable', pv });
      }
    },
    [event.id, user.email],
  );

  const buy = useCallback(
    (plan: PlanId) => {
      if (phase.at !== 'pick') return;
      if (phase.pv.tier === 'pro' && phase.pv.needsDeclaration) return setPhase({ at: 'declaration', pv: phase.pv, plan });
      void open(phase.pv, plan);
    },
    [phase, open],
  );

  /** The host declaration (face matching is part of every photographer package):
   *  recorded by the SERVER before the payment (redeem/apply require the doc). */
  const declare = useCallback(async () => {
    if (phase.at !== 'declaration') return;
    const { pv, plan } = phase;
    try {
      await fn.faceHostDeclare({ eventId: event.id, accepted: true, declTextVersion: DECL_TEXT_VERSION, lang: getLang() });
      void open({ ...pv, needsDeclaration: false }, plan);
    } catch (e) {
      const { code, message } = callableError(e);
      if (code === 'permission-denied' && message !== 'not-host') return setPhase({ at: 'region-blocked', pv, reason: message });
      void logError('host_declare', e, { eventId: event.id });
      setPhase({ at: 'declaration', pv, plan, error: 'declare-failed' });
    }
  }, [phase, event.id, open]);

  // Straight from create (#/e/:id/plan?plan=X&new=1): start the pick automatically once.
  useEffect(() => {
    if (!opts.autoPlan || autoUsed.current || phase.at !== 'pick') return;
    if (!phase.pv.options.some((o) => o.planId === opts.autoPlan && o.available)) return;
    autoUsed.current = true;
    buy(opts.autoPlan);
  }, [phase, opts.autoPlan, buy]);

  const back = useCallback(() => {
    if ((phase.at === 'declaration' || phase.at === 'failed') && phase.pv) setPhase({ at: 'pick', pv: phase.pv });
    else setAttempt((n) => n + 1);
  }, [phase]);

  return { phase, buy, declare, back, retry: () => setAttempt((n) => n + 1) };
}
