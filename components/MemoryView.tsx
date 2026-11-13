'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { StudySet, Term } from '@/lib/types';
import { formatTime, sample, shuffle } from '@/lib/utils';
import { readSession, writeSession } from '@/lib/session';
import ModeHeader from './ModeHeader';
import { BlocksIcon, CharmsIcon, TimerIcon } from './icons';

interface MemoryViewProps {
  set: StudySet;
  variant: 'blocks' | 'charms';
  sessionKey: string;
  onExit: () => void;
}

interface SavedMemory {
  phase: Phase;
  /** Card text is rebuilt from the set, so the session stores ids only. */
  cards: { key: string; termId: string; side: MemoryCard['side'] }[];
  matched: string[];
  moves: number;
  elapsed: number;
}

interface MemoryCard {
  key: string;
  termId: string;
  side: 'term' | 'definition';
  text: string;
}

type Phase = 'ready' | 'playing' | 'done';

const CHARM_GLYPHS = ['✦', '✧', '❖', '◆', '❉', '✹', '❋', '✺'];

function buildMemoryBoard(terms: Term[], limit: number): MemoryCard[] {
  const chosen = sample(terms, Math.min(limit, terms.length));
  return shuffle(
    chosen.flatMap((term) => [
      { key: `${term.id}-term`, termId: term.id, side: 'term' as const, text: term.term },
      { key: `${term.id}-def`, termId: term.id, side: 'definition' as const, text: term.definition },
    ]),
  );
}

export default function MemoryView({ set, variant, sessionKey, onExit }: MemoryViewProps) {
  const pairCount = variant === 'blocks' ? 8 : 6;
  const columns = 4;
  const restored = useMemo(() => {
    const saved = readSession<SavedMemory>(sessionKey);
    if (!saved || !Array.isArray(saved.cards) || saved.cards.length === 0) return null;
    const byId = new Map(set.terms.map((term) => [term.id, term]));
    const cards: MemoryCard[] = [];
    for (const card of saved.cards) {
      const term = byId.get(card.termId);
      if (!term) return null;
      cards.push({
        key: card.key,
        termId: card.termId,
        side: card.side,
        text: card.side === 'term' ? term.term : term.definition,
      });
    }
    return { ...saved, cards };
  }, [sessionKey, set.terms]);
  const resumable = restored?.phase === 'playing';

  const [phase, setPhase] = useState<Phase>(resumable ? 'playing' : 'ready');
  const [cards, setCards] = useState<MemoryCard[]>(() =>
    resumable && restored ? restored.cards : buildMemoryBoard(set.terms, pairCount),
  );
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>(resumable && restored ? restored.matched : []);
  const [moves, setMoves] = useState(resumable && restored ? restored.moves : 0);
  const [elapsed, setElapsed] = useState(resumable && restored ? restored.elapsed : 0);
  const [finalMs, setFinalMs] = useState(0);

  const startedAt = useRef(0);
  const lockRef = useRef(false);
  const elapsedSeconds = Math.floor(elapsed / 1000);

  useEffect(() => {
    if (phase !== 'playing' || startedAt.current !== 0) return;
    startedAt.current = Date.now() - elapsed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    writeSession(sessionKey, {
      phase: phase === 'done' ? 'ready' : phase,
      cards: cards.map(({ key, termId, side }) => ({ key, termId, side })),
      matched,
      moves,
      elapsed: elapsedSeconds * 1000,
    });
  }, [sessionKey, phase, cards, matched, moves, elapsedSeconds]);

  const startGame = useCallback(() => {
    setCards(buildMemoryBoard(set.terms, pairCount));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setElapsed(0);
    setFinalMs(0);
    lockRef.current = false;
    startedAt.current = Date.now();
    setPhase('playing');
  }, [pairCount, set.terms]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setInterval(() => setElapsed(Date.now() - startedAt.current), 100);
    return () => clearInterval(timer);
  }, [phase]);

  const clickCard = (card: MemoryCard) => {
    if (phase !== 'playing' || lockRef.current) return;
    if (matched.includes(card.key) || flipped.includes(card.key)) return;

    const next = [...flipped, card.key];
    setFlipped(next);
    if (next.length < 2) return;

    lockRef.current = true;
    setMoves((value) => value + 1);
    const [firstKey, secondKey] = next;
    const first = cards.find((item) => item.key === firstKey);
    const second = cards.find((item) => item.key === secondKey);

    if (first && second && first.termId === second.termId && first.side !== second.side) {
      window.setTimeout(() => {
        const nextMatched = [...matched, first.key, second.key];
        setMatched(nextMatched);
        setFlipped([]);
        lockRef.current = false;
        if (nextMatched.length === cards.length) {
          const total = Date.now() - startedAt.current;
          setFinalMs(total);
          setElapsed(total);
          setPhase('done');
        }
      }, 330);
    } else {
      window.setTimeout(() => {
        setFlipped([]);
        lockRef.current = false;
      }, 780);
    }
  };

  const label = variant === 'blocks' ? 'Blocks' : 'Charms';
  const Icon = variant === 'blocks' ? BlocksIcon : CharmsIcon;

  return (
    <div className="mode-shell">
      <ModeHeader
        label={label}
        icon={<Icon size={16} />}
        setTitle={set.title}
        onClose={onExit}
        right={
          <span className="chip">
            <TimerIcon size={14} />
            {formatTime(phase === 'ready' ? 0 : elapsed)}
          </span>
        }
      />

      <div className="game-stage">
        <div className="game-hud">
          <span className="chip">{moves} flips</span>
          <span className="chip">
            {matched.length / 2} / {cards.length / 2 || Math.min(pairCount, set.terms.length)} pairs
          </span>
        </div>

        <div className="memory-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(card.key) || matched.includes(card.key);
            return (
              <button
                key={card.key}
                type="button"
                className={`memory-card${isFlipped ? ' flipped' : ''}${matched.includes(card.key) ? ' matched' : ''}`}
                onClick={() => clickCard(card)}
                aria-label={isFlipped ? card.text : `Face down ${label} card ${index + 1}`}
              >
                <div className="memory-inner">
                  <div className="memory-face memory-front" aria-hidden="true">
                    {variant === 'charms' ? CHARM_GLYPHS[index % CHARM_GLYPHS.length] : '▦'}
                  </div>
                  <div className="memory-face memory-back">{card.text}</div>
                </div>
              </button>
            );
          })}
        </div>

        {phase === 'ready' ? (
          <div className="overlay">
            <div className="overlay-card">
              <div style={{ fontSize: 38, marginBottom: 8 }} aria-hidden="true">
                <Icon size={44} />
              </div>
              <h2>{label}</h2>
              <p className="muted">
                Flip two cards at a time. When the term and its definition match, they stay face up. Clear the board in
                the fewest flips.
              </p>
              <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={startGame}>
                Start game
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'done' ? (
          <div className="overlay">
            <div className="overlay-card">
              <div style={{ fontSize: 38 }} aria-hidden="true">
                🏆
              </div>
              <h2>Board cleared</h2>
              <div className="big-time">{formatTime(finalMs)}</div>
              <p className="muted">{moves} flips to match every pair</p>
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
  );
}
