import { CONFUSION_GROUPS } from './seed-data';
import type {
  MatchingQuestion,
  MultipleChoiceQuestion,
  Question,
  SelectAllQuestion,
  Term,
  TrueFalseQuestion,
} from './types';
import { sample, shuffle, words } from './utils';

/* ------------------------------- distractor engine ------------------------------ */

function commonPrefixLength(a: string, b: string): number {
  const limit = Math.min(a.length, b.length);
  let index = 0;
  while (index < limit && a[index].toLowerCase() === b[index].toLowerCase()) index += 1;
  return index;
}

const confusionIndex = new Map<string, number>();
CONFUSION_GROUPS.forEach((group, groupIndex) => {
  group.forEach((term) => confusionIndex.set(term, groupIndex));
});

/**
 * Semantic similarity used to build plausible ("exam-worthy") distractors.
 * Blends content-word overlap, shared phrasing, comparable length, curated
 * confusion clusters, and question-shape cues.
 */
export function definitionSimilarity(target: Term, candidate: Term): number {
  if (target.id === candidate.id) return -1;
  const targetWords = new Set(words(`${target.term} ${target.definition}`));
  const candidateWords = new Set(words(`${candidate.term} ${candidate.definition}`));
  const union = new Set([...targetWords, ...candidateWords]);
  let shared = 0;
  targetWords.forEach((word) => {
    if (candidateWords.has(word)) shared += 1;
  });
  const jaccard = shared / Math.max(1, union.size);
  const prefix = commonPrefixLength(target.definition, candidate.definition) >= 12 ? 0.3 : 0;
  const lengthSpread =
    Math.min(target.definition.length, candidate.definition.length) /
    Math.max(1, Math.max(target.definition.length, candidate.definition.length));
  const lengthScore = lengthSpread > 0.55 ? 0.25 : 0;
  const cluster = confusionIndex.get(target.term);
  const clusterBonus =
    cluster !== undefined && confusionIndex.get(candidate.term) === cluster ? 1.1 : 0;
  const defineCue =
    /^(define|equity model point)/i.test(target.term) && /^(define|equity model point)/i.test(candidate.term)
      ? 0.35
      : 0;
  return jaccard * 1.6 + prefix + lengthScore + clusterBonus + defineCue;
}

/** Rank the pool and mix the closest matches with a few near-misses for variety. */
export function pickDistractors(target: Term, pool: Term[], count: number): Term[] {
  const candidates = pool.filter(
    (term) => term.id !== target.id && term.definition.trim() !== target.definition.trim(),
  );
  const ranked = candidates
    .map((term) => ({ term, score: definitionSimilarity(target, term) }))
    .sort((a, b) => b.score - a.score);

  const chosen: Term[] = [];
  const usedText = new Set([target.definition.trim()]);

  // 60% from the top of the semantic ranking, the rest from the strong upper half
  // so options never look obviously random but also never repeat.
  const primaryCount = Math.ceil(count * 0.6);
  for (const entry of ranked) {
    if (chosen.length >= primaryCount) break;
    const text = entry.term.definition.trim();
    if (usedText.has(text)) continue;
    usedText.add(text);
    chosen.push(entry.term);
  }

  const secondary = ranked.slice(primaryCount, Math.max(primaryCount + 12, count * 4));
  for (const entry of shuffle(secondary)) {
    if (chosen.length >= count) break;
    const text = entry.term.definition.trim();
    if (usedText.has(text)) continue;
    usedText.add(text);
    chosen.push(entry.term);
  }

  if (chosen.length < count) {
    for (const entry of ranked) {
      if (chosen.length >= count) break;
      const text = entry.term.definition.trim();
      if (usedText.has(text)) continue;
      usedText.add(text);
      chosen.push(entry.term);
    }
  }

  return chosen.slice(0, count);
}

function shuffleWithAnswer(correct: string, distractors: string[]): { options: string[]; answerIndex: number } {
  const options = shuffle([correct, ...distractors]);
  return { options, answerIndex: options.indexOf(correct) };
}

/* -------------------------------- question builders ------------------------------ */

export function buildMultipleChoice(
  target: Term,
  pool: Term[],
  direction: 'term' | 'definition' = 'term',
  optionCount = 4,
): MultipleChoiceQuestion {
  const askForTerm = direction === 'definition';
  const correct = askForTerm ? target.term : target.definition;
  const distractors = pickDistractors(target, pool, optionCount - 1);
  const values = distractors.map((term) => (askForTerm ? term.term : term.definition));
  const { options, answerIndex } = shuffleWithAnswer(correct, values);
  return {
    type: 'mcq',
    id: `mcq_${target.id}_${Math.random().toString(36).slice(2, 7)}`,
    termId: target.id,
    promptSide: askForTerm ? 'definition' : 'term',
    prompt: askForTerm ? target.definition : target.term,
    promptLabel: askForTerm ? 'Definition' : 'Term',
    options,
    answerIndex,
    hintTerm: target.term,
  };
}

export function buildTrueFalse(target: Term, pool: Term[]): TrueFalseQuestion {
  const makeTrue = Math.random() < 0.5;
  if (makeTrue) {
    return {
      type: 'tf',
      id: `tf_${target.id}_${Math.random().toString(36).slice(2, 7)}`,
      termId: target.id,
      statement: `${target.term} — ${target.definition}`,
      answer: true,
      correctDefinition: target.definition,
    };
  }
  const [impostor] = pickDistractors(target, pool, 1);
  const definition = impostor?.definition ?? target.definition;
  return {
    type: 'tf',
    id: `tf_${target.id}_${Math.random().toString(36).slice(2, 7)}`,
    termId: target.id,
    statement: `${target.term} — ${definition}`,
    answer: false,
    correctDefinition: target.definition,
  };
}

