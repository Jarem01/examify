import type { Term } from './types';
import { shuffle } from './utils';

export const LEARN_SECTION_MIN = 7;
export const LEARN_SECTION_MAX = 10;

/** Split the set into rounds of 7–10 new terms. */
export function buildSections(terms: Term[], size: number): Term[][] {
  const safeSize = Math.min(LEARN_SECTION_MAX, Math.max(LEARN_SECTION_MIN, Math.round(size)));
  const sections: Term[][] = [];
  for (let index = 0; index < terms.length; index += safeSize) {
    sections.push(terms.slice(index, index + safeSize));
  }
  return sections;
}

export interface LearnState {
  sections: Term[][];
  sectionIndex: number;
  /** Term ids to ask during this pass. */
  queue: string[];
  /** Terms that still need another correct answer before the pass ends. */
  nextQueue: string[];
  pass: number;
  streaks: Record<string, number>;
  learned: string[];
  answered: number;
  correct: number;
  missed: number;
  streak: number;
  bestStreak: number;
  passHadMiss: boolean;
  retryNotice: boolean;
  sectionDone: boolean;
  complete: boolean;
}

export function createLearnState(terms: Term[], size: number): LearnState {
  const sections = buildSections(terms, size);
  return {
    sections,
    sectionIndex: 0,
    queue: shuffle(sections[0] ?? []).map((term) => term.id),
    nextQueue: [],
    pass: 1,
    streaks: {},
    learned: [],
    answered: 0,
    correct: 0,
    missed: 0,
    streak: 0,
    bestStreak: 0,
    passHadMiss: false,
    retryNotice: false,
    sectionDone: sections.length === 0,
    complete: sections.length === 0,
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

export function applyLearnAnswer(state: LearnState, termId: string, isCorrect: boolean): AnswerOutcome {
  const previous = state.streaks[termId] ?? 0;
  const nextStreak = isCorrect ? previous + 1 : 0;
  const learnedNow = nextStreak >= 2 && !state.learned.includes(termId);
  const streaks = { ...state.streaks, [termId]: nextStreak };
  const queue = state.queue.filter((id) => id !== termId);
  const nextQueue = learnedNow ? [...state.nextQueue] : [...state.nextQueue, termId];

  let pass = state.pass;
  let retryNotice = false;
  let sectionDone = state.sectionDone;
  let complete = state.complete;
  let workingQueue = queue;
  let workingNext = nextQueue;
  let passHadMiss = state.passHadMiss || !isCorrect;

  if (workingQueue.length === 0) {
    if (workingNext.length > 0) {
      workingQueue = shuffle(workingNext);
      workingNext = [];
      pass += 1;
      retryNotice = passHadMiss;
      passHadMiss = false;
    } else {
      sectionDone = true;
      complete = state.sectionIndex >= state.sections.length - 1;
      retryNotice = false;
      passHadMiss = false;
    }
  }

  return {
    state: {
      ...state,
      streaks,
      queue: workingQueue,
      nextQueue: workingNext,
      pass,
      learned: learnedNow ? [...state.learned, termId] : state.learned,
      answered: state.answered + 1,
      correct: state.correct + (isCorrect ? 1 : 0),
      missed: state.missed + (isCorrect ? 0 : 1),
      streak: isCorrect ? state.streak + 1 : 0,
      bestStreak: Math.max(state.bestStreak, isCorrect ? state.streak + 1 : 0),
      passHadMiss,
      retryNotice,
      sectionDone,
      complete,
    },
    justLearned: learnedNow,
    brokeStreak: !isCorrect && previous > 0,
  };
}

/** Advance from a completed section to the next batch of new terms. */
export function nextSection(state: LearnState): LearnState {
  if (!state.sectionDone) return state;
  if (state.sectionIndex >= state.sections.length - 1) {
    return { ...state, complete: true, sectionDone: true };
  }
  const sectionIndex = state.sectionIndex + 1;
  return {
    ...state,
    sectionIndex,
    queue: shuffle(state.sections[sectionIndex] ?? []).map((term) => term.id),
    nextQueue: [],
    pass: 1,
    passHadMiss: false,
    retryNotice: false,
    sectionDone: false,
    complete: false,
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
