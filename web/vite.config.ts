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
  },
});
