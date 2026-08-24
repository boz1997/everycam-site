import { useCallback, useEffect, useRef, useState } from 'react';
import { ensureAnon } from './firebase';
import { getByCode, isBanned, joinEvent, normalizeCode, subscribeMedia, toggleLike } from './events';
import { errorCode } from './errorLog';
import { detectLang, LANGS, LANG_LABEL, makeT, saveLang, type Lang } from './i18n';
import type { EventDoc, MediaDoc } from './types';
import { Brand, IconStack, Spinner } from './components/Brand';
import { Gallery } from './components/Gallery';
import { Lightbox } from './components/Lightbox';
import { Uploader } from './components/Uploader';

// Misafir web istemcisi. Uygulamanın guest akışının tarayıcı karşılığı:
// kod → isim → galeri + yükleme. Host yüzeyi (ayarlar, paket, moderasyon)
// BİLEREK yok — o iş uygulamada.

type Phase = 'loading' | 'needCode' | 'needName' | 'blocked' | 'notFound' | 'ready';

const NAME_KEY = 'sharecam.name';
const APP_STORE_URL = 'https://apps.apple.com/app/id6801534049';

/** Kod hem ?code=ABC123 hem /e/ABC123 biçiminde gelebilir (404.html yönlendiriyor). */
function codeFromUrl(): string {
  const q = new URLSearchParams(window.location.search).get('code');
  if (q) return normalizeCode(q);
  const m = window.location.pathname.match(/\/e\/([A-Za-z0-9]{4,8})\/?$/);
  return m ? normalizeCode(m[1]) : '';
}

