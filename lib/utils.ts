export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function sample<T>(input: readonly T[], count: number): T[] {
  return shuffle(input).slice(0, Math.max(0, count));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function formatTime(ms: number): string {
  const totalTenths = Math.floor(ms / 100);
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
  }
  return `${seconds}.${tenths}s`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural ?? `${singular}s`;
}

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

/** Strip punctuation-heavy text down to comparable content words. */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'because', 'but', 'by', 'can', 'do', 'does', 'for',
  'from', 'has', 'have', 'if', 'in', 'into', 'is', 'it', 'its', 'may', 'not', 'of', 'on', 'or',
  'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'were',
  'what', 'when', 'which', 'who', 'why', 'will', 'with', 'you', 'your', 'how', 'one', 'more',
]);

export function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

export function speak(text: string, enabled = true): void {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  } catch {
    /* speech synthesis is best-effort */
  }
}

export function today(): string {
  return new Date().toISOString();
}
