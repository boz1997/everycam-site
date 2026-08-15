import { useEffect } from 'react';
import type { EventDoc, MediaDoc } from '../types';
import { IconDownload, IconHeart } from './Brand';

interface Props {
  event: EventDoc;
  media: MediaDoc[];
  index: number;
  t: (k: string) => string;
  onClose: () => void;
  onIndex: (i: number) => void;
  onLike: (m: MediaDoc) => void;
}

export function Lightbox({ event, media, index, t, onClose, onIndex, onLike }: Props) {
  const item = media[index];

  // Klavye: masaüstünde kapatma ve gezinme. Dokunmatikte alt bar zaten var.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index < media.length - 1) onIndex(index + 1);
      if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, media.length, onClose, onIndex]);

  if (!item) return null;

  // İndirme host ayarına bağlı (guestCanDownload). Kapalıysa düğme hiç
  // gösterilmez — çalışmayan düğme, olmayan düğmeden kötüdür.
  const canDownload = event.guestCanDownload;

  return (
    <div className="lightbox" role="dialog" aria-modal="true">
      <div className="lightbox-bar">
        <button className="icon-btn" onClick={onClose}>
          {t('close')}
        </button>
        <span className="lightbox-owner">{item.ownerName}</span>
      </div>

      <div className="lightbox-media" onClick={onClose}>
        {item.kind === 'video' ? (
          <video src={item.uri} controls autoPlay playsInline onClick={(e) => e.stopPropagation()} />
        ) : (
          <img src={item.uri} alt="" onClick={(e) => e.stopPropagation()} />
        )}
      </div>

      <div className="lightbox-bar">
        <button className={`icon-btn${item.likedByMe ? ' on' : ''}`} onClick={() => onLike(item)}>
          <IconHeart filled={item.likedByMe} />
          {item.likeCount > 0 ? item.likeCount : ''}
        </button>
        {canDownload && (
          <a className="icon-btn" href={item.uri} target="_blank" rel="noreferrer" download>
            <IconDownload /> {t('save')}
          </a>
        )}
      </div>
    </div>
  );
}
