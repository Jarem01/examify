export type TermDelimiter = 'tab' | 'comma' | 'custom';
export type CardDelimiter = 'newline' | 'semicolon' | 'custom';

export interface ParseOptions {
  termDelimiter: TermDelimiter;
  cardDelimiter: CardDelimiter;
  customTermDelimiter?: string;
  customCardDelimiter?: string;
}

export interface ParsedCard {
  term: string;
  definition: string;
  line: number;
}

export interface ParseResult {
  cards: ParsedCard[];
  errors: string[];
  skipped: number;
}

/** Interpret typed escapes so a custom "\t" delimiter works like a real tab. */
export function resolveDelimiter(value: string): string {
  return value
    .replace(/\\t/g, '\t')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\s/g, ' ');
}

export function resolveTermDelimiter(options: ParseOptions): string {
  if (options.termDelimiter === 'tab') return '\t';
  if (options.termDelimiter === 'comma') return ',';
  return resolveDelimiter(options.customTermDelimiter ?? '') || '\t';
}

export function resolveCardDelimiter(options: ParseOptions): string {
  if (options.cardDelimiter === 'newline') return '\n';
  if (options.cardDelimiter === 'semicolon') return ';';
  return resolveDelimiter(options.customCardDelimiter ?? '') || '\n';
}

function clean(value: string): string {
  return value
    .replace(/^\uFEFF/, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .trim();
}

/**
 * Split raw pasted text (Word, Excel, Google Docs, CSV/TSV, quizlet exports) into
 * term/definition pairs using the delimiters the learner picked.
 */
export function parseCards(raw: string, options: ParseOptions): ParseResult {
  const termDelimiter = resolveTermDelimiter(options);
  const cardDelimiter = resolveCardDelimiter(options);
  const text = raw.replace(/\r\n?/g, '\n');
  if (!text.trim()) return { cards: [], errors: [], skipped: 0 };

  const chunks = cardDelimiter === '\n' ? text.split('\n') : text.split(cardDelimiter);
  const cards: ParsedCard[] = [];
  const errors: string[] = [];
  let skipped = 0;

  chunks.forEach((chunk, index) => {
    const line = chunk.trim();
    if (!line) return;
    const at = line.indexOf(termDelimiter);
    if (at === -1) {
      skipped += 1;
      if (errors.length < 4) {
        errors.push(`Line ${index + 1}: no "${termDelimiter === '\t' ? 'Tab' : termDelimiter}" delimiter found.`);
      }
      return;
    }
    const term = clean(line.slice(0, at));
    const definition = clean(line.slice(at + termDelimiter.length));
    if (!term || !definition) {
      skipped += 1;
      if (errors.length < 4) errors.push(`Line ${index + 1}: empty term or definition.`);
      return;
    }
    cards.push({ term, definition, line: index + 1 });
  });

  return { cards, errors, skipped };
}

/** Guess which delimiter a pasted block uses, so imports need fewer clicks. */
export function detectDelimiters(raw: string): Partial<ParseOptions> {
  const lines = raw.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return {};
  const tabbed = lines.filter((line) => line.includes('\t')).length;
  if (tabbed > lines.length / 2) return { termDelimiter: 'tab', cardDelimiter: 'newline' };
  const commaed = lines.filter((line) => (line.match(/,/g) ?? []).length >= 1).length;
  if (commaed > lines.length / 2) return { termDelimiter: 'comma', cardDelimiter: 'newline' };
  const semis = (raw.match(/;/g) ?? []).length;
  if (semis > lines.length) return { termDelimiter: 'custom', customTermDelimiter: '-', cardDelimiter: 'semicolon' };
  return { termDelimiter: 'custom', customTermDelimiter: '-', cardDelimiter: 'newline' };
}

/* ------------------------------- prose imports -------------------------------- */

const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'st', 'jr', 'sr', 'vs', 'etc', 'eg', 'ie', 'al', 'no',
  'pres', 'rev', 'gen', 'col', 'lt', 'sgt', 'mt', 'ft', 'approx', 'dept', 'est', 'fig', 'figs',
  'pp', 'p', 'ed', 'eds', 'vol', 'op', 'ca', 'cf', 'viz', 'esp', 'inc', 'ltd', 'co', 'jan',
  'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec',
]);

/**
 * Clean up a PDF/prose export: page furniture, URLs, hyphenated line breaks and
 * the quizlet "1 / 10" footers that get spliced into the middle of sentences.
 */
