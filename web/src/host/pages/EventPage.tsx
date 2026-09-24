import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import type { HostEvent } from '../lib/types';
import { watchEvent } from '../lib/data';
import { logError } from '../lib/errorLog';
import { deletionAt, tierOf, type PlanId } from '../lib/plans';
import { TABS, type Tab } from '../lib/router';
import { fmtDate, fmtDay, fmtNumber, t, type Key } from '../i18n';
import { ExpiryBanner, PlanTags, expiringSoon } from '../components/EventBits';
import { IconArrowLeft, Loading, Notice } from '../components/ui';
import { Overview } from './tabs/Overview';
import { Gallery } from './tabs/Gallery';
import { Guests } from './tabs/Guests';
import { Settings } from './tabs/Settings';
import { PlanTab } from './tabs/PlanTab';
import { Downloads } from './tabs/Downloads';

const TAB_LABEL: Record<Tab, Key> = {
  overview: 'tab.overview',
  gallery: 'tab.gallery',
  guests: 'tab.guests',
  settings: 'tab.settings',
  plan: 'tab.plan',
  downloads: 'tab.downloads',
};

export function EventPage({ user, id, tab, plan, fresh }: { user: User; id: string; tab: Tab; plan?: PlanId; fresh: boolean }) {
  const [event, setEvent] = useState<HostEvent | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  useEffect(
    () =>
      watchEvent(id, setEvent, (e) => {
        void logError('host_event_watch', e, { eventId: id });
        setFailed(true);
      }),
    [id],
  );
  useEffect(() => {
    if (event) document.title = `${event.name} — Sharecam`;
  }, [event?.name]);
  // Phones: the tab row scrolls sideways; keep the current tab in view.
  useEffect(() => {
    const center = () => {
      const el = document.querySelector<HTMLElement>('.tabs [aria-current="page"]');
      const row = el?.parentElement;
      if (el && row && row.scrollWidth > row.clientWidth) row.scrollLeft = Math.max(0, el.offsetLeft - (row.clientWidth - el.offsetWidth) / 2);
    };
    center();
    window.addEventListener('resize', center);
    return () => window.removeEventListener('resize', center);
  }, [tab, event === undefined]);

  if (failed && event === undefined) return <Notice tone="danger" title={t('common.loadFailed')}>{t('common.checkConnection')}</Notice>;
  if (event === undefined) return <Loading />;
  if (event === null || event.hostId !== user.uid) {
    return (
      <div className="stack">
        <a className="back" href="#/"><IconArrowLeft /> {t('nav.events')}</a>
        <section className="panel empty">
          <h1 className="h2">{event === null ? t('event.goneTitle') : t('event.notYoursTitle')}</h1>
          <p className="muted" style={{ marginTop: 8 }}>{event === null ? t('event.goneBody') : t('event.notYoursBody')}</p>
        </section>
      </div>
    );
  }

  const del = deletionAt(event);
  const pro = tierOf(event) === 'pro';
  const tabs = TABS;
  return (
    <>
      <div className="ev-head">
        <a className="back" href="#/"><IconArrowLeft /> {t('nav.events')}</a>
        <p className="kicker">{pro ? t('event.kickerPro') : t('event.kicker')}</p>
        <h1 className="h1">{event.name}</h1>
        <div className="meta">
          <span className="row" style={{ gap: 6 }}><PlanTags event={event} /></span>
          <span>{event.date ? fmtDay(event.date) : t('event.noDate')}</span>
          {!(pro && event.planId === 'spark' && !event.planBeforeRefund) && <span className="num">{t('event.codeLine', { code: event.code })}</span>}
          {del && <span>{t('list.keptUntil', { date: fmtDate(del) })}</span>}
        </div>
      </div>
      <nav className="tabs" aria-label={t('tab.label')}>
        {tabs.map((k) => (
          <a key={k} href={k === 'overview' ? `#/e/${id}` : `#/e/${id}/${k}`} aria-current={tab === k ? 'page' : undefined} data-tab={k}>
            {t(TAB_LABEL[k])}
            {k === 'gallery' && <span className="count">{fmtNumber(event.photoCount + event.videoCount)}</span>}
            {k === 'guests' && <span className="count">{fmtNumber(event.activeGuestCount)}</span>}
          </a>
        ))}
      </nav>
      {(tab === 'overview' || tab === 'downloads') && expiringSoon(event) && (
        <div className="notices" style={{ marginTop: -8 }}>
          <ExpiryBanner event={event} />
        </div>
      )}
      {tab === 'overview' && <Overview event={event} fresh={fresh} />}
      {tab === 'gallery' && <Gallery event={event} />}
      {tab === 'guests' && <Guests event={event} />}
      {tab === 'settings' && <Settings event={event} user={user} />}
      {tab === 'plan' && <PlanTab event={event} user={user} plan={plan} fresh={fresh} />}
      {tab === 'downloads' && <Downloads event={event} />}
    </>
  );
}
