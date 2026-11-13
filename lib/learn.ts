import type { Term } from './types';
import { shuffle } from './utils';

export const LEARN_SECTION_MIN = 7;
export const LEARN_SECTION_MAX = 10;

/** Split a list of terms into legs of 7–10 cards. */
export function buildSections(terms: Term[], size: number): Term[][] {
  const safeSize = Math.min(LEARN_SECTION_MAX, Math.max(LEARN_SECTION_MIN, Math.round(size)));
  const sections: Term[][] = [];
  for (let index = 0; index < terms.length; index += safeSize) {
    sections.push(terms.slice(index, index + safeSize));
  }
  return sections;
}

export interface LearnState {
  /** Every term in this session — needed to build review legs later. */
  pool: Term[];
  sections: Term[][];
  sectionIndex: number;
  /** Term ids still to be asked in the current leg. Each appears at most once. */
  queue: string[];
  /** Terms missed in this leg; asked again once the fresh cards are done. */
  retryQueue: string[];
  pass: number;
  streaks: Record<string, number>;
  learned: string[];
  answered: number;
  correct: number;
  missed: number;
  streak: number;
  bestStreak: number;
  retryNotice: boolean;
  sectionDone: boolean;
  complete: boolean;
  /** True once the initial legs are done and we are cycling through unmastered terms. */
  reviewRound: boolean;
}

/**
 * Serialized form for storage: card ids instead of full card text, so a saved
 * round never duplicates the whole term list.
 */
export type SavedLearnState = Omit<LearnState, 'pool' | 'sections'> & {
  poolIds: string[];
  sectionIds: string[][];
};

export function serializeLearnState(state: LearnState): SavedLearnState {
  const { pool, sections, ...rest } = state;
  return {
    ...rest,
    poolIds: pool.map((term) => term.id),
    sectionIds: sections.map((section) => section.map((term) => term.id)),
  };
}

/** Rebuild a saved round against the set's current cards, or null if it drifted. */
export function restoreLearnState(saved: SavedLearnState, terms: Term[]): LearnState | null {
  if (!Array.isArray(saved.poolIds) || !Array.isArray(saved.sectionIds)) return null;
  const byId = new Map(terms.map((term) => [term.id, term]));

  const pool: Term[] = [];
  for (const id of saved.poolIds) {
    const term = byId.get(id);
    if (!term) return null;
    pool.push(term);
  }
  if (pool.length === 0) return null;

  const sections: Term[][] = [];
  for (const ids of saved.sectionIds) {
    const section: Term[] = [];
    for (const id of ids) {
      const term = byId.get(id);
      if (!term) return null;
      section.push(term);
    }
    sections.push(section);
  }

  const rest = { ...saved } as Partial<SavedLearnState>;
  delete rest.poolIds;
  delete rest.sectionIds;
  return { ...(rest as Omit<LearnState, 'pool' | 'sections'>), pool, sections };
}

export function createLearnState(terms: Term[], size: number): LearnState {
  const sections = buildSections(terms, size);
  return {
    pool: terms,
    sections,
    sectionIndex: 0,
    queue: shuffle(sections[0] ?? []).map((term) => term.id),
    retryQueue: [],
    pass: 1,
    streaks: {},
    learned: [],
    answered: 0,
    correct: 0,
    missed: 0,
    streak: 0,
    bestStreak: 0,
    retryNotice: false,
    sectionDone: sections.length === 0,
    complete: sections.length === 0,
    reviewRound: false,
  };
}

/** The term to present next, or null while an interstitial is showing. */
export function currentTerm(state: LearnState): Term | null {
  if (state.sectionDone || state.complete) return null;
  const id = state.queue[0];
  if (!id) return null;
  const section = state.sections[state.sectionIndex] ?? [];
  return section.find((term) => term.id === id) ?? null;
}

export interface AnswerOutcome {
  state: LearnState;
  /** True when the term just reached two correct answers in a row. */
  justLearned: boolean;
  /** True when this answer dropped an existing streak. */
  brokeStreak: boolean;
}

/**
 * Record an answer for the current leg.
 *
 * A card is asked once per leg. A correct answer removes it for the rest of the
 * leg; a missed card joins the retry queue and is asked again — repeatedly —
 * once the leg's fresh cards have all been shown.
 */
export function applyLearnAnswer(state: LearnState, termId: string, isCorrect: boolean): AnswerOutcome {
  const previous = state.streaks[termId] ?? 0;
  const nextStreak = isCorrect ? previous + 1 : 0;
  const learnedNow = nextStreak >= 2 && !state.learned.includes(termId);
  const streaks = { ...state.streaks, [termId]: nextStreak };

  const queue = state.queue.filter((id) => id !== termId);
  const retryQueue = isCorrect ? [...state.retryQueue] : [...state.retryQueue, termId];

  let pass = state.pass;
  let retryNotice = false;
  let sectionDone = state.sectionDone;
  let workingQueue = queue;
  let workingRetry = retryQueue;

  if (workingQueue.length === 0) {
    if (workingRetry.length > 0) {
      workingQueue = shuffle(workingRetry);
      workingRetry = [];
      pass += 1;
      retryNotice = true;
    } else {
      sectionDone = true;
      retryNotice = false;
    }
  }

  return {
    state: {
      ...state,
      streaks,
      queue: workingQueue,
      retryQueue: workingRetry,
      pass,
      learned: learnedNow ? [...state.learned, termId] : state.learned,
      answered: state.answered + 1,
      correct: state.correct + (isCorrect ? 1 : 0),
      missed: state.missed + (isCorrect ? 0 : 1),
      streak: isCorrect ? state.streak + 1 : 0,
      bestStreak: Math.max(state.bestStreak, isCorrect ? state.streak + 1 : 0),
      retryNotice,
      sectionDone,
      complete: sectionDone && state.learned.length + (learnedNow ? 1 : 0) >= state.pool.length,
    },
    justLearned: learnedNow,
    brokeStreak: !isCorrect && previous > 0,
  };
}

/**
 * Move on from a finished leg. When the planned legs run out, the terms that
 * are not mastered yet become a new set of legs, so two correct answers can
 * still be earned without ever repeating a card inside one leg.
 */
export function nextSection(state: LearnState): LearnState {
  if (!state.sectionDone) return state;

  if (state.sectionIndex < state.sections.length - 1) {
    const sectionIndex = state.sectionIndex + 1;
    return {
      ...state,
      sectionIndex,
      queue: shuffle(state.sections[sectionIndex] ?? []).map((term) => term.id),
      retryQueue: [],
      pass: 1,
      retryNotice: false,
      sectionDone: false,
      complete: false,
    };
  }

  const remaining = state.pool.filter((term) => !state.learned.includes(term.id));
  if (remaining.length === 0) {
    return { ...state, complete: true, sectionDone: true, retryNotice: false };
  }

  const size = state.sections[0]?.length ?? LEARN_SECTION_MIN;
  const sections = buildSections(shuffle(remaining), size);
  return {
    ...state,
    sections,
    sectionIndex: 0,
    queue: (sections[0] ?? []).map((term) => term.id),
    retryQueue: [],
    pass: 1,
    retryNotice: false,
    sectionDone: false,
    complete: false,
    reviewRound: true,
  };
}

export function dismissRetryNotice(state: LearnState): LearnState {
  return { ...state, retryNotice: false };
}

/** Mark a term learned/not learned by hand (used when skipping). */
export function learnedSetFromProgress(streaks: Record<string, number>): Set<string> {
  return new Set(
    Object.entries(streaks)
      .filter(([, streak]) => streak >= 2)
      .map(([id]) => id),
  );
}
