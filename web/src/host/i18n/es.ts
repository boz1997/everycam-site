// Sharecam host dashboard — Español (plan §3.6, D15; WP-H).
//
// Tuteo (como la app), "evento", "anfitrión" = host, "paquete", "mejorar" = upgrade,
// "reconocimiento facial", "Modo privado" / "Galería abierta", "muro en vivo", "la pareja";
// ordenador enlazado = "conectar" (como la app y la página de subida). Comillas «…», dos puntos
// en lugar de raya (como la app), puntos suspensivos ….
//
// Same keys and order as en.ts (tsc fails on a missing or stale key). A `// app: <key>`
// comment marks a string copied verbatim from EC/src/i18n/locales/es.ts (native-reviewed
// 23 Sep 2026, EC 5c05c8e; {{x}} → {x}); "(adapted)" = the app wording with the same change
// the English line makes. Every other string is new and is checked before go-live.
// face.* declaration and notice texts are versioned (declTextVersion 2026-09-23): never edit
// them here, only together with the app and the server.

import type { Dict } from './en';

const es: Dict = {
  // ---------------------------------------------------------------- common
  'common.back': 'Atrás',
  'common.cancel': 'Cancelar', // app: common.cancel
  'common.close': 'Cerrar', // app: common.close
  'common.delete': 'Eliminar', // app: common.delete
  'common.on': 'Activado', // app: common.on
  'common.off': 'Desactivado', // app: common.off
  'common.ok': 'Aceptar',
  'common.copy': 'Copiar',
  'common.copied': 'Copiado', // app: face.noticeCopied
  'common.remove': 'Quitar', // app: create.coverRemove
  'common.saving': 'Guardando…',
  'common.loading': 'Cargando…',
  'common.loadFailed': 'No se pudo cargar esta página',
  'common.checkConnection': 'Comprueba tu conexión e inténtalo de nuevo.',
  'common.tryAgain': 'Algo ha fallado. Inténtalo de nuevo.',
  'common.prev': 'Anterior',
  'common.next': 'Siguiente',

  // ---------------------------------------------------------------- page titles (browser tab)
  'title.events': 'Tus eventos',
  'title.signin': 'Iniciar sesión',
  'title.new': 'Crea tu evento',
  'title.account': 'Cuenta',

  // ---------------------------------------------------------------- shell
  'shell.tag': 'Anfitrión',
  'shell.language': 'Idioma',
  'shell.accountMenu': 'Menú de la cuenta',
  'shell.events': 'Tus eventos',
  'shell.account': 'Cuenta',
  'shell.signOut': 'Cerrar sesión', // app: account.signOut
  'shell.signedInAs': 'Sesión iniciada como {who}',
  'shell.paired': 'Conectado con la app',
  'shell.pairedLong': 'Este ordenador está conectado con la app Sharecam. Aún no tiene un inicio de sesión propio.',
  'shell.linkBannerTitle': 'Añade un inicio de sesión para conservar esta cuenta',
  'shell.linkBannerBody': 'Este ordenador está conectado con tu app Sharecam. Añade un inicio de sesión con correo o Google para poder volver sin la app. También lo necesitas para comprar un paquete en la web.',
  'shell.linkBannerCta': 'Añadir inicio de sesión',
  'nav.events': 'Tus eventos',
  'nav.signin': 'Iniciar sesión',
  'legal.webTerms': 'Condiciones de compra en la web',
  'legal.refund': 'Política de reembolsos',
  'legal.privacy': 'Privacidad', // app: legal.privacy
  'legal.terms': 'Términos', // app: legal.terms
  'legal.support': 'Soporte', // app: legal.support
  'legacy.title': 'Vuelve a conectar este ordenador',
  'legacy.body': 'Este navegador estaba conectado a tus eventos a través de la antigua página de subida. Hemos cerrado esa sesión para que la página de invitados vuelva a funcionar con normalidad aquí. Para subir fotos, conéctalo otra vez con la app Sharecam o inicia sesión.',

  // ---------------------------------------------------------------- sign in
  'signin.kicker': 'Panel del anfitrión',
  'signin.title': 'Inicia sesión en tus eventos',
  'signin.lead': 'Usa el mismo inicio de sesión que en la app (Ajustes → Cuenta). Si nunca has iniciado sesión allí, hazlo primero.',
  'signin.appKicker': '¿Ya usas la app?',
  'signin.appTitle': 'Misma cuenta, mismos eventos',
  'signin.appBody': 'Los eventos que creaste en la app Sharecam aparecen aquí cuando inicias sesión con la misma cuenta que usas en la app (Ajustes → Cuenta).',
  'auth.google': 'Continuar con Google', // app: account.continueGoogle
  'auth.apple': 'Continuar con Apple', // app: account.continueApple
  'auth.soon': 'Pronto',
  'auth.appleSoon': '¿Iniciaste sesión con Apple en la app? El inicio de sesión con Apple en la web llega pronto.',
  'auth.orEmail': 'o con correo electrónico',
  'auth.email': 'Correo electrónico',
  'auth.password': 'Contraseña',
  'auth.passwordHint': 'Al menos 6 caracteres.',
  'auth.signinCta': 'Iniciar sesión',
  'auth.createCta': 'Crear cuenta',
  'auth.resetCta': 'Enviar enlace para restablecerla',
  'auth.resetTitle': 'Restablece tu contraseña',
  'auth.resetSent': 'Si {email} tiene una cuenta, te hemos enviado un enlace para restablecerla. Revisa tu bandeja de entrada.',
  'auth.toCreate': '¿Eres nuevo? Crea una cuenta',
  'auth.toReset': '¿Has olvidado la contraseña?',
  'auth.toSignin': 'Volver a iniciar sesión',
  'auth.errWrong': 'Correo o contraseña incorrectos.',
  'auth.errEmailTaken': 'Este correo ya tiene una cuenta. Inicia sesión.',
  'auth.errWeak': 'Elige una contraseña de al menos 6 caracteres.',
  'auth.errEmail': 'Introduce un correo electrónico válido.',
  'auth.errPopupBlocked': 'Tu navegador ha bloqueado la ventana de inicio de sesión. Permite las ventanas emergentes para este sitio e inténtalo de nuevo.',
  'auth.errProviderOff': 'Este inicio de sesión aún no está disponible en este sitio. Usa el correo electrónico.',
  'auth.errOffline': 'Sin conexión. Comprueba tu internet e inténtalo de nuevo.',
  'auth.errTooMany': 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.',
  'auth.errDisabled': 'Esta cuenta está desactivada. Escríbenos desde la página de soporte.',
  'auth.errRecent': 'Por tu seguridad, cierra sesión y vuelve a iniciarla; después repite este paso.',
  'auth.errAlreadyLinked': 'Este inicio de sesión ya está añadido a tu cuenta.',
  'auth.errGeneric': 'No se pudo iniciar sesión. Inténtalo otra vez.', // app: account.errorGeneric

  // ---------------------------------------------------------------- pair with the app
  'pair.kicker': 'Para fotógrafos',
  'pair.title': 'Conectar con la app Sharecam',
  'pair.body': '¿Aún no tienes inicio de sesión en la web? Conecta este ordenador a la cuenta de tu app Sharecam. Funciona con los eventos de fotógrafo.',
  'pair.open': 'Conectar con la app',
  'pair.qrTitle': 'Escanea este código con la app',
  'pair.step1': 'Abre tu evento de fotógrafo en la app Sharecam.',
  'pair.step2': 'Toca «Subir desde el ordenador» y después «Escanear QR del ordenador».',
  'pair.step3': 'Confírmalo en el móvil. Esta página inicia sesión sola.',
  'pair.qrAlt': 'Código de conexión para la app Sharecam',
  'pair.qrFoot': 'El código se renueva cada pocos minutos.',
  'pair.qrError': 'No se pudo crear el código. Usa el código de 6 caracteres de abajo.',
  'pair.connecting': 'Conectando…',
  'pair.orCode': 'o introduce el código de la app',
  'pair.codeLabel': 'Código de la app',
  'pair.codeCta': 'Conectar',
  'pair.foot': 'El código inicia tu sesión en este ordenador. Úsalo solo en un ordenador de confianza.', // app: uploadLink.footer (adapted)
  'pair.errNotFound': 'Ese código no es válido. Compruébalo en la app.',
  'pair.errExpired': 'Ese código ha caducado. Genera uno nuevo en la app.',
  'pair.errUsed': 'Ese código ya se ha usado. Genera uno nuevo en la app.',
  'pair.errGeneric': 'No hemos podido conectar este ordenador. Comprueba tu conexión e inténtalo de nuevo.',

  // ---------------------------------------------------------------- link a sign-in (paired accounts)
  'link.kicker': 'Un paso más',
  'link.title': 'Añade un inicio de sesión a esta cuenta',
  'link.lead': 'Tus eventos se quedan donde están. Después podrás iniciar sesión aquí con él, y la app sigue funcionando como antes.',
  'link.buyLead': 'Para comprar en la web necesitas una cuenta a la que puedas volver: los recibos llegan a un correo y el paquete pertenece a este evento durante todo su almacenamiento. Añade primero un inicio de sesión; tus eventos se quedan donde están.',
  'link.google': 'Añadir inicio de sesión con Google',
  'link.apple': 'Añadir inicio de sesión con Apple',
  'link.emailCta': 'Añadir inicio de sesión con correo',
  'link.inUseTitle': 'Este inicio de sesión ya tiene una cuenta de Sharecam',
  'link.inUseBody': 'Inicia sesión con él en la app (Ajustes → Cuenta); la app traslada allí tus eventos. Después inicia sesión aquí con la misma cuenta.',
  'link.inUseBack': 'Probar otro inicio de sesión',

  // ---------------------------------------------------------------- event list
  'list.kicker': 'Panel del anfitrión',
  'list.title': 'Tus eventos',
  'list.lead': 'Todo lo que organizas, desde la web y desde la app.',
  'list.leadEmpty': 'Crea un evento, comparte el QR, reúne cada foto.', // app: welcome.hostDesc
  'list.create': 'Crea tu evento',
  'list.createPro': 'Evento de fotógrafo',
  'list.groupPro': 'Eventos de fotógrafo',
  'list.groupEvents': 'Eventos',
  'list.groupAll': 'Eventos',
  'list.count': '{n} en total',
  'list.guestsShort': '{v} invitados',
  'list.photosShort': '{v} fotos',
  'list.keptUntil': 'Se guarda hasta el {date}',
  'list.deletion': 'Se guarda hasta',
  'list.waiting': 'Aún sin paquete: el QR se abre cuando haya uno activo',
  'list.emptyTitle': 'Aún no hay eventos', // app: dashboard.emptyTitle
  'list.emptyBody': 'Listo en 60 segundos: nombre, fecha y privacidad. Tu QR, listo para imprimir. ¿Creaste eventos en la app? Inicia sesión aquí con la misma cuenta que usas allí.', // app: dashboard.emptyBody (+ one sentence)
  'list.findHint': '¿No encuentras un evento que creaste en la app? Inicia sesión con la misma cuenta que usas allí (Ajustes → Cuenta). Los eventos de una app sin sesión iniciada se quedan en ese móvil hasta que inicies sesión allí.',

  // ---------------------------------------------------------------- stats, units, plans
  'stat.guests': 'Invitados',
  'stat.photos': 'Fotos',
  'stat.videos': 'Vídeos',
  'unit.days': '{n} días',
  'unit.month': '1 mes',
  'unit.months': '{n} meses',
  'unit.year': '1 año',
  'unit.years': '{n} años',
  'unit.unlimited': 'Ilimitado',
  'unit.unlimitedShort': 'sin límite',
  'plan.free': 'Gratis', // app: paywall.free
  'plan.perEvent': 'por evento', // app: paywall.perEvent
  'plan.popular': 'El más popular', // app: plans.wedding.badge
  'plan.storage': 'Almacenamiento',
  'plan.refunded': 'Reembolsado',
  'plan.awaiting': 'Elige un paquete',
  'plan.webSoon': 'Pronto en la web',
  'plan.none': 'Aún sin paquete',
  'plan.wallIncluded': 'Incluye el muro en vivo',

  // ---------------------------------------------------------------- create
  'new.kicker': 'Nuevo evento',
  'new.kickerPro': 'Nuevo evento de fotógrafo',
  'new.title': 'Crea tu evento',
  'new.titlePro': 'Crea un evento de fotógrafo',
  'new.lead': 'Ponle nombre, decide quién ve las fotos y elige un paquete. Todos los eventos empiezan gratis con Spark.',
  'new.leadPro': 'Subes las fotos desde tu ordenador y los originales se guardan. Los invitados escanean el QR, ven el álbum y encuentran sus fotos con un selfi.',
  'new.tierLabel': 'Tipo de evento',
  'new.tierEvents': 'Eventos',
  'new.tierPro': 'Fotógrafos',
  'new.details': 'Detalles del evento', // app: create.step1Title
  'new.name': 'Ponle nombre a tu evento', // app: create.titleName
  'new.namePlaceholder': 'La boda de Ana y Miguel', // app: create.namePlaceholder
  'new.nameRequired': 'Ponle un nombre al evento.',
  'new.date': 'Fecha del evento (opcional)', // app: create.dateLabel
  'new.dateHint': 'La fecha aparece en tus tarjetas de invitación. El almacenamiento se cuenta desde ese día.',
  'new.who': '¿Quién ve las fotos?', // app: create.titleMode
  'new.modeHint': 'Puedes cambiarlo después en Ajustes.', // app: create.modeHint
  'new.cover': 'Foto de portada (opcional)',
  'new.coverAdd': 'Añadir foto de portada',
  'new.coverChange': 'Cambiar',
  'new.locked': 'El nombre y la fecha no se pueden cambiar después: van impresos en tus tarjetas.',
  'new.package': 'Paquete',
  'new.consumerSoon': 'Los paquetes de pago llegarán pronto a la web. Empieza gratis con Spark y mejora más tarde, aquí o en la app.',
  'new.proSoonTitle': 'Los paquetes para fotógrafos llegarán pronto a la web',
  'new.proSoonBody': 'Mientras tanto se venden en la app Sharecam para iPhone. Los eventos que crees allí aparecen aquí con el mismo inicio de sesión.',
  'new.proRegionLater': 'Cuando inicies sesión, comprobaremos si el reconocimiento facial está disponible donde estás.',
  'new.ctaFree': 'Crear evento',
  'new.ctaPaid': 'Crear y pagar · {plan} {price}',
  'new.created': 'Evento creado.',
  'new.createFailed': 'No se pudo crear el evento. Comprueba tu conexión e inténtalo de nuevo.',
  'new.backToForm': 'Volver al formulario',
  'new.stepAccount': 'Ya casi está',
  'new.accountTitle': 'Inicia sesión para guardar tu evento',
  'new.accountLead': 'Tu evento necesita una cuenta a la que puedas volver. Si ya tienes un inicio de sesión en la app, usa el mismo.',
  'new.summary': 'Tu evento',
  'mode.openTitle': 'Galería abierta', // app: create.openTitle
  'mode.openDesc': 'Todos ven y dan me gusta a lo que se sube. Un álbum compartido en vivo.', // app: create.openDesc
  'mode.privateTitle': 'Modo privado', // app: create.privateTitle
  'mode.privateDesc': 'Solo tú lo ves todo; los invitados ven solo lo suyo. Perfecto para un álbum sorpresa.', // app: create.privateDesc

  // ---------------------------------------------------------------- event page
  'event.kicker': 'Evento',
  'event.kickerPro': 'Evento de fotógrafo', // app: hostEvent.hostOnlyTitle
  'event.noDate': 'Sin fecha', // app: hostEvent.noDate
  'event.codeLine': 'Código {code}',
  'event.goneTitle': 'Este evento ya no está disponible', // app: eventGone.title
  'event.goneBody': 'Puede que se haya eliminado o que su periodo de almacenamiento haya terminado.', // app: eventGone.body
  'event.notYoursTitle': 'Este evento pertenece a otra cuenta',
  'event.notYoursBody': 'Inicia sesión con la cuenta que lo creó: la misma que usas en la app.',
  'tab.label': 'Secciones del evento',
  'tab.overview': 'Resumen',
  'tab.gallery': 'Galería',
  'tab.guests': 'Invitados', // app: hostEvent.tabGuests
  'tab.settings': 'Ajustes', // app: hostEvent.tabSettings
  'tab.plan': 'Paquete', // app: hostEvent.planTitle
  'tab.downloads': 'Descargas',

  // overview
  'overview.createdTitle': '¡Evento creado!', // app: qr.createdTitle
  'overview.createdBody': 'Comparte el código QR con tus invitados: cada foto llega a tu galería.', // app: qr.createdSubtitle
  'overview.createdBodyPro': 'Sube tus fotos desde este ordenador. Los invitados escanean el QR para ver el álbum y encontrarse.',
  'overview.stats': 'Hasta ahora',
  'overview.statsPro': 'En el álbum',
  'overview.package': 'Paquete', // app: hostEvent.planTitle
  'overview.keptUntil': 'Se guarda hasta',
  'overview.face': 'Reconocimiento facial', // app: hostEvent.aiTitle
  'overview.faceNot': 'No incluido',
  'overview.wall': 'Muro en vivo', // app: hostEvent.wallTitle
  'overview.included': 'Incluido',
  'overview.changePackage': 'Cambiar de paquete',
  'overview.refundedNote': 'El pago de este evento fue reembolsado. El álbum se mantiene hasta que termine su almacenamiento; volver a comprar un paquete lo reactiva.',
  'qr.kicker': 'Invitación',
  'qr.title': 'Tus invitados se unen en un paso', // app: qr.title
  'qr.body': 'Pon el QR en las mesas o envía el enlace. Los invitados escriben su nombre y comparten desde el navegador del móvil: sin app y sin cuenta.',
  'qr.titlePro': 'El QR de los invitados',
  'qr.bodyPro': 'Los invitados lo escanean para ver el álbum, guardar fotos y encontrarse con un selfi. Solo tú subes fotos.',
  'qr.codeLabel': 'Código del evento', // app: qr.codeLabel
  'qr.linkLabel': 'Enlace para invitados',
  'qr.alt': 'Código QR del evento {code}',
  'qr.png': 'Descargar QR (PNG)',
  'qr.share': 'Compartir invitación', // app: qr.share
  'qr.shareText': 'Únete al álbum de fotos «{name}» (código {code})',
  'qr.faceLine': 'El reconocimiento facial está activado: el QR impreso lleva el aviso de una línea para los invitados.',
  'upload.kicker': 'Subida',
  'upload.title': 'Subir desde tu ordenador', // app: uploadLink.title
  'upload.body': 'Arrastra una carpeta entera desde tu ordenador. Los originales se guardan a máxima resolución; los invitados ven vistas previas ligeras.', // app: uploadLink.subtitle
  'upload.cta': 'Subir originales',
  'upload.countOf': 'de {cap} fotos',
  'upload.countUnlimited': 'fotos, sin límite',
  'owner.title': 'Compartir con la pareja', // app: hostEvent.shareOwnerTitle
  'owner.body': 'Dale a la pareja un código de un solo uso. En sharecam.app/album ven todo el álbum y lo descargan entero: máxima resolución, por partes.', // app: hostEvent.shareOwnerBody
  'owner.cta': 'Crear un código para la pareja', // app: hostEvent.shareOwnerCta
  'owner.newCode': 'Nuevo código', // app: ownerLink.newCode
  'owner.expires': 'Caduca en {time} · un solo uso', // app: ownerLink.expiresIn
  'owner.expired': 'Este código ha caducado', // app: ownerLink.expired
  'owner.link': 'Enlace del álbum',
  'owner.foot': 'Solo la pareja debe recibir este código: desbloquea la descarga del álbum completo.', // app: ownerLink.footer
  'owner.error': 'No se pudo crear el código. Comprueba tu conexión e inténtalo de nuevo.', // app: ownerLink.error
  'wall.title': 'Muro en vivo', // app: hostEvent.wallTitle
  'wall.openBody': 'El muro está listo. Abre este enlace en el televisor, portátil o proyector del lugar: sin cables ni apps.',
  'wall.privateWarning': 'El modo privado oculta las subidas hasta que abras la galería, así que el muro queda apagado. Cambia a «Galería abierta» para usarlo.', // app: wall.privateWarning
  'await.kicker': 'Evento de fotógrafo',
  'await.title': 'Elige un paquete para obtener tu QR',
  'await.body': 'Este evento aún no tiene paquete de fotógrafo. El QR, el código y la página de subida se abren en cuanto haya un paquete activo. El nombre y la fecha están guardados.',
  'await.cta': 'Elegir un paquete',

  // expiry (D19)
  'expiry.title': 'Las fotos de «{name}» se eliminan en {n} días',
  'expiry.titleOne': 'Las fotos de «{name}» se eliminan mañana',
  'expiry.todayTitle': 'Las fotos de «{name}» se eliminan hoy',
  'expiry.body': 'El almacenamiento termina el {date}. Descarga el álbum antes: después ya no se podrá recuperar.',
  'expiry.download': 'Descargar',
  'expiry.listTitle': 'El almacenamiento termina pronto',
  'expiry.listBody': 'Después de esta fecha las fotos se eliminan y no se pueden recuperar. Descarga lo que quieras conservar.',
  'expiry.whenDays': 'en {n} días',
  'expiry.whenTomorrow': 'mañana',
  'expiry.whenToday': 'hoy',
  'expiry.icsShort': 'Recordatorio',
  'expiry.ics': 'Añadir recordatorio al calendario',
  'expiry.icsTitle': 'Descarga tus fotos de Sharecam: {name}',
  'expiry.icsBody': 'Las fotos de «{name}» se eliminan el {date}. Abre el panel del anfitrión para descargarlas.',

  // gallery
  'gallery.count': '{n} elementos · {shown} cargados',
  'gallery.filter': 'Mostrar',
  'gallery.all': 'Todas', // app: gallery.all
  'gallery.reportedN': 'Denunciadas ({n})', // app: hostEvent.reportedFilter
  'gallery.hiddenN': 'Ocultas ({n})',
  'gallery.hidden': 'Oculta',
  'gallery.reported': 'Denunciada',
  'gallery.hide': 'Ocultar a los invitados',
  'gallery.show': 'Mostrar a los invitados',
  'gallery.hiddenToast': 'Oculta para los invitados.',
  'gallery.shownToast': 'Visible de nuevo para los invitados.',
  'gallery.deleteTitle': '¿Eliminar esta foto?', // app: hostEvent.deleteTitle
  'gallery.deleteBody': 'Se quitará de la galería.', // app: hostEvent.deleteBody
  'gallery.deletedToast': 'Eliminada.',
  'gallery.more': 'Cargar más',
  'gallery.emptyTitle': 'Aún no hay fotos', // app: hostEvent.emptyTitle
  'gallery.emptyBody': 'Pon el QR en las mesas: la primera foto aparecerá aquí.',
  'gallery.emptyPro': 'Sube las fotos desde tu ordenador: los originales se guardan y los invitados ven la galería en pocos minutos.', // app: hostEvent.emptyProBody
  'gallery.noneReported': 'No hay nada denunciado entre los elementos cargados.',
  'gallery.noneHidden': 'No hay nada oculto entre los elementos cargados.',
  'gallery.viewer': 'Visor de fotos',
  'gallery.openItem': 'Abrir foto de {name}',
  'gallery.photoAlt': 'Foto de {name}',
  'gallery.unknownOwner': 'Invitado',
  'gallery.openFull': 'Abrir a tamaño completo',

  // guests
  'guests.emptyTitle': 'Aún no hay invitados', // app: guests.emptyTitle
  'guests.emptyBody': 'Todos los que se unen con el QR o el código aparecen aquí con su nombre.', // app: guests.emptyBody
  'guests.ban': 'Retirar', // app: guests.ban
  'guests.unban': 'Restaurar', // app: guests.unban
  'guests.bannedTag': 'retirado', // app: guests.bannedTag
  'guests.banTitle': '¿Retirar a {name}?', // app: guests.banTitle
  'guests.banBody': 'No podrá volver a unirse ni subir fotos. Sus fotos se quedan (puedes borrarlas de la galería).', // app: guests.banBody
  'guests.owner': 'Propietario del álbum',
  'guests.noName': 'Invitado',
  'guests.joined': 'se unió {time}',
  'guests.removedToast': 'Has retirado a {name}.',
  'guests.restoredToast': '{name} puede volver a unirse.',
  'guests.capTitle': 'Invitados de este evento',
  'guests.capBody': 'Los invitados retirados no cuentan; su plaza queda libre.',
  'guests.full': 'Límite de invitados alcanzado ({limit}). Mejora tu paquete para que entren más.', // app: guests.limitFull (adapted)

  // settings
  'settings.galleryTitle': 'Quién entra, quién ve',
  'settings.privateTitle': 'Modo privado', // app: hostEvent.privateTitle
  'settings.privateOn': 'Los invitados solo ven sus propias fotos.', // app: hostEvent.privateOn
  'settings.privateOff': 'Todos ven la galería completa.', // app: hostEvent.privateOff
  'settings.statePrivate': 'Privada', // app: hostEvent.statePrivate
  'settings.statePublic': 'Pública', // app: hostEvent.statePublic
  'settings.revealTitle': '¿Abrir la galería a todos?', // app: hostEvent.revealTitle
  'settings.revealBody': 'Los invitados verán ahora las fotos de los demás. Esto es una «revelación»: ¿seguro?', // app: hostEvent.revealBody
  'settings.revealConfirm': 'Sí, abrir', // app: hostEvent.revealConfirm
  'settings.autoRevealTitle': 'Apertura automática', // app: hostEvent.revealSchedTitle
  'settings.autoRevealOn': 'La galería se abre a todos el {time}.', // app: hostEvent.revealSchedOn
  'settings.autoRevealOff': 'Desactivado: la galería sigue siendo privada hasta que tú la abras.', // app: hostEvent.revealSchedOff
  'settings.revealPick': 'Elige la fecha y la hora', // app: hostEvent.revealPick
  'settings.pauseTitle': 'Pausar nuevas entradas', // app: hostEvent.pauseTitle
  'settings.pauseOn': 'Nadie nuevo puede entrar. Los invitados actuales siguen dentro.', // app: hostEvent.pauseOn
  'settings.pauseOff': 'Cualquiera con el QR o el código puede entrar.', // app: hostEvent.pauseOff
  'settings.statePaused': 'En pausa', // app: hostEvent.statePaused
  'settings.stateOpen': 'Abierta', // app: hostEvent.stateOpen
  'settings.downloadTitle': 'Descargas de invitados', // app: hostEvent.downloadTitle
  'settings.downloadDesc': 'Los invitados pueden guardar fotos.', // app: hostEvent.downloadDesc
  'settings.hostOnlyTitle': 'Evento de fotógrafo', // app: hostEvent.hostOnlyTitle
  'settings.hostOnlyBody': 'Solo tú subes fotos. Los invitados ven la galería, guardan fotos y encuentran las suyas con un selfi. Esto no se puede cambiar.', // app: hostEvent.hostOnlyBody
  'settings.detailsTitle': 'Detalles del evento', // app: hostEvent.detailsTitle
  'settings.name': 'Nombre',
  'settings.date': 'Fecha',
  'settings.code': 'Código',
  'settings.noCover': 'Sin foto de portada',
  'settings.coverAdd': 'Añadir foto de portada',
  'settings.coverChange': 'Cambiar portada',
  'settings.coverSaved': 'Portada guardada.',
  'settings.coverRemoved': 'Portada quitada.',
  'settings.lockedNote': 'El nombre y la fecha están bloqueados para que la pantalla coincida siempre con tus tarjetas impresas.',
  'settings.saved': 'Guardado.',
  'settings.dangerTitle': 'Zona de peligro', // app: hostEvent.dangerTitle
  'settings.dangerBody': 'Eliminar borra el evento, sus fotos y su lista de invitados para todos, incluidos tus invitados. No se puede deshacer.', // app: hostEvent.dangerBody
  'settings.deleteCta': 'Eliminar evento',
  'settings.deleteTitle': '¿Eliminar este evento?', // app: hostEvent.deleteEventTitle
  'settings.deleteBody': '«{name}» y todas sus fotos se eliminarán permanentemente.', // app: hostEvent.deleteEventBody
  'settings.deleteConfirm': 'Eliminar…', // app: hostEvent.deleteEventConfirm
  'settings.deleteTitle2': '¿Estás completamente seguro?', // app: hostEvent.deleteEventTitle2
  'settings.deleteBody2': 'Esto es permanente: no hay forma de recuperar el evento.', // app: hostEvent.deleteEventBody2
  'settings.deleted': 'Evento eliminado.',
  'settings.deletePairedNote': 'Podrás eliminar eventos cuando esta cuenta tenga su propio inicio de sesión, o desde la app.',

  // face matching (the app's versioned texts, face.* 2026-09-23 — copy verbatim)
  'face.title': 'Reconocimiento facial', // app: hostEvent.aiTitle
  'face.tabTitle': 'Encuentra tus fotos', // app: face.tabTitle
  'face.aiOn': 'Activado: los invitados pueden encontrar sus fotos con un selfi.', // app: hostEvent.aiOn
  'face.aiOff': 'Desactivado: los invitados no ven «Encuentra tus fotos».', // app: hostEvent.aiOff
  'face.notInPackage': 'El reconocimiento facial no forma parte de este paquete. Se puede añadir en la app Sharecam.',
  'face.hostConfirmTitle': '¿Activar el reconocimiento facial?', // app: face.hostConfirmTitle
  'face.hostConfirmBody': 'Tus invitados podrán encontrar sus fotos con un selfi. Es tu responsabilidad avisarles de que se usa; te damos el texto para la invitación y un cartel. No puede usarse para controlar la asistencia ni para identificar a quien no lo haya pedido.', // app: face.hostConfirmBody
  'face.hostConfirmCta': 'Activar', // app: face.hostConfirmCta
  'face.remindTitle': 'Avisa ya a tus invitados', // app: face.noticeTitle (adapted)
  'face.remindBody': 'Copia el texto de abajo en tu invitación o en el grupo de chat, e imprime el QR con su línea de aviso.',
  'face.noticeTitle': 'Avisa a tus invitados', // app: face.noticeTitle
  'face.noticeSub': 'Pega esto en tu invitación, en el grupo de chat o en una tarjeta en las mesas.', // app: face.noticeSub
  'face.noticeText': 'Las fotos de este evento se recogen en un álbum compartido. Incluye reconocimiento facial opcional para que encuentres tus propias fotos. Tú decides y puedes negarte. Detalles: sharecam.app/face-grouping', // app: face.noticeText
  'face.noticeCopy': 'Copiar el texto', // app: face.noticeCopy
  'face.noticeCopied': 'Copiado', // app: face.noticeCopied
  'face.noticePrint': 'El QR que descargas en Resumen lleva el aviso de una línea para las tarjetas impresas.',
  'face.cardNotice': 'Reconocimiento facial opcional en este álbum · sharecam.app/face-grouping', // app: face.cardNotice
  'face.regionTitle': 'No disponible en tu región', // app: face.regionTitle
  'face.regionBody': 'El reconocimiento facial aún no está disponible donde estás. Solo lo activamos donde podemos cumplir las normas locales sobre datos faciales, así que nunca te vendemos algo que tus invitados no puedan usar.', // app: face.regionBody
  'face.regionSoonTitle': 'Muy pronto donde estás', // app: face.regionSoonTitle
  'face.regionSoonBody': 'Estamos completando el registro que nos permite tratar datos faciales en tu país. Todo lo demás del álbum funciona con normalidad.', // app: face.regionSoonBody
  'face.regionUnknownTitle': 'No pudimos confirmar dónde estás', // app: face.regionUnknownTitle
  'face.regionUnknownBody': 'Esta función depende de las normas locales sobre datos faciales, así que solo la activamos cuando sabemos cuáles se aplican. Todo lo demás del álbum funciona con normalidad.', // app: face.regionUnknownBody
  'face.declTitle': 'Antes de añadirlo', // app: face.declTitle
  'face.declIntro': 'Eres el organizador de este evento, así que estas decisiones son tuyas. Al marcar la casilla confirmas:', // app: face.declIntro
  'face.decl1': 'Yo decido a quién se invita y se fotografía en este evento.', // app: face.decl1
  'face.decl2': 'Diré a mis invitados que la coincidencia facial está activada, con el texto de invitación y la tarjeta impresa de esta app.', // app: face.decl2
  'face.decl3': 'Mi evento no se celebra en los estados de Illinois, Texas ni Washington.', // app: face.decl3
  'face.decl4': 'Los datos faciales los trata AWS en Fráncfort (Alemania) y se eliminan cuando lo desactivo o cuando se borra el álbum.', // app: face.decl4
  'face.decl5': 'Soy responsable de cumplir las normas aplicables en el lugar donde se celebra mi evento.', // app: face.decl5
  'face.declAccept': 'He leído y acepto las condiciones del anfitrión', // app: face.declAccept
  'face.declRead': 'Leer las condiciones completas del anfitrión', // app: face.declRead
  'face.declError': 'No pudimos registrar tu aceptación. Comprueba tu conexión e inténtalo de nuevo.', // app: face.declError
  'decl.kicker': '{plan} · reconocimiento facial incluido',
  'decl.continue': 'Aceptar y continuar al pago',

  // ---------------------------------------------------------------- package & checkout (§3.4)
  'checkout.kicker': 'Paquetes',
  'checkout.kickerPro': 'Paquetes para fotógrafos', // app: paywall.titlePro
  'checkout.titleNew': 'Elige un paquete para tu evento', // app: paywall.title
  'checkout.titleUpgrade': 'Mejora tu paquete', // app: paywall.titleUpgrade
  'checkout.subtitle': 'Pago único: no es una suscripción. Elige el tamaño que encaje con tu lista de invitados.', // app: paywall.subtitle
  'checkout.subtitlePro': 'Pago único por evento. Subes las fotos desde tu ordenador; los invitados escanean el QR, ven el álbum y encuentran sus fotos con un selfi.', // app: paywall.subtitlePro
  'checkout.current': 'Ahora',
  'checkout.upgradeRule': 'Mejorar cuesta el precio completo del paquete mayor: la misma regla que en la app.',
  'checkout.choose': 'Elige un paquete',
  'checkout.cta': 'Pagar {price} · {plan}',
  'checkout.opening': 'Abriendo el pago seguro…',
  'checkout.paying': 'Termina el pago en la ventana de pago.',
  'checkout.sandbox': 'Sandbox · pagos de prueba',
  'checkout.footnote': 'Precios en USD, los mismos que en la app Sharecam. Paddle puede mostrar tu moneda local y los impuestos al pagar. Los pagos los procesa Paddle, nuestro revendedor autorizado (merchant of record).',
  'checkout.soonTitle': 'Comprar en la web llegará pronto',
  'checkout.soonOff': 'Todavía no se pueden comprar paquetes en la web.',
  'checkout.soonPrices': 'Estos paquetes aún no se venden en la web.',
  'checkout.soonApp': 'Mientras tanto, los paquetes se venden en la app Sharecam para iPhone; este evento aparece allí con el mismo inicio de sesión.',
  'checkout.soonAppPro': 'Mientras tanto, los paquetes para fotógrafos se venden en la app Sharecam para iPhone; este evento aparece allí con el mismo inicio de sesión.',
  'checkout.maxedTitle': '{plan} es el paquete más grande',
  'checkout.maxedBody': 'Este evento no se puede mejorar más.',
  'checkout.unavailableTitle': 'Este evento no se puede mejorar aquí',
  'checkout.unavailableBody': 'Pertenece a otra cuenta o ya no existe.',
  'checkout.codeNotPro': 'Los paquetes para fotógrafos requieren un evento creado como evento de fotógrafo. Crea un nuevo evento de fotógrafo.',
  'checkout.refundedTitle': 'El pago de este evento fue reembolsado',
  'checkout.refundedBody': 'Volver a comprar un paquete lo reactiva: vuelven las subidas, el reconocimiento facial (si está incluido) y las descargas.',
  'checkout.abandonedTitle': 'Tu evento está en Spark (gratis)',
  'checkout.abandoned': 'Tu evento está en Spark (gratis). Elige un paquete cuando quieras.',
  'checkout.closedNote': 'Has cerrado el pago. No se te ha cobrado nada.',
  'checkout.applyingTitle': 'Pago recibido',
  'checkout.applyingBody': 'Estamos activando {plan} en este evento. Esta página se actualiza sola.',
  'checkout.slowTitle': 'Pago recibido: ya casi está',
  'checkout.slowBody': 'Tu pago ha llegado. {plan} se aplicará en unos minutos; puedes salir de esta página. Si no está activo en una hora, escríbenos.',
  'checkout.doneTitle': 'Listo 🎉', // app: paywall.doneTitle
  'checkout.doneBody': 'El paquete {plan} está activo. Paddle envía el recibo a tu correo.', // app: paywall.active (+ receipt)
  'checkout.toOverview': 'Ir al evento', // app: qr.goToEvent
  'checkout.coveredTitle': 'Este evento ya tiene {plan}',
  'checkout.coveredBody': 'Si has pagado dos veces, te reembolsamos el pago de más. Dudas: {email}',
  'checkout.failedTitle': 'No se pudo aplicar tu pago',
  'checkout.failedBody': 'Te lo reembolsamos; no tienes que hacer nada. Dudas: {email}',
  'checkout.openFailedTitle': 'No se pudo abrir el pago',
  'checkout.openFailedBody': 'No se te ha cobrado nada. Inténtalo de nuevo en un momento.',
  'checkout.tooMany': 'Hoy se han abierto demasiados pagos. Inténtalo mañana o escríbenos.',
  'checkout.backToPackages': 'Volver a los paquetes',
  'checkout.contact': 'Contactar con soporte',
  'checkout.mailSlow': 'Pago web aún no aplicado',
  'checkout.mailDuplicate': 'Pagado dos veces',
  'checkout.mailFailed': 'Pago web no aplicado',
  'checkout.proIncludesTitle': 'En todos los paquetes para fotógrafos',
  'checkout.proInc1': 'Reconocimiento facial incluido, donde esté disponible', // app: paywall.featAiIncluded (adapted)
  'checkout.proInc2': 'Solo tú subes fotos; los invitados las ven', // app: paywall.featHostOnly
  'checkout.proInc3': 'Originales guardados a máxima resolución', // app: paywall.featOriginals

  // ---------------------------------------------------------------- downloads
  'downloads.zipTitle': 'Descargar el álbum',
  'downloads.zipBody': 'Todas las fotos y vídeos en un solo archivo ZIP. Los álbumes grandes tardan un minuto en prepararse.',
  'downloads.zipCta': 'Descargar ZIP', // app: download.zip
  'downloads.zipWorking': 'Comprimiendo…', // app: download.zipWorking
  'downloads.zipReady': 'Descargar ZIP ({n} elementos)',
  'downloads.displayTitle': 'Para compartir: 2048 px',
  'downloads.displayBody': 'Todo el álbum en partes ZIP de 500 fotos, a un tamaño pensado para pantallas y redes sociales.',
  'downloads.originalTitle': 'Originales: máxima resolución',
  'downloads.originalBody': 'Lo que subiste, tal cual, en partes ZIP de 150 fotos.',
  'downloads.prepare': 'Preparar descarga',
  'downloads.again': 'Preparar de nuevo',
  'downloads.preparing': 'Preparando parte {done} de {total}…',
  'downloads.part': 'Parte {n} de {of}',
  'downloads.items': '{n} fotos',
  'downloads.download': 'Descargar',
  'downloads.validity': 'Álbum completo en partes ZIP: 2048 px para compartir, originales a máxima resolución para guardar. Los enlaces duran 7 días y se pueden regenerar.', // app: ownerLink.step3Body
  'downloads.refundedTitle': 'Las descargas están desactivadas en los eventos reembolsados',
  'downloads.refunded': 'El pago de este evento fue reembolsado, así que el álbum no se puede exportar como ZIP. Volver a comprar un paquete lo reactiva.', // app: download.zipRefunded
  'downloads.buyAgain': 'Ver paquetes',
  'downloads.nothing': 'Todavía no hay nada que descargar.',
  'downloads.failed': 'No se pudo crear el ZIP.', // app: download.zipFailed
  'downloads.keepTitle': 'Guarda una copia',
  'downloads.keepBody': 'El almacenamiento termina el {date}. Descarga el álbum antes.',
  'downloads.keepBodyNoDate': 'Descarga el álbum antes de que termine su almacenamiento.',

  // ---------------------------------------------------------------- account
  'account.kicker': 'Cuenta', // app: account.title
  'account.title': 'Tu cuenta',
  'account.signins': 'Inicios de sesión',
  'account.pairedOnly': 'Este ordenador está conectado con la app Sharecam. La cuenta aún no tiene un inicio de sesión propio.',
  'account.sameAsApp': 'Tus eventos pertenecen a esta cuenta: la misma que usas en la app Sharecam.',
  'account.addAnother': 'Añadir otro inicio de sesión',
  'account.addAnotherBody': 'Una segunda forma de entrar, por si algún día pierdes el acceso a la primera.',
  'account.linked': 'Inicio de sesión añadido.',
  'account.signOutTitle': 'Cerrar sesión', // app: account.signOut
  'account.signOutBody': 'Tus eventos se quedan en tu cuenta. Vuelve a iniciar sesión cuando quieras.',
  'account.signOutPaired': 'Sin un inicio de sesión propio, este ordenador solo puede volver si lo conectas de nuevo con la app.',
  'account.deleteCta': 'Eliminar cuenta y datos', // app: account.deleteCta
  'account.deleteTitle': '¿Eliminar tu cuenta y tus datos?', // app: account.deleteTitle
  'account.deleteBody': 'Tu cuenta, todos los eventos que has creado, las fotos y las listas de invitados se eliminan de forma permanente, en todos los dispositivos. No se puede deshacer.', // app: account.deleteBody
  'account.deleteConfirm': 'Eliminar todo', // app: account.deleteConfirm
  'account.deleted': 'Tu cuenta y tus datos se han eliminado.', // app: account.deleted
  'account.deleteFailed': 'No se pudo eliminar tu cuenta. Inténtalo de nuevo.', // app: account.deleteFailed
  'account.deletePairedNote': 'Podrás eliminar la cuenta cuando tenga su propio inicio de sesión, o desde la app (Ajustes → Cuenta).',
};

export default es;
