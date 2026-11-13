'use client';

import { useMemo, useState } from 'react';
import type { SetSummary } from '@/lib/types';
import { SearchIcon } from './icons';

interface SearchViewProps {
  sets: SetSummary[];
  onOpenSet: (setId: string) => void;
}

export default function SearchView({ sets, onOpenSet }: SearchViewProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return sets;
    return sets.filter(
      (set) =>
        set.title.toLowerCase().includes(needle) ||
        set.description.toLowerCase().includes(needle) ||
        set.subject.toLowerCase().includes(needle),
    );
  }, [query, sets]);

  return (
    <div>
      <span className="eyebrow">Search</span>
      <h1 className="h1" style={{ margin: '8px 0 18px' }}>
        Find a study set
      </h1>
      <div className="topsearch" style={{ maxWidth: 620, marginBottom: 26 }}>
        <SearchIcon size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, subject or description"
          aria-label="Search study sets"
          autoFocus
        />
      </div>

      <div className="section-head" style={{ marginTop: 0 }}>
        <h2 className="h2">
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </h2>
      </div>

      {results.length === 0 ? (
        <div className="empty">No sets match “{query}”. Try a different keyword.</div>
      ) : (
        <div className="card-grid">
          {results.map((set) => {
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
                  <span>{set.masteredCount} learned</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
