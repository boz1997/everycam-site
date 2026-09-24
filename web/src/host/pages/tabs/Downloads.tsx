import { useState } from 'react';
import type { HostEvent } from '../../lib/types';
import { backend } from '../../../backend/active';
import { callableError, fn } from '../../lib/data';
import { logError } from '../../lib/errorLog';
import { deletionAt, flagsOf } from '../../lib/plans';
import { fmtDate, fmtNumber, t } from '../../i18n';
import { Button, IconDownload, Notice } from '../../components/ui';

// Downloads (plan §3.2 / §3.3). Consumer events: the whole album as one ZIP
// (createEventZip — refused for refunded events). Photographer events: the album
// archive in parts, 2048 px and originals (createAlbumArchive, links valid 7 days;
// the same UI as the couple's album page, AlbumApp.tsx — WP-E may extract both
// into a shared component).

type Kind = 'display' | 'original';
interface Part { part: number; parts: number; url: string; count: number }
interface ArchiveState { running: boolean; parts: Part[]; total: number; error: string }
const EMPTY: ArchiveState = { running: false, parts: [], total: 0, error: '' };

function Archive({ event }: { event: HostEvent }) {
  const [state, setState] = useState<Record<Kind, ArchiveState>>({ display: EMPTY, original: EMPTY });
  const build = async (kind: Kind) => {
    setState((s) => ({ ...s, [kind]: { running: true, parts: [], total: 0, error: '' } }));
    try {
      let part = 0;
      let parts = 1;
      while (part < parts) {
        const res = await fn.createAlbumArchive({ eventId: event.id, kind, part });
        parts = res.data.parts;
        const p: Part = { part: res.data.part, parts, url: res.data.url, count: res.data.count };
        setState((s) => ({ ...s, [kind]: { ...s[kind], parts: [...s[kind].parts, p], total: res.data.total } }));
        part += 1;
      }
      setState((s) => ({ ...s, [kind]: { ...s[kind], running: false } }));
    } catch (e) {
      const { message } = callableError(e);
      void logError('host_archive', e, { eventId: event.id, kind });
      setState((s) => ({ ...s, [kind]: { ...s[kind], running: false, error: /refunded/.test(message) ? t('downloads.refunded') : /Nothing to export/i.test(message) ? t('downloads.nothing') : t('downloads.failed') } }));
    }
  };
  const block = (kind: Kind, title: string, body: string) => {
    const s = state[kind];
    return (
      <section className="panel" aria-labelledby={`arc-${kind}`}>
        <h2 id={`arc-${kind}`} className="h3">{title}</h2>
        <p className="desc">{body}</p>
        <div className="btn-row" style={{ marginTop: 14 }}>
          <Button variant={s.parts.length ? 'line' : kind === 'display' ? 'primary' : 'ghost'} size="sm" icon={s.parts.length ? undefined : <IconDownload />} busy={s.running} onClick={() => void build(kind)} data-archive={kind}>
            {s.parts.length && !s.running ? t('downloads.again') : t('downloads.prepare')}
          </Button>
          {s.running && <span className="small muted">{t('downloads.preparing', { done: s.parts.length, total: s.parts[0]?.parts ?? '…' })}</span>}
        </div>
        {s.parts.length > 0 && (
          <ul className="facts" style={{ listStyle: 'none', padding: 0, margin: '14px 0 0' }}>
            {s.parts.map((p) => (
              <li key={p.part} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderTop: '1px solid var(--line)' }}>
                <span>{t('downloads.part', { n: p.part + 1, of: p.parts })} · {t('downloads.items', { n: fmtNumber(p.count) })}</span>
                <a className="btn sm" href={backend.mediaUrl(p.url)} download data-archive-part><IconDownload /> {t('downloads.download')}</a>
              </li>
            ))}
          </ul>
        )}
        {s.error && <p className="err" style={{ marginTop: 10 }}>{s.error}</p>}
      </section>
    );
  };
  return (
    <>
      {block('display', t('downloads.displayTitle'), t('downloads.displayBody'))}
      {block('original', t('downloads.originalTitle'), t('downloads.originalBody'))}
      <p className="footnote">{t('downloads.validity')}</p>
    </>
  );
}

function Zip({ event }: { event: HostEvent }) {
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ url: string; count: number } | null>(null);
  const [err, setErr] = useState('');
  const run = async () => {
    setBusy(true);
    setErr('');
    try {
      const r = await fn.createEventZip({ eventId: event.id });
      setRes({ url: r.data.url, count: r.data.count });
    } catch (e) {
      const { message } = callableError(e);
      void logError('host_zip', e, { eventId: event.id });
      setErr(/refunded/.test(message) ? t('downloads.refunded') : /Nothing to export/i.test(message) ? t('downloads.nothing') : t('downloads.failed'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="panel" aria-labelledby="zip-h">
      <h2 id="zip-h" className="h3">{t('downloads.zipTitle')}</h2>
      <p className="desc">{t('downloads.zipBody')}</p>
      <div className="btn-row" style={{ marginTop: 14 }}>
        {res ? (
          <a className="btn sm" href={backend.mediaUrl(res.url)} download data-zip-link>
            <IconDownload /> {t('downloads.zipReady', { n: fmtNumber(res.count) })}
          </a>
        ) : (
          <Button size="sm" icon={busy ? undefined : <IconDownload />} busy={busy} onClick={() => void run()} data-zip>
            {t('downloads.zipCta')}
          </Button>
        )}
        {busy && <span className="small muted">{t('downloads.zipWorking')}</span>}
      </div>
      {err && <p className="err" style={{ marginTop: 10 }} data-zip-error>{err}</p>}
    </section>
  );
}

export function Downloads({ event }: { event: HostEvent }) {
  const pro = flagsOf(event).hostOnly;
  const del = deletionAt(event);
  return (
    <div className="grid-main">
      <div className="col">
        {event.refunded ? (
          <Notice tone="gold" title={t('downloads.refundedTitle')}>
            {t('downloads.refunded')}{' '}
            <a href={`#/e/${event.id}/plan`}>{t('downloads.buyAgain')}</a>
          </Notice>
        ) : pro ? (
          <Archive event={event} />
        ) : (
          <Zip event={event} />
        )}
      </div>
      <div className="col">
        <section className="panel">
          <h2 className="h3">{t('downloads.keepTitle')}</h2>
          <p className="desc">{del ? t('downloads.keepBody', { date: fmtDate(del) }) : t('downloads.keepBodyNoDate')}</p>
        </section>
      </div>
    </div>
  );
}
