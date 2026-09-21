import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Çıktı depo KÖKÜNDEKİ /join klasörüne yazılır: GitHub Pages statik dosyaları
// oradan sunuyor ve tanıtım sayfaları (index/privacy/terms/support) aynı
// depoda duruyor.
//
// base: './' KASITLI — mutlak yol yazsaydık depo adı değiştiğinde
// (everycam-site → sharecam-site) ya da özel alan adına geçtiğimizde bütün
// varlık yolları kırılırdı. Göreli yol her iki durumda da çalışır.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../join',
    emptyOutDir: true,
    // İki sayfa: misafir istemcisi (/join/) ve fotoğrafçının masaüstü yükleyicisi
    // (/join/upload/). Kısa adres sharecam.app/upload 404.html ile buraya düşer.
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        upload: resolve(__dirname, 'upload/index.html'),
      },
    },
  },
});
