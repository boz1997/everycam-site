import { useEffect, useRef, useState } from 'react';
import { fileSeed, uploadOne, UploadError, VIDEO_MAX_BYTES } from '../events';
import { asMedia, collectDrop, hasFiles } from '../intake';
import type { EventDoc, UploadItem } from '../types';
import { IconPlus } from './Brand';

interface Props {
  event: EventDoc;
  uid: string;
  name: string;
  t: (k: string) => string;
}

// Kuyrukta AYNI ANDA çizilen satır sayısı (başarısızlar hariç). Bir klasör 800
// kare getirebiliyor; 800 <img> önizlemesi dock'u ekranın dışına taşırır ve
// hepsini birden çözmek belleği yer. Gerisi tek satır sayı olarak yazılır.
const VISIBLE_ROWS = 5;


/**
 * Alt yükleme çubuğu. Dosyalar SIRAYLA yüklenir — paralel yükleme düğün
 * wifi'ında bant genişliğini bölüp hepsini birden yavaşlatıyor ve ilerleme
 * çubuğunu anlamsızlaştırıyor.
 *
 * Başarısız olan satır kuyrukta KALIR ve tek dokunuşla tekrar denenir; sessizce
 * kaybolan yükleme, misafirin "yükledim sanmıştım" dediği durumdur.
 *
 * Üç giriş yolu, hepsi aynı kuyruğa: dosya seçici (her cihaz), klasör seçici
 * (yalnız masaüstü — iOS Safari `webkitdirectory` tanımaz) ve sayfanın
 * tamamına sürükle-bırak (dosya da klasör de, alt klasörler dahil).
 */
