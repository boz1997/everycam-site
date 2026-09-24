import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

/** How THIS session signed in — the ID token's `firebase.sign_in_provider`
 *  ('password', 'google.com', 'apple.com', 'custom' for a paired computer, …).
 *  undefined while it is being read, null when it can't be read. */
export function useSessionProvider(user: User | null): string | null | undefined {
  const [provider, setProvider] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (!user) {
      setProvider(null);
      return;
    }
    let alive = true;
    setProvider(undefined);
    user
      .getIdTokenResult()
      .then((r) => alive && setProvider(r.signInProvider ?? null))
      .catch(() => alive && setProvider(null));
    return () => {
      alive = false;
    };
  }, [user]);
  return provider;
}
