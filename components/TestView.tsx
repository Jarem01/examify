'use client';

import { useCallback, useMemo, useState } from 'react';
import { buildTest } from '@/lib/questions';
import type { MatchingQuestion, Question, StudySet } from '@/lib/types';
import { shuffle, speak } from '@/lib/utils';
import { playFeedback } from '@/lib/sfx';
import ModeHeader from './ModeHeader';
import { TestIcon, VolumeIcon } from './icons';

interface TestViewProps {
  set: StudySet;
  sound: boolean;
  onExit: () => void;
}

type Answer = number | boolean | Record<string, string> | null;

const COUNTS = [10, 20, 30, -1] as const;

function gradeQuestion(question: Question, answer: Answer): boolean {
  if (question.type === 'mcq') return answer === question.answerIndex;
  if (question.type === 'tf') return answer === question.answer;
  if (question.type === 'matching') {
    const links = (answer ?? {}) as Record<string, string>;
    return question.pairs.every((pair) => links[pair.termId] === pair.termId);
  }
  return false;
}

function answerSummary(question: Question, answer: Answer): string {
  if (question.type === 'mcq') {
    return typeof answer === 'number' ? question.options[answer] : 'No answer';
  }
  if (question.type === 'tf') {
    if (answer === null || answer === undefined) return 'No answer';
    return answer ? 'True' : 'False';
  }
  if (question.type === 'matching') {
    const links = (answer ?? {}) as Record<string, string>;
    const correct = question.pairs.filter((pair) => links[pair.termId] === pair.termId).length;
    return `${correct} of ${question.pairs.length} pairs matched`;
  }
  return 'No answer';
}

