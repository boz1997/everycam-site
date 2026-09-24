// Sharecam host dashboard — Italiano (plan §3.6, D15; WP-H).
//
// Del "tu" (come l’app), "evento", "organizzatore" = host, "pacchetto", "passa a un pacchetto
// superiore" = upgrade, "riconoscimento facciale", "Modalità privata" / "Galleria aperta",
// "parete foto dal vivo", "la coppia"; computer abbinato = "collegare" (come l’app e la pagina di
// caricamento). Virgolette “…”, lineetta —, puntini ….
//
// Same keys and order as en.ts (tsc fails on a missing or stale key). A `// app: <key>`
// comment marks a string copied verbatim from EC/src/i18n/locales/it.ts (native-reviewed
// 23 Sep 2026, EC 5c05c8e; {{x}} → {x}); "(adapted)" = the app wording with the same change
// the English line makes. Every other string is new and is checked before go-live.
// face.* declaration and notice texts are versioned (declTextVersion 2026-09-23): never edit
// them here, only together with the app and the server.

import type { Dict } from './en';

const it: Dict = {
  // ---------------------------------------------------------------- common
  'common.back': 'Indietro',
  'common.cancel': 'Annulla', // app: common.cancel
  'common.close': 'Chiudi', // app: common.close
  'common.delete': 'Elimina', // app: common.delete
  'common.on': 'Attivo', // app: common.on
  'common.off': 'Non attivo', // app: common.off
  'common.ok': 'OK',
  'common.copy': 'Copia',
  'common.copied': 'Copiato', // app: face.noticeCopied
  'common.remove': 'Rimuovi', // app: create.coverRemove
  'common.saving': 'Salvataggio…',
  'common.loading': 'Caricamento…',
  'common.loadFailed': 'Impossibile caricare questa pagina',
  'common.checkConnection': 'Controlla la connessione e riprova.',
  'common.tryAgain': 'Qualcosa è andato storto. Riprova.',
  'common.prev': 'Precedente',
  'common.next': 'Successivo',

  // ---------------------------------------------------------------- page titles (browser tab)
  'title.events': 'I tuoi eventi',
  'title.signin': 'Accedi',
  'title.new': 'Crea il tuo evento',
  'title.account': 'Account',

  // ---------------------------------------------------------------- shell
  'shell.tag': 'Organizzatore',
  'shell.language': 'Lingua',
  'shell.accountMenu': 'Menu account',
  'shell.events': 'I tuoi eventi',
  'shell.account': 'Account',
  'shell.signOut': 'Esci', // app: account.signOut
  'shell.signedInAs': 'Accesso effettuato come {who}',
  'shell.paired': 'Collegato all’app',
  'shell.pairedLong': 'Questo computer è collegato all’app Sharecam. Non ha ancora un accesso proprio.',
  'shell.linkBannerTitle': 'Aggiungi un metodo di accesso per non perdere questo account',
  'shell.linkBannerBody': 'Questo computer è collegato alla tua app Sharecam. Aggiungi un accesso con e-mail o Google per poter tornare anche senza l’app. Serve anche per acquistare un pacchetto sul web.',
  'shell.linkBannerCta': 'Aggiungi un accesso',
  'nav.events': 'I tuoi eventi',
  'nav.signin': 'Accedi',
  'legal.webTerms': 'Condizioni di acquisto sul web',
  'legal.refund': 'Politica di rimborso',
  'legal.privacy': 'Privacy', // app: legal.privacy
  'legal.terms': 'Termini', // app: legal.terms
  'legal.support': 'Assistenza', // app: legal.support
  'legacy.title': 'Collega di nuovo questo computer',
  'legacy.body': 'Questo browser era collegato ai tuoi eventi tramite la vecchia pagina di caricamento. Lo abbiamo disconnesso perché la pagina ospiti qui torni a funzionare normalmente. Per caricare, collegalo di nuovo con l’app Sharecam o accedi.',

  // ---------------------------------------------------------------- sign in
  'signin.kicker': 'Area organizzatore',
  'signin.title': 'Accedi ai tuoi eventi',
  'signin.lead': 'I tuoi eventi, ospiti e foto in un unico posto, da qualsiasi computer o telefono.',
  'signin.newTitle': 'Nuovo su Sharecam?',
  'signin.newCta': 'Crea il tuo evento, senza bisogno dell’app',
  'signin.appKicker': 'Usi già l’app?',
  'signin.appTitle': 'Stesso account, stessi eventi',
  'signin.appBody': 'Gli eventi che hai creato nell’app Sharecam compaiono qui quando accedi con lo stesso account che usi nell’app (Impostazioni → Account).',
  'auth.google': 'Continua con Google', // app: account.continueGoogle
  'auth.apple': 'Continua con Apple', // app: account.continueApple
  'auth.soon': 'Presto',
  'auth.appleSoon': 'Hai effettuato l’accesso con Apple nell’app? L’accesso con Apple sul web arriverà presto.',
  'auth.orEmail': 'oppure con l’e-mail',
  'auth.email': 'E-mail',
  'auth.password': 'Password',
  'auth.passwordHint': 'Almeno 6 caratteri.',
  'auth.signinCta': 'Accedi',
  'auth.createCta': 'Crea account',
  'auth.resetCta': 'Invia il link di reimpostazione',
  'auth.resetTitle': 'Reimposta la password',
  'auth.resetSent': 'Se {email} ha un account, ti abbiamo inviato un link per reimpostare la password. Controlla la posta in arrivo.',
  'auth.toCreate': 'Sei nuovo? Crea un account',
  'auth.toReset': 'Password dimenticata?',
  'auth.toSignin': 'Torna all’accesso',
  'auth.haveAccount': 'Hai già un account? Accedi',
  'auth.createWithEmail': 'Crea un account con questa email',
  'auth.errWrong': 'E-mail o password errata.',
  'auth.errEmailTaken': 'Questa e-mail ha già un account. Accedi.',
  'auth.errWeak': 'Scegli una password di almeno 6 caratteri.',
  'auth.errEmail': 'Inserisci un indirizzo e-mail valido.',
  'auth.errPopupBlocked': 'Il browser ha bloccato la finestra di accesso. Consenti i pop-up per questo sito e riprova.',
  'auth.errProviderOff': 'Questo metodo di accesso non è ancora disponibile su questo sito. Usa l’e-mail.',
  'auth.errOffline': 'Nessuna connessione. Controlla internet e riprova.',
  'auth.errTooMany': 'Troppi tentativi. Attendi un minuto e riprova.',
  'auth.errDisabled': 'Questo account è stato disattivato. Scrivici dalla pagina di assistenza.',
  'auth.errRecent': 'Per sicurezza, esci e accedi di nuovo, poi ripeti questo passaggio.',
  'auth.errAlreadyLinked': 'Questo metodo di accesso è già collegato al tuo account.',
  'auth.errGeneric': 'Accesso non riuscito. Riprova.', // app: account.errorGeneric

  // ---------------------------------------------------------------- pair with the app
  'pair.kicker': 'Per fotografi',
  'pair.title': 'Collega con l’app Sharecam',
  'pair.body': 'Non hai ancora un accesso sul web? Collega questo computer all’account della tua app Sharecam. Funziona per gli eventi del fotografo.',
  'pair.open': 'Collega con l’app',
  'pair.qrTitle': 'Scansiona questo codice con l’app',
  'pair.step1': 'Apri il tuo evento del fotografo nell’app Sharecam.',
  'pair.step2': 'Tocca “Carica dal computer”, poi “Scansiona il QR del computer”.',
  'pair.step3': 'Conferma sul telefono. Questa pagina accede da sola.',
  'pair.qrAlt': 'Codice di collegamento per l’app Sharecam',
  'pair.qrFoot': 'Il codice si rinnova ogni pochi minuti.',
  'pair.qrError': 'Impossibile creare il codice. Usa invece il codice di 6 caratteri qui sotto.',
  'pair.connecting': 'Collegamento…',
  'pair.orCode': 'oppure inserisci il codice mostrato nell’app',
  'pair.codeLabel': 'Codice dell’app',
  'pair.codeCta': 'Collega',
  'pair.foot': 'Con il codice, questo computer accede a tuo nome. Usalo solo su un computer di cui ti fidi.', // app: uploadLink.footer (adapted)
  'pair.errNotFound': 'Questo codice non è valido. Controllalo nell’app.',
  'pair.errExpired': 'Questo codice è scaduto. Generane uno nuovo nell’app.',
  'pair.errUsed': 'Questo codice è già stato usato. Generane uno nuovo nell’app.',
  'pair.errGeneric': 'Non siamo riusciti a collegare questo computer. Controlla la connessione e riprova.',
  'pair.phoneNote': 'Il collegamento con l’app è pensato per i computer. Su questo telefono accedi invece con il tuo account.',

  // ---------------------------------------------------------------- link a sign-in (paired accounts)
  'link.kicker': 'Ancora un passaggio',
  'link.title': 'Aggiungi un metodo di accesso a questo account',
  'link.lead': 'I tuoi eventi restano dove sono. Poi potrai accedere qui con questo metodo, e l’app continua a funzionare come prima.',
  'link.buyLead': 'Per acquistare sul web serve un account a cui puoi tornare: le ricevute arrivano via e-mail e il pacchetto appartiene a questo evento per tutta la durata dell’archiviazione. Aggiungi prima un metodo di accesso; i tuoi eventi restano dove sono.',
  'link.google': 'Aggiungi accesso con Google',
  'link.apple': 'Aggiungi accesso con Apple',
  'link.emailCta': 'Aggiungi accesso con e-mail',
  'link.inUseTitle': 'Questo accesso ha già un account Sharecam',
  'link.inUseBody': 'Accedi con questo nell’app (Impostazioni → Account); l’app vi sposta i tuoi eventi. Poi accedi qui con lo stesso account.',
  'link.inUseBack': 'Prova un altro accesso',

  // ---------------------------------------------------------------- event list
  'list.kicker': 'Area organizzatore',
  'list.title': 'I tuoi eventi',
  'list.lead': 'Tutto ciò che organizzi, dal web e dall’app.',
  'list.leadEmpty': 'Crea un evento, condividi il QR, raccogli ogni foto.', // app: welcome.hostDesc
  'list.create': 'Crea il tuo evento',
  'list.createPro': 'Evento del fotografo',
  'list.groupPro': 'Eventi del fotografo',
  'list.groupEvents': 'Eventi',
  'list.groupAll': 'Eventi',
  'list.count': '{n} in totale',
  'list.guestsShort': '{v} ospiti',
  'list.photosShort': '{v} foto',
  'list.keptUntil': 'Conservato fino al {date}',
  'list.deletion': 'Conservato fino al',
  'list.waiting': 'Ancora nessun pacchetto — il QR si apre quando un pacchetto è attivo',
  'list.emptyTitle': 'Ancora nessun evento', // app: dashboard.emptyTitle
  'list.emptyBody': 'Pronto in 60 secondi: nome, data, privacy — il tuo QR pronto da stampare. Hai creato eventi nell’app? Accedi qui con lo stesso account che usi lì.', // app: dashboard.emptyBody (+ one sentence)
  'list.findHint': 'Non trovi un evento creato nell’app? Accedi con lo stesso account che usi lì (Impostazioni → Account). Gli eventi di un’app in cui non hai mai effettuato l’accesso restano su quel telefono finché non accedi lì.',

  // ---------------------------------------------------------------- stats, units, plans
  'stat.guests': 'Ospiti',
  'stat.photos': 'Foto',
  'stat.videos': 'Video',
  'unit.days': '{n} giorni',
  'unit.month': '1 mese',
  'unit.months': '{n} mesi',
  'unit.year': '1 anno',
  'unit.years': '{n} anni',
  'unit.unlimited': 'Senza limiti',
  'unit.unlimitedShort': 'nessun limite',
  'unit.notIncluded': 'Non incluso',
  'plan.free': 'Gratis', // app: paywall.free
  'plan.perEvent': 'per evento', // app: paywall.perEvent
  'plan.popular': 'Il più scelto', // app: plans.wedding.badge
  'plan.storage': 'Archiviazione',
  'plan.refunded': 'Rimborsato',
  'plan.awaiting': 'Scegli un pacchetto',
  'plan.webSoon': 'Presto sul web',
  'plan.none': 'Nessun pacchetto',
  'plan.wallIncluded': 'Parete foto dal vivo inclusa',
  'plan.awaitingBody': 'Scegli un pacchetto per attivare il QR e i caricamenti.',
  'plan.videosFromApp': 'I video si caricano dall’app per iPhone.',

  // ---------------------------------------------------------------- create
  'new.kicker': 'Nuovo evento',
  'new.kickerPro': 'Nuovo evento del fotografo',
  'new.title': 'Crea il tuo evento',
  'new.titlePro': 'Crea un evento del fotografo',
  'new.lead': 'Dagli un nome, decidi chi vede le foto e scegli un pacchetto. Ogni evento parte gratis con Spark.',
  'new.leadPro': 'Carichi dal computer e gli originali vengono conservati. Gli ospiti scansionano il QR, sfogliano l’album e trovano le loro foto con un selfie.',
  'new.tierLabel': 'Tipo di evento',
  'new.tierEvents': 'Eventi',
  'new.tierPro': 'Fotografi',
  'new.details': 'Dettagli evento', // app: create.step1Title
  'new.name': 'Dai un nome al tuo evento', // app: create.titleName
  'new.namePlaceholder': 'Il matrimonio di Anna e Marco', // app: create.namePlaceholder
  'new.nameRequired': 'Dai un nome all’evento.',
  'new.date': 'Data dell’evento (facoltativa)', // app: create.dateLabel
  'new.dateHint': 'L’archiviazione parte da questo giorno (o da oggi se lo lasci vuoto).',
  'new.noDateWarn': 'Senza data, l’archiviazione parte da oggi e finisce il {date}. Aggiungi la data dell’evento: non si può aggiungere dopo.',
  'new.who': 'Chi vede le foto?', // app: create.titleMode
  'new.modeHint': 'Puoi cambiarlo dopo nelle Impostazioni.', // app: create.modeHint
  'new.cover': 'Foto di copertina (facoltativa)',
  'new.coverAdd': 'Aggiungi una foto di copertina',
  'new.coverChange': 'Cambia',
  'new.locked': 'Nome e data non si possono cambiare in seguito (la stessa regola dell’app).',
  'new.package': 'Pacchetto',
  'new.consumerSoon': 'I pacchetti a pagamento arriveranno presto sul web. Inizia ora gratis con Spark e passa a un pacchetto superiore più tardi, qui o nell’app.',
  'new.proSoonTitle': 'I pacchetti per fotografi arriveranno presto sul web',
  'new.proSoonBody': 'I pacchetti per fotografi arrivano sul web e nell’app Sharecam per iPhone con il prossimo aggiornamento. Gli eventi che crei ora mantengono nome e data.',
  'new.proSoonBodyApp': 'Nel frattempo sono in vendita nell’app Sharecam per iPhone. Gli eventi che crei lì compaiono qui con lo stesso accesso.',
  'new.proRegionLater': 'Dopo l’accesso verifichiamo se il riconoscimento facciale è disponibile dove ti trovi.',
  'new.proNextDecl': 'Poi: una breve dichiarazione dell’organizzatore per il riconoscimento facciale.',
  'new.ctaFree': 'Crea evento',
  'new.ctaPaid': 'Crea e paga · {plan} {price}',
  'new.created': 'Evento creato.',
  'new.createFailed': 'Impossibile creare l’evento. Controlla la connessione e riprova.',
  'new.backToForm': 'Torna al modulo',
  'new.stepAccount': 'Ci siamo quasi',
  'new.accountTitle': 'Salva il tuo evento in un account',
  'new.accountLead': 'Il tuo evento ha bisogno di un account a cui puoi tornare. Se hai già un accesso nell’app, usa lo stesso.',
  'new.summary': 'Il tuo evento',
  'mode.openTitle': 'Galleria aperta', // app: create.openTitle
  'mode.openDesc': 'Tutti vedono ciò che viene caricato e possono mettere Mi piace. Un album condiviso dal vivo.', // app: create.openDesc
  'mode.privateTitle': 'Modalità privata', // app: create.privateTitle
  'mode.privateDesc': 'Solo tu vedi tutto; gli ospiti vedono solo i propri caricamenti. Perfetto per un album a sorpresa.', // app: create.privateDesc

  // ---------------------------------------------------------------- event page
  'event.kicker': 'Evento',
  'event.kickerPro': 'Evento del fotografo', // app: hostEvent.hostOnlyTitle
  'event.noDate': 'Nessuna data', // app: hostEvent.noDate
  'event.codeLine': 'Codice {code}',
  'event.goneTitle': 'Questo evento non è più disponibile', // app: eventGone.title
  'event.goneBody': 'Potrebbe essere stato eliminato o il periodo di conservazione è terminato.', // app: eventGone.body
  'event.notYoursTitle': 'Questo evento appartiene a un altro account',
  'event.notYoursBody': 'Accedi con l’account che l’ha creato — lo stesso che usi nell’app.',
  'tab.label': 'Sezioni dell’evento',
  'tab.overview': 'Panoramica',
  'tab.gallery': 'Galleria',
  'tab.guests': 'Ospiti', // app: hostEvent.tabGuests
  'tab.settings': 'Impostazioni', // app: hostEvent.tabSettings
  'tab.plan': 'Pacchetto', // app: hostEvent.planTitle
  'tab.downloads': 'Download',

  // overview
  'overview.createdTitle': 'Evento creato!', // app: qr.createdTitle
  'overview.createdBody': 'Condividi il codice QR con i tuoi ospiti — ogni scatto arriva nella tua galleria.', // app: qr.createdSubtitle
  'overview.createdBodyPro': 'Carica le tue foto da questo computer. Gli ospiti scansionano il QR per sfogliare l’album e ritrovarsi.',
  'overview.stats': 'Finora',
  'overview.statsPro': 'Nell’album',
  'overview.package': 'Pacchetto', // app: hostEvent.planTitle
  'overview.keptUntil': 'Conservato fino al',
  'overview.face': 'Riconoscimento facciale', // app: hostEvent.aiTitle
  'overview.faceNot': 'Non incluso',
  'overview.wall': 'Parete foto dal vivo', // app: hostEvent.wallTitle
  'overview.included': 'Incluso',
  'overview.changePackage': 'Cambia pacchetto',
  'overview.refundedNote': 'Il pagamento di questo evento è stato rimborsato. L’album resta fino alla fine dell’archiviazione; acquistando di nuovo un pacchetto si riattiva.',
  'overview.privateLine': 'Privato: gli ospiti vedono solo le proprie foto. Apri la galleria in Impostazioni.',
  'qr.kicker': 'Invito',
  'qr.title': 'Gli ospiti entrano in un solo passaggio', // app: qr.title
  'qr.body': 'Metti il QR sui tavoli o invia il link. Gli ospiti scrivono il proprio nome e condividono dal browser del telefono — niente app, niente account.',
  'qr.titlePro': 'Il QR per gli ospiti',
  'qr.bodyPro': 'Gli ospiti lo scansionano per sfogliare l’album, salvare le foto e ritrovarsi con un selfie. Carichi solo tu.',
  'qr.codeLabel': 'Codice evento', // app: qr.codeLabel
  'qr.linkLabel': 'Link per gli ospiti',
  'qr.alt': 'Codice QR dell’evento {code}',
  'qr.png': 'Scarica il QR (PNG)',
  'qr.share': 'Condividi l’invito', // app: qr.share
  'qr.shareText': 'Unisciti all’album fotografico “{name}” (codice {code})',
  'qr.faceLine': 'Il riconoscimento facciale è attivo: il QR stampato riporta l’avviso di una riga per gli ospiti.',
  'upload.kicker': 'Caricamento',
  'upload.title': 'Carica dal tuo computer', // app: uploadLink.title
  'upload.body': 'Trascina un’intera cartella dal computer. Gli originali restano a piena risoluzione; gli ospiti vedono anteprime leggere.', // app: uploadLink.subtitle
  'upload.cta': 'Carica gli originali',
  'upload.countOf': 'su {cap} foto',
  'upload.countUnlimited': 'foto, nessun limite',
  'owner.title': 'Condividi con la coppia', // app: hostEvent.shareOwnerTitle
  'owner.body': 'Dai alla coppia un codice monouso. Su sharecam.app/album vedono l’intero album e scaricano tutto, a piena risoluzione e in più parti.', // app: hostEvent.shareOwnerBody
  'owner.cta': 'Crea un codice per la coppia', // app: hostEvent.shareOwnerCta
  'owner.newCode': 'Nuovo codice', // app: ownerLink.newCode
  'owner.expires': 'Scade tra {time} · monouso', // app: ownerLink.expiresIn
  'owner.expired': 'Questo codice è scaduto', // app: ownerLink.expired
  'owner.link': 'Link dell’album',
  'owner.foot': 'Solo la coppia dovrebbe ricevere questo codice: sblocca il download dell’intero album.', // app: ownerLink.footer
  'owner.error': 'Impossibile creare un codice. Controlla la connessione e riprova.', // app: ownerLink.error
  'wall.title': 'Parete foto dal vivo', // app: hostEvent.wallTitle
  'wall.openBody': 'La parete foto è attiva. Apri questo link sulla TV, sul portatile o sul proiettore della location — nessun cavo, nessuna app.',
  'wall.privateWarning': 'In modalità privata i caricamenti restano nascosti fino alla rivelazione, quindi la parete foto resta spenta. Passa alla galleria aperta per usarla.', // app: wall.privateWarning
  'await.kicker': 'Evento del fotografo',
  'await.title': 'Scegli un pacchetto per avere il tuo QR',
  'await.body': 'Questo evento non ha ancora un pacchetto per fotografi. QR, codice e pagina di caricamento si aprono appena un pacchetto è attivo. Nome e data sono salvati.',
  'await.cta': 'Scegli un pacchetto',

  // expiry (D19)
  'expiry.title': 'Le foto di “{name}” verranno eliminate tra {n} giorni',
  'expiry.titleOne': 'Le foto di “{name}” verranno eliminate domani',
  'expiry.todayTitle': 'Le foto di “{name}” verranno eliminate oggi',
  'expiry.body': 'L’archiviazione termina il {date}. Scarica l’album prima di allora — dopo non si potrà più recuperare.',
  'expiry.refundedBody': 'L’archiviazione termina il {date}. I download sono disattivati perché il pagamento è stato rimborsato. Riacquistando un pacchetto tornano disponibili.',
  'expiry.download': 'Scarica',
  'expiry.listTitle': 'L’archiviazione sta per finire',
  'expiry.listBody': 'Dopo questa data le foto vengono eliminate e non si possono recuperare. Scarica ciò che vuoi conservare.',
  'expiry.listBodyRefunded': 'Dopo questa data le foto vengono eliminate e non si possono recuperare. Per gli eventi rimborsati i download sono disattivati; riacquistando un pacchetto tornano disponibili.',
  'expiry.keepLonger': 'Conservalo più a lungo: cambia pacchetto',
  'expiry.whenDays': 'tra {n} giorni',
  'expiry.whenTomorrow': 'domani',
  'expiry.whenToday': 'oggi',
  'expiry.icsShort': 'Promemoria',
  'expiry.ics': 'Aggiungi un promemoria al calendario',
  'expiry.icsTitle': 'Scarica le tue foto Sharecam: {name}',
  'expiry.icsBody': 'Le foto di “{name}” verranno eliminate il {date}. Apri l’area organizzatore per scaricarle.',

  // gallery
  'gallery.count': '{n} elementi · {shown} caricati',
  'gallery.filter': 'Mostra',
  'gallery.all': 'Tutte', // app: gallery.all
  'gallery.reportedN': 'Segnalate ({n})', // app: hostEvent.reportedFilter
  'gallery.hiddenN': 'Nascoste ({n})',
  'gallery.hidden': 'Nascosta',
  'gallery.reported': 'Segnalata',
  'gallery.hide': 'Nascondi agli ospiti',
  'gallery.show': 'Mostra agli ospiti',
  'gallery.hiddenToast': 'Nascosta agli ospiti.',
  'gallery.shownToast': 'Di nuovo visibile agli ospiti.',
  'gallery.deleteTitle': 'Eliminare questa foto?', // app: hostEvent.deleteTitle
  'gallery.deleteBody': 'Verrà rimossa dalla galleria.', // app: hostEvent.deleteBody
  'gallery.deletedToast': 'Eliminata.',
  'gallery.more': 'Mostra altre',
  'gallery.emptyTitle': 'Ancora nessuna foto', // app: hostEvent.emptyTitle
  'gallery.emptyBody': 'Metti il QR sui tavoli — il primo scatto comparirà qui.',
  'gallery.emptyPro': 'Carica dal computer: gli originali vengono conservati, gli ospiti vedono la galleria in pochi minuti.', // app: hostEvent.emptyProBody
  'gallery.noneReported': 'Nessuna segnalazione tra gli elementi caricati.',
  'gallery.noneHidden': 'Niente di nascosto tra gli elementi caricati.',
  'gallery.viewer': 'Visualizzatore foto',
  'gallery.openItem': 'Apri la foto di {name}',
  'gallery.photoAlt': 'Foto di {name}',
  'gallery.unknownOwner': 'Ospite',
  'gallery.openFull': 'Apri a dimensione piena',

  // guests
  'guests.emptyTitle': 'Ancora nessun ospite', // app: guests.emptyTitle
  'guests.emptyBody': 'Chi entra con il QR o il codice compare qui, con il proprio nome.', // app: guests.emptyBody
  'guests.ban': 'Rimuovi', // app: guests.ban
  'guests.unban': 'Ripristina', // app: guests.unban
  'guests.bannedTag': 'rimosso', // app: guests.bannedTag
  'guests.banTitle': 'Rimuovere {name}?', // app: guests.banTitle
  'guests.banBody': 'Non potrà rientrare né caricare. Le sue foto restano (puoi eliminarle dalla galleria).', // app: guests.banBody
  'guests.owner': 'Proprietario dell’album',
  'guests.noName': 'Ospite',
  'guests.joined': 'ingresso: {time}',
  'guests.removedToast': 'Hai rimosso {name}.',
  'guests.restoredToast': '{name} può entrare di nuovo.',
  'guests.capTitle': 'Ospiti di questo evento',
  'guests.capBody': 'Gli ospiti rimossi non contano; il loro posto torna libero.',
  'guests.full': 'Limite ospiti raggiunto ({limit}). Passa a un pacchetto superiore per farne entrare altri.', // app: guests.limitFull (adapted)

  // settings
  'settings.galleryTitle': 'Chi entra, chi vede',
  'settings.privateTitle': 'Modalità privata', // app: hostEvent.privateTitle
  'settings.privateOn': 'Gli ospiti vedono solo le proprie foto.', // app: hostEvent.privateOn
  'settings.privateOff': 'Tutti vedono l’intera galleria.', // app: hostEvent.privateOff
  'settings.statePrivate': 'Privata', // app: hostEvent.statePrivate
  'settings.statePublic': 'Pubblica', // app: hostEvent.statePublic
  'settings.revealTitle': 'Aprire la galleria a tutti?', // app: hostEvent.revealTitle
  'settings.revealBody': 'Gli ospiti vedranno le foto degli altri. È una “rivelazione” — sei sicuro?', // app: hostEvent.revealBody
  'settings.revealConfirm': 'Sì, apri', // app: hostEvent.revealConfirm
  'settings.autoRevealTitle': 'Apertura automatica', // app: hostEvent.revealSchedTitle
  'settings.autoRevealOn': 'La galleria si apre a tutti: {time}.', // app: hostEvent.revealSchedOn
  'settings.autoRevealOff': 'Disattivata: la galleria resta privata finché non la apri tu.', // app: hostEvent.revealSchedOff
  'settings.revealPick': 'Scegli data e ora', // app: hostEvent.revealPick
  'settings.pauseTitle': 'Sospendi nuovi ingressi', // app: hostEvent.pauseTitle
  'settings.pauseOn': 'Nessun nuovo ospite può entrare. Quelli presenti restano.', // app: hostEvent.pauseOn
  'settings.pauseOff': 'Chiunque abbia il QR o il codice può entrare.', // app: hostEvent.pauseOff
  'settings.statePaused': 'In pausa', // app: hostEvent.statePaused
  'settings.stateOpen': 'Aperta', // app: hostEvent.stateOpen
  'settings.downloadTitle': 'Download per gli ospiti', // app: hostEvent.downloadTitle
  'settings.downloadDesc': 'Gli ospiti possono salvare le foto.', // app: hostEvent.downloadDesc
  'settings.hostOnlyTitle': 'Evento del fotografo', // app: hostEvent.hostOnlyTitle
  'settings.hostOnlyBody': 'Carichi solo tu. Gli ospiti sfogliano la galleria, salvano le foto e si ritrovano con un selfie. Non si può modificare.', // app: hostEvent.hostOnlyBody
  'settings.detailsTitle': 'Dettagli evento', // app: hostEvent.detailsTitle
  'settings.name': 'Nome',
  'settings.date': 'Data',
  'settings.code': 'Codice',
  'settings.noCover': 'Nessuna foto di copertina',
  'settings.coverAdd': 'Aggiungi una foto di copertina',
  'settings.coverChange': 'Cambia copertina',
  'settings.coverSaved': 'Copertina salvata.',
  'settings.coverRemoved': 'Copertina rimossa.',
  'settings.lockedNote': 'Nome e data sono bloccati, come nell’app.',
  'settings.saved': 'Salvato.',
  'settings.dangerTitle': 'Zona pericolosa', // app: hostEvent.dangerTitle
  'settings.dangerBody': 'L’eliminazione rimuove l’evento, le sue foto e l’elenco ospiti per tutti, inclusi i tuoi ospiti. Azione irreversibile.', // app: hostEvent.dangerBody
  'settings.deleteCta': 'Elimina evento',
  'settings.deleteTitle': 'Eliminare questo evento?', // app: hostEvent.deleteEventTitle
  'settings.deleteBody': '“{name}” e tutte le sue foto verranno rimossi definitivamente.', // app: hostEvent.deleteEventBody
  'settings.deleteConfirm': 'Elimina…', // app: hostEvent.deleteEventConfirm
  'settings.deleteTitle2': 'Sei assolutamente sicuro?', // app: hostEvent.deleteEventTitle2
  'settings.deleteBody2': 'È definitivo — non c’è modo di recuperare l’evento.', // app: hostEvent.deleteEventBody2
  'settings.deleted': 'Evento eliminato.',
  'settings.deletePairedNote': 'Per eliminare questo evento, accedi su questo computer con l’accesso dell’account (non tramite il collegamento con l’app) oppure eliminalo dall’app.',

  // face matching (the app's versioned texts, face.* 2026-09-23 — copy verbatim)
  'face.title': 'Riconoscimento facciale', // app: hostEvent.aiTitle
  'face.tabTitle': 'Trova le tue foto', // app: face.tabTitle
  'face.aiOn': 'Attivo: gli ospiti possono trovare le proprie foto con il riconoscimento facciale.', // app: hostEvent.aiOn
  'face.aiOff': 'Non attivo: gli ospiti non vedono “Trova le tue foto”.', // app: hostEvent.aiOff
  'face.notInPackage': 'Il riconoscimento facciale non fa parte di questo pacchetto. Si può aggiungere nell’app Sharecam.',
  'face.hostConfirmTitle': 'Attivare il riconoscimento facciale?', // app: face.hostConfirmTitle
  'face.hostConfirmBody': 'I tuoi ospiti potranno trovare le proprie foto con un selfie. Sei tu a doverli informare che è attivo — ti diamo il testo per l’invito e un biglietto da tavolo. La funzione non deve essere usata per registrare le presenze né per identificare chi non ha chiesto di essere identificato.', // app: face.hostConfirmBody
  'face.hostConfirmCta': 'Attiva', // app: face.hostConfirmCta
  'face.remindTitle': 'Avvisa subito i tuoi ospiti', // app: face.noticeTitle (adapted)
  'face.remindBody': 'Copia il testo qui sotto nell’invito o nella chat di gruppo e stampa il QR con la sua riga di avviso.',
  'face.noticeTitle': 'Avvisa i tuoi ospiti', // app: face.noticeTitle
  'face.noticeSub': 'Incolla questo nell’invito, nella chat di gruppo o su un cartoncino sui tavoli.', // app: face.noticeSub
  'face.noticeText': 'Le foto di questo evento vengono raccolte in un album condiviso. Include il riconoscimento facciale facoltativo per trovare le tue foto. La scelta è tua e puoi rifiutare. Dettagli: sharecam.app/face-grouping', // app: face.noticeText
  'face.noticeCopy': 'Copia il testo', // app: face.noticeCopy
  'face.noticeCopied': 'Copiato', // app: face.noticeCopied
  'face.noticePrint': 'Il QR che scarichi dalla Panoramica riporta l’avviso di una riga per i biglietti stampati.',
  'face.cardNotice': 'Riconoscimento facciale facoltativo in questo album · sharecam.app/face-grouping', // app: face.cardNotice
  'face.regionTitle': 'Non disponibile nella tua regione', // app: face.regionTitle
  'face.regionBody': 'Il riconoscimento facciale non è ancora disponibile dove ti trovi. Lo offriamo solo dove possiamo rispettare le regole locali sui dati del volto, così non ti vendiamo mai qualcosa che i tuoi ospiti non potrebbero usare.', // app: face.regionBody
  'face.regionSoonTitle': 'Presto disponibile dove sei', // app: face.regionSoonTitle
  'face.regionSoonBody': 'Stiamo completando la registrazione che ci consente di trattare i dati del volto nel tuo Paese. Tutto il resto dell’album funziona normalmente.', // app: face.regionSoonBody
  'face.regionUnknownTitle': 'Non siamo riusciti a confermare dove ti trovi', // app: face.regionUnknownTitle
  'face.regionUnknownBody': 'Questa funzione dipende dalle regole locali sui dati del volto, quindi la attiviamo solo quando sappiamo quali si applicano. Tutto il resto dell’album funziona normalmente.', // app: face.regionUnknownBody
  'face.declTitle': 'Prima di aggiungerlo', // app: face.declTitle
  'face.declTitleWeb': 'Riconoscimento facciale: la tua dichiarazione come organizzatore',
  'face.declIntro': 'Sei l’organizzatore di questo evento, quindi queste scelte spettano a te. Spuntando la casella confermi:', // app: face.declIntro
  'face.decl1': 'Decido io chi viene invitato e fotografato a questo evento.', // app: face.decl1
  'face.decl2': 'Dirò ai miei ospiti che il riconoscimento dei volti è attivo, con il testo dell’invito e il biglietto stampato di questa app.', // app: face.decl2
  'face.decl3': 'Il mio evento non si svolge in Illinois, in Texas o nello Stato di Washington.', // app: face.decl3
  'face.decl4': 'I dati del volto sono trattati da AWS a Francoforte (Germania) e cancellati quando disattivo la funzione o l’album viene eliminato.', // app: face.decl4
  'face.decl5': 'Sono responsabile del rispetto delle regole applicabili nel luogo dell’evento.', // app: face.decl5
  'face.declAccept': 'Ho letto e accetto le condizioni per l’organizzatore', // app: face.declAccept
  'face.declRead': 'Leggi le condizioni complete per l’organizzatore', // app: face.declRead
  'face.declError': 'Non siamo riusciti a registrare la tua accettazione. Controlla la connessione e riprova.', // app: face.declError
  'decl.kicker': '{plan} · riconoscimento facciale incluso',
  'decl.continue': 'Accetta e procedi al pagamento',

  // ---------------------------------------------------------------- package & checkout (§3.4)
  'checkout.kicker': 'Pacchetti',
  'checkout.kickerPro': 'Pacchetti per fotografi', // app: paywall.titlePro
  'checkout.titleNew': 'Scegli un pacchetto per il tuo evento', // app: paywall.title
  'checkout.titleUpgrade': 'Passa a un pacchetto superiore', // app: paywall.titleUpgrade
  'checkout.titleInfo': 'Cosa include ogni pacchetto',
  'checkout.subtitle': 'Pagamento unico — non è un abbonamento. Scegli la misura adatta alla tua lista ospiti.', // app: paywall.subtitle
  'checkout.subtitlePro': 'Pagamento unico per evento. Carichi dal computer; gli ospiti scansionano il QR, sfogliano l’album e trovano le loro foto con un selfie.', // app: paywall.subtitlePro
  'checkout.current': 'Attuale',
  'checkout.upgradeRule': 'Passare a un pacchetto superiore costa il prezzo pieno del pacchetto più grande — la stessa regola dell’app.',
  'checkout.choose': 'Scegli un pacchetto',
  'checkout.cta': 'Paga {price} · {plan}',
  'checkout.opening': 'Apertura del pagamento sicuro…',
  'checkout.paying': 'Completa il pagamento nella finestra di pagamento.',
  'checkout.sandbox': 'Sandbox · pagamenti di prova',
  'checkout.footnote': 'Prezzi in USD (lo stesso prezzo di listino dell’App Store negli Stati Uniti). Nell’app Apple addebita nella tua valuta locale; sul web, al pagamento Paddle può mostrare la tua valuta locale e le imposte. I pagamenti sono gestiti da Paddle, il nostro rivenditore autorizzato (merchant of record).',
  'checkout.soonTitle': 'L’acquisto sul web arriverà presto',
  'checkout.soonOff': 'I pacchetti non si possono ancora acquistare sul web.',
  'checkout.soonPrices': 'Questi pacchetti non sono ancora in vendita sul web.',
  'checkout.soonApp': 'Nel frattempo i pacchetti sono in vendita nell’app Sharecam per iPhone — questo evento compare lì con lo stesso accesso.',
  'checkout.soonAppPro': 'I pacchetti per fotografi arrivano sul web e nell’app Sharecam per iPhone con il prossimo aggiornamento. Questo evento mantiene nome e data.',
  'checkout.soonAppProLive': 'Nel frattempo i pacchetti per fotografi sono in vendita nell’app Sharecam per iPhone — questo evento compare lì con lo stesso accesso.',
  'checkout.maxedTitle': '{plan} è il pacchetto più grande',
  'checkout.maxedBody': 'Non ci sono pacchetti superiori per questo evento.',
  'checkout.unavailableTitle': 'Questo evento non può cambiare pacchetto qui',
  'checkout.unavailableBody': 'Appartiene a un altro account o non esiste più.',
  'checkout.codeNotPro': 'I pacchetti per fotografi richiedono un evento creato come evento del fotografo. Crea invece un nuovo evento del fotografo.',
  'checkout.refundedTitle': 'Questo evento è stato rimborsato',
  'checkout.refundedBody': 'Acquistare di nuovo un pacchetto lo riattiva: tornano i caricamenti, il riconoscimento facciale (se incluso) e i download.',
  'checkout.abandonedTitle': 'Il tuo evento è su Spark (gratis)',
  'checkout.abandoned': 'Non ti è stato addebitato nulla. Scegli un pacchetto quando vuoi: il tuo QR funziona già con Spark.',
  'checkout.closedNote': 'Il pagamento è stato chiuso. Non ti è stato addebitato nulla.',
  'checkout.applyingTitle': 'Pagamento ricevuto',
  'checkout.applyingBody': 'Stiamo attivando {plan} su questo evento. La pagina si aggiorna da sola.',
  'checkout.slowTitle': 'Pagamento ricevuto — ci siamo quasi',
  'checkout.slowBody': 'Il tuo pagamento è arrivato. {plan} verrà attivato entro pochi minuti; puoi lasciare questa pagina. Se non è attivo entro un’ora, scrivici.',
  'checkout.doneTitle': 'Fatto 🎉', // app: paywall.doneTitle
  'checkout.doneBody': 'Il pacchetto {plan} è attivo. Paddle invia la ricevuta al tuo indirizzo e-mail.', // app: paywall.active (+ receipt)
  'checkout.toOverview': 'Vai all’evento', // app: qr.goToEvent
  'checkout.coveredTitle': 'Questo evento ha già {plan}',
  'checkout.coveredBody': 'Se hai pagato due volte, ti rimborsiamo il pagamento in più. Domande: {email}',
  'checkout.failedTitle': 'Non è stato possibile applicare il tuo pagamento',
  'checkout.failedBody': 'Te lo rimborsiamo — non devi fare nulla. Domande: {email}',
  'checkout.openFailedTitle': 'Impossibile aprire il pagamento',
  'checkout.openFailedBody': 'Non ti è stato addebitato nulla. Riprova tra un momento.',
  'checkout.tooMany': 'Oggi sono stati aperti troppi pagamenti. Riprova domani o scrivici.',
  'checkout.backToPackages': 'Torna ai pacchetti',
  'checkout.contact': 'Contatta l’assistenza',
  'checkout.mailSlow': 'Pagamento web non ancora applicato',
  'checkout.mailDuplicate': 'Pagato due volte',
  'checkout.mailFailed': 'Pagamento web non applicato',
  'checkout.proIncludesTitle': 'In ogni pacchetto per fotografi:',
  'checkout.proInc1': 'Riconoscimento facciale incluso, dove disponibile', // app: paywall.featAiIncluded (adapted)
  'checkout.proInc2': 'Carichi solo tu — gli ospiti guardano', // app: paywall.featHostOnly
  'checkout.proInc3': 'Originali conservati a piena risoluzione', // app: paywall.featOriginals

  // ---------------------------------------------------------------- downloads
  'downloads.zipTitle': 'Scarica l’album',
  'downloads.zipBody': 'Tutte le foto e i video in un unico file ZIP. Gli album grandi richiedono un minuto di preparazione.',
  'downloads.zipCta': 'Scarica ZIP', // app: download.zip
  'downloads.zipWorking': 'Compressione…', // app: download.zipWorking
  'downloads.zipReady': 'Scarica ZIP ({n} elementi)',
  'downloads.displayTitle': 'Per condividere — 2048 px',
  'downloads.displayBody': 'L’intero album in parti ZIP da 500 foto, dimensionate per schermi e social.',
  'downloads.originalTitle': 'Originali — piena risoluzione',
  'downloads.originalBody': 'I tuoi caricamenti così come sono, in parti ZIP da 150 foto.',
  'downloads.prepare': 'Prepara il download',
  'downloads.again': 'Prepara di nuovo',
  'downloads.preparing': 'Preparazione della parte {done} di {total}…',
  'downloads.part': 'Parte {n} di {of}',
  'downloads.items': '{n} foto',
  'downloads.download': 'Scarica',
  'downloads.validity': 'Album completo in parti ZIP: 2048px per condividere, originali a piena risoluzione per conservare. I link valgono 7 giorni e si possono rigenerare.', // app: ownerLink.step3Body
  'downloads.refundedTitle': 'Download disattivati per gli eventi rimborsati',
  'downloads.refunded': 'Il pagamento di questo evento è stato rimborsato, quindi l’album non può essere esportato come ZIP. Se acquisti di nuovo un pacchetto, l’esportazione torna disponibile.', // app: download.zipRefunded
  'downloads.buyAgain': 'Vedi i pacchetti',
  'downloads.nothing': 'Non c’è ancora niente da scaricare.',
  'downloads.failed': 'Impossibile creare lo ZIP.', // app: download.zipFailed
  'downloads.keepTitle': 'Conserva una copia',
  'downloads.keepBody': 'L’archiviazione termina il {date}. Scarica l’album prima di allora.',
  'downloads.keepBodyNoDate': 'Scarica l’album prima che finisca l’archiviazione.',

  // ---------------------------------------------------------------- account
  'account.kicker': 'Account', // app: account.title
  'account.title': 'Il tuo account',
  'account.signins': 'Metodi di accesso',
  'account.pairedOnly': 'Questo computer è collegato all’app Sharecam. L’account non ha ancora un accesso proprio.',
  'account.sameAsApp': 'I tuoi eventi appartengono a questo account — lo stesso che usi nell’app Sharecam.',
  'account.addAnother': 'Aggiungi un altro metodo di accesso',
  'account.addAnotherBody': 'Un secondo modo per entrare, nel caso perdessi l’accesso al primo.',
  'account.linked': 'Metodo di accesso aggiunto.',
  'account.signOutTitle': 'Esci', // app: account.signOut
  'account.signOutBody': 'I tuoi eventi restano nel tuo account. Accedi di nuovo quando vuoi.',
  'account.signOutPaired': 'Senza un accesso proprio, questo computer può tornare solo collegandolo di nuovo con l’app.',
  'account.deleteCta': 'Elimina account e dati', // app: account.deleteCta
  'account.deleteTitle': 'Eliminare account e dati?', // app: account.deleteTitle
  'account.deleteBody': 'Il tuo account, tutti gli eventi che hai creato, le foto e gli elenchi ospiti vengono eliminati definitivamente, su ogni dispositivo. Azione irreversibile.', // app: account.deleteBody
  'account.deleteConfirm': 'Elimina tutto', // app: account.deleteConfirm
  'account.deleted': 'Il tuo account e i tuoi dati sono stati eliminati.', // app: account.deleted
  'account.deleteFailed': 'Non è stato possibile eliminare il tuo account. Riprova.', // app: account.deleteFailed
  'account.deletePairedNote': 'Per eliminare l’account, accedi su questo computer con il suo accesso (non tramite il collegamento con l’app) oppure eliminalo dall’app (Impostazioni → Account).',
};

export default it;