function normalizeProse(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/\u00ad/g, '')
    .replace(/Exam\s+\d{1,2}\/\d{1,2}\s*[-–]\s*\d{1,2}\/\d{1,2}\s+Study online at\s+\S+/gi, ' ')
    .replace(/Study online at\s+\S+/gi, ' ')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/\b\d{1,2}\s*\/\s*\d{1,2}\b/g, ' ')
    // a hyphen at a line wrap is a broken word, not a real hyphen
    .replace(/([A-Za-z])-\s*\n\s*([a-z])/g, '$1$2')
    .replace(/([A-Za-z])-\s+([a-z])/g, '$1$2')
    // "(Point 1)" / "— Point 1" marks the end of an essay-style question
    .replace(/(\(?\s*[-–—]?\s*Point\s*\d{1,2}\s*\)?)\s+(?=[A-Z"“(])/gi, '$1. ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Quote-aware sentence splitter that respects common abbreviations. A period or
 * question mark only ends a sentence when the next content starts a new one, so
 * internal punctuation ("et al.", "O. McKay", quoted questions) stays intact.
 */
function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  let current = '';
  let inQuote = false;

  const flush = () => {
    const value = current.trim();
    if (value) sentences.push(value);
    current = '';
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    current += char;

    if (char === '"' || char === '“' || char === '”') {
      inQuote = !inQuote;
      const previous = text[index - 1] ?? '';
      const next = text.slice(index + 1, index + 3);
      // `self." Define ...` — the closing quote ends the sentence.
      // A following "(" usually continues the sentence — e.g. `...?" (Point 1)`.
      if (!inQuote && /[.?!]/.test(previous) && /^(\s+["“A-Z0-9]|\s*$)/.test(next)) flush();
      continue;
    }

    if (char !== '.' && char !== '?' && char !== '!') continue;
    if (inQuote) continue; // resolved when the closing quote arrives

    const next = text.slice(index + 1, index + 4);
    const nextStartsSentence = /^\s+["“A-Z0-9]/.test(next);
    const atEnd = index + 1 >= text.length;
    if (!nextStartsSentence && !atEnd) continue;

    if (char === '.') {
      const before = current.slice(0, -1);
      const lastToken = before.split(/[\s(]/).pop() ?? '';
      const normalized = lastToken.replace(/\./g, '').toLowerCase();
      const isAbbreviation =
        ABBREVIATIONS.has(normalized) || /^[A-Z]$/.test(lastToken.replace(/\./g, ''));
      if (isAbbreviation) continue;
    }

    flush();
  }

  flush();
  return sentences;
}

const CUE_STATEMENT = /^(Define|Name|List|Explain|Describe|Equity Model Point\s*\d+|ESSAY|Take-home|WOOPS)\b/i;
const STRONG_QUESTION = /^(What|Why|How|Who|When|Where|Which|Define|Name|List|Equity Model Point|ESSAY|Take-home|Gottman|Tannen|Pierrehumbert|Pirrone|Young Adults|President|Elder|Justice|Philip|Victor|Dr)\b/i;

/**
 * Parse prose exports (quizlet/PDF text dumps) where cards appear as
 * "Question? Answer. Question? Answer." with no delimiters at all.
 * Real questions end in "?" and are followed by an answer; questions that are
 * quoted, or that run into another question, are treated as part of the answer.
 */
export function parseProseCards(raw: string): ParseResult {
  const text = normalizeProse(raw);
  if (!text) return { cards: [], errors: [], skipped: 0 };

  const sentences = splitSentences(text);
  const cards: ParsedCard[] = [];
  let skipped = 0;
  let current: { term: string; parts: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const definition = current.parts.join(' ').replace(/\s+/g, ' ').trim();
    let term = current.term.replace(/\s+/g, ' ').trim();
    if (term.includes('?')) term = term.replace(/\.+$/, '').trim();
    term = term.replace(/^(Equity Model Point\s*\d+)\.$/i, '$1').trim();
    if (term.length >= 3 && definition.length >= 4) {
      cards.push({ term, definition, line: cards.length + 1 });
    } else {
      skipped += 1;
    }
    current = null;
  };

  sentences.forEach((rawSentence, index) => {
    const sentence = rawSentence.trim();
    if (!sentence) return;

    // "Equity Model Point 1 Base relationships..." — the cue is the term and the
    // rest of the sentence is already the definition.
    const inlineCue = /^(Equity Model Point\s*\d+)\s+(.{8,})$/i.exec(sentence);
    if (inlineCue) {
      flush();
      cards.push({
        term: inlineCue[1].replace(/\s+/g, ' ').trim(),
        definition: inlineCue[2].replace(/\s+/g, ' ').trim(),
        line: cards.length + 1,
      });
      return;
    }

    const endsQuestion = sentence.endsWith('?');
    const hasQuestionMark = sentence.includes('?');
    const startsQuoted = /^["“]/.test(sentence);
    const previousIsQuestion = index > 0 && sentences[index - 1].trim().endsWith('?');
    const nextIsQuestion = index + 1 < sentences.length && sentences[index + 1].trim().endsWith('?');
    const cueStatement = CUE_STATEMENT.test(sentence) && !startsQuoted;
    const questionStart = !startsQuoted && hasQuestionMark && (
      endsQuestion
        ? !previousIsQuestion || (!nextIsQuestion && STRONG_QUESTION.test(sentence))
        : STRONG_QUESTION.test(sentence)
    );

    // "Why is authenticity difficult? Name at least four reasons." — the second
    // sentence continues the question rather than starting a new card.
    if (cueStatement && current && current.parts.length === 0 && current.term.trim().endsWith('?')) {
      current.term = `${current.term.trim()} ${sentence}`;
      return;
    }

    if (cueStatement || questionStart) {
      flush();
      current = { term: sentence, parts: [] };
    } else if (current) {
      current.parts.push(sentence);
    } else {
      skipped += 1;
    }
  });

  flush();

  const seen = new Set<string>();
  const unique = cards.filter((card) => {
    const key = `${card.term.toLowerCase()}::${card.definition.slice(0, 80).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    cards: unique,
    skipped: skipped + (cards.length - unique.length),
    errors: [],
  };
}

/** Build a plain text export for the "copy" affordance on a set. */
export function serializeCards(cards: { term: string; definition: string }[]): string {
  return cards.map((card) => `${card.term}\t${card.definition}`).join('\n');
}