export function Uploader({ event, uid, name, t }: Props) {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [doneCount, setDoneCount] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dirRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  // Akan döngü kuyruğun O ANKİ hâlini görmek zorunda: yükleme sürerken seçilen
  // dosyalar da aynı turda ele alınacak. State tek başına yetmez, çünkü döngü
  // await'lerin arasında yaşıyor ve kendisini başlatan render'ın değerine
  // kilitli kalıyor.
  const queueRef = useRef<UploadItem[]>([]);
  // Bu oturumda kuyruğa girmiş her dosyanın imzası (bitmişler dahil): aynı
  // klasörü ikinci kez bırakmak yeniden yüklemesin.
  const seenRef = useRef<Set<string>>(new Set());
  // Klasör seçici yalnız masaüstünde: dokunmatik cihazda seçici ya açılmaz ya
  // da sıradan dosya seçiciye düşer — ikisi de "çalışmıyor" gibi görünür.
  const desktop = useRef(
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  ).current;

  const commit = (next: UploadItem[]) => {
    queueRef.current = next;
    setQueue(next);
  };
  const patch = (id: string, next: Partial<UploadItem>) =>
    commit(queueRef.current.map((it) => (it.id === id ? { ...it, ...next } : it)));
  const drop = (id: string) => commit(queueRef.current.filter((it) => it.id !== id));

  async function upload(item: UploadItem) {
    patch(item.id, { status: 'uploading', progress: 0, error: undefined });
    try {
      await uploadOne(event, uid, name, item.file, (p) => patch(item.id, { progress: p }));
      patch(item.id, { status: 'done', progress: 1 });
      setDoneCount((n) => n + 1);
      // Tamamlananı kısa süre sonra listeden düşür: galeri zaten canlı
      // güncelleniyor, kuyruk kalabalık kalmasın.
      setTimeout(() => {
        drop(item.id);
        URL.revokeObjectURL(item.previewUrl);
      }, 1200);
    } catch (e) {
      const reason =
        e instanceof UploadError && e.message === 'video-too-large'
          ? // Sayı metne GÖMÜLMEZ: tavan değişince dokuz dil de sessizce yalan söylerdi.
            t('videoTooLarge').replace('{max}', String(VIDEO_MAX_BYTES / 1048576))
          : e instanceof UploadError && e.message === 'quota-reached'
            ? t('quotaReached')
            : t('uploadFailed');
      patch(item.id, { status: 'failed', error: reason });
    }
  }

  /**
   * Sabit bir listeyi değil, kuyruğun kendisini tüketir.
   *
   * Eskiden `drain(items)` seçilen partiyi alıyor ve meşgulse hiçbir şey
   * yapmadan dönüyordu — yani ilk yükleme sürerken seçilen dosyalar sonsuza
   * kadar %0'da kalıyordu: satır ekranda duruyor, yükleme hiç başlamıyor,
   * hata da verilmiyor. Tek partide seçince görünmez, çünkü hepsi aynı dizide.
   */
  async function drain() {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      for (;;) {
        const next = queueRef.current.find((it) => it.status === 'queued');
        if (!next) break;
        await upload(next);
      }
    } finally {
      busyRef.current = false;
    }
  }

  function flash(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice((cur) => (cur === text ? null : cur)), 4000);
  }

  /** Üç giriş yolunun ortak ağzı: ele, imzayı kontrol et, sırala, kuyruğa al. */
  function enqueue(raw: File[]) {
    if (raw.length === 0) return;
    const fresh: File[] = [];
    for (const f of raw) {
      const media = asMedia(f);
      if (!media) continue;
      const seed = fileSeed(media);
      if (seenRef.current.has(seed)) continue;
      seenRef.current.add(seed);
      fresh.push(media);
    }
    if (fresh.length === 0) {
      // Hepsi elendiyse söyle: sessiz kalmak "sürükledim ama olmadı" demek.
      if (raw.length > 0 && !raw.some((f) => seenRef.current.has(fileSeed(f)))) flash(t('noMediaFound'));
      return;
    }
    // Klasör okuma sırası dosya sistemine bağlı ve rastgele görünür; ada göre
    // (sayı bilinçli: IMG_2 < IMG_10) sıralamak ilerlemeyi takip edilir kılar.
    fresh.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    const stamp = Date.now();
    const items: UploadItem[] = fresh.map((file, i) => ({
      id: `${stamp}_${i}_${file.name}`,
      file,
      kind: file.type.startsWith('video/') ? 'video' : 'photo',
      progress: 0,
      status: 'queued',
      previewUrl: URL.createObjectURL(file),
    }));
    commit([...queueRef.current, ...items]);
    void drain();
  }

  function onPick(input: HTMLInputElement | null) {
    if (!input?.files) return;
    enqueue(Array.from(input.files));
    input.value = '';
  }

  const retry = (item: UploadItem) => {
    patch(item.id, { status: 'queued', error: undefined, progress: 0 });
    void drain();
  };

  // Sürükle-bırak SAYFANIN TAMAMINDA: misafir dosyayı dock'a değil galeriye
  // bırakıyor. Derinlik sayacı şart — çocuk öğeler arasında geçerken
  // dragleave/dragenter çifti ateşleniyor, tek bayrak titrerdi.
  useEffect(() => {
    let depth = 0;
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth += 1;
      setDragging(true);
    };
    const onOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault(); // bırakmaya izin — bu olmadan drop hiç gelmez
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
      if (!e.dataTransfer) return;
      void collectDrop(e.dataTransfer).then(enqueue);
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
    // enqueue kuyruğu ref üzerinden görüyor; dinleyiciler bir kez bağlanır.
  }, []);

  const failed = queue.filter((it) => it.status === 'failed');
  const live = queue.filter((it) => it.status !== 'failed');
  const shown = [...failed, ...live.slice(0, VISIBLE_ROWS)];
  const hiddenCount = Math.max(0, live.length - VISIBLE_ROWS);
  // Biten satır 1,2 sn daha listede kalıyor; o pencerede iki kez sayılmasın.
  const total = doneCount + queue.filter((it) => it.status !== 'done').length;

  return (
    <>
      {dragging && (
        <div className="dropzone" aria-hidden>
          <div>{t('dropHere')}</div>
        </div>
      )}
      <div className="dock">
        <div className="dock-inner">
          {queue.length > 0 && (
            <div className="queue">
              {total > 1 && (
                <div className="queue-summary">
                  {t('uploadedCount').replace('{done}', String(doneCount)).replace('{total}', String(total))}
                </div>
              )}
              {shown.map((item) => (
                <div key={item.id} className={`queue-row${item.status === 'failed' ? ' failed' : ''}`}>
                  <img className="queue-thumb" src={item.previewUrl} alt="" />
                  {item.status === 'failed' ? (
                    <>
                      <span style={{ flex: 1 }}>{item.error}</span>
                      <button className="chip" onClick={() => retry(item)}>
                        {t('retry')}
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="bar">
                        <i style={{ width: `${Math.round(item.progress * 100)}%` }} />
                      </span>
                      <span style={{ width: 34, textAlign: 'right' }}>{Math.round(item.progress * 100)}%</span>
                    </>
                  )}
                </div>
              ))}
              {hiddenCount > 0 && (
                <div className="queue-more">{t('moreWaiting').replace('{n}', String(hiddenCount))}</div>
              )}
            </div>
          )}

          {notice && <div className="queue-notice">{notice}</div>}

          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={(e) => onPick(e.currentTarget)}
          />
          {/* webkitdirectory React tiplerinde yok; öznitelik olarak basılıyor.
              accept burada YOK SAYILIR — eleme asMedia'da. */}
          <input
            ref={dirRef}
            type="file"
            multiple
            hidden
            {...({ webkitdirectory: '' } as Record<string, string>)}
            onChange={(e) => onPick(e.currentTarget)}
          />
          <div className="dock-actions">
            <button className="btn" onClick={() => inputRef.current?.click()}>
              <IconPlus /> {t('addPhotos')}
            </button>
            {desktop && (
              <button className="btn ghost" onClick={() => dirRef.current?.click()}>
                {t('addFolder')}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
