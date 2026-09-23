// ÇİFTİN ALBÜM SAYFASI — sharecam.app/album (21 Eyl 2026).
//
// Fotoğrafçı (host) uygulamada tek kullanımlık "sahip kodu" üretir, çifte verir.
// Çift burada kodu girer → bu tarayıcının ANONİM oturumu etkinlikte `role:'owner'`
// misafir olur (functions/src/ownerAccess.ts; custom token yok, host değil).
// Sahip: tam albümü sayfalı görür, tek tek kaydeder ve HEPSİNİ parçalı ZIP olarak
// indirir — 2048px (paylaşım) ve orijinal (tam çözünürlük). Parçalar sunucuda
// sırayla üretilir (createAlbumArchive), hazır olanlar listelenir; linkler 7 gün.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, ensureAnon } from '../firebase';
import { listMediaPage } from '../events';
import { detectLang, LANG_LABEL, LANGS, makeT, saveLang, type Lang } from '../i18n';
import type { EventDoc, MediaDoc } from '../types';
import { Gallery } from '../components/Gallery';
import { Lightbox } from '../components/Lightbox';

const OWNER_KEY = 'sharecam.ownerEvent'; // { eventId, uid } — hızlı devam
type Kind = 'display' | 'original';
interface Part { part: number; parts: number; url: string; count: number }

function readOwner(): { eventId: string; uid: string } | null {
  try {
    const raw = localStorage.getItem(OWNER_KEY);
    return raw ? (JSON.parse(raw) as { eventId: string; uid: string }) : null;
  } catch {
    return null;
  }
}