export default function TestView({ set, sound, onExit }: TestViewProps) {
  const [phase, setPhase] = useState<'setup' | 'taking' | 'report'>('setup');
  const [count, setCount] = useState<number>(20);
  const [formats, setFormats] = useState({ mcq: true, tf: true, matching: true });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  const start = useCallback(() => {
    const total = count === -1 ? set.terms.length : Math.min(count, set.terms.length);
    setQuestions(buildTest(set.terms, total, formats));
    setAnswers({});
    setPhase('taking');
    window.scrollTo({ top: 0 });
  }, [count, formats, set.terms]);

  const submit = useCallback(() => {
    setPhase('report');
    window.scrollTo({ top: 0 });
  }, []);

  const result = useMemo(() => {
    const graded = questions.map((question) => ({
      question,
      correct: gradeQuestion(question, answers[question.id] ?? null),
    }));
    const correct = graded.filter((item) => item.correct).length;
    const percent = graded.length ? Math.round((correct / graded.length) * 100) : 0;
    return {
      graded,
      correct,
      percent,
      letter: percent >= 90 ? 'A' : percent >= 80 ? 'B' : percent >= 70 ? 'C' : percent >= 60 ? 'D' : 'F',
    };
  }, [questions, answers]);

  const answeredCount = questions.filter((question) => {
    const value = answers[question.id];
    if (question.type === 'matching') return value && Object.keys(value as Record<string, string>).length > 0;
    return value !== undefined && value !== null;
  }).length;

  if (phase === 'setup') {
    return (
      <div className="mode-shell">
        <ModeHeader label="Test" icon={<TestIcon size={16} />} setTitle={set.title} onClose={onExit} />
        <div className="test-shell">
          <div className="learn-card">
            <span className="eyebrow">Practice test</span>
            <h2 className="h1" style={{ fontSize: 30, margin: '8px 0 10px' }}>
              Build your test
            </h2>
            <p className="muted">
              Unlike Learn, a test is completed in one sitting and graded at the end — missed questions are reviewed
              in the report.
            </p>

            <hr className="divider" />

            <div className="settings-group">
              <h3 className="h3" style={{ marginBottom: 10 }}>
                Number of questions
              </h3>
              <div className="seg-picker">
                {COUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={count === value ? 'active' : ''}
                    onClick={() => setCount(value)}
                  >
                    {value === -1 ? `All (${set.terms.length})` : value}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-group">
              <h3 className="h3" style={{ marginBottom: 10 }}>
                Question formats
              </h3>
              {[
                { key: 'mcq' as const, label: 'Multiple choice', desc: 'Pick the matching definition or term.' },
                { key: 'tf' as const, label: 'True / false', desc: 'Judge whether the pairing is correct.' },
                { key: 'matching' as const, label: 'Matching', desc: 'Link four terms to their definitions.' },
              ].map((item) => (
                <div className="settings-row" key={item.key}>
                  <div>
                    <div className="label">{item.label}</div>
                    <div className="desc">{item.desc}</div>
                  </div>
                  <button
                    type="button"
                    className={`switch${formats[item.key] ? ' on' : ''}`}
                    role="switch"
                    aria-checked={formats[item.key]}
                    aria-label={item.label}
                    onClick={() => setFormats((previous) => ({ ...previous, [item.key]: !previous[item.key] }))}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: 22 }}
              onClick={start}
              disabled={set.terms.length === 0 || !formats.mcq && !formats.tf && !formats.matching}
            >
              Start test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'report') {
    return (
      <div className="mode-shell">
        <ModeHeader
          label="Test report"
          icon={<TestIcon size={16} />}
          setTitle={set.title}
          onClose={onExit}
          right={
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPhase('setup')}>
              New test
            </button>
          }
        />
        <div className="test-shell">
          <section className="report-hero">
            <span className="eyebrow">Final grade</span>
            <div className="grade" style={{ margin: '6px 0 4px' }}>
              {result.percent}%
            </div>
            <h2 className="h2">Grade {result.letter}</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              {result.correct} of {result.graded.length} questions correct
            </p>
            <div className="row" style={{ justifyContent: 'center', marginTop: 16, gap: 10 }}>
              <span className="chip chip-good">{result.correct} correct</span>
              <span className="chip chip-bad">{result.graded.length - result.correct} missed</span>
            </div>
          </section>

          <section className="card">
            <h2 className="h2" style={{ marginBottom: 10 }}>
              Question review
            </h2>
            {result.graded.map(({ question, correct }, index) => (
              <div className="review-item" key={question.id}>
                <span className={`review-mark ${correct ? 'ok' : 'no'}`} aria-hidden="true">
                  {correct ? '✓' : '✕'}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="small muted" style={{ marginBottom: 4 }}>
                    Question {index + 1} ·{' '}
                    {question.type === 'mcq' ? 'Multiple choice' : question.type === 'tf' ? 'True / false' : 'Matching'}
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>
                    {question.type === 'mcq'
                      ? question.prompt
                      : question.type === 'tf'
                        ? question.statement
                        : question.type === 'matching'
                          ? `Match ${question.pairs.length} pairs`
                          : 'Select all that apply'}
                  </div>
                  <div className="small muted">Your answer: {answerSummary(question, answers[question.id] ?? null)}</div>
                  {!correct ? (
                    <div className="small" style={{ color: '#9bf3c8', marginTop: 4 }}>
                      {question.type === 'mcq'
                        ? `Correct answer: ${question.options[question.answerIndex]}`
                        : question.type === 'tf'
                          ? `Correct: ${question.answer ? 'True' : 'False'} — ${question.correctDefinition}`
                          : question.type === 'matching'
                            ? 'Correct pairings: ' +
                              question.pairs.map((pair) => `${pair.term} → ${pair.definition}`).join(' · ')
                            : 'No answer recorded.'}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mode-shell">
      <ModeHeader
        label="Test"
        icon={<TestIcon size={16} />}
        setTitle={set.title}
        onClose={onExit}
        right={
          <button type="button" className="btn btn-primary btn-sm" onClick={submit}>
            Submit test
          </button>
        }
      />
      <div className="test-shell">
        <div className="test-scorebar">
          <span className="count">
            {answeredCount} / {questions.length}
          </span>
          <span className="small muted">answered</span>
        </div>

        {questions.map((question, index) => (
          <section className="test-card" key={question.id} id={`q-${index + 1}`}>
            <div className="test-card-head">
              <span>
                {question.type === 'mcq' ? 'Multiple choice' : question.type === 'tf' ? 'True / false' : 'Matching'}
              </span>
              <span>
                {index + 1} of {questions.length}
              </span>
            </div>

            {question.type === 'mcq' ? (
              <>
                <p className="test-stem">{question.prompt}</p>
                <div className="row" style={{ gap: 6, marginBottom: 12 }}>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: 34, height: 34 }}
                    aria-label="Read the question aloud"
                    onClick={() => speak(question.prompt, true)}
                  >
                    <VolumeIcon size={15} />
                  </button>
                  <span className="small muted">Read aloud</span>
                </div>
                <div className="option-grid">
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={`${question.id}-${optionIndex}`}
                      type="button"
                      className={`option${answers[question.id] === optionIndex ? ' selected' : ''}`}
                      aria-pressed={answers[question.id] === optionIndex}
                      onClick={() => {
                        setAnswers((previous) => ({ ...previous, [question.id]: optionIndex }));
                        playFeedback(optionIndex === question.answerIndex, sound);
                      }}
                    >
                      <span className="option-key">{optionIndex + 1}</span>
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {question.type === 'tf' ? (
              <>
                <p className="test-stem">{question.statement}</p>
                <div className="option-grid">
                  {[true, false].map((value) => (
                    <button
                      key={String(value)}
                      type="button"
                      className={`option${answers[question.id] === value ? ' selected' : ''}`}
                      aria-pressed={answers[question.id] === value}
                      onClick={() => {
                        setAnswers((previous) => ({ ...previous, [question.id]: value }));
                        playFeedback(value === question.answer, sound);
                      }}
                    >
                      <span className="option-key">{value ? 'T' : 'F'}</span>
                      <span>{value ? 'True' : 'False'}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {question.type === 'matching' ? (
              <MatchingInput
                question={question}
                sound={sound}
                value={(answers[question.id] as Record<string, string>) ?? {}}
                onChange={(next) => setAnswers((previous) => ({ ...previous, [question.id]: next }))}
              />
            ) : null}
          </section>
        ))}

        <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
          <button type="button" className="btn btn-primary" onClick={submit}>
            Submit test
          </button>
        </div>
      </div>
    </div>
  );
}

function MatchingInput({
  question,
  value,
  sound,
  onChange,
}: {
  question: MatchingQuestion;
  value: Record<string, string>;
  sound: boolean;
  onChange: (next: Record<string, string>) => void;
}) {
  const terms = useMemo(() => shuffle(question.pairs.map((pair) => ({ id: pair.termId, text: pair.term }))), [question.id]);
  const definitions = useMemo(
    () => shuffle(question.pairs.map((pair) => ({ id: pair.termId, text: pair.definition }))),
    [question.id],
  );
  const [activeTerm, setActiveTerm] = useState<string | null>(null);

  const usedDefinitions = new Set(Object.values(value));

  return (
    <div>
      <p className="question-hint">Click a term, then its definition</p>
      <div className="match-pairs">
        <div className="match-col">
          {terms.map((term) => (
            <button
              key={term.id}
              type="button"
              className={`pair-chip${activeTerm === term.id ? ' active' : ''}${value[term.id] ? ' linked' : ''}`}
              onClick={() => setActiveTerm(term.id)}
            >
              {term.text}
            </button>
          ))}
        </div>
        <div className="match-col">
          {definitions.map((definition) => {
            const linkedTerm = Object.entries(value).find(([, definitionId]) => definitionId === definition.id)?.[0];
            return (
              <button
                key={definition.id}
                type="button"
                className={`pair-chip${usedDefinitions.has(definition.id) ? ' linked' : ''}`}
                disabled={!activeTerm}
                onClick={() => {
                  if (!activeTerm) return;
                  onChange({ ...value, [activeTerm]: definition.id });
                  playFeedback(definition.id === activeTerm, sound);
                  setActiveTerm(null);
                }}
              >
                {definition.text}
                {linkedTerm ? <span className="pair-index" style={{ marginLeft: 8 }}>✓</span> : null}
              </button>
            );
          })}
        </div>
      </div>
      <div className="row" style={{ marginTop: 12, gap: 8 }}>
        <span className="chip">{Object.keys(value).length} / {question.pairs.length} paired</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange({})}>
          Clear links
        </button>
      </div>
    </div>
  );
}
