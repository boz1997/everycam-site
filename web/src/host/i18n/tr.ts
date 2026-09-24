// Sharecam host dashboard — Türkçe (plan §3.6, D15; WP-H).
//
// Hitap "sen" (uygulamayla aynı), "Etkinlik sahibi" = host, "paket", "yüz eşleştirme",
// "Gizli mod" / "Açık galeri", "Canlı duvar"; masaüstü eşleştirme = "bağla" (web yükleme
// sayfasıyla aynı). Tırnak “…”, kesme ’, üç nokta …. Yeni metinler taslak: Berk kontrol eder.
//
// Same keys and order as en.ts (tsc fails on a missing or stale key). A `// app: <key>`
// comment marks a string copied verbatim from EC/src/i18n/locales/tr.ts (native-reviewed
// 23 Sep 2026, EC 5c05c8e; {{x}} → {x}); "(adapted)" = the app wording with the same change
// the English line makes. Every other string is new and is checked before go-live.
// face.* declaration and notice texts are versioned (declTextVersion 2026-09-23): never edit
// them here, only together with the app and the server.

import type { Dict } from './en';

const tr: Dict = {
  // ---------------------------------------------------------------- common
  'common.back': 'Geri',
  'common.cancel': 'Vazgeç', // app: common.cancel
  'common.close': 'Kapat', // app: common.close
  'common.delete': 'Sil', // app: common.delete
  'common.on': 'Açık', // app: common.on
  'common.off': 'Kapalı', // app: common.off
  'common.ok': 'Tamam',
  'common.copy': 'Kopyala',
  'common.copied': 'Kopyalandı', // app: face.noticeCopied
  'common.remove': 'Kaldır', // app: create.coverRemove
  'common.saving': 'Kaydediliyor…',
  'common.loading': 'Yükleniyor…',
  'common.loadFailed': 'Bu sayfa yüklenemedi',
  'common.checkConnection': 'Bağlantını kontrol edip tekrar dene.',
  'common.tryAgain': 'Bir şeyler ters gitti. Tekrar dene.',
  'common.prev': 'Önceki',
  'common.next': 'Sonraki',

  // ---------------------------------------------------------------- page titles (browser tab)
  'title.events': 'Etkinliklerin',
  'title.signin': 'Giriş yap',
  'title.new': 'Etkinliğini aç',
  'title.account': 'Hesap',

  // ---------------------------------------------------------------- shell
  'shell.tag': 'Etkinlik sahibi',
  'shell.language': 'Dil',
  'shell.accountMenu': 'Hesap menüsü',
  'shell.events': 'Etkinliklerin',
  'shell.account': 'Hesap',
  'shell.signOut': 'Çıkış yap', // app: account.signOut
  'shell.signedInAs': 'Giriş yapan: {who}',
  'shell.paired': 'Uygulamaya bağlı',
  'shell.pairedLong': 'Bu bilgisayar Sharecam uygulamasına bağlı. Henüz kendi giriş yöntemi yok.',
  'shell.linkBannerTitle': 'Bu hesabı korumak için bir giriş yöntemi ekle',
  'shell.linkBannerBody': 'Bu bilgisayar Sharecam uygulamana bağlı. Uygulama olmadan da geri dönebilmek için e-posta ya da Google girişi ekle. Web’den paket almak için de bu gerekli.',
  'shell.linkBannerCta': 'Giriş yöntemi ekle',
  'nav.events': 'Etkinliklerin',
  'nav.signin': 'Giriş yap',
  'legal.webTerms': 'Web satın alma şartları',
  'legal.refund': 'İade politikası',
  'legal.privacy': 'Gizlilik', // app: legal.privacy
  'legal.terms': 'Şartlar', // app: legal.terms
  'legal.support': 'Destek', // app: legal.support
  'legacy.title': 'Bu bilgisayarı yeniden bağla',
  'legacy.body': 'Bu tarayıcı etkinliklerine eski yükleme sayfasıyla bağlanmıştı. Buradaki misafir sayfası yine normal çalışsın diye oturumu kapattık. Yüklemek için bilgisayarı Sharecam uygulamasıyla bir kez daha bağla ya da giriş yap.',

  // ---------------------------------------------------------------- sign in
  'signin.kicker': 'Etkinlik sahibi paneli',
  'signin.title': 'Etkinliklerine giriş yap',
  'signin.lead': 'Uygulamada kullandığın girişi kullan (Ayarlar → Hesap). Orada hiç giriş yapmadıysan önce orada yap.',
  'signin.appKicker': 'Uygulamayı zaten kullanıyor musun?',
  'signin.appTitle': 'Aynı hesap, aynı etkinlikler',
  'signin.appBody': 'Sharecam uygulamasında açtığın etkinlikler, uygulamada kullandığın hesapla (Ayarlar → Hesap) giriş yaptığında burada görünür.',
  'auth.google': 'Google ile devam et', // app: account.continueGoogle
  'auth.apple': 'Apple ile devam et', // app: account.continueApple
  'auth.soon': 'Yakında',
  'auth.appleSoon': 'Uygulamada Apple ile mi giriş yaptın? Web’de Apple ile giriş yakında geliyor.',
  'auth.orEmail': 'ya da e-postayla',
  'auth.email': 'E-posta',
  'auth.password': 'Parola',
  'auth.passwordHint': 'En az 6 karakter.',
  'auth.signinCta': 'Giriş yap',
  'auth.createCta': 'Hesap oluştur',
  'auth.resetCta': 'Sıfırlama linki gönder',
  'auth.resetTitle': 'Parolanı sıfırla',
  'auth.resetSent': '{email} adresine ait bir hesap varsa sıfırlama linki yolda. Gelen kutuna bak.',
  'auth.toCreate': 'Yeni misin? Hesap oluştur',
  'auth.toReset': 'Parolanı mı unuttun?',
  'auth.toSignin': 'Girişe dön',
  'auth.errWrong': 'E-posta ya da parola yanlış.',
  'auth.errEmailTaken': 'Bu e-postanın zaten bir hesabı var. Onunla giriş yap.',
  'auth.errWeak': 'En az 6 karakterli bir parola seç.',
  'auth.errEmail': 'Geçerli bir e-posta adresi gir.',
  'auth.errPopupBlocked': 'Tarayıcın giriş penceresini engelledi. Bu site için açılır pencerelere izin verip tekrar dene.',
  'auth.errProviderOff': 'Bu giriş yöntemi bu sitede henüz yok. E-postayla giriş yap.',
  'auth.errOffline': 'Bağlantı yok. İnternetini kontrol edip tekrar dene.',
  'auth.errTooMany': 'Çok fazla deneme oldu. Bir dakika bekleyip tekrar dene.',
  'auth.errDisabled': 'Bu hesap devre dışı bırakıldı. Destek sayfasından bize yaz.',
  'auth.errRecent': 'Güvenliğin için çıkış yapıp yeniden giriş yap, sonra bu adımı tekrarla.',
  'auth.errAlreadyLinked': 'Bu giriş yöntemi hesabına zaten ekli.',
  'auth.errGeneric': 'Giriş yapılamadı, tekrar dene.', // app: account.errorGeneric

  // ---------------------------------------------------------------- pair with the app
  'pair.kicker': 'Fotoğrafçılar için',
  'pair.title': 'Sharecam uygulamasıyla bağlan',
  'pair.body': 'Web’de henüz girişin yok mu? Bu bilgisayarı Sharecam uygulamandaki hesaba bağla. Fotoğrafçı etkinliklerinde çalışır.',
  'pair.open': 'Uygulamayla bağlan',
  'pair.qrTitle': 'Bu kodu uygulamayla okut',
  'pair.step1': 'Sharecam uygulamasında fotoğrafçı etkinliğini aç.',
  'pair.step2': '“Bilgisayardan yükle”ye, sonra “Bilgisayardaki QR’ı okut”a dokun.',
  'pair.step3': 'Telefonda onayla. Bu sayfa kendiliğinden giriş yapar.',
  'pair.qrAlt': 'Sharecam uygulamasıyla bağlanmak için QR kod',
  'pair.qrFoot': 'Kod birkaç dakikada bir yenilenir.',
  'pair.qrError': 'Kod oluşturulamadı. Bunun yerine aşağıdaki 6 karakterlik kodu kullan.',
  'pair.connecting': 'Bağlanıyor…',
  'pair.orCode': 'ya da uygulamadaki kodu gir',
  'pair.codeLabel': 'Uygulamadaki kod',
  'pair.codeCta': 'Bağla',
  'pair.foot': 'Kod, bu bilgisayarda senin adına oturum açar. Yalnız güvendiğin bir bilgisayarda kullan.', // app: uploadLink.footer (adapted)
  'pair.errNotFound': 'Bu kod geçerli değil. Uygulamadan kontrol et.',
  'pair.errExpired': 'Bu kodun süresi doldu. Uygulamada yeni kod üret.',
  'pair.errUsed': 'Bu kod zaten kullanıldı. Uygulamada yeni kod üret.',
  'pair.errGeneric': 'Bu bilgisayar bağlanamadı. Bağlantını kontrol edip tekrar dene.',

  // ---------------------------------------------------------------- link a sign-in (paired accounts)
  'link.kicker': 'Bir adım kaldı',
  'link.title': 'Bu hesaba bir giriş yöntemi ekle',
  'link.lead': 'Etkinliklerin olduğu yerde kalır. Sonra burada bu yöntemle giriş yapabilirsin; uygulama da eskisi gibi çalışmaya devam eder.',
  'link.buyLead': 'Web’den satın almak için geri dönebileceğin bir hesap gerekir: makbuzlar e-postaya gider ve paket, saklama süresi boyunca bu etkinliğe aittir. Önce bir giriş yöntemi ekle; etkinliklerin olduğu yerde kalır.',
  'link.google': 'Google girişi ekle',
  'link.apple': 'Apple girişi ekle',
  'link.emailCta': 'E-posta girişi ekle',
  'link.inUseTitle': 'Bu girişin zaten bir Sharecam hesabı var',
  'link.inUseBody': 'Uygulamada bu hesapla giriş yap (Ayarlar → Hesap); uygulama etkinliklerini oraya taşır. Sonra burada da aynı hesapla giriş yap.',
  'link.inUseBack': 'Başka bir giriş dene',

  // ---------------------------------------------------------------- event list
  'list.kicker': 'Etkinlik sahibi paneli',
  'list.title': 'Etkinliklerin',
  'list.lead': 'Web’den ve uygulamadan açtığın tüm etkinlikler.',
  'list.leadEmpty': 'Etkinlik aç, QR kodu paylaş, her fotoğrafı topla.', // app: welcome.hostDesc
  'list.create': 'Etkinliğini aç',
  'list.createPro': 'Fotoğrafçı etkinliği',
  'list.groupPro': 'Fotoğrafçı etkinlikleri',
  'list.groupEvents': 'Etkinlikler',
  'list.groupAll': 'Etkinlikler',
  'list.count': 'toplam {n}',
  'list.guestsShort': '{v} misafir',
  'list.photosShort': '{v} fotoğraf',
  'list.keptUntil': '{date} tarihine kadar saklanır',
  'list.deletion': 'Saklama bitişi',
  'list.waiting': 'Henüz paket yok — paket aktif olunca QR açılır',
  'list.emptyTitle': 'Henüz etkinlik yok', // app: dashboard.emptyTitle
  'list.emptyBody': '60 saniyede hazır: ad, tarih, gizlilik — QR kodun basılmaya hazır. Etkinliklerini uygulamada mı açtın? Burada, orada kullandığın hesapla giriş yap.', // app: dashboard.emptyBody (+ one sentence)
  'list.findHint': 'Uygulamada açtığın bir etkinliği bulamıyor musun? Orada kullandığın hesapla giriş yap (Ayarlar → Hesap). Hiç giriş yapılmamış bir uygulamadaki etkinlikler, orada giriş yapana kadar o telefonda kalır.',

  // ---------------------------------------------------------------- stats, units, plans
  'stat.guests': 'Misafir',
  'stat.photos': 'Fotoğraf',
  'stat.videos': 'Video',
  'unit.days': '{n} gün',
  'unit.month': '1 ay',
  'unit.months': '{n} ay',
  'unit.year': '1 yıl',
  'unit.years': '{n} yıl',
  'unit.unlimited': 'Sınırsız',
  'unit.unlimitedShort': 'sınır yok',
  'plan.free': 'Ücretsiz', // app: paywall.free
  'plan.perEvent': 'etkinlik başına', // app: paywall.perEvent
  'plan.popular': 'En çok seçilen', // app: plans.wedding.badge
  'plan.storage': 'Saklama',
  'plan.refunded': 'İade edildi',
  'plan.awaiting': 'Paket seç',
  'plan.webSoon': 'Yakında web’de',
  'plan.none': 'Henüz paket yok',
  'plan.wallIncluded': 'Canlı duvar dahil',

  // ---------------------------------------------------------------- create
  'new.kicker': 'Yeni etkinlik',
  'new.kickerPro': 'Yeni fotoğrafçı etkinliği',
  'new.title': 'Etkinliğini aç',
  'new.titlePro': 'Fotoğrafçı etkinliği aç',
  'new.lead': 'Adını koy, fotoğrafları kimin göreceğini seç, bir paket seç. Her etkinlik Spark ile ücretsiz başlar.',
  'new.leadPro': 'Bilgisayarından yüklersin, orijinaller saklanır. Misafirler QR’ı okutur, albüme göz atar ve selfie ile kendi fotoğraflarını bulur.',
  'new.tierLabel': 'Etkinlik türü',
  'new.tierEvents': 'Etkinlikler',
  'new.tierPro': 'Fotoğrafçılar',
  'new.details': 'Etkinlik bilgileri', // app: create.step1Title
  'new.name': 'Etkinliğine ad ver', // app: create.titleName
  'new.namePlaceholder': 'Ayşe & Mehmet’in Düğünü', // app: create.namePlaceholder
  'new.nameRequired': 'Lütfen etkinliğe bir ad ver.',
  'new.date': 'Etkinlik tarihi (isteğe bağlı)', // app: create.dateLabel
  'new.dateHint': 'Tarih davet kartlarında görünür. Saklama süresi bu günden itibaren sayılır.',
  'new.who': 'Fotoğrafları kim görsün?', // app: create.titleMode
  'new.modeHint': 'Bunu sonra Ayarlar’dan değiştirebilirsin.', // app: create.modeHint
  'new.cover': 'Kapak fotoğrafı (isteğe bağlı)',
  'new.coverAdd': 'Kapak fotoğrafı ekle',
  'new.coverChange': 'Değiştir',
  'new.locked': 'Ad ve tarih sonradan değiştirilemez: kartlarına basılırlar.',
  'new.package': 'Paket',
  'new.consumerSoon': 'Ücretli paketler yakında web’de. Şimdi Spark ile ücretsiz başla, sonra burada ya da uygulamada yükselt.',
  'new.proSoonTitle': 'Fotoğrafçı paketleri yakında web’de',
  'new.proSoonBody': 'O zamana kadar Sharecam iPhone uygulamasında satılıyor. Orada açtığın etkinlikler aynı girişle burada görünür.',
  'new.proRegionLater': 'Giriş yaptıktan sonra yüz eşleştirmenin bulunduğun yerde sunulup sunulmadığını kontrol ederiz.',
  'new.ctaFree': 'Etkinliği aç',
  'new.ctaPaid': 'Aç ve öde · {plan} {price}',
  'new.created': 'Etkinlik açıldı.',
  'new.createFailed': 'Etkinlik açılamadı. Bağlantını kontrol edip tekrar dene.',
  'new.backToForm': 'Forma dön',
  'new.stepAccount': 'Az kaldı',
  'new.accountTitle': 'Etkinliğini kaydetmek için giriş yap',
  'new.accountLead': 'Etkinliğin, geri dönebileceğin bir hesaba bağlanmalı. Uygulamada bir girişin varsa aynısını kullan.',
  'new.summary': 'Etkinliğin',
  'mode.openTitle': 'Açık galeri', // app: create.openTitle
  'mode.openDesc': 'Yüklenen her şeyi herkes görür ve beğenir. Canlı ortak albüm.', // app: create.openDesc
  'mode.privateTitle': 'Gizli mod', // app: create.privateTitle
  'mode.privateDesc': 'Her şeyi yalnız sen görürsün; misafirler sadece kendi yüklediklerini görür. Sürpriz albüm için ideal.', // app: create.privateDesc

  // ---------------------------------------------------------------- event page
  'event.kicker': 'Etkinlik',
  'event.kickerPro': 'Fotoğrafçı etkinliği', // app: hostEvent.hostOnlyTitle
  'event.noDate': 'Tarih belirlenmedi', // app: hostEvent.noDate
  'event.codeLine': 'Kod {code}',
  'event.goneTitle': 'Bu etkinlik artık yok', // app: eventGone.title
  'event.goneBody': 'Silinmiş ya da saklama süresi dolmuş olabilir.', // app: eventGone.body
  'event.notYoursTitle': 'Bu etkinlik başka bir hesaba ait',
  'event.notYoursBody': 'Etkinliği açan hesapla giriş yap — uygulamada kullandığın hesapla.',
  'tab.label': 'Etkinlik bölümleri',
  'tab.overview': 'Genel bakış',
  'tab.gallery': 'Galeri',
  'tab.guests': 'Misafirler', // app: hostEvent.tabGuests
  'tab.settings': 'Ayarlar', // app: hostEvent.tabSettings
  'tab.plan': 'Paket', // app: hostEvent.planTitle
  'tab.downloads': 'İndirmeler',

  // overview
  'overview.createdTitle': 'Etkinlik açıldı!', // app: qr.createdTitle
  'overview.createdBody': 'QR kodu misafirlerinle paylaş — her kare galerine düşer.', // app: qr.createdSubtitle
  'overview.createdBodyPro': 'Fotoğraflarını bu bilgisayardan yükle. Misafirler QR’ı okutup albüme göz atar ve kendilerini bulur.',
  'overview.stats': 'Şu ana kadar',
  'overview.statsPro': 'Albümde',
  'overview.package': 'Paket', // app: hostEvent.planTitle
  'overview.keptUntil': 'Saklama bitişi',
  'overview.face': 'Yüz eşleştirme', // app: hostEvent.aiTitle
  'overview.faceNot': 'Bu pakette yok',
  'overview.wall': 'Canlı duvar', // app: hostEvent.wallTitle
  'overview.included': 'Dahil',
  'overview.changePackage': 'Paketi değiştir',
  'overview.refundedNote': 'Bu etkinliğin ödemesi iade edildi. Albüm saklama süresi bitene kadar kalır; yeniden paket alınırsa tekrar açılır.',
  'qr.kicker': 'Davet',
  'qr.title': 'Misafirler tek adımda katılır', // app: qr.title
  'qr.body': 'QR’ı masalara koy ya da linki gönder. Misafirler adını yazar ve telefonunun tarayıcısından paylaşır — uygulama yok, hesap yok.',
  'qr.titlePro': 'Misafirlerin QR’ı',
  'qr.bodyPro': 'Misafirler okutup albüme göz atar, fotoğraf kaydeder ve selfie ile kendini bulur. Yalnız sen yüklersin.',
  'qr.codeLabel': 'Etkinlik kodu', // app: qr.codeLabel
  'qr.linkLabel': 'Misafir linki',
  'qr.alt': '{code} etkinliğinin QR kodu',
  'qr.png': 'QR’ı indir (PNG)',
  'qr.share': 'Daveti Paylaş', // app: qr.share
  'qr.shareText': '“{name}” fotoğraf albümüne katıl (kod {code})',
  'qr.faceLine': 'Yüz eşleştirme açık: basılan QR, misafirler için tek satırlık bildirimi taşır.',
  'upload.kicker': 'Yükleme',
  'upload.title': 'Bilgisayarından yükle', // app: uploadLink.title
  'upload.body': 'Bilgisayarından bütün bir klasörü sürükleyip bırak. Orijinaller tam çözünürlükte saklanır; misafirler hafif önizlemeleri görür.', // app: uploadLink.subtitle
  'upload.cta': 'Orijinalleri yükle',
  'upload.countOf': '/ {cap} fotoğraf',
  'upload.countUnlimited': 'fotoğraf, sınır yok',
  'owner.title': 'Çiftle paylaş', // app: hostEvent.shareOwnerTitle
  'owner.body': 'Çifte tek kullanımlık bir kod ver. Çift, sharecam.app/album adresinde tüm albümü görür ve hepsini indirir — tam çözünürlükte, parçalar hâlinde.', // app: hostEvent.shareOwnerBody
  'owner.cta': 'Çift için kod oluştur', // app: hostEvent.shareOwnerCta
  'owner.newCode': 'Yeni kod', // app: ownerLink.newCode
  'owner.expires': '{time} içinde geçersiz olur · tek kullanımlık', // app: ownerLink.expiresIn
  'owner.expired': 'Bu kodun süresi doldu', // app: ownerLink.expired
  'owner.link': 'Albüm linki',
  'owner.foot': 'Bu kodu yalnız çift almalı — tam albümü indirmeye açar.', // app: ownerLink.footer
  'owner.error': 'Kod üretilemedi. Bağlantını kontrol edip tekrar dene.', // app: ownerLink.error
  'wall.title': 'Canlı duvar', // app: hostEvent.wallTitle
  'wall.openBody': 'Duvar hazır. Bu linki mekânın TV’sinde, laptopta veya projeksiyonda aç — kablo yok, uygulama yok.',
  'wall.privateWarning': 'Gizli modda yüklemeler sen galeriyi açana kadar saklı kalır, bu yüzden duvar kapalı. Kullanmak için açık galeriye geç.', // app: wall.privateWarning
  'await.kicker': 'Fotoğrafçı etkinliği',
  'await.title': 'QR’ını almak için paket seç',
  'await.body': 'Bu etkinliğin henüz fotoğrafçı paketi yok. QR, kod ve yükleme sayfası paket aktif olur olmaz açılır. Ad ve tarih kaydedildi.',
  'await.cta': 'Paket seç',

  // expiry (D19)
  'expiry.title': '“{name}” fotoğrafları {n} gün içinde silinecek',
  'expiry.titleOne': '“{name}” fotoğrafları yarın silinecek',
  'expiry.todayTitle': '“{name}” fotoğrafları bugün silinecek',
  'expiry.body': 'Saklama süresi {date} tarihinde bitiyor. Albümü o güne kadar indir — sonrasında geri getirilemez.',
  'expiry.download': 'İndir',
  'expiry.listTitle': 'Saklama süresi yakında bitiyor',
  'expiry.listBody': 'Bu tarihten sonra fotoğraflar silinir ve geri getirilemez. Saklamak istediklerini indir.',
  'expiry.whenDays': '{n} gün içinde',
  'expiry.whenTomorrow': 'yarın',
  'expiry.whenToday': 'bugün',
  'expiry.icsShort': 'Hatırlatıcı',
  'expiry.ics': 'Takvime hatırlatıcı ekle',
  'expiry.icsTitle': 'Sharecam fotoğraflarını indir: {name}',
  'expiry.icsBody': '“{name}” fotoğrafları {date} tarihinde silinecek. İndirmek için etkinlik sahibi panelini aç.',

  // gallery
  'gallery.count': '{n} öğe · {shown} yüklendi',
  'gallery.filter': 'Göster',
  'gallery.all': 'Tümü', // app: gallery.all
  'gallery.reportedN': 'Bildirilenler ({n})', // app: hostEvent.reportedFilter
  'gallery.hiddenN': 'Gizlenenler ({n})',
  'gallery.hidden': 'Gizlendi',
  'gallery.reported': 'Bildirildi',
  'gallery.hide': 'Misafirlerden gizle',
  'gallery.show': 'Misafirlere göster',
  'gallery.hiddenToast': 'Misafirlerden gizlendi.',
  'gallery.shownToast': 'Misafirler yeniden görebilir.',
  'gallery.deleteTitle': 'Bu fotoğraf silinsin mi?', // app: hostEvent.deleteTitle
  'gallery.deleteBody': 'Galeriden kaldırılacak.', // app: hostEvent.deleteBody
  'gallery.deletedToast': 'Silindi.',
  'gallery.more': 'Daha fazla',
  'gallery.emptyTitle': 'Henüz fotoğraf yok', // app: hostEvent.emptyTitle
  'gallery.emptyBody': 'QR’ı masalara koy — ilk kare burada belirecek.',
  'gallery.emptyPro': 'Bilgisayarından yükle — orijinaller saklanır, misafirler galeriyi dakikalar içinde görür.', // app: hostEvent.emptyProBody
  'gallery.noneReported': 'Yüklenenler arasında bildirilen yok.',
  'gallery.noneHidden': 'Yüklenenler arasında gizlenen yok.',
  'gallery.viewer': 'Fotoğraf görüntüleyici',
  'gallery.openItem': 'Fotoğrafı aç: {name}',
  'gallery.photoAlt': 'Fotoğraf: {name}',
  'gallery.unknownOwner': 'Misafir',
  'gallery.openFull': 'Tam boyutta aç',

  // guests
  'guests.emptyTitle': 'Henüz misafir yok', // app: guests.emptyTitle
  'guests.emptyBody': 'QR ya da kodla katılan herkes burada adıyla görünür.', // app: guests.emptyBody
  'guests.ban': 'Çıkar', // app: guests.ban
  'guests.unban': 'Geri al', // app: guests.unban
  'guests.bannedTag': 'çıkarıldı', // app: guests.bannedTag
  'guests.banTitle': '{name} çıkarılsın mı?', // app: guests.banTitle
  'guests.banBody': 'Yeniden katılamaz ve yükleyemez. Fotoğrafları kalır (galeriden silebilirsin).', // app: guests.banBody
  'guests.owner': 'Albüm sahibi',
  'guests.noName': 'Misafir',
  'guests.joined': 'katılım {time}',
  'guests.removedToast': '{name} çıkarıldı.',
  'guests.restoredToast': '{name} yeniden katılabilir.',
  'guests.capTitle': 'Bu etkinlikteki misafirler',
  'guests.capBody': 'Çıkarılan misafirler sayılmaz; yerleri yeniden boşalır.',
  'guests.full': 'Misafir sınırına ulaşıldı ({limit}). Daha fazlası için paketi yükselt.', // app: guests.limitFull (adapted)

  // settings
  'settings.galleryTitle': 'Kim katılır, kim görür',
  'settings.privateTitle': 'Gizli mod', // app: hostEvent.privateTitle
  'settings.privateOn': 'Misafirler yalnız kendi fotoğraflarını görür.', // app: hostEvent.privateOn
  'settings.privateOff': 'Herkes tüm galeriyi görür.', // app: hostEvent.privateOff
  'settings.statePrivate': 'Gizli', // app: hostEvent.statePrivate
  'settings.statePublic': 'Herkese açık', // app: hostEvent.statePublic
  'settings.revealTitle': 'Galeri herkese açılsın mı?', // app: hostEvent.revealTitle
  'settings.revealBody': 'Misafirler artık birbirinin fotoğraflarını görecek. Bu bir “açılış” — emin misin?', // app: hostEvent.revealBody
  'settings.revealConfirm': 'Evet, aç', // app: hostEvent.revealConfirm
  'settings.autoRevealTitle': 'Otomatik açılış', // app: hostEvent.revealSchedTitle
  'settings.autoRevealOn': 'Galeri {time} herkese açılır.', // app: hostEvent.revealSchedOn
  'settings.autoRevealOff': 'Kapalı: sen açana kadar gizli kalır.', // app: hostEvent.revealSchedOff
  'settings.revealPick': 'Tarih ve saati seç', // app: hostEvent.revealPick
  'settings.pauseTitle': 'Yeni katılımları durdur', // app: hostEvent.pauseTitle
  'settings.pauseOn': 'Yeni misafir katılamaz. Katılmış olanlar kalır.', // app: hostEvent.pauseOn
  'settings.pauseOff': 'QR ya da kodu olan herkes katılabilir.', // app: hostEvent.pauseOff
  'settings.statePaused': 'Durduruldu', // app: hostEvent.statePaused
  'settings.stateOpen': 'Açık', // app: hostEvent.stateOpen
  'settings.downloadTitle': 'Misafir indirmeleri', // app: hostEvent.downloadTitle
  'settings.downloadDesc': 'Misafirler fotoğrafları kaydedebilir.', // app: hostEvent.downloadDesc
  'settings.hostOnlyTitle': 'Fotoğrafçı etkinliği', // app: hostEvent.hostOnlyTitle
  'settings.hostOnlyBody': 'Yalnız sen yüklersin. Misafirler galeriyi görür, fotoğraf kaydeder ve selfie ile kendini bulur. Bu ayar değiştirilemez.', // app: hostEvent.hostOnlyBody
  'settings.detailsTitle': 'Etkinlik bilgileri', // app: hostEvent.detailsTitle
  'settings.name': 'Ad',
  'settings.date': 'Tarih',
  'settings.code': 'Kod',
  'settings.noCover': 'Kapak fotoğrafı yok',
  'settings.coverAdd': 'Kapak fotoğrafı ekle',
  'settings.coverChange': 'Kapağı değiştir',
  'settings.coverSaved': 'Kapak kaydedildi.',
  'settings.coverRemoved': 'Kapak kaldırıldı.',
  'settings.lockedNote': 'Ad ve tarih kilitli; böylece ekran her zaman basılı kartlarınla aynı kalır.',
  'settings.saved': 'Kaydedildi.',
  'settings.dangerTitle': 'Tehlikeli bölge', // app: hostEvent.dangerTitle
  'settings.dangerBody': 'Silmek; etkinliği, fotoğraflarını ve misafir listesini herkes için kaldırır — misafirlerin dahil. Bu işlem geri alınamaz.', // app: hostEvent.dangerBody
  'settings.deleteCta': 'Etkinliği sil',
  'settings.deleteTitle': 'Bu etkinlik silinsin mi?', // app: hostEvent.deleteEventTitle
  'settings.deleteBody': '“{name}” ve içindeki tüm fotoğraflar kalıcı olarak kaldırılacak.', // app: hostEvent.deleteEventBody
  'settings.deleteConfirm': 'Sil…', // app: hostEvent.deleteEventConfirm
  'settings.deleteTitle2': 'Kesinlikle emin misin?', // app: hostEvent.deleteEventTitle2
  'settings.deleteBody2': 'Bu işlem kalıcı — etkinliği geri getirmenin yolu yok.', // app: hostEvent.deleteEventBody2
  'settings.deleted': 'Etkinlik silindi.',
  'settings.deletePairedNote': 'Etkinlik silme, bu hesabın kendi giriş yöntemi olduğunda ya da uygulamada kullanılabilir.',

  // face matching (the app's versioned texts, face.* 2026-09-23 — copy verbatim)
  'face.title': 'Yüz eşleştirme', // app: hostEvent.aiTitle
  'face.tabTitle': 'Fotoğraflarını bul', // app: face.tabTitle
  'face.aiOn': 'Açık: misafirler kendi karelerini yüzleriyle bulabilir.', // app: hostEvent.aiOn
  'face.aiOff': 'Kapalı: yüz eşleştirme misafirlere görünmez.', // app: hostEvent.aiOff
  'face.notInPackage': 'Yüz eşleştirme bu pakette yok. Sharecam uygulamasından eklenebilir.',
  'face.hostConfirmTitle': 'Yüz eşleştirme açılsın mı?', // app: face.hostConfirmTitle
  'face.hostConfirmBody': 'Misafirlerin bir selfie ile kendi fotoğraflarını bulabilir. Kullanıldığını onlara bildirmek senin sorumluluğunda — davetiye ve tabela için hazır metni veriyoruz. Yoklama tutmak veya tanınmayı kendisi talep etmemiş birini teşhis etmek için kullanılamaz.', // app: face.hostConfirmBody
  'face.hostConfirmCta': 'Aç', // app: face.hostConfirmCta
  'face.remindTitle': 'Misafirlerine şimdi haber ver', // app: face.noticeTitle (adapted)
  'face.remindBody': 'Aşağıdaki metni davetiyene ya da grup sohbetine kopyala ve QR’ı bildirim satırıyla bastır.',
  'face.noticeTitle': 'Misafirlerine haber ver', // app: face.noticeTitle
  'face.noticeSub': 'Bunu davetiyene, grup sohbetine ya da masalardaki karta yapıştır.', // app: face.noticeSub
  'face.noticeText': 'Bu etkinlikteki fotoğraflar ortak bir albümde toplanıyor. Albümde, kendi fotoğraflarını bulabilmen için isteğe bağlı yüz eşleştirme var. Tercih senin, kullanmayabilirsin. Ayrıntı: sharecam.app/face-grouping', // app: face.noticeText
  'face.noticeCopy': 'Metni kopyala', // app: face.noticeCopy
  'face.noticeCopied': 'Kopyalandı', // app: face.noticeCopied
  'face.noticePrint': 'Genel bakıştan indirdiğin QR, basılı kartlar için tek satırlık bildirimi taşır.',
  'face.cardNotice': 'Bu albümde isteğe bağlı yüz eşleştirme var · sharecam.app/face-grouping', // app: face.cardNotice
  'face.regionTitle': 'Bölgende sunulmuyor', // app: face.regionTitle
  'face.regionBody': 'Yüz eşleştirme bulunduğun yerde henüz açık değil. Yalnız yüz verisine dair yerel kuralları karşılayabildiğimiz yerlerde açıyoruz; böylece misafirlerinin kullanamayacağı bir şeyi sana asla satmıyoruz.', // app: face.regionBody
  'face.regionSoonTitle': 'Bulunduğun yerde çok yakında', // app: face.regionSoonTitle
  'face.regionSoonBody': 'Ülken için yüz verisini işlememize izin veren kaydı tamamlıyoruz. Albümdeki diğer her şey her zamanki gibi çalışıyor.', // app: face.regionSoonBody
  'face.regionUnknownTitle': 'Konumunu doğrulayamadık', // app: face.regionUnknownTitle
  'face.regionUnknownBody': 'Bu özellik yüz verisine dair yerel kurallara bağlı; hangi kuralların geçerli olduğunu anlayamadığımızda açmıyoruz. Albümdeki diğer her şey her zamanki gibi çalışıyor.', // app: face.regionUnknownBody
  'face.declTitle': 'Eklemeden önce', // app: face.declTitle
  'face.declIntro': 'Bu etkinliğin düzenleyicisi sensin, dolayısıyla bu kararlar sana ait. Kutuyu işaretleyerek şunları onaylıyorsun:', // app: face.declIntro
  'face.decl1': 'Bu etkinlikte kimin davet edileceğine ve fotoğraflanacağına ben karar veriyorum.', // app: face.decl1
  'face.decl2': 'Misafirlerime yüz eşleştirmenin açık olduğunu söyleyeceğim — uygulamadaki davet metni ve basılı kartla.', // app: face.decl2
  'face.decl3': 'Etkinliğim Illinois, Texas veya Washington’da değil.', // app: face.decl3
  'face.decl4': 'Yüz verisi Almanya’nın Frankfurt şehrinde AWS tarafından işleniyor ve bunu kapattığımda ya da albüm silindiğinde siliniyor.', // app: face.decl4
  'face.decl5': 'Etkinliğimin yapıldığı yerde geçerli kurallara uymaktan ben sorumluyum.', // app: face.decl5
  'face.declAccept': 'Etkinlik sahibi koşullarını okudum ve kabul ediyorum', // app: face.declAccept
  'face.declRead': 'Etkinlik sahibi koşullarının tamamını oku', // app: face.declRead
  'face.declError': 'Onayını kaydedemedik. Bağlantını kontrol edip tekrar dene.', // app: face.declError
  'decl.kicker': '{plan} · yüz eşleştirme dahil',
  'decl.continue': 'Kabul et ve ödemeye geç',

  // ---------------------------------------------------------------- package & checkout (§3.4)
  'checkout.kicker': 'Paketler',
  'checkout.kickerPro': 'Fotoğrafçı paketleri', // app: paywall.titlePro
  'checkout.titleNew': 'Etkinliğin için paket seç', // app: paywall.title
  'checkout.titleUpgrade': 'Paketini yükselt', // app: paywall.titleUpgrade
  'checkout.subtitle': 'Tek seferlik ödeme — abonelik değil. Misafir listene uyan boyutu seç.', // app: paywall.subtitle
  'checkout.subtitlePro': 'Etkinlik başına tek seferlik ödeme. Bilgisayarından yüklersin; misafirler QR’ı okutur, albüme göz atar ve selfie ile kendi fotoğraflarını bulur.', // app: paywall.subtitlePro
  'checkout.current': 'Şu an',
  'checkout.upgradeRule': 'Yükseltme, büyük paketin tam fiyatına olur — uygulamadaki kuralın aynısı.',
  'checkout.choose': 'Paket seç',
  'checkout.cta': '{price} öde · {plan}',
  'checkout.opening': 'Güvenli ödeme sayfası açılıyor…',
  'checkout.paying': 'Ödemeyi ödeme penceresinde tamamla.',
  'checkout.sandbox': 'Sandbox · test ödemeleri',
  'checkout.footnote': 'Fiyatlar USD cinsindendir, Sharecam uygulamasındakiyle aynıdır. Paddle ödeme sırasında yerel para biriminde fiyat ve vergi gösterebilir. Ödemeleri, resmî satıcımız (merchant of record) Paddle işler.',
  'checkout.soonTitle': 'Web’den satın alma yakında',
  'checkout.soonOff': 'Paketler henüz web’den satın alınamıyor.',
  'checkout.soonPrices': 'Bu paketler henüz web’de satılmıyor.',
  'checkout.soonApp': 'O zamana kadar paketler Sharecam iPhone uygulamasında satılıyor — bu etkinlik orada aynı girişle görünür.',
  'checkout.soonAppPro': 'O zamana kadar fotoğrafçı paketleri Sharecam iPhone uygulamasında satılıyor — bu etkinlik orada aynı girişle görünür.',
  'checkout.maxedTitle': '{plan} en büyük paket',
  'checkout.maxedBody': 'Bu etkinlikte yükseltilecek bir şey yok.',
  'checkout.unavailableTitle': 'Bu etkinlik burada yükseltilemez',
  'checkout.unavailableBody': 'Başka bir hesaba ait ya da artık yok.',
  'checkout.codeNotPro': 'Fotoğrafçı paketleri, fotoğrafçı etkinliği olarak açılmış bir etkinlik ister. Bunun yerine yeni bir fotoğrafçı etkinliği aç.',
  'checkout.refundedTitle': 'Bu etkinliğin ödemesi iade edildi',
  'checkout.refundedBody': 'Yeniden paket almak etkinliği tekrar açar: yüklemeler, yüz eşleştirme (pakete dahilse) ve indirmeler geri gelir.',
  'checkout.abandonedTitle': 'Etkinliğin Spark’ta (ücretsiz)',
  'checkout.abandoned': 'Etkinliğin Spark’ta (ücretsiz). İstediğin zaman paket seçebilirsin.',
  'checkout.closedNote': 'Ödeme penceresi kapatıldı. Ücret alınmadı.',
  'checkout.applyingTitle': 'Ödeme alındı',
  'checkout.applyingBody': '{plan} bu etkinlikte etkinleştiriliyor. Bu sayfa kendiliğinden güncellenir.',
  'checkout.slowTitle': 'Ödeme alındı — az kaldı',
  'checkout.slowBody': 'Ödemen ulaştı. {plan} birkaç dakika içinde uygulanacak; bu sayfadan ayrılabilirsin. Bir saat içinde aktif olmazsa bize yaz.',
  'checkout.doneTitle': 'Tamamdır 🎉', // app: paywall.doneTitle
  'checkout.doneBody': '{plan} paketi aktif. Paddle makbuzu e-posta adresine gönderir.', // app: paywall.active (+ receipt)
  'checkout.toOverview': 'Etkinliğe Git', // app: qr.goToEvent
  'checkout.coveredTitle': 'Bu etkinlikte zaten {plan} var',
  'checkout.coveredBody': 'İki kez ödediysen fazla ödemeyi iade ederiz. Soruların için: {email}',
  'checkout.failedTitle': 'Ödemen uygulanamadı',
  'checkout.failedBody': 'Ödemeni iade ediyoruz — senin bir şey yapmana gerek yok. Soruların için: {email}',
  'checkout.openFailedTitle': 'Ödeme sayfası açılamadı',
  'checkout.openFailedBody': 'Ücret alınmadı. Biraz sonra tekrar dene.',
  'checkout.tooMany': 'Bugün çok fazla ödeme sayfası açıldı. Yarın tekrar dene ya da bize yaz.',
  'checkout.backToPackages': 'Paketlere dön',
  'checkout.contact': 'Destekle iletişime geç',
  'checkout.mailSlow': 'Web ödemesi henüz uygulanmadı',
  'checkout.mailDuplicate': 'İki kez ödendi',
  'checkout.mailFailed': 'Web ödemesi uygulanmadı',
  'checkout.proIncludesTitle': 'Her fotoğrafçı paketinde',
  'checkout.proInc1': 'Yüz eşleştirme dahil (sunulduğu yerlerde)', // app: paywall.featAiIncluded (adapted)
  'checkout.proInc2': 'Yalnız sen yüklersin — misafirler görür', // app: paywall.featHostOnly
  'checkout.proInc3': 'Orijinaller tam çözünürlükte saklanır', // app: paywall.featOriginals

  // ---------------------------------------------------------------- downloads
  'downloads.zipTitle': 'Albümü indir',
  'downloads.zipBody': 'Tüm fotoğraf ve videolar tek bir ZIP dosyasında. Büyük albümlerin hazırlanması bir dakika sürebilir.',
  'downloads.zipCta': 'ZIP indir', // app: download.zip
  'downloads.zipWorking': 'Hazırlanıyor…', // app: download.zipWorking
  'downloads.zipReady': 'ZIP indir ({n} öğe)',
  'downloads.displayTitle': 'Paylaşım için — 2048 px',
  'downloads.displayBody': 'Tüm albüm, 500 fotoğraflık ZIP parçaları hâlinde; ekranlar ve sosyal medya için boyutlandırılmış.',
  'downloads.originalTitle': 'Orijinaller — tam çözünürlük',
  'downloads.originalBody': 'Yüklediklerin olduğu gibi, 150 fotoğraflık ZIP parçaları hâlinde.',
  'downloads.prepare': 'İndirmeyi hazırla',
  'downloads.again': 'Yeniden hazırla',
  'downloads.preparing': 'Hazırlanıyor… {done}/{total} parça hazır',
  'downloads.part': 'Parça {n} / {of}',
  'downloads.items': '{n} fotoğraf',
  'downloads.download': 'İndir',
  'downloads.validity': 'Tam albüm parçalı ZIP olarak — paylaşmak için 2048px, saklamak için tam çözünürlüklü orijinaller. Linkler 7 gün geçerli, yeniden üretilebilir.', // app: ownerLink.step3Body
  'downloads.refundedTitle': 'İade edilen etkinliklerde indirme kapalı',
  'downloads.refunded': 'Bu etkinliğin ödemesi iade edildiği için albüm ZIP olarak dışa aktarılamıyor. Yeniden paket alınırsa açılır.', // app: download.zipRefunded
  'downloads.buyAgain': 'Paketleri gör',
  'downloads.nothing': 'Henüz indirilecek bir şey yok.',
  'downloads.failed': 'ZIP oluşturulamadı.', // app: download.zipFailed
  'downloads.keepTitle': 'Bir kopya sakla',
  'downloads.keepBody': 'Saklama süresi {date} tarihinde bitiyor. Albümü o güne kadar indir.',
  'downloads.keepBodyNoDate': 'Albümü saklama süresi bitmeden indir.',

  // ---------------------------------------------------------------- account
  'account.kicker': 'Hesap', // app: account.title
  'account.title': 'Hesabın',
  'account.signins': 'Giriş yöntemleri',
  'account.pairedOnly': 'Bu bilgisayar Sharecam uygulamasına bağlı. Hesabın henüz kendi giriş yöntemi yok.',
  'account.sameAsApp': 'Etkinliklerin bu hesaba ait — Sharecam uygulamasında kullandığın hesaba.',
  'account.addAnother': 'Başka bir giriş yöntemi ekle',
  'account.addAnotherBody': 'İlkine erişimini kaybedersen diye ikinci bir yol.',
  'account.linked': 'Giriş yöntemi eklendi.',
  'account.signOutTitle': 'Çıkış yap', // app: account.signOut
  'account.signOutBody': 'Etkinliklerin hesabında kalır. İstediğin zaman yeniden giriş yap.',
  'account.signOutPaired': 'Kendi giriş yöntemi olmadan bu bilgisayar ancak uygulamayla yeniden bağlanarak geri dönebilir.',
  'account.deleteCta': 'Hesabı ve verileri sil', // app: account.deleteCta
  'account.deleteTitle': 'Hesabın ve verilerin silinsin mi?', // app: account.deleteTitle
  'account.deleteBody': 'Hesabın, açtığın her etkinlik, tüm fotoğraflar ve misafir listeleri kalıcı olarak silinir — her cihazdan. Bu işlem geri alınamaz.', // app: account.deleteBody
  'account.deleteConfirm': 'Her şeyi sil', // app: account.deleteConfirm
  'account.deleted': 'Hesabın ve verilerin silindi.', // app: account.deleted
  'account.deleteFailed': 'Hesabın silinemedi. Tekrar dene.', // app: account.deleteFailed
  'account.deletePairedNote': 'Hesap silme, hesabın kendi giriş yöntemi olduğunda ya da uygulamada (Ayarlar → Hesap) kullanılabilir.',
};

export default tr;