async function loadEvent(eventId: string): Promise<EventDoc | null> {
  const snap = await getDoc(doc(db, 'events', eventId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    code: String(d.code ?? ''),
    name: String(d.name ?? ''),
    date: (d.date as string | null) ?? null,
    coverUri: (d.coverUri as string | null) ?? null,
    mode: d.mode === 'private' ? 'private' : 'open',
    joinPaused: d.joinPaused === true,
    guestCanDownload: true, // sahip her zaman kaydeder
    aiPeopleEnabled: d.aiPeopleEnabled === true,
    hostId: String(d.hostId ?? ''),
    activeGuestCount: Number(d.activeGuestCount ?? 0),
    photoCount: Number(d.photoCount ?? 0),
    videoCount: Number(d.videoCount ?? 0),
    planId: String(d.planId ?? 'spark'),
    uploadPolicy: d.uploadPolicy === 'host' ? 'host' : 'all',
  };
}

export function AlbumApp() {
  const [lang, setLang] = useState<Lang>(() => detectLang());
  const t = useMemo(() => makeT(lang), [lang]);
  useEffect(() => {
    document.title = `${t('alTitle')} — Sharecam`;
  }, [t]);
  const [phase, setPhase] = useState<'checking' | 'pair' | 'album'>('checking');
  const [uid, setUid] = useState('');
  const [code, setCode] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [pairing, setPairing] = useState(false);
  const [pairError, setPairError] = useState('');
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [media, setMedia] = useState<MediaDoc[]>([]);
  const [next, setNext] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [archives, setArchives] = useState<Record<Kind, { running: boolean; parts: Part[]; total: number; error: string }>>({
    display: { running: false, parts: [], total: 0, error: '' },
    original: { running: false, parts: [], total: 0, error: '' },
  });

  const changeLang = (next: Lang) => {
    setLang(next);
    saveLang(next);
  };

  const enter = useCallback(async (eventId: string, ownerUid: string) => {
    const ev = await loadEvent(eventId);
    if (!ev) {
      setPhase('pair');
      return;
    }
    setUid(ownerUid);
    setEvent(ev);
    setPhase('album');
    setLoading(true);
    const page = await listMediaPage(eventId, null).catch(() => ({ items: [], next: null }));
    setMedia(page.items);
    setNext(page.next);
    setDone(page.next === null);
    setLoading(false);
  }, []);

  // Açılış: bu tarayıcı daha önce sahip olduysa doğrudan albüm; ?code= varsa kod dolu.
  useEffect(() => {
    void (async () => {
      const anonUid = await ensureAnon().catch(() => '');
      const stored = readOwner();
      const urlCode = new URLSearchParams(location.search).get('code');
      if (stored && anonUid && stored.uid === anonUid && !urlCode) {
        // Rol hâlâ duruyor mu (host silmiş olabilir)? Kural: kendi guest kaydını okur.
        const g = await getDoc(doc(db, 'events', stored.eventId, 'guests', anonUid)).catch(() => null);
        if (g?.exists() && g.get('role') === 'owner' && g.get('banned') !== true) {
          await enter(stored.eventId, anonUid);
          return;
        }
      }
      if (urlCode) setCode(urlCode.toUpperCase());
      setPhase('pair');
    })();
  }, [enter]);

  const pair = async () => {
    const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (clean.length !== 6) return;
    setPairing(true);
    setPairError('');
    try {
      const anonUid = await ensureAnon();
      const fn = httpsCallable<{ code: string; name: string }, { eventId: string }>(getFunctions(db.app, 'europe-west3'), 'redeemOwnerCode');
      const res = await fn({ code: clean, name: ownerName.trim() });
      try {
        localStorage.setItem(OWNER_KEY, JSON.stringify({ eventId: res.data.eventId, uid: anonUid }));
      } catch {
        /* özel pencere */
      }
      history.replaceState(null, '', location.pathname);
      await enter(res.data.eventId, anonUid);
    } catch (e) {
      const msg = String((e as { message?: string })?.message ?? '') + String((e as { code?: string })?.code ?? '');
      setPairError(/not-found/.test(msg) ? t('alCodeNotFound') : /expired/.test(msg) ? t('alCodeExpired') : /used/.test(msg) ? t('alCodeUsed') : t('upCodeError'));
    } finally {
      setPairing(false);
    }
  };

  const loadMore = async () => {
    if (!event || loading || done) return;
    setLoading(true);
    const page = await listMediaPage(event.id, next).catch(() => ({ items: [], next: null }));
    setMedia((rows) => [...rows, ...page.items]);
    setNext(page.next);
    setDone(page.next === null);
    setLoading(false);
  };

  // Parçaları SIRAYLA iste: her çağrı bir parça üretir (ya da önbellekten döner).
  // Her parça hazır oldukça listelenir; büyük albümde çift sayfada bekler.
  const buildArchive = async (kind: Kind) => {
    if (!event) return;
    setArchives((a) => ({ ...a, [kind]: { running: true, parts: [], total: 0, error: '' } }));
    const fn = httpsCallable<{ eventId: string; kind: Kind; part: number }, Part & { total: number }>(getFunctions(db.app, 'europe-west3'), 'createAlbumArchive', { timeout: 540_000 });
    try {
      let part = 0;
      let parts = 1;
      while (part < parts) {
        const res = await fn({ eventId: event.id, kind, part });
        parts = res.data.parts;
        const p: Part = { part: res.data.part, parts, url: res.data.url, count: res.data.count };
        setArchives((a) => ({ ...a, [kind]: { ...a[kind], parts: [...a[kind].parts, p], total: res.data.total } }));
        part += 1;
      }
      setArchives((a) => ({ ...a, [kind]: { ...a[kind], running: false } }));
    } catch (e) {
      setArchives((a) => ({ ...a, [kind]: { ...a[kind], running: false, error: String((e as { message?: string })?.message ?? 'error') } }));
    }
  };

  const langPicker = (
    <select className="lang" value={lang} onChange={(e) => changeLang(e.target.value as Lang)} aria-label={t('langLabel')}>
      {LANGS.map((l) => (
        <option key={l} value={l}>
          {LANG_LABEL[l]}
        </option>
      ))}
    </select>
  );

  if (phase === 'checking') {
    return (
      <div className="centered">
        <div className="card">
          <p className="muted">{t('upChecking')}</p>
        </div>
      </div>
    );
  }

  if (phase === 'pair' || !event) {
    return (
      <div className="centered">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>ShareCam</strong>
            {langPicker}
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 26, margin: '14px 0 6px' }}>{t('alTitle')}</h1>
          <p className="muted">{t('alPairIntro')}</p>
          <input className="field" style={{ marginTop: 14 }} value={ownerName} placeholder={t('alNamePlaceholder')} onChange={(e) => setOwnerName(e.target.value)} />
          <input
            className="field"
            style={{ marginTop: 10, textAlign: 'center', letterSpacing: 6, fontSize: 24, textTransform: 'uppercase' }}
            value={code}
            maxLength={6}
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
            {pairing ? t('upPairing') : t('alPairCta')}
          </button>
          <p className="muted" style={{ marginTop: 14, fontSize: 12.5 }}>
            {t('alPairHelp')}
          </p>
        </div>
      </div>
    );
  }

  const archiveBlock = (kind: Kind) => {
    const a = archives[kind];
    return (
      <div className="card" style={{ marginTop: 10 }}>
        <strong>{t(kind === 'display' ? 'alZipDisplay' : 'alZipOriginal')}</strong>
        <p className="muted" style={{ marginTop: 4 }}>{t(kind === 'display' ? 'alZipDisplaySub' : 'alZipOriginalSub')}</p>
        {a.parts.length === 0 && !a.running && (
          <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => void buildArchive(kind)}>
            {t('alPrepare')}
          </button>
        )}
        {a.running && (
          <p className="muted" style={{ marginTop: 10 }}>
            {t('alPreparing').replace('{done}', String(a.parts.length)).replace('{total}', String(a.parts[0]?.parts ?? '…'))}
          </p>
        )}
        {a.error && (
          <p className="muted" style={{ color: 'var(--danger)', marginTop: 8 }}>
            {t('alZipError')}
          </p>
        )}
        {a.parts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {a.parts.map((p) => (
              <a key={p.part} className="btn ghost" href={p.url} download style={{ justifyContent: 'space-between' }}>
                <span>{t('alPart').replace('{n}', String(p.part + 1)).replace('{of}', String(p.parts))}</span>
                <span className="muted">{p.count} {t('photos')}</span>
              </a>
            ))}
            {!a.running && (
              <p className="muted" style={{ fontSize: 12 }}>
                {t('alLinksValid')}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header>
        <span className="brand" style={{ fontFamily: 'var(--serif)' }}>
          ShareCam
        </span>
        {langPicker}
      </header>
      {event.coverUri && (
        <div className="cover">
          <img src={event.coverUri} alt="" />
        </div>
      )}
      <div className="hero">
        <h1>{event.name}</h1>
        <p className="date">{t('alOwnerBanner').replace('{n}', String(event.photoCount))}</p>
      </div>
      <div className="wrap">
        <div className="card">
          <strong style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{t('alDownloadAll')}</strong>
          <p className="muted" style={{ marginTop: 4 }}>{t('alDownloadIntro')}</p>
          {archiveBlock('display')}
          {archiveBlock('original')}
        </div>
        {event.aiPeopleEnabled && (
          <a className="facecta" style={{ marginTop: 14 }} href={`../../face/?code=${encodeURIComponent(event.code)}`}>
            <strong>{t('findMyPhotos')}</strong>
            <span>{t('findMyPhotosSub')}</span>
          </a>
        )}
        <div style={{ marginTop: 14 }}>
          <Gallery event={event} uid={uid} media={media} t={t} onOpen={setLightbox} />
          {!done && (
            <button className="btn ghost" style={{ marginTop: 12 }} disabled={loading} onClick={() => void loadMore()}>
              {loading ? t('loading') : t('loadMore')}
            </button>
          )}
        </div>
      </div>
      {lightbox !== null && (
        <Lightbox event={event} media={media} index={lightbox} t={t} onClose={() => setLightbox(null)} onIndex={setLightbox} />
      )}
    </>
  );
}
