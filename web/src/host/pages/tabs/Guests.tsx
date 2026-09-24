import { useEffect, useState } from 'react';
import type { Guest, HostEvent } from '../../lib/types';
import { setBanned, watchGuests } from '../../lib/data';
import { logError } from '../../lib/errorLog';
import { capsOf } from '../../lib/plans';
import { fmtNumber, fmtRelative, t } from '../../i18n';
import { Button, Loading, Meter, Notice, useConfirm, useToast } from '../../components/ui';

// Guests (plan §3.2): everyone who joined with the QR or the code, newest first,
// with remove / restore (`banned`: they cannot rejoin or upload; their photos
// stay) and the count against the guest cap. The couple (album owner) is marked.
export function Guests({ event }: { event: HostEvent }) {
  const toast = useToast();
  const { ask, node } = useConfirm();
  const [rows, setRows] = useState<Guest[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(
    () =>
      watchGuests(event.id, setRows, (e) => {
        void logError('host_guests', e, { eventId: event.id });
        setFailed(true);
      }),
    [event.id],
  );
  const cap = capsOf(event).guests;

  const toggle = async (g: Guest) => {
    if (!g.banned) {
      const ok = await ask({ title: t('guests.banTitle', { name: g.name || t('guests.noName') }), body: t('guests.banBody'), confirm: t('guests.ban'), danger: true });
      if (!ok) return;
    }
    setBusy(g.id);
    try {
      await setBanned(event.id, g.id, !g.banned);
      toast(g.banned ? t('guests.restoredToast', { name: g.name }) : t('guests.removedToast', { name: g.name }));
    } catch (e) {
      void logError('host_guest_ban', e, { eventId: event.id });
      toast(t('common.tryAgain'));
    } finally {
      setBusy(null);
    }
  };

  if (failed && !rows) return <Notice tone="danger">{t('common.checkConnection')}</Notice>;
  if (!rows) return <Loading />;
  const full = cap >= 0 && event.activeGuestCount >= cap;
  return (
    <div className="grid-main">
      <div className="col">
        {rows.length === 0 ? (
          <section className="panel empty">
            <h2 className="h2">{t('guests.emptyTitle')}</h2>
            <p className="muted" style={{ marginTop: 8 }}>{t('guests.emptyBody')}</p>
          </section>
        ) : (
          <div className="glist">
            {rows.map((g) => (
              <div key={g.id} className={`grow-row${g.banned ? ' banned' : ''}`} data-guest={g.id}>
                <span className="av" aria-hidden="true">{(g.name || '?').trim().charAt(0).toUpperCase()}</span>
                <span className="name">
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name || t('guests.noName')}</span>
                  {g.role === 'owner' && <span className="tag">{t('guests.owner')}</span>}
                  {g.banned && <span className="tag danger">{t('guests.bannedTag')}</span>}
                </span>
                <span className="sub">{g.joinedAt ? t('guests.joined', { time: fmtRelative(g.joinedAt) }) : ''}</span>
                <Button variant={g.banned ? 'line' : 'quiet'} size="sm" busy={busy === g.id} onClick={() => void toggle(g)}>
                  {g.banned ? t('guests.unban') : t('guests.ban')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="col">
        <section className="panel">
          <h2 className="h3">{t('guests.capTitle')}</h2>
          <p className="stat" style={{ marginTop: 10 }}>
            <span className="v num">
              {fmtNumber(event.activeGuestCount)}
              <small>{cap < 0 ? t('unit.unlimitedShort') : `/ ${fmtNumber(cap)}`}</small>
            </span>
          </p>
          <div style={{ margin: '10px 0 12px' }}><Meter used={event.activeGuestCount} cap={cap} /></div>
          <p className="desc">{full ? t('guests.full', { limit: fmtNumber(cap) }) : t('guests.capBody')}</p>
          {full && (
            <div className="btn-row" style={{ marginTop: 12 }}>
              <a className="btn sm" href={`#/e/${event.id}/plan`}>{t('overview.changePackage')}</a>
            </div>
          )}
        </section>
      </div>
      {node}
    </div>
  );
}
