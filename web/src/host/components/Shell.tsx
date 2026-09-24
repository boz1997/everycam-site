import { useEffect, useRef, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { Header } from '../../components/Header';
import { backend } from '../../backend/active';
import { isLinked, providerLabel, signOut } from '../lib/auth';
import { navigate } from '../lib/router';
import { LANG_LABEL, LANGS, getLang, setLang, t, type Lang } from '../i18n';
import { Button, IconLock, Notice } from './ui';

// Page frame: the shared header (wordmark, language, account menu), a banner for
// a paired-but-not-linked session (D3 rev 2 (b)), the page, and a footer with the
// legal links (web purchase terms + refund policy live only here, the checkout
// and the site footer — never on pages the app opens, D20).

function AccountMenu({ user }: { user: User }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const close = () => ref.current?.removeAttribute('open');
  // A <details> menu stays open on its own: close it on Escape (focus back on the
  // button) and on a click anywhere else (review P2).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !ref.current?.open) return;
      close();
      ref.current.querySelector<HTMLElement>('summary')?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, []);
  const linked = isLinked(user);
  const who = linked ? user.email ?? providerLabel(user.providerData[0]?.providerId ?? '', user.email) : t('shell.paired');
  const initial = (user.email ?? who ?? '?').trim().charAt(0).toUpperCase() || '?';
  return (
    <details className="acct" ref={ref}>
      <summary aria-label={t('shell.accountMenu')}>
        <span className="acct-dot" aria-hidden="true">{initial}</span>
        <span className="who">{who}</span>
      </summary>
      <div className="acct-menu" role="menu">
        <p className="who-full">{linked ? t('shell.signedInAs', { who }) : t('shell.pairedLong')}</p>
        <a href="#/" role="menuitem" onClick={close}>{t('shell.events')}</a>
        <a href="#/account" role="menuitem" onClick={close}>{t('shell.account')}</a>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            close();
            void signOut().then(() => navigate({ name: 'signin' }, true));
          }}
        >
          {t('shell.signOut')}
        </button>
      </div>
    </details>
  );
}

export function Shell({ user, children, notices }: { user: User | null; children: ReactNode; notices?: ReactNode }) {
  const lang = getLang();
  const site = backend.siteOrigin;
  const pairedOnly = !!user && !isLinked(user);
  return (
    <div className="hs-app">
      <Header<Lang>
        lang={lang}
        langs={LANGS}
        langLabel={(l) => LANG_LABEL[l]}
        onLang={(l) => void setLang(l)}
        languageName={t('shell.language')}
        homeHref="#/"
        tag={t('shell.tag')}
        right={user ? <AccountMenu user={user} /> : null}
      />
      <main className="hs-main" id="main">
        {(pairedOnly || notices) && (
          <div className="notices">
            {pairedOnly && (
              <Notice
                tone="dark"
                icon={<IconLock />}
                title={t('shell.linkBannerTitle')}
                actions={
                  <Button variant="on-dark" size="sm" onClick={() => navigate({ name: 'account' })}>
                    {t('shell.linkBannerCta')}
                  </Button>
                }
              >
                {t('shell.linkBannerBody')}
              </Notice>
            )}
            {notices}
          </div>
        )}
        {children}
      </main>
      <footer className="hs-foot">
        <span className="grow">© 2026 Sharecam</span>
        <a href={`${site}/web-terms.html`}>{t('legal.webTerms')}</a>
        <a href={`${site}/refund-policy.html`}>{t('legal.refund')}</a>
        <a href={`${site}/privacy.html`}>{t('legal.privacy')}</a>
        <a href={`${site}/terms.html`}>{t('legal.terms')}</a>
        <a href={`${site}/support.html`}>{t('legal.support')}</a>
      </footer>
    </div>
  );
}
