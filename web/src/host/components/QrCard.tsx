import { useState } from 'react';
import type { HostEvent } from '../lib/types';
import { backend } from '../../backend/active';
import { downloadBlob, qrMatrix, qrPath, qrPng, safeFileName } from '../lib/qr';
import { logError } from '../lib/errorLog';
import { t } from '../i18n';
import { Button, CopyField, IconDownload, useToast } from './ui';

// The event's invitation: QR (SVG on the page, a 1024 px PNG to print), the
// 6-character code, the link https://sharecam.app/e/CODE with copy and share.
// When face matching is on, the notice line is printed under the QR (the app's
// face.cardNotice; face-grouping.html §7 promises guests an invitation and a sign).
export function QrCard({ event, title, body }: { event: HostEvent; title: string; body: string }) {
  const toast = useToast();
  const link = backend.guestLink(event.code);
  const { d, total } = qrPath(qrMatrix(link), 2);
  const faceOn = event.aiPeopleEnabled;
  const [busy, setBusy] = useState(false);

  const png = async () => {
    setBusy(true);
    try {
      const lines = [event.name, `sharecam.app · ${event.code}`, ...(faceOn ? [t('face.cardNotice')] : [])];
      downloadBlob(await qrPng(link, lines), `sharecam-${safeFileName(event.name)}-qr.png`);
    } catch (e) {
      void logError('host_qr_png', e, { eventId: event.id });
      toast(t('common.tryAgain'));
    } finally {
      setBusy(false);
    }
  };
  const share = async () => {
    try {
      await navigator.share({ title: event.name, text: t('qr.shareText', { name: event.name, code: event.code }), url: link });
    } catch {
      /* dismissed */
    }
  };

  return (
    <section className="panel" aria-labelledby="qr-h">
      <div className="qr-block">
        <div className="qr-card">
          <svg viewBox={`0 0 ${total} ${total}`} shapeRendering="crispEdges" role="img" aria-label={t('qr.alt', { code: event.code })}>
            <rect width={total} height={total} fill="#fff" />
            <path d={d} fill="#1F3D2E" />
          </svg>
          {faceOn && <p className="qr-note">{t('face.cardNotice')}</p>}
        </div>
        <div className="stack" style={{ ['--gap' as string]: '12px' }}>
          <p className="kicker">{t('qr.kicker')}</p>
          <h2 id="qr-h" className="h2">{title}</h2>
          <p className="muted small">{body}</p>
          <div>
            <p className="tiny muted" style={{ marginBottom: 4 }}>{t('qr.codeLabel')}</p>
            <p className="code-big" data-code>{event.code}</p>
          </div>
          <CopyField value={link} label={t('qr.linkLabel')} display={link.replace(/^https?:\/\//, '')} />
          <div className="btn-row">
            <Button variant="ghost" size="sm" icon={<IconDownload />} busy={busy} onClick={() => void png()}>
              {t('qr.png')}
            </Button>
            {typeof navigator.share === 'function' && (
              <Button variant="line" size="sm" onClick={() => void share()}>
                {t('qr.share')}
              </Button>
            )}
          </div>
          {faceOn && <p className="tiny muted">{t('qr.faceLine')}</p>}
        </div>
      </div>
    </section>
  );
}
