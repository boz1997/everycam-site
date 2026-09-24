import { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { checkoutDriver, preview, type Preview } from '../lib/checkout';
import { createEvent, fn, setCover } from '../lib/data';
import { logError } from '../lib/errorLog';
import { isLinked } from '../lib/auth';
import { WEB_LADDER, isPlanId, type PlanId, type Tier } from '../lib/plans';
import { hrefFor, navigate } from '../lib/router';
import { fmtDate, fmtUsd, t } from '../i18n';
import { PRO_IN_APP, planName, retentionEndFor } from '../lib/plans';
import { LinkForm, SignInForm } from '../components/AuthForms';
import { CheckoutFootnote, PlanTile, fromOption, sparkTile, type TileModel } from '../components/PlanTiles';
import { Button, IconArrowLeft, IconFace, Loading, Notice, useToast } from '../components/ui';

// CREATE (+ BUY) — #/new (plan D8, §3.2, §3.3).
// Form → account step if signed out (the draft waits in sessionStorage) → create
// the event exactly like the app (Spark, numeric createdAt, date always present,
// origin 'web'; a photographer event gets a P code and is always open) → Spark:
// done; a paid package: the event's package page with that package picked, which
// runs the checkout (declaration first for photographer packages). Abandoning
// the checkout leaves a Spark event ("choose a package any time").

const DRAFT_KEY = 'sharecam.host.draft';
interface Draft { name: string; date: string; mode: 'open' | 'private'; plan: PlanId; tier: Tier }

function readDraft(): Partial<Draft> | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<Draft>) : null;
  } catch {
    return null;
  }
}
function writeDraft(d: Draft | null) {
  try {
    if (d) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage blocked: the form keeps its state in memory */
  }
}

type Region = { allowed: boolean; reason: string } | null;

