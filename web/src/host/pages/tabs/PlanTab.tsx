import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import type { HostEvent } from '../../lib/types';
import { backend } from '../../../backend/active';
import { useCheckout, type Phase } from '../../hooks/useCheckout';
import { HIGHLIGHT, PRO_IN_APP, awaitingProPackage, capsOf, planName, type PlanId } from '../../lib/plans';
import { fmtNumber, fmtUsd, t, type Key } from '../../i18n';
import { LinkForm } from '../../components/AuthForms';
import { CheckoutFootnote, PlanTile, fromOption, storageLabel } from '../../components/PlanTiles';
import { Button, IconAlert, IconCheck, IconClock, IconFace, Loading, Notice, Spinner } from '../../components/ui';

// Package page (plan §3.4): every checkout state of useCheckout, the footnote
// (USD, Paddle as merchant of record, refund policy + web purchase terms, D20),
// the sandbox badge. Declaration step for photographer packages (§3.3).

const SUPPORT = 'app.sharecam@gmail.com';

const SOON_KEY: Record<string, Key> = {
  off: 'checkout.soonOff',
  'sandbox-only': 'checkout.soonOff',
  'no-prices': 'checkout.soonPrices',
  'no-key': 'checkout.soonOff',
  'no-token': 'checkout.soonOff',
};

/** A cap as words: -1 unlimited, 0 "not included" (never "—", which reads as unknown). */
const capText = (v: number) => (v < 0 ? t('unit.unlimited') : v === 0 ? t('unit.notIncluded') : fmtNumber(v));

function CurrentPlan({ event }: { event: HostEvent }) {
  const caps = capsOf(event);
  const waiting = awaitingProPackage(event);
  return (
    <section className="panel" aria-labelledby="cur-h">
      <p className="kicker">{t('checkout.current')}</p>
      <h2 id="cur-h" className="h2" style={{ marginTop: 4 }}>
        {waiting ? t('plan.none') : <span lang="en">{planName(event.planId)}</span>}
        {event.refunded && <span className="tag danger" style={{ marginLeft: 10, verticalAlign: 'middle' }}>{t('plan.refunded')}</span>}
      </h2>
      {waiting ? (
        // A photographer event without a package: not Spark's caps (review P2).
        <p className="desc" style={{ marginTop: 10 }}>{t('plan.awaitingBody')}</p>
      ) : (
        <dl className="facts" style={{ marginTop: 12 }}>
          {event.uploadPolicy !== 'host' && <div><dt>{t('stat.guests')}</dt><dd>{capText(caps.guests)}</dd></div>}
          <div><dt>{t('stat.photos')}</dt><dd>{capText(caps.photos)}</dd></div>
          <div><dt>{t('stat.videos')}</dt><dd>{capText(caps.videos)}</dd></div>
          <div><dt>{t('plan.storage')}</dt><dd>{storageLabel(caps.retentionDays)}</dd></div>
        </dl>
      )}
      <p className="tiny muted" style={{ marginTop: 12 }}>{t('checkout.upgradeRule')}</p>
    </section>
  );
}

function StatusBox({ tone, icon, title, children, actions }: { tone?: 'done' | 'bad'; icon: JSX.Element; title: string; children?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className={`panel status${tone ? ` ${tone}` : ''}`} role="status" aria-live="polite">
      <span className="icon">{icon}</span>
      <h2 className="h2">{title}</h2>
      {children && <div className="muted">{children}</div>}
      {actions && <div className="btn-row">{actions}</div>}
    </section>
  );
}

