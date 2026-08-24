import type { EventDoc, MediaDoc } from '../types';
import { IconHeart, IconPlay, IconStack } from './Brand';

interface Props {
  event: EventDoc;
  uid: string;
  media: MediaDoc[];
  t: (k: string) => string;
  onOpen: (index: number) => void;
}

/**
 * Kare ızgarası. Gizli modda listede zaten YALNIZ kendi karelerimiz var
 * (sorgu öyle kuruldu, çünkü kural başkasınınkini okutmuyor) — bu yüzden
 * "YOU" rozeti yalnız açık galeride anlam taşıyor ve orada gösteriliyor.
 */
export function Gallery({ event, uid, media, t, onOpen }: Props) {
  if (media.length === 0) {
    const open = event.mode === 'open';
    return (
      <div className="empty">
        <div className="chip" style={{ marginBottom: 12 }}>
          <IconStack />
        </div>
        <h3>{t(open ? 'emptyOpenTitle' : 'emptyPrivateTitle')}</h3>
        <p>{t(open ? 'emptyOpenBody' : 'emptyPrivateBody')}</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {media.map((m, i) => (
        <button key={m.id} className="tile" onClick={() => onOpen(i)} aria-label={m.ownerName || 'photo'}>
          {/* IZGARA ASLI ÇEKMEZ (2026-08-24).
              Eskiden fotoğraf hücresi 2048px'lik aslın kendisini (~700 KB) indiriyordu
              ve video hücresi `preload="metadata"` ile mp4'e uzanıyordu. Yeni yüklemeler
              artık ~40 KB'lık bir ızgara karesi (`thumbUri`) taşıyor.
              ESKİ dokümanlarda bu alan YOK: fotoğraf eskisi gibi asla düşer (hiçbir kare
              kaybolmaz), video ise placeholder'da kalır — video için asla asla düşmüyoruz,
              çünkü kazanç bir önizleme, kayıp onlarca megabayt. */}
          {m.thumbUri ? (
            <img src={m.thumbUri} alt="" loading="lazy" />
          ) : m.kind === 'video' ? null : (
            <img src={m.uri} alt="" loading="lazy" />
          )}
          {m.kind === 'video' && (
            <span className="tile-video">
              <IconPlay />
            </span>
          )}
          {event.mode === 'open' && m.ownerId === uid && <span className="tile-badge">{t('you')}</span>}
          {m.likeCount > 0 && (
            <span className="tile-likes">
              <IconHeart filled /> {m.likeCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
