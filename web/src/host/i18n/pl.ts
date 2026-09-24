// Sharecam host dashboard — Polski (plan §3.6, D15; WP-H).
//
// Forma "Ty" wielką literą (jak w aplikacji: Twój, Twoje, Cię), "wydarzenie", "organizator" = host,
// "pakiet", "ulepsz" = upgrade, "rozpoznawanie twarzy", "Tryb prywatny" / "Otwarta galeria",
// "ściana na żywo", "para"; parowanie komputera = "połącz" (jak w aplikacji i na stronie wgrywania);
// web = "na stronie". Liczebniki przez dwukropek ("goście: 12"), bo tekst nie ma form mnogich.
// Cudzysłów „…”, pauza —, wielokropek ….
//
// Same keys and order as en.ts (tsc fails on a missing or stale key). A `// app: <key>`
// comment marks a string copied verbatim from EC/src/i18n/locales/pl.ts (native-reviewed
// 23 Sep 2026, EC 5c05c8e; {{x}} → {x}); "(adapted)" = the app wording with the same change
// the English line makes. Every other string is new and is checked before go-live.
// face.* declaration and notice texts are versioned (declTextVersion 2026-09-23): never edit
// them here, only together with the app and the server.

import type { Dict } from './en';

const pl: Dict = {
  // ---------------------------------------------------------------- common
  'common.back': 'Wstecz',
  'common.cancel': 'Anuluj', // app: common.cancel
  'common.close': 'Zamknij', // app: common.close
  'common.delete': 'Usuń', // app: common.delete
  'common.on': 'Wł.', // app: common.on
  'common.off': 'Wył.', // app: common.off
  'common.ok': 'OK',
  'common.copy': 'Kopiuj',
  'common.copied': 'Skopiowano', // app: face.noticeCopied
  'common.remove': 'Usuń', // app: create.coverRemove
  'common.saving': 'Zapisywanie…',
  'common.loading': 'Ładowanie…',
  'common.loadFailed': 'Nie udało się wczytać tej strony',
  'common.checkConnection': 'Sprawdź połączenie i spróbuj ponownie.',
  'common.tryAgain': 'Coś poszło nie tak. Spróbuj ponownie.',
  'common.prev': 'Poprzednie',
  'common.next': 'Następne',

  // ---------------------------------------------------------------- page titles (browser tab)
  'title.events': 'Twoje wydarzenia',
  'title.signin': 'Logowanie',
  'title.new': 'Utwórz wydarzenie',
  'title.account': 'Konto',

  // ---------------------------------------------------------------- shell
  'shell.tag': 'Organizator',
  'shell.language': 'Język',
  'shell.accountMenu': 'Menu konta',
  'shell.events': 'Twoje wydarzenia',
  'shell.account': 'Konto',
  'shell.signOut': 'Wyloguj się', // app: account.signOut
  'shell.signedInAs': 'Zalogowano jako {who}',
  'shell.paired': 'Połączono z aplikacją',
  'shell.pairedLong': 'Ten komputer jest połączony z aplikacją Sharecam. Nie ma jeszcze własnej metody logowania.',
  'shell.linkBannerTitle': 'Dodaj metodę logowania, aby zachować to konto',
  'shell.linkBannerBody': 'Ten komputer jest połączony z Twoją aplikacją Sharecam. Dodaj logowanie przez e-mail lub Google, aby móc wrócić bez aplikacji. Jest ono też potrzebne do zakupu pakietu na stronie.',
  'shell.linkBannerCta': 'Dodaj logowanie',
  'nav.events': 'Twoje wydarzenia',
  'nav.signin': 'Zaloguj się',
  'legal.webTerms': 'Warunki zakupów na stronie',
  'legal.refund': 'Zasady zwrotów',
  'legal.privacy': 'Prywatność', // app: legal.privacy
  'legal.terms': 'Regulamin', // app: legal.terms
  'legal.support': 'Pomoc', // app: legal.support
  'legacy.title': 'Połącz ten komputer ponownie',
  'legacy.body': 'Ta przeglądarka była połączona z Twoimi wydarzeniami przez starą stronę wgrywania. Wylogowaliśmy ją, aby strona dla gości znów działała tu normalnie. Aby wgrywać, połącz ją jeszcze raz z aplikacją Sharecam lub zaloguj się.',

  // ---------------------------------------------------------------- sign in
  'signin.kicker': 'Panel organizatora',
  'signin.title': 'Zaloguj się do swoich wydarzeń',
  'signin.lead': 'Użyj tego samego logowania co w aplikacji (Ustawienia → Konto). Jeśli w aplikacji nie było jeszcze logowania, zrób to najpierw tam.',
  'signin.appKicker': 'Korzystasz już z aplikacji?',
  'signin.appTitle': 'To samo konto, te same wydarzenia',
  'signin.appBody': 'Wydarzenia utworzone w aplikacji Sharecam pojawią się tutaj, gdy zalogujesz się na to samo konto co w aplikacji (Ustawienia → Konto).',
  'auth.google': 'Kontynuuj z Google', // app: account.continueGoogle
  'auth.apple': 'Kontynuuj z Apple', // app: account.continueApple
  'auth.soon': 'Wkrótce',
  'auth.appleSoon': 'W aplikacji logujesz się przez Apple? Logowanie przez Apple na stronie pojawi się wkrótce.',
  'auth.orEmail': 'lub przez e-mail',
  'auth.email': 'E-mail',
  'auth.password': 'Hasło',
  'auth.passwordHint': 'Co najmniej 6 znaków.',
  'auth.signinCta': 'Zaloguj się',
  'auth.createCta': 'Utwórz konto',
  'auth.resetCta': 'Wyślij link do resetu',
  'auth.resetTitle': 'Zresetuj hasło',
  'auth.resetSent': 'Jeśli {email} ma konto, link do resetu hasła jest już w drodze. Sprawdź skrzynkę.',
  'auth.toCreate': 'Pierwszy raz tutaj? Utwórz konto',
  'auth.toReset': 'Nie pamiętasz hasła?',
  'auth.toSignin': 'Wróć do logowania',
  'auth.errWrong': 'Nieprawidłowy e-mail lub hasło.',
  'auth.errEmailTaken': 'Ten e-mail ma już konto. Zaloguj się.',
  'auth.errWeak': 'Hasło musi mieć co najmniej 6 znaków.',
  'auth.errEmail': 'Wpisz prawidłowy adres e-mail.',
  'auth.errPopupBlocked': 'Przeglądarka zablokowała okno logowania. Zezwól na wyskakujące okna dla tej strony i spróbuj ponownie.',
  'auth.errProviderOff': 'Ta metoda logowania nie jest jeszcze dostępna na tej stronie. Użyj e-maila.',
  'auth.errOffline': 'Brak połączenia. Sprawdź internet i spróbuj ponownie.',
  'auth.errTooMany': 'Zbyt wiele prób. Odczekaj minutę i spróbuj ponownie.',
  'auth.errDisabled': 'To konto zostało wyłączone. Napisz do nas ze strony pomocy.',
  'auth.errRecent': 'Dla bezpieczeństwa wyloguj się i zaloguj ponownie, a potem powtórz ten krok.',
  'auth.errAlreadyLinked': 'Ta metoda logowania jest już dodana do Twojego konta.',
  'auth.errGeneric': 'Logowanie nie powiodło się. Spróbuj ponownie.', // app: account.errorGeneric

  // ---------------------------------------------------------------- pair with the app
  'pair.kicker': 'Dla fotografów',
  'pair.title': 'Połącz z aplikacją Sharecam',
  'pair.body': 'Nie masz jeszcze logowania na stronie? Połącz ten komputer z kontem w aplikacji Sharecam. Działa dla wydarzeń fotografa.',
  'pair.open': 'Połącz z aplikacją',
  'pair.qrTitle': 'Zeskanuj ten kod aplikacją',
  'pair.step1': 'Otwórz swoje wydarzenie fotografa w aplikacji Sharecam.',
  'pair.step2': 'Dotknij „Wgraj z komputera”, a potem „Zeskanuj QR z komputera”.',
  'pair.step3': 'Potwierdź na telefonie. Ta strona zaloguje się sama.',
  'pair.qrAlt': 'Kod połączenia z aplikacją Sharecam',
  'pair.qrFoot': 'Kod odnawia się co kilka minut.',
  'pair.qrError': 'Nie udało się utworzyć kodu. Użyj 6-znakowego kodu poniżej.',
  'pair.connecting': 'Łączenie…',
  'pair.orCode': 'albo wpisz kod z aplikacji',
  'pair.codeLabel': 'Kod z aplikacji',
  'pair.codeCta': 'Połącz',
  'pair.foot': 'Kod loguje ten komputer na Twoje konto. Używaj go tylko na zaufanym komputerze.', // app: uploadLink.footer (adapted)
  'pair.errNotFound': 'Ten kod jest nieprawidłowy. Sprawdź go w aplikacji.',
  'pair.errExpired': 'Ten kod wygasł. Wygeneruj nowy w aplikacji.',
  'pair.errUsed': 'Ten kod został już użyty. Wygeneruj nowy w aplikacji.',
  'pair.errGeneric': 'Nie udało się połączyć tego komputera. Sprawdź połączenie i spróbuj ponownie.',

  // ---------------------------------------------------------------- link a sign-in (paired accounts)
  'link.kicker': 'Jeszcze jeden krok',
  'link.title': 'Dodaj metodę logowania do tego konta',
  'link.lead': 'Twoje wydarzenia zostają tam, gdzie są. Potem zalogujesz się tu tą metodą, a aplikacja działa dalej jak wcześniej.',
  'link.buyLead': 'Zakup na stronie wymaga konta, do którego możesz wrócić: potwierdzenia trafiają na e-mail, a pakiet należy do tego wydarzenia przez cały okres przechowywania. Najpierw dodaj metodę logowania; Twoje wydarzenia zostają tam, gdzie są.',
  'link.google': 'Dodaj logowanie przez Google',
  'link.apple': 'Dodaj logowanie przez Apple',
  'link.emailCta': 'Dodaj logowanie przez e-mail',
  'link.inUseTitle': 'Ta metoda logowania ma już konto Sharecam',
  'link.inUseBody': 'Zaloguj się nią w aplikacji (Ustawienia → Konto); aplikacja przeniesie tam Twoje wydarzenia. Potem zaloguj się tutaj na to samo konto.',
  'link.inUseBack': 'Spróbuj innej metody logowania',

  // ---------------------------------------------------------------- event list
  'list.kicker': 'Panel organizatora',
  'list.title': 'Twoje wydarzenia',
  'list.lead': 'Wszystko, co organizujesz — na stronie i w aplikacji.',
  'list.leadEmpty': 'Utwórz wydarzenie, udostępnij kod QR, zbierz każde zdjęcie.', // app: welcome.hostDesc
  'list.create': 'Utwórz wydarzenie',
  'list.createPro': 'Wydarzenie fotografa',
  'list.groupPro': 'Wydarzenia fotografa',
  'list.groupEvents': 'Wydarzenia',
  'list.groupAll': 'Wydarzenia',
  'list.count': 'łącznie: {n}',
  'list.guestsShort': 'goście: {v}',
  'list.photosShort': 'zdjęcia: {v}',
  'list.keptUntil': 'Przechowywane do {date}',
  'list.deletion': 'Przechowywane do',
  'list.waiting': 'Brak pakietu — kod QR zadziała, gdy pakiet będzie aktywny',
  'list.emptyTitle': 'Brak wydarzeń', // app: dashboard.emptyTitle
  'list.emptyBody': 'Gotowe w 60 sekund: nazwa, data, prywatność — kod QR gotowy do druku. Masz wydarzenia w aplikacji? Zaloguj się tutaj na to samo konto co tam.', // app: dashboard.emptyBody (+ one sentence)
  'list.findHint': 'Nie widzisz wydarzenia utworzonego w aplikacji? Zaloguj się na to samo konto co tam (Ustawienia → Konto). Wydarzenia z aplikacji, w której nikt się nie zalogował, zostają na tym telefonie, dopóki się tam nie zalogujesz.',

  // ---------------------------------------------------------------- stats, units, plans
  'stat.guests': 'Goście',
  'stat.photos': 'Zdjęcia',
  'stat.videos': 'Filmy',
  'unit.days': '{n} dni',
  'unit.month': '1 miesiąc',
  'unit.months': '{n} mies.',
  'unit.year': '1 rok',
  'unit.years': '{n} lata',
  'unit.unlimited': 'Bez limitu',
  'unit.unlimitedShort': 'bez limitu',
  'plan.free': 'Za darmo', // app: paywall.free
  'plan.perEvent': 'za wydarzenie', // app: paywall.perEvent
  'plan.popular': 'Najczęściej wybierany', // app: plans.wedding.badge
  'plan.storage': 'Przechowywanie',
  'plan.refunded': 'Zwrócono',
  'plan.awaiting': 'Wybierz pakiet',
  'plan.webSoon': 'Wkrótce na stronie',
  'plan.none': 'Brak pakietu',
  'plan.wallIncluded': 'Ze ścianą na żywo',

  // ---------------------------------------------------------------- create
  'new.kicker': 'Nowe wydarzenie',
  'new.kickerPro': 'Nowe wydarzenie fotografa',
  'new.title': 'Utwórz wydarzenie',
  'new.titlePro': 'Utwórz wydarzenie fotografa',
  'new.lead': 'Nadaj nazwę, zdecyduj, kto widzi zdjęcia, i wybierz pakiet. Każde wydarzenie zaczyna się za darmo od Spark.',
  'new.leadPro': 'Wgrywasz z komputera, oryginały są zachowane. Goście skanują kod QR, przeglądają album i znajdują swoje zdjęcia dzięki selfie.',
  'new.tierLabel': 'Rodzaj wydarzenia',
  'new.tierEvents': 'Wydarzenia',
  'new.tierPro': 'Fotografowie',
  'new.details': 'Szczegóły wydarzenia', // app: create.step1Title
  'new.name': 'Nazwij swoje wydarzenie', // app: create.titleName
  'new.namePlaceholder': 'Ślub Anny i Michała', // app: create.namePlaceholder
  'new.nameRequired': 'Nadaj wydarzeniu nazwę.',
  'new.date': 'Data wydarzenia (opcjonalnie)', // app: create.dateLabel
  'new.dateHint': 'Data pojawia się na zaproszeniach. Przechowywanie liczy się od tego dnia.',
  'new.who': 'Kto widzi zdjęcia?', // app: create.titleMode
  'new.modeHint': 'Możesz to zmienić później w Ustawieniach.', // app: create.modeHint
  'new.cover': 'Zdjęcie okładki (opcjonalnie)',
  'new.coverAdd': 'Dodaj zdjęcie okładki',
  'new.coverChange': 'Zmień',
  'new.locked': 'Nazwy i daty nie można później zmienić: są wydrukowane na Twoich kartach.',
  'new.package': 'Pakiet',
  'new.consumerSoon': 'Płatne pakiety wkrótce pojawią się na stronie. Zacznij teraz za darmo od Spark i ulepsz później — tutaj albo w aplikacji.',
  'new.proSoonTitle': 'Pakiety dla fotografów wkrótce na stronie',
  'new.proSoonBody': 'Do tego czasu kupisz je w aplikacji Sharecam na iPhone’a. Wydarzenia utworzone tam pojawią się tutaj przy tym samym logowaniu.',
  'new.proRegionLater': 'Po zalogowaniu sprawdzimy, czy rozpoznawanie twarzy jest dostępne w Twojej lokalizacji.',
  'new.ctaFree': 'Utwórz wydarzenie',
  'new.ctaPaid': 'Utwórz i zapłać · {plan} {price}',
  'new.created': 'Wydarzenie utworzone.',
  'new.createFailed': 'Nie udało się utworzyć wydarzenia. Sprawdź połączenie i spróbuj ponownie.',
  'new.backToForm': 'Wróć do formularza',
  'new.stepAccount': 'Prawie gotowe',
  'new.accountTitle': 'Zaloguj się, aby zapisać wydarzenie',
  'new.accountLead': 'Wydarzenie potrzebuje konta, do którego możesz wrócić. Jeśli logujesz się w aplikacji, użyj tego samego logowania.',
  'new.summary': 'Twoje wydarzenie',
  'mode.openTitle': 'Otwarta galeria', // app: create.openTitle
  'mode.openDesc': 'Wszyscy widzą wszystko, co zostanie dodane, i mogą to polubić. Wspólny album na żywo.', // app: create.openDesc
  'mode.privateTitle': 'Tryb prywatny', // app: create.privateTitle
  'mode.privateDesc': 'Tylko Ty widzisz wszystko; goście widzą wyłącznie własne zdjęcia. Idealne na album-niespodziankę.', // app: create.privateDesc

  // ---------------------------------------------------------------- event page
  'event.kicker': 'Wydarzenie',
  'event.kickerPro': 'Wydarzenie fotografa', // app: hostEvent.hostOnlyTitle
  'event.noDate': 'Brak daty', // app: hostEvent.noDate
  'event.codeLine': 'Kod {code}',
  'event.goneTitle': 'To wydarzenie nie jest już dostępne', // app: eventGone.title
  'event.goneBody': 'Mogło zostać usunięte albo skończył się okres przechowywania.', // app: eventGone.body
  'event.notYoursTitle': 'To wydarzenie należy do innego konta',
  'event.notYoursBody': 'Zaloguj się na konto, na którym je utworzono — to samo co w aplikacji.',
  'tab.label': 'Sekcje wydarzenia',
  'tab.overview': 'Przegląd',
  'tab.gallery': 'Galeria',
  'tab.guests': 'Goście', // app: hostEvent.tabGuests
  'tab.settings': 'Ustawienia', // app: hostEvent.tabSettings
  'tab.plan': 'Pakiet', // app: hostEvent.planTitle
  'tab.downloads': 'Pobieranie',

  // overview
  'overview.createdTitle': 'Wydarzenie utworzone!', // app: qr.createdTitle
  'overview.createdBody': 'Udostępnij kod QR gościom — każde zdjęcie trafia do Twojej galerii.', // app: qr.createdSubtitle
  'overview.createdBodyPro': 'Wgraj zdjęcia z tego komputera. Goście skanują kod QR, przeglądają album i znajdują siebie.',
  'overview.stats': 'Do tej pory',
  'overview.statsPro': 'W albumie',
  'overview.package': 'Pakiet', // app: hostEvent.planTitle
  'overview.keptUntil': 'Przechowywane do',
  'overview.face': 'Rozpoznawanie twarzy', // app: hostEvent.aiTitle
  'overview.faceNot': 'Nie ma w pakiecie',
  'overview.wall': 'Ściana na żywo', // app: hostEvent.wallTitle
  'overview.included': 'W pakiecie',
  'overview.changePackage': 'Zmień pakiet',
  'overview.refundedNote': 'Płatność za to wydarzenie została zwrócona. Album zostaje do końca okresu przechowywania; ponowny zakup pakietu przywraca wydarzenie.',
  'qr.kicker': 'Zaproszenie',
  'qr.title': 'Goście dołączają w jednym kroku', // app: qr.title
  'qr.body': 'Połóż kod QR na stołach albo wyślij link. Goście wpisują imię i dodają zdjęcia z przeglądarki w telefonie — bez aplikacji i bez konta.',
  'qr.titlePro': 'Kod QR dla gości',
  'qr.bodyPro': 'Goście skanują go, żeby przeglądać album, zapisywać zdjęcia i znaleźć siebie dzięki selfie. Wgrywasz tylko Ty.',
  'qr.codeLabel': 'Kod wydarzenia', // app: qr.codeLabel
  'qr.linkLabel': 'Link dla gości',
  'qr.alt': 'Kod QR wydarzenia {code}',
  'qr.png': 'Pobierz kod QR (PNG)',
  'qr.share': 'Udostępnij zaproszenie', // app: qr.share
  'qr.shareText': 'Dołącz do albumu zdjęć „{name}” (kod {code})',
  'qr.faceLine': 'Rozpoznawanie twarzy jest włączone: wydrukowany kod QR ma jednowierszową informację dla gości.',
  'upload.kicker': 'Wgrywanie',
  'upload.title': 'Wgraj z komputera', // app: uploadLink.title
  'upload.body': 'Przeciągnij cały folder z komputera. Oryginały zostają w pełnej rozdzielczości; goście widzą lekkie podglądy.', // app: uploadLink.subtitle
  'upload.cta': 'Wgraj oryginały',
  'upload.countOf': 'z {cap} zdjęć',
  'upload.countUnlimited': '— zdjęcia bez limitu',
  'owner.title': 'Udostępnij parze', // app: hostEvent.shareOwnerTitle
  'owner.body': 'Daj parze jednorazowy kod. Na sharecam.app/album zobaczą cały album i pobiorą wszystko — w pełnej rozdzielczości, w częściach.', // app: hostEvent.shareOwnerBody
  'owner.cta': 'Utwórz kod dla pary', // app: hostEvent.shareOwnerCta
  'owner.newCode': 'Nowy kod', // app: ownerLink.newCode
  'owner.expires': 'Wygasa za {time} · jednorazowy', // app: ownerLink.expiresIn
  'owner.expired': 'Ten kod wygasł', // app: ownerLink.expired
  'owner.link': 'Link do albumu',
  'owner.foot': 'Ten kod powinna dostać tylko para — odblokowuje pobranie całego albumu.', // app: ownerLink.footer
  'owner.error': 'Nie udało się utworzyć kodu. Sprawdź połączenie i spróbuj ponownie.', // app: ownerLink.error
  'wall.title': 'Ściana na żywo', // app: hostEvent.wallTitle
  'wall.openBody': 'Ściana jest gotowa. Otwórz ten link na telewizorze, laptopie lub projektorze w lokalu — bez kabla i aplikacji.',
  'wall.privateWarning': 'W trybie prywatnym zdjęcia są ukryte do momentu odsłonięcia, więc ściana jest wyłączona. Przełącz na tryb otwarty, aby jej użyć.', // app: wall.privateWarning
  'await.kicker': 'Wydarzenie fotografa',
  'await.title': 'Wybierz pakiet, aby otrzymać kod QR',
  'await.body': 'To wydarzenie nie ma jeszcze pakietu dla fotografów. Kod QR, kod i strona wgrywania zadziałają, gdy pakiet będzie aktywny. Nazwa i data są zapisane.',
  'await.cta': 'Wybierz pakiet',

  // expiry (D19)
  'expiry.title': 'Zdjęcia z „{name}” zostaną usunięte za {n} dni',
  'expiry.titleOne': 'Zdjęcia z „{name}” zostaną usunięte jutro',
  'expiry.todayTitle': 'Zdjęcia z „{name}” zostaną usunięte dzisiaj',
  'expiry.body': 'Przechowywanie kończy się {date}. Pobierz album wcześniej — potem nie da się go odzyskać.',
  'expiry.download': 'Pobierz',
  'expiry.listTitle': 'Przechowywanie wkrótce się kończy',
  'expiry.listBody': 'Po tej dacie zdjęcia zostaną usunięte i nie da się ich odzyskać. Pobierz to, co chcesz zachować.',
  'expiry.whenDays': 'za {n} dni',
  'expiry.whenTomorrow': 'jutro',
  'expiry.whenToday': 'dzisiaj',
  'expiry.icsShort': 'Przypomnienie',
  'expiry.ics': 'Dodaj przypomnienie do kalendarza',
  'expiry.icsTitle': 'Pobierz zdjęcia z Sharecam: {name}',
  'expiry.icsBody': 'Zdjęcia z „{name}” zostaną usunięte {date}. Otwórz panel organizatora, aby je pobrać.',

  // gallery
  'gallery.count': 'Pozycje: {n} · wczytano: {shown}',
  'gallery.filter': 'Pokaż',
  'gallery.all': 'Wszystkie', // app: gallery.all
  'gallery.reportedN': 'Zgłoszone ({n})', // app: hostEvent.reportedFilter
  'gallery.hiddenN': 'Ukryte ({n})',
  'gallery.hidden': 'Ukryte',
  'gallery.reported': 'Zgłoszone',
  'gallery.hide': 'Ukryj przed gośćmi',
  'gallery.show': 'Pokaż gościom',
  'gallery.hiddenToast': 'Ukryto przed gośćmi.',
  'gallery.shownToast': 'Znów widoczne dla gości.',
  'gallery.deleteTitle': 'Usunąć to zdjęcie?', // app: hostEvent.deleteTitle
  'gallery.deleteBody': 'Zostanie usunięte z galerii.', // app: hostEvent.deleteBody
  'gallery.deletedToast': 'Usunięto.',
  'gallery.more': 'Załaduj więcej',
  'gallery.emptyTitle': 'Brak zdjęć', // app: hostEvent.emptyTitle
  'gallery.emptyBody': 'Połóż kod QR na stołach — pierwsze zdjęcie pojawi się tutaj.',
  'gallery.emptyPro': 'Wgraj z komputera — oryginały są zachowane, goście zobaczą galerię w kilka minut.', // app: hostEvent.emptyProBody
  'gallery.noneReported': 'Wśród wczytanych pozycji nie ma zgłoszeń.',
  'gallery.noneHidden': 'Wśród wczytanych pozycji nie ma ukrytych.',
  'gallery.viewer': 'Przeglądarka zdjęć',
  'gallery.openItem': 'Otwórz zdjęcie: {name}',
  'gallery.photoAlt': 'Zdjęcie: {name}',
  'gallery.unknownOwner': 'Gość',
  'gallery.openFull': 'Otwórz w pełnym rozmiarze',

  // guests
  'guests.emptyTitle': 'Brak gości', // app: guests.emptyTitle
  'guests.emptyBody': 'Każdy, kto dołączy kodem QR lub kodem, pojawi się tutaj ze swoim imieniem.', // app: guests.emptyBody
  'guests.ban': 'Usuń', // app: guests.ban
  'guests.unban': 'Przywróć', // app: guests.unban
  'guests.bannedTag': 'usunięto', // app: guests.bannedTag
  'guests.banTitle': 'Usunąć gościa {name}?', // app: guests.banTitle
  'guests.banBody': 'Ta osoba nie będzie mogła ponownie dołączyć ani dodawać zdjęć. Jej zdjęcia zostają (możesz je usunąć z galerii).', // app: guests.banBody
  'guests.owner': 'Właściciel albumu',
  'guests.noName': 'Gość',
  'guests.joined': 'dołączenie: {time}',
  'guests.removedToast': 'Usunięto: {name}.',
  'guests.restoredToast': '{name} może znów dołączyć.',
  'guests.capTitle': 'Goście tego wydarzenia',
  'guests.capBody': 'Usunięci goście się nie liczą; ich miejsce znów jest wolne.',
  'guests.full': 'Osiągnięto limit gości ({limit}). Ulepsz pakiet, aby dołączyło więcej osób.', // app: guests.limitFull (adapted)

  // settings
  'settings.galleryTitle': 'Kto dołącza, kto widzi',
  'settings.privateTitle': 'Tryb prywatny', // app: hostEvent.privateTitle
  'settings.privateOn': 'Goście widzą tylko własne zdjęcia.', // app: hostEvent.privateOn
  'settings.privateOff': 'Wszyscy widzą całą galerię.', // app: hostEvent.privateOff
  'settings.statePrivate': 'Prywatna', // app: hostEvent.statePrivate
  'settings.statePublic': 'Publiczna', // app: hostEvent.statePublic
  'settings.revealTitle': 'Otworzyć galerię dla wszystkich?', // app: hostEvent.revealTitle
  'settings.revealBody': 'Goście zobaczą nawzajem swoje zdjęcia. To jest „odsłonięcie” — na pewno?', // app: hostEvent.revealBody
  'settings.revealConfirm': 'Tak, otwórz', // app: hostEvent.revealConfirm
  'settings.autoRevealTitle': 'Automatyczne otwarcie', // app: hostEvent.revealSchedTitle
  'settings.autoRevealOn': 'Galeria otworzy się dla wszystkich {time}.', // app: hostEvent.revealSchedOn
  'settings.autoRevealOff': 'Wyłączone: galeria pozostaje prywatna, dopóki samodzielnie jej nie otworzysz.', // app: hostEvent.revealSchedOff
  'settings.revealPick': 'Wybierz datę i godzinę', // app: hostEvent.revealPick
  'settings.pauseTitle': 'Wstrzymaj dołączanie', // app: hostEvent.pauseTitle
  'settings.pauseOn': 'Nikt nowy nie dołączy. Obecni goście zostają.', // app: hostEvent.pauseOn
  'settings.pauseOff': 'Każdy z kodem QR lub kodem może dołączyć.', // app: hostEvent.pauseOff
  'settings.statePaused': 'Wstrzymane', // app: hostEvent.statePaused
  'settings.stateOpen': 'Otwarte', // app: hostEvent.stateOpen
  'settings.downloadTitle': 'Pobieranie przez gości', // app: hostEvent.downloadTitle
  'settings.downloadDesc': 'Goście mogą zapisywać zdjęcia.', // app: hostEvent.downloadDesc
  'settings.hostOnlyTitle': 'Wydarzenie fotografa', // app: hostEvent.hostOnlyTitle
  'settings.hostOnlyBody': 'Tylko Ty wgrywasz. Goście przeglądają galerię, zapisują zdjęcia i znajdują siebie dzięki selfie. Tego nie można zmienić.', // app: hostEvent.hostOnlyBody
  'settings.detailsTitle': 'Szczegóły wydarzenia', // app: hostEvent.detailsTitle
  'settings.name': 'Nazwa',
  'settings.date': 'Data',
  'settings.code': 'Kod',
  'settings.noCover': 'Brak zdjęcia okładki',
  'settings.coverAdd': 'Dodaj zdjęcie okładki',
  'settings.coverChange': 'Zmień okładkę',
  'settings.coverSaved': 'Okładka zapisana.',
  'settings.coverRemoved': 'Okładka usunięta.',
  'settings.lockedNote': 'Nazwa i data są zablokowane, żeby ekran zawsze zgadzał się z wydrukowanymi kartami.',
  'settings.saved': 'Zapisano.',
  'settings.dangerTitle': 'Strefa zagrożenia', // app: hostEvent.dangerTitle
  'settings.dangerBody': 'Usunięcie kasuje wydarzenie, jego zdjęcia i listę gości dla wszystkich — również dla Twoich gości. Tej operacji nie można cofnąć.', // app: hostEvent.dangerBody
  'settings.deleteCta': 'Usuń wydarzenie',
  'settings.deleteTitle': 'Usunąć to wydarzenie?', // app: hostEvent.deleteEventTitle
  'settings.deleteBody': '„{name}” i wszystkie zdjęcia w nim zostaną trwale usunięte.', // app: hostEvent.deleteEventBody
  'settings.deleteConfirm': 'Usuń…', // app: hostEvent.deleteEventConfirm
  'settings.deleteTitle2': 'Na pewno?', // app: hostEvent.deleteEventTitle2
  'settings.deleteBody2': 'To działanie jest nieodwracalne — wydarzenia nie da się przywrócić.', // app: hostEvent.deleteEventBody2
  'settings.deleted': 'Wydarzenie usunięte.',
  'settings.deletePairedNote': 'Usuwanie wydarzeń będzie możliwe, gdy to konto będzie miało własną metodę logowania, albo w aplikacji.',

  // face matching (the app's versioned texts, face.* 2026-09-23 — copy verbatim)
  'face.title': 'Rozpoznawanie twarzy', // app: hostEvent.aiTitle
  'face.tabTitle': 'Znajdź swoje zdjęcia', // app: face.tabTitle
  'face.aiOn': 'Wł.: goście znajdą swoje zdjęcia po twarzy.', // app: hostEvent.aiOn
  'face.aiOff': 'Wył.: goście nie widzą opcji „Znajdź swoje zdjęcia”.', // app: hostEvent.aiOff
  'face.notInPackage': 'Rozpoznawanie twarzy nie wchodzi w skład tego pakietu. Można je dodać w aplikacji Sharecam.',
  'face.hostConfirmTitle': 'Włączyć rozpoznawanie twarzy?', // app: face.hostConfirmTitle
  'face.hostConfirmBody': 'Goście będą mogli znaleźć swoje zdjęcia przez selfie. To Ty musisz ich o tym poinformować — dajemy gotowy tekst na zaproszenie i na kartę na stole. Nie wolno używać tego do sprawdzania obecności ani identyfikowania kogoś, kto o to nie prosił.', // app: face.hostConfirmBody
  'face.hostConfirmCta': 'Włącz', // app: face.hostConfirmCta
  'face.remindTitle': 'Powiedz o tym gościom już teraz', // app: face.noticeTitle (adapted)
  'face.remindBody': 'Skopiuj poniższy tekst do zaproszenia lub czatu grupowego i wydrukuj kod QR z informacją pod spodem.',
  'face.noticeTitle': 'Powiedz swoim gościom', // app: face.noticeTitle
  'face.noticeSub': 'Wklej to do zaproszenia, na czat grupowy albo na kartę na stole.', // app: face.noticeSub
  'face.noticeText': 'Zdjęcia z tego wydarzenia trafiają do wspólnego albumu. Album oferuje opcjonalne rozpoznawanie twarzy, dzięki któremu możesz znaleźć swoje zdjęcia. Wybór należy do Ciebie i możesz odmówić. Szczegóły: sharecam.app/face-grouping', // app: face.noticeText
  'face.noticeCopy': 'Kopiuj tekst', // app: face.noticeCopy
  'face.noticeCopied': 'Skopiowano', // app: face.noticeCopied
  'face.noticePrint': 'Kod QR pobrany w Przeglądzie ma jednowierszową informację na drukowane karty.',
  'face.cardNotice': 'Opcjonalne rozpoznawanie twarzy w tym albumie · sharecam.app/face-grouping', // app: face.cardNotice
  'face.regionTitle': 'Niedostępne w Twoim regionie', // app: face.regionTitle
  'face.regionBody': 'Rozpoznawanie twarzy nie jest jeszcze dostępne w Twojej lokalizacji. Włączamy je tylko tam, gdzie możemy spełnić lokalne przepisy dotyczące danych biometrycznych, więc nigdy nie sprzedajemy Ci funkcji, z której Twoi goście nie mogliby skorzystać.', // app: face.regionBody
  'face.regionSoonTitle': 'Wkrótce w Twojej lokalizacji', // app: face.regionSoonTitle
  'face.regionSoonBody': 'Kończymy zgłoszenie, które pozwoli nam przetwarzać dane biometryczne twarzy w Twoim kraju. Reszta albumu działa normalnie.', // app: face.regionSoonBody
  'face.regionUnknownTitle': 'Nie udało się potwierdzić Twojej lokalizacji', // app: face.regionUnknownTitle
  'face.regionUnknownBody': 'Ta funkcja zależy od lokalnych przepisów o danych biometrycznych, więc włączamy ją tylko wtedy, gdy wiemy, które przepisy obowiązują. Reszta albumu działa normalnie.', // app: face.regionUnknownBody
  'face.declTitle': 'Zanim dodasz tę funkcję', // app: face.declTitle
  'face.declIntro': 'Jesteś organizatorem tego wydarzenia, więc to Twoje decyzje. Zaznaczając pole, potwierdzasz:', // app: face.declIntro
  'face.decl1': 'To ja decyduję, kto jest zapraszany i fotografowany na tym wydarzeniu.', // app: face.decl1
  'face.decl2': 'Powiem gościom, że rozpoznawanie twarzy jest włączone — używając tekstu zaproszenia i drukowanej karty z tej aplikacji.', // app: face.decl2
  'face.decl3': 'Moje wydarzenie nie odbywa się w Illinois, Teksasie ani w stanie Waszyngton.', // app: face.decl3
  'face.decl4': 'Dane twarzy przetwarza AWS we Frankfurcie (Niemcy) i są usuwane, gdy wyłączę tę funkcję lub album zostanie skasowany.', // app: face.decl4
  'face.decl5': 'Odpowiadam za przestrzeganie przepisów obowiązujących w miejscu mojego wydarzenia.', // app: face.decl5
  'face.declAccept': 'Potwierdzam zapoznanie się z warunkami dla organizatora i akceptuję je', // app: face.declAccept
  'face.declRead': 'Przeczytaj pełne warunki dla organizatora', // app: face.declRead
  'face.declError': 'Nie udało się zapisać Twojej akceptacji. Sprawdź połączenie i spróbuj ponownie.', // app: face.declError
  'decl.kicker': '{plan} · rozpoznawanie twarzy w cenie',
  'decl.continue': 'Akceptuję i przechodzę do płatności',

  // ---------------------------------------------------------------- package & checkout (§3.4)
  'checkout.kicker': 'Pakiety',
  'checkout.kickerPro': 'Pakiety dla fotografów', // app: paywall.titlePro
  'checkout.titleNew': 'Wybierz pakiet dla swojego wydarzenia', // app: paywall.title
  'checkout.titleUpgrade': 'Ulepsz swój pakiet', // app: paywall.titleUpgrade
  'checkout.subtitle': 'Płatność jednorazowa — to nie subskrypcja. Wybierz rozmiar pasujący do listy gości.', // app: paywall.subtitle
  'checkout.subtitlePro': 'Jednorazowa płatność za wydarzenie. Wgrywasz z komputera; goście skanują QR, przeglądają album i znajdują swoje zdjęcia dzięki selfie.', // app: paywall.subtitlePro
  'checkout.current': 'Obecnie',
  'checkout.upgradeRule': 'Ulepszenie kosztuje pełną cenę większego pakietu — tak samo jak w aplikacji.',
  'checkout.choose': 'Wybierz pakiet',
  'checkout.cta': 'Zapłać {price} · {plan}',
  'checkout.opening': 'Otwieranie bezpiecznej płatności…',
  'checkout.paying': 'Dokończ płatność w oknie płatności.',
  'checkout.sandbox': 'Sandbox · płatności testowe',
  'checkout.footnote': 'Ceny w USD, takie same jak w aplikacji Sharecam. Paddle może przy płatności pokazać Twoją lokalną walutę i podatek. Płatności obsługuje Paddle, nasz oficjalny sprzedawca (merchant of record).',
  'checkout.soonTitle': 'Zakupy na stronie już wkrótce',
  'checkout.soonOff': 'Pakietów nie można jeszcze kupić na stronie.',
  'checkout.soonPrices': 'Te pakiety nie są jeszcze sprzedawane na stronie.',
  'checkout.soonApp': 'Do tego czasu pakiety kupisz w aplikacji Sharecam na iPhone’a — to wydarzenie pojawi się tam przy tym samym logowaniu.',
  'checkout.soonAppPro': 'Do tego czasu pakiety dla fotografów kupisz w aplikacji Sharecam na iPhone’a — to wydarzenie pojawi się tam przy tym samym logowaniu.',
  'checkout.maxedTitle': '{plan} to największy pakiet',
  'checkout.maxedBody': 'W tym wydarzeniu nie ma już czego ulepszać.',
  'checkout.unavailableTitle': 'Tego wydarzenia nie można tu ulepszyć',
  'checkout.unavailableBody': 'Należy do innego konta albo już nie istnieje.',
  'checkout.codeNotPro': 'Pakiety dla fotografów wymagają wydarzenia utworzonego jako wydarzenie fotografa. Utwórz nowe wydarzenie fotografa.',
  'checkout.refundedTitle': 'Płatność za to wydarzenie została zwrócona',
  'checkout.refundedBody': 'Ponowny zakup pakietu przywraca wydarzenie: wracają wgrywanie, rozpoznawanie twarzy (jeśli jest w pakiecie) i pobieranie.',
  'checkout.abandonedTitle': 'Twoje wydarzenie jest na Spark (za darmo)',
  'checkout.abandoned': 'Twoje wydarzenie jest na Spark (za darmo). Pakiet możesz wybrać w każdej chwili.',
  'checkout.closedNote': 'Okno płatności zamknięto. Nie pobrano żadnej opłaty.',
  'checkout.applyingTitle': 'Płatność otrzymana',
  'checkout.applyingBody': 'Aktywujemy pakiet {plan} dla tego wydarzenia. Ta strona odświeży się sama.',
  'checkout.slowTitle': 'Płatność otrzymana — prawie gotowe',
  'checkout.slowBody': 'Płatność dotarła. Pakiet {plan} zostanie aktywowany w ciągu kilku minut; możesz opuścić tę stronę. Jeśli po godzinie nie będzie aktywny, napisz do nas.',
  'checkout.doneTitle': 'Gotowe 🎉', // app: paywall.doneTitle
  'checkout.doneBody': 'Pakiet {plan} jest aktywny. Paddle wyśle potwierdzenie na Twój e-mail.', // app: paywall.active (+ receipt)
  'checkout.toOverview': 'Przejdź do wydarzenia', // app: qr.goToEvent
  'checkout.coveredTitle': 'To wydarzenie ma już pakiet {plan}',
  'checkout.coveredBody': 'Jeśli zapłacono dwa razy, zwrócimy nadpłatę. Pytania: {email}',
  'checkout.failedTitle': 'Nie udało się zaksięgować płatności',
  'checkout.failedBody': 'Zwrócimy ją — nie musisz nic robić. Pytania: {email}',
  'checkout.openFailedTitle': 'Nie udało się otworzyć płatności',
  'checkout.openFailedBody': 'Nie pobrano żadnej opłaty. Spróbuj ponownie za chwilę.',
  'checkout.tooMany': 'Dziś otwarto zbyt wiele płatności. Spróbuj jutro albo napisz do nas.',
  'checkout.backToPackages': 'Wróć do pakietów',
  'checkout.contact': 'Napisz do pomocy',
  'checkout.mailSlow': 'Płatność na stronie jeszcze niezaksięgowana',
  'checkout.mailDuplicate': 'Podwójna płatność',
  'checkout.mailFailed': 'Płatność na stronie niezaksięgowana',
  'checkout.proIncludesTitle': 'W każdym pakiecie dla fotografów:',
  'checkout.proInc1': 'Rozpoznawanie twarzy w cenie, tam gdzie jest dostępne', // app: paywall.featAiIncluded (adapted)
  'checkout.proInc2': 'Tylko Ty wgrywasz — goście oglądają', // app: paywall.featHostOnly
  'checkout.proInc3': 'Oryginały w pełnej rozdzielczości', // app: paywall.featOriginals

  // ---------------------------------------------------------------- downloads
  'downloads.zipTitle': 'Pobierz album',
  'downloads.zipBody': 'Wszystkie zdjęcia i filmy w jednym pliku ZIP. Przygotowanie dużych albumów trwa minutę.',
  'downloads.zipCta': 'Pobierz ZIP', // app: download.zip
  'downloads.zipWorking': 'Pakowanie…', // app: download.zipWorking
  'downloads.zipReady': 'Pobierz ZIP (pozycje: {n})',
  'downloads.displayTitle': 'Do udostępniania — 2048 px',
  'downloads.displayBody': 'Cały album w częściach ZIP po 500 zdjęć, w rozmiarze na ekrany i media społecznościowe.',
  'downloads.originalTitle': 'Oryginały — pełna rozdzielczość',
  'downloads.originalBody': 'Wgrane pliki dokładnie takie, jakie były, w częściach ZIP po 150 zdjęć.',
  'downloads.prepare': 'Przygotuj pobieranie',
  'downloads.again': 'Przygotuj ponownie',
  'downloads.preparing': 'Przygotowywanie części {done} z {total}…',
  'downloads.part': 'Część {n} z {of}',
  'downloads.items': '{n} zdj.',
  'downloads.download': 'Pobierz',
  'downloads.validity': 'Cały album w częściach ZIP — 2048 px do udostępniania, oryginały w pełnej rozdzielczości do przechowywania. Linki ważne 7 dni, można je odnowić.', // app: ownerLink.step3Body
  'downloads.refundedTitle': 'Pobieranie jest wyłączone dla wydarzeń ze zwrotem płatności',
  'downloads.refunded': 'Płatność za to wydarzenie została zwrócona, więc albumu nie można wyeksportować jako ZIP. Ponowny zakup pakietu przywraca tę opcję.', // app: download.zipRefunded
  'downloads.buyAgain': 'Zobacz pakiety',
  'downloads.nothing': 'Nie ma jeszcze nic do pobrania.',
  'downloads.failed': 'Nie udało się utworzyć pliku ZIP.', // app: download.zipFailed
  'downloads.keepTitle': 'Zachowaj kopię',
  'downloads.keepBody': 'Przechowywanie kończy się {date}. Pobierz album wcześniej.',
  'downloads.keepBodyNoDate': 'Pobierz album przed końcem okresu przechowywania.',

  // ---------------------------------------------------------------- account
  'account.kicker': 'Konto', // app: account.title
  'account.title': 'Twoje konto',
  'account.signins': 'Metody logowania',
  'account.pairedOnly': 'Ten komputer jest połączony z aplikacją Sharecam. Konto nie ma jeszcze własnej metody logowania.',
  'account.sameAsApp': 'Twoje wydarzenia należą do tego konta — tego samego, którego używasz w aplikacji Sharecam.',
  'account.addAnother': 'Dodaj kolejną metodę logowania',
  'account.addAnotherBody': 'Drugi sposób wejścia na wypadek, gdyby dostęp do pierwszego przepadł.',
  'account.linked': 'Dodano metodę logowania.',
  'account.signOutTitle': 'Wyloguj się', // app: account.signOut
  'account.signOutBody': 'Twoje wydarzenia zostają na koncie. Zaloguj się ponownie w dowolnej chwili.',
  'account.signOutPaired': 'Bez własnej metody logowania ten komputer wróci tylko po ponownym połączeniu z aplikacją.',
  'account.deleteCta': 'Usuń konto i dane', // app: account.deleteCta
  'account.deleteTitle': 'Usunąć konto i dane?', // app: account.deleteTitle
  'account.deleteBody': 'Twoje konto, wszystkie utworzone wydarzenia, zdjęcia i listy gości zostaną trwale usunięte — na każdym urządzeniu. Tej operacji nie można cofnąć.', // app: account.deleteBody
  'account.deleteConfirm': 'Usuń wszystko', // app: account.deleteConfirm
  'account.deleted': 'Twoje konto i dane zostały usunięte.', // app: account.deleted
  'account.deleteFailed': 'Nie udało się usunąć konta. Spróbuj ponownie.', // app: account.deleteFailed
  'account.deletePairedNote': 'Usunięcie konta będzie możliwe, gdy będzie miało własną metodę logowania, albo w aplikacji (Ustawienia → Konto).',
};

export default pl;
