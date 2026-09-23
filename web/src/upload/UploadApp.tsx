// FOTOĞRAFÇININ MASAÜSTÜ YÜKLEYİCİSİ — sharecam.app/upload (21 Eyl 2026).
//
// Akış: uygulamadaki 6 haneli kod → redeemUploadCode → host custom token →
// bu tarayıcı HOST olur (kalıcı) → etkinlik seç → klasörü bırak → orijinaller
// 4 paralel kanaldan Storage'a; sunucu 2048px kopya + thumb üretip galeriye
// düşürür. Sayfa medya dokümanı yazmaz, kural gevşetilmedi.
//
// Aynı origin'de (sharecam.app) misafir sayfasının anonim oturumu da yaşar;
// host olup olmadığımızı auth'a değil, eşleştirmede sakladığımız uid'e
// (localStorage) bakarak anlarız — misafir oturumu asla host sayılmaz.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, db } from '../firebase';
import { detectLang, LANG_LABEL, LANGS, makeT, saveLang, type Lang } from '../i18n';
import { asMedia, collectDrop, hasFiles } from '../intake';
import { fileSeed } from '../events';
import { originalVerdict, uploadOriginal, ORIGINAL_MAX_BYTES } from './originals';
import { IconPlus } from '../components/Brand';
import { QrPairing, type PairResult } from './QrPairing';

const HOST_KEY = 'sharecam.uploadHostUid';
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

function readHostUid(): string | null {
  try {
    return localStorage.getItem(HOST_KEY);
  } catch {
    return null;
  }
}

export function UploadApp() {
  const [lang, setLang] = useState<Lang>(() => detectLang());
  const t = useMemo(() => makeT(lang), [lang]);
  useEffect(() => {
    document.title = `${t('upTitle')} — Sharecam`;
  }, [t]);
  const [phase, setPhase] = useState<'checking' | 'pair' | 'events' | 'upload'>('checking');
  const [uid, setUid] = useState<string>('');
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

  // ---- Açılış: eşleşmiş host mu, yoksa kod mu bekliyoruz?
  const loadEvents = useCallback(async (hostUid: string, preferEventId?: string | null) => {
    const snap = await getDocs(query(collection(db, 'events'), where('hostId', '==', hostUid)));
    const list = toHostEvents(snap.docs);
    setEvents(list);
    const pre = preferEventId ? list.find((e) => e.id === preferEventId) : null;
    if (pre) {
      setEvent(pre);
      setPhase('upload');
    } else {
      setPhase('events');
    }
  }, []);

  // Etkinlik seçerken liste CANLI: fotoğrafçı uygulamada yeni etkinlik açınca burada kendiliğinden belirir.
  useEffect(() => {
    if (phase !== 'events' || !uid) return;
    return onSnapshot(query(collection(db, 'events'), where('hostId', '==', uid)), (snap) => setEvents(toHostEvents(snap.docs)));
  }, [phase, uid]);

  useEffect(() => {
    void (async () => {
      await auth.authStateReady();
      const stored = readHostUid();
      const urlCode = new URLSearchParams(location.search).get('code');
      if (stored && auth.currentUser?.uid === stored && !urlCode) {
        setUid(stored);
        await loadEvents(stored);
        return;
      }
      if (urlCode) setCode(urlCode.toUpperCase());
      setPhase('pair');
    })();
  }, [loadEvents]);

  // ---- Eşleştirmenin son adımı (kod da QR da buraya iner): custom token → host oturumu
  const finishPairing = useCallback(
    async (res: PairResult) => {
      await signInWithCustomToken(auth, res.token);
      try {
        localStorage.setItem(HOST_KEY, res.hostId);
      } catch {
        /* özel pencere: oturum yine de bu sekmede geçerli */
      }
      setUid(res.hostId);
      history.replaceState(null, '', location.pathname);
      await loadEvents(res.hostId, res.eventId);
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
      const fn = httpsCallable<{ code: string }, { token: string; eventId: string; hostId: string }>(
        getFunctions(auth.app, 'europe-west3'),
        'redeemUploadCode',
      );
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

  const forget = async () => {
    try {
      localStorage.removeItem(HOST_KEY);
    } catch {
      /* yok say */
    }
    await signOut(auth).catch(() => undefined);
    setUid('');
    setEvent(null);
    setEvents([]);
    setPhase('pair');
  };

  // ---- Seçili etkinliğin canlı sayacı: "galeride kaç kare var" (tek doküman)
  useEffect(() => {
    if (!event) return;
    return onSnapshot(doc(db, 'events', event.id), (snap) => setLiveCount(Number(snap.get('photoCount') ?? 0)));
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

  const langPicker = (
    <select className="lang" value={lang} onChange={(e) => changeLang(e.target.value as Lang)} aria-label={t('langLabel')}>
      {LANGS.map((l) => (
        <option key={l} value={l}>
          {LANG_LABEL[l]}
        </option>
      ))}
    </select>
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

  if (phase === 'checking') {
    return (
      <div className="centered">
        <div className="card">
          <p className="muted">{t('upChecking')}</p>
        </div>
      </div>
    );
  }

  if (phase === 'pair') {
    return (
      <div className="centered">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>Sharecam</strong>
            {langPicker}
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 26, margin: '14px 0 6px' }}>{t('upTitle')}</h1>
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
        </div>
      </div>
    );
  }

  if (phase === 'events' || !event) {
    return (
      <div className="centered">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>Sharecam</strong>
            {langPicker}
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, margin: '14px 0 6px' }}>{t('upPickEvent')}</h1>
          {events.length === 0 && <p className="muted">{t('upNoEvents')}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {events.map((e) => (
              <button
                key={e.id}
                className="btn ghost"
                style={{ justifyContent: 'space-between', textAlign: 'left' }}
                onClick={() => {
                  setEvent(e);
                  setPhase('upload');
                }}
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
        </div>
      </div>
    );
  }

  return (
    <>
      {dragging && (
        <div className="dropzone" aria-hidden>
          <div>{t('upDropHere')}</div>
        </div>
      )}
      <header>
        <span className="brand" style={{ fontFamily: 'var(--serif)' }}>
          Sharecam
        </span>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="chip" onClick={() => setPhase('events')}>
            {t('upSwitchEvent')}
          </button>
          {langPicker}
        </span>
      </header>
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
