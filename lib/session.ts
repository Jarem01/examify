/**
 * Per-mode study sessions, kept in localStorage so a refresh, a trip to another
 * screen or a closed tab can pick up exactly where it left off.
 */
const PREFIX = 'examify.session.v1:';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readSession<T>(key: string): T | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: unknown): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage disabled or full — keep studying without saving.
  }
}

export function clearSession(key: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
