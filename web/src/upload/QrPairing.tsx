// QR İLE EŞLEŞTİRME — bilgisayardaki sayfa, uygulamanın okuyacağı QR'ı gösterir
// (WhatsApp Web deseni, 22 Eyl 2026). Sunucu tarafı: functions/src/uploadLink.ts.
//
//   1. Anonim oturumla createUploadPairing → { pairingId } ; QR = sharecam.app/upload/?pair=…
//   2. uploadPairings/{id} dinlenir (kural: yalnız bu tarayıcının uid'i okur)
//   3. Fotoğrafçı uygulamada okutup onaylayınca status 'approved' → claimUploadPairing
//      → host custom token → UploadApp oturumu açar (kodla eşleştirmeyle aynı son adım).
// QR 5 dakikada bir kendini yeniler; token dokümanda durmaz, yalnız claim verir.
import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import qrcode from 'qrcode-generator';
import { auth, db, ensureAnon } from '../firebase';
import { logError } from '../errorLog';

const PAIR_PAGE = 'https://sharecam.app/upload/';

export interface PairResult {
  token: string;
  eventId: string;
  hostId: string;
}

/** Kendi SVG'miz: tema renkleriyle, keskin kenarlı; kütüphane yalnız matrisi hesaplar. */
function QrSvg({ text, size }: { text: string; size: number }) {
  const q = qrcode(0, 'M');
  q.addData(text);
  q.make();
  const n = q.getModuleCount();
  const m = 2; // sessiz bölge (modül)
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
  const total = n + m * 2;
  return (
    <svg viewBox={`0 0 ${total} ${total}`} width={size} height={size} shapeRendering="crispEdges" role="img" aria-label="QR">
      <rect width={total} height={total} fill="#ffffff" />
      <path d={d} fill="#1f3a2c" />
    </svg>
  );
}

export function QrPairing({ t, onPaired }: { t: (key: string) => string; onPaired: (res: PairResult) => Promise<void> }) {
  const [pairing, setPairing] = useState<{ id: string; expiresAt: number } | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'claiming' | 'error'>('loading');
  const [round, setRound] = useState(0); // artınca yeni QR
  const claimingRef = useRef(false);

  // 1) Eşleştirme aç; süresi dolmadan az önce yenisini iste.
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    setState('loading');
    void (async () => {
      try {
        await ensureAnon();
        const fn = httpsCallable<Record<string, never>, { pairingId: string; expiresAt: number }>(
          getFunctions(auth.app, 'europe-west3'),
          'createUploadPairing',
        );
        const res = await fn({});
        if (cancelled) return;
        claimingRef.current = false;
        setPairing({ id: res.data.pairingId, expiresAt: res.data.expiresAt });
        setState('ready');
        timer = window.setTimeout(() => setRound((r) => r + 1), Math.max(15_000, res.data.expiresAt - Date.now() - 5_000));
      } catch (e) {
        // Sessiz kalmaz: kod yolu hâlâ çalışır ama QR'ın neden düştüğü görünmeli.
        console.warn('QR eşleştirmesi açılamadı', e);
        void logError('upload_qr_create_failed', e);
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [round]);

  // 2) Onayı dinle → token al → oturum aç.
  const pairingId = pairing?.id;
  useEffect(() => {
    if (!pairingId) return;
    return onSnapshot(
      doc(db, 'uploadPairings', pairingId),
      (snap) => {
        if (snap.get('status') !== 'approved' || claimingRef.current) return;
        claimingRef.current = true;
        setState('claiming');
        void (async () => {
          try {
            const fn = httpsCallable<{ pairingId: string }, PairResult>(getFunctions(auth.app, 'europe-west3'), 'claimUploadPairing');
            const res = await fn({ pairingId });
            await onPaired(res.data);
          } catch (e) {
            console.warn('QR eşleştirmesi alınamadı', e);
            void logError('upload_qr_claim_failed', e);
            setRound((r) => r + 1); // alınamadıysa yeni QR
          }
        })();
      },
      // Host oturumu açılınca bu uid dokümanı okuyamaz (kural) — beklenen, sessiz.
      () => undefined,
    );
  }, [pairingId, onPaired]);

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        marginTop: 16,
        padding: 14,
        border: '1px solid var(--line)',
        borderRadius: 14,
        textAlign: 'left',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 6,
          borderRadius: 10,
          width: 150,
          height: 150,
          flex: '0 0 auto',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {pairing && state !== 'loading' && state !== 'error' ? (
          <QrSvg text={`${PAIR_PAGE}?pair=${pairing.id}`} size={138} />
        ) : (
          <span className="muted">…</span>
        )}
      </div>
      <div>
        <strong>{t('upQrTitle')}</strong>
        <p className="muted" style={{ margin: '4px 0 0', fontSize: 13.5 }}>
          {state === 'claiming' ? t('upQrConnecting') : state === 'error' ? t('upQrError') : t('upQrBody')}
        </p>
      </div>
    </div>
  );
}
