'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LearnState, SavedLearnState } from '@/lib/learn';
import {
  applyLearnAnswer,
  createLearnState,
  currentTerm,
  nextSection,
  restoreLearnState,
  serializeLearnState,
} from '@/lib/learn';
import { buildLearnQuestion } from '@/lib/questions';
import type { Question, SetProgress, Settings, StudySet, Term } from '@/lib/types';
import { speak } from '@/lib/utils';
import { playFeedback } from '@/lib/sfx';
import { clearSession, readSession, writeSession } from '@/lib/session';
import ModeHeader from './ModeHeader';
import { CheckIcon, FlameIcon, LearnIcon, TrophyIcon, VolumeIcon } from './icons';

interface LearnViewProps {
  set: StudySet;
  settings: Settings;
  progress: SetProgress | undefined;
  sessionKey: string;
  onAnswer: (termId: string, correct: boolean, streak: number) => void;
  onExit: () => void;
  onSettings: () => void;
}

interface FeedbackState {
  correct: boolean;
  detail?: string;
}

export default function LearnView({
  set,
  settings,
  progress,
  sessionKey,
  onAnswer,
  onExit,
  onSettings,
}: LearnViewProps) {
  /* Terms already mastered before this session are skipped so the round stays useful. */
  const masteredBefore = useMemo(() => {
    const mastered = new Set<string>();
    Object.entries(progress?.terms ?? {}).forEach(([id, value]) => {
      if (value.learned) mastered.add(id);
    });
    return mastered;
  }, []);

  /* Resume the saved round for this set/section if one is still open. */
  const restoredState = useMemo(() => {
    const saved = readSession<SavedLearnState>(sessionKey);
    if (!saved) return null;
    return restoreLearnState(saved, set.terms);
  }, [sessionKey, set.terms]);

  const sessionTerms = useMemo(() => {
    if (restoredState) return restoredState.pool;
    const remaining = set.terms.filter((term) => !masteredBefore.has(term.id));
    return remaining.length > 0 ? remaining : set.terms;
  }, [restoredState, set.terms, masteredBefore]);

  const [state, setState] = useState<LearnState>(
    () => restoredState ?? createLearnState(sessionTerms, settings.sectionSize),
  );

  useEffect(() => {
    if (state.complete) clearSession(sessionKey);
    else writeSession(sessionKey, serializeLearnState(state));
  }, [state, sessionKey]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [answered, setAnswered] = useState(false);
  const [nonce, setNonce] = useState(0);

  const answeredRef = useRef(false);
  const questionRef = useRef<Question | null>(null);
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );

  const term: Term | null = currentTerm(state);
  const termId = term?.id ?? null;
  const section = state.sections[state.sectionIndex] ?? [];

  useEffect(() => {
    if (!termId) {
      setQuestion(null);
      return;
    }
    if (answeredRef.current) return;
    const activeTerm = term;
    if (!activeTerm) return;
    if (questionRef.current?.termId === activeTerm.id) return;

    const next = buildLearnQuestion(
      activeTerm,
      set.terms,
      section,
      {
        mcq: settings.allowMultipleChoice,
        tf: settings.allowTrueFalse,
        sata: settings.allowSelectAll,
      },
      settings.direction,
    );
    questionRef.current = next;
    setQuestion(next);
    setSelected([]);
    setFeedback(null);
    setAnswered(false);
    // Speak the side being asked, never the answer side.
    if (settings.autoSpeak) {
      const spoken =
        next.type === 'mcq' ? next.prompt : next.type === 'tf' ? next.statement : activeTerm.term;
      speak(spoken, settings.sound);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termId, state.sectionIndex, nonce]);

  const submit = useCallback(
    (correct: boolean, detail?: string) => {
      if (!term || answeredRef.current) return;
      answeredRef.current = true;
      setAnswered(true);
      const outcome = applyLearnAnswer(state, term.id, correct);
      setState(outcome.state);
      setFeedback({ correct, detail });
      onAnswer(term.id, correct, outcome.state.streaks[term.id] ?? 0);
      playFeedback(correct, settings.sound);
      setFlash(correct ? 'good' : 'bad');
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(null), 900);
    },
    [onAnswer, settings.sound, state, term],
  );

  const advance = useCallback(() => {
    answeredRef.current = false;
    questionRef.current = null;
    setAnswered(false);
    setFeedback(null);
    setSelected([]);
    setQuestion(null);
    setNonce((value) => value + 1);
  }, []);

  const restart = useCallback(() => {
    answeredRef.current = false;
    questionRef.current = null;
    setFeedback(null);
    setSelected([]);
    setQuestion(null);
    setState(createLearnState(sessionTerms, settings.sectionSize));
    setNonce((value) => value + 1);
  }, [sessionTerms, settings.sectionSize]);

  const continueRound = useCallback(() => {
    answeredRef.current = false;
    questionRef.current = null;
    setFeedback(null);
    setSelected([]);
    setQuestion(null);
    setState((previous) => nextSection(previous));
    setNonce((value) => value + 1);
  }, []);

  const total = set.terms.length;
  const masteredTotal = Math.min(total, masteredBefore.size + state.learned.length);
  const pct = total > 0 ? Math.round((masteredTotal / total) * 100) : 0;
  const toggleSelect = (index: number) => {
    if (answered) return;
    setSelected((previous) =>
      previous.includes(index) ? previous.filter((value) => value !== index) : [...previous, index],
    );
  };

  if (total === 0) {
    return (
      <div className="mode-shell">
        <ModeHeader label="Learn" icon={<LearnIcon size={16} />} setTitle={set.title} onClose={onExit} onSettings={onSettings} />
        <div className="empty">This set has no cards yet. Import some terms first.</div>
      </div>
    );
  }

  return (
    <div className="mode-shell">
      <ModeHeader
        label="Learn"
        icon={<LearnIcon size={16} />}
        setTitle={set.title}
        onClose={onExit}
        onSettings={onSettings}
      />

      <div className="learn-top">
        <div
          className="ring"
          style={{ ['--p' as string]: pct }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Set mastery: ${masteredTotal} of ${total} terms learned`}
        >
          <div className="ring-inner">
            <div className="ring-value">
              {masteredTotal}/{total}
            </div>
            <div className="ring-label">mastered</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="eyebrow">
              {state.reviewRound ? 'Review' : 'Round'} {Math.min(state.sectionIndex + 1, state.sections.length)} of{' '}
              {state.sections.length}
            </span>
            <span className="small muted">Pass {state.pass}</span>
          </div>
          <div className={`segments${flash ? ` flash-${flash}` : ''}`} aria-hidden="true">
            {state.sections.map((_, index) => {
              const done = index < state.sectionIndex || (index === state.sectionIndex && state.sectionDone);
              const current = index === state.sectionIndex && !state.sectionDone;
              return (
                <span
                  key={index}
                  className={`segment${done ? ' done' : ''}${current ? ' current' : ''}`}
                  title={`Round ${index + 1}`}
                />
              );
            })}
          </div>
          <div className="stat-strip" style={{ marginTop: 14 }}>
            <span className="chip">
              <FlameIcon size={13} /> Current streak {state.streak}
            </span>
            <span className="chip chip-good">{state.correct} correct</span>
            <span className="chip chip-bad">{state.missed} missed</span>
            <span className="chip">Best streak {state.bestStreak}</span>
          </div>
        </div>
      </div>

      {state.complete ? (
        <section className="learn-card">
          <div className="section-done">
            <div className="trophy" aria-hidden="true">
              <TrophyIcon size={46} />
            </div>
            <h2 className="h2">Set complete</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              You worked through every round. {masteredTotal} of {total} terms are now marked learned.
            </p>
            <div className="row" style={{ justifyContent: 'center', marginTop: 20, gap: 10 }}>
              <span className="chip chip-good">{state.correct} correct</span>
              <span className="chip chip-bad">{state.missed} missed</span>
              <span className="chip">Best streak {state.bestStreak}</span>
            </div>
            <div className="row" style={{ justifyContent: 'center', marginTop: 24, gap: 10 }}>
              <button type="button" className="btn btn-primary" onClick={restart}>
                Study this set again
              </button>
              <button type="button" className="btn btn-secondary" onClick={onExit}>
                Back to set
              </button>
            </div>
          </div>
        </section>
      ) : state.sectionDone ? (
        <section className="learn-card">
          <div className="section-done">
            <div className="trophy" aria-hidden="true">
              <CheckIcon size={44} />
            </div>
            <h2 className="h2">Round {state.sectionIndex + 1} complete</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              Every card in this round is done. Cards you missed were retried until you got them right.
            </p>
            <div className="row" style={{ justifyContent: 'center', marginTop: 18, gap: 10 }}>
              <span className="chip chip-good">{state.correct} correct</span>
              <span className="chip chip-bad">{state.missed} missed</span>
            </div>
            <button type="button" className="btn btn-primary" style={{ marginTop: 22 }} onClick={continueRound}>
              Continue to the next round
            </button>
          </div>
        </section>
      ) : question ? (
        <section className="learn-card">
          {state.retryNotice ? (
            <div className="retry-banner" role="status">
              <FlameIcon size={16} />
              You missed this question — let&apos;s try it again.
            </div>
          ) : null}

          <div className="question-meta">
            <span>
              {question.type === 'mcq'
                ? question.promptSide === 'term'
                  ? 'Term → definition'
                  : 'Definition → term'
                : question.type === 'tf'
                  ? 'True or false'
                  : 'Select all that apply'}
            </span>
            <div className="row" style={{ gap: 8 }}>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 34, height: 34 }}
                aria-label="Read this card aloud"
                onClick={() =>
                  speak(question.type === 'mcq' ? question.prompt : term?.term ?? '', settings.sound)
                }
              >
                <VolumeIcon size={16} />
              </button>
              <span>Question {state.answered + 1}</span>
            </div>
          </div>

          {question.type === 'mcq' ? (
            <>
              <p className={`question-prompt${question.promptSide === 'definition' ? ' definition' : ''}`}>
                {question.prompt}
              </p>
              <div className="question-hint">Choose an answer</div>
              <div className="option-grid" role="group" aria-label="Answer choices">
                {question.options.map((option, index) => {
                  const isCorrect = index === question.answerIndex;
                  const chosen = selected.includes(index);
                  let className = 'option';
                  if (answered) {
                    if (isCorrect) className += ' correct';
                    else if (chosen) className += ' wrong';
                  }
                  return (
                    <button
                      key={`${question.id}-${index}`}
                      type="button"
                      className={className}
                      disabled={answered}
                      aria-pressed={chosen}
                      onClick={() => {
                        setSelected([index]);
                        submit(isCorrect);
                      }}
                    >
                      <span className="option-key">{index + 1}</span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {question.type === 'tf' ? (
            <>
              <p className="question-prompt definition">{question.statement}</p>
              <div className="question-hint">Is this pairing correct?</div>
              <div className="option-grid" role="group" aria-label="True or false">
                {[true, false].map((value, optionIndex) => {
                  const isCorrect = value === question.answer;
                  const picked = selected.includes(optionIndex);
                  let className = 'option';
                  if (answered && isCorrect) className += ' correct';
                  else if (answered && picked) className += ' wrong';
                  return (
                    <button
                      key={String(value)}
                      type="button"
                      className={className}
                      disabled={answered}
                      aria-pressed={picked}
                      onClick={() => {
                        setSelected([optionIndex]);
                        submit(value === question.answer);
                      }}
                    >
                      <span className="option-key">{value ? 'T' : 'F'}</span>
                      <span>{value ? 'True' : 'False'}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {question.type === 'sata' ? (
            <>
              <p className="question-prompt">{question.prompt}</p>
              <div className="question-hint">Select every correct pairing, then submit</div>
              <div className="option-grid" role="group" aria-label="Select all that apply">
                {question.options.map((option, index) => {
                  const chosen = selected.includes(index);
                  const [pairTerm, pairDefinition] = option.text.split('\n');
                  let className = 'option';
                  if (answered) {
                    if (option.correct) className += ' correct';
                    else if (chosen) className += ' wrong';
                  } else if (chosen) {
                    className += ' selected';
                  }
                  return (
                    <button
                      key={`${question.id}-${index}`}
                      type="button"
                      className={className}
                      disabled={answered}
                      aria-pressed={chosen}
                      onClick={() => toggleSelect(index)}
                    >
                      <span className="option-key">{chosen ? '✓' : index + 1}</span>
                      <span className="option-pair">
                        <strong>{pairTerm}</strong>
                        <span>{pairDefinition}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {!answered ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: 16 }}
                  disabled={selected.length === 0}
                  onClick={() => {
                    const chosenKey = [...selected].sort((a, b) => a - b).join(',');
                    submit(chosenKey === question.answerKey.join(','));
                  }}
                >
                  Submit answer
                </button>
              ) : null}
            </>
          ) : null}

          {feedback ? (
            <div className={`feedback ${feedback.correct ? 'good' : 'bad'}`} role="status" aria-live="polite">
              <span aria-hidden="true">{feedback.correct ? '✓' : '✕'}</span>
              <div>
                <div>{feedback.correct ? 'Correct!' : 'Not quite — this card comes back at the end of the round.'}</div>
                {feedback.detail ? (
                  <div className="small" style={{ opacity: 0.85, marginTop: 3 }}>
                    {feedback.detail}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="learn-foot">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (question.type === 'mcq') {
                  setSelected([question.answerIndex]);
                  submit(false, `Correct answer: ${question.options[question.answerIndex]}`);
                } else if (question.type === 'tf') {
                  submit(false, question.correctDefinition);
                } else {
                  submit(false, 'The correct pairings are highlighted above.');
                }
              }}
              disabled={answered}
            >
              Don&apos;t know?
            </button>
            <div className="spacer" />
            <button type="button" className="btn btn-primary" onClick={advance} disabled={!answered}>
              Continue
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
