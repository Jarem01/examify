import fs from 'node:fs/promises';
import path from 'node:path';
import { SEED_CARDS, SEED_DESCRIPTION, SEED_TITLE } from './seed-data';
import type {
  ProgressState,
  SetProgress,
  SetSummary,
  StudySet,
  Term,
  TermProgress,
} from './types';
import { uid } from './utils';

interface Database {
  sets: StudySet[];
  progress: ProgressState;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

export const SEED_SET_ID = 'exam-11-5-11-13';

function buildSeedDatabase(): Database {
  const now = new Date().toISOString();
  const terms: Term[] = SEED_CARDS.map((card, index) => ({
    id: `t${index + 1}`,
    term: card.term,
    definition: card.definition,
    termImage: null,
    defImage: null,
  }));
  const set: StudySet = {
    id: SEED_SET_ID,
    title: SEED_TITLE,
    description: SEED_DESCRIPTION,
    subject: 'Human Sexuality',
    createdAt: now,
    updatedAt: now,
    terms,
  };
  return { sets: [set], progress: { sets: {}, totalAnswered: 0, totalCorrect: 0 } };
}

let cache: Database | null = null;
let chain: Promise<unknown> = Promise.resolve();

/** Serialize read-modify-write cycles so concurrent requests cannot clobber data. */
function serialize<T>(task: () => Promise<T>): Promise<T> {
  const next = chain.then(task, task);
  chain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

async function persist(db: Database): Promise<void> {
  await fs.mkdir(DB_DIR, { recursive: true });
  const tmp = `${DB_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), 'utf8');
  await fs.rename(tmp, DB_FILE);
}

async function load(): Promise<Database> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Database;
    if (!parsed || !Array.isArray(parsed.sets) || !parsed.progress) throw new Error('malformed database');
    cache = parsed;
  } catch {
    const seeded = buildSeedDatabase();
    cache = seeded;
    await persist(seeded).catch(() => undefined);
  }
  return cache;
}

function emptySetProgress(): SetProgress {
  return { terms: {}, totalAnswered: 0, totalCorrect: 0, totalMissed: 0 };
}

function masteredCount(set: StudySet, progress: SetProgress | undefined): number {
  if (!progress) return 0;
  return set.terms.reduce((total, term) => total + (progress.terms[term.id]?.learned ? 1 : 0), 0);
}

function toSummary(set: StudySet, progress: SetProgress | undefined): SetSummary {
  return {
    id: set.id,
    title: set.title,
    description: set.description,
    subject: set.subject,
    termCount: set.terms.length,
    masteredCount: masteredCount(set, progress),
    createdAt: set.createdAt,
    updatedAt: set.updatedAt,
  };
}

export async function listSets(): Promise<SetSummary[]> {
  const db = await load();
  return [...db.sets]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .map((set) => toSummary(set, db.progress.sets[set.id]));
}

export async function getSet(id: string): Promise<StudySet | null> {
  const db = await load();
  return db.sets.find((set) => set.id === id) ?? null;
}

export interface CreateSetInput {
  title: string;
  description?: string;
  subject?: string;
  terms: { term: string; definition: string; termImage?: string | null; defImage?: string | null }[];
}

export async function createSet(input: CreateSetInput): Promise<StudySet> {
  return serialize(async () => {
    const db = await load();
    const now = new Date().toISOString();
    const terms: Term[] = input.terms
      .filter((item) => item.term.trim() && item.definition.trim())
      .map((item) => ({
        id: uid('t'),
        term: item.term.trim(),
        definition: item.definition.trim(),
        termImage: item.termImage ?? null,
        defImage: item.defImage ?? null,
      }));
    const set: StudySet = {
      id: uid('set'),
      title: input.title.trim() || 'Untitled study set',
      description: input.description?.trim() ?? '',
      subject: input.subject?.trim() ?? '',
      createdAt: now,
      updatedAt: now,
      terms,
    };
    db.sets.unshift(set);
    await persist(db);
    return set;
  });
}

export async function updateSet(
  id: string,
  patch: {
    title?: string;
    description?: string;
    subject?: string;
    terms?: { id?: string; term: string; definition: string }[];
  },
): Promise<StudySet | null> {
  return serialize(async () => {
    const db = await load();
    const set = db.sets.find((item) => item.id === id);
    if (!set) return null;
    if (typeof patch.title === 'string') set.title = patch.title.trim() || set.title;
    if (typeof patch.description === 'string') set.description = patch.description.trim();
    if (typeof patch.subject === 'string') set.subject = patch.subject.trim();
    if (Array.isArray(patch.terms)) {
      set.terms = patch.terms
        .filter((item) => item.term.trim() && item.definition.trim())
        .map((item) => ({
          id: item.id ?? uid('t'),
          term: item.term.trim(),
          definition: item.definition.trim(),
          termImage: null,
          defImage: null,
        }));
    }
    set.updatedAt = new Date().toISOString();
    await persist(db);
    return set;
  });
}

export async function deleteSet(id: string): Promise<boolean> {
  return serialize(async () => {
    const db = await load();
    const before = db.sets.length;
    db.sets = db.sets.filter((set) => set.id !== id);
    delete db.progress.sets[id];
    if (db.sets.length === before) return false;
    await persist(db);
    return true;
  });
}

export async function getProgress(): Promise<ProgressState> {
  const db = await load();
  return { ...db.progress, sets: { ...db.progress.sets } };
}

export interface ProgressPatch {
  setId: string;
  terms?: Record<string, TermProgress>;
  answeredDelta?: number;
  correctDelta?: number;
  missedDelta?: number;
}

export async function recordProgress(patch: ProgressPatch): Promise<ProgressState> {
  return serialize(async () => {
    const db = await load();
    if (!db.progress.sets[patch.setId]) db.progress.sets[patch.setId] = emptySetProgress();
    const target = db.progress.sets[patch.setId];

    if (patch.terms) {
      target.terms = { ...target.terms, ...patch.terms };
    }
    const answered = Math.max(0, patch.answeredDelta ?? 0);
    const correct = Math.max(0, patch.correctDelta ?? 0);
    const missed = Math.max(0, patch.missedDelta ?? 0);

    target.totalAnswered += answered;
    target.totalCorrect += correct;
    target.totalMissed += missed;
    target.lastStudied = new Date().toISOString();
    db.progress.totalAnswered += answered;
    db.progress.totalCorrect += correct;

    await persist(db);
    return { ...db.progress, sets: { ...db.progress.sets } };
  });
}

/** Create the set on demand (e.g. after the database file was removed). */
export async function ensureSeed(): Promise<void> {
  await load();
}
