// Sharecam host dashboard — Français (plan §3.6, D15; WP-H).
//
// Vouvoiement (comme l’app), "événement", "Hôte" = host, "formule", "reconnaissance faciale",
// "Mode privé" / "Galerie ouverte", "Mur en direct", "les mariés"; ordinateur relié = "connecter"
// (comme l’app et la page d’importation). Guillemets « … » et espace insécable avant : ; ? ! »
// (ajoutée par le générateur, sauf face.* verbatim), tiret —, points de suspension ….
//
// Same keys and order as en.ts (tsc fails on a missing or stale key). A `// app: <key>`
// comment marks a string copied verbatim from EC/src/i18n/locales/fr.ts (native-reviewed
// 23 Sep 2026, EC 5c05c8e; {{x}} → {x}); "(adapted)" = the app wording with the same change
// the English line makes. Every other string is new and is checked before go-live.
// face.* declaration and notice texts are versioned (declTextVersion 2026-09-23): never edit
// them here, only together with the app and the server.

import type { Dict } from './en';

const fr: Dict = {
  // ---------------------------------------------------------------- common
  'common.back': 'Retour',
  'common.cancel': 'Annuler', // app: common.cancel
  'common.close': 'Fermer', // app: common.close
  'common.delete': 'Supprimer', // app: common.delete
  'common.on': 'Activé', // app: common.on
  'common.off': 'Désactivé', // app: common.off
  'common.ok': 'OK',
  'common.copy': 'Copier',
  'common.copied': 'Copié', // app: face.noticeCopied
  'common.remove': 'Retirer', // app: create.coverRemove
  'common.saving': 'Enregistrement…',
  'common.loading': 'Chargement…',
  'common.loadFailed': 'Cette page n’a pas pu être chargée',
  'common.checkConnection': 'Vérifiez votre connexion et réessayez.',
  'common.tryAgain': 'Un problème est survenu. Veuillez réessayer.',
  'common.prev': 'Précédent',
  'common.next': 'Suivant',

  // ---------------------------------------------------------------- page titles (browser tab)
  'title.events': 'Vos événements',
  'title.signin': 'Connexion',
  'title.new': 'Créer votre événement',
  'title.account': 'Compte',

  // ---------------------------------------------------------------- shell
  'shell.tag': 'Hôte',
  'shell.language': 'Langue',
  'shell.accountMenu': 'Menu du compte',
  'shell.events': 'Vos événements',
  'shell.account': 'Compte',
  'shell.signOut': 'Se déconnecter', // app: account.signOut
  'shell.signedInAs': 'Connecté en tant que {who}',
  'shell.paired': 'Connecté via l’app',
  'shell.pairedLong': 'Cet ordinateur est connecté via l’app Sharecam. Il n’a pas encore de moyen de connexion propre.',
  'shell.linkBannerTitle': 'Ajoutez un moyen de connexion pour garder ce compte',
  'shell.linkBannerBody': 'Cet ordinateur est connecté via votre app Sharecam. Ajoutez une connexion par e-mail ou Google pour revenir sans l’app. Elle est aussi nécessaire pour acheter une formule sur le web.',
  'shell.linkBannerCta': 'Ajouter une connexion',
  'nav.events': 'Vos événements',
  'nav.signin': 'Se connecter',
  'legal.webTerms': 'Conditions d’achat sur le web',
  'legal.refund': 'Politique de remboursement',
  'legal.privacy': 'Confidentialité', // app: legal.privacy
  'legal.terms': 'Conditions', // app: legal.terms
  'legal.support': 'Assistance', // app: legal.support
  'legacy.title': 'Connectez à nouveau cet ordinateur',
  'legacy.body': 'Ce navigateur était relié à vos événements par l’ancienne page d’importation. Nous l’avons déconnecté pour que la page invités fonctionne à nouveau normalement ici. Pour importer, connectez-le encore une fois via l’app Sharecam ou connectez-vous.',

  // ---------------------------------------------------------------- sign in
  'signin.kicker': 'Espace hôte',
  'signin.title': 'Connectez-vous à vos événements',
  'signin.lead': 'Utilisez la même connexion que dans l’app (Réglages → Compte). Si vous ne vous y êtes jamais connecté, faites-le d’abord.',
  'signin.appKicker': 'Vous utilisez déjà l’app ?',
  'signin.appTitle': 'Même compte, mêmes événements',
  'signin.appBody': 'Les événements créés dans l’app Sharecam apparaissent ici lorsque vous vous connectez avec le même compte que dans l’app (Réglages → Compte).',
  'auth.google': 'Continuer avec Google', // app: account.continueGoogle
  'auth.apple': 'Continuer avec Apple', // app: account.continueApple
  'auth.soon': 'Bientôt',
  'auth.appleSoon': 'Connecté avec Apple dans l’app ? La connexion avec Apple sur le web arrive bientôt.',
  'auth.orEmail': 'ou avec un e-mail',
  'auth.email': 'E-mail',
  'auth.password': 'Mot de passe',
  'auth.passwordHint': '6 caractères minimum.',
  'auth.signinCta': 'Se connecter',
  'auth.createCta': 'Créer un compte',
  'auth.resetCta': 'Envoyer le lien de réinitialisation',
  'auth.resetTitle': 'Réinitialiser votre mot de passe',
  'auth.resetSent': 'Si {email} correspond à un compte, un lien de réinitialisation est en route. Consultez votre boîte de réception.',
  'auth.toCreate': 'Nouveau ? Créez un compte',
  'auth.toReset': 'Mot de passe oublié ?',
  'auth.toSignin': 'Retour à la connexion',
  'auth.errWrong': 'E-mail ou mot de passe incorrect.',
  'auth.errEmailTaken': 'Cet e-mail a déjà un compte. Connectez-vous plutôt.',
  'auth.errWeak': 'Choisissez un mot de passe d’au moins 6 caractères.',
  'auth.errEmail': 'Saisissez une adresse e-mail valide.',
  'auth.errPopupBlocked': 'Votre navigateur a bloqué la fenêtre de connexion. Autorisez les pop-ups pour ce site et réessayez.',
  'auth.errProviderOff': 'Cette connexion n’est pas encore disponible sur ce site. Utilisez plutôt l’e-mail.',
  'auth.errOffline': 'Pas de connexion. Vérifiez votre accès à Internet et réessayez.',
  'auth.errTooMany': 'Trop de tentatives. Attendez une minute et réessayez.',
  'auth.errDisabled': 'Ce compte a été désactivé. Écrivez-nous depuis la page d’assistance.',
  'auth.errRecent': 'Pour votre sécurité, déconnectez-vous et reconnectez-vous, puis refaites cette étape.',
  'auth.errAlreadyLinked': 'Cette connexion est déjà ajoutée à votre compte.',
  'auth.errGeneric': 'Connexion échouée. Réessayez.', // app: account.errorGeneric

  // ---------------------------------------------------------------- pair with the app
  'pair.kicker': 'Pour les photographes',
  'pair.title': 'Se connecter avec l’app Sharecam',
  'pair.body': 'Pas encore de connexion sur le web ? Connectez cet ordinateur au compte de votre app Sharecam. Cela fonctionne pour les événements photographe.',
  'pair.open': 'Se connecter avec l’app',
  'pair.qrTitle': 'Scannez ce code avec l’app',
  'pair.step1': 'Ouvrez votre événement photographe dans l’app Sharecam.',
  'pair.step2': 'Touchez « Importer depuis l’ordinateur », puis « Scanner le QR de l’ordinateur ».',
  'pair.step3': 'Confirmez sur le téléphone. Cette page se connecte toute seule.',
  'pair.qrAlt': 'Code de connexion pour l’app Sharecam',
  'pair.qrFoot': 'Le code se renouvelle toutes les quelques minutes.',
  'pair.qrError': 'Le code n’a pas pu être créé. Utilisez plutôt le code à 6 caractères ci-dessous.',
  'pair.connecting': 'Connexion…',
  'pair.orCode': 'ou saisissez le code de l’app',
  'pair.codeLabel': 'Code de l’app',
  'pair.codeCta': 'Connecter',
  'pair.foot': 'Le code connecte cet ordinateur à votre nom. Ne l’utilisez que sur un ordinateur de confiance.', // app: uploadLink.footer (adapted)
  'pair.errNotFound': 'Ce code n’est pas valide. Vérifiez-le dans l’app.',
  'pair.errExpired': 'Ce code a expiré. Générez-en un nouveau dans l’app.',
  'pair.errUsed': 'Ce code a déjà été utilisé. Générez-en un nouveau dans l’app.',
  'pair.errGeneric': 'Impossible de connecter cet ordinateur. Vérifiez votre connexion et réessayez.',

  // ---------------------------------------------------------------- link a sign-in (paired accounts)
  'link.kicker': 'Encore une étape',
  'link.title': 'Ajoutez un moyen de connexion à ce compte',
  'link.lead': 'Vos événements restent où ils sont. Vous pourrez ensuite vous connecter ici avec ce moyen, et l’app continue de fonctionner comme avant.',
  'link.buyLead': 'Un achat sur le web nécessite un compte auquel vous pouvez revenir : les reçus sont envoyés par e-mail, et la formule appartient à cet événement pendant toute sa durée de stockage. Ajoutez d’abord un moyen de connexion ; vos événements restent où ils sont.',
  'link.google': 'Ajouter la connexion Google',
  'link.apple': 'Ajouter la connexion Apple',
  'link.emailCta': 'Ajouter la connexion par e-mail',
  'link.inUseTitle': 'Cette connexion a déjà un compte Sharecam',
  'link.inUseBody': 'Connectez-vous avec dans l’app (Réglages → Compte) ; l’app y transfère vos événements. Connectez-vous ensuite ici avec le même compte.',
  'link.inUseBack': 'Essayer une autre connexion',

  // ---------------------------------------------------------------- event list
  'list.kicker': 'Espace hôte',
  'list.title': 'Vos événements',
  'list.lead': 'Tout ce que vous organisez, depuis le web et depuis l’app.',
  'list.leadEmpty': 'Créez un événement, partagez le QR, collectez chaque photo.', // app: welcome.hostDesc
  'list.create': 'Créer votre événement',
  'list.createPro': 'Événement photographe',
  'list.groupPro': 'Événements photographe',
  'list.groupEvents': 'Événements',
  'list.groupAll': 'Événements',
  'list.count': '{n} au total',
  'list.guestsShort': '{v} invités',
  'list.photosShort': '{v} photos',
  'list.keptUntil': 'Conservé jusqu’au {date}',
  'list.deletion': 'Conservé jusqu’au',
  'list.waiting': 'Pas encore de formule — le QR s’ouvre dès qu’une formule est active',
  'list.emptyTitle': 'Aucun événement pour l’instant', // app: dashboard.emptyTitle
  'list.emptyBody': 'Prêt en 60 secondes : nom, date, confidentialité — votre QR prêt à imprimer. Vous avez créé des événements dans l’app ? Connectez-vous ici avec le même compte que dans l’app.', // app: dashboard.emptyBody (+ one sentence)
  'list.findHint': 'Vous ne trouvez pas un événement créé dans l’app ? Connectez-vous avec le même compte que dans l’app (Réglages → Compte). Les événements d’une app où personne ne s’est jamais connecté restent sur ce téléphone jusqu’à ce que vous vous y connectiez.',

  // ---------------------------------------------------------------- stats, units, plans
  'stat.guests': 'Invités',
  'stat.photos': 'Photos',
  'stat.videos': 'Vidéos',
  'unit.days': '{n} jours',
  'unit.month': '1 mois',
  'unit.months': '{n} mois',
  'unit.year': '1 an',
  'unit.years': '{n} ans',
  'unit.unlimited': 'Illimité',
  'unit.unlimitedShort': 'sans limite',
  'plan.free': 'Gratuit', // app: paywall.free
  'plan.perEvent': 'par événement', // app: paywall.perEvent
  'plan.popular': 'Le plus choisi', // app: plans.wedding.badge
  'plan.storage': 'Stockage',
  'plan.refunded': 'Remboursé',
  'plan.awaiting': 'Choisir une formule',
  'plan.webSoon': 'Bientôt sur le web',
  'plan.none': 'Pas encore de formule',
  'plan.wallIncluded': 'Mur en direct inclus',

  // ---------------------------------------------------------------- create
  'new.kicker': 'Nouvel événement',
  'new.kickerPro': 'Nouvel événement photographe',
  'new.title': 'Créer votre événement',
  'new.titlePro': 'Créer un événement photographe',
  'new.lead': 'Nommez-le, décidez qui voit les photos, choisissez une formule. Chaque événement démarre gratuitement avec Spark.',
  'new.leadPro': 'Vous importez depuis votre ordinateur, les originaux sont conservés. Les invités scannent le QR, parcourent l’album et retrouvent leurs photos avec un selfie.',
  'new.tierLabel': 'Type d’événement',
  'new.tierEvents': 'Événements',
  'new.tierPro': 'Photographes',
  'new.details': 'Détails de l’événement', // app: create.step1Title
  'new.name': 'Nommez votre événement', // app: create.titleName
  'new.namePlaceholder': 'Le mariage de Claire & Julien', // app: create.namePlaceholder
  'new.nameRequired': 'Veuillez donner un nom à l’événement.',
  'new.date': 'Date de l’événement (facultatif)', // app: create.dateLabel
  'new.dateHint': 'La date figure sur vos cartons d’invitation. La durée de stockage est comptée à partir de ce jour.',
  'new.who': 'Qui voit les photos ?', // app: create.titleMode
  'new.modeHint': 'Vous pourrez le changer plus tard dans les réglages.', // app: create.modeHint
  'new.cover': 'Photo de couverture (facultatif)',
  'new.coverAdd': 'Ajouter une photo de couverture',
  'new.coverChange': 'Changer',
  'new.locked': 'Le nom et la date ne pourront plus être modifiés : ils sont imprimés sur vos cartes.',
  'new.package': 'Formule',
  'new.consumerSoon': 'Les formules payantes arrivent bientôt sur le web. Commencez gratuitement avec Spark et passez à une formule supérieure plus tard, ici ou dans l’app.',
  'new.proSoonTitle': 'Les formules photographe arrivent bientôt sur le web',
  'new.proSoonBody': 'D’ici là, elles sont vendues dans l’app Sharecam pour iPhone. Les événements que vous y créez apparaissent ici avec la même connexion.',
  'new.proRegionLater': 'Après votre connexion, nous vérifions que la reconnaissance faciale est proposée là où vous êtes.',
  'new.ctaFree': 'Créer l’événement',
  'new.ctaPaid': 'Créer et payer · {plan} {price}',
  'new.created': 'Événement créé.',
  'new.createFailed': 'L’événement n’a pas pu être créé. Vérifiez votre connexion et réessayez.',
  'new.backToForm': 'Retour au formulaire',
  'new.stepAccount': 'Presque fini',
  'new.accountTitle': 'Connectez-vous pour enregistrer votre événement',
  'new.accountLead': 'Votre événement doit être lié à un compte auquel vous pourrez revenir. Si vous vous connectez déjà dans l’app, utilisez la même connexion.',
  'new.summary': 'Votre événement',
  'mode.openTitle': 'Galerie ouverte', // app: create.openTitle
  'mode.openDesc': 'Tout le monde voit et aime ce qui est envoyé. Un album partagé en direct.', // app: create.openDesc
  'mode.privateTitle': 'Mode privé', // app: create.privateTitle
  'mode.privateDesc': 'Vous seul voyez tout ; les invités ne voient que leurs envois. Parfait pour un album surprise.', // app: create.privateDesc

  // ---------------------------------------------------------------- event page
  'event.kicker': 'Événement',
  'event.kickerPro': 'Événement photographe', // app: hostEvent.hostOnlyTitle
  'event.noDate': 'Aucune date', // app: hostEvent.noDate
  'event.codeLine': 'Code {code}',
  'event.goneTitle': 'Cet événement n’est plus disponible', // app: eventGone.title
  'event.goneBody': 'Il a peut-être été supprimé, ou sa durée de conservation est terminée.', // app: eventGone.body
  'event.notYoursTitle': 'Cet événement appartient à un autre compte',
  'event.notYoursBody': 'Connectez-vous avec le compte qui l’a créé — celui que vous utilisez dans l’app.',
  'tab.label': 'Sections de l’événement',
  'tab.overview': 'Aperçu',
  'tab.gallery': 'Galerie',
  'tab.guests': 'Invités', // app: hostEvent.tabGuests
  'tab.settings': 'Réglages', // app: hostEvent.tabSettings
  'tab.plan': 'Formule', // app: hostEvent.planTitle
  'tab.downloads': 'Téléchargements',

  // overview
  'overview.createdTitle': 'Événement créé !', // app: qr.createdTitle
  'overview.createdBody': 'Partagez le code QR avec vos invités — chaque photo arrive dans votre galerie.', // app: qr.createdSubtitle
  'overview.createdBodyPro': 'Importez vos photos depuis cet ordinateur. Les invités scannent le QR pour parcourir l’album et se retrouver.',
  'overview.stats': 'Jusqu’ici',
  'overview.statsPro': 'Dans l’album',
  'overview.package': 'Formule', // app: hostEvent.planTitle
  'overview.keptUntil': 'Conservé jusqu’au',
  'overview.face': 'Reconnaissance faciale', // app: hostEvent.aiTitle
  'overview.faceNot': 'Non incluse',
  'overview.wall': 'Mur en direct', // app: hostEvent.wallTitle
  'overview.included': 'Inclus',
  'overview.changePackage': 'Changer de formule',
  'overview.refundedNote': 'Le paiement de cet événement a été remboursé. L’album reste jusqu’à la fin de son stockage ; racheter une formule le réactive.',
  'qr.kicker': 'Invitation',
  'qr.title': 'Vos invités rejoignent l’album en une étape', // app: qr.title
  'qr.body': 'Posez le QR sur les tables ou envoyez le lien. Les invités saisissent leur nom et partagent depuis le navigateur de leur téléphone — sans app, sans compte.',
  'qr.titlePro': 'Le QR des invités',
  'qr.bodyPro': 'Les invités le scannent pour parcourir l’album, enregistrer des photos et se retrouver avec un selfie. Vous seul importez.',
  'qr.codeLabel': 'Code de l’événement', // app: qr.codeLabel
  'qr.linkLabel': 'Lien invités',
  'qr.alt': 'Code QR de l’événement {code}',
  'qr.png': 'Télécharger le QR (PNG)',
  'qr.share': 'Partager l’invitation', // app: qr.share
  'qr.shareText': 'Rejoignez l’album photo « {name} » (code {code})',
  'qr.faceLine': 'La reconnaissance faciale est activée : le QR imprimé porte la mention d’une ligne pour les invités.',
  'upload.kicker': 'Importation',
  'upload.title': 'Importer depuis votre ordinateur', // app: uploadLink.title
  'upload.body': 'Glissez un dossier entier depuis votre ordinateur. Les originaux sont conservés en pleine résolution ; les invités voient des aperçus légers.', // app: uploadLink.subtitle
  'upload.cta': 'Importer les originaux',
  'upload.countOf': 'sur {cap} photos',
  'upload.countUnlimited': 'photos, sans limite',
  'owner.title': 'Partager avec les mariés', // app: hostEvent.shareOwnerTitle
  'owner.body': 'Donnez aux mariés un code à usage unique. Sur sharecam.app/album, ils voient tout l’album et peuvent tout télécharger, en pleine résolution et en plusieurs parties.', // app: hostEvent.shareOwnerBody
  'owner.cta': 'Créer un code pour les mariés', // app: hostEvent.shareOwnerCta
  'owner.newCode': 'Nouveau code', // app: ownerLink.newCode
  'owner.expires': 'Expire dans {time} · usage unique', // app: ownerLink.expiresIn
  'owner.expired': 'Ce code a expiré', // app: ownerLink.expired
  'owner.link': 'Lien de l’album',
  'owner.foot': 'Seuls les mariés doivent recevoir ce code : il débloque le téléchargement de l’album complet.', // app: ownerLink.footer
  'owner.error': 'Impossible de créer un code. Vérifiez votre connexion et réessayez.', // app: ownerLink.error
  'wall.title': 'Mur en direct', // app: hostEvent.wallTitle
  'wall.openBody': 'Le mur est prêt. Ouvrez ce lien sur la TV, l’ordinateur ou le vidéoprojecteur du lieu — sans câble ni application.',
  'wall.privateWarning': 'Le mode privé masque les envois jusqu’à la révélation, le mur reste donc éteint. Passez à la galerie ouverte pour l’utiliser.', // app: wall.privateWarning
  'await.kicker': 'Événement photographe',
  'await.title': 'Choisissez une formule pour obtenir votre QR',
  'await.body': 'Cet événement n’a pas encore de formule photographe. Son QR, son code et la page d’importation s’ouvrent dès qu’une formule est active. Le nom et la date sont enregistrés.',
  'await.cta': 'Choisir une formule',

  // expiry (D19)
  'expiry.title': 'Les photos de « {name} » seront supprimées dans {n} jours',
  'expiry.titleOne': 'Les photos de « {name} » seront supprimées demain',
  'expiry.todayTitle': 'Les photos de « {name} » seront supprimées aujourd’hui',
  'expiry.body': 'Le stockage prend fin le {date}. Téléchargez l’album d’ici là — ensuite, il ne pourra plus être récupéré.',
  'expiry.download': 'Télécharger',
  'expiry.listTitle': 'Le stockage prend bientôt fin',
  'expiry.listBody': 'Après cette date, les photos sont supprimées et ne peuvent plus être récupérées. Téléchargez ce que vous voulez garder.',
  'expiry.whenDays': 'dans {n} jours',
  'expiry.whenTomorrow': 'demain',
  'expiry.whenToday': 'aujourd’hui',
  'expiry.icsShort': 'Rappel',
  'expiry.ics': 'Ajouter un rappel au calendrier',
  'expiry.icsTitle': 'Téléchargez vos photos Sharecam : {name}',
  'expiry.icsBody': 'Les photos de « {name} » seront supprimées le {date}. Ouvrez l’espace hôte pour les télécharger.',

  // gallery
  'gallery.count': '{n} éléments · {shown} chargés',
  'gallery.filter': 'Afficher',
  'gallery.all': 'Toutes', // app: gallery.all
  'gallery.reportedN': 'Signalées ({n})', // app: hostEvent.reportedFilter
  'gallery.hiddenN': 'Masquées ({n})',
  'gallery.hidden': 'Masquée',
  'gallery.reported': 'Signalée',
  'gallery.hide': 'Masquer aux invités',
  'gallery.show': 'Montrer aux invités',
  'gallery.hiddenToast': 'Masquée pour les invités.',
  'gallery.shownToast': 'À nouveau visible par les invités.',
  'gallery.deleteTitle': 'Supprimer cette photo ?', // app: hostEvent.deleteTitle
  'gallery.deleteBody': 'Elle sera retirée de la galerie.', // app: hostEvent.deleteBody
  'gallery.deletedToast': 'Supprimée.',
  'gallery.more': 'Charger plus',
  'gallery.emptyTitle': 'Pas encore de photos', // app: hostEvent.emptyTitle
  'gallery.emptyBody': 'Posez le QR sur les tables — la première photo apparaîtra ici.',
  'gallery.emptyPro': 'Importez depuis votre ordinateur : les originaux sont conservés, les invités voient la galerie en quelques minutes.', // app: hostEvent.emptyProBody
  'gallery.noneReported': 'Aucun signalement parmi les éléments chargés.',
  'gallery.noneHidden': 'Rien de masqué parmi les éléments chargés.',
  'gallery.viewer': 'Visionneuse de photos',
  'gallery.openItem': 'Ouvrir la photo de {name}',
  'gallery.photoAlt': 'Photo de {name}',
  'gallery.unknownOwner': 'Invité',
  'gallery.openFull': 'Ouvrir en taille réelle',

  // guests
  'guests.emptyTitle': 'Pas encore d’invités', // app: guests.emptyTitle
  'guests.emptyBody': 'Toute personne qui rejoint l’événement avec le QR ou le code apparaît ici, avec son nom.', // app: guests.emptyBody
  'guests.ban': 'Retirer', // app: guests.ban
  'guests.unban': 'Rétablir', // app: guests.unban
  'guests.bannedTag': 'retiré', // app: guests.bannedTag
  'guests.banTitle': 'Retirer {name} ?', // app: guests.banTitle
  'guests.banBody': 'Cette personne ne pourra plus rejoindre l’événement ni envoyer de photos. Ses photos restent (vous pouvez les supprimer depuis la galerie).', // app: guests.banBody
  'guests.owner': 'Propriétaire de l’album',
  'guests.noName': 'Invité',
  'guests.joined': 'a rejoint {time}',
  'guests.removedToast': '{name} ne fait plus partie de l’événement.',
  'guests.restoredToast': '{name} peut à nouveau rejoindre l’événement.',
  'guests.capTitle': 'Invités de cet événement',
  'guests.capBody': 'Les invités retirés ne comptent pas ; leur place se libère.',
  'guests.full': 'Limite d’invités atteinte ({limit}). Passez à une formule supérieure pour en accueillir plus.', // app: guests.limitFull (adapted)

  // settings
  'settings.galleryTitle': 'Qui rejoint, qui voit',
  'settings.privateTitle': 'Mode privé', // app: hostEvent.privateTitle
  'settings.privateOn': 'Les invités ne voient que leurs propres photos.', // app: hostEvent.privateOn
  'settings.privateOff': 'Tout le monde voit toute la galerie.', // app: hostEvent.privateOff
  'settings.statePrivate': 'Privée', // app: hostEvent.statePrivate
  'settings.statePublic': 'Publique', // app: hostEvent.statePublic
  'settings.revealTitle': 'Ouvrir la galerie à tous ?', // app: hostEvent.revealTitle
  'settings.revealBody': 'Les invités verront désormais les photos des autres. C’est une « révélation » — êtes-vous sûr ?', // app: hostEvent.revealBody
  'settings.revealConfirm': 'Oui, ouvrir', // app: hostEvent.revealConfirm
  'settings.autoRevealTitle': 'Ouverture automatique', // app: hostEvent.revealSchedTitle
  'settings.autoRevealOn': 'La galerie s’ouvre à tous le {time}.', // app: hostEvent.revealSchedOn
  'settings.autoRevealOff': 'Désactivé : la galerie reste privée jusqu’à ce que vous l’ouvriez vous-même.', // app: hostEvent.revealSchedOff
  'settings.revealPick': 'Choisir la date et l’heure', // app: hostEvent.revealPick
  'settings.pauseTitle': 'Suspendre les arrivées', // app: hostEvent.pauseTitle
  'settings.pauseOn': 'Plus personne ne peut rejoindre l’événement. Les invités déjà présents restent.', // app: hostEvent.pauseOn
  'settings.pauseOff': 'Toute personne ayant le QR ou le code peut rejoindre l’événement.', // app: hostEvent.pauseOff
  'settings.statePaused': 'En pause', // app: hostEvent.statePaused
  'settings.stateOpen': 'Ouverte', // app: hostEvent.stateOpen
  'settings.downloadTitle': 'Téléchargements invités', // app: hostEvent.downloadTitle
  'settings.downloadDesc': 'Les invités peuvent enregistrer les photos.', // app: hostEvent.downloadDesc
  'settings.hostOnlyTitle': 'Événement photographe', // app: hostEvent.hostOnlyTitle
  'settings.hostOnlyBody': 'Vous seul importez. Les invités consultent la galerie, enregistrent des photos et retrouvent les leurs avec un selfie. Ce réglage ne peut pas être modifié.', // app: hostEvent.hostOnlyBody
  'settings.detailsTitle': 'Détails de l’événement', // app: hostEvent.detailsTitle
  'settings.name': 'Nom',
  'settings.date': 'Date',
  'settings.code': 'Code',
  'settings.noCover': 'Pas de photo de couverture',
  'settings.coverAdd': 'Ajouter une photo de couverture',
  'settings.coverChange': 'Changer la couverture',
  'settings.coverSaved': 'Couverture enregistrée.',
  'settings.coverRemoved': 'Couverture retirée.',
  'settings.lockedNote': 'Le nom et la date sont verrouillés pour que l’écran corresponde toujours à vos cartes imprimées.',
  'settings.saved': 'Enregistré.',
  'settings.dangerTitle': 'Zone dangereuse', // app: hostEvent.dangerTitle
  'settings.dangerBody': 'La suppression retire l’événement, ses photos et sa liste d’invités pour tout le monde, y compris vos invités. Action irréversible.', // app: hostEvent.dangerBody
  'settings.deleteCta': 'Supprimer l’événement',
  'settings.deleteTitle': 'Supprimer cet événement ?', // app: hostEvent.deleteEventTitle
  'settings.deleteBody': '« {name} » et toutes ses photos seront définitivement supprimés.', // app: hostEvent.deleteEventBody
  'settings.deleteConfirm': 'Supprimer…', // app: hostEvent.deleteEventConfirm
  'settings.deleteTitle2': 'En êtes-vous absolument sûr ?', // app: hostEvent.deleteEventTitle2
  'settings.deleteBody2': 'C’est définitif — impossible de récupérer l’événement.', // app: hostEvent.deleteEventBody2
  'settings.deleted': 'Événement supprimé.',
  'settings.deletePairedNote': 'La suppression d’un événement est possible dès que ce compte a son propre moyen de connexion, ou dans l’app.',

  // face matching (the app's versioned texts, face.* 2026-09-23 — copy verbatim)
  'face.title': 'Reconnaissance faciale', // app: hostEvent.aiTitle
  'face.tabTitle': 'Trouvez vos photos', // app: face.tabTitle
  'face.aiOn': 'Activé : les invités peuvent retrouver leurs propres photos avec un selfie.', // app: hostEvent.aiOn
  'face.aiOff': 'Désactivé : les invités ne voient pas « Trouvez vos photos ».', // app: hostEvent.aiOff
  'face.notInPackage': 'La reconnaissance faciale ne fait pas partie de cette formule. Elle peut être ajoutée dans l’app Sharecam.',
  'face.hostConfirmTitle': 'Activer la reconnaissance faciale ?', // app: face.hostConfirmTitle
  'face.hostConfirmBody': 'Vos invités pourront alors trouver leurs photos avec un selfie. Il vous revient de les en informer — nous vous fournissons le texte pour l’invitation et une affiche. La fonction ne doit pas servir à contrôler les présences ni à identifier quelqu’un qui ne l’a pas demandé.', // app: face.hostConfirmBody
  'face.hostConfirmCta': 'Activer', // app: face.hostConfirmCta
  'face.remindTitle': 'Prévenez vos invités dès maintenant', // app: face.noticeTitle (adapted)
  'face.remindBody': 'Copiez le texte ci-dessous dans votre invitation ou votre groupe de discussion, et imprimez le QR avec sa mention.',
  'face.noticeTitle': 'Prévenez vos invités', // app: face.noticeTitle
  'face.noticeSub': 'Collez ceci dans votre invitation, votre groupe de discussion ou une carte sur les tables.', // app: face.noticeSub
  'face.noticeText': 'Les photos de cet événement sont réunies dans un album partagé. Il propose une reconnaissance faciale facultative pour retrouver vos propres photos. C\'est votre choix et vous pouvez refuser. Détails : sharecam.app/face-grouping', // app: face.noticeText
  'face.noticeCopy': 'Copier le texte', // app: face.noticeCopy
  'face.noticeCopied': 'Copié', // app: face.noticeCopied
  'face.noticePrint': 'Le QR téléchargé depuis l’aperçu porte la mention d’une ligne pour les cartes imprimées.',
  'face.cardNotice': 'Reconnaissance faciale facultative dans cet album · sharecam.app/face-grouping', // app: face.cardNotice
  'face.regionTitle': 'Indisponible dans votre région', // app: face.regionTitle
  'face.regionBody': 'La reconnaissance faciale n’est pas encore proposée chez vous. Nous ne l’ouvrons que là où nous pouvons respecter les règles locales sur les données faciales : nous ne vous vendons jamais une fonction que vos invités ne pourraient pas utiliser.', // app: face.regionBody
  'face.regionSoonTitle': 'Bientôt disponible chez vous', // app: face.regionSoonTitle
  'face.regionSoonBody': 'Nous finalisons la déclaration qui nous permet de traiter les données faciales dans votre pays. Tout le reste de l’album fonctionne normalement.', // app: face.regionSoonBody
  'face.regionUnknownTitle': 'Nous n’avons pas pu confirmer où vous êtes', // app: face.regionUnknownTitle
  'face.regionUnknownBody': 'Cette fonction dépend des règles locales sur les données faciales : nous ne l’activons que si nous savons lesquelles s’appliquent. Tout le reste de l’album fonctionne normalement.', // app: face.regionUnknownBody
  'face.declTitle': 'Avant de l’ajouter', // app: face.declTitle
  'face.declIntro': 'Vous êtes l’organisateur de cet événement : ces décisions vous appartiennent. En cochant la case, vous confirmez :', // app: face.declIntro
  'face.decl1': 'Je décide qui est invité et photographié lors de cet événement.', // app: face.decl1
  'face.decl2': 'J’informerai mes invités que la reconnaissance des visages est activée, via le texte d’invitation et la carte imprimée de cette app.', // app: face.decl2
  'face.decl3': 'Mon événement n’a pas lieu en Illinois, au Texas ni dans l’État de Washington.', // app: face.decl3
  'face.decl4': 'Les données faciales sont traitées par AWS à Francfort (Allemagne) et supprimées lorsque je désactive la fonction ou que l’album est supprimé.', // app: face.decl4
  'face.decl5': 'Il m’incombe de respecter les règles applicables là où se tient mon événement.', // app: face.decl5
  'face.declAccept': 'J’ai lu et j’accepte les conditions organisateur', // app: face.declAccept
  'face.declRead': 'Lire les conditions organisateur complètes', // app: face.declRead
  'face.declError': 'Nous n’avons pas pu enregistrer votre acceptation. Vérifiez votre connexion et réessayez.', // app: face.declError
  'decl.kicker': '{plan} · reconnaissance faciale incluse',
  'decl.continue': 'Accepter et passer au paiement',

  // ---------------------------------------------------------------- package & checkout (§3.4)
  'checkout.kicker': 'Formules',
  'checkout.kickerPro': 'Formules photographe', // app: paywall.titlePro
  'checkout.titleNew': 'Choisissez une formule pour votre événement', // app: paywall.title
  'checkout.titleUpgrade': 'Passez à une formule supérieure', // app: paywall.titleUpgrade
  'checkout.subtitle': 'Paiement unique — pas d’abonnement. Choisissez la taille adaptée à votre liste d’invités.', // app: paywall.subtitle
  'checkout.subtitlePro': 'Paiement unique par événement. Vous importez depuis votre ordinateur ; les invités scannent le QR, parcourent l’album et retrouvent leurs photos avec un selfie.', // app: paywall.subtitlePro
  'checkout.current': 'Actuelle',
  'checkout.upgradeRule': 'Passer à une formule supérieure coûte son prix complet — la même règle que dans l’app.',
  'checkout.choose': 'Choisir une formule',
  'checkout.cta': 'Payer {price} · {plan}',
  'checkout.opening': 'Ouverture du paiement sécurisé…',
  'checkout.paying': 'Terminez le paiement dans la fenêtre de paiement.',
  'checkout.sandbox': 'Sandbox · paiements de test',
  'checkout.footnote': 'Prix en USD, les mêmes que dans l’app Sharecam. Paddle peut afficher votre devise locale et les taxes au moment du paiement. Les paiements sont traités par Paddle, notre revendeur officiel (merchant of record).',
  'checkout.soonTitle': 'L’achat sur le web arrive bientôt',
  'checkout.soonOff': 'Les formules ne peuvent pas encore être achetées sur le web.',
  'checkout.soonPrices': 'Ces formules ne sont pas encore vendues sur le web.',
  'checkout.soonApp': 'D’ici là, les formules sont vendues dans l’app Sharecam pour iPhone — cet événement y apparaît avec la même connexion.',
  'checkout.soonAppPro': 'D’ici là, les formules photographe sont vendues dans l’app Sharecam pour iPhone — cet événement y apparaît avec la même connexion.',
  'checkout.maxedTitle': '{plan} est la plus grande formule',
  'checkout.maxedBody': 'Il n’y a pas de formule supérieure pour cet événement.',
  'checkout.unavailableTitle': 'Cet événement ne peut pas changer de formule ici',
  'checkout.unavailableBody': 'Il appartient à un autre compte, ou il n’existe plus.',
  'checkout.codeNotPro': 'Les formules photographe nécessitent un événement créé comme événement photographe. Créez plutôt un nouvel événement photographe.',
  'checkout.refundedTitle': 'Cet événement a été remboursé',
  'checkout.refundedBody': 'Racheter une formule le réactive : les envois, la reconnaissance faciale (si incluse) et les téléchargements reviennent.',
  'checkout.abandonedTitle': 'Votre événement est sur Spark (gratuit)',
  'checkout.abandoned': 'Votre événement est sur Spark (gratuit). Choisissez une formule quand vous voulez.',
  'checkout.closedNote': 'Le paiement a été fermé. Rien n’a été débité.',
  'checkout.applyingTitle': 'Paiement reçu',
  'checkout.applyingBody': 'Nous activons la formule {plan} sur cet événement. Cette page se met à jour toute seule.',
  'checkout.slowTitle': 'Paiement reçu — presque fini',
  'checkout.slowBody': 'Votre paiement est bien arrivé. La formule {plan} sera activée dans quelques minutes ; vous pouvez quitter cette page. Si elle n’est pas active d’ici une heure, écrivez-nous.',
  'checkout.doneTitle': 'C’est fait 🎉', // app: paywall.doneTitle
  'checkout.doneBody': 'La formule {plan} est active. Paddle envoie le reçu à votre adresse e-mail.', // app: paywall.active (+ receipt)
  'checkout.toOverview': 'Aller à l’événement', // app: qr.goToEvent
  'checkout.coveredTitle': 'Cet événement a déjà la formule {plan}',
  'checkout.coveredBody': 'Si vous avez payé deux fois, nous remboursons le paiement en trop. Questions : {email}',
  'checkout.failedTitle': 'Votre paiement n’a pas pu être appliqué',
  'checkout.failedBody': 'Nous vous le remboursons — vous n’avez rien à faire. Questions : {email}',
  'checkout.openFailedTitle': 'Le paiement n’a pas pu s’ouvrir',
  'checkout.openFailedBody': 'Rien n’a été débité. Réessayez dans un instant.',
  'checkout.tooMany': 'Trop de paiements ont été ouverts aujourd’hui. Réessayez demain ou écrivez-nous.',
  'checkout.backToPackages': 'Retour aux formules',
  'checkout.contact': 'Contacter l’assistance',
  'checkout.mailSlow': 'Paiement web pas encore appliqué',
  'checkout.mailDuplicate': 'Payé deux fois',
  'checkout.mailFailed': 'Paiement web non appliqué',
  'checkout.proIncludesTitle': 'Dans chaque formule photographe',
  'checkout.proInc1': 'Reconnaissance faciale incluse, là où elle est disponible', // app: paywall.featAiIncluded (adapted)
  'checkout.proInc2': 'Vous seul importez — les invités regardent', // app: paywall.featHostOnly
  'checkout.proInc3': 'Originaux conservés en pleine résolution', // app: paywall.featOriginals

  // ---------------------------------------------------------------- downloads
  'downloads.zipTitle': 'Télécharger l’album',
  'downloads.zipBody': 'Toutes les photos et vidéos dans un seul fichier ZIP. Les grands albums demandent une minute de préparation.',
  'downloads.zipCta': 'Télécharger le ZIP', // app: download.zip
  'downloads.zipWorking': 'Compression…', // app: download.zipWorking
  'downloads.zipReady': 'Télécharger le ZIP ({n} éléments)',
  'downloads.displayTitle': 'Pour partager — 2048 px',
  'downloads.displayBody': 'Tout l’album en fichiers ZIP de 500 photos, dimensionnés pour les écrans et les réseaux.',
  'downloads.originalTitle': 'Originaux — pleine résolution',
  'downloads.originalBody': 'Vos photos importées telles quelles, en fichiers ZIP de 150 photos.',
  'downloads.prepare': 'Préparer le téléchargement',
  'downloads.again': 'Préparer à nouveau',
  'downloads.preparing': 'Préparation de la partie {done} sur {total}…',
  'downloads.part': 'Partie {n} sur {of}',
  'downloads.items': '{n} photos',
  'downloads.download': 'Télécharger',
  'downloads.validity': 'Album complet en plusieurs fichiers ZIP : 2048 px pour partager, originaux en pleine résolution pour conserver. Les liens restent valides 7 jours et peuvent être régénérés.', // app: ownerLink.step3Body
  'downloads.refundedTitle': 'Téléchargements désactivés pour les événements remboursés',
  'downloads.refunded': 'Le paiement de cet événement a été remboursé ; l’album ne peut donc pas être exporté en ZIP. Rachetez une formule pour réactiver l’export.', // app: download.zipRefunded
  'downloads.buyAgain': 'Voir les formules',
  'downloads.nothing': 'Il n’y a encore rien à télécharger.',
  'downloads.failed': 'Impossible de créer le ZIP.', // app: download.zipFailed
  'downloads.keepTitle': 'Gardez une copie',
  'downloads.keepBody': 'Le stockage prend fin le {date}. Téléchargez l’album d’ici là.',
  'downloads.keepBodyNoDate': 'Téléchargez l’album avant la fin de son stockage.',

  // ---------------------------------------------------------------- account
  'account.kicker': 'Compte', // app: account.title
  'account.title': 'Votre compte',
  'account.signins': 'Moyens de connexion',
  'account.pairedOnly': 'Cet ordinateur est connecté via l’app Sharecam. Le compte n’a pas encore de moyen de connexion propre.',
  'account.sameAsApp': 'Vos événements appartiennent à ce compte — celui que vous utilisez dans l’app Sharecam.',
  'account.addAnother': 'Ajouter un autre moyen de connexion',
  'account.addAnotherBody': 'Un second accès, pour le jour où vous perdriez le premier.',
  'account.linked': 'Moyen de connexion ajouté.',
  'account.signOutTitle': 'Se déconnecter', // app: account.signOut
  'account.signOutBody': 'Vos événements restent dans votre compte. Reconnectez-vous quand vous voulez.',
  'account.signOutPaired': 'Sans moyen de connexion propre, cet ordinateur ne peut revenir qu’en étant de nouveau connecté via l’app.',
  'account.deleteCta': 'Supprimer le compte et les données', // app: account.deleteCta
  'account.deleteTitle': 'Supprimer votre compte et vos données ?', // app: account.deleteTitle
  'account.deleteBody': 'Votre compte, tous les événements que vous avez créés, les photos et les listes d’invités sont définitivement supprimés, sur tous vos appareils. Action irréversible.', // app: account.deleteBody
  'account.deleteConfirm': 'Tout supprimer', // app: account.deleteConfirm
  'account.deleted': 'Votre compte et vos données ont été supprimés.', // app: account.deleted
  'account.deleteFailed': 'Votre compte n’a pas pu être supprimé. Veuillez réessayer.', // app: account.deleteFailed
  'account.deletePairedNote': 'La suppression du compte est possible dès qu’il a son propre moyen de connexion, ou dans l’app (Réglages → Compte).',
};

export default fr;
