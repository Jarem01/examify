'use client';

import { useMemo, useState } from 'react';
import type { SetProgress, SetSection, StudyMode, StudySet } from '@/lib/types';
import { pluralize } from '@/lib/utils';
import { downloadSet, printSet } from '@/lib/setIO';
import SetMenu from './SetMenu';
import {
  ArrowLeftIcon,
  BlastIcon,
  BlocksIcon,
  CardsIcon,
  CharmsIcon,
  LearnIcon,
  MatchIcon,
  PlusIcon,
  TestIcon,
  TrashIcon,
} from './icons';

interface SetViewProps {
  set: StudySet;
  progress: SetProgress | undefined;
  onMode: (mode: StudyMode, section?: { termIds: string[]; name: string }) => void;
  onNewSection: (section: SetSection | null) => void;
  onDeleteSection: (section: SetSection) => void;
  onImport: () => void;
  onHome: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onCombine: () => void;
  onNotify: (message: string) => void;
}

const MODES: { mode: StudyMode; title: string; desc: string; bg: string }[] = [
  { mode: 'flashcards', title: 'Flashcards', desc: 'Flip through every card', bg: 'linear-gradient(140deg,#4b5bff,#2933a3)' },
  { mode: 'learn', title: 'Learn', desc: 'Adaptive rounds · 7 cards', bg: 'linear-gradient(140deg,#7b5cff,#43299f)' },
  { mode: 'test', title: 'Test', desc: 'Graded practice test', bg: 'linear-gradient(140deg,#1f8f5f,#10603f)' },
  { mode: 'match', title: 'Match', desc: 'Pair terms against the clock', bg: 'linear-gradient(140deg,#ff8a5b,#c14a29)' },
  { mode: 'blast', title: 'Blast', desc: 'Defend the planet', bg: 'linear-gradient(140deg,#ff5b8a,#b62b56)' },
  { mode: 'blocks', title: 'Blocks', desc: 'Memory grid · 8 pairs', bg: 'linear-gradient(140deg,#3aa6d8,#1f6f9c)' },
  { mode: 'charms', title: 'Charms', desc: 'Memory grid · 6 pairs', bg: 'linear-gradient(140deg,#c96bff,#7a2fb0)' },
];

const ICONS: Record<StudyMode, typeof CardsIcon> = {
  flashcards: CardsIcon,
  learn: LearnIcon,
  test: TestIcon,
  match: MatchIcon,
  blast: BlastIcon,
  blocks: BlocksIcon,
  charms: CharmsIcon,
};