export function NewEvent({ user, tier, plan: planParam }: { user: User | null; tier: Tier; plan?: PlanId }) {
  const toast = useToast();
  const draft = useMemo(() => {
    const d = readDraft();
    return d && d.tier === tier ? d : null;
  }, [tier]);
  const [name, setName] = useState(draft?.name ?? '');
  const [date, setDate] = useState(draft?.date ?? '');
  const [mode, setMode] = useState<'open' | 'private'>(draft?.mode === 'private' ? 'private' : 'open');
  const [cover, setCoverFile] = useState<File | null>(null);
  const coverUrl = useMemo(() => (cover ? URL.createObjectURL(cover) : null), [cover]);
  useEffect(() => () => { if (coverUrl) URL.revokeObjectURL(coverUrl); }, [coverUrl]);

  const initialPlan: PlanId = planParam && (tier === 'pro' ? WEB_LADDER.pro.includes(planParam) : planParam === 'spark' || WEB_LADDER.consumer.includes(planParam))
    ? planParam
    : draft?.plan && isPlanId(draft.plan)
      ? draft.plan
      : tier === 'pro' ? 'pro5000' : 'spark';
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [pv, setPv] = useState<Preview | null>(null);
  const [pvFailed, setPvFailed] = useState(false);
  const [region, setRegion] = useState<Region>(null);
  const [step, setStep] = useState<'form' | 'account' | 'link'>('form');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [nameErr, setNameErr] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const continueAfterAuth = useRef(false);
  const uid = user?.uid ?? null;
  const linked = isLinked(user);

  // Server truth for the tiles: prices, frozen limits (catalog), open or not.
  useEffect(() => {
    let alive = true;
    setPv(null);
    setPvFailed(false);
    preview({ tier })
      .then((p) => alive && setPv(p))
      .catch((e) => {
        void logError('host_new_preview', e, { tier });
        if (alive) setPvFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [tier, uid, linked]);

  // Photographer packages include face matching: the region gate first (after
  // sign-in: faceGateCheck rejects signed-out callers), like the app's paywall.
  useEffect(() => {
    if (tier !== 'pro' || !user) {
      setRegion(null);
      return;
    }
    let alive = true;
    fn.faceGateCheck({})
      .then((r) => alive && setRegion({ allowed: r.data.allowed === true, reason: String(r.data.reason ?? '') }))
      .catch(() => alive && setRegion({ allowed: false, reason: 'error' }));
    return () => {
      alive = false;
    };
  }, [tier, uid]);

  const canSell = !!pv && pv.open && checkoutDriver.configuredFor(pv.env);
  const tiles: TileModel[] = useMemo(() => {
    const paid = (pv?.options ?? []).map(fromOption);
    return tier === 'pro' ? paid : [sparkTile, ...paid];
  }, [pv, tier]);
  const selected = tiles.find((m) => m.planId === plan) ?? null;
  const paidPick = !!selected && selected.usd > 0;
  const soonFor = (m: TileModel) => m.usd > 0 && (!canSell || !m.available);
  const regionBlocked = tier === 'pro' && region !== null && !region.allowed;
  const proClosed = tier === 'pro' && (!canSell || regionBlocked);

  // Keep the pick valid (e.g. ?plan=wedding while web sales are closed → Spark).
  useEffect(() => {
    if (!pv) return;
    if (!selected || (selected.usd > 0 && soonFor(selected) && tier === 'consumer')) setPlan(tier === 'pro' ? (tiles.find((m) => !soonFor(m))?.planId ?? 'pro5000') : 'spark');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pv]);

  const submit = async () => {
    setErr('');
    const clean = name.trim().replace(/\s+/g, ' ');
    if (!clean) {
      // The error sits next to the name field, far above the button: take the
      // person there (review P1 — the button looked broken at 390 and 1440).
      setNameErr(true);
      nameRef.current?.focus({ preventScroll: true });
      nameRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    if (!selected || soonFor(selected) || (tier === 'pro' && (regionBlocked || region === null && !!user))) return;
    const d: Draft = { name: clean, date, mode, plan, tier };
    if (!user) {
      writeDraft(d);
      continueAfterAuth.current = true;
      setStep('account');
      return;
    }
    if (paidPick && !isLinked(user)) {
      writeDraft(d);
      continueAfterAuth.current = true;
      setStep('link');
      return;
    }
    setBusy(true);
    try {
      const ev = await createEvent({ name: clean, date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null, mode, hostId: user.uid, pro: tier === 'pro' });
      if (cover) await setCover(ev, cover).catch((e) => void logError('host_new_cover', e, { eventId: ev.id }));
      writeDraft(null);
      if (paidPick) navigate({ name: 'event', id: ev.id, tab: 'plan', plan, fresh: true });
      else {
        toast(t('new.created'));
        navigate({ name: 'event', id: ev.id, tab: 'overview', fresh: true });
      }
    } catch (e) {
      void logError('host_new_create', e, { tier, plan });
      setErr(t('new.createFailed'));
    } finally {
      setBusy(false);
    }
  };

  // After the account / link step: carry on with the same draft.
  useEffect(() => {
    if (!continueAfterAuth.current || !user) return;
    if (paidPick && !linked) {
      if (step !== 'link') setStep('link');
      return;
    }
    if (step !== 'form') setStep('form');
    if (!pv) return; // the preview re-runs for the signed-in account
    if (tier === 'pro' && region === null) return; // wait for the region gate
    continueAfterAuth.current = false;
    if (tier !== 'pro' || region?.allowed) void submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, linked, step, region, pv]);

  const switchTier = (next: Tier) => navigate({ name: 'new', tier: next }, true);

  if (step === 'account' || step === 'link') {
    return (
      <div className="auth">
        <div className="stack" style={{ ['--gap' as string]: '16px' }}>
          <button type="button" className="back" onClick={() => setStep('form')}>
            <IconArrowLeft /> {t('new.backToForm')}
          </button>
          <div className="page-head" style={{ marginBottom: 0 }}>
            <p className="kicker">{t('new.stepAccount')}</p>
            <h1 className="h1">{step === 'account' ? t('new.accountTitle') : t('link.title')}</h1>
            <p className="lead">{step === 'account' ? t('new.accountLead') : t('link.lead')}</p>
          </div>
          {/* Most people reaching this step are new: the form opens in "create" (review P1). */}
          <section className="panel">{step === 'account' ? <SignInForm initialMode="create" /> : <LinkForm linked={user?.providerData.map((p) => p.providerId) ?? []} />}</section>
        </div>
        <aside className="panel flat">
          <p className="kicker">{t('new.summary')}</p>
          <p className="h2" style={{ marginTop: 8 }}>{name.trim()}</p>
          <p className="muted" style={{ marginTop: 6 }}>
            {planName(plan)}
            {selected && selected.usd > 0 ? ` · ${fmtUsd(selected.usd)}` : ` · ${t('plan.free')}`}
          </p>
          <p className="tiny muted" style={{ marginTop: 12 }}>{t('signin.appBody')}</p>
        </aside>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <a className="back" href={user ? '#/' : hrefFor({ name: 'signin' })}>
          <IconArrowLeft /> {user ? t('nav.events') : t('nav.signin')}
        </a>
        <p className="kicker">{tier === 'pro' ? t('new.kickerPro') : t('new.kicker')}</p>
        <h1 className="h1">{tier === 'pro' ? t('new.titlePro') : t('new.title')}</h1>
        <p className="lead">{tier === 'pro' ? t('new.leadPro') : t('new.lead')}</p>
        <div className="row">
          <div className="seg" role="group" aria-label={t('new.tierLabel')}>
            <button type="button" aria-pressed={tier === 'consumer'} onClick={() => switchTier('consumer')}>{t('new.tierEvents')}</button>
            <button type="button" aria-pressed={tier === 'pro'} onClick={() => switchTier('pro')}>{t('new.tierPro')}</button>
          </div>
        </div>
      </div>

      <form
        className="grid-main"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        noValidate
      >
        <div className="col">
          <section className="panel stack" style={{ ['--gap' as string]: '18px' }} aria-labelledby="new-details">
            <h2 id="new-details" className="h2">{t('new.details')}</h2>
            <label className="field">
              <span className="label">{t('new.name')}</span>
              <input
                ref={nameRef}
                className="input"
                value={name}
                maxLength={80}
                placeholder={t('new.namePlaceholder')}
                aria-invalid={nameErr || undefined}
                aria-describedby={nameErr ? 'new-name-err' : undefined}
                data-name-input
                onChange={(e) => {
                  setName(e.target.value);
                  setNameErr(false);
                }}
              />
              {nameErr && <span className="err" id="new-name-err" role="alert">{t('new.nameRequired')}</span>}
            </label>
            <label className="field">
              <span className="label">{t('new.date')}</span>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 260 }} />
              <span className="hint">{t('new.dateHint')}</span>
            </label>
            {tier === 'consumer' && (
              <div className="field" role="radiogroup" aria-labelledby="new-who">
                <span className="label" id="new-who">{t('new.who')}</span>
                <div className="choice">
                  <label>
                    <input type="radio" name="mode" checked={mode === 'open'} onChange={() => setMode('open')} />
                    <strong>{t('mode.openTitle')}</strong>
                    <span>{t('mode.openDesc')}</span>
                  </label>
                  <label>
                    <input type="radio" name="mode" checked={mode === 'private'} onChange={() => setMode('private')} />
                    <strong>{t('mode.privateTitle')}</strong>
                    <span>{t('mode.privateDesc')}</span>
                  </label>
                </div>
                <span className="hint" style={{ marginTop: 6 }}>{t('new.modeHint')}</span>
              </div>
            )}
            <div className="field">
              <span className="label">{t('new.cover')}</span>
              <div className="row">
                {coverUrl && <img src={coverUrl} alt="" style={{ width: 96, height: 64, objectFit: 'cover' }} />}
                <label className="btn line sm" style={{ cursor: 'pointer' }}>
                  {cover ? t('new.coverChange') : t('new.coverAdd')}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
                </label>
                {cover && (
                  <button type="button" className="btn quiet" onClick={() => setCoverFile(null)}>
                    {t('common.remove')}
                  </button>
                )}
              </div>
            </div>
            <Notice icon={<IconLockSmall />}>{t('new.locked')}</Notice>
          </section>
        </div>

        <div className="col">
          <section className="panel stack" style={{ ['--gap' as string]: '16px' }} aria-labelledby="new-plan">
            <div className="row between">
              <h2 id="new-plan" className="h2">{t('new.package')}</h2>
              {pv?.env === 'sandbox' && canSell && <span className="tag sandbox">{t('checkout.sandbox')}</span>}
            </div>
            {!pv && !pvFailed && <Loading />}
            {pvFailed && <Notice tone="danger">{t('common.checkConnection')}</Notice>}
            {tier === 'pro' && regionBlocked && (
              <Notice tone="gold" icon={<IconFace />} title={t('face.regionTitle')}>
                {t('face.regionBody')}
              </Notice>
            )}
            {pv && tier === 'pro' && !canSell && !regionBlocked && (
              <Notice title={t('new.proSoonTitle')}>{PRO_IN_APP ? t('new.proSoonBodyApp') : t('new.proSoonBody')}</Notice>
            )}
            {pv && tier === 'consumer' && !canSell && pv.reason !== 'link-account' && <p className="small muted">{t('new.consumerSoon')}</p>}
            {pv && (
              <div className="tiles compact">
                {tiles.map((m) => (
                  <PlanTile key={m.planId} m={m} selected={plan === m.planId} soon={soonFor(m) && !proClosed} readOnly={proClosed} disabled={soonFor(m)} onSelect={() => setPlan(m.planId)} />
                ))}
              </div>
            )}
            {pv && tier === 'pro' && (
              <div className="small muted stack" style={{ ['--gap' as string]: '4px' }} data-pro-includes>
                <p>{t('checkout.proIncludesTitle')} {t('checkout.proInc1')} · {t('checkout.proInc2')} · {t('checkout.proInc3')}</p>
                {tiles.some((m) => m.limits.videos !== 0) && <p className="tiny">{t('plan.videosFromApp')}</p>}
                {canSell && !regionBlocked && <p className="tiny" data-next-decl>{t('new.proNextDecl')}</p>}
              </div>
            )}
            {tier === 'pro' && !user && <p className="tiny muted">{t('new.proRegionLater')}</p>}
            {paidPick && selected && (() => {
              // Storage counts from max(today, event day) — show the date before paying,
              // and warn when there is no date: it can never be added later (review P1).
              const end = retentionEndFor({ date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null, retentionDays: selected.limits.retentionDays });
              return date ? (
                <p className="small" data-kept-until>{t('list.keptUntil', { date: fmtDate(end) })}</p>
              ) : (
                <Notice tone="gold" icon={<IconClockSmall />}>
                  <span data-no-date-warn>{t('new.noDateWarn', { date: fmtDate(end) })}</span>
                </Notice>
              );
            })()}
            {err && <p className="err" role="alert">{err}</p>}
            {/* pro + signed in: submit() waits for the region gate, so the button waits too (busy = disabled): a click before faceGateCheck answered did nothing */}
            <Button type="submit" block busy={busy || (tier === 'pro' && !!user && region === null)} disabled={!pv || !selected || soonFor(selected) || proClosed}>
              {!selected || !paidPick ? t('new.ctaFree') : t('new.ctaPaid', { plan: planName(selected.planId), price: fmtUsd(selected.usd) })}
            </Button>
            {paidPick && <CheckoutFootnote />}
          </section>
        </div>
      </form>
    </>
  );
}

function IconClockSmall() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconLockSmall() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
