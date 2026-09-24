import { useEffect, useState } from 'react';
import type { HostEvent } from '../../lib/types';
import { backend } from '../../../backend/active';
import { callableError, fn } from '../../lib/data';
import { logError } from '../../lib/errorLog';
import { aiAvailable, awaitingProPackage, capsOf, deletionAt, flagsOf, hasUpgrade, planName, tierOf } from '../../lib/plans';
import { fmtDate, fmtNumber, t } from '../../i18n';
import { downloadIcs } from '../../components/EventBits';
import { FaceNotice } from '../../components/FaceNotice';
import { QrCard } from '../../components/QrCard';
import { storageLabel } from '../../components/PlanTiles';
import { Button, CopyField, IconCalendar, IconCheck, IconLock, IconUpload, Meter, Notice } from '../../components/ui';

// Overview (plan §3.2 consumer, §3.3 photographer).

function Stats({ event }: { event: HostEvent }) {
  const caps = capsOf(event);
  const pro = flagsOf(event).hostOnly;
  // A cap of 0 is "not in this package", not an unknown number: no "0 —" meter
  // (review P2). Videos already uploaded under an earlier package still show.
  const cells = [
    { k: 'guests', used: event.activeGuestCount, cap: caps.guests, label: t('stat.guests') },
    { k: 'photos', used: event.photoCount, cap: caps.photos, label: t('stat.photos') },
    { k: 'videos', used: event.videoCount, cap: caps.videos, label: t('stat.videos') },
  ].filter((c) => !(c.k === 'videos' && c.cap === 0 && c.used === 0));
  return (
    <section className="panel" aria-labelledby="stats-h">
      <h2 id="stats-h" className="h3" style={{ marginBottom: 14 }}>{pro ? t('overview.statsPro') : t('overview.stats')}</h2>
      <div className="stats">
        {cells.map((c) => (
          <div className="stat" key={c.k} data-stat={c.k}>
            <div className="v">
              {fmtNumber(c.used)}
              <small>{c.cap < 0 ? t('unit.unlimitedShort') : `/ ${fmtNumber(c.cap)}`}</small>
            </div>
            <div className="l">{c.label}</div>
            <Meter used={c.used} cap={c.cap} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PackageCard({ event }: { event: HostEvent }) {
  const caps = capsOf(event);
  const del = deletionAt(event);
  const flags = flagsOf(event);
  const upgrade = event.refunded || hasUpgrade(event);
  if (awaitingProPackage(event)) {
    // No package yet: its Spark caps and "kept until" mean nothing (review P2).
    return (
      <section className="panel" aria-labelledby="pkg-h">
        <p className="kicker">{t('overview.package')}</p>
        <h2 id="pkg-h" className="h2" style={{ marginTop: 4 }}>{t('plan.none')}</h2>
        <p className="desc" style={{ marginTop: 8 }}>{t('plan.awaitingBody')}</p>
      </section>
    );
  }
  return (
    <section className="panel" aria-labelledby="pkg-h">
      <div className="panel-head">
        <div>
          <p className="kicker">{t('overview.package')}</p>
          <h2 id="pkg-h" className="h2" style={{ marginTop: 4 }}><span lang="en">{planName(event.planId)}</span></h2>
        </div>
        {event.refunded && <span className="tag danger">{t('plan.refunded')}</span>}
      </div>
      {event.refunded && <p className="small muted">{t('overview.refundedNote')}</p>}
      <dl className="facts" style={{ marginTop: 12 }}>
        <div><dt>{t('plan.storage')}</dt><dd>{storageLabel(caps.retentionDays)}</dd></div>
        <div><dt>{t('overview.keptUntil')}</dt><dd data-deletion>{del ? fmtDate(del) : '—'}</dd></div>
        <div><dt>{t('overview.face')}</dt><dd>{aiAvailable(event) ? (event.aiPeopleEnabled ? t('common.on') : t('common.off')) : t('overview.faceNot')}</dd></div>
        {!flags.hostOnly && <div><dt>{t('overview.wall')}</dt><dd>{flags.wall ? t('overview.included') : t('unit.notIncluded')}</dd></div>}
      </dl>
      <div className="btn-row" style={{ marginTop: 16 }}>
        {upgrade && (
          <a className="btn sm" href={`#/e/${event.id}/plan`} data-change-package>
            {t('overview.changePackage')}
          </a>
        )}
        {del && (
          <Button variant="line" size="sm" icon={<IconCalendar />} onClick={() => downloadIcs(event)}>
            {t('expiry.ics')}
          </Button>
        )}
      </div>
    </section>
  );
}

function WallCard({ event }: { event: HostEvent }) {
  // D6: follows the plan (Unlimited, Pro 1000+), open albums only (rules isWallViewer).
  if (!flagsOf(event).wall) return null;
  return (
    <section className="panel" aria-labelledby="wall-h">
      <h2 id="wall-h" className="h3">{t('wall.title')}</h2>
      <p className="desc">{event.mode === 'open' ? t('wall.openBody') : t('wall.privateWarning')}</p>
      {event.mode === 'open' && (
        <div style={{ marginTop: 12 }}>
          <CopyField value={backend.wallLink(event.code)} label={t('wall.title')} display={backend.wallLink(event.code).replace(/^https?:\/\//, '')} />
        </div>
      )}
    </section>
  );
}

function OwnerCode({ event }: { event: HostEvent }) {
  const [state, setState] = useState<{ code: string; expiresAt: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!state) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [state]);
  const create = async () => {
    setBusy(true);
    setErr('');
    try {
      const res = await fn.createOwnerCode({ eventId: event.id });
      setState(res.data);
      setNow(Date.now());
    } catch (e) {
      void logError('host_owner_code', e, { eventId: event.id, code: callableError(e).code });
      setErr(t('owner.error'));
    } finally {
      setBusy(false);
    }
  };
  const left = state ? Math.max(0, state.expiresAt - now) : 0;
  const mmss = `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')}`;
  return (
    <section className="panel" aria-labelledby="owner-h">
      <h2 id="owner-h" className="h3">{t('owner.title')}</h2>
      <p className="desc">{t('owner.body')}</p>
      {state && left > 0 ? (
        <div className="stack" style={{ ['--gap' as string]: '10px', marginTop: 14 }}>
          <p className="code-big" data-owner-code>{state.code}</p>
          <p className="tiny muted">{t('owner.expires', { time: mmss })}</p>
          <CopyField value={backend.albumLink(state.code)} label={t('owner.link')} display={backend.albumLink(state.code).replace(/^https?:\/\//, '')} />
          <p className="tiny muted">{t('owner.foot')}</p>
        </div>
      ) : (
        <div className="btn-row" style={{ marginTop: 14 }}>
          <Button variant="ghost" size="sm" busy={busy} onClick={() => void create()}>
            {state ? t('owner.newCode') : t('owner.cta')}
          </Button>
          {state && <span className="tiny muted">{t('owner.expired')}</span>}
        </div>
      )}
      {err && <p className="err" style={{ marginTop: 8 }}>{err}</p>}
    </section>
  );
}

function UploadCard({ event }: { event: HostEvent }) {
  const caps = capsOf(event);
  return (
    <section className="panel dark" aria-labelledby="up-h">
      <p className="kicker">{t('upload.kicker')}</p>
      <h2 id="up-h" className="h2" style={{ marginTop: 6 }}>{t('upload.title')}</h2>
      <p className="muted" style={{ marginTop: 8 }}>{t('upload.body')}</p>
      <p style={{ marginTop: 14, color: 'var(--cream)' }} className="num">
        <b style={{ font: '800 1.75rem/1 var(--serif)', fontVariationSettings: '"SOFT" 100, "WONK" 1' }} data-live-count>{fmtNumber(event.photoCount)}</b>{' '}
        <span className="muted">{caps.photos < 0 ? t('upload.countUnlimited') : t('upload.countOf', { cap: fmtNumber(caps.photos) })}</span>
      </p>
      <div className="btn-row" style={{ marginTop: 16 }}>
        {/* A new tab: the uploader has no way back to the dashboard (D20), so /host stays open here (review P2). */}
        <a className="btn on-dark" href={`../upload/?event=${encodeURIComponent(event.id)}`} target="_blank" rel="noopener" data-upload-link>
          <IconUpload /> {t('upload.cta')}
        </a>
      </div>
    </section>
  );
}

export function Overview({ event, fresh }: { event: HostEvent; fresh: boolean }) {
  const pro = tierOf(event) === 'pro';
  const waiting = awaitingProPackage(event);

  if (waiting) {
    // A web pro-intent event without a package: no QR, code or share yet (D8).
    return (
      <div className="grid-main">
        <section className="panel dark" aria-labelledby="await-h">
          <p className="kicker">{t('await.kicker')}</p>
          <h2 id="await-h" className="h2" style={{ marginTop: 6 }}>{t('await.title')}</h2>
          <p className="muted" style={{ marginTop: 8, maxWidth: '56ch' }}>{t('await.body')}</p>
          <div className="btn-row" style={{ marginTop: 18 }}>
            <a className="btn on-dark" href={`#/e/${event.id}/plan`}>{t('await.cta')}</a>
          </div>
        </section>
        <PackageCard event={event} />
      </div>
    );
  }

  return (
    <div className="stack" style={{ ['--gap' as string]: '20px' }}>
      {fresh && (
        <Notice icon={<span style={{ color: 'var(--verde)' }}><IconCheck s={20} /></span>} title={t('overview.createdTitle')}>
          {pro ? t('overview.createdBodyPro') : t('overview.createdBody')}
        </Notice>
      )}
      <div className="grid-main">
        <div className="col">
          {pro && <UploadCard event={event} />}
          <QrCard event={event} title={pro ? t('qr.titlePro') : t('qr.title')} body={pro ? t('qr.bodyPro') : t('qr.body')} />
          {!pro && event.mode === 'private' && (
            <p className="small private-line" data-private-line>
              <IconLock /> {t('overview.privateLine')}
            </p>
          )}
          {event.aiPeopleEnabled && <FaceNotice />}
        </div>
        <div className="col">
          <Stats event={event} />
          <PackageCard event={event} />
          {pro && <OwnerCode event={event} />}
          <WallCard event={event} />
        </div>
      </div>
    </div>
  );
}
