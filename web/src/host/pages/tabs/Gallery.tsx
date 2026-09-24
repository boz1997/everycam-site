import { useCallback, useEffect, useMemo, useState } from 'react';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import type { HostEvent, MediaItem, Report } from '../../lib/types';
import { backend } from '../../../backend/active';
import { deleteMedia, listMediaPage, listReports, setHidden } from '../../lib/data';
import { logError } from '../../lib/errorLog';
import { fmtDate, fmtNumber, t } from '../../i18n';
import { Button, IconEye, IconTrash, Notice, Spinner, useConfirm, useToast } from '../../components/ui';

// Gallery (plan §3.2): newest first, 60 per page (thumbnails only; videos show
// their poster), a lightbox, hide / show (`hidden`: guests stop seeing it,
// nothing is deleted), delete with a confirmation (the server removes the files),
// and the reported items with a filter. Moderation writes are the app's own.

function Lightbox({ items, index, onIndex, onClose, onHide, onDelete, reported }: {
  items: MediaItem[]; index: number; onIndex: (i: number) => void; onClose: () => void;
  onHide: (m: MediaItem) => void; onDelete: (m: MediaItem) => void; reported: Set<string>;
}) {
  const m = items[index];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1);
      if (e.key === 'ArrowRight' && index < items.length - 1) onIndex(index + 1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, items.length, onClose, onIndex]);
  if (!m) return null;
  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label={t('gallery.viewer')}>
      <div className="lb-top">
        <span className="num">{fmtNumber(index + 1)} / {fmtNumber(items.length)} · {m.ownerName || t('gallery.unknownOwner')} · {fmtDate(m.uploadedAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        <button type="button" className="icon-x" aria-label={t('common.close')} onClick={onClose}>×</button>
      </div>
      <div className="lb-media">
        {m.kind === 'video' ? (
          <video src={backend.mediaUrl(m.uri)} poster={m.thumbUri ? backend.mediaUrl(m.thumbUri) : undefined} controls playsInline />
        ) : (
          <img src={backend.mediaUrl(m.uri)} alt={t('gallery.photoAlt', { name: m.ownerName })} />
        )}
        {index > 0 && <button type="button" className="lb-nav prev" aria-label={t('common.prev')} onClick={() => onIndex(index - 1)}>‹</button>}
        {index < items.length - 1 && <button type="button" className="lb-nav next" aria-label={t('common.next')} onClick={() => onIndex(index + 1)}>›</button>}
      </div>
      <div className="lb-bar">
        {m.hidden && <span className="tag gold" style={{ alignSelf: 'center' }}>{t('gallery.hidden')}</span>}
        {reported.has(m.id) && <span className="tag danger" style={{ alignSelf: 'center' }}>{t('gallery.reported')}</span>}
        <Button variant="line" size="sm" icon={<IconEye off={!m.hidden} />} onClick={() => onHide(m)}>
          {m.hidden ? t('gallery.show') : t('gallery.hide')}
        </Button>
        <a className="btn line sm" href={backend.mediaUrl(m.uri)} target="_blank" rel="noopener">{t('gallery.openFull')}</a>
        <Button variant="danger" size="sm" icon={<IconTrash />} onClick={() => onDelete(m)}>
          {t('common.delete')}
        </Button>
      </div>
    </div>
  );
}

