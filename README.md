# sharecam-site

Sharecam'in tanıtım + katılım sitesi. GitHub Pages'te yayında:
https://boz1997.github.io/everycam-site/ (depo adı henüz eski markada — bkz. aşağısı).

## Katılım funnel'ı

QR ve davet kartlarındaki link `https://sharecam.app/e/KOD` biçimindedir. GitHub
Pages dinamik yol sunmadığı için zincir şöyle işler:

```
/e/KOD  →  404.html (kodu yoldan ayıklar)  →  e.html?code=KOD
```

`e.html` iki çıkış sunar: App Store (birincil, hiçbir zaman hata vermez) ve
"uygulamam var" için `sharecam://e/KOD` şeması — şema 1,2 sn içinde devralmazsa
sayfa App Store'a düşer.

## Universal link (henüz KAPALI)

`.well-known/apple-app-site-association` hazır ama iki eksiği var:

1. `TEAMID` yer tutucusu — Apple Developer hesabındaki gerçek Team ID ile
   değiştirilmeli (`TEAMID.com.berkoz.sharecam`).
2. Dosyanın **alan adının kökünde** sunulması gerekir (`https://sharecam.app/.well-known/…`),
   `Content-Type: application/json` ile. Proje alt yolunda (`/everycam-site/…`)
   Apple onu OKUMAZ.

Alan adı bağlanıp bu ikisi tamamlanana kadar uygulamada `UNIVERSAL_LINKS_ENABLED`
false kalmalı (`src/config.ts`): doğrulanmayan associatedDomains hiçbir işe
yaramaz, funnel zaten yukarıdaki şema zinciriyle çalışıyor.

`.nojekyll` dosyası gereklidir — Jekyll varsayılan olarak nokta ile başlayan
klasörleri yayınlamaz ve `.well-known` sessizce 404 olur.

## Açık iş

- Depo adı hâlâ `everycam-site`; marka Sharecam'e döndü. Yeniden adlandırılırsa
  uygulamadaki `SITE_URL` (`src/config.ts`) da güncellenmeli — GitHub eski adı
  yönlendirir ama iki isim arasında gezinmek karışıklık üretir.
- Destek adresi sayfalarda `app.sharecam@gmail.com`. Sharecam kutusuna geçilecekse
  önce hesap açılmalı, sonra buradaki 5 bağlantı birden değişmeli.