export default function App() {
  const [lang, setLang] = useState<Lang>(detectLang);
  const t = makeT(lang);

  const [phase, setPhase] = useState<Phase>('loading');
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [uid, setUid] = useState('');
  const [media, setMedia] = useState<MediaDoc[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) ?? '');
  const [notice, setNotice] = useState('');
  // Teşhis için: yalnız gerçek bir hata kodu varsa görünür, normal akışta boş.
  const [errCode, setErrCode] = useState('');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const changeLang = (next: Lang) => {
    setLang(next);
    saveLang(next);
  };

  /** Kodu çözüp etkinliği bulur; isim yoksa isim ekranında durur. */
  const openCode = useCallback(async (code: string) => {
    if (!code) {
      setPhase('needCode');
      return;
    }
    setPhase('loading');
    setNotice('');
    setErrCode('');
    try {
      // ensureAnon reddi bir BAĞLANTI sorunudur, "böyle bir etkinlik yok" değil.
      // Ayrı yakalanmazsa geçerli bir QR koduna "Etkinlik bulunamadı" deniyordu.
      let userId: string;
      try {
        userId = await ensureAnon();
      } catch (e) {
        setNotice(t('joinError'));
        setErrCode(errorCode(e));
        setPhase('blocked');
        return;
      }
      setUid(userId);
      const ev = await getByCode(code);
      if (!ev) {
        setPhase('notFound');
        return;
      }
      setEvent(ev);
      if (await isBanned(ev.id, userId)) {
        setNotice(t('banned'));
        setPhase('blocked');
        return;
      }
      setPhase('needName');
    } catch {
      setPhase('notFound');
    }
    // t dilden türüyor; dil değişince yeniden kurmaya gerek yok
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void openCode(codeFromUrl());
    return () => unsubRef.current?.();
  }, [openCode]);

  /** İsim onaylandı: kaydı aç ve galeriyi dinlemeye başla. */
  async function confirmName() {
    if (!event) return;
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNotice(t('nameRequired'));
      return;
    }
    localStorage.setItem(NAME_KEY, trimmed);
    setPhase('loading');
    setNotice('');

    // uid'yi joinEvent'ten GERİ ALIYORUZ: oturum ölmüşse orada yenisi açılıyor ve
    // galeri aboneliği ile yükleyici o yeni kimlikle çalışmak zorunda. Eskiden
    // buradaki donmuş uid ile devam ediliyordu.
    const { result, uid: liveUid, code } = await joinEvent(event, trimmed).catch((e) => ({
      result: 'error' as const,
      uid: '',
      code: errorCode(e),
    }));
    // Boş uid'yi state'e YAZMA: kimlik alınamadıysa eski uid hiç yoktan iyidir.
    if (liveUid) setUid(liveUid);
    if (result !== 'ok') {
      setNotice(t(result === 'error' ? 'joinError' : result));
      setErrCode(code ?? '');
      setPhase('blocked');
      return;
    }

    unsubRef.current?.();
    unsubRef.current = subscribeMedia(event, liveUid, setMedia, () => setMedia([]));
    setPhase('ready');
  }

  const onLike = async (m: MediaDoc) => {
    if (!event) return;
    // İyimser güncelleme: beğeni dokunuşu anında görünmeli, sunucu turunu
    // beklemek "çalışmadı" hissi veriyor. Akış zaten birazdan doğrusunu yazacak.
    setMedia((rows) =>
      rows.map((r) =>
        r.id === m.id ? { ...r, likedByMe: !r.likedByMe, likeCount: r.likeCount + (r.likedByMe ? -1 : 1) } : r,
      ),
    );
    await toggleLike(event.id, m.id, uid, m.likedByMe).catch(() => undefined);
  };

  const langPicker = (
    <select className="lang-select" value={lang} onChange={(e) => changeLang(e.target.value as Lang)} aria-label="Language">
      {LANGS.map((l) => (
        <option key={l} value={l}>
          {LANG_LABEL[l]}
        </option>
      ))}
    </select>
  );

  const footer = (
    <div className="footnote">
      <p>{t('appPitch')}</p>
      <a href={APP_STORE_URL}>{t('getApp')} →</a>
    </div>
  );

  if (phase === 'loading') {
    return (
      <div className="centered">
        <Brand />
        <Spinner />
        <p className="muted">{t('joining')}</p>
      </div>
    );
  }

  if (phase === 'needCode' || phase === 'notFound') {
    const bad = phase === 'notFound';
    return (
      <div className="centered">
        <div className="card">
          <Brand />
          <h1 style={{ fontSize: 24, marginTop: 20 }}>{t('enterCode')}</h1>
          <p className="muted">{t('codeHint')}</p>
          <input
            className="field code"
            style={{ marginTop: 20 }}
            value={codeInput}
            onChange={(e) => setCodeInput(normalizeCode(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void openCode(codeInput);
            }}
            placeholder={t('codePlaceholder')}
            maxLength={6}
            autoFocus
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
          />
          {bad && <p className="error-text">{t('notFound')}</p>}
          <button
            className="btn"
            style={{ marginTop: 14 }}
            disabled={codeInput.length < 4}
            onClick={() => void openCode(codeInput)}
          >
            {t('go')}
          </button>
        </div>
        {footer}
      </div>
    );
  }

  if (phase === 'needName' && event) {
    return (
      <div className="centered">
        <div className="card">
          <Brand />
          <h1 style={{ fontSize: 24, marginTop: 20 }}>{event.name}</h1>
          <p className="muted">{t(event.mode === 'open' ? 'openBanner' : 'privateBanner')}</p>
          <label
            style={{ display: 'block', marginTop: 20, marginBottom: 7, fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)' }}
          >
            {t('yourName')}
          </label>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void confirmName();
            }}
            placeholder={t('namePlaceholder')}
            maxLength={30}
            autoFocus
          />
          {notice && <p className="error-text">{notice}</p>}
          <button className="btn" style={{ marginTop: 14 }} onClick={() => void confirmName()}>
            {t('join')}
          </button>
        </div>
        {footer}
      </div>
    );
  }

  if (phase === 'blocked') {
    return (
      <div className="centered">
        <Brand />
        <p className="muted" style={{ maxWidth: 320, fontSize: 15 }}>
          {notice}
        </p>
        {errCode && (
          <p className="muted" style={{ fontSize: 11, opacity: 0.65, marginTop: -6 }}>
            {errCode}
          </p>
        )}
        <button className="btn ghost" style={{ maxWidth: 260 }} onClick={() => setPhase('needCode')}>
          {t('tryAgain')}
        </button>
        {footer}
      </div>
    );
  }

  if (!event) return null;

  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <>
      <header className="topbar">
        <Brand small />
        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <span className="chip">
            <IconStack /> {media.length}
          </span>
          {langPicker}
        </span>
      </header>

      {event.coverUri && (
        <div className="cover">
          <img src={event.coverUri} alt="" />
        </div>
      )}

      <div className="hero">
        <h1>{event.name}</h1>
        {dateStr && <p className="date">{dateStr}</p>}
      </div>

      <div className={`banner${event.mode === 'private' ? ' private' : ''}`}>
        {t(event.mode === 'open' ? 'openBanner' : 'privateBanner')}
      </div>

      <div className="wrap">
        <Gallery event={event} uid={uid} media={media} t={t} onOpen={setLightbox} />
        {!event.guestCanDownload && (
          <p className="muted" style={{ textAlign: 'center', marginTop: 18 }}>
            {t('downloadOff')}
          </p>
        )}
        {footer}
      </div>

      <Uploader event={event} uid={uid} name={name.trim()} t={t} />

      {lightbox !== null && (
        <Lightbox
          event={event}
          media={media}
          index={lightbox}
          t={t}
          onClose={() => setLightbox(null)}
          onIndex={setLightbox}
          onLike={onLike}
        />
      )}
    </>
  );
}
