import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Çıktı depo KÖKÜNDEKİ /join klasörüne yazılır: GitHub Pages statik dosyaları
// oradan sunuyor ve tanıtım sayfaları (index/privacy/terms/support) aynı
// depoda duruyor.
//
// base: './' KASITLI — mutlak yol yazsaydık depo adı değiştiğinde
// (everycam-site → sharecam-site) ya da özel alan adına geçtiğimizde bütün
// varlık yolları kırılırdı. Göreli yol her iki durumda da çalışır.
//
// YEREL YIĞIN (plan §5, EC/local): `vite --mode localstack` YALNIZ dev sunucusunda
// src/backend/active.ts → local.ts ve checkout.ts → localCheckout.ts takası yapar
// (emülatörler + sahte Paddle / Polar). Bu modda BUILD reddedilir; üretim paketinin
// modül grafiği yerel dosyaları hiç içeremez. scripts/check-dist.mjs (postbuild)
// ayrıca her build'i emülatör portu / demo proje / sahte Paddle-Polar izine karşı tarar.
const LOCAL_MODE = 'localstack';
const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

function localBackend(): Plugin {
  const swap = new Map<string, string>([
    [here('./src/backend/active.ts'), here('./src/backend/local.ts')],
    [here('./src/backend/checkout.ts'), here('./src/backend/localCheckout.ts')],
  ]);
  return {
    name: 'sharecam-local-backend',
    enforce: 'pre',
    apply: 'serve',
    async resolveId(source, importer, options) {
      const r = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!r) return null;
      return swap.get(r.id.split('?')[0]) ?? null;
    },
    // Her sayfada rozet: yerel yığının hiçbir ekran görüntüsü üretimle karıştırılmasın.
    transformIndexHtml() {
      return [{
        tag: 'div',
        injectTo: 'body',
        attrs: {
          id: 'local-stack-badge',
          style: 'position:fixed;right:8px;bottom:8px;z-index:2147483647;padding:4px 8px;background:#9C3D2E;color:#F3EEE2;font:600 11px/1.3 -apple-system,sans-serif;letter-spacing:.06em;text-transform:uppercase;pointer-events:none',
        },
        children: 'Local · demo-sharecam emulators',
      }];
    },
  };
}

export default defineConfig(({ command, mode }) => {
  if (command === 'build' && mode === LOCAL_MODE) {
    throw new Error(`refusing to build in --mode ${LOCAL_MODE}: the local backend never goes into a bundle`);
  }
  const local = command === 'serve' && mode === LOCAL_MODE;
  return {
    plugins: local ? [react(), localBackend()] : [react()],
    base: './',
    server: local ? { host: '127.0.0.1', strictPort: true } : undefined,
    build: {
      outDir: '../join',
      emptyOutDir: true,
      // Dört sayfa: misafir istemcisi (/join/), fotoğrafçının masaüstü yükleyicisi
      // (/join/upload/), çiftin albümü (/join/album/) ve etkinlik sahibinin paneli
      // (/join/host/; kısa adres sharecam.app/host → host/index.html yönlendirir).
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          upload: resolve(__dirname, 'upload/index.html'),
          album: resolve(__dirname, 'album/index.html'), // çiftin albüm sayfası (/join/album/)
          host: resolve(__dirname, 'host/index.html'), // etkinlik sahibinin paneli (/join/host/)
        },
      },
    },
  };
});
