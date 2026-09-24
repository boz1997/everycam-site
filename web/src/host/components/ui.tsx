import { createContext, useCallback, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { t } from '../i18n';

// Small building blocks in the site's shapes (styles.css). Nothing clever.

export function Spinner({ label }: { label?: string }) {
  return <span className="spin" role={label ? 'status' : undefined} aria-label={label} />;
}

export function Loading() {
  return (
    <div className="loading">
      <Spinner label={t('common.loading')} />
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'line' | 'quiet' | 'danger' | 'danger-solid' | 'on-dark' | 'provider'; size?: 'sm' | 'md'; busy?: boolean; block?: boolean; icon?: ReactNode };
export function Button({ variant = 'primary', size = 'md', busy, block, icon, className, children, disabled, ...rest }: BtnProps) {
  const cls = ['btn', variant === 'primary' ? '' : variant === 'danger-solid' ? 'danger solid' : variant, size === 'sm' ? 'sm' : '', block ? 'block' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={cls} disabled={disabled || busy} aria-busy={busy || undefined} {...rest}>
      {busy ? <Spinner /> : icon}
      {children}
    </button>
  );
}

export function Notice({ tone, icon, title, children, actions }: { tone?: 'gold' | 'danger' | 'dark'; icon?: ReactNode; title?: ReactNode; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className={`notice${tone ? ` ${tone}` : ''}`} role={tone === 'danger' ? 'alert' : undefined}>
      {icon ?? <IconInfo />}
      <div>
        {title && <p className="h3">{title}</p>}
        {children && <div className={title ? 'muted' : undefined} style={title ? { marginTop: 2 } : undefined}>{children}</div>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

/** The app's settings row: the WHOLE row toggles, and the state is named under the switch. */
export function Setting({ title, desc, on, onChange, stateOn, stateOff, disabled, busy }: {
  title: string; desc: ReactNode; on: boolean; onChange: (next: boolean) => void; stateOn?: string; stateOff?: string; disabled?: boolean; busy?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-disabled={disabled || busy || undefined}
      className="setting"
      onClick={() => {
        if (!disabled && !busy) onChange(!on);
      }}
    >
      <span className="h3">{title}</span>
      <span className="desc">{desc}</span>
      <span className="sw-wrap" aria-hidden="true">
        <span className={`sw${on ? ' on' : ''}`} />
        <span className={`sw-state${on ? ' on' : ''}`}>{on ? stateOn ?? t('common.on') : stateOff ?? t('common.off')}</span>
      </span>
    </button>
  );
}

export function Meter({ used, cap }: { used: number; cap: number }) {
  if (cap <= 0) return <div className="meter" aria-hidden="true" />;
  const pct = cap === 0 ? 100 : Math.min(100, Math.round((used / cap) * 100));
  return (
    <div className={`meter${pct >= 100 ? ' full' : pct >= 80 ? ' near' : ''}`} aria-hidden="true">
      <i style={{ width: `${Math.max(pct, used > 0 ? 3 : 0)}%` }} />
    </div>
  );
}

export function CopyField({ value, label, display }: { value: string; label: string; display?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* nothing else to try */
      }
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="linkbox">
      <code aria-label={label}>{display ?? value}</code>
      <button type="button" onClick={() => void copy()} aria-live="polite">
        {copied ? t('common.copied') : t('common.copy')}
      </button>
    </div>
  );
}

export function useCopy(): [boolean, (text: string) => Promise<void>] {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard blocked: the text is on screen */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, []);
  return [copied, copy];
}

// ---------------------------------------------------------------- dialogs

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])';

/** Keep Tab / Shift+Tab inside `box` (a modal: dialog, lightbox). A keydown that
 *  starts outside it (focus lost to <body>) is pulled back in. */
export function trapTab(e: KeyboardEvent, box: HTMLElement | null): void {
  if (e.key !== 'Tab' || !box) return;
  const items = [...box.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (!items.length) {
    e.preventDefault();
    return;
  }
  const first = items[0]!;
  const last = items[items.length - 1]!;
  const active = document.activeElement as HTMLElement | null;
  if (!active || !box.contains(active)) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  } else if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

export function Dialog({ open, onClose, title, children, actions, labelledBy = 'dlg-title' }: {
  open: boolean; onClose: () => void; title: ReactNode; children?: ReactNode; actions?: ReactNode; labelledBy?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    // Escape closes; Tab stays inside the dialog (review P2: it reached the footer
    // links behind the scrim); focus goes back to what opened it.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else trapTab(e, ref.current);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button, input, a')?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={ref}>
        <h2 className="h2" id={labelledBy}>
          {title}
        </h2>
        {children && <div className="muted" style={{ lineHeight: 1.55 }}>{children}</div>}
        {actions && <div className="btn-row">{actions}</div>}
      </div>
    </div>
  );
}

/** Confirm with an optional second, harder step (the app's two-step delete, 03 §10). */
export function useConfirm() {
  const [state, setState] = useState<null | { title: string; body: ReactNode; confirm: string; danger?: boolean; resolve: (ok: boolean) => void }>(null);
  const ask = useCallback(
    (o: { title: string; body: ReactNode; confirm: string; danger?: boolean }) =>
      new Promise<boolean>((resolve) => setState({ ...o, resolve })),
    [],
  );
  const close = (ok: boolean) => {
    state?.resolve(ok);
    setState(null);
  };
  const node = (
    <Dialog
      open={!!state}
      onClose={() => close(false)}
      title={state?.title ?? ''}
      actions={
        <>
          <Button variant="line" onClick={() => close(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant={state?.danger ? 'danger-solid' : 'primary'} onClick={() => close(true)}>
            {state?.confirm}
          </Button>
        </>
      }
    >
      {state?.body}
    </Dialog>
  );
  return { ask, node };
}

// ---------------------------------------------------------------- toast

const ToastCtx = createContext<(msg: string) => void>(() => undefined);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const show = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <div className="toast" role="status" aria-live="polite">
          {msg}
        </div>
      )}
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

// ---------------------------------------------------------------- icons (stroke, 1.8)

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
export const IconInfo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...S} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...S} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconCheck = ({ s = 22 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" {...S} strokeWidth={2.2} aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const IconAlert = ({ s = 20 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" {...S} aria-hidden="true"><path d="M12 3l9.5 17h-19z" /><path d="M12 10v4M12 17h.01" /></svg>
);
export const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...S} aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const IconChevron = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...S} aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
);
export const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...S} strokeWidth={2} aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
);
export const IconDownload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...S} aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
);
export const IconUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...S} aria-hidden="true"><path d="M12 20V9M7 14l5-5 5 5M5 4h14" /></svg>
);
export const IconEye = ({ off }: { off?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...S} aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
);
export const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...S} aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
);
export const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...S} aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
);
export const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...S} aria-hidden="true"><rect x="5" y="11" width="14" height="10" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6C12.3 13.6 17.6 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
    <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.8-6z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.4 0-11.7-4.1-13.6-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z" />
  </svg>
);
export const IconApple = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.4 12.7c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" />
  </svg>
);
export const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...S} aria-hidden="true"><rect x="3" y="5" width="18" height="14" /><path d="M3 7l9 6 9-6" /></svg>
);
export const IconPhone = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...S} aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M11 18.5h2" /></svg>
);
export const IconFace = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...S} aria-hidden="true">
    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
    <path d="M9 10h.01M15 10h.01M8.5 14.5a4.5 4.5 0 0 0 7 0" />
  </svg>
);
