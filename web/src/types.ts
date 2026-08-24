// Uygulamadaki src/types.ts'in web'in İHTİYAÇ DUYDUĞU alt kümesi.
//
// Bilerek daraltıldı: web istemcisi misafir yüzeyidir — host ayarları, paket
// yükseltme, moderasyon burada yok. Alan adları uygulamayla BİREBİR aynı olmak
// zorunda; aynı Firestore dokümanlarını okuyup yazıyoruz.

export type VisibilityMode = 'open' | 'private';
export type MediaKind = 'photo' | 'video';

export interface EventDoc {
  id: string;
  code: string;
  name: string;
  date: string | null;
  coverUri: string | null;
  mode: VisibilityMode;
  joinPaused: boolean;
  guestCanDownload: boolean;
  hostId: string;
  activeGuestCount: number;
  photoCount: number;
  videoCount: number;
  planId: string;
}

export interface MediaDoc {
  id: string;
  ownerId: string;
  ownerName: string;
  kind: MediaKind;
  uri: string;
  /** Izgara karesi (~40 KB). ESKİ dokümanlarda yok — o hâlde ızgara `uri`ye düşer. */
  thumbUri?: string;
  width: number;
  height: number;
  takenAt: number;
  uploadedAt: number;
  hidden: boolean;
  durationSec?: number;
  likeCount: number;
  likedByMe: boolean;
}

/** Kuyruktaki bir yükleme. Native taraftaki QueueItem'ın web karşılığı. */
export interface UploadItem {
  id: string;
  file: File;
  kind: MediaKind;
  progress: number; // 0..1
  status: 'queued' | 'uploading' | 'done' | 'failed';
  error?: string;
  previewUrl: string;
}
