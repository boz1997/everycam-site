import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import type { HostEvent } from '../lib/types';
import { watchMyEvents } from '../lib/data';
import { logError } from '../lib/errorLog';
import { awaitingProPackage, deletionAt, tierOf } from '../lib/plans';
import { fmtDate, fmtDay, t } from '../i18n';
import { EventCover, ExpiryList, PlanTags, capsLine, expiringSoon } from '../components/EventBits';
import { IconChevron, IconPlus, Loading, Meter, Notice } from '../components/ui';

// Event list (plan §3.2, §3.3): two groups when both exist — "Photographer events"
// first, then "Events" — by the D28 tier (anchor plan's tier, host-only uploads,
// or a Spark event with a P code; never the code alone for a paid event). Each row:
// cover or initial, name, date, plan chip (+ Refunded), guests and photos against
// the caps (frozen limits first), and the deletion date.

function Row({ e }: { e: HostEvent }) {
  const { guests, photos, caps } = capsLine(e);
  const del = deletionAt(e);
  // A web pro-intent event without a package: its Spark caps mean nothing yet.
  const waiting = awaitingProPackage(e);
  const short = (d: number) => fmtDate(d, { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <a className="ev-row" href={`#/e/${e.id}`} data-event={e.id}>
      <EventCover event={e} />
      <span className="ev-main">
        <span className="ev-title">
          <span className="ev-name">{e.name}</span>
          <span className="ev-tags"><PlanTags event={e} /></span>
        </span>
        <span className="ev-meta">
          <span>{e.date ? fmtDay(e.date) : t('event.noDate')}</span>
          {!waiting && <span className="num">{e.code}</span>}
          {waiting ? (
            <span className="only-narrow">{t('list.waiting')}</span>
          ) : (
            <>
              <span className="only-narrow">{t('list.guestsShort', { v: guests })}</span>
              <span className="only-narrow">{t('list.photosShort', { v: photos })}</span>
              {del && <span className="only-narrow">{t('list.keptUntil', { date: short(del) })}</span>}
            </>
          )}
        </span>
      </span>
      {waiting ? (
        <span className="ev-stats ev-wait">{t('list.waiting')}</span>
      ) : (
        <>
          <span className="ev-stats">
            <span className="label">{t('stat.guests')}</span>
            <b className="num">{guests}</b>
            <Meter used={e.activeGuestCount} cap={caps.guests} />
          </span>
          <span className="ev-stats">
            <span className="label">{t('stat.photos')}</span>
            <b className="num">{photos}</b>
            <Meter used={e.photoCount} cap={caps.photos} />
          </span>
          <span className="ev-stats">
            <span className="label">{t('list.deletion')}</span>
            <b>{del ? short(del) : '—'}</b>
          </span>
        </>
      )}
      <span className="ev-chev"><IconChevron /></span>
    </a>
  );
}

export function EventList({ user }: { user: User }) {
  const [rows, setRows] = useState<HostEvent[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(
    () =>
      watchMyEvents(user.uid, setRows, (e) => {
        void logError('host_list', e);
        setFailed(true);
      }),
    [user.uid],
  );
  if (failed && !rows) return <Notice tone="danger" title={t('common.loadFailed')}>{t('common.checkConnection')}</Notice>;
  if (!rows) return <Loading />;

  // By event date, upcoming first (soonest on top), then the past ones (most recent
  // first); an event without a date counts from the day it was created (review P2:
  // the createdAt order looked random next to the dates on the rows).
  const today = new Date().toISOString().slice(0, 10);
  const dayOf = (e: HostEvent) => e.date ?? new Date(e.createdAt || 0).toISOString().slice(0, 10);
  const sorted = [...rows].sort((a, b) => {
    const da = dayOf(a);
    const db = dayOf(b);
    const ua = da >= today;
    const ub = db >= today;
    if (ua !== ub) return ua ? -1 : 1;
    return ua ? da.localeCompare(db) : db.localeCompare(da);
  });
  const pro = sorted.filter((e) => tierOf(e) === 'pro');
  const consumer = sorted.filter((e) => tierOf(e) !== 'pro');
  const expiring = rows.filter(expiringSoon);

  return (
    <>
      <div className="page-head split">
        <p className="kicker">{t('list.kicker')}</p>
        <h1 className="h1">{t('list.title')}</h1>
        <p className="lead">{rows.length ? t('list.lead') : t('list.leadEmpty')}</p>
        <div className="actions btn-row">
          <a className="btn" href="#/new">
            <IconPlus />
            {t('list.create')}
          </a>
          <a className="btn ghost" href="#/new?tier=pro">
            {t('list.createPro')}
          </a>
        </div>
      </div>

      {expiring.length > 0 && <ExpiryList events={expiring} />}

      {rows.length === 0 ? (
        <section className="panel empty">
          <h2 className="h2">{t('list.emptyTitle')}</h2>
          <p className="muted" style={{ maxWidth: '58ch' }}>{t('list.emptyBody')}</p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <a className="btn" href="#/new">{t('list.create')}</a>
          </div>
        </section>
      ) : (
        <>
          {pro.length > 0 && (
            <section className="ev-group" aria-labelledby="g-pro">
              <div className="row between">
                <h2 id="g-pro" className="h2">{t('list.groupPro')}</h2>
                <span className="muted small">{t('list.count', { n: pro.length })}</span>
              </div>
              <div className="ev-list">{pro.map((e) => <Row key={e.id} e={e} />)}</div>
            </section>
          )}
          {consumer.length > 0 && (
            <section className="ev-group" aria-labelledby="g-events">
              <div className="row between">
                <h2 id="g-events" className="h2">{pro.length ? t('list.groupEvents') : t('list.groupAll')}</h2>
                <span className="muted small">{t('list.count', { n: consumer.length })}</span>
              </div>
              <div className="ev-list">{consumer.map((e) => <Row key={e.id} e={e} />)}</div>
            </section>
          )}
        </>
      )}
      <p className="footnote" style={{ marginTop: 28, maxWidth: '70ch' }}>{t('list.findHint')}</p>
    </>
  );
}
