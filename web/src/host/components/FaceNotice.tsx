import { t } from '../i18n';
import { Button, IconFace, useCopy } from './ui';

// The host's duty when face matching is on (AGENTS.md "yüz bildirimi"; plan §3.2
// rev 2): tell the guests — the app's versioned notice text (face.noticeText,
// 2026-09-23) with a Copy button for the invitation or the group chat, and the
// printed QR carries the one-line notice (QrCard).
export function FaceNotice({ compact }: { compact?: boolean }) {
  const [copied, copy] = useCopy();
  return (
    <section className={`panel${compact ? '' : ''}`} aria-labelledby="face-notice-h">
      <div className="row" style={{ alignItems: 'flex-start', gap: 14, flexWrap: 'nowrap' }}>
        <span style={{ color: 'var(--sage)', marginTop: 2 }}><IconFace /></span>
        <div className="stack grow" style={{ ['--gap' as string]: '10px' }}>
          <h2 id="face-notice-h" className="h3">{t('face.noticeTitle')}</h2>
          <p className="muted small">{t('face.noticeSub')}</p>
          <blockquote style={{ margin: 0, padding: '12px 14px', background: 'var(--field)', boxShadow: 'inset 3px 0 0 var(--sage)', fontSize: '.9375rem', lineHeight: 1.55 }} data-face-notice>
            {t('face.noticeText')}
          </blockquote>
          <div className="btn-row">
            <Button variant="line" size="sm" onClick={() => void copy(t('face.noticeText'))}>
              {copied ? t('face.noticeCopied') : t('face.noticeCopy')}
            </Button>
          </div>
          <p className="tiny muted">{t('face.noticePrint')}</p>
        </div>
      </div>
    </section>
  );
}
