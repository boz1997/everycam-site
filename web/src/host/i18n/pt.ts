// Sharecam host dashboard — Português (PT) (plan §3.6, D15; WP-H).
//
// Português europeu, tratamento formal na 3.ª pessoa (como a app: "Inicie", "o seu"),
// "anfitrião" = host, "pacote", "melhorar" = upgrade, "correspondência facial", "Modo privado" /
// "Galeria aberta", "mural ao vivo", "o casal"; computador emparelhado = "ligar" (como a app e a
// página de envio). Aspas «…», travessão —, reticências ….
//
// Same keys and order as en.ts (tsc fails on a missing or stale key). A `// app: <key>`
// comment marks a string copied verbatim from EC/src/i18n/locales/pt.ts (native-reviewed
// 23 Sep 2026, EC 5c05c8e; {{x}} → {x}); "(adapted)" = the app wording with the same change
// the English line makes. Every other string is new and is checked before go-live.
// face.* declaration and notice texts are versioned (declTextVersion 2026-09-23): never edit
// them here, only together with the app and the server.

import type { Dict } from './en';

const pt: Dict = {
  // ---------------------------------------------------------------- common
  'common.back': 'Voltar',
  'common.cancel': 'Cancelar', // app: common.cancel
  'common.close': 'Fechar', // app: common.close
  'common.delete': 'Eliminar', // app: common.delete
  'common.on': 'Ligado', // app: common.on
  'common.off': 'Desligado', // app: common.off
  'common.ok': 'OK',
  'common.copy': 'Copiar',
  'common.copied': 'Copiado', // app: face.noticeCopied
  'common.remove': 'Remover', // app: create.coverRemove
  'common.saving': 'A guardar…',
  'common.loading': 'A carregar…',
  'common.loadFailed': 'Não foi possível carregar esta página',
  'common.checkConnection': 'Verifique a ligação e tente novamente.',
  'common.tryAgain': 'Algo correu mal. Tente novamente.',
  'common.prev': 'Anterior',
  'common.next': 'Seguinte',

  // ---------------------------------------------------------------- page titles (browser tab)
  'title.events': 'Os seus eventos',
  'title.signin': 'Iniciar sessão',
  'title.new': 'Crie o seu evento',
  'title.account': 'Conta',

  // ---------------------------------------------------------------- shell
  'shell.tag': 'Anfitrião',
  'shell.language': 'Idioma',
  'shell.accountMenu': 'Menu da conta',
  'shell.events': 'Os seus eventos',
  'shell.account': 'Conta',
  'shell.signOut': 'Terminar sessão', // app: account.signOut
  'shell.signedInAs': 'Sessão iniciada como {who}',
  'shell.paired': 'Ligado à app',
  'shell.pairedLong': 'Este computador está ligado à app Sharecam. Ainda não tem um início de sessão próprio.',
  'shell.linkBannerTitle': 'Adicione um início de sessão para manter esta conta',
  'shell.linkBannerBody': 'Este computador está ligado à sua app Sharecam. Adicione um início de sessão com e-mail ou Google para poder voltar sem a app. Também é necessário para comprar um pacote na web.',
  'shell.linkBannerCta': 'Adicionar início de sessão',
  'nav.events': 'Os seus eventos',
  'nav.signin': 'Iniciar sessão',
  'legal.webTerms': 'Termos de compra na web',
  'legal.refund': 'Política de reembolso',
  'legal.privacy': 'Privacidade', // app: legal.privacy
  'legal.terms': 'Termos', // app: legal.terms
  'legal.support': 'Apoio', // app: legal.support
  'legacy.title': 'Ligue novamente este computador',
  'legacy.body': 'Este navegador estava ligado aos seus eventos através da antiga página de envio. Terminámos essa sessão para que a página de convidados volte a funcionar normalmente aqui. Para enviar fotos, ligue-o de novo à app Sharecam ou inicie sessão.',

  // ---------------------------------------------------------------- sign in
  'signin.kicker': 'Painel do anfitrião',
  'signin.title': 'Inicie sessão nos seus eventos',
  'signin.lead': 'Os seus eventos, convidados e fotos num só lugar, em qualquer computador ou telemóvel.',
  'signin.newTitle': 'É novo no Sharecam?',
  'signin.newCta': 'Crie o seu evento, sem precisar da app',
  'signin.appKicker': 'Já usa a app?',
  'signin.appTitle': 'A mesma conta, os mesmos eventos',
  'signin.appBody': 'Os eventos que criou na app Sharecam aparecem aqui quando inicia sessão com a mesma conta que usa na app (Definições → Conta).',
  'auth.google': 'Continuar com o Google', // app: account.continueGoogle
  'auth.apple': 'Continuar com a Apple', // app: account.continueApple
  'auth.soon': 'Em breve',
  'auth.appleSoon': 'Iniciou sessão com a Apple na app? O início de sessão com a Apple na web chega em breve.',
  'auth.orEmail': 'ou com e-mail',
  'auth.email': 'E-mail',
  'auth.password': 'Palavra-passe',
  'auth.passwordHint': 'Pelo menos 6 caracteres.',
  'auth.signinCta': 'Iniciar sessão',
  'auth.createCta': 'Criar conta',
  'auth.resetCta': 'Enviar link de reposição',
  'auth.resetTitle': 'Repor a palavra-passe',
  'auth.resetSent': 'Se {email} tiver uma conta, enviámos um link para repor a palavra-passe. Consulte a sua caixa de entrada.',
  'auth.toCreate': 'É novo por aqui? Crie uma conta',
  'auth.toReset': 'Esqueceu-se da palavra-passe?',
  'auth.toSignin': 'Voltar ao início de sessão',
  'auth.haveAccount': 'Já tem conta? Inicie sessão',
  'auth.createWithEmail': 'Criar conta com este e-mail',
  'auth.errWrong': 'E-mail ou palavra-passe errados.',
  'auth.errEmailTaken': 'Este e-mail já tem uma conta. Inicie sessão.',
  'auth.errWeak': 'Escolha uma palavra-passe com pelo menos 6 caracteres.',
  'auth.errEmail': 'Introduza um endereço de e-mail válido.',
  'auth.errPopupBlocked': 'O navegador bloqueou a janela de início de sessão. Permita pop-ups para este site e tente novamente.',
  'auth.errProviderOff': 'Este início de sessão ainda não está disponível neste site. Use o e-mail.',
  'auth.errOffline': 'Sem ligação. Verifique a Internet e tente novamente.',
  'auth.errTooMany': 'Demasiadas tentativas. Aguarde um minuto e tente novamente.',
  'auth.errDisabled': 'Esta conta foi desativada. Escreva-nos a partir da página de apoio.',
  'auth.errRecent': 'Por segurança, termine sessão e inicie-a de novo; depois repita este passo.',
  'auth.errAlreadyLinked': 'Este início de sessão já está adicionado à sua conta.',
  'auth.errGeneric': 'Não foi possível iniciar sessão. Tente de novo.', // app: account.errorGeneric

  // ---------------------------------------------------------------- pair with the app
  'pair.kicker': 'Para fotógrafos',
  'pair.title': 'Ligar à app Sharecam',
  'pair.body': 'Ainda não tem início de sessão na web? Ligue este computador à conta da sua app Sharecam. Funciona para eventos de fotógrafo.',
  'pair.open': 'Ligar à app',
  'pair.qrTitle': 'Leia este código com a app',
  'pair.step1': 'Abra o seu evento de fotógrafo na app Sharecam.',
  'pair.step2': 'Toque em «Enviar do computador» e depois em «Ler o QR do computador».',
  'pair.step3': 'Confirme no telemóvel. Esta página inicia sessão sozinha.',
  'pair.qrAlt': 'Código de ligação para a app Sharecam',
  'pair.qrFoot': 'O código renova-se a cada poucos minutos.',
  'pair.qrError': 'Não foi possível criar o código. Use antes o código de 6 caracteres abaixo.',
  'pair.connecting': 'A ligar…',
  'pair.orCode': 'ou introduza o código da app',
  'pair.codeLabel': 'Código da app',
  'pair.codeCta': 'Ligar',
  'pair.foot': 'O código inicia sessão neste computador com a sua conta. Use-o apenas num computador de confiança.', // app: uploadLink.footer (adapted)
  'pair.errNotFound': 'Esse código não é válido. Verifique na app.',
  'pair.errExpired': 'Esse código expirou. Gere um novo na app.',
  'pair.errUsed': 'Esse código já foi usado. Gere um novo na app.',
  'pair.errGeneric': 'Não foi possível ligar este computador. Verifique a ligação e tente novamente.',
  'pair.phoneNote': 'A ligação à app é para computadores. Neste telemóvel, inicie sessão.',

  // ---------------------------------------------------------------- link a sign-in (paired accounts)
  'link.kicker': 'Só mais um passo',
  'link.title': 'Adicione um início de sessão a esta conta',
  'link.lead': 'Os seus eventos ficam onde estão. Depois pode iniciar sessão aqui com ele, e a app continua a funcionar como antes.',
  'link.buyLead': 'Para comprar na web precisa de uma conta à qual possa voltar: os recibos vão para um e-mail e o pacote pertence a este evento durante todo o armazenamento. Adicione primeiro um início de sessão; os seus eventos ficam onde estão.',
  'link.google': 'Adicionar início de sessão com o Google',
  'link.apple': 'Adicionar início de sessão com a Apple',
  'link.emailCta': 'Adicionar início de sessão com e-mail',
  'link.inUseTitle': 'Este início de sessão já tem uma conta Sharecam',
  'link.inUseBody': 'Inicie sessão com ele na app (Definições → Conta); a app transfere os seus eventos para lá. Depois inicie sessão aqui com a mesma conta.',
  'link.inUseBack': 'Tentar outro início de sessão',

  // ---------------------------------------------------------------- event list
  'list.kicker': 'Painel do anfitrião',
  'list.title': 'Os seus eventos',
  'list.lead': 'Tudo o que organiza, na web e na app.',
  'list.leadEmpty': 'Crie um evento, partilhe o QR e reúna todas as fotos.', // app: welcome.hostDesc
  'list.create': 'Crie o seu evento',
  'list.createPro': 'Evento de fotógrafo',
  'list.groupPro': 'Eventos de fotógrafo',
  'list.groupEvents': 'Eventos',
  'list.groupAll': 'Eventos',
  'list.count': '{n} no total',
  'list.guestsShort': '{v} convidados',
  'list.photosShort': '{v} fotos',
  'list.keptUntil': 'Guardado até {date}',
  'list.deletion': 'Guardado até',
  'list.waiting': 'Ainda sem pacote — o QR abre quando houver um ativo',
  'list.emptyTitle': 'Ainda sem eventos', // app: dashboard.emptyTitle
  'list.emptyBody': 'Pronto em 60 segundos: nome, data, privacidade — o seu QR pronto a imprimir. Criou eventos na app? Inicie sessão aqui com a mesma conta que usa lá.', // app: dashboard.emptyBody (+ one sentence)
  'list.findHint': 'Não encontra um evento que criou na app? Inicie sessão com a mesma conta que usa lá (Definições → Conta). Os eventos de uma app sem sessão iniciada ficam nesse telemóvel até iniciar sessão lá.',

  // ---------------------------------------------------------------- stats, units, plans
  'stat.guests': 'Convidados',
  'stat.photos': 'Fotos',
  'stat.videos': 'Vídeos',
  'unit.days': '{n} dias',
  'unit.month': '1 mês',
  'unit.months': '{n} meses',
  'unit.year': '1 ano',
  'unit.years': '{n} anos',
  'unit.unlimited': 'Sem limite',
  'unit.unlimitedShort': 'sem limite',
  'unit.notIncluded': 'Não incluído',
  'plan.free': 'Grátis', // app: paywall.free
  'plan.perEvent': 'por evento', // app: paywall.perEvent
  'plan.popular': 'Mais escolhido', // app: plans.wedding.badge
  'plan.storage': 'Armazenamento',
  'plan.refunded': 'Reembolsado',
  'plan.awaiting': 'Escolher pacote',
  'plan.webSoon': 'Em breve na web',
  'plan.none': 'Ainda sem pacote',
  'plan.wallIncluded': 'Inclui o mural ao vivo',
  'plan.awaitingBody': 'Escolha um pacote para abrir o QR e os carregamentos.',
  'plan.videosFromApp': 'Os vídeos são carregados a partir da app para iPhone.',

  // ---------------------------------------------------------------- create
  'new.kicker': 'Novo evento',
  'new.kickerPro': 'Novo evento de fotógrafo',
  'new.title': 'Crie o seu evento',
  'new.titlePro': 'Crie um evento de fotógrafo',
  'new.lead': 'Dê-lhe um nome, decida quem vê as fotos e escolha um pacote. Todos os eventos começam grátis com o Spark.',
  'new.leadPro': 'Envia as fotos a partir do computador e os originais ficam guardados. Os convidados leem o QR, veem o álbum e encontram as suas fotos com uma selfie.',
  'new.tierLabel': 'Tipo de evento',
  'new.tierEvents': 'Eventos',
  'new.tierPro': 'Fotógrafos',
  'new.details': 'Detalhes do evento', // app: create.step1Title
  'new.name': 'Dê um nome ao seu evento', // app: create.titleName
  'new.namePlaceholder': 'O casamento da Ana e do Miguel', // app: create.namePlaceholder
  'new.nameRequired': 'Dê um nome ao evento.',
  'new.date': 'Data do evento (opcional)', // app: create.dateLabel
  'new.dateHint': 'O armazenamento começa neste dia (ou hoje, se deixar em branco).',
  'new.noDateWarn': 'Sem data, o armazenamento começa hoje e termina a {date}. Adicione a data do evento: não pode ser adicionada depois.',
  'new.who': 'Quem vê as fotos?', // app: create.titleMode
  'new.modeHint': 'Pode mudar isto mais tarde nas Definições.', // app: create.modeHint
  'new.cover': 'Foto de capa (opcional)',
  'new.coverAdd': 'Adicionar foto de capa',
  'new.coverChange': 'Alterar',
  'new.locked': 'O nome e a data não podem ser alterados depois (a mesma regra da app).',
  'new.package': 'Pacote',
  'new.consumerSoon': 'Os pacotes pagos chegam em breve à web. Comece já grátis com o Spark e melhore mais tarde, aqui ou na app.',
  'new.proSoonTitle': 'Os pacotes para fotógrafos chegam em breve à web',
  'new.proSoonBody': 'Os pacotes para fotógrafos chegam à web e à app Sharecam para iPhone com a próxima atualização. Os eventos que criar agora mantêm o nome e a data.',
  'new.proSoonBodyApp': 'Até lá, são vendidos na app Sharecam para iPhone. Os eventos que criar lá aparecem aqui com o mesmo início de sessão.',
  'new.proRegionLater': 'Depois de iniciar sessão, verificamos se a correspondência facial está disponível na sua região.',
  'new.proNextDecl': 'A seguir: uma breve declaração do organizador para a correspondência facial.',
  'new.ctaFree': 'Criar evento',
  'new.ctaPaid': 'Criar e pagar · {plan} {price}',
  'new.created': 'Evento criado.',
  'new.createFailed': 'Não foi possível criar o evento. Verifique a ligação e tente novamente.',
  'new.backToForm': 'Voltar ao formulário',
  'new.stepAccount': 'Quase pronto',
  'new.accountTitle': 'Guarde o seu evento numa conta',
  'new.accountLead': 'O seu evento precisa de uma conta à qual possa voltar. Se já inicia sessão na app, use o mesmo início de sessão.',
  'new.summary': 'O seu evento',
  'mode.openTitle': 'Galeria aberta', // app: create.openTitle
  'mode.openDesc': 'Todos veem o que é carregado e podem pôr gosto. Um álbum partilhado ao vivo.', // app: create.openDesc
  'mode.privateTitle': 'Modo privado', // app: create.privateTitle
  'mode.privateDesc': 'Só o anfitrião vê tudo; os convidados veem apenas o que carregaram. Perfeito para um álbum surpresa.', // app: create.privateDesc

  // ---------------------------------------------------------------- event page
  'event.kicker': 'Evento',
  'event.kickerPro': 'Evento de fotógrafo', // app: hostEvent.hostOnlyTitle
  'event.noDate': 'Sem data', // app: hostEvent.noDate
  'event.codeLine': 'Código {code}',
  'event.goneTitle': 'Este evento já não está disponível', // app: eventGone.title
  'event.goneBody': 'Pode ter sido eliminado ou o período de armazenamento terminou.', // app: eventGone.body
  'event.notYoursTitle': 'Este evento pertence a outra conta',
  'event.notYoursBody': 'Inicie sessão com a conta que o criou — a mesma que usa na app.',
  'tab.label': 'Secções do evento',
  'tab.overview': 'Resumo',
  'tab.gallery': 'Galeria',
  'tab.guests': 'Convidados', // app: hostEvent.tabGuests
  'tab.settings': 'Definições', // app: hostEvent.tabSettings
  'tab.plan': 'Pacote', // app: hostEvent.planTitle
  'tab.downloads': 'Descarregamentos',

  // overview
  'overview.createdTitle': 'Evento criado!', // app: qr.createdTitle
  'overview.createdBody': 'Partilhe o código QR com os seus convidados — cada foto chega à sua galeria.', // app: qr.createdSubtitle
  'overview.createdBodyPro': 'Envie as suas fotos a partir deste computador. Os convidados leem o QR para ver o álbum e encontrar-se.',
  'overview.stats': 'Até agora',
  'overview.statsPro': 'No álbum',
  'overview.package': 'Pacote', // app: hostEvent.planTitle
  'overview.keptUntil': 'Guardado até',
  'overview.face': 'Correspondência facial', // app: hostEvent.aiTitle
  'overview.faceNot': 'Não incluída',
  'overview.wall': 'Mural ao vivo', // app: hostEvent.wallTitle
  'overview.included': 'Incluído',
  'overview.changePackage': 'Mudar de pacote',
  'overview.refundedNote': 'O pagamento deste evento foi reembolsado. O álbum mantém-se até terminar o armazenamento; comprar um pacote novamente reativa-o.',
  'overview.privateLine': 'Privado: os convidados só veem as suas próprias fotos. Abra a galeria em Definições.',
  'qr.kicker': 'Convite',
  'qr.title': 'Os convidados entram num passo', // app: qr.title
  'qr.body': 'Coloque o QR nas mesas ou envie o link. Os convidados escrevem o nome e partilham a partir do navegador do telemóvel — sem app, sem conta.',
  'qr.titlePro': 'O QR dos convidados',
  'qr.bodyPro': 'Os convidados leem-no para ver o álbum, guardar fotos e encontrar-se com uma selfie. Só o fotógrafo envia fotos.',
  'qr.codeLabel': 'Código do evento', // app: qr.codeLabel
  'qr.linkLabel': 'Link para convidados',
  'qr.alt': 'Código QR do evento {code}',
  'qr.png': 'Descarregar QR (PNG)',
  'qr.share': 'Partilhar convite', // app: qr.share
  'qr.shareText': 'Entre no álbum de fotos «{name}» (código {code})',
  'qr.faceLine': 'A correspondência facial está ligada: o QR impresso leva o aviso de uma linha para os convidados.',
  'upload.kicker': 'Envio',
  'upload.title': 'Enviar do seu computador', // app: uploadLink.title
  'upload.body': 'Arraste uma pasta inteira do computador. Os originais ficam em resolução máxima; os convidados veem pré-visualizações leves.', // app: uploadLink.subtitle
  'upload.cta': 'Enviar originais',
  'upload.countOf': 'de {cap} fotos',
  'upload.countUnlimited': 'fotos, sem limite',
  'owner.title': 'Partilhar com o casal', // app: hostEvent.shareOwnerTitle
  'owner.body': 'Dê ao casal um código de uso único. Em sharecam.app/album, veem o álbum completo e descarregam tudo — em resolução máxima, por partes.', // app: hostEvent.shareOwnerBody
  'owner.cta': 'Criar um código para o casal', // app: hostEvent.shareOwnerCta
  'owner.newCode': 'Novo código', // app: ownerLink.newCode
  'owner.expires': 'Expira em {time} · uso único', // app: ownerLink.expiresIn
  'owner.expired': 'Este código expirou', // app: ownerLink.expired
  'owner.link': 'Link do álbum',
  'owner.foot': 'Só o casal deve receber este código: permite descarregar o álbum completo.', // app: ownerLink.footer
  'owner.error': 'Não foi possível criar um código. Verifique a ligação e tente novamente.', // app: ownerLink.error
  'wall.title': 'Mural ao vivo', // app: hostEvent.wallTitle
  'wall.openBody': 'O mural está ativo. Abra este link na TV, portátil ou projetor do espaço — sem cabos nem aplicações.',
  'wall.privateWarning': 'No modo privado, os carregamentos ficam ocultos até os revelar, por isso o mural fica desligado. Mude para «Galeria aberta» para o usar.', // app: wall.privateWarning
  'await.kicker': 'Evento de fotógrafo',
  'await.title': 'Escolha um pacote para obter o seu QR',
  'await.body': 'Este evento ainda não tem pacote de fotógrafo. O QR, o código e a página de envio abrem assim que houver um pacote ativo. O nome e a data estão guardados.',
  'await.cta': 'Escolher pacote',

  // expiry (D19)
  'expiry.title': 'As fotos de «{name}» são eliminadas daqui a {n} dias',
  'expiry.titleOne': 'As fotos de «{name}» são eliminadas amanhã',
  'expiry.todayTitle': 'As fotos de «{name}» são eliminadas hoje',
  'expiry.body': 'O armazenamento termina a {date}. Descarregue o álbum antes disso — depois não pode ser recuperado.',
  'expiry.refundedBody': 'O armazenamento termina a {date}. Os descarregamentos estão desativados porque o pagamento foi reembolsado. Comprar um pacote de novo volta a ativá-los.',
  'expiry.download': 'Descarregar',
  'expiry.listTitle': 'O armazenamento termina em breve',
  'expiry.listBody': 'Depois desta data as fotos são eliminadas e não podem ser recuperadas. Descarregue o que quer guardar.',
  'expiry.listBodyRefunded': 'Depois desta data as fotos são eliminadas e não podem ser recuperadas. Nos eventos reembolsados os descarregamentos estão desativados; comprar um pacote de novo volta a ativá-los.',
  'expiry.keepLonger': 'Guardar mais tempo: mudar de pacote',
  'expiry.whenDays': 'daqui a {n} dias',
  'expiry.whenTomorrow': 'amanhã',
  'expiry.whenToday': 'hoje',
  'expiry.icsShort': 'Lembrete',
  'expiry.ics': 'Adicionar lembrete ao calendário',
  'expiry.icsTitle': 'Descarregue as suas fotos Sharecam: {name}',
  'expiry.icsBody': 'As fotos de «{name}» são eliminadas a {date}. Abra o painel do anfitrião para as descarregar.',

  // gallery
  'gallery.count': '{n} itens · {shown} carregados',
  'gallery.filter': 'Mostrar',
  'gallery.all': 'Todas', // app: gallery.all
  'gallery.reportedN': 'Denunciadas ({n})', // app: hostEvent.reportedFilter
  'gallery.hiddenN': 'Ocultas ({n})',
  'gallery.hidden': 'Oculta',
  'gallery.reported': 'Denunciada',
  'gallery.hide': 'Ocultar aos convidados',
  'gallery.show': 'Mostrar aos convidados',
  'gallery.hiddenToast': 'Oculta para os convidados.',
  'gallery.shownToast': 'Visível de novo para os convidados.',
  'gallery.deleteTitle': 'Eliminar esta foto?', // app: hostEvent.deleteTitle
  'gallery.deleteBody': 'Será removida da galeria.', // app: hostEvent.deleteBody
  'gallery.deletedToast': 'Eliminada.',
  'gallery.more': 'Carregar mais',
  'gallery.emptyTitle': 'Ainda sem fotos', // app: hostEvent.emptyTitle
  'gallery.emptyBody': 'Coloque o QR nas mesas — a primeira foto aparece aqui.',
  'gallery.emptyPro': 'Envie as fotos a partir do computador: os originais ficam guardados e os convidados veem a galeria em poucos minutos.', // app: hostEvent.emptyProBody
  'gallery.noneReported': 'Nada denunciado entre os itens carregados.',
  'gallery.noneHidden': 'Nada oculto entre os itens carregados.',
  'gallery.viewer': 'Visualizador de fotos',
  'gallery.openItem': 'Abrir foto de {name}',
  'gallery.photoAlt': 'Foto de {name}',
  'gallery.unknownOwner': 'Convidado',
  'gallery.openFull': 'Abrir em tamanho real',

  // guests
  'guests.emptyTitle': 'Ainda sem convidados', // app: guests.emptyTitle
  'guests.emptyBody': 'Quem entra com o QR ou o código aparece aqui, com o seu nome.', // app: guests.emptyBody
  'guests.ban': 'Remover', // app: guests.ban
  'guests.unban': 'Repor', // app: guests.unban
  'guests.bannedTag': 'removido', // app: guests.bannedTag
  'guests.banTitle': 'Remover {name}?', // app: guests.banTitle
  'guests.banBody': 'Esta pessoa não poderá voltar a entrar nem carregar fotos. As fotos dela ficam (pode eliminá-las na galeria).', // app: guests.banBody
  'guests.owner': 'Dono do álbum',
  'guests.noName': 'Convidado',
  'guests.joined': 'entrou {time}',
  'guests.removedToast': 'Removeu {name} do evento.',
  'guests.restoredToast': '{name} pode voltar a entrar.',
  'guests.capTitle': 'Convidados deste evento',
  'guests.capBody': 'Os convidados removidos não contam; o lugar deles fica livre.',
  'guests.full': 'Limite de convidados atingido ({limit}). Melhore o pacote para deixar entrar mais pessoas.', // app: guests.limitFull (adapted)

  // settings
  'settings.galleryTitle': 'Quem entra, quem vê',
  'settings.privateTitle': 'Modo privado', // app: hostEvent.privateTitle
  'settings.privateOn': 'Os convidados só veem as suas próprias fotos.', // app: hostEvent.privateOn
  'settings.privateOff': 'Todos veem a galeria completa.', // app: hostEvent.privateOff
  'settings.statePrivate': 'Privada', // app: hostEvent.statePrivate
  'settings.statePublic': 'Pública', // app: hostEvent.statePublic
  'settings.revealTitle': 'Abrir a galeria a todos?', // app: hostEvent.revealTitle
  'settings.revealBody': 'Os convidados passarão a ver as fotos uns dos outros. Isto é uma «revelação» — tem a certeza?', // app: hostEvent.revealBody
  'settings.revealConfirm': 'Sim, abrir', // app: hostEvent.revealConfirm
  'settings.autoRevealTitle': 'Abertura automática', // app: hostEvent.revealSchedTitle
  'settings.autoRevealOn': 'A galeria abre para todos a {time}.', // app: hostEvent.revealSchedOn
  'settings.autoRevealOff': 'Desligado: a galeria fica privada até a abrir manualmente.', // app: hostEvent.revealSchedOff
  'settings.revealPick': 'Escolha a data e a hora', // app: hostEvent.revealPick
  'settings.pauseTitle': 'Pausar novas entradas', // app: hostEvent.pauseTitle
  'settings.pauseOn': 'Ninguém novo pode entrar. Os convidados atuais ficam.', // app: hostEvent.pauseOn
  'settings.pauseOff': 'Qualquer pessoa com o QR ou o código pode entrar.', // app: hostEvent.pauseOff
  'settings.statePaused': 'Em pausa', // app: hostEvent.statePaused
  'settings.stateOpen': 'Aberta', // app: hostEvent.stateOpen
  'settings.downloadTitle': 'Descarregamentos dos convidados', // app: hostEvent.downloadTitle
  'settings.downloadDesc': 'Os convidados podem guardar fotos.', // app: hostEvent.downloadDesc
  'settings.hostOnlyTitle': 'Evento de fotógrafo', // app: hostEvent.hostOnlyTitle
  'settings.hostOnlyBody': 'Só o fotógrafo envia fotos. Os convidados veem a galeria, guardam fotos e encontram as suas com uma selfie. Isto não pode ser alterado.', // app: hostEvent.hostOnlyBody
  'settings.detailsTitle': 'Detalhes do evento', // app: hostEvent.detailsTitle
  'settings.name': 'Nome',
  'settings.date': 'Data',
  'settings.code': 'Código',
  'settings.noCover': 'Sem foto de capa',
  'settings.coverAdd': 'Adicionar foto de capa',
  'settings.coverChange': 'Alterar capa',
  'settings.coverSaved': 'Capa guardada.',
  'settings.coverRemoved': 'Capa removida.',
  'settings.lockedNote': 'O nome e a data estão bloqueados, tal como na app.',
  'settings.saved': 'Guardado.',
  'settings.dangerTitle': 'Zona de perigo', // app: hostEvent.dangerTitle
  'settings.dangerBody': 'Ao eliminar, o evento, as fotos e a lista de convidados desaparecem para todos, incluindo os seus convidados. Esta ação é irreversível.', // app: hostEvent.dangerBody
  'settings.deleteCta': 'Eliminar evento',
  'settings.deleteTitle': 'Eliminar este evento?', // app: hostEvent.deleteEventTitle
  'settings.deleteBody': '«{name}» e todas as fotos do evento serão eliminados definitivamente.', // app: hostEvent.deleteEventBody
  'settings.deleteConfirm': 'Eliminar…', // app: hostEvent.deleteEventConfirm
  'settings.deleteTitle2': 'Tem a certeza absoluta?', // app: hostEvent.deleteEventTitle2
  'settings.deleteBody2': 'Isto é definitivo — não há forma de recuperar o evento.', // app: hostEvent.deleteEventBody2
  'settings.deleted': 'Evento eliminado.',
  'settings.deletePairedNote': 'Para eliminar este evento, inicie sessão neste computador com o próprio início de sessão da conta (não pela ligação à app) ou elimine-o na app.',

  // face matching (the app's versioned texts, face.* 2026-09-23 — copy verbatim)
  'face.title': 'Correspondência facial', // app: hostEvent.aiTitle
  'face.tabTitle': 'Encontre as suas fotos', // app: face.tabTitle
  'face.aiOn': 'Ligado: os convidados encontram as suas fotos pelo rosto.', // app: hostEvent.aiOn
  'face.aiOff': 'Desligado: a correspondência facial fica oculta para os convidados.', // app: hostEvent.aiOff
  'face.notInPackage': 'A correspondência facial não faz parte deste pacote. Pode ser adicionada na app Sharecam.',
  'face.hostConfirmTitle': 'Ativar a correspondência facial?', // app: face.hostConfirmTitle
  'face.hostConfirmBody': 'Os seus convidados poderão então usar uma selfie para encontrar as fotos em que aparecem. Cabe-lhe avisá-los de que está em uso — damos-lhe o texto para o convite e um cartaz. Não pode ser usada para controlar presenças nem para identificar quem não pediu para ser identificado.', // app: face.hostConfirmBody
  'face.hostConfirmCta': 'Ativar', // app: face.hostConfirmCta
  'face.remindTitle': 'Avise já os seus convidados', // app: face.noticeTitle (adapted)
  'face.remindBody': 'Copie o texto abaixo para o convite ou para o grupo de conversa e imprima o QR com a linha de aviso.',
  'face.noticeTitle': 'Avise os seus convidados', // app: face.noticeTitle
  'face.noticeSub': 'Cole isto no convite, no grupo de conversa ou num cartão nas mesas.', // app: face.noticeSub
  'face.noticeText': 'As fotos deste evento são reunidas num álbum partilhado. Inclui correspondência facial opcional para encontrar as suas próprias fotos. A escolha é sua e pode recusar. Detalhes: sharecam.app/face-grouping', // app: face.noticeText
  'face.noticeCopy': 'Copiar o texto', // app: face.noticeCopy
  'face.noticeCopied': 'Copiado', // app: face.noticeCopied
  'face.noticePrint': 'O QR que descarrega no Resumo leva o aviso de uma linha para os cartões impressos.',
  'face.cardNotice': 'Correspondência facial opcional neste álbum · sharecam.app/face-grouping', // app: face.cardNotice
  'face.regionTitle': 'Indisponível na sua região', // app: face.regionTitle
  'face.regionBody': 'A correspondência facial ainda não está disponível na sua região. Só a disponibilizamos onde conseguimos cumprir as regras locais sobre dados faciais, por isso nunca lhe vendemos algo que os seus convidados não possam usar.', // app: face.regionBody
  'face.regionSoonTitle': 'Em breve na sua região', // app: face.regionSoonTitle
  'face.regionSoonBody': 'Estamos a concluir o registo que nos permite tratar dados faciais no seu país. Tudo o resto no álbum funciona normalmente.', // app: face.regionSoonBody
  'face.regionUnknownTitle': 'Não foi possível confirmar a sua localização', // app: face.regionUnknownTitle
  'face.regionUnknownBody': 'Esta funcionalidade depende das regras locais sobre dados faciais, por isso só a ativamos quando sabemos quais se aplicam. Tudo o resto no álbum funciona normalmente.', // app: face.regionUnknownBody
  'face.declTitle': 'Antes de adicionar', // app: face.declTitle
  'face.declTitleWeb': 'Correspondência facial: a sua declaração de organizador',
  'face.declIntro': 'É o organizador deste evento, portanto estas decisões são suas. Ao marcar a caixa, confirma:', // app: face.declIntro
  'face.decl1': 'Eu decido quem é convidado e fotografado neste evento.', // app: face.decl1
  'face.decl2': 'Vou informar os meus convidados de que a correspondência facial está ativa, com o texto do convite e o cartão impresso desta app.', // app: face.decl2
  'face.decl3': 'O meu evento não acontece no Illinois, no Texas nem no estado de Washington.', // app: face.decl3
  'face.decl4': 'Os dados faciais são tratados pela AWS em Frankfurt (Alemanha) e eliminados quando eu desativo a função ou o álbum é apagado.', // app: face.decl4
  'face.decl5': 'Sou responsável por cumprir as regras aplicáveis no local do meu evento.', // app: face.decl5
  'face.declAccept': 'Li e aceito os termos do organizador', // app: face.declAccept
  'face.declRead': 'Ler os termos completos do organizador', // app: face.declRead
  'face.declError': 'Não conseguimos registar a sua aceitação. Verifique a ligação e tente de novo.', // app: face.declError
  'decl.kicker': '{plan} · correspondência facial incluída',
  'decl.continue': 'Aceitar e continuar para o pagamento',

  // ---------------------------------------------------------------- package & checkout (§3.4)
  'checkout.kicker': 'Pacotes',
  'checkout.kickerPro': 'Pacotes para fotógrafos', // app: paywall.titlePro
  'checkout.titleNew': 'Escolha um pacote para o seu evento', // app: paywall.title
  'checkout.titleUpgrade': 'Melhore o seu pacote', // app: paywall.titleUpgrade
  'checkout.titleInfo': 'O que inclui cada pacote',
  'checkout.subtitle': 'Pagamento único — não é uma subscrição. Escolha o tamanho certo para a sua lista de convidados.', // app: paywall.subtitle
  'checkout.subtitlePro': 'Pagamento único por evento. O fotógrafo envia as fotos a partir do computador; os convidados leem o QR, veem o álbum e encontram as suas fotos com uma selfie.', // app: paywall.subtitlePro
  'checkout.current': 'Agora',
  'checkout.upgradeRule': 'Melhorar custa o preço total do pacote maior — a mesma regra da app.',
  'checkout.choose': 'Escolher pacote',
  'checkout.cta': 'Pagar {price} · {plan}',
  'checkout.opening': 'A abrir o pagamento seguro…',
  'checkout.paying': 'Conclua o pagamento na janela de pagamento.',
  'checkout.sandbox': 'Sandbox · pagamentos de teste',
  'checkout.footnote': 'Preços em USD (o mesmo preço de tabela da App Store nos EUA). Na app, a Apple cobra na sua moeda local; na web, a Paddle pode mostrar a sua moeda local e os impostos no pagamento. Os pagamentos são processados pela Paddle, o nosso revendedor oficial (merchant of record).',
  'checkout.soonTitle': 'Comprar na web chega em breve',
  'checkout.soonOff': 'Ainda não é possível comprar pacotes na web.',
  'checkout.soonPrices': 'Estes pacotes ainda não são vendidos na web.',
  'checkout.soonApp': 'Até lá, os pacotes são vendidos na app Sharecam para iPhone — este evento aparece lá com o mesmo início de sessão.',
  'checkout.soonAppPro': 'Os pacotes para fotógrafos chegam à web e à app Sharecam para iPhone com a próxima atualização. Este evento mantém o nome e a data.',
  'checkout.soonAppProLive': 'Até lá, os pacotes para fotógrafos são vendidos na app Sharecam para iPhone — este evento aparece lá com o mesmo início de sessão.',
  'checkout.maxedTitle': '{plan} é o maior pacote',
  'checkout.maxedBody': 'Não há nenhum pacote acima para este evento.',
  'checkout.unavailableTitle': 'Este evento não pode ser melhorado aqui',
  'checkout.unavailableBody': 'Pertence a outra conta ou já não existe.',
  'checkout.codeNotPro': 'Os pacotes para fotógrafos exigem um evento criado como evento de fotógrafo. Crie antes um novo evento de fotógrafo.',
  'checkout.refundedTitle': 'O pagamento deste evento foi reembolsado',
  'checkout.refundedBody': 'Comprar um pacote novamente reativa-o: voltam os carregamentos, a correspondência facial (se incluída) e os descarregamentos.',
  'checkout.abandonedTitle': 'O seu evento está no Spark (grátis)',
  'checkout.abandoned': 'Nada foi cobrado. Escolha um pacote quando quiser: o seu QR já funciona no Spark.',
  'checkout.closedNote': 'O pagamento foi fechado. Não foi feita nenhuma cobrança.',
  'checkout.applyingTitle': 'Pagamento recebido',
  'checkout.applyingBody': 'Estamos a ativar o {plan} neste evento. Esta página atualiza-se sozinha.',
  'checkout.slowTitle': 'Pagamento recebido — quase pronto',
  'checkout.slowBody': 'O seu pagamento chegou. O {plan} fica ativo dentro de minutos; pode sair desta página. Se não estiver ativo dentro de uma hora, escreva-nos.',
  'checkout.doneTitle': 'Pronto 🎉', // app: paywall.doneTitle
  'checkout.doneBody': 'O pacote {plan} está ativo. A Paddle envia o recibo para o seu e-mail.', // app: paywall.active (+ receipt)
  'checkout.toOverview': 'Ir para o evento', // app: qr.goToEvent
  'checkout.coveredTitle': 'Este evento já tem o {plan}',
  'checkout.coveredBody': 'Se pagou duas vezes, reembolsamos o pagamento a mais. Dúvidas: {email}',
  'checkout.failedTitle': 'Não foi possível aplicar o seu pagamento',
  'checkout.failedBody': 'Vamos reembolsá-lo — não precisa de fazer nada. Dúvidas: {email}',
  'checkout.openFailedTitle': 'Não foi possível abrir o pagamento',
  'checkout.openFailedBody': 'Não foi feita nenhuma cobrança. Tente novamente daqui a pouco.',
  'checkout.tooMany': 'Foram abertos demasiados pagamentos hoje. Tente amanhã ou escreva-nos.',
  'checkout.backToPackages': 'Voltar aos pacotes',
  'checkout.contact': 'Contactar o apoio',
  'checkout.mailSlow': 'Pagamento web ainda não aplicado',
  'checkout.mailDuplicate': 'Pago duas vezes',
  'checkout.mailFailed': 'Pagamento web não aplicado',
  'checkout.proIncludesTitle': 'Em todos os pacotes para fotógrafos:',
  'checkout.proInc1': 'Correspondência facial incluída, onde disponível', // app: paywall.featAiIncluded (adapted)
  'checkout.proInc2': 'Só o fotógrafo envia — os convidados veem', // app: paywall.featHostOnly
  'checkout.proInc3': 'Originais guardados em resolução máxima', // app: paywall.featOriginals

  // ---------------------------------------------------------------- downloads
  'downloads.zipTitle': 'Descarregar o álbum',
  'downloads.zipBody': 'Todas as fotos e vídeos num único ficheiro ZIP. Os álbuns grandes demoram um minuto a preparar.',
  'downloads.zipCta': 'Descarregar ZIP', // app: download.zip
  'downloads.zipWorking': 'A comprimir…', // app: download.zipWorking
  'downloads.zipReady': 'Descarregar ZIP ({n} itens)',
  'downloads.displayTitle': 'Para partilhar — 2048 px',
  'downloads.displayBody': 'O álbum completo em partes ZIP de 500 fotos, com tamanho para ecrãs e redes sociais.',
  'downloads.originalTitle': 'Originais — resolução máxima',
  'downloads.originalBody': 'O que enviou, tal como estava, em partes ZIP de 150 fotos.',
  'downloads.prepare': 'Preparar para descarregar',
  'downloads.again': 'Preparar de novo',
  'downloads.preparing': 'A preparar a parte {done} de {total}…',
  'downloads.part': 'Parte {n} de {of}',
  'downloads.items': '{n} fotos',
  'downloads.download': 'Descarregar',
  'downloads.validity': 'Álbum completo em partes ZIP: 2048px para partilhar, originais em resolução máxima para guardar. Os links duram 7 dias e podem ser regenerados.', // app: ownerLink.step3Body
  'downloads.refundedTitle': 'Descarregamentos desativados em eventos reembolsados',
  'downloads.refunded': 'O pagamento deste evento foi reembolsado, por isso o álbum não pode ser exportado como ZIP. Comprar um pacote novamente reativa a opção.', // app: download.zipRefunded
  'downloads.buyAgain': 'Ver pacotes',
  'downloads.nothing': 'Ainda não há nada para descarregar.',
  'downloads.failed': 'Não foi possível criar o ZIP.', // app: download.zipFailed
  'downloads.keepTitle': 'Guarde uma cópia',
  'downloads.keepBody': 'O armazenamento termina a {date}. Descarregue o álbum antes disso.',
  'downloads.keepBodyNoDate': 'Descarregue o álbum antes de o armazenamento terminar.',

  // ---------------------------------------------------------------- account
  'account.kicker': 'Conta', // app: account.title
  'account.title': 'A sua conta',
  'account.signins': 'Inícios de sessão',
  'account.pairedOnly': 'Este computador está ligado à app Sharecam. A conta ainda não tem um início de sessão próprio.',
  'account.sameAsApp': 'Os seus eventos pertencem a esta conta — a mesma que usa na app Sharecam.',
  'account.addAnother': 'Adicionar outro início de sessão',
  'account.addAnotherBody': 'Uma segunda forma de entrar, para o dia em que perder o acesso à primeira.',
  'account.linked': 'Início de sessão adicionado.',
  'account.signOutTitle': 'Terminar sessão', // app: account.signOut
  'account.signOutBody': 'Os seus eventos ficam na sua conta. Inicie sessão novamente quando quiser.',
  'account.signOutPaired': 'Sem um início de sessão próprio, este computador só pode voltar se o ligar de novo à app.',
  'account.deleteCta': 'Eliminar conta e dados', // app: account.deleteCta
  'account.deleteTitle': 'Eliminar a sua conta e os seus dados?', // app: account.deleteTitle
  'account.deleteBody': 'A sua conta, todos os eventos que criou, as fotos e as listas de convidados são eliminados definitivamente, em todos os dispositivos. Esta ação é irreversível.', // app: account.deleteBody
  'account.deleteConfirm': 'Eliminar tudo', // app: account.deleteConfirm
  'account.deleted': 'A sua conta e os seus dados foram eliminados.', // app: account.deleted
  'account.deleteFailed': 'Não foi possível eliminar a sua conta. Tente novamente.', // app: account.deleteFailed
  'account.deletePairedNote': 'Para eliminar a conta, inicie sessão neste computador com o próprio início de sessão da conta (não pela ligação à app) ou elimine-a na app (Definições → Conta).',
};

export default pt;
