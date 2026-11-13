'use client';

import { useState } from 'react';
import type { StudySet } from '@/lib/types';
import { CloseIcon, PlusIcon, TrashIcon } from './icons';

export interface EditPayload {
  title: string;
  description: string;
  terms: { id?: string; term: string; definition: string }[];
}

interface EditSetModalProps {
  set: StudySet;
  onClose: () => void;
  onSave: (payload: EditPayload) => void | Promise<void>;
}

interface Row {
  key: string;
  id?: string;
  term: string;
  definition: string;
}

let rowSeq = 0;
const newRow = (): Row => ({ key: `new-${(rowSeq += 1)}`, term: '', definition: '' });

export default function EditSetModal({ set, onClose, onSave }: EditSetModalProps) {
  const [title, setTitle] = useState(set.title);
  const [description, setDescription] = useState(set.description);
  const [rows, setRows] = useState<Row[]>(() =>
    set.terms.map((term) => ({ key: term.id, id: term.id, term: term.term, definition: term.definition })),
  );
  const [saving, setSaving] = useState(false);

  const filled = rows.filter((row) => row.term.trim() && row.definition.trim());
  const canSave = filled.length > 0 && title.trim().length > 0 && !saving;

  const update = (key: string, patch: Partial<Row>) =>
    setRows((previous) => previous.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      description: description.trim(),
      terms: filled.map((row) => ({ id: row.id, term: row.term.trim(), definition: row.definition.trim() })),
    });
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-set-title">
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2 id="edit-set-title">Edit set</h2>
            <p className="muted small" style={{ marginTop: 4 }}>
              Changes are saved in this browser.
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close editor">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          <label className="field">
            <span className="field-label">Title</span>
            <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              className="textarea"
              rows={2}
              value={description}
              placeholder="Add a description…"
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <div>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
              <span className="field-label">
                Terms · {filled.length} of {rows.length}
              </span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRows((r) => [...r, newRow()])}>
                <PlusIcon size={14} /> Add card
              </button>
            </div>

            <div className="edit-rows">
              {rows.map((row, index) => (
                <div className="edit-row" key={row.key}>
                  <span className="edit-index">{index + 1}</span>
                  <input
                    className="input"
                    value={row.term}
                    placeholder="Term"
                    onChange={(event) => update(row.key, { term: event.target.value })}
                  />
                  <input
                    className="input"
                    value={row.definition}
                    placeholder="Definition"
                    onChange={(event) => update(row.key, { definition: event.target.value })}
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Remove card ${index + 1}`}
                    title="Remove"
                    onClick={() => setRows((previous) => previous.filter((item) => item.key !== row.key))}
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <div className="spacer" />
          <button type="button" className="btn btn-primary" disabled={!canSave} onClick={save}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
