// Package facts the dashboard DISPLAYS. What may be SOLD, at which price and with
// which frozen limits, always comes from the server (webCheckoutStart preview:
// USD_LIST + limitsSnapshot + config/web.catalog) — this file keeps no price table.
//
// Mirror of firestore.rules planTable() + functions/src/plans.ts PLAN_LIMITS /
// PLAN_RANK (EC, 21 Sep 2026). Used for: names, ladder rank and tier, the caps of
// events WITHOUT frozen limits (like the rules: `event.limits` first), flags
// (face matching included, host-only uploads, live wall) and the deletion date
// (retentionExpiryAt). Plan names are brand names: never translated.
import type { HostEvent } from './types';

export type PlanId =
  | 'spark' | 'mini' | 'party' | 'wedding' | 'unlimited'
  | 'pro500' | 'pro1000' | 'pro2000' | 'pro5000' | 'proUnlimited';
export type Tier = 'consumer' | 'pro';

interface PlanRow {
  name: string;
  tier: Tier;
  rank: number;
  photos: number; // -1 = unlimited
  videos: number;
  guests: number;
  retentionDays: number;
  ai: boolean;
  hostOnly: boolean;
  wall: boolean;
}

export const PLANS: Record<PlanId, PlanRow> = {
  spark: { name: 'Spark', tier: 'consumer', rank: 0, photos: 50, videos: 0, guests: 10, retentionDays: 7, ai: false, hostOnly: false, wall: false },
  mini: { name: 'Mini', tier: 'consumer', rank: 1, photos: 200, videos: 0, guests: 25, retentionDays: 30, ai: false, hostOnly: false, wall: false },
  party: { name: 'Party', tier: 'consumer', rank: 2, photos: 200, videos: 5, guests: 50, retentionDays: 30, ai: false, hostOnly: false, wall: false },
  wedding: { name: 'Wedding', tier: 'consumer', rank: 3, photos: 500, videos: 20, guests: 100, retentionDays: 180, ai: false, hostOnly: false, wall: false },
  unlimited: { name: 'Unlimited', tier: 'consumer', rank: 4, photos: -1, videos: -1, guests: -1, retentionDays: 365, ai: false, hostOnly: false, wall: true },
  pro500: { name: 'Pro 500', tier: 'pro', rank: 11, photos: 500, videos: 0, guests: -1, retentionDays: 30, ai: true, hostOnly: true, wall: false },
  pro1000: { name: 'Pro 1000', tier: 'pro', rank: 12, photos: 1000, videos: 0, guests: -1, retentionDays: 90, ai: true, hostOnly: true, wall: true },
  pro2000: { name: 'Pro 2000', tier: 'pro', rank: 13, photos: 2000, videos: 0, guests: -1, retentionDays: 180, ai: true, hostOnly: true, wall: true },
  pro5000: { name: 'Pro 5000', tier: 'pro', rank: 14, photos: 5000, videos: 50, guests: -1, retentionDays: 365, ai: true, hostOnly: true, wall: true },
  proUnlimited: { name: 'Pro Unlimited', tier: 'pro', rank: 15, photos: -1, videos: -1, guests: -1, retentionDays: 365, ai: true, hostOnly: true, wall: true },
};

/** The packages the web sells, per ladder, ascending (no Mini, no add-on: D4). */
export const WEB_LADDER: Record<Tier, PlanId[]> = {
  consumer: ['party', 'wedding', 'unlimited'],
  pro: ['pro500', 'pro1000', 'pro2000', 'pro5000', 'proUnlimited'],
};
/** The app highlights these two (plans.ts `highlight`); the web shows the same badge, nothing else. */
export const HIGHLIGHT: ReadonlySet<PlanId> = new Set<PlanId>(['wedding', 'pro5000']);

export const isPlanId = (v: unknown): v is PlanId => typeof v === 'string' && v in PLANS;
export const plan = (id: string): PlanRow => (isPlanId(id) ? PLANS[id] : PLANS.spark);
export const planName = (id: string): string => (isPlanId(id) ? PLANS[id].name : id);
export const rankOf = (id: string): number => (isPlanId(id) ? PLANS[id].rank : 0);

