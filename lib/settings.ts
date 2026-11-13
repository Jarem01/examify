import type { AccentName, Settings } from './types';

export const ACCENTS: Record<AccentName, string> = {
  indigo: '#4255ff',
  green: '#23b26d',
  coral: '#ff725b',
};

export const ACCENT_LABELS: Record<AccentName, string> = {
  indigo: 'Electric indigo',
  green: 'Study green',
  coral: 'Coral',
};

export const DEFAULT_SETTINGS: Settings = {
  accent: 'indigo',
  customAccent: null,
  allowMultipleChoice: true,
  allowTrueFalse: true,
  allowSelectAll: true,
  sectionSize: 7,
  sound: true,
  autoSpeak: false,
};

const STORAGE_KEY = 'examify.settings.v1';

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* storage may be unavailable */
  }
}

export function resolveAccent(settings: Settings): string {
  if (settings.accent === 'indigo') return settings.customAccent ?? ACCENTS.indigo;
  return ACCENTS[settings.accent];
}
