import { useState, type FormEvent } from 'react';
import {
  APPLE_WEB, authCode, authMessage, createAccount, isAlreadyInUse, isDismissed, linkEmail, linkProvider, sendReset, signInEmail, signInProvider,
} from '../lib/auth';
import { logError } from '../lib/errorLog';
import { t } from '../i18n';
import { Button, IconApple, IconGoogle, Notice } from './ui';

// Sign-in and link forms (plan D3, §3.2). Same buttons in every place: the
// sign-in page, the create page's account step, the checkout's link step and the
// account page. Linking keeps the uid (the app's anonymous account becomes a real
// one); when the sign-in already belongs to another Sharecam account the web does
// NOT merge — it says where to do it (the app's Settings → Account, D3 rev 2 (a)).

/** Web Apple sign-in does not exist until the Services ID is set up (go-live E1):
 *  an explicit "coming" state instead of a button that fails. */
function AppleButton({ onClick, busy, disabled, label, noteId }: { onClick: () => void; busy: boolean; disabled: boolean; label: string; noteId?: string }) {
  if (!APPLE_WEB) {
    return (
      <Button variant="provider" block disabled icon={<IconApple />} aria-describedby={noteId}>
        {label}
        <span className="tag line soon">{t('auth.soon')}</span>
      </Button>
    );
  }
  return (
    <Button variant="provider" block icon={<IconApple />} busy={busy} disabled={disabled} onClick={onClick}>
      {label}
    </Button>
  );
}

/** Sign-in failed because no account matched (Firebase's enumeration protection
 *  reports a wrong password and an unknown email the same way). */
const NO_MATCH = new Set(['auth/invalid-credential', 'auth/user-not-found', 'auth/invalid-login-credentials']);

/** `initialMode`: 'create' where the person is most likely new — the create page's
 *  account step (a bride who has never used Sharecam typed a NEW email and password
 *  into a sign-in form and got "Wrong email or password", review P1). */
export function SignInForm({ onDone, initialMode = 'signin' }: { onDone?: () => void; initialMode?: 'signin' | 'create' }) {
  const [mode, setMode] = useState<'signin' | 'create' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'google' | 'apple' | 'email' | null>(null);
  const [err, setErr] = useState('');
  const [noMatch, setNoMatch] = useState(false);
  const [sent, setSent] = useState(false);

  async function run(kind: 'google' | 'apple' | 'email', f: () => Promise<unknown>, as: 'signin' | 'create' | 'reset' = mode) {
    setBusy(kind);
    setErr('');
    setNoMatch(false);
    try {
      await f();
      onDone?.();
    } catch (e) {
      if (!isDismissed(e)) {
        void logError('host_signin', e, { kind, mode: as });
        setErr(authMessage(e, as === 'create' ? 'create' : 'signin'));
        setNoMatch(kind === 'email' && as === 'signin' && NO_MATCH.has(authCode(e)));
      }
    } finally {
      setBusy(null);
    }
  }
  const switchTo = (m: 'signin' | 'create' | 'reset') => {
    setMode(m);
    setErr('');
    setNoMatch(false);
    setSent(false);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'reset') {
      if (!email.trim()) return;
      setBusy('email');
      setErr('');
      sendReset(email)
        .then(() => setSent(true))
        .catch((x) => setErr(authMessage(x)))
        .finally(() => setBusy(null));
      return;
    }
    if (!email.trim() || !password) return;
    void run('email', () => (mode === 'create' ? createAccount(email, password) : signInEmail(email, password)));
  };

  return (
    <div className="auth-card">
      <Button variant="provider" block icon={<IconGoogle />} busy={busy === 'google'} disabled={!!busy} onClick={() => void run('google', () => signInProvider('google'))}>
        {t('auth.google')}
      </Button>
      <AppleButton label={t('auth.apple')} busy={busy === 'apple'} disabled={!!busy} noteId="apple-soon" onClick={() => void run('apple', () => signInProvider('apple'))} />
      {!APPLE_WEB && (
        <p className="tiny muted" id="apple-soon">
          {t('auth.appleSoon')}
        </p>
      )}
      <div className="divider">{mode === 'reset' ? t('auth.resetTitle') : t('auth.orEmail')}</div>
      <form className="stack" style={{ ['--gap' as string]: '12px' }} onSubmit={submit} noValidate>
        <label className="field">
          <span className="label">{t('auth.email')}</span>
          <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {mode !== 'reset' && (
          <label className="field">
            <span className="label">{t('auth.password')}</span>
            <input
              className="input"
              type="password"
              autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === 'create' && <span className="hint">{t('auth.passwordHint')}</span>}
          </label>
        )}
        {err && <p className="err" role="alert">{err}</p>}
        {noMatch && mode === 'signin' && (
          <button
            type="button"
            className="btn line sm"
            data-create-with-email
            disabled={!!busy}
            onClick={() => {
              switchTo('create');
              void run('email', () => createAccount(email, password), 'create');
            }}
          >
            {t('auth.createWithEmail')}
          </button>
        )}
        {mode === 'reset' && sent && <p className="ok-text" role="status">{t('auth.resetSent', { email: email.trim() })}</p>}
        <Button type="submit" block busy={busy === 'email'} disabled={!!busy}>
          {mode === 'create' ? t('auth.createCta') : mode === 'reset' ? t('auth.resetCta') : t('auth.signinCta')}
        </Button>
      </form>
      <div className="row between tiny" style={{ gap: 4 }}>
        {mode === 'signin' ? (
          <>
            <button type="button" className="btn quiet" onClick={() => switchTo('create')}>
              {t('auth.toCreate')}
            </button>
            <button type="button" className="btn quiet" onClick={() => switchTo('reset')}>
              {t('auth.toReset')}
            </button>
          </>
        ) : (
          <button type="button" className="btn quiet" onClick={() => switchTo('signin')} data-to-signin>
            {mode === 'create' ? t('auth.haveAccount') : t('auth.toSignin')}
          </button>
        )}
      </div>
    </div>
  );
}

