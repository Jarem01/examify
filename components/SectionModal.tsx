'use client';

import { useMemo, useState } from 'react';
import type { SetSection, StudySet } from '@/lib/types';
import { uid } from '@/lib/utils';
import { CloseIcon } from './icons';

interface SectionModalProps {
  set: StudySet;
  section: SetSection | null;
  onClose: () => void;
  onSave: (section: SetSection) => void;
}

/** Name a subsection and tick the cards that belong to it. */
export default function SectionModal({ set, section, onClose, onSave }: SectionModalProps) {
  const [name, setName] = useState(section?.name ?? '');
  const [selected, setSelected] = useState<string[]>(section?.termIds ?? []);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return set.terms;
    return set.terms.filter(
      (term) =>
        term.term.toLowerCase().includes(needle) || term.definition.toLowerCase().includes(needle),
    );
  }, [query, set.terms]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const allFilteredSelected = filtered.length > 0 && filtered.every((term) => selectedSet.has(term.id));
  const canSave = name.trim().length > 0 && selected.length > 0;

  const toggle = (termId: string) =>
    setSelected((previous) =>
      previous.includes(termId) ? previous.filter((id) => id !== termId) : [...previous, termId],
    );

  const toggleAll = () => {
    if (allFilteredSelected) {
      const drop = new Set(filtered.map((term) => term.id));
      setSelected((previous) => previous.filter((id) => !drop.has(id)));
      return;
    }
    setSelected((previous) => {
      const next = new Set(previous);
      filtered.forEach((term) => next.add(term.id));
      return [...next];
    });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="section-title">
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2 id="section-title">{section ? 'Edit section' : 'New section'}</h2>
            <p className="muted small" style={{ marginTop: 4 }}>
              Pick the cards that belong to this subsection, then study just those.
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close section editor">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          <label className="field">
            <span className="field-label">Section name</span>
            <input
              className="input"
              value={name}
              placeholder="e.g. Exam 2 terms"
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <div>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
              <span className="field-label">
                Cards · {selected.length} of {set.terms.length} selected
              </span>
              <div className="row" style={{ gap: 6 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>
                  Clear
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={toggleAll}>
                  {allFilteredSelected ? 'Deselect shown' : 'Select all shown'}
                </button>
              </div>
            </div>

            <input
              className="input"
              style={{ marginBottom: 10 }}
              value={query}
              placeholder="Filter cards…"
              onChange={(event) => setQuery(event.target.value)}
            />

            <div className="section-term-list">
              {filtered.map((term) => (
                <label className="section-term" key={term.id}>
                  <input
                    type="checkbox"
                    checked={selectedSet.has(term.id)}
                    onChange={() => toggle(term.id)}
                  />
                  <span style={{ minWidth: 0 }}>
                    <span className="st-term">{term.term}</span>
                    <span className="st-def">{term.definition}</span>
                  </span>
                </label>
              ))}
              {filtered.length === 0 ? <div className="empty small">No cards match that filter.</div> : null}
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <span className="small muted">{selected.length} cards in this section</span>
          <div className="spacer" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canSave}
            onClick={() => onSave({ id: section?.id ?? uid('section'), name: name.trim(), termIds: selected })}
          >
            {section ? 'Save section' : 'Create section'}
          </button>
        </div>
      </div>
    </div>
  );
}
