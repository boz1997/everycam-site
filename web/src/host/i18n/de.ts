// Sharecam host dashboard — Deutsch (plan §3.6, D15; WP-H).
//
// Anrede "du" (wie die App), "Event", "Gastgeber" = host, "Paket", "Gesichtserkennung",
// "Privater Modus" / "Offene Galerie", "Live-Wand"; Computer koppeln = "verbinden" (wie die
// Upload-Seite). Anführungszeichen „…“, Gedankenstrich –, Auslassung ….
//
// Same keys and order as en.ts (tsc fails on a missing or stale key). A `// app: <key>`
// comment marks a string copied verbatim from EC/src/i18n/locales/de.ts (native-reviewed
// 23 Sep 2026, EC 5c05c8e; {{x}} → {x}); "(adapted)" = the app wording with the same change
// the English line makes. Every other string is new and is checked before go-live.
// face.* declaration and notice texts are versioned (declTextVersion 2026-09-23): never edit
// them here, only together with the app and the server.

import type { Dict } from './en';

const de: Dict = {
  // ---------------------------------------------------------------- common
  'common.back': 'Zurück',
  'common.cancel': 'Abbrechen', // app: common.cancel
  'common.close': 'Schließen', // app: common.close
  'common.delete': 'Löschen', // app: common.delete
  'common.on': 'An', // app: common.on
  'common.off': 'Aus', // app: common.off
  'common.ok': 'OK',
  'common.copy': 'Kopieren',
  'common.copied': 'Kopiert', // app: face.noticeCopied
  'common.remove': 'Entfernen', // app: create.coverRemove
  'common.saving': 'Wird gespeichert…',
  'common.loading': 'Lädt…',
  'common.loadFailed': 'Diese Seite konnte nicht geladen werden',
  'common.checkConnection': 'Prüfe deine Verbindung und versuch es erneut.',
  'common.tryAgain': 'Etwas ist schiefgelaufen. Bitte versuch es erneut.',
  'common.prev': 'Zurück',
  'common.next': 'Weiter',

  // ---------------------------------------------------------------- page titles (browser tab)
  'title.events': 'Deine Events',
  'title.signin': 'Anmelden',
  'title.new': 'Event erstellen',
  'title.account': 'Konto',

  // ---------------------------------------------------------------- shell
  'shell.tag': 'Gastgeber',
  'shell.language': 'Sprache',
  'shell.accountMenu': 'Kontomenü',
  'shell.events': 'Deine Events',
  'shell.account': 'Konto',
  'shell.signOut': 'Abmelden', // app: account.signOut
  'shell.signedInAs': 'Angemeldet als {who}',
  'shell.paired': 'Mit der App verbunden',
  'shell.pairedLong': 'Dieser Computer ist mit der Sharecam-App verbunden. Er hat noch keine eigene Anmeldung.',
  'shell.linkBannerTitle': 'Füge eine Anmeldung hinzu, um dieses Konto zu behalten',
  'shell.linkBannerBody': 'Dieser Computer ist mit deiner Sharecam-App verbunden. Füge eine Anmeldung per E-Mail oder Google hinzu, damit du auch ohne die App zurückkommst. Für einen Paketkauf im Web brauchst du sie ebenfalls.',
  'shell.linkBannerCta': 'Anmeldung hinzufügen',
  'nav.events': 'Deine Events',
  'nav.signin': 'Anmelden',
  'legal.webTerms': 'Bedingungen für Web-Käufe',
  'legal.refund': 'Erstattungsrichtlinie',
  'legal.privacy': 'Datenschutz', // app: legal.privacy
  'legal.terms': 'AGB', // app: legal.terms
  'legal.support': 'Support', // app: legal.support
  'legacy.title': 'Diesen Computer erneut verbinden',
  'legacy.body': 'Dieser Browser war über die alte Upload-Seite mit deinen Events verbunden. Wir haben ihn abgemeldet, damit die Gästeseite hier wieder normal funktioniert. Zum Hochladen verbinde ihn noch einmal mit der Sharecam-App oder melde dich an.',

  // ---------------------------------------------------------------- sign in
  'signin.kicker': 'Gastgeber-Bereich',
  'signin.title': 'Bei deinen Events anmelden',
  'signin.lead': 'Nutze dieselbe Anmeldung wie in der App (Einstellungen → Konto). Falls du dich dort noch nie angemeldet hast, tu das zuerst.',
  'signin.appKicker': 'Nutzt du schon die App?',
  'signin.appTitle': 'Gleiches Konto, gleiche Events',
  'signin.appBody': 'Events, die du in der Sharecam-App erstellt hast, erscheinen hier, wenn du dich mit demselben Konto anmeldest wie in der App (Einstellungen → Konto).',
  'auth.google': 'Mit Google fortfahren', // app: account.continueGoogle
  'auth.apple': 'Mit Apple fortfahren', // app: account.continueApple
  'auth.soon': 'Bald',
  'auth.appleSoon': 'In der App mit Apple angemeldet? Die Anmeldung mit Apple im Web kommt bald.',
  'auth.orEmail': 'oder mit E-Mail',
  'auth.email': 'E-Mail',
  'auth.password': 'Passwort',
  'auth.passwordHint': 'Mindestens 6 Zeichen.',
  'auth.signinCta': 'Anmelden',
  'auth.createCta': 'Konto erstellen',
  'auth.resetCta': 'Link zum Zurücksetzen senden',
  'auth.resetTitle': 'Passwort zurücksetzen',
  'auth.resetSent': 'Falls es zu {email} ein Konto gibt, ist ein Link zum Zurücksetzen unterwegs. Schau in dein Postfach.',
  'auth.toCreate': 'Neu hier? Konto erstellen',
  'auth.toReset': 'Passwort vergessen?',
  'auth.toSignin': 'Zurück zur Anmeldung',
  'auth.errWrong': 'E-Mail oder Passwort ist falsch.',
  'auth.errEmailTaken': 'Zu dieser E-Mail gibt es schon ein Konto. Melde dich stattdessen an.',
  'auth.errWeak': 'Wähle ein Passwort mit mindestens 6 Zeichen.',
  'auth.errEmail': 'Gib eine gültige E-Mail-Adresse ein.',
  'auth.errPopupBlocked': 'Dein Browser hat das Anmeldefenster blockiert. Erlaube Pop-ups für diese Seite und versuch es erneut.',
  'auth.errProviderOff': 'Diese Anmeldung ist auf dieser Seite noch nicht verfügbar. Nutze stattdessen E-Mail.',
  'auth.errOffline': 'Keine Verbindung. Prüfe dein Internet und versuch es erneut.',
  'auth.errTooMany': 'Zu viele Versuche. Warte eine Minute und versuch es erneut.',
  'auth.errDisabled': 'Dieses Konto wurde deaktiviert. Schreib uns über die Support-Seite.',
  'auth.errRecent': 'Zu deiner Sicherheit: Melde dich ab und wieder an und wiederhole dann diesen Schritt.',
  'auth.errAlreadyLinked': 'Diese Anmeldung ist bereits mit deinem Konto verknüpft.',
  'auth.errGeneric': 'Anmeldung fehlgeschlagen. Versuch es erneut.', // app: account.errorGeneric

  // ---------------------------------------------------------------- pair with the app
  'pair.kicker': 'Für Fotografen',
  'pair.title': 'Mit der Sharecam-App verbinden',
  'pair.body': 'Noch keine Anmeldung im Web? Verbinde diesen Computer mit dem Konto in deiner Sharecam-App. Das funktioniert bei Fotografen-Events.',
  'pair.open': 'Mit der App verbinden',
  'pair.qrTitle': 'Scanne diesen Code mit der App',
  'pair.step1': 'Öffne dein Fotografen-Event in der Sharecam-App.',
  'pair.step2': 'Tippe auf „Vom Computer hochladen“ und dann auf „QR am Computer scannen“.',
  'pair.step3': 'Bestätige auf dem Handy. Diese Seite meldet sich von selbst an.',
  'pair.qrAlt': 'Verbindungscode für die Sharecam-App',
  'pair.qrFoot': 'Der Code erneuert sich alle paar Minuten.',
  'pair.qrError': 'Der Code konnte nicht erstellt werden. Nutze stattdessen den 6-stelligen Code unten.',
  'pair.connecting': 'Wird verbunden…',
  'pair.orCode': 'oder den Code aus der App eingeben',
  'pair.codeLabel': 'Code aus der App',
  'pair.codeCta': 'Verbinden',
  'pair.foot': 'Der Code meldet diesen Computer mit deinem Konto an. Nutze ihn nur auf einem vertrauenswürdigen Computer.', // app: uploadLink.footer (adapted)
  'pair.errNotFound': 'Dieser Code ist ungültig. Prüfe ihn in der App.',
  'pair.errExpired': 'Dieser Code ist abgelaufen. Erstelle in der App einen neuen.',
  'pair.errUsed': 'Dieser Code wurde bereits verwendet. Erstelle in der App einen neuen.',
  'pair.errGeneric': 'Dieser Computer konnte nicht verbunden werden. Prüfe deine Verbindung und versuch es erneut.',

  // ---------------------------------------------------------------- link a sign-in (paired accounts)
  'link.kicker': 'Noch ein Schritt',
  'link.title': 'Füge diesem Konto eine Anmeldung hinzu',
  'link.lead': 'Deine Events bleiben, wo sie sind. Danach kannst du dich hier damit anmelden, und die App funktioniert weiter wie bisher.',
  'link.buyLead': 'Für Käufe im Web brauchst du ein Konto, zu dem du zurückfindest: Belege gehen an eine E-Mail-Adresse, und das Paket gehört für die ganze Speicherdauer zu diesem Event. Füge zuerst eine Anmeldung hinzu; deine Events bleiben, wo sie sind.',
  'link.google': 'Google-Anmeldung hinzufügen',
  'link.apple': 'Apple-Anmeldung hinzufügen',
  'link.emailCta': 'E-Mail-Anmeldung hinzufügen',
  'link.inUseTitle': 'Zu dieser Anmeldung gibt es schon ein Sharecam-Konto',
  'link.inUseBody': 'Melde dich in der App damit an (Einstellungen → Konto); die App verschiebt deine Events dorthin. Melde dich dann hier mit demselben Konto an.',
  'link.inUseBack': 'Andere Anmeldung versuchen',

  // ---------------------------------------------------------------- event list
  'list.kicker': 'Gastgeber-Bereich',
  'list.title': 'Deine Events',
  'list.lead': 'Alles, was du veranstaltest – aus dem Web und aus der App.',
  'list.leadEmpty': 'Erstelle ein Event, teile den QR-Code, sammle jedes Foto.', // app: welcome.hostDesc
  'list.create': 'Event erstellen',
  'list.createPro': 'Fotografen-Event',
  'list.groupPro': 'Fotografen-Events',
  'list.groupEvents': 'Events',
  'list.groupAll': 'Events',
  'list.count': '{n} insgesamt',
  'list.guestsShort': '{v} Gäste',
  'list.photosShort': '{v} Fotos',
  'list.keptUntil': 'Gespeichert bis {date}',
  'list.deletion': 'Gespeichert bis',
  'list.waiting': 'Noch kein Paket – der QR-Code öffnet sich, sobald eines aktiv ist',
  'list.emptyTitle': 'Noch keine Events', // app: dashboard.emptyTitle
  'list.emptyBody': 'In 60 Sekunden fertig: Name, Datum, Privatsphäre – dein QR-Code druckbereit. Events in der App erstellt? Melde dich hier mit demselben Konto an wie dort.', // app: dashboard.emptyBody (+ one sentence)
  'list.findHint': 'Du findest ein Event aus der App nicht? Melde dich mit demselben Konto an wie dort (Einstellungen → Konto). Events einer App ohne Anmeldung bleiben auf diesem Handy, bis du dich dort anmeldest.',

  // ---------------------------------------------------------------- stats, units, plans
  'stat.guests': 'Gäste',
  'stat.photos': 'Fotos',
  'stat.videos': 'Videos',
  'unit.days': '{n} Tage',
  'unit.month': '1 Monat',
  'unit.months': '{n} Monate',
  'unit.year': '1 Jahr',
  'unit.years': '{n} Jahre',
  'unit.unlimited': 'Unbegrenzt',
  'unit.unlimitedShort': 'kein Limit',
  'plan.free': 'Gratis', // app: paywall.free
  'plan.perEvent': 'pro Event', // app: paywall.perEvent
  'plan.popular': 'Am beliebtesten', // app: plans.wedding.badge
  'plan.storage': 'Speicher',
  'plan.refunded': 'Erstattet',
  'plan.awaiting': 'Paket wählen',
  'plan.webSoon': 'Bald im Web',
  'plan.none': 'Noch kein Paket',
  'plan.wallIncluded': 'Mit Live-Wand',

  // ---------------------------------------------------------------- create
  'new.kicker': 'Neues Event',
  'new.kickerPro': 'Neues Fotografen-Event',
  'new.title': 'Event erstellen',
  'new.titlePro': 'Fotografen-Event erstellen',
  'new.lead': 'Gib ihm einen Namen, lege fest, wer die Fotos sieht, und wähle ein Paket. Jedes Event startet gratis mit Spark.',
  'new.leadPro': 'Du lädst vom Computer hoch, Originale bleiben erhalten. Gäste scannen den QR-Code, sehen das Album und finden ihre eigenen Fotos per Selfie.',
  'new.tierLabel': 'Art des Events',
  'new.tierEvents': 'Events',
  'new.tierPro': 'Fotografen',
  'new.details': 'Event-Details', // app: create.step1Title
  'new.name': 'Gib deinem Event einen Namen', // app: create.titleName
  'new.namePlaceholder': 'Hochzeit von Anna & Michael', // app: create.namePlaceholder
  'new.nameRequired': 'Bitte gib dem Event einen Namen.',
  'new.date': 'Event-Datum (optional)', // app: create.dateLabel
  'new.dateHint': 'Das Datum erscheint auf deinen Einladungskarten. Die Speicherdauer zählt ab diesem Tag.',
  'new.who': 'Wer sieht die Fotos?', // app: create.titleMode
  'new.modeHint': 'Das kannst du später in den Einstellungen ändern.', // app: create.modeHint
  'new.cover': 'Titelbild (optional)',
  'new.coverAdd': 'Titelbild hinzufügen',
  'new.coverChange': 'Ändern',
  'new.locked': 'Name und Datum lassen sich später nicht ändern: Sie stehen auf deinen Karten.',
  'new.package': 'Paket',
  'new.consumerSoon': 'Kostenpflichtige Pakete kommen bald ins Web. Starte jetzt gratis mit Spark und upgrade später – hier oder in der App.',
  'new.proSoonTitle': 'Pakete für Fotografen kommen bald ins Web',
  'new.proSoonBody': 'Bis dahin gibt es sie in der Sharecam-App für iPhone. Events, die du dort erstellst, erscheinen hier mit derselben Anmeldung.',
  'new.proRegionLater': 'Nach der Anmeldung prüfen wir, ob die Gesichtserkennung bei dir angeboten wird.',
  'new.ctaFree': 'Event erstellen',
  'new.ctaPaid': 'Erstellen und bezahlen · {plan} {price}',
  'new.created': 'Event erstellt.',
  'new.createFailed': 'Das Event konnte nicht erstellt werden. Prüfe deine Verbindung und versuch es erneut.',
  'new.backToForm': 'Zurück zum Formular',
  'new.stepAccount': 'Fast geschafft',
  'new.accountTitle': 'Melde dich an, um dein Event zu speichern',
  'new.accountLead': 'Dein Event braucht ein Konto, zu dem du zurückkommen kannst. Nutze dieselbe Anmeldung wie in der App, falls du eine hast.',
  'new.summary': 'Dein Event',
  'mode.openTitle': 'Offene Galerie', // app: create.openTitle
  'mode.openDesc': 'Alle sehen und liken, was hochgeladen wird. Ein gemeinsames Live-Album.', // app: create.openDesc
  'mode.privateTitle': 'Privater Modus', // app: create.privateTitle
  'mode.privateDesc': 'Nur du siehst alles; Gäste sehen nur ihre eigenen Uploads. Perfekt für ein Überraschungsalbum.', // app: create.privateDesc

  // ---------------------------------------------------------------- event page
  'event.kicker': 'Event',
  'event.kickerPro': 'Fotografen-Event', // app: hostEvent.hostOnlyTitle
  'event.noDate': 'Kein Datum', // app: hostEvent.noDate
  'event.codeLine': 'Code {code}',
  'event.goneTitle': 'Dieses Event ist nicht mehr verfügbar', // app: eventGone.title
  'event.goneBody': 'Es wurde vielleicht gelöscht, oder die Speicherdauer ist abgelaufen.', // app: eventGone.body
  'event.notYoursTitle': 'Dieses Event gehört zu einem anderen Konto',
  'event.notYoursBody': 'Melde dich mit dem Konto an, mit dem es erstellt wurde – demselben wie in der App.',
  'tab.label': 'Bereiche des Events',
  'tab.overview': 'Übersicht',
  'tab.gallery': 'Galerie',
  'tab.guests': 'Gäste', // app: hostEvent.tabGuests
  'tab.settings': 'Einstellungen', // app: hostEvent.tabSettings
  'tab.plan': 'Paket', // app: hostEvent.planTitle
  'tab.downloads': 'Downloads',

  // overview
  'overview.createdTitle': 'Event erstellt!', // app: qr.createdTitle
  'overview.createdBody': 'Teile den QR-Code mit deinen Gästen – jedes Foto landet in deiner Galerie.', // app: qr.createdSubtitle
  'overview.createdBodyPro': 'Lade deine Fotos von diesem Computer hoch. Gäste scannen den QR-Code, sehen das Album und finden sich selbst.',
  'overview.stats': 'Bisher',
  'overview.statsPro': 'Im Album',
  'overview.package': 'Paket', // app: hostEvent.planTitle
  'overview.keptUntil': 'Gespeichert bis',
  'overview.face': 'Gesichtserkennung', // app: hostEvent.aiTitle
  'overview.faceNot': 'Nicht in diesem Paket',
  'overview.wall': 'Live-Wand', // app: hostEvent.wallTitle
  'overview.included': 'Inklusive',
  'overview.changePackage': 'Paket ändern',
  'overview.refundedNote': 'Die Zahlung für dieses Event wurde erstattet. Das Album bleibt bis zum Ende der Speicherdauer; ein erneuter Paketkauf aktiviert es wieder.',
  'qr.kicker': 'Einladung',
  'qr.title': 'Gäste treten in einem Schritt bei', // app: qr.title
  'qr.body': 'Leg den QR-Code auf die Tische oder schick den Link. Gäste geben ihren Namen ein und teilen direkt im Browser ihres Handys – keine App, kein Konto.',
  'qr.titlePro': 'Der QR-Code für die Gäste',
  'qr.bodyPro': 'Gäste scannen ihn, sehen das Album, speichern Fotos und finden sich per Selfie. Nur du lädst hoch.',
  'qr.codeLabel': 'Event-Code', // app: qr.codeLabel
  'qr.linkLabel': 'Link für Gäste',
  'qr.alt': 'QR-Code für Event {code}',
  'qr.png': 'QR herunterladen (PNG)',
  'qr.share': 'Einladung teilen', // app: qr.share
  'qr.shareText': 'Tritt dem Fotoalbum „{name}“ bei (Code {code})',
  'qr.faceLine': 'Gesichtserkennung ist an: Der gedruckte QR-Code trägt den einzeiligen Hinweis für Gäste.',
  'upload.kicker': 'Upload',
  'upload.title': 'Vom Computer hochladen', // app: uploadLink.title
  'upload.body': 'Zieh einen ganzen Ordner von deinem Computer hinein. Originale bleiben in voller Auflösung erhalten; Gäste sehen kleine Vorschaubilder.', // app: uploadLink.subtitle
  'upload.cta': 'Originale hochladen',
  'upload.countOf': 'von {cap} Fotos',
  'upload.countUnlimited': 'Fotos, kein Limit',
  'owner.title': 'Mit dem Paar teilen', // app: hostEvent.shareOwnerTitle
  'owner.body': 'Gib dem Paar einen einmaligen Code. Auf sharecam.app/album sehen sie das ganze Album und laden alles herunter – volle Auflösung, in Teilen.', // app: hostEvent.shareOwnerBody
  'owner.cta': 'Code für das Paar erstellen', // app: hostEvent.shareOwnerCta
  'owner.newCode': 'Neuer Code', // app: ownerLink.newCode
  'owner.expires': 'Läuft in {time} ab · nur einmal gültig', // app: ownerLink.expiresIn
  'owner.expired': 'Dieser Code ist abgelaufen', // app: ownerLink.expired
  'owner.link': 'Album-Link',
  'owner.foot': 'Nur das Paar sollte diesen Code bekommen – er schaltet den Download des ganzen Albums frei.', // app: ownerLink.footer
  'owner.error': 'Der Code konnte nicht erstellt werden. Prüfe deine Verbindung und versuch es erneut.', // app: ownerLink.error
  'wall.title': 'Live-Wand', // app: hostEvent.wallTitle
  'wall.openBody': 'Die Wand ist bereit. Öffne diesen Link auf dem TV, Laptop oder Beamer der Location – kein Kabel, keine App.',
  'wall.privateWarning': 'Im privaten Modus bleiben Uploads bis zur Enthüllung verborgen, daher ist die Wand aus. Wechsle zur offenen Galerie, um die Wand zu nutzen.', // app: wall.privateWarning
  'await.kicker': 'Fotografen-Event',
  'await.title': 'Wähle ein Paket für deinen QR-Code',
  'await.body': 'Dieses Event hat noch kein Fotografen-Paket. QR-Code, Code und Upload-Seite werden aktiv, sobald ein Paket aktiv ist. Name und Datum sind gespeichert.',
  'await.cta': 'Paket wählen',

  // expiry (D19)
  'expiry.title': 'Die Fotos von „{name}“ werden in {n} Tagen gelöscht',
  'expiry.titleOne': 'Die Fotos von „{name}“ werden morgen gelöscht',
  'expiry.todayTitle': 'Die Fotos von „{name}“ werden heute gelöscht',
  'expiry.body': 'Die Speicherdauer endet am {date}. Lade das Album vorher herunter – danach lässt es sich nicht wiederherstellen.',
  'expiry.download': 'Herunterladen',
  'expiry.listTitle': 'Speicherdauer endet bald',
  'expiry.listBody': 'Nach diesem Datum werden die Fotos gelöscht und lassen sich nicht wiederherstellen. Lade herunter, was du behalten willst.',
  'expiry.whenDays': 'in {n} Tagen',
  'expiry.whenTomorrow': 'morgen',
  'expiry.whenToday': 'heute',
  'expiry.icsShort': 'Erinnerung',
  'expiry.ics': 'Kalender-Erinnerung hinzufügen',
  'expiry.icsTitle': 'Sharecam-Fotos herunterladen: {name}',
  'expiry.icsBody': 'Die Fotos von „{name}“ werden am {date} gelöscht. Öffne den Gastgeber-Bereich, um sie herunterzuladen.',

  // gallery
  'gallery.count': '{n} Elemente · {shown} geladen',
  'gallery.filter': 'Anzeigen',
  'gallery.all': 'Alle', // app: gallery.all
  'gallery.reportedN': 'Gemeldete ({n})', // app: hostEvent.reportedFilter
  'gallery.hiddenN': 'Ausgeblendet ({n})',
  'gallery.hidden': 'Ausgeblendet',
  'gallery.reported': 'Gemeldet',
  'gallery.hide': 'Vor Gästen ausblenden',
  'gallery.show': 'Für Gäste einblenden',
  'gallery.hiddenToast': 'Vor Gästen ausgeblendet.',
  'gallery.shownToast': 'Für Gäste wieder sichtbar.',
  'gallery.deleteTitle': 'Dieses Foto löschen?', // app: hostEvent.deleteTitle
  'gallery.deleteBody': 'Es wird aus der Galerie entfernt.', // app: hostEvent.deleteBody
  'gallery.deletedToast': 'Gelöscht.',
  'gallery.more': 'Mehr laden',
  'gallery.emptyTitle': 'Noch keine Fotos', // app: hostEvent.emptyTitle
  'gallery.emptyBody': 'Lege den QR auf die Tische – das erste Foto erscheint hier.',
  'gallery.emptyPro': 'Lade vom Computer hoch – Originale bleiben erhalten, Gäste sehen die Galerie innerhalb weniger Minuten.', // app: hostEvent.emptyProBody
  'gallery.noneReported': 'Unter den geladenen Elementen ist nichts gemeldet.',
  'gallery.noneHidden': 'Unter den geladenen Elementen ist nichts ausgeblendet.',
  'gallery.viewer': 'Fotoansicht',
  'gallery.openItem': 'Foto von {name} öffnen',
  'gallery.photoAlt': 'Foto von {name}',
  'gallery.unknownOwner': 'Gast',
  'gallery.openFull': 'In voller Größe öffnen',

  // guests
  'guests.emptyTitle': 'Noch keine Gäste', // app: guests.emptyTitle
  'guests.emptyBody': 'Alle, die mit QR oder Code beitreten, erscheinen hier mit ihrem Namen.', // app: guests.emptyBody
  'guests.ban': 'Entfernen', // app: guests.ban
  'guests.unban': 'Wieder zulassen', // app: guests.unban
  'guests.bannedTag': 'entfernt', // app: guests.bannedTag
  'guests.banTitle': '{name} entfernen?', // app: guests.banTitle
  'guests.banBody': 'Diese Person kann nicht erneut beitreten oder hochladen. Bereits hochgeladene Fotos bleiben erhalten (du kannst sie in der Galerie löschen).', // app: guests.banBody
  'guests.owner': 'Albumbesitzer',
  'guests.noName': 'Gast',
  'guests.joined': 'beigetreten {time}',
  'guests.removedToast': '{name} wurde entfernt.',
  'guests.restoredToast': '{name} kann wieder beitreten.',
  'guests.capTitle': 'Gäste in diesem Event',
  'guests.capBody': 'Entfernte Gäste zählen nicht; ihr Platz wird wieder frei.',
  'guests.full': 'Gästelimit erreicht ({limit}). Mit einem größeren Paket können mehr Gäste beitreten.', // app: guests.limitFull (adapted)

  // settings
  'settings.galleryTitle': 'Wer beitritt, wer sieht',
  'settings.privateTitle': 'Privater Modus', // app: hostEvent.privateTitle
  'settings.privateOn': 'Gäste sehen nur ihre eigenen Fotos.', // app: hostEvent.privateOn
  'settings.privateOff': 'Alle sehen die ganze Galerie.', // app: hostEvent.privateOff
  'settings.statePrivate': 'Privat', // app: hostEvent.statePrivate
  'settings.statePublic': 'Öffentlich', // app: hostEvent.statePublic
  'settings.revealTitle': 'Galerie für alle öffnen?', // app: hostEvent.revealTitle
  'settings.revealBody': 'Gäste sehen dann die Fotos der anderen – die große Enthüllung. Bist du sicher?', // app: hostEvent.revealBody
  'settings.revealConfirm': 'Ja, öffnen', // app: hostEvent.revealConfirm
  'settings.autoRevealTitle': 'Automatische Öffnung', // app: hostEvent.revealSchedTitle
  'settings.autoRevealOn': 'Die Galerie öffnet sich für alle am {time}.', // app: hostEvent.revealSchedOn
  'settings.autoRevealOff': 'Aus: Die Galerie bleibt privat, bis du sie selbst öffnest.', // app: hostEvent.revealSchedOff
  'settings.revealPick': 'Datum und Uhrzeit wählen', // app: hostEvent.revealPick
  'settings.pauseTitle': 'Neue Beitritte pausieren', // app: hostEvent.pauseTitle
  'settings.pauseOn': 'Niemand Neues kann beitreten. Aktuelle Gäste bleiben.', // app: hostEvent.pauseOn
  'settings.pauseOff': 'Jeder mit QR oder Code kann beitreten.', // app: hostEvent.pauseOff
  'settings.statePaused': 'Pausiert', // app: hostEvent.statePaused
  'settings.stateOpen': 'Offen', // app: hostEvent.stateOpen
  'settings.downloadTitle': 'Gäste-Downloads', // app: hostEvent.downloadTitle
  'settings.downloadDesc': 'Gäste können Fotos speichern.', // app: hostEvent.downloadDesc
  'settings.hostOnlyTitle': 'Fotografen-Event', // app: hostEvent.hostOnlyTitle
  'settings.hostOnlyBody': 'Nur du lädst hoch. Gäste sehen die Galerie, speichern Fotos und finden sich per Selfie. Das lässt sich nicht ändern.', // app: hostEvent.hostOnlyBody
  'settings.detailsTitle': 'Event-Details', // app: hostEvent.detailsTitle
  'settings.name': 'Name',
  'settings.date': 'Datum',
  'settings.code': 'Code',
  'settings.noCover': 'Kein Titelbild',
  'settings.coverAdd': 'Titelbild hinzufügen',
  'settings.coverChange': 'Titelbild ändern',
  'settings.coverSaved': 'Titelbild gespeichert.',
  'settings.coverRemoved': 'Titelbild entfernt.',
  'settings.lockedNote': 'Name und Datum sind gesperrt, damit der Bildschirm immer zu deinen gedruckten Karten passt.',
  'settings.saved': 'Gespeichert.',
  'settings.dangerTitle': 'Gefahrenzone', // app: hostEvent.dangerTitle
  'settings.dangerBody': 'Beim Löschen verschwinden das Event, seine Fotos und die Gästeliste für alle – auch für deine Gäste. Das lässt sich nicht rückgängig machen.', // app: hostEvent.dangerBody
  'settings.deleteCta': 'Event löschen',
  'settings.deleteTitle': 'Dieses Event löschen?', // app: hostEvent.deleteEventTitle
  'settings.deleteBody': '„{name}“ und alle Fotos darin werden dauerhaft entfernt.', // app: hostEvent.deleteEventBody
  'settings.deleteConfirm': 'Löschen…', // app: hostEvent.deleteEventConfirm
  'settings.deleteTitle2': 'Wirklich ganz sicher?', // app: hostEvent.deleteEventTitle2
  'settings.deleteBody2': 'Das ist endgültig – das Event lässt sich nicht wiederherstellen.', // app: hostEvent.deleteEventBody2
  'settings.deleted': 'Event gelöscht.',
  'settings.deletePairedNote': 'Events löschen kannst du, sobald dieses Konto eine eigene Anmeldung hat, oder in der App.',

  // face matching (the app's versioned texts, face.* 2026-09-23 — copy verbatim)
  'face.title': 'Gesichtserkennung', // app: hostEvent.aiTitle
  'face.tabTitle': 'Finde deine Fotos', // app: face.tabTitle
  'face.aiOn': 'An: Gäste können ihre eigenen Fotos per Selfie finden.', // app: hostEvent.aiOn
  'face.aiOff': 'Aus: Gäste sehen „Finde deine Fotos“ nicht.', // app: hostEvent.aiOff
  'face.notInPackage': 'Gesichtserkennung ist nicht Teil dieses Pakets. Sie lässt sich in der Sharecam-App hinzufügen.',
  'face.hostConfirmTitle': 'Gesichtserkennung aktivieren?', // app: face.hostConfirmTitle
  'face.hostConfirmBody': 'Deine Gäste können dann ihre eigenen Fotos per Selfie finden. Du bist dafür verantwortlich, sie darüber zu informieren – Text für Einladung und Aushang bekommst du von uns. Die Funktion darf nicht genutzt werden, um die Anwesenheit zu kontrollieren oder Personen zu identifizieren, die nicht selbst darum gebeten haben.', // app: face.hostConfirmBody
  'face.hostConfirmCta': 'Aktivieren', // app: face.hostConfirmCta
  'face.remindTitle': 'Sag deinen Gästen jetzt Bescheid', // app: face.noticeTitle (adapted)
  'face.remindBody': 'Kopiere den Text unten in deine Einladung oder den Gruppenchat und drucke den QR-Code mit seiner Hinweiszeile.',
  'face.noticeTitle': 'Sag deinen Gästen Bescheid', // app: face.noticeTitle
  'face.noticeSub': 'Füge das in deine Einladung, den Gruppenchat oder eine Karte auf den Tischen ein.', // app: face.noticeSub
  'face.noticeText': 'Die Fotos dieser Veranstaltung werden in einem gemeinsamen Album gesammelt. Es bietet optionale Gesichtserkennung, damit du deine eigenen Fotos findest. Du entscheidest und kannst ablehnen. Details: sharecam.app/face-grouping', // app: face.noticeText
  'face.noticeCopy': 'Text kopieren', // app: face.noticeCopy
  'face.noticeCopied': 'Kopiert', // app: face.noticeCopied
  'face.noticePrint': 'Der QR-Code, den du in der Übersicht herunterlädst, trägt die Hinweiszeile für gedruckte Karten.',
  'face.cardNotice': 'Optionale Gesichtserkennung in diesem Album · sharecam.app/face-grouping', // app: face.cardNotice
  'face.regionTitle': 'In deiner Region nicht verfügbar', // app: face.regionTitle
  'face.regionBody': 'Die Gesichtserkennung ist bei dir noch nicht freigeschaltet. Wir öffnen sie nur dort, wo wir die lokalen Regeln zu Gesichtsdaten erfüllen können – so verkaufen wir dir nie etwas, das deine Gäste nicht nutzen können.', // app: face.regionBody
  'face.regionSoonTitle': 'Demnächst bei dir verfügbar', // app: face.regionSoonTitle
  'face.regionSoonBody': 'Wir schließen gerade die Registrierung ab, mit der wir Gesichtsdaten für dein Land verarbeiten dürfen. Alles andere im Album funktioniert wie gewohnt.', // app: face.regionSoonBody
  'face.regionUnknownTitle': 'Wir konnten deinen Standort nicht bestätigen', // app: face.regionUnknownTitle
  'face.regionUnknownBody': 'Diese Funktion hängt von lokalen Regeln zu Gesichtsdaten ab. Wir schalten sie nur frei, wenn wir wissen, welche Regeln gelten. Alles andere im Album funktioniert wie gewohnt.', // app: face.regionUnknownBody
  'face.declTitle': 'Bevor du es hinzufügst', // app: face.declTitle
  'face.declIntro': 'Du bist Veranstalter dieses Events, also liegen diese Entscheidungen bei dir. Mit dem Häkchen bestätigst du:', // app: face.declIntro
  'face.decl1': 'Ich entscheide, wer bei diesem Event eingeladen und fotografiert wird.', // app: face.decl1
  'face.decl2': 'Ich sage meinen Gästen, dass die Gesichtszuordnung aktiv ist – über den Einladungstext und die gedruckte Karte in dieser App.', // app: face.decl2
  'face.decl3': 'Mein Event findet nicht in Illinois, Texas oder Washington statt.', // app: face.decl3
  'face.decl4': 'Gesichtsdaten werden von AWS in Frankfurt am Main verarbeitet und gelöscht, sobald ich das abschalte oder das Album gelöscht wird.', // app: face.decl4
  'face.decl5': 'Ich bin dafür verantwortlich, die am Veranstaltungsort geltenden Regeln einzuhalten.', // app: face.decl5
  'face.declAccept': 'Ich habe die Gastgeber-Bedingungen gelesen und akzeptiere sie', // app: face.declAccept
  'face.declRead': 'Vollständige Gastgeber-Bedingungen lesen', // app: face.declRead
  'face.declError': 'Wir konnten deine Zustimmung nicht speichern. Prüfe deine Verbindung und versuch es erneut.', // app: face.declError
  'decl.kicker': '{plan} · Gesichtserkennung inklusive',
  'decl.continue': 'Akzeptieren und weiter zur Zahlung',

  // ---------------------------------------------------------------- package & checkout (§3.4)
  'checkout.kicker': 'Pakete',
  'checkout.kickerPro': 'Pakete für Fotografen', // app: paywall.titlePro
  'checkout.titleNew': 'Wähle ein Paket für dein Event', // app: paywall.title
  'checkout.titleUpgrade': 'Paket upgraden', // app: paywall.titleUpgrade
  'checkout.subtitle': 'Einmalzahlung – kein Abo. Wähle die Größe, die zu deiner Gästeliste passt.', // app: paywall.subtitle
  'checkout.subtitlePro': 'Einmalzahlung pro Event. Du lädst vom Computer hoch; Gäste scannen den QR-Code, sehen das Album und finden ihre Fotos per Selfie.', // app: paywall.subtitlePro
  'checkout.current': 'Aktuell',
  'checkout.upgradeRule': 'Ein Upgrade kostet den vollen Preis des größeren Pakets – dieselbe Regel wie in der App.',
  'checkout.choose': 'Paket wählen',
  'checkout.cta': '{price} bezahlen · {plan}',
  'checkout.opening': 'Der sichere Checkout wird geöffnet…',
  'checkout.paying': 'Schließe die Zahlung im Checkout-Fenster ab.',
  'checkout.sandbox': 'Sandbox · Testzahlungen',
  'checkout.footnote': 'Preise in USD, wie in der Sharecam-App. Paddle zeigt beim Bezahlen eventuell deine Landeswährung und Steuern an. Die Zahlungen wickelt Paddle ab, unser Merchant of Record.',
  'checkout.soonTitle': 'Kaufen im Web kommt bald',
  'checkout.soonOff': 'Pakete lassen sich im Web noch nicht kaufen.',
  'checkout.soonPrices': 'Diese Pakete werden im Web noch nicht verkauft.',
  'checkout.soonApp': 'Bis dahin gibt es Pakete in der Sharecam-App für iPhone – dieses Event erscheint dort mit derselben Anmeldung.',
  'checkout.soonAppPro': 'Bis dahin gibt es Pakete für Fotografen in der Sharecam-App für iPhone – dieses Event erscheint dort mit derselben Anmeldung.',
  'checkout.maxedTitle': '{plan} ist das größte Paket',
  'checkout.maxedBody': 'Für dieses Event gibt es kein Upgrade.',
  'checkout.unavailableTitle': 'Dieses Event lässt sich hier nicht upgraden',
  'checkout.unavailableBody': 'Es gehört zu einem anderen Konto oder existiert nicht mehr.',
  'checkout.codeNotPro': 'Pakete für Fotografen brauchen ein Event, das als Fotografen-Event erstellt wurde. Erstelle stattdessen ein neues Fotografen-Event.',
  'checkout.refundedTitle': 'Die Zahlung für dieses Event wurde erstattet',
  'checkout.refundedBody': 'Ein erneuter Paketkauf aktiviert es wieder: Uploads, Gesichtserkennung (falls enthalten) und Downloads kommen zurück.',
  'checkout.abandonedTitle': 'Dein Event läuft mit Spark (gratis)',
  'checkout.abandoned': 'Dein Event läuft mit Spark (gratis). Du kannst jederzeit ein Paket wählen.',
  'checkout.closedNote': 'Der Checkout wurde geschlossen. Es wurde nichts berechnet.',
  'checkout.applyingTitle': 'Zahlung erhalten',
  'checkout.applyingBody': 'Wir aktivieren {plan} für dieses Event. Diese Seite aktualisiert sich von selbst.',
  'checkout.slowTitle': 'Zahlung erhalten – gleich geschafft',
  'checkout.slowBody': 'Deine Zahlung ist da. {plan} wird in wenigen Minuten aktiviert; du kannst diese Seite verlassen. Ist es nach einer Stunde nicht aktiv, schreib uns.',
  'checkout.doneTitle': 'Fertig 🎉', // app: paywall.doneTitle
  'checkout.doneBody': 'Paket {plan} ist aktiv. Paddle schickt den Beleg an deine E-Mail-Adresse.', // app: paywall.active (+ receipt)
  'checkout.toOverview': 'Zum Event', // app: qr.goToEvent
  'checkout.coveredTitle': 'Dieses Event hat bereits {plan}',
  'checkout.coveredBody': 'Falls du doppelt bezahlt hast, erstatten wir die zweite Zahlung. Fragen: {email}',
  'checkout.failedTitle': 'Deine Zahlung konnte nicht verbucht werden',
  'checkout.failedBody': 'Wir erstatten sie – du musst nichts tun. Fragen: {email}',
  'checkout.openFailedTitle': 'Der Checkout konnte nicht geöffnet werden',
  'checkout.openFailedBody': 'Es wurde nichts berechnet. Bitte versuch es gleich noch einmal.',
  'checkout.tooMany': 'Heute wurden zu viele Checkouts geöffnet. Bitte versuch es morgen erneut oder schreib uns.',
  'checkout.backToPackages': 'Zurück zu den Paketen',
  'checkout.contact': 'Support kontaktieren',
  'checkout.mailSlow': 'Web-Zahlung noch nicht verbucht',
  'checkout.mailDuplicate': 'Doppelt bezahlt',
  'checkout.mailFailed': 'Web-Zahlung nicht verbucht',
  'checkout.proIncludesTitle': 'In jedem Paket für Fotografen',
  'checkout.proInc1': 'Gesichtserkennung inklusive, wo verfügbar', // app: paywall.featAiIncluded (adapted)
  'checkout.proInc2': 'Nur du lädst hoch – Gäste sehen die Galerie', // app: paywall.featHostOnly
  'checkout.proInc3': 'Originale in voller Auflösung gespeichert', // app: paywall.featOriginals

  // ---------------------------------------------------------------- downloads
  'downloads.zipTitle': 'Album herunterladen',
  'downloads.zipBody': 'Alle Fotos und Videos in einer ZIP-Datei. Große Alben brauchen eine Minute zur Vorbereitung.',
  'downloads.zipCta': 'ZIP-Download', // app: download.zip
  'downloads.zipWorking': 'Wird gepackt…', // app: download.zipWorking
  'downloads.zipReady': 'ZIP herunterladen ({n} Elemente)',
  'downloads.displayTitle': 'Zum Teilen – 2048 px',
  'downloads.displayBody': 'Das ganze Album in ZIP-Teilen mit je 500 Fotos, passend für Bildschirme und Social Media.',
  'downloads.originalTitle': 'Originale – volle Auflösung',
  'downloads.originalBody': 'Deine Uploads genau so, wie sie waren, in ZIP-Teilen mit je 150 Fotos.',
  'downloads.prepare': 'Download vorbereiten',
  'downloads.again': 'Erneut vorbereiten',
  'downloads.preparing': 'Teil {done} von {total} wird vorbereitet…',
  'downloads.part': 'Teil {n} von {of}',
  'downloads.items': '{n} Fotos',
  'downloads.download': 'Herunterladen',
  'downloads.validity': 'Das ganze Album in ZIP-Teilen – 2048 px zum Teilen, Originale in voller Auflösung zum Aufbewahren. Links gelten 7 Tage und lassen sich neu erzeugen.', // app: ownerLink.step3Body
  'downloads.refundedTitle': 'Downloads sind bei erstatteten Events aus',
  'downloads.refunded': 'Die Zahlung für dieses Event wurde erstattet, daher kann das Album nicht als ZIP exportiert werden. Ein erneuter Paketkauf schaltet es wieder frei.', // app: download.zipRefunded
  'downloads.buyAgain': 'Pakete ansehen',
  'downloads.nothing': 'Noch gibt es nichts herunterzuladen.',
  'downloads.failed': 'ZIP konnte nicht erstellt werden.', // app: download.zipFailed
  'downloads.keepTitle': 'Eine Kopie behalten',
  'downloads.keepBody': 'Die Speicherdauer endet am {date}. Lade das Album vorher herunter.',
  'downloads.keepBodyNoDate': 'Lade das Album herunter, bevor die Speicherdauer endet.',

  // ---------------------------------------------------------------- account
  'account.kicker': 'Konto', // app: account.title
  'account.title': 'Dein Konto',
  'account.signins': 'Anmeldungen',
  'account.pairedOnly': 'Dieser Computer ist mit der Sharecam-App verbunden. Das Konto hat noch keine eigene Anmeldung.',
  'account.sameAsApp': 'Deine Events gehören zu diesem Konto – demselben, das du in der Sharecam-App nutzt.',
  'account.addAnother': 'Weitere Anmeldung hinzufügen',
  'account.addAnotherBody': 'Ein zweiter Zugang, falls du den ersten einmal verlierst.',
  'account.linked': 'Anmeldung hinzugefügt.',
  'account.signOutTitle': 'Abmelden', // app: account.signOut
  'account.signOutBody': 'Deine Events bleiben in deinem Konto. Melde dich jederzeit wieder an.',
  'account.signOutPaired': 'Ohne eigene Anmeldung kommt dieser Computer nur zurück, indem du ihn erneut mit der App verbindest.',
  'account.deleteCta': 'Konto & Daten löschen', // app: account.deleteCta
  'account.deleteTitle': 'Konto und Daten löschen?', // app: account.deleteTitle
  'account.deleteBody': 'Dein Konto, alle von dir erstellten Events, sämtliche Fotos und Gästelisten werden dauerhaft gelöscht – auf allen Geräten. Das lässt sich nicht rückgängig machen.', // app: account.deleteBody
  'account.deleteConfirm': 'Alles löschen', // app: account.deleteConfirm
  'account.deleted': 'Dein Konto und deine Daten wurden gelöscht.', // app: account.deleted
  'account.deleteFailed': 'Dein Konto konnte nicht gelöscht werden. Bitte versuche es erneut.', // app: account.deleteFailed
  'account.deletePairedNote': 'Das Konto kannst du löschen, sobald es eine eigene Anmeldung hat, oder in der App (Einstellungen → Konto).',
};

export default de;
