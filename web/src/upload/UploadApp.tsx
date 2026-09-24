// FOTOĞRAFÇININ MASAÜSTÜ YÜKLEYİCİSİ — sharecam.app/upload (21 Eyl 2026).
//
// Akış: uygulamadaki 6 haneli kod ya da QR → host custom token → bu tarayıcı
// HOST olur (kalıcı) → etkinlik seç → klasörü bırak → orijinaller 4 paralel
// kanaldan Storage'a; sunucu 2048px kopya + thumb üretip galeriye düşürür. Sayfa
// medya dokümanı yazmaz, kural gevşetilmedi.
//
// OTURUM (plan D2, §3.5 — 24 Eyl 2026): etkinlik sahibi İSİMLİ 'host' Firebase
// uygulamasında oturum açar (src/hostSession.ts) — panel (/join/host) ile AYNI
// oturum. Panelde giriş yapmış biri buraya eşleştirmesiz gelir (panel "Upload
// originals" → ../upload/?event=<id>); eşleştirme de hâlâ çalışır ve açtığı oturum
// panelde de geçerlidir. Misafir sayfasının anonim oturumu varsayılan uygulamada
// kalır; ikisi birbirini asla ezmez. Eski sürüm host'u VARSAYILAN uygulamaya
// açıp uid'i localStorage 'sharecam.uploadHostUid'e yazıyordu: ilk açılışta o
// oturum misafir uygulamasından çıkarılır, anahtar silinir, tek satırlık "yeniden
// eşleştir" notu çıkar (migrateLegacyHostSession). "Çıkış" yalnız host
// uygulamasından çıkar. Bu sayfa panele bağlantı VERMEZ (D20: uygulamanın
// paylaştığı sayfalarda satış yok); "+ Yeni etkinlik" yalnız App Store'a gider.
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithCustomToken, signOut } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { guestFunctions, hostAuth, hostDb, migrateLegacyHostSession } from '../hostSession';
import { detectLang, LANG_LABEL, LANGS, makeT, saveLang, type Lang } from '../i18n';
import { asMedia, collectDrop, hasFiles } from '../intake';
import { fileSeed } from '../events';
import { originalVerdict, uploadOriginal, ORIGINAL_MAX_BYTES } from './originals';
import { IconPlus } from '../components/Brand';
import { Header } from '../components/Header';
import { QrPairing, type PairResult } from './QrPairing';
import { withUploadStrings } from './strings';

// Eski oturumun göçü sayfa başına BİR kez (StrictMode'un çift efekti iki kez
// çıkış denemesin, ikinci deneme "zaten çıkmış" görüp notu yutmasın).
let legacyMigration: Promise<boolean> | null = null;
const migrateLegacyOnce = () => (legacyMigration ??= migrateLegacyHostSession().catch(() => false));

// Üst bar sayfanın üstünde, kart kalan alanın ortasında.
const PAGE: CSSProperties = { minHeight: '100%', display: 'flex', flexDirection: 'column' };
const FILL: CSSProperties = { flex: '1 0 auto', minHeight: 'auto' };
// QR ONAYI (uploadLink.ts): okuyuculu uygulama build'i (1.0.5) TestFlight'a çıktı
// (23 Eyl 2026) → herkese açık. Eski build'ler QR'ı okuyamaz; kod yolu hemen altında.
const QR_PAIRING_LIVE = true;
const QR_PAIRING = QR_PAIRING_LIVE || new URLSearchParams(location.search).has('qr');
// Telefonun kamerasıyla okutulan QR bu sayfayı telefonda açar: yol göster.
const OPENED_FROM_PHONE_QR = new URLSearchParams(location.search).has('pair');
const PARALLEL = 4; // masaüstü + fiber: 4 kanal iyi; daha fazlası tek bağlantıyı boğuyor
const VISIBLE_ROWS = 6;

interface HostEvent {
  id: string;
  code: string;
  name: string;
  planId: string;
  photoCount: number;
  uploadPolicy: string;
  createdAt: number;
}
interface Row {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'done' | 'exists' | 'failed' | 'skipped';
  progress: number;
  note?: string;
}

// Paket adları marka adıdır, çevrilmez (uygulamadaki paywall ile aynı).
const PLAN_LABEL: Record<string, string> = {
  spark: 'Spark', mini: 'Mini', party: 'Party', wedding: 'Wedding', unlimited: 'Unlimited',
  pro500: 'Pro 500', pro1000: 'Pro 1000', pro2000: 'Pro 2000', pro5000: 'Pro 5000', proUnlimited: 'Pro Unlimited',
};

