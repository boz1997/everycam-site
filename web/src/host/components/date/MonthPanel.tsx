import { useEffect, useMemo, useRef, type KeyboardEvent } from 'react';
import { getLang, t } from '../../i18n';
import { FIRST_DAY_OF_WEEK, addMonths, day, dayForKey, isoDay, monthStart, monthWeeks, sameDay } from '../../lib/dates';
import { IconChevron, IconChevronLeft, IconX } from '../ui';

// The inside of the date picker (ported from AllShots components/date/MonthPanel):
// month heading with previous / next, the day grid (role=grid, one roving tab stop;
// arrows · Home/End · PageUp/PageDown, Shift for a year; Enter or Space picks), and
// Remove date / Today. Month and weekday names come from Intl in the dashboard's
// language. Days before `min` are shown but cannot be picked (the app's
// minimumDate: an event date is today or later).

export interface MonthPanelProps {
  focused: Date;
  /** A new focused day; `moveDom` also moves keyboard focus onto it (arrow keys). */
  onFocus: (d: Date, moveDom?: boolean) => void;
  /** Move DOM focus to the focused day after the next render. */
  moveFocus: boolean;
  onFocusMoved: () => void;
  selected: Date | null;
  min: Date | null;
  today: Date;
  onPick: (d: Date) => void;
  onClear: () => void;
  /** The bottom sheet's close button (phones); the popover closes on Escape / outside. */
  onClose?: () => void;
  headingId: string;
}

const cap = (s: string, locale: string) => s.charAt(0).toLocaleUpperCase(locale) + s.slice(1);

export function MonthPanel({ focused, onFocus, moveFocus, onFocusMoved, selected, min, today, onPick, onClear, onClose, headingId }: MonthPanelProps) {
  const lang = getLang();
  const firstDay = FIRST_DAY_OF_WEEK[lang];
  const grid = useRef<HTMLTableElement>(null);
  const fmt = useMemo(() => ({
    month: new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }),
    full: new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    wdShort: new Intl.DateTimeFormat(lang, { weekday: 'short' }),
    wdLong: new Intl.DateTimeFormat(lang, { weekday: 'long' }),
  }), [lang]);
  // 6 Sep 2026 is a Sunday: the week's column i is that date + firstDay + i.
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = day(2026, 8, 6 + firstDay + i);
    return { short: fmt.wdShort.format(d).replace(/\.$/, ''), long: fmt.wdLong.format(d) };
  }), [fmt, firstDay]);

  const view = monthStart(focused);
  const weeks = useMemo(() => monthWeeks(view, firstDay), [view.getTime(), firstDay]);
  const clamp = (d: Date) => (min && d < min ? min : d);
  const beforeMin = (d: Date) => !!min && d < min;

  useEffect(() => {
    if (!moveFocus) return;
    grid.current?.querySelector<HTMLButtonElement>(`button[data-day="${isoDay(focused)}"]`)?.focus();
    onFocusMoved();
  }, [moveFocus, focused]);

  function onKey(e: KeyboardEvent<HTMLTableElement>) {
    const next = dayForKey(e.key, e.shiftKey, focused, firstDay);
    if (!next) return;
    e.preventDefault();
    onFocus(clamp(next), true);
  }

  return (
    <>
      <div className="dp-head">
        <h2 id={headingId} className="dp-month" aria-live="polite">{cap(fmt.month.format(view), lang)}</h2>
        <button type="button" className="dp-nav" aria-label={t('date.prevMonth')} disabled={!!min && addMonths(view, -1) < monthStart(min)} onClick={() => onFocus(clamp(addMonths(focused, -1)))} data-dp-prev>
          <IconChevronLeft s={20} />
        </button>
        <button type="button" className="dp-nav" aria-label={t('date.nextMonth')} onClick={() => onFocus(clamp(addMonths(focused, 1)))} data-dp-next>
          <IconChevron s={20} />
        </button>
        {onClose && (
          <button type="button" className="dp-nav" aria-label={t('common.close')} onClick={onClose}>
            <IconX s={20} />
          </button>
        )}
      </div>

      <table ref={grid} role="grid" aria-labelledby={headingId} className="dp-grid" onKeyDown={onKey}>
        <thead>
          <tr>
            {weekdays.map((w) => (
              <th key={w.long} scope="col" abbr={w.long}>
                <span aria-hidden="true">{w.short}</span>
                <span className="sr-only">{w.long}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={isoDay(week[0])}>
              {week.map((d) => {
                const iso = isoDay(d);
                if (d.getMonth() !== view.getMonth()) return <td key={iso} role="gridcell" aria-hidden="true" />;
                const sel = sameDay(d, selected);
                const now = sameDay(d, today);
                const off = beforeMin(d);
                return (
                  <td key={iso} role="gridcell" aria-selected={sel}>
                    <button
                      type="button"
                      data-day={iso}
                      tabIndex={sameDay(d, focused) ? 0 : -1}
                      aria-label={fmt.full.format(d)}
                      aria-current={now ? 'date' : undefined}
                      aria-disabled={off || undefined}
                      onClick={() => {
                        if (!off) onPick(d);
                      }}
                      onFocus={() => {
                        if (!sameDay(d, focused)) onFocus(d);
                      }}
                      className={`dp-day${sel ? ' dp-sel' : ''}${now ? ' dp-today' : ''}${off ? ' dp-off' : ''}`}
                    >
                      {d.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="dp-foot">
        <button type="button" className="btn quiet sm" disabled={!selected} onClick={onClear} data-dp-clear>{t('date.clear')}</button>
        <button type="button" className="btn line sm" disabled={beforeMin(today)} onClick={() => onPick(today)} data-dp-today>{t('date.today')}</button>
      </div>
    </>
  );
}