function Declaration({ phase, onAccept, onBack }: { phase: Extract<Phase, { at: 'declaration' }>; onAccept: () => Promise<void>; onBack: () => void }) {
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <section className="panel decl" aria-labelledby="decl-h" data-declaration>
      <p className="kicker">{t('decl.kicker', { plan: planName(phase.plan) })}</p>
      {/* web-only title: this is the photographer package's declaration, not the add-on's "Before you add it" (review P2) */}
      <h2 id="decl-h" className="h2">{t('face.declTitleWeb')}</h2>
      <p className="muted">{t('face.declIntro')}</p>
      <ol>
        <li>{t('face.decl1')}</li>
        <li>{t('face.decl2')}</li>
        <li>{t('face.decl3')}</li>
        <li>{t('face.decl4')}</li>
        <li>{t('face.decl5')}</li>
      </ol>
      <label className="check">
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} data-decl-accept />
        <span>
          {t('face.declAccept')} · <a href={`${backend.siteOrigin}/host-terms.html`} target="_blank" rel="noopener">{t('face.declRead')}</a>
        </span>
      </label>
      {phase.error && <p className="err" role="alert">{t('face.declError')}</p>}
      <div className="btn-row">
        <Button
          disabled={!ok}
          busy={busy}
          onClick={() => {
            setBusy(true);
            void onAccept().finally(() => setBusy(false));
          }}
        >
          {t('decl.continue')}
        </Button>
        <Button variant="quiet" onClick={onBack}>{t('common.back')}</Button>
      </div>
    </section>
  );
}

