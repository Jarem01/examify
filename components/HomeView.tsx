'use client';

import { useMemo } from 'react';
import type { ProgressState, SetSummary, StudyMode } from '@/lib/types';
import { pluralize } from '@/lib/utils';
import { CardsIcon, LearnIcon, PlusIcon, SparkIcon } from './icons';
import { LogoMark } from './Logo';

interface HomeViewProps {
  sets: SetSummary[];
  progress: ProgressState;
  onOpenSet: (setId: string) => void;
  onMode: (setId: string, mode: StudyMode) => void;
  onImport: () => void;
}

export default function HomeView({ sets, progress, onOpenSet, onMode, onImport }: HomeViewProps) {
  const stats = useMemo(() => {
    const totalTerms = sets.reduce((total, set) => total + set.termCount, 0);
    const mastered = sets.reduce((total, set) => total + set.masteredCount, 0);
    const answered = progress.totalAnswered;
    const correct = progress.totalCorrect;
    return {
      totalTerms,
      mastered,
      answered,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      masteryPct: totalTerms > 0 ? Math.round((mastered / totalTerms) * 100) : 0,
    };
  }, [sets, progress]);

  const recent = sets.slice(0, 6);
  const continueSet = sets.find((set) => set.masteredCount < set.termCount) ?? sets[0];

  return (
    <div>
      <section className="hero" aria-labelledby="hero-title">
        <LogoMark size={320} className="hero-watermark" decorative />
        <span className="eyebrow hero-eyebrow">
          <LogoMark size={18} decorative />
          Your study dashboard
        </span>
        <h1 id="hero-title" style={{ marginTop: 10 }}>
          Master every term,
          <br />
          one round at a time.
        </h1>
        <p>
          Adaptive Learn rounds, selection-only games and graded practice tests — all built around your library.
        </p>
        <div className="hero-actions">
          {continueSet ? (
            <>
              <button type="button" className="btn btn-primary" onClick={() => onMode(continueSet.id, 'learn')}>
                <SparkIcon size={17} />
                Continue learning
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => onMode(continueSet.id, 'flashcards')}>
                <CardsIcon size={17} />
                Flashcards
              </button>
            </>
          ) : null}
          <button type="button" className="btn btn-secondary" onClick={onImport}>
            <PlusIcon size={17} />
            Import a set
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <div className="stat-value">{stats.masteryPct}%</div>
            <div className="stat-label">Overall mastery</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.mastered}</div>
            <div className="stat-label">Terms learned of {stats.totalTerms}</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.answered}</div>
            <div className="stat-label">Questions answered</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.accuracy}%</div>
            <div className="stat-label">Answer accuracy</div>
          </div>
        </div>
      </section>

      <div className="section-head" style={{ marginTop: 0 }}>
        <div>
          <h2 className="h2">Recent sets</h2>
          <p className="muted small" style={{ marginTop: 4 }}>
            {sets.length} {pluralize(sets.length, 'set')} in your library
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onImport}>
          <PlusIcon size={15} />
          New set
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="empty">
          <h3 className="h3" style={{ marginBottom: 6 }}>
            Your library is empty
          </h3>
          <p className="small">Import a set to start studying — paste text or upload a PDF.</p>
        </div>
      ) : (
        <div className="card-grid">
          {recent.map((set) => {
            const pct = set.termCount ? Math.round((set.masteredCount / set.termCount) * 100) : 0;
            return (
              <button key={set.id} type="button" className="set-card" onClick={() => onOpenSet(set.id)}>
                <div className="set-meta">
                  {set.subject ? <span className="chip">{set.subject}</span> : null}
                  <span>{set.termCount} terms</span>
                </div>
                <div className="set-title">{set.title}</div>
                <p className="small muted" style={{ lineHeight: 1.45 }}>
                  {set.description || 'No description yet.'}
                </p>
                <div className="set-foot">
                  <span className="mini-ring" style={{ ['--p' as string]: pct }} aria-hidden="true">
                    <span>{pct}%</span>
                  </span>
                  <span>
                    {set.masteredCount} learned · {set.termCount - set.masteredCount} to go
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {sets.length > 0 ? (
        <>
          <div className="section-head">
            <div>
              <h2 className="h2">Jump into a mode</h2>
              <p className="muted small" style={{ marginTop: 4 }}>
                {continueSet?.title}
              </p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onOpenSet(continueSet.id)}>
              <LearnIcon size={15} />
              Set details
            </button>
          </div>
          <div className="mode-grid">
            {[
              { mode: 'learn' as StudyMode, title: 'Learn', desc: 'Adaptive rounds, 7 cards at a time', bg: 'linear-gradient(140deg,#7b5cff,#43299f)' },
              { mode: 'flashcards' as StudyMode, title: 'Flashcards', desc: 'Flip, shuffle, mark what you know', bg: 'linear-gradient(140deg,#4b5bff,#2933a3)' },
              { mode: 'test' as StudyMode, title: 'Test', desc: 'Graded practice test with a report', bg: 'linear-gradient(140deg,#1f8f5f,#10603f)' },
              { mode: 'match' as StudyMode, title: 'Match', desc: 'Beat the clock, avoid penalties', bg: 'linear-gradient(140deg,#ff8a5b,#c14a29)' },
            ].map((item) => (
              <button
                key={item.mode}
                type="button"
                className="mode-card"
                style={{ background: item.bg }}
                onClick={() => onMode(continueSet.id, item.mode)}
              >
                <span className="mode-icon" aria-hidden="true">
                  <SparkIcon size={18} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
