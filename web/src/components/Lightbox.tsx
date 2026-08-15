import { useEffect, useRef, useState } from 'react';
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

// Parmağın kare değiştirmek için kat etmesi gereken yatay mesafe. 44px iOS'un
// dokunma hedefi ölçüsü; daha küçüğü, fotoğrafa dokunup kapatmak isteyen eli
// yanlışlıkla sayfa çevirmeye başlatıyor.
const SWIPE_MIN_PX = 44;
// Yataylık şartı: dikey kaydırma niyeti (sayfayı kapatma/kaydırma) sayfa
// çevirmeye dönüşmesin.
const SWIPE_RATIO = 1.4;

export function Lightbox({ event, media, index, t, onClose, onIndex, onLike }: Props) {
  const item = media[index];
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = (delta: number) => {
    const next = index + delta;
    if (next >= 0 && next < media.length) onIndex(next);
  };

  // Klavye: masaüstünde gezinme. Dokunmatikte kaydırma var (aşağıda).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, media.length, onClose, onIndex]);

  // Kare değişince kaydetme durumunu sıfırla — önceki karenin hatası yenisinde durmasın.
  useEffect(() => {
    setSaving(false);
    setSaveError(false);
  }, [index]);

  if (!item) return null;

  // İndirme host ayarına bağlı (guestCanDownload). Kapalıysa düğme hiç
  // gösterilmez — çalışmayan düğme, olmayan düğmeden kötüdür.
  const canDownload = event.guestCanDownload;

  // KAYDET — telefona gerçekten kaydeder.
  //
  // Eskiden `<a href={uri} download>` idi ve TELEFONDA HİÇ ÇALIŞMIYORDU: `download`
  // özniteliği ÇAPRAZ KAYNAKTA yok sayılır (dosya firebasestorage.googleapis.com'da,
  // sayfa github.io'da), o yüzden Safari kaydetmek yerine görseli yeni sekmede
  // açıyordu. Doğrusu baytları alıp paylaşım sayfasına vermek:
  //   · mobil  → navigator.share(files) → iOS/Android'in kendi "Fotoğraflara Kaydet"i
  //   · masaüstü → blob URL + <a download> (aynı kaynak olduğu için burada çalışır)
  // Kova CORS'u bu okuma için açıldı (yalnız kendi origin'lerimize, GET/HEAD).
  const save = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(false);
    const ext = item.kind === 'video' ? 'mp4' : 'jpg';
    const name = `${event.name || 'sharecam'}-${item.id.slice(0, 8)}.${ext}`.replace(/[/\\?%*:|"<>]/g, '-');
    try {
      const res = await fetch(item.uri);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const file = new File([blob], name, { type: blob.type || 'image/jpeg' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Bir sonraki tick'te bırak: hemen revoke edilirse indirme başlamadan iptal olur.
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }
    } catch (e) {
      // Kullanıcı paylaşım sayfasını kapatırsa AbortError gelir — bu hata değil.
      if (!(e instanceof DOMException && e.name === 'AbortError')) setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lightbox" role="dialog" aria-modal="true">
      <div className="lightbox-bar">
        <button className="icon-btn" onClick={onClose}>
          {t('close')}
        </button>
        <span className="lightbox-owner">{item.ownerName}</span>
        <span className="lightbox-count">
          {index + 1} / {media.length}
        </span>
      </div>

      {/* Sağa/sola kaydırarak gezinme — uygulamadaki lightbox da yatay sayfalanıyor.
          Dokunma olayları KAPSAYICIDA: <img> üzerinde olsaydı, resmin dışına taşan
          parmak hareketi yarıda kesiliyordu. */}
      <div
        className="lightbox-media"
        onClick={onClose}
        onTouchStart={(e) => {
          const p = e.touches[0];
          touch.current = { x: p.clientX, y: p.clientY };
        }}
        onTouchEnd={(e) => {
          const start = touch.current;
          touch.current = null;
          if (!start) return;
          const p = e.changedTouches[0];
          const dx = p.clientX - start.x;
          const dy = p.clientY - start.y;
          if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * SWIPE_RATIO) return;
          // Kaydırma kareyi değiştirdiyse onClick'in kapatmasını engelle.
          e.stopPropagation();
          go(dx < 0 ? 1 : -1);
        }}
      >
        {item.kind === 'video' ? (
          <video src={item.uri} controls autoPlay playsInline onClick={(e) => e.stopPropagation()} />
        ) : (
          <img src={item.uri} alt="" draggable={false} onClick={(e) => e.stopPropagation()} />
        )}

        {/* Masaüstünde ok düğmeleri; dokunmatikte kaydırma zaten var. */}
        {index > 0 && (
          <button
            className="lightbox-nav prev"
            aria-label={t('prev')}
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
          >
            ‹
          </button>
        )}
        {index < media.length - 1 && (
          <button
            className="lightbox-nav next"
            aria-label={t('next')}
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
          >
            ›
          </button>
        )}
      </div>

      <div className="lightbox-bar">
        <button className={`icon-btn${item.likedByMe ? ' on' : ''}`} onClick={() => onLike(item)}>
          <IconHeart filled={item.likedByMe} />
          {item.likeCount > 0 ? item.likeCount : ''}
        </button>
        {canDownload && (
          <button className="icon-btn" onClick={save} disabled={saving}>
            <IconDownload /> {saving ? t('saving') : saveError ? t('saveFailed') : t('save')}
          </button>
        )}
      </div>
    </div>
  );
}
