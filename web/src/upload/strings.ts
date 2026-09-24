import type { Lang } from '../i18n';

// The uploader's strings that are new with the shared host session (plan D2, §3.5,
// 24 Sep 2026). Everything else still comes from src/i18n.ts (makeT); these two
// are layered on top so the guest dictionary stays untouched. Same voice per
// language as the uploader's existing strings (tr sen · de du · es tú · fr vous ·
// it tu · nl je · pl Ty · pt-PT). Drafts: the native check of the other web
// strings (72e809d) did not cover them yet.
//   upRepair      one line, shown once after the old uploader's session was signed
//                 out of the guest (default) app — "pair again" (D2 migration)
//   upSignedInAs  which account this computer uploads as (e-mail sign-ins only)

type Key = 'upRepair' | 'upSignedInAs';

const STRINGS: Record<Lang, Record<Key, string>> = {
  en: {
    upRepair: 'This computer was signed out after an update. Connect it again with the Sharecam app to keep uploading.',
    upSignedInAs: 'Signed in as {email}',
  },
  tr: {
    upRepair: 'Bir güncellemeden sonra bu bilgisayarda oturum kapatıldı. Yüklemeye devam etmek için Sharecam uygulamasıyla yeniden bağla.',
    upSignedInAs: '{email} olarak giriş yapıldı',
  },
  es: {
    upRepair: 'Este ordenador se desconectó tras una actualización. Vuelve a conectarlo con la app Sharecam para seguir subiendo fotos.',
    upSignedInAs: 'Sesión iniciada como {email}',
  },
  de: {
    upRepair: 'Nach einem Update wurde dieser Computer abgemeldet. Verbinde ihn erneut mit der Sharecam-App, um weiter hochzuladen.',
    upSignedInAs: 'Angemeldet als {email}',
  },
  fr: {
    upRepair: 'Cet ordinateur a été déconnecté après une mise à jour. Reconnectez-le avec l’app Sharecam pour continuer l’import.',
    upSignedInAs: 'Connecté en tant que {email}',
  },
  it: {
    upRepair: 'Dopo un aggiornamento questo computer è stato scollegato. Ricollegalo con l’app Sharecam per continuare a caricare.',
    upSignedInAs: 'Accesso effettuato come {email}',
  },
  pt: {
    upRepair: 'A sessão deste computador foi terminada após uma atualização. Volte a ligá-lo com a app Sharecam para continuar a enviar.',
    upSignedInAs: 'Sessão iniciada como {email}',
  },
  nl: {
    upRepair: 'Deze computer is na een update uitgelogd. Koppel hem opnieuw met de Sharecam-app om verder te uploaden.',
    upSignedInAs: 'Ingelogd als {email}',
  },
  pl: {
    upRepair: 'Po aktualizacji ten komputer został wylogowany. Połącz go ponownie z aplikacją Sharecam, aby dalej wgrywać zdjęcia.',
    upSignedInAs: 'Zalogowano jako {email}',
  },
};

/** makeT(lang) plus the uploader's own keys (missing → English, like makeT). */
export function withUploadStrings(lang: Lang, base: (key: string) => string): (key: string) => string {
  const own = STRINGS[lang] ?? STRINGS.en;
  return (key: string) => (key in own ? own[key as Key] : base(key));
}
