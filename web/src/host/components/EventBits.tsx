import { useState } from 'react';
import type { HostEvent } from '../lib/types';
import { awaitingProPackage, capsOf, deletionAt, hasUpgrade, planName } from '../lib/plans';
import { expiryIcs } from '../lib/ics';
import { downloadBlob, safeFileName } from '../lib/qr';
import { backend } from '../../backend/active';
import { fmtDate, fmtNumber, t } from '../i18n';
import { Button, IconCalendar, IconClock, Notice } from './ui';

// Small pieces shared by the list and the event pages.

export function EventCover({ event, size }: { event: HostEvent; size?: number }) {
  const [broken, setBroken] = useState(false);
  const initial = event.name.trim().charAt(0).toUpperCase() || '·';
  return (
    <span className="ev-cover" style={size ? { width: size, height: size } : undefined} aria-hidden="true">
      {event.coverUri && !broken ? <img src={backend.mediaUrl(event.coverUri)} alt="" loading="lazy" onError={() => setBroken(true)} /> : initial}
    </span>
  );
}

/** Plan chip(s): the plan, "Refunded", "Awaiting package". Plan names are brand
 *  names: lang="en" so the chip's uppercase stays WEDDING in Turkish (not WEDDİNG). */
export function PlanTags({ event }: { event: HostEvent }) {
  if (awaitingProPackage(event)) return <span className="tag gold">{t('plan.awaiting')}</span>;
  return (
    <>
      <span className={`tag${event.planId === 'spark' ? ' line' : ''}`}><span lang="en">{planName(event.refunded && event.planBeforeRefund ? event.planBeforeRefund : event.planId)}</span></span>
      {event.refunded && <span className="tag danger">{t('plan.refunded')}</span>}
    </>
  );
}

/** "41 / 50" or "41" for unlimited. */
export function usedOf(used: number, cap: number): string {
  return cap < 0 ? fmtNumber(used) : `${fmtNumber(used)} / ${fmtNumber(cap)}`;
}

export const daysLeft = (at: number, now = Date.now()) => Math.ceil((at - now) / 86_400_000);
/** Inside the 14-day banner window (D19). */
export const expiringSoon = (e: HostEvent): boolean => {
  const at = deletionAt(e);
  return at !== null && daysLeft(at) <= 14;
};

export function downloadIcs(event: HostEvent) {
  const at = deletionAt(event);
  if (!at) return;
  const ics = expiryIcs({
    eventId: event.id,
    deletionAt: at,
    title: t('expiry.icsTitle', { name: event.name }),
    description: t('expiry.icsBody', { name: event.name, date: fmtDate(at) }),
    url: 'https://sharecam.app/host/',
  });
  downloadBlob(new Blob([ics], { type: 'text/calendar;charset=utf-8' }), `sharecam-${safeFileName(event.name)}-reminder.ics`);
}

/** D19: the banner at 14 / 5 / 2 days before the deletion date, with the .ics.
 *  A REFUNDED event can't be downloaded (createEventZip refuses): no "download
 *  before then" advice there, but the way back — buying a package again (review
 *  P1). A still-upgradable event also gets "keep it longer: change package". */
export function ExpiryBanner({ event, withLink }: { event: HostEvent; withLink?: boolean }) {
  const at = deletionAt(event);
  if (!at) return null;
  const left = daysLeft(at);
  if (left > 14) return null;
  const tone = left <= 2 ? 'danger' : left <= 5 ? 'gold' : undefined;
  const refunded = event.refunded === true;
  const longer = !refunded && hasUpgrade(event);
  return (
    <Notice
      tone={tone}
      icon={<IconClock />}
      title={left <= 0 ? t('expiry.todayTitle', { name: event.name }) : left === 1 ? t('expiry.titleOne', { name: event.name }) : t('expiry.title', { name: event.name, n: left })}
      actions={
        <>
          {refunded ? (
            <a className="btn sm line" href={`#/e/${event.id}/plan`} data-expiry-packages>
              {t('downloads.buyAgain')}
            </a>
          ) : (
            withLink && (
              <a className="btn sm line" href={`#/e/${event.id}/downloads`}>
                {t('expiry.download')}
              </a>
            )
          )}
          {longer && (
            <a className="btn sm line" href={`#/e/${event.id}/plan`} data-expiry-longer>
              {t('expiry.keepLonger')}
            </a>
          )}
          <Button variant="line" size="sm" icon={<IconCalendar />} onClick={() => downloadIcs(event)}>
            {t('expiry.icsShort')}
          </Button>
        </>
      }
    >
      <span data-expiry-body>{refunded ? t('expiry.refundedBody', { date: fmtDate(at) }) : t('expiry.body', { date: fmtDate(at) })}</span>
    </Notice>
  );
}

/** The list's version of the D19 banners: ONE calm panel, one row per event whose
 *  storage ends within 14 days, soonest first; its tone follows the soonest. */
export function ExpiryList({ events }: { events: HostEvent[] }) {
  const rows = events
    .map((e) => ({ e, at: deletionAt(e) ?? 0 }))
    .filter((r) => r.at > 0 && daysLeft(r.at) <= 14)
    .sort((a, b) => a.at - b.at);
  if (!rows.length) return null;
  const soonest = daysLeft(rows[0].at);
  const tone = soonest <= 2 ? ' danger' : soonest <= 5 ? ' gold' : '';
  const allRefunded = rows.every((r) => r.e.refunded === true);
  return (
    <section className={`expiry-list${tone}`} aria-labelledby="exp-h">
      <div className="expiry-head">
        <IconClock />
        <div>
          <h2 id="exp-h" className="h3">{t('expiry.listTitle')}</h2>
          <p className="muted small">{allRefunded ? t('expiry.listBodyRefunded') : t('expiry.listBody')}</p>
        </div>
      </div>
      <ul>
        {rows.map(({ e, at }) => {
          const left = daysLeft(at);
          return (
            <li key={e.id} data-expiring={e.id}>
              <span className="grow">
                <a className="exp-name" href={`#/e/${e.id}`}>{e.name}</a>
                <span className={`exp-when${left <= 2 ? ' urgent' : ''}`}>
                  {left <= 0 ? t('expiry.whenToday') : left === 1 ? t('expiry.whenTomorrow') : t('expiry.whenDays', { n: left })} · {fmtDate(at, { day: 'numeric', month: 'short' })}
                </span>
              </span>
              <span className="exp-acts">
                {e.refunded ? (
                  // Downloads are off for a refunded event: the way back is a package.
                  <a className="btn quiet sm" href={`#/e/${e.id}/plan`} data-expiry-packages>{t('downloads.buyAgain')}</a>
                ) : (
                  <a className="btn quiet sm" href={`#/e/${e.id}/downloads`}>{t('expiry.download')}</a>
                )}
                <Button variant="quiet" size="sm" icon={<IconCalendar />} onClick={() => downloadIcs(e)}>
                  {t('expiry.icsShort')}
                </Button>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function capsLine(event: HostEvent) {
  const caps = capsOf(event);
  return {
    guests: usedOf(event.activeGuestCount, caps.guests),
    photos: usedOf(event.photoCount, caps.photos),
    caps,
  };
}
