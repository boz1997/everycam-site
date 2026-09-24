import { useCallback, useRef, useState } from 'react';
import { navigate, parseHash } from '../lib/router';
import { t } from '../i18n';
import { SignInForm } from '../components/AuthForms';
import { PairWithApp } from '../components/PairWithApp';
import { Button, IconPhone, IconPlus } from '../components/ui';

// Sign in (plan §3.2): email/password, Google, Apple ("coming" until the Services
// ID exists, D3), and "Pair with the Sharecam app" for photographers.
//
// Two audiences, two ways in (fix pass, review P1): someone NEW gets "Create your
// event — no app needed" first (the create page works signed out; the account
// step comes after the form) plus "Create an account"; someone who already uses
// the app gets "same sign-in as in the app" — only in that panel, so a web-first
// host is never sent to the app. No purchase wording here.
export function SignIn({ next }: { next?: string }) {
  const [pairOpen, setPairOpen] = useState(false);
  const [formMode, setFormMode] = useState<'signin' | 'create'>('signin');
  const formRef = useRef<HTMLElement>(null);
  const done = useCallback(() => navigate(next ? parseHash(next) : { name: 'events' }, true), [next]);
  const toCreate = () => {
    setFormMode('create');
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      formRef.current?.querySelector<HTMLInputElement>('input[type="email"]')?.focus({ preventScroll: true });
    });
  };
  return (
    <div className="auth">
      <div className="stack" style={{ ['--gap' as string]: '20px' }}>
        <div className="page-head" style={{ marginBottom: 4 }}>
          <p className="kicker">{t('signin.kicker')}</p>
          <h1 className="h1">{t('signin.title')}</h1>
          <p className="lead">{t('signin.lead')}</p>
        </div>
        <section className="new-here" aria-labelledby="new-here-h" data-new-here>
          <h2 id="new-here-h" className="h3">{t('signin.newTitle')}</h2>
          <div className="btn-row">
            <a className="btn" href="#/new" data-new-cta>
              <IconPlus />
              {t('signin.newCta')}
            </a>
            <button type="button" className="btn quiet" onClick={toCreate} data-new-account>
              {t('auth.createCta')}
            </button>
          </div>
        </section>
        <section className="panel" aria-label={t('title.signin')} ref={formRef}>
          <SignInForm key={formMode} initialMode={formMode} onDone={done} />
        </section>
      </div>
      <div className="stack" style={{ ['--gap' as string]: '16px' }}>
        <section className="panel" aria-labelledby="app-h">
          <p className="kicker">{t('signin.appKicker')}</p>
          <h2 id="app-h" className="h2" style={{ marginTop: 6 }}>{t('signin.appTitle')}</h2>
          <p className="desc" style={{ marginTop: 8 }}>{t('signin.appBody')}</p>
        </section>
        <section className="panel" aria-labelledby="pair-h">
          <div className="panel-head">
            <div>
              <p className="kicker">{t('pair.kicker')}</p>
              <h2 id="pair-h" className="h2" style={{ marginTop: 6 }}>{t('pair.title')}</h2>
              <p className="desc" style={{ marginTop: 8 }}>{t('pair.body')}</p>
            </div>
          </div>
          {pairOpen ? (
            <PairWithApp onPaired={done} />
          ) : (
            <Button variant="ghost" icon={<IconPhone />} onClick={() => setPairOpen(true)}>
              {t('pair.open')}
            </Button>
          )}
        </section>
      </div>
    </div>
  );
}