/** "This sign-in already has a Sharecam account" (D3 rev 2 (a)). */
export function AlreadyInUse({ onBack }: { onBack: () => void }) {
  return (
    <Notice
      tone="gold"
      title={t('link.inUseTitle')}
      actions={
        <Button variant="line" size="sm" onClick={onBack}>
          {t('link.inUseBack')}
        </Button>
      }
    >
      {t('link.inUseBody')}
    </Notice>
  );
}

/** Add a sign-in to a paired (anonymous app) account: the uid, and so every event, stays.
 *  `linked`: the account's provider ids — only the MISSING ways in are offered (an
 *  email user was offered "Add email sign-in" and got "already added", review P2). */
export function LinkForm({ onLinked, linked = [] }: { onLinked?: () => void; linked?: string[] }) {
  const has = (id: string) => linked.includes(id);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'google' | 'apple' | 'email' | null>(null);
  const [err, setErr] = useState('');
  const [inUse, setInUse] = useState(false);

  async function run(kind: 'google' | 'apple' | 'email', f: () => Promise<unknown>) {
    setBusy(kind);
    setErr('');
    try {
      await f();
      onLinked?.();
    } catch (e) {
      if (isAlreadyInUse(e)) setInUse(true);
      else if (!isDismissed(e)) {
        void logError('host_link', e, { kind });
        setErr(authMessage(e, 'link'));
      }
    } finally {
      setBusy(null);
    }
  }

  if (inUse) return <AlreadyInUse onBack={() => setInUse(false)} />;
  const google = !has('google.com');
  const apple = !has('apple.com') && (APPLE_WEB || !linked.length);
  const emailWay = !has('password');
  return (
    <div className="auth-card">
      {google && (
        <Button variant="provider" block icon={<IconGoogle />} busy={busy === 'google'} disabled={!!busy} onClick={() => void run('google', () => linkProvider('google'))}>
          {t('link.google')}
        </Button>
      )}
      {apple && <AppleButton label={t('link.apple')} busy={busy === 'apple'} disabled={!!busy} onClick={() => void run('apple', () => linkProvider('apple'))} />}
      {emailWay && (google || apple) && <div className="divider">{t('auth.orEmail')}</div>}
      {emailWay && <form
        className="stack"
        style={{ ['--gap' as string]: '12px' }}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim() && password) void run('email', () => linkEmail(email, password));
        }}
      >
        <label className="field">
          <span className="label">{t('auth.email')}</span>
          <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span className="label">{t('auth.password')}</span>
          <input className="input" type="password" autoComplete="new-password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          <span className="hint">{t('auth.passwordHint')}</span>
        </label>
        <Button type="submit" block busy={busy === 'email'} disabled={!!busy}>
          {t('link.emailCta')}
        </Button>
      </form>}
      {err && <p className="err" role="alert">{err}</p>}
    </div>
  );
}
