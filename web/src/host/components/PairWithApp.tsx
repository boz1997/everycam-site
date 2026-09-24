import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db as guestDb, ensureAnon } from '../../firebase';
import { guestFunctions } from '../../hostSession';
import { signInPaired } from '../lib/auth';
import { callableError, fn } from '../lib/data';
import { logError } from '../lib/errorLog';
import { qrMatrix, qrPath } from '../lib/qr';
import { t } from '../i18n';
import { Button, Spinner } from './ui';

// "PAIR WITH THE SHARECAM APP" (plan D3) — the photographer's way in without a
// web sign-in. Two paths, both the uploader's (functions/src/uploadLink.ts):
//   · QR: this browser's GUEST (default, anonymous) session opens a pairing
//     (createUploadPairing), the app scans and approves, claimUploadPairing gives
//     a custom token → the named 'host' app signs in with it (D2);
//   · code: the app's 6-character upload code → redeemUploadCode → the same token.
// Pairing exists in the app for photographer events only (event.tsx:441-446).
// An anonymous app account reached this way can view, upload and change settings,
// and must add a sign-in before buying (D3).

const PAIR_PAGE = 'https://sharecam.app/upload/';
const CODE_RE = /[^A-Z0-9]/g;

function PairQr({ text }: { text: string }) {
  const { d, total } = qrPath(qrMatrix(text), 2);
  return (
    <svg viewBox={`0 0 ${total} ${total}`} shapeRendering="crispEdges" role="img" aria-label={t('pair.qrAlt')}>
      <rect width={total} height={total} fill="#fff" />
      <path d={d} fill="#1F3D2E" />
    </svg>
  );
}

// Two concurrent ensureAnon() calls can open two DIFFERENT anonymous accounts
// (both see no currentUser); the later one wins and this browser can no longer
// read the pairing the other opened. Concurrent calls share one promise
// (StrictMode's double effect did exactly this in dev), as in upload/QrPairing.tsx.
let anonInFlight: Promise<string> | null = null;
const guestSession = () =>
  (anonInFlight ??= ensureAnon().finally(() => {
    anonInFlight = null;
  }));

/** Wide enough to be the computer being paired (the QR is scanned FROM the phone). */
const WIDE = '(min-width: 768px)';
function useWide(): boolean {
  const [wide, setWide] = useState(() => typeof window === 'undefined' || !window.matchMedia || window.matchMedia(WIDE).matches);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(WIDE);
    const on = () => setWide(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return wide;
}

export function PairWithApp({ onPaired }: { onPaired: () => void }) {
  // On a phone "scan this with the app" is impossible (it IS the phone): lead with
  // the 6-character code and say pairing is for computers (review P2). No QR, so no
  // pairing document is opened for nothing either.
  const wide = useWide();
  const [pairing, setPairing] = useState<{ id: string; expiresAt: number } | null>(null);
  const [qrState, setQrState] = useState<'loading' | 'ready' | 'claiming' | 'error'>('loading');
  const [round, setRound] = useState(0);
  const claiming = useRef(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // 1) open a pairing on the guest session; renew shortly before it expires
  useEffect(() => {
    if (!wide) return;
    let cancelled = false;
    let timer: number | undefined;
    setQrState('loading');
    void (async () => {
      try {
        await guestSession();
        if (cancelled) return; // a cancelled round must not open a pairing
        const create = httpsCallable<Record<string, never>, { pairingId: string; expiresAt: number }>(guestFunctions(), 'createUploadPairing');
        const res = await create({});
        if (cancelled) return;
        claiming.current = false;
        setPairing({ id: res.data.pairingId, expiresAt: res.data.expiresAt });
        setQrState('ready');
        timer = window.setTimeout(() => setRound((r) => r + 1), Math.max(15_000, res.data.expiresAt - Date.now() - 5_000));
      } catch (e) {
        void logError('host_pair_qr_create', e);
        if (!cancelled) setQrState('error');
      }
    })();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [round, wide]);

  // 2) wait for the app's approval → token → host session
  const pairingId = pairing?.id;
  useEffect(() => {
    if (!pairingId) return;
    return onSnapshot(
      doc(guestDb, 'uploadPairings', pairingId),
      (snap) => {
        if (snap.get('status') !== 'approved' || claiming.current) return;
        claiming.current = true;
        setQrState('claiming');
        void (async () => {
          try {
            const claim = httpsCallable<{ pairingId: string }, { token: string }>(guestFunctions(), 'claimUploadPairing');
            const res = await claim({ pairingId });
            await signInPaired(res.data.token);
            onPaired();
          } catch (e) {
            void logError('host_pair_qr_claim', e);
            setRound((r) => r + 1);
          }
        })();
      },
      () => undefined,
    );
  }, [pairingId, onPaired]);

  const submitCode = async () => {
    const clean = code.toUpperCase().replace(CODE_RE, '').slice(0, 6);
    if (clean.length !== 6) return;
    setBusy(true);
    setErr('');
    try {
      const res = await fn.redeemUploadCode({ code: clean });
      await signInPaired(res.data.token);
      onPaired();
    } catch (e) {
      const { code: c, message } = callableError(e);
      setErr(c === 'not-found' || /code-not-found/.test(message) ? t('pair.errNotFound') : /expired/.test(message) ? t('pair.errExpired') : /used/.test(message) ? t('pair.errUsed') : t('pair.errGeneric'));
    } finally {
      setBusy(false);
    }
  };

  const codeForm = (
    <form
      className="row"
      onSubmit={(e) => {
        e.preventDefault();
        void submitCode();
      }}
    >
      <label className="grow">
        <span className="sr-only">{t('pair.codeLabel')}</span>
        <input
          className="input code"
          value={code}
          maxLength={6}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="one-time-code"
          placeholder="ABC123"
          aria-invalid={!!err || undefined}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
      </label>
      <Button type="submit" busy={busy} disabled={code.replace(CODE_RE, '').length !== 6}>
        {t('pair.codeCta')}
      </Button>
    </form>
  );

  if (!wide) {
    return (
      <div className="pair" data-pair-narrow>
        <p className="label">{t('pair.codeLabel')}</p>
        {codeForm}
        {err && <p className="err" role="alert">{err}</p>}
        <p className="small muted">{t('pair.phoneNote')}</p>
        <p className="tiny muted">{t('pair.foot')}</p>
      </div>
    );
  }

  return (
    <div className="pair">
      <div className="pair-grid">
        <div className="pair-qr" aria-busy={qrState !== 'ready'}>
          {pairing && (qrState === 'ready' || qrState === 'claiming') ? <PairQr text={`${PAIR_PAGE}?pair=${pairing.id}`} /> : qrState === 'error' ? <span className="tiny muted">—</span> : <Spinner />}
        </div>
        <div className="stack" style={{ ['--gap' as string]: '10px' }}>
          <p className="h3">{t('pair.qrTitle')}</p>
          <ol className="steps">
            <li>{t('pair.step1')}</li>
            <li>{t('pair.step2')}</li>
            <li>{t('pair.step3')}</li>
          </ol>
          <p className="tiny muted" aria-live="polite">
            {qrState === 'claiming' ? t('pair.connecting') : qrState === 'error' ? t('pair.qrError') : t('pair.qrFoot')}
          </p>
        </div>
      </div>
      <div className="divider">{t('pair.orCode')}</div>
      {codeForm}
      {err && <p className="err" role="alert">{err}</p>}
      <p className="tiny muted">{t('pair.foot')}</p>
    </div>
  );
}
