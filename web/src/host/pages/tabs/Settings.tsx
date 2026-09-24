import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import type { HostEvent } from '../../lib/types';
import { backend } from '../../../backend/active';
import { deleteEvent, removeCover, setCover, updateEvent, type EventPatch } from '../../lib/data';
import { logError } from '../../lib/errorLog';
import { canDestroy } from '../../lib/auth';
import { useSessionProvider } from '../../hooks/useSessionProvider';
import { aiAvailable, flagsOf } from '../../lib/plans';
import { navigate } from '../../lib/router';
import { fmtDate, fmtDay, t } from '../../i18n';
import { FaceNotice } from '../../components/FaceNotice';
import { Button, Notice, Setting, useConfirm, useToast } from '../../components/ui';

// Settings — the app's set (EC/src/components/HostSettingsTab.tsx): cover; name and
// date read-only (locked for the printed cards, rules); private / open + scheduled
// reveal (consumer only: a photographer event is always open, rules); pause joins;
// guest downloads; face matching on/off only where bought or included (the purchase
// stays in the app, D5); delete event (hidden for a paired session — linked or not —
// D3 rev 2 (b) + fix pass: a custom-token session never deletes).
//
// A cover picked by keyboard: the file input is sr-only inside label.btn, which
// shows the focus ring (styles.css label.btn:focus-within).

