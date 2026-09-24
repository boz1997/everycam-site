import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { hostAuth } from '../../hostSession';
import { onHostAuth } from '../lib/auth';

/** The 'host' app's session. `ready` once the persisted session has been read
 *  (so a returning host is never shown the sign-in page for a moment). `tick`
 *  changes on every token change — linking keeps the uid and the same User
 *  object, so components that show providers re-render on it. */
export function useHostUser(): { user: User | null; ready: boolean; tick: number } {
  const [state, setState] = useState<{ user: User | null; ready: boolean; tick: number }>(() => ({ user: hostAuth.currentUser, ready: false, tick: 0 }));
  useEffect(() => {
    let alive = true;
    void hostAuth.authStateReady().then(() => {
      if (alive) setState((s) => ({ user: hostAuth.currentUser, ready: true, tick: s.tick + 1 }));
    });
    const off = onHostAuth((u) => {
      if (alive) setState((s) => ({ user: u, ready: s.ready || true, tick: s.tick + 1 }));
    });
    return () => {
      alive = false;
      off();
    };
  }, []);
  return state;
}