/** The app sells photographer packages (go-live G, or the D26 fallback): a build
 *  flag, like VITE_APPLE_WEB, so the "photographer packages come …" wording flips
 *  in the same push. Until then the web says they come with the next app update. */
export const PRO_IN_APP = import.meta.env.VITE_PRO_IN_APP === '1';

/** The ladder anchor (D28): the plan before a refund, else the plan. */
export const anchorOf = (e: Pick<HostEvent, 'planId' | 'planBeforeRefund'>): string => e.planBeforeRefund ?? e.planId;

/**
 * Which ladder an event is on (D28, same rule as functions/src/paddle.ts
 * eventLadder): the anchor plan's tier when the anchor is not Spark; a Spark event
 * whose uploads are host-only or whose code starts with P is a photographer event;
 * everything else is consumer. Never the code alone for a paid event: `PWHYRU`
 * (Mini) and `PUG4C4` (Unlimited) are consumer events with P codes.
 */
export function tierOf(e: Pick<HostEvent, 'planId' | 'planBeforeRefund' | 'uploadPolicy' | 'code'>): Tier {
  const anchor = anchorOf(e);
  if (anchor !== 'spark' && isPlanId(anchor)) return PLANS[anchor].tier;
  if (e.uploadPolicy === 'host') return 'pro';
  return e.code.startsWith('P') ? 'pro' : 'consumer';
}

/** A web pro-intent event that has no package yet: Spark, P code, never paid. */
export const awaitingProPackage = (e: HostEvent): boolean =>
  e.planId === 'spark' && !e.planBeforeRefund && tierOf(e) === 'pro';

/** The plan that counts for the ladder (a refunded event counts as Spark, like redeem). */
export const currentOf = (e: Pick<HostEvent, 'planId' | 'refunded'>): string => (e.refunded ? 'spark' : e.planId);

/** Anything above the current plan on this event's ladder that the web sells. */
export function hasUpgrade(e: HostEvent): boolean {
  const cur = rankOf(currentOf(e));
  return WEB_LADDER[tierOf(e)].some((p) => PLANS[p].rank > cur);
}

/** Caps like firestore.rules planLimits(): frozen `event.limits` first, else the table. -1 = unlimited. */
export function capsOf(e: HostEvent): { photos: number; videos: number; guests: number; retentionDays: number } {
  const row = plan(e.planId);
  const l = e.limits;
  return {
    photos: typeof l?.photos === 'number' ? l.photos : row.photos,
    videos: typeof l?.videos === 'number' ? l.videos : row.videos,
    guests: typeof l?.guests === 'number' ? l.guests : row.guests,
    retentionDays: typeof l?.retentionDays === 'number' && l.retentionDays > 0 ? l.retentionDays : row.retentionDays,
  };
}

/** Flags are never frozen (the rules read planTable for them). */
export const flagsOf = (e: HostEvent) => {
  const row = plan(e.planId);
  return { ai: row.ai, hostOnly: (e.uploadPolicy ?? (row.hostOnly ? 'host' : 'all')) === 'host', wall: row.wall };
};

/** Face matching can be switched on (rules: bought as an add-on, or included in the plan). */
export const aiAvailable = (e: HostEvent): boolean => e.aiPeoplePurchased || plan(e.planId).ai;

/** 'YYYY-MM-DD' → the END of that day (UTC), like functions/src/plans.ts parseEventDay. */
function eventDayEnd(date: string | null): number | null {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const ms = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(ms) ? ms + 86_400_000 : null;
}

/**
 * The deletion date (D19): the list's column, the package card, the downloads tab
 * and the 14 / 5 / 2-day banners — functions/src/plans.ts
 * retentionExpiryAt with the same inputs the purge uses (cleanup.ts): plan,
 * createdAt, event day, refund anchor, frozen retentionDays. The purge adds a
 * 7-day grace on top; the dashboard shows the earlier date on purpose.
 */
export function deletionAt(e: HostEvent): number | null {
  if (!e.createdAt) return null;
  const days = capsOf(e).retentionDays;
  const anchor = Math.max(e.createdAt, eventDayEnd(e.date) ?? 0, Number(e.retentionAnchorAt) || 0);
  return anchor + days * 86_400_000;
}
