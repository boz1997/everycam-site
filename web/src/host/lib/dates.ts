import type { Lang } from '../i18n';

// Calendar arithmetic for the create page's date picker (components/date/*), on
// plain local dates. Ported from AllShots web-host/src/dates.ts. Every Date here
// sits at 12:00 local time, so no DST switch can move it to another day. Day
// values travel as 'YYYY-MM-DD' — what <input type="date"> produced before, and
// what createEvent stores as the event's `date`.

/** First day of the week per dashboard language: en (US) starts on Sunday; the
 *  other eight on Monday (pt is the European Portuguese of the strings). */
export const FIRST_DAY_OF_WEEK: Record<Lang, number> = { en: 0, tr: 1, es: 1, de: 1, fr: 1, it: 1, pt: 1, nl: 1, pl: 1 };

export const day = (y: number, m: number, d: number): Date => new Date(y, m, d, 12);

const pad = (n: number) => String(n).padStart(2, '0');
export const isoDay = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 'YYYY-MM-DD' → that day, or null for '' / anything not a real date. */
export function parseDay(v: string | null | undefined): Date | null {
  const m = v ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(v) : null;
  if (!m) return null;
  const d = day(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isoDay(d) === v ? d : null;
}

export const today = (now = new Date()): Date => day(now.getFullYear(), now.getMonth(), now.getDate());
export const addDays = (d: Date, n: number): Date => day(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const monthStart = (d: Date): Date => day(d.getFullYear(), d.getMonth(), 1);
export const sameDay = (a: Date | null, b: Date | null): boolean => !!a && !!b && isoDay(a) === isoDay(b);

/** Same day of the month n months away, clamped to that month's length (Jan 31 + 1 → Feb 28). */
export function addMonths(d: Date, n: number): Date {
  const first = day(d.getFullYear(), d.getMonth() + n, 1);
  const last = day(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return day(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), last));
}

/** Six weeks of seven days covering the month of `view`, starting on `firstDay`. */
export function monthWeeks(view: Date, firstDay: number): Date[][] {
  const first = monthStart(view);
  const start = addDays(first, -((first.getDay() - firstDay + 7) % 7));
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)));
}

/** Where a key moves the focused day in the grid (WAI-ARIA date picker dialog
 *  pattern), or null for other keys. Shift + PageUp/PageDown moves a year. */
export function dayForKey(key: string, shift: boolean, focused: Date, firstDay: number): Date | null {
  const dow = (focused.getDay() - firstDay + 7) % 7;
  switch (key) {
    case 'ArrowLeft': return addDays(focused, -1);
    case 'ArrowRight': return addDays(focused, 1);
    case 'ArrowUp': return addDays(focused, -7);
    case 'ArrowDown': return addDays(focused, 7);
    case 'Home': return addDays(focused, -dow);
    case 'End': return addDays(focused, 6 - dow);
    case 'PageUp': return addMonths(focused, shift ? -12 : -1);
    case 'PageDown': return addMonths(focused, shift ? 12 : 1);
    default: return null;
  }
}
