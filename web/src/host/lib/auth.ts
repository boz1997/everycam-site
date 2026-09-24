import {
  EmailAuthProvider, GoogleAuthProvider, OAuthProvider, createUserWithEmailAndPassword, linkWithCredential, linkWithPopup,
  onIdTokenChanged, sendPasswordResetEmail, signInWithCustomToken, signInWithEmailAndPassword, signInWithPopup,
  signOut as fbSignOut, type AuthProvider, type User,
} from 'firebase/auth';
import { hostAuth } from '../../hostSession';
import { getLang, t } from '../i18n';

// Host identity on the web (plan D3). Only on the named 'host' app (D2).
//   · email + password: create, sign in, reset (Firebase's own reset mail);
//   · Google popup (needs sharecam.app in the authorized domains, go-live D);
//   · Apple popup only in a build with VITE_APPLE_WEB=1 (Services ID, go-live E1);
//     until then the sign-in page says it is coming;
//   · "Pair with the Sharecam app": the app's upload code / QR → custom token.
// NO anonymous host is ever created here. The web never calls
// claimPreviousSession: from a custom-token session it would move events away
// from the phone's anonymous uid (D3).

export const APPLE_WEB = import.meta.env.VITE_APPLE_WEB === '1';

export type Provider = 'google' | 'apple';

function makeProvider(kind: Provider): AuthProvider {
  if (kind === 'google') {
    const p = new GoogleAuthProvider();
    p.setCustomParameters({ prompt: 'select_account' });
    return p;
  }
  const p = new OAuthProvider('apple.com');
  p.addScope('email');
  p.addScope('name');
  p.setCustomParameters({ locale: getLang() });
  return p;
}

/** Linked = the account has a real sign-in (email / Google / Apple). A paired
 *  session of an anonymous app uid (custom token) has none: it may view, upload
 *  and change settings, but must link before buying and never sees Delete
 *  account / Delete event (D3 rev 2 (b)). */
export const isLinked = (u: User | null): boolean => !!u && u.providerData.length > 0;

/**
 * May this SESSION delete the account or an event? Only a session signed in with
 * the account's own sign-in (email / Google / Apple) — never a paired one
 * (custom token from the app's pairing code or QR), linked or not: the app's
 * approval screen only asked to let this computer upload, and a leaked 6-character
 * code must not be able to wipe an album (fix pass, review P2). The server refuses
 * deleteAccountAndData for custom-token callers too (EC functions/src/cleanup.ts).
 * `signInProvider`: useSessionProvider(user); undefined while it is being read.
 */
export const canDestroy = (u: User | null, signInProvider: string | null | undefined): boolean =>
  isLinked(u) && typeof signInProvider === 'string' && signInProvider !== 'custom';

export function onHostAuth(cb: (u: User | null) => void): () => void {
  // onIdTokenChanged, not onAuthStateChanged: linking keeps the uid, so only the
  // token change says the session gained a provider.
  return onIdTokenChanged(hostAuth, cb);
}

export async function signInEmail(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(hostAuth, email.trim(), password);
  return user;
}
export async function createAccount(email: string, password: string): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(hostAuth, email.trim(), password);
  return user;
}
export async function sendReset(email: string): Promise<void> {
  hostAuth.languageCode = getLang();
  await sendPasswordResetEmail(hostAuth, email.trim());
}
export async function signInProvider(kind: Provider): Promise<User> {
  const { user } = await signInWithPopup(hostAuth, makeProvider(kind));
  return user;
}

/** The app's pairing token → this browser signs in as that host (D3). */
export async function signInPaired(token: string): Promise<User> {
  const { user } = await signInWithCustomToken(hostAuth, token);
  // A custom token response carries no provider list; reload so providerData
  // says whether the app's account is anonymous (link first) or linked already.
  await user.reload().catch(() => undefined);
  return user;
}

/** Add a sign-in to the current (paired, anonymous) account: the uid is kept. */
export async function linkEmail(email: string, password: string): Promise<User> {
  const u = hostAuth.currentUser;
  if (!u) throw Object.assign(new Error('no-session'), { code: 'auth/no-current-user' });
  const { user } = await linkWithCredential(u, EmailAuthProvider.credential(email.trim(), password));
  await user.getIdToken(true);
  return user;
}
export async function linkProvider(kind: Provider): Promise<User> {
  const u = hostAuth.currentUser;
  if (!u) throw Object.assign(new Error('no-session'), { code: 'auth/no-current-user' });
  const { user } = await linkWithPopup(u, makeProvider(kind));
  await user.getIdToken(true);
  return user;
}

export function signOut(): Promise<void> {
  return fbSignOut(hostAuth);
}

export const authCode = (e: unknown): string => String((e as { code?: string })?.code ?? (e as Error)?.message ?? '');

/** Linking found that this sign-in already belongs to another Sharecam account
 *  (D3 rev 2 (a)): the web never merges; the app's claim path does. */
export const isAlreadyInUse = (e: unknown): boolean =>
  ['auth/credential-already-in-use', 'auth/email-already-in-use', 'auth/account-exists-with-different-credential'].includes(authCode(e));

/** Popup dismissed by the person — not worth an error line or an errorLogs row. */
export const isDismissed = (e: unknown): boolean =>
  ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'].includes(authCode(e));

/** Firebase auth codes → copy. Anything unknown becomes the generic line. */
export function authMessage(e: unknown, mode: 'signin' | 'create' | 'link' = 'signin'): string {
  const code = authCode(e);
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-login-credentials') return t('auth.errWrong');
  if (code === 'auth/email-already-in-use') return mode === 'create' ? t('auth.errEmailTaken') : t('auth.errGeneric');
  if (code === 'auth/weak-password') return t('auth.errWeak');
  if (code === 'auth/invalid-email' || code === 'auth/missing-email') return t('auth.errEmail');
  if (code === 'auth/missing-password') return t('auth.errWeak');
  if (code === 'auth/popup-blocked') return t('auth.errPopupBlocked');
  if (code === 'auth/unauthorized-domain' || code === 'auth/operation-not-allowed' || code === 'auth/operation-not-supported-in-this-environment') return t('auth.errProviderOff');
  if (code === 'auth/network-request-failed') return t('auth.errOffline');
  if (code === 'auth/too-many-requests') return t('auth.errTooMany');
  if (code === 'auth/user-disabled') return t('auth.errDisabled');
  if (code === 'auth/requires-recent-login') return t('auth.errRecent');
  if (code === 'auth/provider-already-linked') return t('auth.errAlreadyLinked');
  return t('auth.errGeneric');
}

/** Human-readable label for a provider id. */
export function providerLabel(providerId: string, email?: string | null): string {
  if (providerId.includes('google')) return 'Google';
  if (providerId.includes('apple')) return 'Apple';
  if (providerId === 'password') return email ?? t('auth.email');
  return providerId;
}