export default function SetView({
  set,
  progress,
  onMode,
  onNewSection,
  onDeleteSection,
  onImport,
  onHome,
  onEdit,
  onCopy,
  onDelete,
  onCombine,
  onNotify,
}: SetViewProps) {
  const [showAll, setShowAll] = useState(false);
  const mastered = useMemo(
    () => set.terms.filter((term) => progress?.terms[term.id]?.learned).length,
    [set.terms, progress],
  );
  const pct = set.terms.length ? Math.round((mastered / set.terms.length) * 100) : 0;
  const visibleTerms = showAll ? set.terms : set.terms.slice(0, 40);
  const termIds = useMemo(() => new Set(set.terms.map((term) => term.id)), [set.terms]);
  const sections = set.sections ?? [];

  return (
    <div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onHome} style={{ marginBottom: 14 }}>
        <ArrowLeftIcon size={16} />
        Back to home
      </button>

      <section className="set-hero">
        <div style={{ minWidth: 0 }}>
          <span className="eyebrow">{set.subject || 'Study set'}</span>
          <h1 className="h1" style={{ fontSize: 'clamp(24px,3vw,34px)', margin: '8px 0 10px' }}>
            {set.title}
          </h1>
          <p className="muted" style={{ maxWidth: 620 }}>
            {set.description || 'No description yet.'}
          </p>
          <div className="row wrap" style={{ marginTop: 16, gap: 8 }}>
            <span className="chip">{set.terms.length} terms</span>
            <span className={mastered > 0 ? 'chip chip-good' : 'chip'}>
              {mastered} of {set.terms.length} learned
            </span>
            <span className="chip">{pct}% mastered</span>
          </div>
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          <button type="button" className="btn btn-primary" onClick={() => onMode('learn')}>
            <LearnIcon size={17} />
            Learn
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onMode('flashcards')}>
            <CardsIcon size={17} />
            Flashcards
          </button>
          <button type="button" className="btn btn-ghost" onClick={onImport}>
            <PlusIcon size={16} />
            Import
          </button>
          <SetMenu
            title={set.title}
            onEdit={onEdit}
            onCopy={onCopy}
            onDelete={onDelete}
            onCombine={onCombine}
            onPrint={() => printSet(set)}
            onExport={() => {
              downloadSet(set);
              onNotify(`Exported ${set.terms.length} cards as a .txt file.`);
            }}
          />
        </div>
      </section>

      <div className="progress-track" style={{ marginBottom: 26 }} aria-hidden="true">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="section-head" style={{ marginTop: 0 }}>
        <div>
          <h2 className="h2">Study modes</h2>
          <p className="muted small" style={{ marginTop: 4 }}>
            Every mode is selection-based — no typing required.
          </p>
        </div>
      </div>

      <div className="mode-grid">
        {MODES.map(({ mode, title, desc, bg }) => {
          const Icon = ICONS[mode];
          return (
            <button key={mode} type="button" className="mode-card" style={{ background: bg }} onClick={() => onMode(mode)}>
              <span className="mode-icon" aria-hidden="true">
                <Icon size={19} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="section-head">
        <div>
          <h2 className="h2">Sections</h2>
          <p className="muted small" style={{ marginTop: 4 }}>
            Group cards inside this set and study just that group.
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onNewSection(null)}>
          <PlusIcon size={14} /> New section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="empty" style={{ marginBottom: 26 }}>
          No sections yet. Create one to study a slice of this set — for example “Exam 2 only”.
        </div>
      ) : (
        <div style={{ marginBottom: 26 }}>
          {sections.map((section) => {
            const ids = section.termIds.filter((id) => termIds.has(id));
            const learned = ids.filter((id) => progress?.terms[id]?.learned).length;
            return (
              <div className="section-row" key={section.id}>
                <div style={{ minWidth: 0 }}>
                  <div className="section-name">{section.name}</div>
                  <div className="small muted">
                    {ids.length} cards · {learned}/{ids.length} mastered
                  </div>
                </div>
                <div className="row wrap" style={{ gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={ids.length === 0}
                    onClick={() => onMode('learn', { termIds: ids, name: section.name })}
                  >
                    <LearnIcon size={14} /> Learn
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={ids.length === 0}
                    onClick={() => onMode('test', { termIds: ids, name: section.name })}
                  >
                    <TestIcon size={14} /> Test
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNewSection(section)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Delete section ${section.name}`}
                    title="Delete section"
                    onClick={() => onDeleteSection(section)}
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="section-head">
        <div>
          <h2 className="h2">Terms in this set</h2>
          <p className="muted small" style={{ marginTop: 4 }}>
            {mastered} of {set.terms.length} {pluralize(set.terms.length, 'term')} learned
          </p>
        </div>
        {set.terms.length > 40 ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAll((value) => !value)}>
            {showAll ? 'Show fewer' : `Show all ${set.terms.length}`}
          </button>
        ) : null}
      </div>

      <div className="term-list">
        {visibleTerms.map((term, index) => {
          const learned = Boolean(progress?.terms[term.id]?.learned);
          return (
            <div key={term.id} className={`term-row${learned ? ' learned' : ''}`}>
              <span className="term-index">{index + 1}</span>
              <div className="t">{term.term}</div>
              <div className="d">{term.definition}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
