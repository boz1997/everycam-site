// DOSYA ALIMI — dosya seçici, klasör seçici ve sürükle-bırak için ortak parça.
// Hem misafir yükleyicisi (Uploader.tsx) hem fotoğrafçının masaüstü sayfası
// (upload/) bunu kullanır; eleme kuralı tek yerde dursun.

// MIME boş gelen dosyalar için uzantı listesi. Klasör seçiminde ve sürükle-
// bırakta tarayıcı her dosyayı getirir (accept yok sayılır); .DS_Store, .xmp,
// RAW (.cr2/.nef/.arw) gibi dosyalar burada elenir. RAW BİLEREK yok: tarayıcı
// açamaz, sunucu da (sharp) açamaz — B2B kararı gelene kadar kabul edilmiyor.
const IMAGE_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  avif: 'image/avif',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
};
const VIDEO_EXT: Record<string, string> = {
  mp4: 'video/mp4',
  m4v: 'video/x-m4v',
  mov: 'video/quicktime',
  webm: 'video/webm',
  '3gp': 'video/3gpp',
};

/**
 * Fotoğraf/video mu? Değilse null. MIME boşsa uzantıdan türetilip dosya o
 * tiple YENİDEN sarılır — events.ts `kind`, küçültme ve poster kararlarını
 * `file.type`'tan veriyor; boş tip bir .mov'u fotoğraf sanıp bitmap açmaya
 * kalkardı. `new File([file])` baytları kopyalamaz, aynı bloba referans.
 */
export function asMedia(file: File): File | null {
  if (file.name.startsWith('.')) return null;
  if (file.type.startsWith('image/') || file.type.startsWith('video/')) return file;
  if (file.type) return null;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const type = IMAGE_EXT[ext] ?? VIDEO_EXT[ext];
  if (!type) return null;
  return new File([file], file.name, { type, lastModified: file.lastModified });
}

/** Sürüklenen giriş (dosya ya da klasör) → içindeki dosyalar, alt klasörler dahil. */
export async function filesFromEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    return new Promise((res) => (entry as FileSystemFileEntry).file((f) => res([f]), () => res([])));
  }
  if (entry.isDirectory) {
    // macOS'un ZIP artığı ve gizli klasörler: içleri aynı adlı kopyalarla dolu.
    if (entry.name.startsWith('.') || entry.name === '__MACOSX') return [];
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const out: File[] = [];
    // readEntries partiler hâlinde döner (Chrome 100'er); boş parti = son.
    for (;;) {
      const batch = await new Promise<FileSystemEntry[]>((res) => reader.readEntries(res, () => res([])));
      if (batch.length === 0) break;
      for (const child of batch) out.push(...(await filesFromEntry(child)));
    }
    return out;
  }
  return [];
}

/**
 * Bırakılan DataTransfer'dan dosyalar. `webkitGetAsEntry` drop olayının
 * İÇİNDE, senkron çağrılmak zorunda — olay bitince item'lar geçersizleşir;
 * o yüzden önce girişler toplanır, okuma sonra yapılır. Entry desteği olmayan
 * tarayıcıda `dataTransfer.files`'a düşer (klasör içeriği o yolda gelmez).
 */
export function collectDrop(dt: DataTransfer): Promise<File[]> {
  const entries: FileSystemEntry[] = [];
  for (const item of Array.from(dt.items ?? [])) {
    if (item.kind !== 'file') continue;
    const entry = typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null;
    if (entry) entries.push(entry);
  }
  if (entries.length === 0) return Promise.resolve(Array.from(dt.files ?? []));
  return Promise.all(entries.map(filesFromEntry)).then((lists) => lists.flat());
}

export const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');
