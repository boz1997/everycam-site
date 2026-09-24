import { useCallback, useEffect, useRef, useState } from 'react';
import { backend } from '../backend/active';

// ALBUM ARCHIVE IN PARTS (plan §3.3 "Album archive", §3.5) — shared by the
// couple's album page (/join/album, AlbumApp.tsx) and, when it switches, the
// dashboard's Downloads tab (/join/host). Server: createAlbumArchive
// (functions/src/archive.ts) — host or owner only, refuses refunded events, one
// ZIP part per call, links valid 7 days.
//
// Two layers, so each page keeps its own look:
//   · useArchiveParts(eventId, call) — the logic: parts are requested ONE BY ONE
//     (each call builds one part, or returns it from the server's cache) and are
//     listed as they become ready; a failed run can continue from the next part;
//     nothing is set after unmount or after the page switched to another event.
//     `call` is the callable of whichever Firebase app the page signs in with
//     (the album: the default anonymous app; the dashboard: the named 'host' app).
//   · <ArchiveParts> — the album page's markup (guest styles.css: card, btn ghost,
//     muted), every string passed in by the page.
// Download links go through backend.mediaUrl: identical in production, the
// Storage emulator's host on the local stack.

export type ArchiveKind = 'display' | 'original';
export const ARCHIVE_KINDS: readonly ArchiveKind[] = ['display', 'original'];

export interface ArchivePart {
  part: number;
  parts: number;
  url: string;
  count: number;
}
export interface ArchiveRequest {
  eventId: string;
  kind: ArchiveKind;
  part: number;
}
export type ArchiveCall = (req: ArchiveRequest) => Promise<{ data: ArchivePart & { total: number } }>;

export interface ArchiveState {
  running: boolean;
  parts: ArchivePart[];
  total: number;
  /** The server's error message ('' = none); the page maps it to its own text. */
  error: string;
}
type States = Record<ArchiveKind, ArchiveState>;
const EMPTY: ArchiveState = { running: false, parts: [], total: 0, error: '' };
const EMPTY_ALL: States = { display: EMPTY, original: EMPTY };

function errorMessage(e: unknown): string {
  const x = e as { message?: unknown; code?: unknown } | null;
  return String(x?.message ?? x?.code ?? 'error') || 'error';
}

export function useArchiveParts(
  eventId: string,
  call: ArchiveCall,
  onError?: (kind: ArchiveKind, e: unknown) => void,
): { state: States; build: (kind: ArchiveKind, opts?: { resume?: boolean }) => Promise<void> } {
  const [state, setState] = useState<States>(EMPTY_ALL);
  const stateRef = useRef<States>(EMPTY_ALL);
  const eventRef = useRef(eventId);
  const busy = useRef<Record<ArchiveKind, boolean>>({ display: false, original: false });
  const alive = useRef(true);

  const commit = useCallback((next: (s: States) => States) => {
    stateRef.current = next(stateRef.current);
    setState(stateRef.current);
  }, []);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Another event: start clean (a run for the previous event stops at its next part).
  useEffect(() => {
    if (eventRef.current === eventId) return;
    eventRef.current = eventId;
    busy.current = { display: false, original: false };
    commit(() => EMPTY_ALL);
  }, [eventId, commit]);

  const build = useCallback(
    async (kind: ArchiveKind, opts?: { resume?: boolean }) => {
      if (busy.current[kind]) return;
      busy.current[kind] = true;
      const forEvent = eventId;
      const kept = opts?.resume ? stateRef.current[kind].parts : [];
      let part = kept.length;
      let parts = kept.length ? kept[kept.length - 1].parts : 1;
      commit((s) => ({ ...s, [kind]: { running: true, parts: kept, total: opts?.resume ? s[kind].total : 0, error: '' } }));
      try {
        while (part < parts) {
          const res = await call({ eventId: forEvent, kind, part });
          if (!alive.current || eventRef.current !== forEvent) return;
          parts = res.data.parts;
          const p: ArchivePart = { part: res.data.part, parts, url: res.data.url, count: res.data.count };
          commit((s) => ({ ...s, [kind]: { ...s[kind], parts: [...s[kind].parts, p], total: res.data.total } }));
          part += 1;
        }
        commit((s) => ({ ...s, [kind]: { ...s[kind], running: false } }));
      } catch (e) {
        if (!alive.current || eventRef.current !== forEvent) return;
        onError?.(kind, e);
        commit((s) => ({ ...s, [kind]: { ...s[kind], running: false, error: errorMessage(e) } }));
      } finally {
        // After a switch to another event the reset above already freed it (and a
        // run for the new event may hold it now).
        if (eventRef.current === forEvent) busy.current[kind] = false;
      }
    },
    [eventId, call, onError, commit],
  );

  return { state, build };
}

export interface ArchiveLabels {
  title: (kind: ArchiveKind) => string;
  sub: (kind: ArchiveKind) => string;
  prepare: string;
  /** "Preparing part {done} of {total}…" — total is '…' until the first part answers. */
  preparing: (done: number, total: number | string) => string;
  part: (n: number, of: number) => string;
  /** "{n} photos" next to each part. */
  count: (n: number) => string;
  linksValid: string;
  /** The error line for the server's message. */
  error: (message: string) => string;
  /** Continue after a part failed (the parts already listed stay). */
  retry: string;
}

/** The album page's archive block: 2048 px and originals, each with its parts. */
export function ArchiveParts({
  eventId,
  call,
  labels,
  onError,
}: {
  eventId: string;
  call: ArchiveCall;
  labels: ArchiveLabels;
  onError?: (kind: ArchiveKind, e: unknown) => void;
}) {
  const { state, build } = useArchiveParts(eventId, call, onError);
  // Two columns when there is room (desktop), one on phones.
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 10, marginTop: 12 }}>
      {ARCHIVE_KINDS.map((kind) => {
        const a = state[kind];
        return (
          <div key={kind} className="card" style={{ maxWidth: 'none', padding: '20px 20px' }} data-archive-kind={kind}>
            <strong>{labels.title(kind)}</strong>
            <p className="muted" style={{ marginTop: 4 }}>
              {labels.sub(kind)}
            </p>
            {a.parts.length === 0 && !a.running && (
              <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => void build(kind)} data-archive={kind}>
                {labels.prepare}
              </button>
            )}
            {a.running && (
              <p className="muted" style={{ marginTop: 10 }} aria-live="polite">
                {labels.preparing(a.parts.length, a.parts[0]?.parts ?? '…')}
              </p>
            )}
            {a.error && (
              <p className="muted" style={{ color: 'var(--danger)', marginTop: 8 }} role="alert">
                {labels.error(a.error)}
              </p>
            )}
            {a.parts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                {a.parts.map((p) => (
                  <a key={p.part} className="btn ghost" href={backend.mediaUrl(p.url)} download style={{ justifyContent: 'space-between', textDecoration: 'none' }} data-archive-part>
                    <span>{labels.part(p.part + 1, p.parts)}</span>
                    <span className="muted">{labels.count(p.count)}</span>
                  </a>
                ))}
                {a.error && !a.running && (
                  <button className="chip" style={{ alignSelf: 'flex-start' }} onClick={() => void build(kind, { resume: true })}>
                    {labels.retry}
                  </button>
                )}
                {!a.running && !a.error && (
                  <p className="muted" style={{ fontSize: 12 }}>
                    {labels.linksValid}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
