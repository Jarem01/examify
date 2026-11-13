'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Settings, StudySet, Term } from '@/lib/types';
import { speak, shuffle } from '@/lib/utils';
import { readSession, writeSession } from '@/lib/session';
import ModeHeader from './ModeHeader';
import {
  CardsIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShuffleIcon,
  SparkIcon,
  VolumeIcon,
} from './icons';

interface FlashcardsViewProps {
  set: StudySet;
  settings: Settings;
  sessionKey: string;
  onExit: () => void;
}

interface SavedDeck {
  deckIds: string[];
  index: number;
  flipped: boolean;
  known: string[];
  shuffled: boolean;
}

export default function FlashcardsView({ set, settings, sessionKey, onExit }: FlashcardsViewProps) {
  const restored = useMemo(() => {
    const saved = readSession<SavedDeck>(sessionKey);
    if (!saved || !Array.isArray(saved.deckIds)) return null;
    const deck = saved.deckIds
      .map((id) => set.terms.find((term) => term.id === id))
      .filter((term): term is Term => Boolean(term));
    return deck.length > 0 ? { ...saved, deck } : null;
  }, [sessionKey, set.terms]);

  const [deck, setDeck] = useState<Term[]>(() => restored?.deck ?? [...set.terms]);
  const [index, setIndex] = useState(() =>
    restored ? Math.min(restored.index, Math.max(0, restored.deck.length - 1)) : 0,
  );
  const [flipped, setFlipped] = useState(restored?.flipped ?? false);
  const [known, setKnown] = useState<string[]>(restored?.known ?? []);
  const [shuffled, setShuffled] = useState(restored?.shuffled ?? false);

  useEffect(() => {
    writeSession(sessionKey, {
      deckIds: deck.map((term) => term.id),
      index,
      flipped,
      known,
      shuffled,
    });
  }, [deck, index, flipped, known, shuffled, sessionKey]);

  const card = deck[index];
  const progressPct = deck.length > 0 ? Math.round(((index + 1) / deck.length) * 100) : 0;

  const next = useCallback(() => {
    setFlipped(false);
    setIndex((current) => (deck.length === 0 ? 0 : (current + 1) % deck.length));
  }, [deck.length]);

  const previous = useCallback(() => {
    setFlipped(false);
    setIndex((current) => (deck.length === 0 ? 0 : (current - 1 + deck.length) % deck.length));
  }, [deck.length]);

  const markKnown = useCallback(() => {
    if (!card) return;
    setKnown((current) => [...current, card.id]);
    const remaining = deck.filter((term) => term.id !== card.id);
    setDeck(remaining);
    setFlipped(false);
    setIndex((current) => Math.min(current, Math.max(0, remaining.length - 1)));
  }, [card, deck]);

  const toggleShuffle = useCallback(() => {
    const nextValue = !shuffled;
    const remaining = [...set.terms].filter((term) => !known.includes(term.id));
    setShuffled(nextValue);
    setDeck(nextValue ? shuffle(remaining) : remaining);
    setIndex(0);
    setFlipped(false);
  }, [known, set.terms, shuffled]);

  const restart = useCallback(() => {
    setDeck(shuffled ? shuffle(set.terms) : [...set.terms]);
    setKnown([]);
    setIndex(0);
    setFlipped(false);
  }, [set.terms, shuffled]);

  const header = (
    <ModeHeader
      label="Flashcards"
      icon={<CardsIcon size={16} />}
      setTitle={set.title}
      onClose={onExit}
      right={
        <button type="button" className="btn btn-secondary btn-sm" onClick={toggleShuffle} aria-pressed={shuffled}>
          <ShuffleIcon size={15} />
          {shuffled ? 'Shuffled' : 'Shuffle'}
        </button>
      }
    />
  );

  const stats = useMemo(
    () => (
      <div className="row wrap" style={{ justifyContent: 'center', gap: 8 }}>
        <span className="chip">{deck.length} in deck</span>
        <span className="chip chip-good">{known.length} known</span>
      </div>
    ),
    [deck.length, known.length],
  );

  if (!card) {
    return (
      <div className="mode-shell">
        {header}
        <div className="learn-card" style={{ textAlign: 'center' }}>
          <div className="trophy" style={{ marginBottom: 10 }}>
            <SparkIcon size={42} />
          </div>
          <h2 className="h2">Every card is marked known</h2>
          <p className="muted" style={{ marginTop: 8 }}>
            You cleared the deck. Restart to run through the full set again.
          </p>
          <button type="button" className="btn btn-primary" style={{ marginTop: 20 }} onClick={restart}>
            Restart deck
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mode-shell">
      {header}
      <div className="flash-wrap">
        <div className="flash-progress">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="eyebrow">
              Card {index + 1} of {deck.length}
            </span>
            <span className="small muted">{shuffled ? 'Shuffled' : 'In order'}</span>
          </div>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="flash-stage">
          <div
            className={`flashcard${flipped ? ' flipped' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={flipped ? `Definition: ${card.definition}. Click to show the term.` : `Term: ${card.term}. Click to reveal the definition.`}
            onClick={() => setFlipped((value) => !value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setFlipped((value) => !value);
              }
            }}
          >
            <div className="flash-face">
              <span className="flash-label">Term</span>
              <div className="flash-text">{card.term}</div>
              <button
                type="button"
                className="icon-btn"
                style={{ position: 'absolute', bottom: 16, right: 16, width: 34, height: 34 }}
                aria-label="Read the term aloud"
                onClick={(event) => {
                  event.stopPropagation();
                  speak(card.term, settings.sound);
                }}
              >
                <VolumeIcon size={16} />
              </button>
              <span className="flash-hint">Click the card to flip</span>
            </div>
            <div className="flash-face back">
              <span className="flash-label">Definition</span>
              <div className="flash-text">{card.definition}</div>
              <button
                type="button"
                className="icon-btn"
                style={{ position: 'absolute', bottom: 16, right: 16, width: 34, height: 34 }}
                aria-label="Read the definition aloud"
                onClick={(event) => {
                  event.stopPropagation();
                  speak(card.definition, settings.sound);
                }}
              >
                <VolumeIcon size={16} />
              </button>
              <span className="flash-hint">Click the card to flip back</span>
            </div>
          </div>
        </div>

        {stats}

        <div className="flash-controls">
          <button type="button" className="icon-btn" onClick={previous} aria-label="Previous card">
            <ChevronLeftIcon size={18} />
          </button>
          <button type="button" className="btn btn-secondary" onClick={markKnown}>
            <CheckIcon size={16} />
            Known
          </button>
          <button type="button" className="btn btn-secondary" onClick={next}>
            Still learning
          </button>
          <button type="button" className="icon-btn" onClick={next} aria-label="Next card">
            <ChevronRightIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
