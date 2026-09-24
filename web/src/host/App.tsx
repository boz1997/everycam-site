import { useEffect, useState } from 'react';
import { migrateLegacyHostSession } from '../hostSession';
import { checkoutDriver } from './lib/checkout';
import { hrefFor, navigate, parseHash, useRoute } from './lib/router';
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
  // D13: a Paddle payment link lands here with ?_ptxn=… — Paddle.js opens it.
  useEffect(() => {
    checkoutDriver.resumePaymentLink(getLang());
  }, []);

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
  else if (route.name === 'new') page = <NewEvent user={user} tier={route.tier} plan={route.plan} />;
  else if (!user) page = <Loading />;
  else if (route.name === 'events') page = <EventList user={user} />;
  else if (route.name === 'account') page = <Account user={user} />;
  else page = <EventPage key={route.id} user={user} id={route.id} tab={route.tab} plan={route.plan} fresh={!!route.fresh} />;

  return (
    <ToastProvider>
      <Shell user={ready ? user : null} notices={notices}>
        {page}
      </Shell>
    </ToastProvider>
  );
}
