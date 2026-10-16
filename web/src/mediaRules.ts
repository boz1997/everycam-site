// MEDYA KURALLARI — uygulamadaki src/plans.ts > videoMaxSeconds / keepsOriginals ile
// AYNI (Berk 16 Eki 2026). Boyut tavanı yok: storage.rules da boyuta bakmaz.
//
// • Video: her pakette tek video en fazla 120 sn; yalnız Pro Unlimited süresiz.
//   Sınır istemcide uygulanır (sunucu süre ölçmez), tıpkı eski 90 sn gibi.
// • Asıllar: Unlimited ve Pro Unlimited'da misafir/web istemcisi 2048px kopyanın
//   yanına dosyanın kendisini `orig/` altına yazar (metadata appOriginal=1); sunucu
//   türetmez. Fotoğrafçı masaüstü yüklemesi her pro pakette zaten asıl yükler.
export const VIDEO_CLIP_SECONDS = 120;

/** Tek videonun süre tavanı (sn); null = süresiz. */
export function videoMaxSeconds(planId: string): number | null {
  return planId === 'proUnlimited' ? null : VIDEO_CLIP_SECONDS;
}

/** Telefondan/web'den yüklenen fotoğrafın aslı da saklanır mı? */
export function keepsOriginals(planId: string): boolean {
  return planId === 'unlimited' || planId === 'proUnlimited';
}

/** Asıl dosyanın Storage uzantısı ve MIME'ı (kural `image/*` ister). */
export const ORIGINAL_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  tif: 'image/tiff',
  heic: 'image/heic',
  heif: 'image/heif',
  avif: 'image/avif',
  bmp: 'image/bmp',
  dng: 'image/x-adobe-dng',
  cr2: 'image/x-canon-cr2',
  cr3: 'image/x-canon-cr3',
  crw: 'image/x-canon-crw',
  nef: 'image/x-nikon-nef',
  nrw: 'image/x-nikon-nrw',
  arw: 'image/x-sony-arw',
  srf: 'image/x-sony-srf',
  sr2: 'image/x-sony-sr2',
  raf: 'image/x-fuji-raf',
  orf: 'image/x-olympus-orf',
  rw2: 'image/x-panasonic-rw2',
  pef: 'image/x-pentax-pef',
  srw: 'image/x-samsung-srw',
  '3fr': 'image/x-hasselblad-3fr',
  x3f: 'image/x-sigma-x3f',
  erf: 'image/x-epson-erf',
  kdc: 'image/x-kodak-kdc',
  mrw: 'image/x-minolta-mrw',
  mos: 'image/x-leaf-mos',
  mef: 'image/x-mamiya-mef',
  iiq: 'image/x-phaseone-iiq',
};
/** Ham (RAW) uzantılar: tarayıcı önizleyemez, sunucu gömülü JPEG'den türetir. */
export const RAW_EXT = new Set(Object.keys(ORIGINAL_TYPES).filter((e) => !['jpg', 'png', 'webp', 'gif', 'tif', 'heic', 'heif', 'avif', 'bmp'].includes(e)));

export function originalExt(name: string): string {
  const raw = name.split('.').pop()?.toLowerCase() ?? '';
  const ext = raw === 'jpeg' ? 'jpg' : raw === 'tiff' ? 'tif' : raw;
  return ORIGINAL_TYPES[ext] ? ext : 'jpg';
}
