import { useRef, useState } from 'react';
import { uploadOne, UploadError, VIDEO_MAX_BYTES } from '../events';
import type { EventDoc, UploadItem } from '../types';
import { IconPlus } from './Brand';

interface Props {
  event: EventDoc;
  uid: string;
  name: string;
  t: (k: string) => string;
}

/**
 * Alt yükleme çubuğu. Dosyalar SIRAYLA yüklenir — paralel yükleme düğün
 * wifi'ında bant genişliğini bölüp hepsini birden yavaşlatıyor ve ilerleme
 * çubuğunu anlamsızlaştırıyor.
 *
 * Başarısız olan satır kuyrukta KALIR ve tek dokunuşla tekrar denenir; sessizce
 * kaybolan yükleme, misafirin "yükledim sanmıştım" dediği durumdur.
 */
export function Uploader({ event, uid, name, t }: Props) {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  // Akan döngü kuyruğun O ANKİ hâlini görmek zorunda: yükleme sürerken seçilen
  // dosyalar da aynı turda ele alınacak. State tek başına yetmez, çünkü döngü
  // await'lerin arasında yaşıyor ve kendisini başlatan render'ın değerine
  // kilitli kalıyor.
  const queueRef = useRef<UploadItem[]>([]);

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

  function onPick(files: FileList | null) {
    if (!files || files.length === 0) return;
    const items: UploadItem[] = Array.from(files).map((file, i) => ({
      id: `${Date.now()}_${i}_${file.name}`,
      file,
      kind: file.type.startsWith('video/') ? 'video' : 'photo',
      progress: 0,
      status: 'queued',
      previewUrl: URL.createObjectURL(file),
    }));
    commit([...queueRef.current, ...items]);
    void drain();
    if (inputRef.current) inputRef.current.value = '';
  }

  const retry = (item: UploadItem) => {
    patch(item.id, { status: 'queued', error: undefined, progress: 0 });
    void drain();
  };

  return (
    <div className="dock">
      <div className="dock-inner">
        {queue.length > 0 && (
          <div className="queue">
            {queue.map((item) => (
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
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => onPick(e.target.files)}
        />
        <button className="btn" onClick={() => inputRef.current?.click()}>
          <IconPlus /> {t('addPhotos')}
        </button>
      </div>
    </div>
  );
}
