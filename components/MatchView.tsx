'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { StudySet, Term } from '@/lib/types';
import { formatTime, sample, shuffle } from '@/lib/utils';
import { playFeedback } from '@/lib/sfx';
import { readSession, writeSession } from '@/lib/session';
import ModeHeader from './ModeHeader';
import { MatchIcon, TimerIcon } from './icons';

interface MatchViewProps {
  set: StudySet;
  sound: boolean;
  sessionKey: string;
  onExit: () => void;
}

interface SavedMatch {
  phase: Phase;
  /** Tile text is rebuilt from the set, so the session stores ids only. */
  tiles: { key: string; termId: string; kind: Tile['kind'] }[];
  matched: string[];
  moves: number;
  penalty: number;
  elapsed: number;
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

export default function MatchView({ set, sound, sessionKey, onExit }: MatchViewProps) {
  const restored = useMemo(() => {
    const saved = readSession<SavedMatch>(sessionKey);
    if (!saved || !Array.isArray(saved.tiles) || saved.tiles.length === 0) return null;
    const byId = new Map(set.terms.map((term) => [term.id, term]));
    const tiles: Tile[] = [];
    for (const tile of saved.tiles) {
      const term = byId.get(tile.termId);
      if (!term) return null;
      tiles.push({
        key: tile.key,
        termId: tile.termId,
        kind: tile.kind,
        text: tile.kind === 'term' ? term.term : term.definition,
      });
    }
    return { ...saved, tiles };
  }, [sessionKey, set.terms]);
  const resumable = restored?.phase === 'playing';

  const [phase, setPhase] = useState<Phase>(resumable ? 'playing' : 'ready');
  const [tiles, setTiles] = useState<Tile[]>(() =>
    resumable && restored ? restored.tiles : buildBoard(sample(set.terms, Math.min(PAIRS, set.terms.length))),
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>(resumable && restored ? restored.matched : []);
  const [wrong, setWrong] = useState<string[]>([]);
  const [moves, setMoves] = useState(resumable && restored ? restored.moves : 0);
  const [penalty, setPenalty] = useState(resumable && restored ? restored.penalty : 0);
  const [elapsed, setElapsed] = useState(resumable && restored ? restored.elapsed : 0);
  const [finalMs, setFinalMs] = useState(0);

  const startedAt = useRef(0);
  const penaltyRef = useRef(resumable && restored ? restored.penalty : 0);
  const elapsedSeconds = Math.floor(elapsed / 1000);

  /* Pick the clock back up where the saved round left off. */
  useEffect(() => {
    if (phase !== 'playing' || startedAt.current !== 0) return;
    startedAt.current = Date.now() - Math.max(0, elapsed - penaltyRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    writeSession(sessionKey, {
      phase: phase === 'done' ? 'ready' : phase,
      tiles: tiles.map(({ key, termId, kind }) => ({ key, termId, kind })),
      matched,
      moves,
      penalty,
      elapsed: elapsedSeconds * 1000,
    });
  }, [sessionKey, phase, tiles, matched, moves, penalty, elapsedSeconds]);

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
    playFeedback(first.termId === tile.termId, sound);
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
                <span className="tile-text" title={tile.text}>
                  {tile.text}
                </span>
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
