/**
 * Per-mode study sessions, kept in localStorage so a refresh, a trip to another
 * screen or a closed tab can pick up exactly where it left off.
 *
 * Entries are timestamped and pruned: only the most recent handful survive, and
 * stale ones expire, so sessions can never quietly fill the storage quota.
 */
const PREFIX = 'examify.session.v1:';
const MAX_SESSIONS = 12;
const MAX_AGE_MS = 21 * 24 * 60 * 60 * 1000;
const MAX_ENTRY_CHARS = 200_000;

interface Envelope {
  t: number;
  /** Write sequence, so entries saved in the same millisecond still evict in order. */
  n: number;
  v: unknown;
}

let writeSeq = 0;

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function storageKeys(): string[] {
  if (!hasStorage()) return [];
  const keys: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key && key.startsWith(PREFIX)) keys.push(key);
  }
  return keys;
}

export function readSession<T>(key: string): T | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && 'v' in parsed && typeof (parsed as Envelope).t === 'number') {
      return (parsed as Envelope).v as T;
    }
    // Older entries were stored without the timestamp envelope.
    return parsed as T;
  } catch {
    return null;
  }
}

/** Drop expired and least-recently-used sessions. */
function pruneSessions(): void {
  if (!hasStorage()) return;
  const now = Date.now();
  const entries: { key: string; savedAt: number; seq: number }[] = [];

  for (const key of storageKeys()) {
    let savedAt = 0;
    let seq = 0;
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) ?? 'null') as {
        t?: number;
        n?: number;
      } | null;
      if (parsed && typeof parsed.t === 'number') savedAt = parsed.t;
      if (parsed && typeof parsed.n === 'number') seq = parsed.n;
    } catch {
      savedAt = 0;
    }
    if (now - savedAt > MAX_AGE_MS) {
      window.localStorage.removeItem(key);
      continue;
    }
    entries.push({ key, savedAt, seq });
  }

  entries.sort((a, b) => b.savedAt - a.savedAt || b.seq - a.seq);
  entries.slice(MAX_SESSIONS).forEach((entry) => window.localStorage.removeItem(entry.key));
}

export function writeSession(key: string, value: unknown): void {
  if (!hasStorage()) return;
  const payload = JSON.stringify({ t: Date.now(), n: (writeSeq += 1), v: value } satisfies Envelope);
  // A single runaway entry is skipped rather than risking the whole quota.
  if (payload.length > MAX_ENTRY_CHARS) return;
  try {
    window.localStorage.setItem(PREFIX + key, payload);
  } catch {
    // Storage disabled or full — keep studying without saving.
    return;
  }
  pruneSessions();
}

export function clearSession(key: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

/** Remove every saved mode session belonging to a set (used when it is deleted). */
export function clearSessionsForSet(setId: string): void {
  if (!hasStorage()) return;
  const prefix = `${PREFIX}${setId}:`;
  storageKeys()
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    });
}