const pad = (n: number) => String(n).padStart(2, '0');
function toLocalInput(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function tomorrowTen(): number {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d.getTime();
}

export function Settings({ event, user }: { event: HostEvent; user: User }) {
  const toast = useToast();
  const { ask, node } = useConfirm();
  const [busy, setBusy] = useState<string | null>(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const [justOn, setJustOn] = useState(false);
  const provider = useSessionProvider(user);
  const [reveal, setReveal] = useState(event.revealAt ? toLocalInput(event.revealAt) : '');
  useEffect(() => setReveal(event.revealAt ? toLocalInput(event.revealAt) : ''), [event.revealAt]);
  const flags = flagsOf(event);
  const hostOnly = flags.hostOnly;

  const write = async (key: string, patch: EventPatch, ok?: string) => {
    setBusy(key);
    try {
      await updateEvent(event.id, patch);
      if (ok) toast(ok);
    } catch (e) {
      void logError('host_settings', e, { eventId: event.id, key });
      toast(t('common.tryAgain'));
    } finally {
      setBusy(null);
    }
  };

  const setPrivate = async (on: boolean) => {
    if (!on) {
      // private → open is the "reveal" (03 §3.4): confirm first.
      const ok = await ask({ title: t('settings.revealTitle'), body: t('settings.revealBody'), confirm: t('settings.revealConfirm') });
      if (!ok) return;
      await write('mode', { mode: 'open', revealAt: null });
    } else await write('mode', { mode: 'private' });
  };
  const setAutoReveal = async (on: boolean) => {
    if (!on) await write('reveal', { revealAt: null });
    else await write('reveal', { revealAt: tomorrowTen(), mode: 'private' });
  };
  const setFace = async (on: boolean) => {
    if (on) {
      const ok = await ask({ title: t('face.hostConfirmTitle'), body: t('face.hostConfirmBody'), confirm: t('face.hostConfirmCta') });
      if (!ok) return;
    }
    await write('ai', { aiPeopleEnabled: on });
    setJustOn(on);
  };

  const onCover = async (file: File | null) => {
    if (!file) return;
    setCoverBusy(true);
    try {
      await setCover(event, file);
      toast(t('settings.coverSaved'));
    } catch (e) {
      void logError('host_cover', e, { eventId: event.id });
      toast(t('common.tryAgain'));
    } finally {
      setCoverBusy(false);
    }
  };

  const del = async () => {
    const one = await ask({ title: t('settings.deleteTitle'), body: t('settings.deleteBody', { name: event.name }), confirm: t('settings.deleteConfirm'), danger: true });
    if (!one) return;
    const two = await ask({ title: t('settings.deleteTitle2'), body: t('settings.deleteBody2'), confirm: t('common.delete'), danger: true });
    if (!two) return;
    setBusy('delete');
    try {
      await deleteEvent(event);
      toast(t('settings.deleted'));
      navigate({ name: 'events' }, true);
    } catch (e) {
      void logError('host_event_delete', e, { eventId: event.id });
      toast(t('common.tryAgain'));
      setBusy(null);
    }
  };

  return (
    <div className="grid-main">
      <div className="col">
        <section className="panel" aria-labelledby="set-gallery">
          <h2 id="set-gallery" className="h3" style={{ marginBottom: 6 }}>{t('settings.galleryTitle')}</h2>
          {hostOnly ? (
            <div className="setting" style={{ cursor: 'default' }}>
              <span className="h3">{t('settings.hostOnlyTitle')}</span>
              <span className="desc">{t('settings.hostOnlyBody')}</span>
            </div>
          ) : (
            <>
              <Setting
                title={t('settings.privateTitle')}
                desc={event.mode === 'private' ? t('settings.privateOn') : t('settings.privateOff')}
                on={event.mode === 'private'}
                busy={busy === 'mode'}
                onChange={(v) => void setPrivate(v)}
                stateOn={t('settings.statePrivate')}
                stateOff={t('settings.statePublic')}
              />
              <Setting
                title={t('settings.autoRevealTitle')}
                desc={event.revealAt ? t('settings.autoRevealOn', { time: fmtDate(event.revealAt, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }) : t('settings.autoRevealOff')}
                on={event.revealAt !== null}
                busy={busy === 'reveal'}
                onChange={(v) => void setAutoReveal(v)}
              />
              {event.revealAt !== null && (
                <label className="field" style={{ padding: '0 0 14px' }}>
                  <span className="label">{t('settings.revealPick')}</span>
                  <input
                    className="input"
                    type="datetime-local"
                    value={reveal}
                    min={toLocalInput(Date.now())}
                    style={{ maxWidth: 280 }}
                    onChange={(e) => setReveal(e.target.value)}
                    onBlur={() => {
                      const ms = new Date(reveal).getTime();
                      if (Number.isFinite(ms) && ms !== event.revealAt) void write('reveal', { revealAt: ms }, t('settings.saved'));
                    }}
                  />
                </label>
              )}
            </>
          )}
          <Setting
            title={t('settings.pauseTitle')}
            desc={event.joinPaused ? t('settings.pauseOn') : t('settings.pauseOff')}
            on={event.joinPaused}
            busy={busy === 'pause'}
            onChange={(v) => void write('pause', { joinPaused: v })}
            stateOn={t('settings.statePaused')}
            stateOff={t('settings.stateOpen')}
          />
          <Setting
            title={t('settings.downloadTitle')}
            desc={t('settings.downloadDesc')}
            on={event.guestCanDownload}
            busy={busy === 'download'}
            onChange={(v) => void write('download', { guestCanDownload: v })}
          />
        </section>

        {aiAvailable(event) ? (
          <section className="panel" aria-labelledby="set-face">
            <h2 id="set-face" className="h3" style={{ marginBottom: 6 }}>{t('face.title')}</h2>
            <Setting
              title={t('face.tabTitle')}
              desc={event.aiPeopleEnabled ? t('face.aiOn') : t('face.aiOff')}
              on={event.aiPeopleEnabled}
              busy={busy === 'ai'}
              onChange={(v) => void setFace(v)}
            />
            {justOn && event.aiPeopleEnabled && (
              <Notice tone="gold" title={t('face.remindTitle')}>{t('face.remindBody')}</Notice>
            )}
          </section>
        ) : (
          <section className="panel" aria-labelledby="set-face">
            <h2 id="set-face" className="h3">{t('face.title')}</h2>
            <p className="desc">{t('face.notInPackage')}</p>
          </section>
        )}
        {event.aiPeopleEnabled && <FaceNotice />}
      </div>

      <div className="col">
        <section className="panel" aria-labelledby="set-details">
          <h2 id="set-details" className="h3">{t('settings.detailsTitle')}</h2>
          <div className="stack" style={{ ['--gap' as string]: '14px', marginTop: 14 }}>
            <div>
              {event.coverUri ? (
                <img src={backend.mediaUrl(event.coverUri)} alt="" style={{ width: '100%', maxHeight: 180, objectFit: 'cover' }} data-cover />
              ) : (
                <div style={{ height: 96, display: 'grid', placeItems: 'center', background: 'var(--bg-alt)', color: 'var(--ink-soft)', fontSize: '.875rem' }}>{t('settings.noCover')}</div>
              )}
              <div className="btn-row" style={{ marginTop: 10 }}>
                <label className={`btn line sm${coverBusy ? ' busy' : ''}`} style={{ cursor: 'pointer' }} aria-disabled={coverBusy || undefined}>
                  {coverBusy ? t('common.saving') : event.coverUri ? t('settings.coverChange') : t('settings.coverAdd')}
                  <input type="file" accept="image/*" className="sr-only" data-cover-input onChange={(e) => void onCover(e.target.files?.[0] ?? null)} />
                </label>
                {event.coverUri && (
                  <Button variant="quiet" size="sm" onClick={() => void removeCover(event).then(() => toast(t('settings.coverRemoved')))}>
                    {t('common.remove')}
                  </Button>
                )}
              </div>
            </div>
            <dl className="facts">
              <div><dt>{t('settings.name')}</dt><dd>{event.name}</dd></div>
              <div><dt>{t('settings.date')}</dt><dd>{event.date ? fmtDay(event.date) : t('event.noDate')}</dd></div>
              {!(hostOnly && event.planId === 'spark') && <div><dt>{t('settings.code')}</dt><dd className="num">{event.code}</dd></div>}
            </dl>
            <p className="tiny muted">{t('settings.lockedNote')}</p>
          </div>
        </section>

        {provider === undefined ? null : canDestroy(user, provider) ? (
          <section className="panel danger-zone" aria-labelledby="set-danger">
            <h2 id="set-danger" className="h3" style={{ color: 'var(--danger)' }}>{t('settings.dangerTitle')}</h2>
            <p className="desc">{t('settings.dangerBody')}</p>
            <div className="btn-row" style={{ marginTop: 14 }}>
              <Button variant="danger" size="sm" busy={busy === 'delete'} onClick={() => void del()} data-delete-event>
                {t('settings.deleteCta')}
              </Button>
            </div>
          </section>
        ) : (
          <section className="panel flat">
            <p className="tiny muted">{t('settings.deletePairedNote')}</p>
          </section>
        )}
      </div>
      {node}
    </div>
  );
}
