import { useSyncExternalStore } from 'react';
import { en, type Dict, type Key } from './en';

// Dashboard strings (plan §3.6, D15). en.ts is the typed source; the other eight
// languages (WP-H) are `Dict = Record<Key, string>` files next to it —
// tr.ts es.ts de.ts fr.ts it.ts pt.ts nl.ts pl.ts, each `export default` — so
// tsc catches a missing or stale key. They are found by import.meta.glob and
// loaded on demand (one small chunk per language); a language whose file does
// not exist yet shows English.
//
// Same language key as the guest client (`sharecam.lang`, WEB/src/i18n.ts
// detectLang/saveLang): a guest's choice carries over to the dashboard and back.
// The two functions are repeated here (ten lines) instead of imported, because
// importing WEB/src/i18n.ts would pull the guest client's 9-language dictionary
// into the dashboard bundle.

export const LANGS = ['en', 'tr', 'es', 'de', 'fr', 'it', 'pt', 'nl', 'pl'] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_LABEL: Record<Lang, string> = {
  en: 'EN', tr: 'TR', es: 'ES', de: 'DE', fr: 'FR', it: 'IT', pt: 'PT', nl: 'NL', pl: 'PL',
};
export type { Key, Dict };

const STORE_KEY = 'sharecam.lang';

export function detectLang(): Lang {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORE_KEY);
  } catch {
    saved = null;
  }
  if (saved && (LANGS as readonly string[]).includes(saved)) return saved as Lang;
  const nav = (typeof navigator !== 'undefined' ? navigator.language || 'en' : 'en').slice(0, 2).toLowerCase();
  return (LANGS as readonly string[]).includes(nav) ? (nav as Lang) : 'en';
}

function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(STORE_KEY, lang);
  } catch {
    /* storage blocked: the choice lasts for this page */
  }
}

const loaders = import.meta.glob<{ default: Dict }>(['./*.ts', '!./index.ts', '!./en.ts']);

let lang: Lang = detectLang();
let dict: Partial<Dict> = lang === 'en' ? en : {};
const listeners = new Set<() => void>();
let version = 0;
const emit = () => {
  version += 1;
  listeners.forEach((l) => l());
};

async function load(next: Lang): Promise<void> {
  if (next === 'en') {
    dict = en;
    return;
  }
  const loader = loaders[`./${next}.ts`];
  if (!loader) {
    dict = {};
    return;
  }
  try {
    dict = (await loader()).default;
  } catch {
    dict = {};
  }
}

function applyDocumentLang() {
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}
applyDocumentLang();
if (lang !== 'en') void load(lang).then(emit);

export function getLang(): Lang {
  return lang;
}

export async function setLang(next: Lang): Promise<void> {
  lang = next;
  saveLang(next);
  applyDocumentLang();
  await load(next);
  emit();
}

/** `t('key', { name: 'Amy' })` — `{name}` placeholders. Missing → English. */
export function t(key: Key, vars?: Record<string, string | number>): string {
  let s = dict[key] ?? en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

/** Re-render on a language switch (and once the language file has loaded). */
export function useLang(): Lang {
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
  );
  return lang;
}

/** Intl helpers in the page language. */
export function fmtDate(ms: number | Date, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }): string {
  try {
    return new Intl.DateTimeFormat(lang, opts).format(ms);
  } catch {
    return new Date(ms).toDateString();
  }
}
export function fmtNumber(n: number): string {
  try {
    return new Intl.NumberFormat(lang).format(n);
  } catch {
    return String(n);
  }
}
export function fmtUsd(n: number): string {
  try {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'USD' }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}
/** 'YYYY-MM-DD' (an event's date, no time zone) → a readable date. */
export function fmtDay(day: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return day;
  return fmtDate(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
export function fmtRelative(ms: number, now = Date.now()): string {
  const diff = ms - now;
  const abs = Math.abs(diff);
  try {
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
    if (abs < 60_000) return rtf.format(0, 'second');
    if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), 'minute');
    if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), 'hour');
    if (abs < 30 * 86_400_000) return rtf.format(Math.round(diff / 86_400_000), 'day');
  } catch {
    /* fall through */
  }
  return fmtDate(ms);
}