export function PlanTab({ event, user, plan: pre, fresh }: { event: HostEvent; user: User; plan?: PlanId; fresh: boolean }) {
  const { phase, buy, declare, back, retry } = useCheckout(event, user, { autoPlan: fresh ? pre : undefined, fresh });
  const pv = 'pv' in phase ? phase.pv : undefined;
  const options = useMemo(() => pv?.options ?? [], [pv]);
  const [pick, setPick] = useState<PlanId | null>(pre ?? null);
  useEffect(() => {
    if (!options.length) return;
    if (pick && options.some((o) => o.planId === pick)) return;
    const featured = options.find((o) => HIGHLIGHT.has(o.planId));
    setPick((featured ?? options[0]).planId);
  }, [options, pick]);

  const selected = options.find((o) => o.planId === pick) ?? null;
  const pickable = phase.at === 'pick';
  const busyPlan = phase.at === 'opening' || phase.at === 'paying' ? phase.plan : null;
  const soon = phase.at === 'coming-soon' || phase.at === 'link-account' || phase.at === 'region-blocked';
  const showTiles = !!pv && (phase.at === 'pick' || phase.at === 'opening' || phase.at === 'paying' || soon || (phase.at === 'failed' && !!pv));
  const mail = (subject: string) => `mailto:${SUPPORT}?subject=${encodeURIComponent(`${subject} · ${event.code}`)}`;

  let status: JSX.Element | null = null;
  switch (phase.at) {
    case 'loading':
      status = <Loading />;
      break;
    case 'error':
      status = (
        <Notice tone="danger" title={t('common.loadFailed')} actions={<Button variant="line" size="sm" onClick={retry}>{t('common.tryAgain')}</Button>}>
          {t('common.checkConnection')}
        </Notice>
      );
      break;
    case 'unavailable':
      status = <Notice tone="gold" title={t('checkout.unavailableTitle')}>{phase.why === 'code-not-pro' ? t('checkout.codeNotPro') : t('checkout.unavailableBody')}</Notice>;
      break;
    case 'link-account':
      status = (
        <section className="panel" aria-labelledby="link-h" data-link-account>
          <p className="kicker">{t('link.kicker')}</p>
          <h2 id="link-h" className="h2" style={{ marginTop: 6 }}>{t('link.title')}</h2>
          <p className="desc" style={{ marginTop: 8, marginBottom: 16 }}>{t('link.buyLead')}</p>
          <LinkForm onLinked={retry} linked={user.providerData.map((p) => p.providerId)} />
        </section>
      );
      break;
    case 'region-blocked':
      status = (
        <Notice tone="gold" icon={<IconFace />} title={phase.reason === 'country-filing-pending' ? t('face.regionSoonTitle') : phase.reason === 'location-unknown' || phase.reason === 'us-state-unknown' || phase.reason === 'error' ? t('face.regionUnknownTitle') : t('face.regionTitle')}>
          {phase.reason === 'country-filing-pending' ? t('face.regionSoonBody') : phase.reason === 'location-unknown' || phase.reason === 'us-state-unknown' || phase.reason === 'error' ? t('face.regionUnknownBody') : t('face.regionBody')}
        </Notice>
      );
      break;
    case 'coming-soon':
      status = (
        <Notice title={t('checkout.soonTitle')}>
          {t(SOON_KEY[phase.why] ?? 'checkout.soonOff')} {phase.pv.tier === 'pro' ? t(PRO_IN_APP ? 'checkout.soonAppProLive' : 'checkout.soonAppPro') : t('checkout.soonApp')}
        </Notice>
      );
      break;
    case 'maxed':
      status = <Notice icon={<span style={{ color: 'var(--verde)' }}><IconCheck s={20} /></span>} title={t('checkout.maxedTitle', { plan: planName(event.planId) })}>{t('checkout.maxedBody')}</Notice>;
      break;
    case 'declaration':
      status = <Declaration phase={phase} onAccept={declare} onBack={back} />;
      break;
    case 'applying':
      status = (
        <StatusBox icon={<Spinner />} title={t('checkout.applyingTitle')}>
          {t('checkout.applyingBody', { plan: planName(phase.plan) })}
        </StatusBox>
      );
      break;
    case 'slow':
      status = (
        <StatusBox icon={<IconClock />} title={t('checkout.slowTitle')} actions={<a className="btn line sm" href={mail(t('checkout.mailSlow'))}>{t('checkout.contact')}</a>}>
          {t('checkout.slowBody', { plan: planName(phase.plan) })}
        </StatusBox>
      );
      break;
    case 'done':
      status = (
        <StatusBox tone="done" icon={<IconCheck />} title={t('checkout.doneTitle')} actions={<a className="btn sm" href={`#/e/${event.id}`}>{t('checkout.toOverview')}</a>}>
          {t('checkout.doneBody', { plan: planName(phase.plan) })}
        </StatusBox>
      );
      break;
    case 'covered':
      status = (
        <StatusBox icon={<IconCheck />} title={t('checkout.coveredTitle', { plan: planName(phase.plan) })} actions={<a className="btn line sm" href={mail(t('checkout.mailDuplicate'))}>{t('checkout.contact')}</a>}>
          {t('checkout.coveredBody', { email: SUPPORT })}
        </StatusBox>
      );
      break;
    case 'failed':
      status = (
        <StatusBox
          tone="bad"
          icon={<IconAlert s={22} />}
          title={phase.why === 'checkout-error' || phase.why === 'too-many-orders' || phase.why === 'unavailable' || phase.why === 'checkout-unavailable' ? t('checkout.openFailedTitle') : t('checkout.failedTitle')}
          actions={
            <>
              {phase.pv && <Button variant="line" size="sm" onClick={back}>{t('checkout.backToPackages')}</Button>}
              <a className="btn quiet sm" href={mail(t('checkout.mailFailed'))}>{t('checkout.contact')}</a>
            </>
          }
        >
          {phase.why === 'too-many-orders' ? t('checkout.tooMany') : phase.why === 'checkout-error' || phase.why === 'unavailable' || phase.why === 'checkout-unavailable' ? t('checkout.openFailedBody') : t('checkout.failedBody', { email: SUPPORT })}
        </StatusBox>
      );
      break;
    default:
      status = null;
  }

  const notices = (
    <>
      {fresh && phase.at === 'pick' && phase.abandoned && <Notice title={t('checkout.abandonedTitle')}>{t('checkout.abandoned')}</Notice>}
      {!fresh && phase.at === 'pick' && phase.abandoned && <Notice>{t('checkout.closedNote')}</Notice>}
      {pv?.refunded && (phase.at === 'pick' || soon) && <Notice tone="gold" title={t('checkout.refundedTitle')}>{t('checkout.refundedBody')}</Notice>}
    </>
  );

  // No package list (loading, applying, done, covered, maxed, …): the state + what the event has now.
  if (!showTiles) {
    return (
      <div className="grid-main">
        <div className="col">
          {notices}
          {status}
        </div>
        <div className="col">
          <CurrentPlan event={event} />
        </div>
      </div>
    );
  }

  // Choosing: the state (if any) on top, then the packages across the full width
  // (a photographer event has up to five), like the site's pricing tiers.
  const caps = capsOf(event);
  const n = capText;
  // Nothing can be bought right now (coming soon, link first, region): a neutral
  // heading, not "Pick a package…" over tiles without a button (review P2).
  const title = soon ? t('checkout.titleInfo') : event.planId === 'spark' || event.refunded ? t('checkout.titleNew') : t('checkout.titleUpgrade');
  const subtitle = pv?.tier === 'pro' ? t('checkout.subtitlePro') : soon ? null : t('checkout.subtitle');
  return (
    <div className="stack" style={{ ['--gap' as string]: '16px' }}>
      {notices}
      {status && <div className="plan-status">{status}</div>}
      <section className="panel stack" style={{ ['--gap' as string]: '18px' }} aria-labelledby="pick-h" data-phase={phase.at}>
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div>
            <p className="kicker">{pv?.tier === 'pro' ? t('checkout.kickerPro') : t('checkout.kicker')}</p>
            <h2 id="pick-h" className="h2" style={{ marginTop: 4 }}>{title}</h2>
            {subtitle && <p className="muted small" style={{ marginTop: 6, maxWidth: '70ch' }}>{subtitle}</p>}
          </div>
          {pv?.env === 'sandbox' && phase.at !== 'coming-soon' && <span className="tag sandbox" data-sandbox>{t('checkout.sandbox')}</span>}
        </div>
        <p className="now-strip small">
          <span className="kicker">{t('checkout.current')}</span>
          <b>{awaitingProPackage(event) ? t('plan.none') : <span lang="en">{planName(event.planId)}</span>}</b>
          {!awaitingProPackage(event) && (
            <span className="muted">
              {/* each "label value" stays on one line; the strip breaks only after a "·" ("Storage 7 / days" at 390 px) */}
              {[
                ...(event.uploadPolicy !== 'host' ? [`${t('stat.guests')} ${n(caps.guests)}`] : []),
                `${t('stat.photos')} ${n(caps.photos)}`,
                `${t('stat.videos')} ${n(caps.videos)}`,
                `${t('plan.storage')} ${storageLabel(caps.retentionDays)}`,
              ].map((part, i, all) => (
                <span key={part}>
                  <span style={{ whiteSpace: 'nowrap' }}>{part}{i < all.length - 1 ? ' ·' : ''}</span>{i < all.length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
          )}
        </p>
        <div className="tiles wide" style={{ ['--n' as string]: String(Math.max(options.length, 3)) }}>
          {options.map((o) => (
            <PlanTile
              key={o.planId}
              m={fromOption(o)}
              selected={pick === o.planId}
              soon={!o.available && phase.at !== 'coming-soon'}
              readOnly={soon}
              disabled={!pickable || !o.available}
              onSelect={() => setPick(o.planId)}
            />
          ))}
        </div>
        {!soon && (
          <div className="btn-row">
            <Button busy={!!busyPlan} disabled={!pickable || !selected || !selected.available} onClick={() => selected && buy(selected.planId)} data-buy>
              {selected ? t('checkout.cta', { plan: planName(selected.planId), price: fmtUsd(selected.usd) }) : t('checkout.choose')}
            </Button>
            {busyPlan && <span className="small muted">{phase.at === 'opening' ? t('checkout.opening') : t('checkout.paying')}</span>}
          </div>
        )}
        {pv?.tier === 'pro' && <p className="small muted">{t('checkout.proIncludesTitle')} {t('checkout.proInc1')} · {t('checkout.proInc2')} · {t('checkout.proInc3')}</p>}
        {pv?.tier === 'pro' && options.some((o) => o.limits.videos !== 0) && <p className="tiny muted">{t('plan.videosFromApp')}</p>}
        <p className="tiny muted">{t('checkout.upgradeRule')}</p>
        <CheckoutFootnote />
      </section>
    </div>
  );
}
