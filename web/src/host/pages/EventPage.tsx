import { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import type { HostEvent } from '../lib/types';
import { watchEvent } from '../lib/data';
import { logError } from '../lib/errorLog';
import { tierOf, type PlanId } from '../lib/plans';
import { TABS, type Tab } from '../lib/router';
import { fmtDay, fmtNumber, t, type Key } from '../i18n';
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

export function EventPage({ user, id, tab, plan, fresh, paid }: { user: User; id: string; tab: Tab; plan?: PlanId; fresh: boolean; paid?: PlanId }) {
  const [event, setEvent] = useState<HostEvent | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  // Phones: the tab row scrolls sideways — fade whichever edge has more tabs behind
  // it (review P2: a hard-cut label on the left after scrolling).
  const tabsRef = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const measureTabs = () => {
    const row = tabsRef.current;
    if (!row) return;
    const left = row.scrollLeft > 2;
    const right = row.scrollLeft + row.clientWidth < row.scrollWidth - 2;
    setEdges((e) => (e.left === left && e.right === right ? e : { left, right }));
  };
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
      measureTabs();
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

  // No "Kept until" line under the title (owner feedback, 24 Sep 2026). The
  // date stays a plain fact in the package card and the list; the 14 / 5 / 2-day
  // banners (D19) still warn before anything is deleted.
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
        </div>
      </div>
      <nav className="tabs" aria-label={t('tab.label')} ref={tabsRef} onScroll={measureTabs} data-left={edges.left ? '1' : undefined} data-right={edges.right ? '1' : undefined}>
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
      {tab === 'overview' && <Overview event={event} fresh={fresh} paid={paid} />}
      {tab === 'gallery' && <Gallery event={event} />}
      {tab === 'guests' && <Guests event={event} />}
      {tab === 'settings' && <Settings event={event} user={user} />}
      {tab === 'plan' && <PlanTab event={event} user={user} plan={plan} fresh={fresh} />}
      {tab === 'downloads' && <Downloads event={event} />}
    </>
  );
}
