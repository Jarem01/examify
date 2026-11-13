export type MediaKind = 'text' | 'image' | 'audio';

export interface Term {
  id: string;
  term: string;
  definition: string;
  /** Optional image / audio sources for either side. */
  termImage?: string | null;
  defImage?: string | null;
  termAudio?: string | null;
  defAudio?: string | null;
}

export interface StudySet {
  id: string;
  title: string;
  description: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  terms: Term[];
}

export interface SetSummary {
  id: string;
  title: string;
  description: string;
  subject: string;
  termCount: number;
  masteredCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TermProgress {
  streak: number;
  learned: boolean;
  correct: number;
  missed: number;
  lastSeen?: string;
}

export interface SetProgress {
  terms: Record<string, TermProgress>;
  totalAnswered: number;
  totalCorrect: number;
  totalMissed: number;
  lastStudied?: string;
  bestTime?: Record<string, number>;
}

export interface ProgressState {
  sets: Record<string, SetProgress>;
  totalAnswered: number;
  totalCorrect: number;
}

export type AccentName = 'indigo' | 'green' | 'coral';

/** Which side of a card is shown first. */
export type QuestionDirection = 'term-first' | 'definition-first' | 'mixed';

export interface Settings {
  accent: AccentName;
  customAccent: string | null;
  allowMultipleChoice: boolean;
  allowTrueFalse: boolean;
  allowSelectAll: boolean;
  sectionSize: number;
  sound: boolean;
  autoSpeak: boolean;
  direction: QuestionDirection;
}

export type StudyMode =
  | 'flashcards'
  | 'learn'
  | 'test'
  | 'match'
  | 'blast'
  | 'blocks'
  | 'charms';

export type View =
  | { kind: 'home' }
  | { kind: 'search' }
  | { kind: 'set'; setId: string }
  | { kind: 'mode'; mode: StudyMode; setId: string };

/* ---------------------------------- questions --------------------------------- */

export interface MultipleChoiceQuestion {
  type: 'mcq';
  id: string;
  termId: string;
  /** What the learner is asked to answer: pick the definition, or pick the term. */
  promptSide: 'term' | 'definition';
  prompt: string;
  promptLabel: string;
  options: string[];
  answerIndex: number;
  hintTerm: string;
}

export interface TrueFalseQuestion {
  type: 'tf';
  id: string;
  termId: string;
  statement: string;
  answer: boolean;
  /** When false, the definition that should have been used. */
  correctDefinition: string;
}

export interface SelectAllOption {
  text: string;
  correct: boolean;
}

export interface SelectAllQuestion {
  type: 'sata';
  id: string;
  termId: string;
  prompt: string;
  options: SelectAllOption[];
  answerKey: number[];
}

export interface MatchingQuestion {
  type: 'matching';
  id: string;
  termId: string;
  /** Column listed on the left; the pairs themselves are direction-agnostic. */
  promptSide?: 'term' | 'definition';
  pairs: { termId: string; term: string; definition: string }[];
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | SelectAllQuestion
  | MatchingQuestion;

export interface LearnConfig {
  allowMultipleChoice: boolean;
  allowTrueFalse: boolean;
  allowSelectAll: boolean;
  sectionSize: number;
}
