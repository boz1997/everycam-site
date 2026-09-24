import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { hostAuth, hostDb } from '../../hostSession';

// Remote error log of the dashboard — the same collection and fields as the app
// and the guest client (`errorLogs`, rules: signed in, uid == caller, message ≤ 1000),
// stamped appVersion 'host-web-1' (plan §3.1). Best effort: it never throws and
// never blocks the flow. A signed-out failure cannot be logged (the rule needs a uid).
const LOG_TTL_DAYS = 30;
export const HOST_WEB_VERSION = 'host-web-1';

export async function logError(context: string, error: unknown, extra?: Record<string, unknown>): Promise<void> {
  const uid = hostAuth.currentUser?.uid ?? null;
  if (!uid) return;
  const e = error as { message?: string; code?: string } | null;
  try {
    await addDoc(collection(hostDb, 'errorLogs'), {
      context,
      message: String(e?.message ?? String(error)).slice(0, 1000),
      code: typeof e?.code === 'string' ? e.code : 'unknown',
      extra: { ...(extra ?? {}) },
      uid,
      platform: 'web',
      appVersion: HOST_WEB_VERSION,
      createdAt: serverTimestamp(),
      expireAt: Timestamp.fromMillis(Date.now() + LOG_TTL_DAYS * 86_400_000),
    });
  } catch {
    /* logging never throws */
  }
}
