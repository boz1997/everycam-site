import type { PreviewOption } from '../lib/checkout';
import { HIGHLIGHT, PLANS, planName, type PlanId } from '../lib/plans';
import { backend } from '../../backend/active';
import { fmtNumber, fmtUsd, t } from '../i18n';

// Package tiles in the site's pricing look (SITE assets/home.css .tier): name,
// price in heavy Fraunces, the limits as hairline rows. Limits and prices are
// the SERVER's (preview: USD_LIST + limitsSnapshot for config/web.catalog), so
// the web shows exactly what it will sell. The app highlights Wedding and
// Pro 5000; the web shows that badge and nothing else ("no Most popular unless
// the app shows it", plan §3.4). Selected = the site's dark top-tier tile.

export function storageLabel(days: number): string {
  if (days < 30) return t('unit.days', { n: days });
  if (days < 360) {
    const m = Math.round(days / 30);
    return m === 1 ? t('unit.month') : t('unit.months', { n: m });
  }
  const y = Math.round(days / 365);
  return y === 1 ? t('unit.year') : t('unit.years', { n: y });
}
// 0 = not in this package (never "—", which reads as "unknown", review P2).
const count = (n: number) => (n < 0 ? t('unit.unlimited') : n === 0 ? t('unit.notIncluded') : fmtNumber(n));

export interface TileModel {
  planId: PlanId;
  usd: number;
  limits: { photos: number; videos: number; guests: number; retentionDays: number };
  flags: { ai: boolean; hostOnly: boolean; wall: boolean };
  available: boolean;
}

export const sparkTile: TileModel = {
  planId: 'spark',
  usd: 0,
  limits: { photos: PLANS.spark.photos, videos: PLANS.spark.videos, guests: PLANS.spark.guests, retentionDays: PLANS.spark.retentionDays },
  flags: { ai: false, hostOnly: false, wall: false },
  available: true,
};
export const fromOption = (o: PreviewOption): TileModel => ({ planId: o.planId, usd: o.usd, limits: o.limits, flags: o.flags, available: o.available });

/** `disabled` = can't be chosen (dimmed); `readOnly` = shown for information while
 *  nothing can be chosen (coming soon, link first, region): not dimmed, not pressable. */
export function PlanTile({ m, selected, onSelect, soon, disabled, readOnly }: { m: TileModel; selected: boolean; onSelect: () => void; soon?: boolean; disabled?: boolean; readOnly?: boolean }) {
  const pro = m.flags.hostOnly;
  return (
    <button
      type="button"
      className={`tile${disabled && !readOnly ? ' off' : ''}${readOnly ? ' ro' : ''}`}
      aria-pressed={readOnly ? undefined : selected}
      aria-disabled={disabled || readOnly || undefined}
      data-plan={m.planId}
      onClick={() => {
        if (!disabled && !readOnly) onSelect();
      }}
    >
      {HIGHLIGHT.has(m.planId) && <span className="t-badge">{t('plan.popular')}</span>}
      <span className="t-name" lang="en">{planName(m.planId)}</span>
      <span className="t-price">{m.usd === 0 ? t('plan.free') : fmtUsd(m.usd)}</span>
      {m.usd > 0 && <span className="t-per">{t('plan.perEvent')}</span>}
      {soon && m.usd > 0 && <span className="t-note">{t('plan.webSoon')}</span>}
      {!soon && !pro && m.flags.wall && <span className="t-note">{t('plan.wallIncluded')}</span>}
      <dl>
        {!pro && (
          <div>
            <dt>{t('stat.guests')}</dt>
            <dd>{count(m.limits.guests)}</dd>
          </div>
        )}
        <div>
          <dt>{t('stat.photos')}</dt>
          <dd>{count(m.limits.photos)}</dd>
        </div>
        <div>
          <dt>{t('stat.videos')}</dt>
          <dd>{count(m.limits.videos)}</dd>
        </div>
        <div>
          <dt>{t('plan.storage')}</dt>
          <dd>{storageLabel(m.limits.retentionDays)}</dd>
        </div>
        {pro && (
          <div>
            <dt>{t('stat.guests')}</dt>
            <dd>{t('unit.unlimited')}</dd>
          </div>
        )}
      </dl>
    </button>
  );
}

/** The footnote every checkout carries (plan §3.4, D20): USD, Paddle as merchant
 *  of record, refund policy and web purchase terms. */
export function CheckoutFootnote() {
  const site = backend.siteOrigin;
  return (
    <p className="footnote">
      {t('checkout.footnote')}{' '}
      <a href={`${site}/refund-policy.html`}>{t('legal.refund')}</a> · <a href={`${site}/web-terms.html`}>{t('legal.webTerms')}</a>
    </p>
  );
}
