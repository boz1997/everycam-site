import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getLang, t } from '../../i18n';
import { isoDay, parseDay, today as todayOf } from '../../lib/dates';
import { IconCalendar, IconX } from '../ui';
import { MonthPanel } from './MonthPanel';

// The event date in the dashboard's own look instead of the browser's calendar
// (ported from AllShots components/date/DatePicker). The value is what
// <input type="date"> produced — '' or 'YYYY-MM-DD', local — so NewEvent stores
// it exactly as before.
//
// The field is a button that opens a native <dialog> with showModal(): the rest
// of the page is inert, Escape and a click outside close it, and focus returns to
// the field. From 640 px it is a popover under the field; below, a bottom sheet.

const WIDE = '(min-width: 640px)';

export interface DatePickerProps {
  value: string;
  onChange: (v: string) => void;
  /** 'YYYY-MM-DD'; earlier days are shown but cannot be picked. */
  min?: string;
  /** The visible label's id: the field and the dialog are named by it. */
  labelId: string;
  hintId?: string;
}

export function DatePicker({ value, onChange, min, labelId, hintId }: DatePickerProps) {
  const uid = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [focused, setFocused] = useState<Date>(() => todayOf());
  const [moveFocus, setMoveFocus] = useState(false);

  const lang = getLang();
  const selected = parseDay(value);
  const minDay = parseDay(min);
  const now = useMemo(() => todayOf(), [open]);
  const full = useMemo(() => new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), [lang]);

  function show() {
    const start = selected ?? now;
    setFocused(minDay && start < minDay ? minDay : start);
    setWide(window.matchMedia(WIDE).matches);
    setOpen(true);
    setMoveFocus(true);
  }
  function close() {
    setOpen(false);
    window.setTimeout(() => trigger.current?.focus(), 0);
  }
  const pick = (d: Date) => {
    onChange(isoDay(d));
    close();
  };

  // Popover under the field, flipped above when there is no room below; measured
  // after showModal so the panel has its real size.
  function place() {
    const r = trigger.current?.getBoundingClientRect();
    const box = dialog.current?.firstElementChild?.getBoundingClientRect();
    if (!r || !box) return;
    const below = r.bottom + 8;
    const fitsBelow = below + box.height <= window.innerHeight - 8;
    const top = fitsBelow || r.top - box.height - 8 < 8 ? Math.max(8, Math.min(below, window.innerHeight - box.height - 8)) : r.top - box.height - 8;
    setPos({ top, left: Math.max(8, Math.min(r.left, window.innerWidth - box.width - 8)) });
  }

  useLayoutEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (!open) {
      if (d.open) d.close();
      setPos(null);
      return;
    }
    if (!d.open) d.showModal();
    document.body.style.overflow = 'hidden';
    const mq = window.matchMedia(WIDE);
    const sync = () => {
      setWide(mq.matches);
      if (mq.matches) place();
    };
    sync();
    window.addEventListener('resize', sync);
    return () => {
      window.removeEventListener('resize', sync);
      document.body.style.overflow = '';
    };
  }, [open, wide]);

  return (
    <div className={`dp${selected ? ' has-value' : ''}`}>
      <button
        ref={trigger}
        type="button"
        className="input dp-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${uid}-v`}
        aria-describedby={hintId}
        onClick={() => (open ? close() : show())}
        data-date-field
      >
        <IconCalendar />
        <span id={`${uid}-v`} className={`dp-value${selected ? '' : ' dp-placeholder'}`} data-date-value={selected ? isoDay(selected) : ''}>
          {selected ? full.format(selected) : t('date.pick')}
        </span>
      </button>
      {selected && (
        <button
          type="button"
          className="dp-clear"
          aria-label={t('date.clear')}
          onClick={() => {
            onChange('');
            trigger.current?.focus();
          }}
          data-date-clear
        >
          <IconX />
        </button>
      )}

      <dialog
        ref={dialog}
        aria-labelledby={labelId}
        aria-describedby={`${uid}-h`}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        className={wide ? 'dp-pop' : 'dp-sheet'}
        style={wide && pos ? { top: pos.top, left: pos.left } : undefined}
        data-date-dialog={wide ? 'popover' : 'sheet'}
      >
        {open && (
          <div className={wide ? 'dp-panel' : 'dp-panel sheet'}>
            <p id={`${uid}-h`} className="sr-only">{t('date.help')}</p>
            <MonthPanel
              focused={focused}
              onFocus={(d, moveDom) => {
                setFocused(d);
                if (moveDom) setMoveFocus(true);
              }}
              moveFocus={moveFocus}
              onFocusMoved={() => setMoveFocus(false)}
              selected={selected}
              min={minDay}
              today={now}
              onPick={pick}
              onClear={() => {
                onChange('');
                close();
              }}
              onClose={wide ? undefined : close}
              headingId={`${uid}-m`}
            />
          </div>
        )}
      </dialog>
    </div>
  );
}