function toHostEvents(docs: { id: string; data: () => Record<string, unknown> }[]): HostEvent[] {
  return docs
    .map((d) => {
      const x = d.data();
      return {
        id: d.id,
        code: String(x.code ?? ''),
        name: String(x.name ?? ''),
        planId: String(x.planId ?? 'spark'),
        photoCount: Number(x.photoCount ?? 0),
        uploadPolicy: String(x.uploadPolicy ?? 'all'),
        createdAt: Number(x.createdAt ?? 0),
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Seçili etkinlik adreste durur: sayfa yenilenince aynı etkinlikte kalınır. */
function syncUrl(eventId: string | null) {
  history.replaceState(null, '', eventId ? `${location.pathname}?event=${encodeURIComponent(eventId)}` : location.pathname);
}

export function UploadApp() {
  const [lang, setLang] = useState<Lang>(() => detectLang());
  const t = useMemo(() => withUploadStrings(lang, makeT(lang)), [lang]);
  useEffect(() => {
    document.title = `${t('upTitle')} — Sharecam`;
  }, [t]);
  const [phase, setPhase] = useState<'checking' | 'pair' | 'events' | 'upload'>('checking');
  const [uid, setUid] = useState<string>('');
  const uidRef = useRef('');
  const [email, setEmail] = useState<string | null>(null);
  const [repair, setRepair] = useState(false); // eski oturum çıkarıldı → "yeniden eşleştir"
  const [code, setCode] = useState('');
  const [pairing, setPairing] = useState(false);
  const [pairError, setPairError] = useState('');
  const [events, setEvents] = useState<HostEvent[]>([]);
  const [event, setEvent] = useState<HostEvent | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const rowsRef = useRef<Row[]>([]);
  const seenRef = useRef<Set<string>>(new Set());
  const activeRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const dirRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const changeLang = (next: Lang) => {
    setLang(next);
    saveLang(next);
  };

  const signedIn = (hostUid: string, mail: string | null) => {
    uidRef.current = hostUid;
    setUid(hostUid);
    setEmail(mail);
  };

  // ---- Etkinlikler; `prefer` sırayla denenir (adresteki ?event=, eşleştirmenin etkinliği)
  const loadEvents = useCallback(async (hostUid: string, ...prefer: (string | null | undefined)[]) => {
    const snap = await getDocs(query(collection(hostDb, 'events'), where('hostId', '==', hostUid)));
    const list = toHostEvents(snap.docs);
    setEvents(list);
    const pre = prefer.map((id) => (id ? list.find((e) => e.id === id) : undefined)).find(Boolean);
    if (pre) {
      setEvent(pre);
      setPhase('upload');
      syncUrl(pre.id);
    } else {
      setPhase('events');
      syncUrl(null);
    }
  }, []);

  // Etkinlik seçerken liste CANLI: fotoğrafçı uygulamada yeni etkinlik açınca burada kendiliğinden belirir.
  useEffect(() => {
    if (phase !== 'events' || !uid) return;
    return onSnapshot(query(collection(hostDb, 'events'), where('hostId', '==', uid)), (snap) => setEvents(toHostEvents(snap.docs)));
  }, [phase, uid]);

  // ---- Açılış: önce eski oturumun göçü, sonra host oturumu var mı (panel ya da
  // önceki eşleştirme)? Varsa eşleştirme atlanır; ?code= gelmişse (uygulamanın
  // paylaştığı bağlantı) yine kod ekranı, kod dolu.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const legacy = await migrateLegacyOnce();
      await hostAuth.authStateReady();
      if (!alive) return;
      const params = new URLSearchParams(location.search);
      const urlCode = params.get('code');
      const user = hostAuth.currentUser;
      // ?pair= : bilgisayardaki QR telefonun kamerasıyla açıldı → aşağıdaki yol gösterici not.
      if (user && !urlCode && !OPENED_FROM_PHONE_QR) {
        signedIn(user.uid, user.email);
        await loadEvents(user.uid, params.get('event'));
        return;
      }
      setRepair(legacy);
      if (urlCode) setCode(urlCode.toUpperCase());
      setPhase('pair');
    })();
    return () => {
      alive = false;
    };
  }, [loadEvents]);

  // Oturum başka sekmede (panelde) kapatılırsa buradaki de kapanır → kod ekranı.
  useEffect(
    () =>
      onAuthStateChanged(hostAuth, (user) => {
        if (user || !uidRef.current) return;
        uidRef.current = '';
        setUid('');
        setEmail(null);
        setEvent(null);
        setEvents([]);
        setPhase('pair');
        syncUrl(null);
      }),
    [],
  );

  // ---- Eşleştirmenin son adımı (kod da QR da buraya iner): custom token → 'host' oturumu
  const finishPairing = useCallback(
    async (res: PairResult) => {
      const { user } = await signInWithCustomToken(hostAuth, res.token);
      // Custom token yanıtı sağlayıcı listesi taşımaz; panel (isLinked) aynı
      // oturumu okuyacağı için hesabın e-postası/sağlayıcıları şimdi tazelenir.
      await user.reload().catch(() => undefined);
      signedIn(res.hostId, user.email);
      setRepair(false);
      await loadEvents(res.hostId, res.eventId, new URLSearchParams(location.search).get('event'));
    },
    [loadEvents],
  );

  // ---- Eşleştirme: kod → custom token → host oturumu
  const pair = async () => {
    const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (clean.length !== 6) return;
    setPairing(true);
    setPairError('');
    try {
      // Kimlik istemez; misafir uygulamasının çağrısı (panelle aynı sunucu yolu).
      const fn = httpsCallable<{ code: string }, { token: string; eventId: string; hostId: string }>(guestFunctions(), 'redeemUploadCode');
      const res = await fn({ code: clean });
      await finishPairing(res.data);
    } catch (e) {
      const codeStr = String((e as { code?: string })?.code ?? '');
      const msg = String((e as { message?: string })?.message ?? '');
      setPairError(
        /not-found/.test(codeStr) || /code-not-found/.test(msg)
          ? t('upCodeNotFound')
          : /expired/.test(msg)
            ? t('upCodeExpired')
            : /used/.test(msg)
              ? t('upCodeUsed')
              : t('upCodeError'),
      );
    } finally {
      setPairing(false);
    }
  };

  // Yalnız host uygulamasından çıkar (panel de çıkar: aynı oturum); misafir oturumu kalır.
  const forget = async () => {
    uidRef.current = '';
    await signOut(hostAuth).catch(() => undefined);
    setUid('');
    setEmail(null);
    setEvent(null);
    setEvents([]);
    setPhase('pair');
    syncUrl(null);
  };

  const pickEvent = (e: HostEvent | null) => {
    setEvent(e);
    setPhase(e ? 'upload' : 'events');
    syncUrl(e?.id ?? null);
  };

  // ---- Seçili etkinliğin canlı sayacı: "galeride kaç kare var" (tek doküman)
  useEffect(() => {
    if (!event) return;
    return onSnapshot(doc(hostDb, 'events', event.id), (snap) => setLiveCount(Number(snap.get('photoCount') ?? 0)));
  }, [event?.id]);

  // ---- Kuyruk
  const commit = (next: Row[]) => {
    rowsRef.current = next;
    setRows(next);
  };
  const patch = (id: string, next: Partial<Row>) => commit(rowsRef.current.map((r) => (r.id === id ? { ...r, ...next } : r)));

  const pump = useCallback(() => {
    if (!event) return;
    while (activeRef.current < PARALLEL) {
      const next = rowsRef.current.find((r) => r.status === 'queued');
      if (!next) break;
      activeRef.current += 1;
      patch(next.id, { status: 'uploading', progress: 0 });
      void uploadOriginal(event.id, uid, t('upOwnerName'), next.file, (p) => patch(next.id, { progress: p }))
        .then((res) => patch(next.id, { status: res === 'exists' ? 'exists' : 'done', progress: 1 }))
        .catch((e) => patch(next.id, { status: 'failed', note: String((e as { code?: string })?.code ?? (e as Error)?.message ?? 'error') }))
        .finally(() => {
          activeRef.current -= 1;
          pump();
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id, uid, lang]);

  const enqueue = useCallback(
    (raw: File[]) => {
      const fresh: Row[] = [];
      const stamp = Date.now();
      let i = 0;
      for (const f of raw) {
        const media = asMedia(f);
        if (!media) continue;
        const seed = fileSeed(media);
        if (seenRef.current.has(seed)) continue;
        seenRef.current.add(seed);
        const verdict = originalVerdict(media);
        fresh.push({
          id: `${stamp}_${i++}_${media.name}`,
          file: media,
          status: verdict === 'ok' ? 'queued' : 'skipped',
          progress: 0,
          note:
            verdict === 'unsupported'
              ? t('upSkipUnsupported')
              : verdict === 'too-large'
                ? t('upSkipTooLarge').replace('{max}', String(ORIGINAL_MAX_BYTES / 1048576))
                : verdict === 'video'
                  ? t('upSkipVideo')
                  : undefined,
        });
      }
      if (fresh.length === 0) return;
      fresh.sort((a, b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true }));
      commit([...rowsRef.current, ...fresh]);
      pump();
    },
    [pump, t],
  );

  const retryFailed = () => {
    commit(rowsRef.current.map((r) => (r.status === 'failed' ? { ...r, status: 'queued', progress: 0, note: undefined } : r)));
    pump();
  };

  // ---- Sürükle-bırak (sayfanın tamamı), yalnız yükleme fazında
  useEffect(() => {
    if (phase !== 'upload') return;
    let depth = 0;
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth += 1;
      setDragging(true);
    };
    const onOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setDragging(false);
      if (e.dataTransfer) void collectDrop(e.dataTransfer).then(enqueue);
    };
    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragover', onOver);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [phase, enqueue]);

  // Sekme kapanırsa yarım kalan yükleme kaybolur — uyar.
  useEffect(() => {
    const onBefore = (e: BeforeUnloadEvent) => {
      if (rowsRef.current.some((r) => r.status === 'queued' || r.status === 'uploading')) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, []);

  // Ortak üst bar: marka + dil; panele bağlantı YOK (D20).
  const header = (right?: ReactNode) => (
    <Header lang={lang} langs={LANGS} langLabel={(l) => LANG_LABEL[l]} onLang={changeLang} languageName={t('langLabel')} right={right} />
  );
  // Kod / etkinlik seçimi: üst bar + ortada tek kart.
  const centered = (children: ReactNode) => (
    <div style={PAGE}>
      {header()}
      <div className="centered" style={FILL}>
        <div className="card">{children}</div>
      </div>
    </div>
  );

  const counts = rows.reduce(
    (acc, r) => {
      acc[r.status] += 1;
      return acc;
    },
    { queued: 0, uploading: 0, done: 0, exists: 0, failed: 0, skipped: 0 },
  );
  const total = rows.length - counts.skipped;
  const finished = counts.done + counts.exists;

  if (phase === 'checking') return centered(<p className="muted">{t('upChecking')}</p>);

  if (phase === 'pair') {
    return centered(
      <>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 26, margin: '0 0 6px' }}>{t('upTitle')}</h1>
        {repair && (
          <p className="banner private" role="status" style={{ margin: '10px 0 4px', textAlign: 'left' }} data-repair-notice>
            {t('upRepair')}
          </p>
        )}
        {OPENED_FROM_PHONE_QR && (
          <p className="muted" style={{ color: 'var(--gold)', margin: '0 0 10px' }}>
            {t('upQrFromPhone')}
          </p>
        )}
        {QR_PAIRING && !OPENED_FROM_PHONE_QR && (
          <>
            <QrPairing t={t} onPaired={finishPairing} />
            <p className="muted" style={{ textAlign: 'center', margin: '14px 0 0' }}>
              {t('upQrOr')}
            </p>
          </>
        )}
        <p className="muted">{t('upPairIntro')}</p>
        <input
          className="field"
          style={{ marginTop: 16, textAlign: 'center', letterSpacing: 6, fontSize: 24, textTransform: 'uppercase' }}
          value={code}
          maxLength={6}
          autoFocus
          placeholder="ABC123"
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && void pair()}
        />
        {pairError && (
          <p className="muted" style={{ color: 'var(--danger)', marginTop: 8 }}>
            {pairError}
          </p>
        )}
        <button className="btn" style={{ marginTop: 12 }} disabled={pairing || code.replace(/[^A-Z0-9]/g, '').length !== 6} onClick={() => void pair()}>
          {pairing ? t('upPairing') : t('upPairCta')}
        </button>
        <p className="muted" style={{ marginTop: 14, fontSize: 12.5 }}>
          {t('upPairHelp')}
        </p>
      </>,
    );
  }

  if (phase === 'events' || !event) {
    return centered(
      <>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, margin: '0 0 6px' }}>{t('upPickEvent')}</h1>
        {email && (
          <p className="muted" style={{ fontSize: 13, margin: '0 0 4px', overflowWrap: 'anywhere' }} data-signed-in-as>
            {t('upSignedInAs').replace('{email}', email)}
          </p>
        )}
        {events.length === 0 && <p className="muted">{t('upNoEvents')}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {events.map((e) => (
            <button
              key={e.id}
              className="btn ghost"
              style={{ justifyContent: 'space-between', textAlign: 'left' }}
              onClick={() => pickEvent(e)}
            >
              <span>
                {e.name}
                <span className="muted" style={{ display: 'block', fontSize: 12 }}>
                  {e.code} · {PLAN_LABEL[e.planId] ?? e.planId} · {e.photoCount} {t('photos')}
                </span>
              </span>
              <span>→</span>
            </button>
          ))}
          <details className="new-event">
            <summary>+ {t('upNewEvent')}</summary>
            <p className="muted" style={{ margin: '8px 0 6px', fontSize: 14 }}>{t('upNewEventHelp')}</p>
            <a href="https://apps.apple.com/app/id6801534049" style={{ fontSize: 14, fontWeight: 600 }}>
              {t('getApp')} →
            </a>
          </details>
        </div>
        <button className="chip" style={{ marginTop: 16 }} onClick={() => void forget()}>
          {t('upSignOut')}
        </button>
      </>,
    );
  }

  return (
    <>
      {dragging && (
        <div className="dropzone" aria-hidden>
          <div>{t('upDropHere')}</div>
        </div>
      )}
      {header(
        <button className="chip" onClick={() => pickEvent(null)}>
          {t('upSwitchEvent')}
        </button>,
      )}
      <div className="hero">
        <h1>{event.name}</h1>
        <p className="date">
          {event.code} · {t('upLiveCount').replace('{n}', String(liveCount ?? event.photoCount))}
        </p>
      </div>
      <div className="wrap">
        <div
          className="card"
          style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', borderStyle: 'dashed', padding: '36px 24px' }}
        >
          <p style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: 0 }}>{t('upDropTitle')}</p>
          <p className="muted">{t('upDropBody')}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14 }}>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { enqueue(Array.from(e.currentTarget.files ?? [])); e.currentTarget.value = ''; }} />
            <input ref={dirRef} type="file" multiple hidden {...({ webkitdirectory: '' } as Record<string, string>)} onChange={(e) => { enqueue(Array.from(e.currentTarget.files ?? [])); e.currentTarget.value = ''; }} />
            <button className="btn" style={{ width: 'auto' }} onClick={() => dirRef.current?.click()}>
              <IconPlus /> {t('addFolder')}
            </button>
            <button className="btn ghost" style={{ width: 'auto' }} onClick={() => fileRef.current?.click()}>
              {t('upAddPhotos')}
            </button>
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: 14 }}>
            {t('upFormats')}
          </p>
        </div>

        {rows.length > 0 && (
          <div className="card" style={{ maxWidth: 720, margin: '14px auto 0' }}>
            <div className="queue-summary">
              {t('uploadedCount').replace('{done}', String(finished)).replace('{total}', String(total))}
              {counts.exists > 0 && ` · ${t('upAlreadyThere').replace('{n}', String(counts.exists))}`}
              {counts.failed > 0 && ` · ${t('upFailed').replace('{n}', String(counts.failed))}`}
              {counts.skipped > 0 && ` · ${t('upSkipped').replace('{n}', String(counts.skipped))}`}
            </div>
            <div className="queue" style={{ marginTop: 10 }}>
              {[...rows.filter((r) => r.status === 'failed' || r.status === 'skipped'), ...rows.filter((r) => r.status === 'uploading'), ...rows.filter((r) => r.status === 'queued')]
                .slice(0, VISIBLE_ROWS)
                .map((r) => (
                  <div key={r.id} className={`queue-row${r.status === 'failed' ? ' failed' : ''}`}>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.file.name}</span>
                    {r.status === 'failed' || r.status === 'skipped' ? (
                      <span style={{ color: r.status === 'failed' ? 'var(--danger)' : 'var(--ink-soft)' }}>{r.note}</span>
                    ) : (
                      <>
                        <span className="bar" style={{ maxWidth: 160 }}>
                          <i style={{ width: `${Math.round(r.progress * 100)}%` }} />
                        </span>
                        <span style={{ width: 34, textAlign: 'right' }}>{Math.round(r.progress * 100)}%</span>
                      </>
                    )}
                  </div>
                ))}
              {counts.queued + counts.uploading > VISIBLE_ROWS && (
                <div className="queue-more">{t('moreWaiting').replace('{n}', String(counts.queued + counts.uploading - VISIBLE_ROWS))}</div>
              )}
            </div>
            {counts.failed > 0 && (
              <button className="chip" style={{ marginTop: 10 }} onClick={retryFailed}>
                {t('retry')}
              </button>
            )}
            {counts.queued + counts.uploading > 0 && (
              <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
                {t('upKeepOpen')}
              </p>
            )}
          </div>
        )}

        <p className="footnote" style={{ marginTop: 24 }}>
          <button className="chip" onClick={() => void forget()}>
            {t('upSignOut')}
          </button>
        </p>
      </div>
    </>
  );
}
