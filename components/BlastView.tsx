'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pickDistractors } from '@/lib/questions';
import type { StudySet, Term } from '@/lib/types';
import { shuffle } from '@/lib/utils';
import { playFeedback } from '@/lib/sfx';
import { readSession, writeSession } from '@/lib/session';
import ModeHeader from './ModeHeader';
import { BlastIcon } from './icons';

interface BlastViewProps {
  set: StudySet;
  sound: boolean;
  sessionKey: string;
  onExit: () => void;
}

interface SavedBlast {
  phase: Phase;
  lives: number;
  score: number;
  streak: number;
  answered: number;
  rock: Rock | null;
}

interface Rock {
  id: number;
  term: Term;
  options: string[];
  answer: number;
}

type Phase = 'ready' | 'playing' | 'transition' | 'over' | 'won';

const MAX_QUESTIONS = 20;
const START_LIVES = 3;

export default function BlastView({ set, sound, sessionKey, onExit }: BlastViewProps) {
  /* Unfinished rounds resume from the rock that was falling, not from scratch. */
  const restored = useMemo(() => {
    const saved = readSession<SavedBlast>(sessionKey);
    if (!saved || !saved.rock) return null;
    if (saved.phase !== 'playing' && saved.phase !== 'transition') return null;
    if (!set.terms.some((term) => term.id === saved.rock?.term.id)) return null;
    return saved;
  }, [sessionKey, set.terms]);

  const [phase, setPhase] = useState<Phase>(restored ? 'playing' : 'ready');
  const [rock, setRock] = useState<Rock | null>(restored?.rock ?? null);
  const [fall, setFall] = useState(0);
  const [duration, setDuration] = useState(8500);
  const [lives, setLives] = useState(restored?.lives ?? START_LIVES);
  const [score, setScore] = useState(restored?.score ?? 0);
  const [streak, setStreak] = useState(restored?.streak ?? 0);
  const [answered, setAnswered] = useState(restored?.answered ?? 0);
  const [flash, setFlash] = useState<{ index: number; correct: boolean } | null>(null);

  const livesRef = useRef(restored?.lives ?? START_LIVES);
  const answeredRef = useRef(restored?.answered ?? 0);

  useEffect(() => {
    writeSession(sessionKey, { phase, lives, score, streak, answered, rock });
  }, [sessionKey, phase, lives, score, streak, answered, rock]);
  const impactRef = useRef<() => void>(() => undefined);

  const spawn = useCallback(() => {
    if (set.terms.length === 0) return;
    const term = set.terms[Math.floor(Math.random() * set.terms.length)];
    const distractors = pickDistractors(term, set.terms, 3).map((item) => item.definition);
    const options = shuffle([term.definition, ...distractors]);
    setRock({ id: Date.now() + Math.random(), term, options, answer: options.indexOf(term.definition) });
    setFall(0);
    setFlash(null);
    setDuration(Math.max(5600, 8800 - answeredRef.current * 150));
  }, [set.terms]);

  const finishRound = useCallback(() => {
    if (answeredRef.current >= MAX_QUESTIONS || answeredRef.current >= set.terms.length) {
      setPhase('won');
      return true;
    }
    return false;
  }, [set.terms.length]);

  const impact = useCallback(() => {
    const remaining = livesRef.current - 1;
    livesRef.current = remaining;
    setLives(remaining);
    setStreak(0);
    answeredRef.current += 1;
    setAnswered(answeredRef.current);
    setFlash(null);
    if (remaining <= 0) {
      setPhase('over');
      return;
    }
    setPhase('transition');
    window.setTimeout(() => {
      if (finishRound()) return;
      spawn();
      setPhase('playing');
    }, 700);
  }, [finishRound, spawn]);

  impactRef.current = impact;

  useEffect(() => {
    if (phase !== 'playing' || !rock) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setFall(progress);
      if (progress >= 1) {
        impactRef.current();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, rock?.id, duration]);

  const startGame = useCallback(() => {
    livesRef.current = START_LIVES;
    answeredRef.current = 0;
    setLives(START_LIVES);
    setScore(0);
    setStreak(0);
    setAnswered(0);
    setFlash(null);
    spawn();
    setPhase('playing');
  }, [spawn]);

  const choose = (index: number) => {
    if (phase !== 'playing' || !rock || flash) return;
    const correct = index === rock.answer;
    setFlash({ index, correct });
    playFeedback(correct, sound);

    if (correct) {
      setScore((value) => value + Math.round(110 + (1 - fall) * 90));
      setStreak((value) => value + 1);
    } else {
      const remaining = livesRef.current - 1;
      livesRef.current = remaining;
      setLives(remaining);
      setStreak(0);
    }

    answeredRef.current += 1;
    setAnswered(answeredRef.current);
    setPhase('transition');

    window.setTimeout(() => {
      if (livesRef.current <= 0) {
        setPhase('over');
        return;
      }
      if (finishRound()) return;
      spawn();
      setPhase('playing');
    }, 720);
  };

  const inDanger = fall > 0.68;

  return (
    <div className="mode-shell">
      <ModeHeader
        label="Blast"
        icon={<BlastIcon size={16} />}
        setTitle={set.title}
        onClose={onExit}
        right={<span className="chip">{score} pts</span>}
      />

      <div className="game-stage">
        <div className="blast-stage">
          <div className="blast-hud">
            <div className="hearts" aria-label={`${lives} lives remaining`}>
              {Array.from({ length: START_LIVES }, (_, index) => (
                <span key={index} style={{ opacity: index < lives ? 1 : 0.22 }}>
                  ♥
                </span>
              ))}
            </div>
            <div>
              {answered} / {Math.min(MAX_QUESTIONS, set.terms.length)} · streak {streak}
            </div>
          </div>

          <div className="blast-sky">
            <div className="planet" aria-hidden="true" />

            {rock ? (
              <div
                className={`asteroid${inDanger ? ' danger' : ''}`}
                style={{ top: `${4 + fall * 68}%` }}
                key={rock.id}
              >
                <span className="asteroid-text" title={rock.term.term}>
                  {rock.term.term}
                </span>
              </div>
            ) : null}
          </div>

          {rock && phase !== 'ready' ? (
            <div className="blast-answer" role="group" aria-label="Choose the matching definition">
              {rock.options.map((option, index) => {
                let className = 'blast-option';
                if (flash) {
                  if (index === rock.answer) className += ' good';
                  else if (index === flash.index) className += ' bad';
                }
                return (
                  <button
                    key={`${rock.id}-${index}`}
                    type="button"
                    className={className}
                    disabled={Boolean(flash) || phase !== 'playing'}
                    onClick={() => choose(index)}
                  >
                    <span className="blast-option-text" title={option}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {phase === 'ready' ? (
            <div className="overlay">
              <div className="overlay-card">
                <div style={{ fontSize: 38, marginBottom: 8 }} aria-hidden="true">
                  <BlastIcon size={44} />
                </div>
                <h2>Planet under pressure</h2>
                <p className="muted">
                  An asteroid carrying a term is falling. Pick the correct definition before it hits the planet. Miss
                  one and you lose a life.
                </p>
                <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={startGame}>
                  Start game
                </button>
              </div>
            </div>
          ) : null}

          {phase === 'over' ? (
            <div className="overlay">
              <div className="overlay-card">
                <div style={{ fontSize: 38 }} aria-hidden="true">
                  💥
                </div>
                <h2>Planet lost</h2>
                <div className="big-time">{score} pts</div>
                <p className="muted">You answered {answered} questions before running out of lives.</p>
                <div className="row" style={{ justifyContent: 'center', marginTop: 20, gap: 10 }}>
                  <button type="button" className="btn btn-primary" onClick={startGame}>
                    Try again
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onExit}>
                    Back to set
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {phase === 'won' ? (
            <div className="overlay">
              <div className="overlay-card">
                <div style={{ fontSize: 38 }} aria-hidden="true">
                  🛡️
                </div>
                <h2>Planet defended</h2>
                <div className="big-time">{score} pts</div>
                <p className="muted">{answered} questions answered · {lives} lives left</p>
                <div className="row" style={{ justifyContent: 'center', marginTop: 20, gap: 10 }}>
                  <button type="button" className="btn btn-primary" onClick={startGame}>
                    Play again
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onExit}>
                    Back to set
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
