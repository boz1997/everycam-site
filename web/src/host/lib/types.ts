// The Firestore documents the dashboard reads and writes. Field names are the
// app's (EC/src/types.ts, eventService.ts toEvent) — the same documents.

export type Mode = 'open' | 'private';

export interface HostEvent {
  id: string;
  code: string;
  name: string;
  /** 'YYYY-MM-DD' or null. Always present on the document (rules compare it on every update). */
  date: string | null;
  coverUri: string | null;
  mode: Mode;
  /** ms, scheduled reveal (private → open), or null. */
  revealAt: number | null;
  timeZone: string | null;
  planId: string;
  hostId: string;
  guestCanDownload: boolean;
  joinPaused: boolean;
  aiPeoplePurchased: boolean;
  aiPeopleEnabled: boolean;
  /** ms since epoch (a NUMBER: the purge queries it, D8). 0 = unknown. */
  createdAt: number;
  photoCount: number;
  videoCount: number;
  activeGuestCount: number;
  uploadPolicy: 'all' | 'host' | null;
  /** Limits frozen at purchase (-1 = unlimited). Absent on Spark / old events. */
  limits: { photos?: number; videos?: number; guests?: number; retentionDays?: number } | null;
  refunded: boolean;
  planBeforeRefund: string | null;
  planPurchasedAt: number | null;
  retentionAnchorAt: number | null;
  origin: string | null;
}

export interface MediaItem {
  id: string;
  ownerId: string;
  ownerName: string;
  kind: 'photo' | 'video';
  uri: string;
  thumbUri?: string;
  path?: string;
  origPath?: string;
  origName?: string;
  width: number;
  height: number;
  takenAt: number;
  uploadedAt: number;
  hidden: boolean;
  durationSec?: number;
}

export interface Guest {
  id: string;
  name: string;
  joinedAt: number;
  banned: boolean;
  role: string | null;
}

export interface Report {
  id: string;
  mediaId: string;
  uid: string;
  createdAt: number;
}
