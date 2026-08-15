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
          {m.kind === 'video' ? (
            <>
              {/* poster yok: ilk kareyi tarayıcı çizsin diye metadata yüklenir */}
              <video src={m.uri} preload="metadata" muted playsInline />
              <span className="tile-video">
                <IconPlay />
              </span>
            </>
          ) : (
            <img src={m.uri} alt="" loading="lazy" />
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