/**
 * "Select all that apply": a set of term→definition pairings where some are
 * correct. Always includes the target pairing so mastery is still earned from
 * knowing this card.
 */
const pairingKey = (term: string, definition: string) =>
  `${term.replace(/\s+/g, ' ').trim()}::${definition.replace(/\s+/g, ' ').trim()}`;

export function buildSelectAll(target: Term, pool: Term[], section: Term[]): SelectAllQuestion {
  const helpers = sample(
    section.filter((term) => term.id !== target.id),
    1,
  );
  const correctSeeds = [target, ...helpers].slice(0, 2);
  const rawOptions: { term: string; definition: string }[] = correctSeeds.map((term) => ({
    term: term.term,
    definition: term.definition,
  }));

  // False pairings pair a term with a *different* term's definition. Skip any
  // pairing that would turn out to be true, so a correct answer can never be
  // graded wrong on small sets.
  const candidates = shuffle(pool.filter((term) => !correctSeeds.some((seed) => seed.id === term.id)));
  for (const term of candidates) {
    if (rawOptions.length >= 4) break;
    const donor = shuffle(pool).find(
      (option) =>
        option.id !== term.id &&
        option.definition.replace(/\s+/g, ' ').trim() !== term.definition.replace(/\s+/g, ' ').trim(),
    );
    if (!donor) continue;
    if (rawOptions.some((option) => option.term === term.term && option.definition === donor.definition)) continue;
    rawOptions.push({ term: term.term, definition: donor.definition });
  }

  // Correctness is derived from the set itself, not from how the option was built.
  const truth = new Set(pool.map((term) => pairingKey(term.term, term.definition)));
  const options = shuffle(rawOptions).map((option) => ({
    text: `${option.term}\n${option.definition}`,
    correct: truth.has(pairingKey(option.term, option.definition)),
  }));

  return {
    type: 'sata',
    id: `sata_${target.id}_${Math.random().toString(36).slice(2, 7)}`,
    termId: target.id,
    prompt: 'Select all of the correct term–definition pairings.',
    options,
    answerKey: options.reduce<number[]>((keys, option, index) => {
      if (option.correct) keys.push(index);
      return keys;
    }, []),
  };
}

export function buildMatching(targets: Term[]): MatchingQuestion {
  return {
    type: 'matching',
    id: `match_${Math.random().toString(36).slice(2, 8)}`,
    termId: targets[0]?.id ?? '',
    pairs: targets.map((term) => ({
      termId: term.id,
      term: term.term,
      definition: term.definition,
    })),
  };
}

export function randomDirection(): 'term' | 'definition' {
  return Math.random() < 0.72 ? 'term' : 'definition';
}

export function buildLearnQuestion(
  target: Term,
  pool: Term[],
  section: Term[],
  allowed: { mcq: boolean; tf: boolean; sata: boolean },
): Question {
  const kinds: Array<'mcq' | 'tf' | 'sata'> = [];
  if (allowed.mcq) kinds.push('mcq');
  if (allowed.tf) kinds.push('tf');
  // Select-all needs enough terms to build honest false pairings.
  if (allowed.sata && pool.length >= 4) kinds.push('sata');
  const kind = kinds.length ? kinds[Math.floor(Math.random() * kinds.length)] : 'mcq';
  if (kind === 'tf') return buildTrueFalse(target, pool);
  if (kind === 'sata') return buildSelectAll(target, pool, section);
  return buildMultipleChoice(target, pool, randomDirection());
}

/**
 * Build a static practice test with exactly the requested number of questions.
 * Matching questions consume four terms but still count as one question, so the
 * term bag refills instead of shortening the test.
 */
export function buildTest(
  terms: Term[],
  count: number,
  formats: { mcq: boolean; tf: boolean; matching: boolean },
): Question[] {
  const pool = terms;
  if (pool.length === 0 || count <= 0) return [];

  const enabled = [
    formats.mcq ? 'mcq' : null,
    formats.tf ? 'tf' : null,
    formats.matching ? 'matching' : null,
  ].filter(Boolean) as Array<'mcq' | 'tf' | 'matching'>;
  const active = enabled.length ? enabled : (['mcq'] as const);
  const target = Math.min(count, pool.length);
  const questions: Question[] = [];
  let bag: Term[] = shuffle(pool);

  const take = (amount: number): Term[] => {
    const want = Math.min(amount, pool.length);
    const picked: Term[] = [];
    let guard = 0;
    while (picked.length < want && guard < want * 8 + 16) {
      guard += 1;
      if (bag.length === 0) bag = shuffle(pool);
      const next = bag.shift();
      if (!next) break;
      if (!picked.some((term) => term.id === next.id)) picked.push(next);
    }
    return picked;
  };

  for (let index = 0; index < target; index += 1) {
    let kind = active[index % active.length];
    if (kind === 'matching') {
      const group = take(4);
      if (group.length >= 3) {
        questions.push(buildMatching(group));
        continue;
      }
      kind = 'mcq';
    }
    const [term] = take(1);
    if (!term) break;
    questions.push(
      kind === 'tf' ? buildTrueFalse(term, pool) : buildMultipleChoice(term, pool, randomDirection()),
    );
  }

  return questions;
}
