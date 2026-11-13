'use client';

import { useState } from 'react';
import type { SetSummary } from '@/lib/types';
import { CloseIcon } from './icons';

interface CombineModalProps {
  sets: SetSummary[];
  currentSetId: string;
  onClose: () => void;
  onCombine: (ids: string[]) => void | Promise<void>;
}

export default function CombineModal({ sets, currentSetId, onClose, onCombine }: CombineModalProps) {
  const options = sets.filter((set) => set.id !== currentSetId);
  const [chosen, setChosen] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) =>
    setChosen((previous) => (previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]));

  const total = options
    .filter((set) => chosen.includes(set.id))
    .reduce((count, set) => count + set.termCount, 0);

  const combine = async () => {
    if (chosen.length === 0) return;
    setSaving(true);
    await onCombine(chosen);
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="combine-title">
      <div className="modal narrow">
        <div className="modal-head">
          <div>
            <h2 id="combine-title">Combine sets</h2>
            <p className="muted small" style={{ marginTop: 4 }}>
              Creates a new set with this set’s cards plus the ones you pick.
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close combine">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          {options.length === 0 ? (
            <p className="muted">You need at least two sets to combine. Import another set first.</p>
          ) : (
            <div className="combine-list">
              {options.map((set) => {
                const active = chosen.includes(set.id);
                return (
                  <button
                    key={set.id}
                    type="button"
                    className={`combine-row${active ? ' active' : ''}`}
                    aria-pressed={active}
                    onClick={() => toggle(set.id)}
                  >
                    <span className="combine-check" aria-hidden="true">{active ? '✓' : ''}</span>
                    <span className="combine-text">
                      <strong>{set.title}</strong>
                      <span className="small muted">{set.termCount} terms</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <span className="small muted">
            {chosen.length > 0 ? `${total} cards from ${chosen.length} set${chosen.length > 1 ? 's' : ''}` : 'Select sets to merge'}
          </span>
          <div className="spacer" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={chosen.length === 0 || saving} onClick={combine}>
            {saving ? 'Combining…' : 'Combine'}
          </button>
        </div>
      </div>
    </div>
  );
}
