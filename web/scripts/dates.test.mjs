// Day math of the create page's date picker (src/host/lib/dates.ts, ported with
// its tests from AllShots tests/unit/hostDatePicker.test.ts). The value is what
// <input type="date"> produced, 'YYYY-MM-DD' in local time, so these pin the day
// math, never a time zone.   node --test scripts/dates.test.mjs   (Node ≥ 22.18: .ts
// imports are type-stripped)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIRST_DAY_OF_WEEK, addMonths, day, dayForKey, isoDay, monthWeeks, parseDay } from '../src/host/lib/dates.ts';

test('reads back only real days', () => {
  assert.equal(isoDay(parseDay('2026-02-28')), '2026-02-28');
  assert.equal(parseDay('2026-02-30'), null);
  assert.equal(parseDay(''), null);
  assert.equal(parseDay('26-2-3'), null);
});

test('keeps every day at local noon, so no DST switch moves it', () => {
  assert.equal(parseDay('2026-03-29').getHours(), 12);
  assert.equal(parseDay('2026-10-25').getHours(), 12);
});

test('moves a month by clamping to the shorter month (Jan 31 → Feb 28, leap Feb 29)', () => {
  assert.equal(isoDay(addMonths(day(2026, 0, 31), 1)), '2026-02-28');
  assert.equal(isoDay(addMonths(day(2028, 0, 31), 1)), '2028-02-29');
  assert.equal(isoDay(addMonths(day(2026, 11, 15), 1)), '2027-01-15');
  assert.equal(isoDay(addMonths(day(2026, 2, 31), -1)), '2026-02-28');
});

test('first day of the week for all nine dashboard languages', () => {
  assert.deepEqual(FIRST_DAY_OF_WEEK, { en: 0, tr: 1, es: 1, de: 1, fr: 1, it: 1, pt: 1, nl: 1, pl: 1 });
});

test('lays a month out in six weeks from the first day of the week', () => {
  const sun = monthWeeks(day(2026, 8, 24), FIRST_DAY_OF_WEEK.en);
  const mon = monthWeeks(day(2026, 8, 24), FIRST_DAY_OF_WEEK.tr);
  assert.equal(sun.length, 6);
  assert.ok(sun.every((w) => w.length === 7));
  assert.equal(isoDay(sun[0][0]), '2026-08-30'); // Sep 1 2026 is a Tuesday
  assert.equal(sun[0][0].getDay(), 0);
  assert.equal(isoDay(mon[0][0]), '2026-08-31');
  assert.equal(mon[0][0].getDay(), 1);
});

test('answers the grid keys like the WAI-ARIA date picker', () => {
  const thu = day(2026, 8, 24);
  const k = (key, shift = false, first = 0) => isoDay(dayForKey(key, shift, thu, first));
  assert.equal(k('ArrowLeft'), '2026-09-23');
  assert.equal(k('ArrowRight'), '2026-09-25');
  assert.equal(k('ArrowUp'), '2026-09-17');
  assert.equal(k('ArrowDown'), '2026-10-01');
  assert.equal(k('Home'), '2026-09-20'); // Sunday-first
  assert.equal(k('End'), '2026-09-26');
  assert.equal(k('Home', false, 1), '2026-09-21'); // Monday-first
  assert.equal(k('End', false, 1), '2026-09-27');
  assert.equal(k('PageDown'), '2026-10-24');
  assert.equal(k('PageUp'), '2026-08-24');
  assert.equal(k('PageDown', true), '2027-09-24');
  assert.equal(dayForKey('a', false, thu, 0), null);
});
