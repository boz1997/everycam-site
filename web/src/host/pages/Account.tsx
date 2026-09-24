import { useState } from 'react';
import type { User } from 'firebase/auth';
import { APPLE_WEB, isLinked, providerLabel, signOut } from '../lib/auth';
import { fn } from '../lib/data';
import { logError } from '../lib/errorLog';
import { navigate } from '../lib/router';
import { t } from '../i18n';
import { LinkForm } from '../components/AuthForms';
import { Button, IconArrowLeft, Notice, useConfirm, useToast } from '../components/ui';

// Account (plan §3.2): the sign-ins this account has, linking email / Google (and
// Apple once web Apple exists, D3), sign out, delete account and data
// (deleteAccountAndData — hidden for a paired session without a sign-in, D3 rev 2).
export function Account({ user }: { user: User }) {
  const toast = useToast();
  const { ask, node } = useConfirm();
  const [deleting, setDeleting] = useState(false);
  const linked = isLinked(user);
  const providers = user.providerData.map((p) => p.providerId);
  const canLinkMore = !providers.includes('google.com') || !providers.includes('password') || (APPLE_WEB && !providers.includes('apple.com'));

  const del = async () => {
    const one = await ask({ title: t('account.deleteTitle'), body: t('account.deleteBody'), confirm: t('account.deleteConfirm'), danger: true });
    if (!one) return;
    setDeleting(true);
    try {
      await fn.deleteAccountAndData({});
      await signOut().catch(() => undefined);
      toast(t('account.deleted'));
      navigate({ name: 'signin' }, true);
    } catch (e) {
      void logError('host_delete_account', e);
      toast(t('account.deleteFailed'));
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <a className="back" href="#/"><IconArrowLeft /> {t('nav.events')}</a>
        <p className="kicker">{t('account.kicker')}</p>
        <h1 className="h1">{t('account.title')}</h1>
      </div>
      <div className="grid-main">
        <div className="col">
          <section className="panel" aria-labelledby="acc-signins">
            <h2 id="acc-signins" className="h3">{t('account.signins')}</h2>
            {linked ? (
              <dl className="facts" style={{ marginTop: 12 }}>
                {user.providerData.map((p) => (
                  <div key={p.providerId}>
                    <dt>{providerLabel(p.providerId, null)}</dt>
                    <dd style={{ overflowWrap: 'anywhere' }}>{p.email ?? user.email ?? '—'}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="desc">{t('account.pairedOnly')}</p>
            )}
            <p className="tiny muted" style={{ marginTop: 12 }}>{t('account.sameAsApp')}</p>
          </section>

          {(!linked || canLinkMore) && (
            <section className="panel" aria-labelledby="acc-link">
              <h2 id="acc-link" className="h3">{linked ? t('account.addAnother') : t('link.title')}</h2>
              <p className="desc" style={{ marginBottom: 16 }}>{linked ? t('account.addAnotherBody') : t('link.lead')}</p>
              <LinkForm onLinked={() => toast(t('account.linked'))} />
            </section>
          )}
        </div>
        <div className="col">
          <section className="panel">
            <h2 className="h3">{t('account.signOutTitle')}</h2>
            <p className="desc">{linked ? t('account.signOutBody') : t('account.signOutPaired')}</p>
            <div className="btn-row" style={{ marginTop: 14 }}>
              <Button variant="line" size="sm" onClick={() => void signOut().then(() => navigate({ name: 'signin' }, true))}>
                {t('shell.signOut')}
              </Button>
            </div>
          </section>
          {linked ? (
            <section className="panel danger-zone">
              <h2 className="h3" style={{ color: 'var(--danger)' }}>{t('account.deleteCta')}</h2>
              <p className="desc">{t('account.deleteBody')}</p>
              <div className="btn-row" style={{ marginTop: 14 }}>
                <Button variant="danger" size="sm" busy={deleting} onClick={() => void del()} data-delete-account>
                  {t('account.deleteCta')}
                </Button>
              </div>
            </section>
          ) : (
            <Notice>{t('account.deletePairedNote')}</Notice>
          )}
        </div>
      </div>
      {node}
    </>
  );
}
