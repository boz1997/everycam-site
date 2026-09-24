import {
  collection, deleteDoc, doc, getDocs, limit, onSnapshot, orderBy, query, setDoc, startAfter, updateDoc, where,
  type DocumentSnapshot, type QueryDocumentSnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { hostDb, hostFunctions, hostStorage } from '../../hostSession';
import type { Guest, HostEvent, MediaItem, Mode, Report } from './types';

// Every read and write the dashboard makes — only what the app already makes as
// a client (plan §2.7, D21: no rules change). Events: create (Spark, counters 0,
// no limits), host updates of mode / revealAt / joinPaused / guestCanDownload /
// coverUri / aiPeopleEnabled; media `hidden` / delete; guest `banned`; the
// cover in Storage. Everything paid goes through the server.

const str = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export function toEvent(id: string, x: Record<string, unknown>): HostEvent {
  return {
    id,
    code: String(x.code ?? ''),
    name: String(x.name ?? ''),
    date: str(x.date),
    coverUri: str(x.coverUri),
    mode: x.mode === 'private' ? 'private' : 'open',
    revealAt: num(x.revealAt),
    timeZone: str(x.timeZone),
    planId: String(x.planId ?? 'spark'),
    hostId: String(x.hostId ?? ''),
    guestCanDownload: x.guestCanDownload !== false,
    joinPaused: x.joinPaused === true,
    aiPeoplePurchased: x.aiPeoplePurchased === true,
    aiPeopleEnabled: x.aiPeopleEnabled === true,
    createdAt: num(x.createdAt) ?? 0,
    photoCount: num(x.photoCount) ?? 0,
    videoCount: num(x.videoCount) ?? 0,
    activeGuestCount: num(x.activeGuestCount) ?? 0,
    uploadPolicy: x.uploadPolicy === 'host' ? 'host' : x.uploadPolicy === 'all' ? 'all' : null,
    limits: x.limits && typeof x.limits === 'object' ? (x.limits as HostEvent['limits']) : null,
    refunded: x.refunded === true,
    planBeforeRefund: str(x.planBeforeRefund),
    planPurchasedAt: num(x.planPurchasedAt),
    retentionAnchorAt: num(x.retentionAnchorAt),
    origin: str(x.origin),
  };
}

// ---------------------------------------------------------------- events

export function watchMyEvents(uid: string, onData: (rows: HostEvent[]) => void, onError: (e: unknown) => void): Unsubscribe {
  // Same query the uploader uses (rules: events are world-readable; the list is the host's own).
  return onSnapshot(
    query(collection(hostDb, 'events'), where('hostId', '==', uid)),
    (snap) => onData(snap.docs.map((d) => toEvent(d.id, d.data())).sort((a, b) => b.createdAt - a.createdAt)),
    onError,
  );
}

export function watchEvent(id: string, onData: (e: HostEvent | null) => void, onError: (e: unknown) => void): Unsubscribe {
  return onSnapshot(
    doc(hostDb, 'events', id),
    (snap: DocumentSnapshot) => onData(snap.exists() ? toEvent(snap.id, snap.data() as Record<string, unknown>) : null),
    onError,
  );
}

// The app's code alphabet (EC/src/utils/code.ts): no 0/O, 1/I/L, 5/S, 8/B, 2/Z.
const ALPHABET = 'ACDEFGHJKMNPQRTUVWXY34679';
/** Photographer codes start with P, consumer codes never do (code.ts, AASA split for old builds). */
export function generateEventCode(pro: boolean, random: () => number = Math.random): string {
  let code = pro ? 'P' : '';
  while (code.length < 6) {
    const ch = ALPHABET[Math.floor(random() * ALPHABET.length)];
    if (code.length === 0 && ch === 'P') continue;
    code += ch;
  }
  return code;
}

function browserTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

export interface NewEventInput {
  name: string;
  /** 'YYYY-MM-DD' or null — ALWAYS written (D8: the update rule compares `date`). */
  date: string | null;
  mode: Mode;
  hostId: string;
  pro: boolean;
}

/**
 * Create an event exactly like the app (EC/src/services/firebase/eventService.ts
 * create, :130-173): code with a clash check, Spark, counters 0, guest downloads
 * on, joins open, face matching off. Rev 2 (D8): `createdAt` is a NUMBER
 * (Date.now(); the Spark purge queries `createdAt < n` and skips events without
 * it) and `date` is always present (null when empty). Plus `origin: 'web'`
 * (harmless, rules do not look at it; webOrders.mjs and the funnel do).
 * A photographer event is always open (no private mode, rules) and gets a P code.
 */
export async function createEvent(input: NewEventInput): Promise<HostEvent> {
  let code = generateEventCode(input.pro);
  for (let i = 0; i < 5; i += 1) {
    const clash = await getDocs(query(collection(hostDb, 'events'), where('code', '==', code), limit(1)));
    if (clash.empty) break;
    code = generateEventCode(input.pro);
  }
  const ref = doc(collection(hostDb, 'events'));
  const payload = {
    code,
    name: input.name,
    date: input.date,
    coverUri: null,
    mode: input.pro ? 'open' : input.mode,
    revealAt: null,
    timeZone: browserTimeZone(),
    planId: 'spark',
    hostId: input.hostId,
    guestCanDownload: true,
    joinPaused: false,
    aiPeoplePurchased: false,
    aiPeopleEnabled: false,
    createdAt: Date.now(),
    photoCount: 0,
    videoCount: 0,
    activeGuestCount: 0,
    origin: 'web',
  };
  await setDoc(ref, payload);
  return toEvent(ref.id, payload);
}

export type EventPatch = Partial<Pick<HostEvent, 'mode' | 'revealAt' | 'joinPaused' | 'guestCanDownload' | 'aiPeopleEnabled' | 'coverUri'>>;
export function updateEvent(id: string, patch: EventPatch): Promise<void> {
  return updateDoc(doc(hostDb, 'events', id), patch);
}

const COVER_MAX_EDGE = 1600; // the app's value (eventService.ts:34)

async function toJpeg(file: File, maxEdge: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-unavailable');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
  if (!blob) throw new Error('encode-failed');
  return blob;
}

/** Cover: `events/{id}/{hostId}/cover.jpg` (storage.rules: own folder, image/*), then `coverUri`. */
export async function setCover(event: HostEvent, file: File): Promise<string> {
  const blob = await toJpeg(file, COVER_MAX_EDGE);
  const r = storageRef(hostStorage, `events/${event.id}/${event.hostId}/cover.jpg`);
  await uploadBytes(r, blob, { contentType: 'image/jpeg' });
  const url = await getDownloadURL(r);
  await updateEvent(event.id, { coverUri: url });
  return url;
}

export async function removeCover(event: HostEvent): Promise<void> {
  await deleteObject(storageRef(hostStorage, `events/${event.id}/${event.hostId}/cover.jpg`)).catch(() => undefined);
  await updateEvent(event.id, { coverUri: null });
}

/**
 * Delete an event: the cover (the host's own file) and the event document. The
 * server's onEventDeleted trigger removes every subcollection, every Storage
 * file under events/{id}/ and the host declaration (cleanup.ts) — the client
 * could only delete what its own rules allow.
 */
export async function deleteEvent(event: HostEvent): Promise<void> {
  await deleteObject(storageRef(hostStorage, `events/${event.id}/${event.hostId}/cover.jpg`)).catch(() => undefined);
  await deleteDoc(doc(hostDb, 'events', event.id));
}

// ---------------------------------------------------------------- media

function toMedia(d: QueryDocumentSnapshot): MediaItem {
  const x = d.data();
  return {
    id: d.id,
    ownerId: String(x.ownerId ?? ''),
    ownerName: String(x.ownerName ?? ''),
    kind: x.kind === 'video' ? 'video' : 'photo',
    uri: String(x.uri ?? ''),
    thumbUri: typeof x.thumbUri === 'string' ? x.thumbUri : undefined,
    path: typeof x.path === 'string' ? x.path : undefined,
    origPath: typeof x.origPath === 'string' ? x.origPath : undefined,
    origName: typeof x.origName === 'string' ? x.origName : undefined,
    width: Number(x.width ?? 0),
    height: Number(x.height ?? 0),
    takenAt: Number(x.takenAt ?? 0),
    uploadedAt: Number(x.uploadedAt ?? 0),
    hidden: x.hidden === true,
    durationSec: typeof x.durationSec === 'number' ? x.durationSec : undefined,
  };
}

export const PAGE_SIZE = 60;
export interface MediaPage { items: MediaItem[]; cursor: QueryDocumentSnapshot | null }

/** Newest first, 60 per page (the app's listMediaPage). The host sees hidden items too. */
export async function listMediaPage(eventId: string, cursor: QueryDocumentSnapshot | null): Promise<MediaPage> {
  const col = collection(hostDb, 'events', eventId, 'media');
  const q = cursor
    ? query(col, orderBy('uploadedAt', 'desc'), startAfter(cursor), limit(PAGE_SIZE))
    : query(col, orderBy('uploadedAt', 'desc'), limit(PAGE_SIZE));
  const snap = await getDocs(q);
  return { items: snap.docs.map(toMedia), cursor: snap.docs.length < PAGE_SIZE ? null : snap.docs[snap.docs.length - 1] };
}

export function setHidden(eventId: string, mediaId: string, hidden: boolean): Promise<void> {
  return updateDoc(doc(hostDb, 'events', eventId, 'media', mediaId), { hidden });
}

/** The document only: onMediaDeleted removes the files, likes and reports (counters.ts). */
export function deleteMedia(eventId: string, mediaId: string): Promise<void> {
  return deleteDoc(doc(hostDb, 'events', eventId, 'media', mediaId));
}

export async function listReports(eventId: string): Promise<Report[]> {
  const snap = await getDocs(collection(hostDb, 'events', eventId, 'reports'));
  return snap.docs.map((d) => {
    const x = d.data();
    return { id: d.id, mediaId: String(x.mediaId ?? ''), uid: String(x.uid ?? ''), createdAt: Number(x.createdAt ?? 0) };
  });
}

// ---------------------------------------------------------------- guests

export function watchGuests(eventId: string, onData: (rows: Guest[]) => void, onError: (e: unknown) => void): Unsubscribe {
  return onSnapshot(
    collection(hostDb, 'events', eventId, 'guests'),
    (snap) =>
      onData(
        snap.docs
          .map((d) => {
            const x = d.data();
            return { id: d.id, name: String(x.name ?? ''), joinedAt: Number(x.joinedAt ?? 0), banned: x.banned === true, role: typeof x.role === 'string' ? x.role : null };
          })
          .sort((a, b) => b.joinedAt - a.joinedAt),
      ),
    onError,
  );
}

/** Remove / restore (rules: the host may change `banned`, never `role`). */
export function setBanned(eventId: string, guestId: string, banned: boolean): Promise<void> {
  return updateDoc(doc(hostDb, 'events', eventId, 'guests', guestId), { banned });
}

// ---------------------------------------------------------------- callables (host session)

const call = <I, O>(name: string, timeout?: number) => httpsCallable<I, O>(hostFunctions, name, timeout ? { timeout } : undefined);

export const fn = {
  webCheckoutStart: call<Record<string, unknown>, unknown>('webCheckoutStart'),
  faceGateCheck: call<Record<string, never>, { allowed: boolean; reason: string }>('faceGateCheck'),
  faceHostDeclare: call<{ eventId: string; accepted: true; declTextVersion: string; lang: string }, { ok: boolean }>('faceHostDeclare'),
  createOwnerCode: call<{ eventId: string }, { code: string; expiresAt: number }>('createOwnerCode'),
  createEventZip: call<{ eventId: string }, { url: string; count: number; cached: boolean }>('createEventZip', 540_000),
  createAlbumArchive: call<{ eventId: string; kind: 'display' | 'original'; part: number }, { url: string; part: number; parts: number; count: number; total: number }>('createAlbumArchive', 540_000),
  deleteAccountAndData: call<Record<string, never>, { ok: boolean }>('deleteAccountAndData', 300_000),
  redeemUploadCode: call<{ code: string }, { token: string; eventId: string; hostId: string }>('redeemUploadCode'),
};

/** Firebase callable error → its code without the `functions/` prefix, and the server's message. */
export function callableError(e: unknown): { code: string; message: string } {
  const code = String((e as { code?: string })?.code ?? '').replace(/^functions\//, '');
  const message = String((e as { message?: string })?.message ?? '');
  return { code, message };
}
