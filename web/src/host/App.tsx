import { useEffect, useRef, useState } from 'react';
import { migrateLegacyHostSession } from '../hostSession';
import { checkoutDriver, dropPaymentLink, orderStatus, paymentLinkTxn } from './lib/checkout';
import { hrefFor, navigate, parseHash, useRoute } from './lib/router';
import { isPlanId } from './lib/plans';
import { useHostUser } from './hooks/useHostUser';
import { getLang, t, useLang } from './i18n';
import { Shell } from './components/Shell';
import { Button, Loading, Notice, ToastProvider } from './components/ui';
import { SignIn } from './pages/SignIn';
import { EventList } from './pages/EventList';
import { NewEvent } from './pages/NewEvent';
import { EventPage } from './pages/EventPage';
import { Account } from './pages/Account';

// Routing + session gate (plan §3.1). Pages compose the feature modules.
//   #/signin   no session needed; a signed-in visitor goes to `next` or the list
//   #/new      no session needed to fill the form (the account step comes after)
//   the rest   need the host session; without one → #/signin?next=<this page>

export default function App() {
  useLang(); // re-render on a language switch
  const { user, ready } = useHostUser();
  const route = useRoute();
  const [legacy, setLegacy] = useState(false);

  // D2 migration: a browser the old uploader signed in as the host (default app).
  useEffect(() => {
    void migrateLegacyHostSession().then(setLegacy).catch(() => undefined);
  }, []);
  // D13: a Paddle payment link lands here with ?_ptxn=… — Paddle.js opens it, but
  // only for the SIGNED-IN owner of that order (review P2: any ?_ptxn= link opened
  // any checkout on sharecam.app; a phishing link could get a victim to pay for
  // someone else's event). Signed out, the gate below sends the visitor to sign in
  // first (the query string survives the hash navigation); an order that isn't
  // theirs (or no order at all) → the parameter is dropped and nothing opens.
  // Such a link opens /join/host/ — the event list. Land on THAT order's event
  // instead (owner feedback, 24 Sep 2026: after a payment, the list is the wrong
  // place): an order still open resumes its checkout there; a paid one is not
  // opened again ("{plan} is active" when it was applied).
  const resumed = useRef(false);
  useEffect(() => {
    if (!ready || !user || resumed.current) return;
    const txn = paymentLinkTxn();
    if (!txn) return;
    resumed.current = true;
    orderStatus(txn)
      .then((s) => {
        const onList = parseHash(window.location.hash).name === 'events';
        const id = s.eventId && /^[A-Za-z0-9_-]{1,128}$/.test(s.eventId) ? s.eventId : null;
        if (s.status !== 'created') {
          dropPaymentLink();
          if (onList && id) navigate({ name: 'event', id, tab: 'overview', ...(s.status === 'applied' && isPlanId(s.planId) ? { paid: s.planId } : {}) }, true);
          return;
        }
        if (onList && id) navigate({ name: 'event', id, tab: 'overview' }, true);
        checkoutDriver.resumePaymentLink(getLang());
      })
      .catch(() => dropPaymentLink());
  }, [ready, user]);

  // Screen readers and keyboards: after a route change, focus the new page's
  // heading (review P2: focus stayed on <body> with no announcement). Not on the
  // first load — the browser starts at the top anyway.
  const firstRoute = useRef(true);
  const routeKey = hrefFor(route);
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      const h = document.querySelector<HTMLElement>('.hs-main h1');
      if (!h || h.contains(document.activeElement)) return;
      h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
    }, 60);
    return () => window.clearTimeout(id);
  }, [routeKey]);

  useEffect(() => {
    if (!ready) return;
    if (route.name === 'signin') {
      if (user) navigate(route.next ? parseHash(route.next) : { name: 'events' }, true);
      return;
    }
    if (route.name === 'new') return;
    if (!user && parseHash(window.location.hash).name !== 'signin') navigate({ name: 'signin', next: hrefFor(route) }, true);
  }, [ready, user, route]);

  useEffect(() => {
    const title =
      route.name === 'signin' ? t('title.signin') : route.name === 'new' ? t('title.new') : route.name === 'account' ? t('title.account') : t('title.events');
    document.title = `${title} — Sharecam`;
  });

  const notices = legacy ? (
    <Notice
      tone="gold"
      title={t('legacy.title')}
      actions={
        <Button variant="line" size="sm" onClick={() => setLegacy(false)}>
          {t('common.ok')}
        </Button>
      }
    >
      {t('legacy.body')}
    </Notice>
  ) : null;

  let page: JSX.Element;
  if (!ready) page = <Loading />;
  else if (route.name === 'signin') page = user ? <Loading /> : <SignIn next={route.next} />;
  // keyed by the route: #/new?plan=party after #/new?plan=wedding starts with Party picked
  else if (route.name === 'new') page = <NewEvent key={routeKey} user={user} tier={route.tier} plan={route.plan} />;
  else if (!user) page = <Loading />;
  else if (route.name === 'events') page = <EventList user={user} />;
  else if (route.name === 'account') page = <Account user={user} />;
  else page = <EventPage key={route.id} user={user} id={route.id} tab={route.tab} plan={route.plan} fresh={!!route.fresh} paid={route.paid} />;

  return (
    <ToastProvider>
      <Shell user={ready ? user : null} notices={notices}>
        {page}
      </Shell>
    </ToastProvider>
  );
}