export function Gallery({ event }: { event: HostEvent }) {
  const toast = useToast();
  const { ask, node } = useConfirm();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'reported' | 'hidden'>('all');
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(async (from: QueryDocumentSnapshot | null) => {
    setLoading(true);
    try {
      const page = await listMediaPage(event.id, from);
      setItems((rows) => (from ? [...rows, ...page.items] : page.items));
      setCursor(page.cursor);
      setDone(page.cursor === null);
    } catch (e) {
      void logError('host_gallery_page', e, { eventId: event.id });
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    void load(null);
    listReports(event.id).then(setReports).catch(() => setReports([]));
  }, [event.id, load]);

  const reported = useMemo(() => new Set(reports.map((r) => r.mediaId)), [reports]);
  const shown = useMemo(
    () => (filter === 'reported' ? items.filter((m) => reported.has(m.id)) : filter === 'hidden' ? items.filter((m) => m.hidden) : items),
    [filter, items, reported],
  );

  const toggleHidden = async (m: MediaItem) => {
    const next = !m.hidden;
    setItems((rows) => rows.map((r) => (r.id === m.id ? { ...r, hidden: next } : r)));
    try {
      await setHidden(event.id, m.id, next);
      toast(next ? t('gallery.hiddenToast') : t('gallery.shownToast'));
    } catch (e) {
      setItems((rows) => rows.map((r) => (r.id === m.id ? { ...r, hidden: m.hidden } : r)));
      void logError('host_media_hide', e, { eventId: event.id });
      toast(t('common.tryAgain'));
    }
  };
  const remove = async (m: MediaItem) => {
    const ok = await ask({ title: t('gallery.deleteTitle'), body: t('gallery.deleteBody'), confirm: t('common.delete'), danger: true });
    if (!ok) return;
    try {
      await deleteMedia(event.id, m.id);
      setItems((rows) => rows.filter((r) => r.id !== m.id));
      setOpen((i) => (i === null ? null : Math.min(i, shown.length - 2) < 0 ? null : Math.min(i, shown.length - 2)));
      toast(t('gallery.deletedToast'));
    } catch (e) {
      void logError('host_media_delete', e, { eventId: event.id });
      toast(t('common.tryAgain'));
    }
  };

  const total = event.photoCount + event.videoCount;
  return (
    <>
      <div className="gallery-tools">
        <p className="muted small num">{t('gallery.count', { n: fmtNumber(total), shown: fmtNumber(items.length) })}</p>
        <div className="seg" role="group" aria-label={t('gallery.filter')}>
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>{t('gallery.all')}</button>
          <button type="button" aria-pressed={filter === 'reported'} onClick={() => setFilter('reported')}>{t('gallery.reportedN', { n: reports.length })}</button>
          <button type="button" aria-pressed={filter === 'hidden'} onClick={() => setFilter('hidden')}>{t('gallery.hiddenN', { n: items.filter((m) => m.hidden).length })}</button>
        </div>
      </div>
      {failed && <Notice tone="danger">{t('common.checkConnection')}</Notice>}
      {!loading && items.length === 0 && !failed ? (
        <section className="panel empty">
          <h2 className="h2">{t('gallery.emptyTitle')}</h2>
          <p className="muted" style={{ marginTop: 8 }}>{event.uploadPolicy === 'host' ? t('gallery.emptyPro') : t('gallery.emptyBody')}</p>
        </section>
      ) : (
        <>
          {shown.length === 0 && !loading && <p className="muted">{filter === 'reported' ? t('gallery.noneReported') : t('gallery.noneHidden')}</p>}
          <div className="ggrid">
            {shown.map((m, i) => (
              <div key={m.id} className={`gcell${m.hidden ? ' hidden' : ''}`} data-media={m.id}>
                <img src={backend.mediaUrl(m.thumbUri || m.uri)} alt="" loading="lazy" decoding="async" />
                <button type="button" className="open" aria-label={t('gallery.openItem', { name: m.ownerName || t('gallery.unknownOwner') })} onClick={() => setOpen(i)} />
                <span className="badges">
                  {m.hidden && <span className="tag gold">{t('gallery.hidden')}</span>}
                  {reported.has(m.id) && <span className="tag danger">{t('gallery.reported')}</span>}
                </span>
                {m.kind === 'video' && <span className="play">▶ {m.durationSec ? `${Math.round(m.durationSec)}s` : ''}</span>}
                <span className="acts">
                  <button type="button" title={m.hidden ? t('gallery.show') : t('gallery.hide')} aria-label={m.hidden ? t('gallery.show') : t('gallery.hide')} onClick={() => void toggleHidden(m)}>
                    <IconEye off={!m.hidden} />
                  </button>
                  <button type="button" title={t('common.delete')} aria-label={t('common.delete')} onClick={() => void remove(m)}>
                    <IconTrash />
                  </button>
                </span>
              </div>
            ))}
          </div>
          {loading && <div className="more"><Spinner label={t('common.loading')} /></div>}
          {!done && !loading && (
            <div className="more">
              <Button variant="line" onClick={() => void load(cursor)}>{t('gallery.more')}</Button>
            </div>
          )}
        </>
      )}
      {open !== null && shown[open] && (
        <Lightbox items={shown} index={open} onIndex={setOpen} onClose={() => setOpen(null)} onHide={(m) => void toggleHidden(m)} onDelete={(m) => void remove(m)} reported={reported} />
      )}
      {node}
    </>
  );
}
