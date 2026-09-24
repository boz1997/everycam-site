import { useCallback, useState } from 'react';
import { navigate, parseHash } from '../lib/router';
import { t } from '../i18n';
import { SignInForm } from '../components/AuthForms';
import { PairWithApp } from '../components/PairWithApp';
import { Button, IconPhone } from '../components/ui';

// Sign in (plan §3.2): email/password, Google, Apple ("coming" until the Services
// ID exists, D3), and "Pair with the Sharecam app" for photographers. The hint for
// app users carries no purchase wording.
export function SignIn({ next }: { next?: string }) {
  const [pairOpen, setPairOpen] = useState(false);
  const done = useCallback(() => navigate(next ? parseHash(next) : { name: 'events' }, true), [next]);
  return (
    <div className="auth">
      <div className="stack" style={{ ['--gap' as string]: '20px' }}>
        <div className="page-head" style={{ marginBottom: 4 }}>
          <p className="kicker">{t('signin.kicker')}</p>
          <h1 className="h1">{t('signin.title')}</h1>
          <p className="lead">{t('signin.lead')}</p>
        </div>
        <section className="panel" aria-label={t('title.signin')}>
          <SignInForm onDone={done} />
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
