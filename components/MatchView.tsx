'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { StudySet, Term } from '@/lib/types';
import { formatTime, sample, shuffle } from '@/lib/utils';
import ModeHeader from './ModeHeader';
import { MatchIcon, TimerIcon } from './icons';

interface MatchViewProps {
  set: StudySet;
  onExit: () => void;
}

interface Tile {
  key: string;
  termId: string;
  kind: 'term' | 'definition';
  text: string;
}

type Phase = 'ready' | 'playing' | 'done';

const PAIRS = 6;

function buildBoard(pairs: Term[]): Tile[] {
  return shuffle(
    pairs.flatMap((term) => [
      { key: `${term.id}-term`, termId: term.id, kind: 'term' as const, text: term.term },
      { key: `${term.id}-def`, termId: term.id, kind: 'definition' as const, text: term.definition },
    ]),
  );
}

export default function MatchView({ set, onExit }: MatchViewProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [tiles, setTiles] = useState<Tile[]>(() =>
    buildBoard(sample(set.terms, Math.min(PAIRS, set.terms.length))),
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finalMs, setFinalMs] = useState(0);

  const startedAt = useRef(0);
  const penaltyRef = useRef(0);

  const startGame = useCallback(() => {
    const pairs = sample(set.terms, Math.min(PAIRS, set.terms.length));
    setTiles(buildBoard(pairs));
    setSelected([]);
    setMatched([]);
    setWrong([]);
    setMoves(0);
    setPenalty(0);
    setElapsed(0);
    setFinalMs(0);
    penaltyRef.current = 0;
    startedAt.current = Date.now();
    setPhase('playing');
  }, [set.terms]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setInterval(() => {
      setElapsed(Date.now() - startedAt.current + penaltyRef.current);
    }, 80);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (wrong.length === 0) return;
    const timer = setTimeout(() => {
      setWrong([]);
      setSelected([]);
    }, 520);
    return () => clearTimeout(timer);
  }, [wrong]);

  const clickTile = (tile: Tile) => {
    if (phase !== 'playing' || matched.includes(tile.key) || wrong.length > 0) return;
    if (selected.includes(tile.key)) return;

    if (selected.length === 0) {
      setSelected([tile.key]);
      return;
    }

    const first = tiles.find((item) => item.key === selected[0]);
    if (!first) {
      setSelected([tile.key]);
      return;
    }
    if (first.kind === tile.kind) {
      setSelected([tile.key]);
      return;
    }

    setMoves((value) => value + 1);
    if (first.termId === tile.termId) {
      const nextMatched = [...matched, first.key, tile.key];
      setMatched(nextMatched);
      setSelected([]);
      if (nextMatched.length === tiles.length) {
        const total = Date.now() - startedAt.current + penaltyRef.current;
        setFinalMs(total);
        setElapsed(total);
        setPhase('done');
      }
    } else {
      penaltyRef.current += 1000;
      setPenalty(penaltyRef.current);
      setWrong([first.key, tile.key]);
    }
  };

  return (
    <div className="mode-shell">
      <ModeHeader
        label="Match"
        icon={<MatchIcon size={16} />}
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
          <span className="chip">{moves} attempts</span>
          <span className="chip chip-bad">+{Math.round(penalty / 1000)}s penalty</span>
          <span className="chip">
            {matched.length / 2} / {tiles.length / 2 || Math.min(PAIRS, set.terms.length)} pairs
          </span>
        </div>

        <div className="match-board">
          {tiles.map((tile) => {
            const isSelected = selected.includes(tile.key);
            const isWrong = wrong.includes(tile.key);
            const isMatched = matched.includes(tile.key);
            return (
              <button
                key={tile.key}
                type="button"
                className={`tile${isSelected ? ' selected' : ''}${isWrong ? ' wrong' : ''}${isMatched ? ' matched' : ''}`}
                onClick={() => clickTile(tile)}
                disabled={isMatched || phase !== 'playing'}
                aria-label={`${tile.kind === 'term' ? 'Term' : 'Definition'}: ${tile.text}`}
              >
                <span className="tile-kind">{tile.kind === 'term' ? 'Term' : 'Definition'}</span>
                {tile.text}
              </button>
            );
          })}
        </div>

        {phase === 'ready' ? (
          <div className="overlay" style={{ position: 'absolute' }}>
            <div className="overlay-card">
              <div style={{ fontSize: 38, marginBottom: 8 }} aria-hidden="true">
                <MatchIcon size={44} />
              </div>
              <h2>Ready to play?</h2>
              <p className="muted">
                Match all six terms with their definitions as fast as you can. Every wrong match adds a 1-second
                penalty.
              </p>
              <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={startGame}>
                Start game
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'done' ? (
          <div className="overlay" style={{ position: 'absolute' }}>
            <div className="overlay-card">
              <div style={{ fontSize: 38 }} aria-hidden="true">
                🏁
              </div>
              <h2>Board cleared</h2>
              <div className="big-time">{formatTime(finalMs)}</div>
              <p className="muted">
                {moves} attempts · {Math.round(penalty / 1000)}s in penalties
              </p>
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
