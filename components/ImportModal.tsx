'use client';

import { useMemo, useRef, useState } from 'react';
import {
  detectDelimiters,
  parseCards,
  parseProseCards,
  type CardDelimiter,
  type ParseOptions,
  type TermDelimiter,
} from '@/lib/parse';
import { CloseIcon, UploadIcon } from './icons';

/**
 * Read a PDF or plain-text file entirely in the browser. The app ships as
 * static files, so there is no server route to extract text.
 */
async function readFile(file: File): Promise<string> {
  if (file.size > 12 * 1024 * 1024) throw new Error('Please upload a file under 12 MB.');
  const buffer = new Uint8Array(await file.arrayBuffer());
  if (!file.name.toLowerCase().endsWith('.pdf')) return new TextDecoder('utf-8').decode(buffer);

  const { configureUnPDF, extractText, getDocumentProxy } = await import('unpdf');
  // Browser builds have to supply the bundled serverless PDF.js build.
  await configureUnPDF({ pdfjs: () => import('unpdf/pdfjs') });
  const pdf = await getDocumentProxy(buffer);
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join('\n') : text;
}

export interface ImportPayload {
  title: string;
  description: string;
  terms: { term: string; definition: string }[];
}

interface ImportModalProps {
  onClose: () => void;
  onCreate: (payload: ImportPayload) => void | Promise<void>;
  defaultTitle: string;
}

export default function ImportModal({ onClose, onCreate, defaultTitle }: ImportModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState('');
  const [text, setText] = useState('');
  const [termDelimiter, setTermDelimiter] = useState<TermDelimiter>('tab');
  const [cardDelimiter, setCardDelimiter] = useState<CardDelimiter>('newline');
  const [customTerm, setCustomTerm] = useState('-');
  const [customCard, setCustomCard] = useState(';');
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const options: ParseOptions = useMemo(
    () => ({
      termDelimiter,
      cardDelimiter,
      customTermDelimiter: customTerm,
      customCardDelimiter: customCard,
    }),
    [termDelimiter, cardDelimiter, customTerm, customCard],
  );

  const structured = useMemo(() => parseCards(text, options), [text, options]);
  const prose = useMemo(() => (text.trim() ? parseProseCards(text) : null), [text]);
  // A pasted/uploaded prose dump has no delimiters — fall back to Q&A detection.
  const usingProse = structured.cards.length < 2 && Boolean(prose && prose.cards.length > structured.cards.length);
  const preview = usingProse && prose ? prose : structured;

  const handleFile = async (file: File) => {
    setReading(true);
    setError(null);
    try {
      const extracted = await readFile(file);
      setText(extracted);
      const guess = detectDelimiters(extracted);
      if (guess.termDelimiter) setTermDelimiter(guess.termDelimiter);
      if (guess.cardDelimiter) setCardDelimiter(guess.cardDelimiter);
      if (guess.customTermDelimiter) setCustomTerm(guess.customTermDelimiter);
      if (extracted.trim().length === 0) setError('That file had no readable text.');
    } catch (error) {
      setError((error as Error).message || 'Could not read that file.');
    } finally {
      setReading(false);
    }
  };

  const submit = async () => {
    if (preview.cards.length === 0) return;
    setSaving(true);
    await onCreate({
      title: title.trim() || 'Imported study set',
      description: description.trim(),
      terms: preview.cards.map((card) => ({ term: card.term, definition: card.definition })),
    });
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2 id="import-title">Import your data</h2>
            <p className="muted small" style={{ marginTop: 4 }}>
              Paste from Word, Excel, Google Docs, or upload a PDF or table.
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close import dialog">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="row" style={{ gap: 10 }}>
            <input
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Set title"
              aria-label="Set title"
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInput.current?.click()}
              disabled={reading}
            >
              <UploadIcon size={16} />
              {reading ? 'Reading…' : 'Upload file'}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.txt,.csv,.tsv,.md"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
                event.target.value = '';
              }}
            />
          </div>

          <input
            className="input"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a description…"
            aria-label="Set description"
          />

          <textarea
            className="textarea"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={'Word 1\tDefinition 1\nWord 2\tDefinition 2\nWord 3\tDefinition 3'}
            aria-label="Paste your terms and definitions"
          />

          {error ? (
            <div className="feedback bad" role="alert">
              {error}
            </div>
          ) : null}

          <div className="import-grid">
            <div>
              <h3 className="h3" style={{ marginBottom: 10 }}>
                Between term and definition
              </h3>
              <div className="radio-group">
                <label className="radio">
                  <input
                    type="radio"
                    name="term-delimiter"
                    checked={termDelimiter === 'tab'}
                    onChange={() => setTermDelimiter('tab')}
                  />
                  Tab
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="term-delimiter"
                    checked={termDelimiter === 'comma'}
                    onChange={() => setTermDelimiter('comma')}
                  />
                  Comma
                </label>
                <label className="radio custom">
                  <input
                    type="radio"
                    name="term-delimiter"
                    checked={termDelimiter === 'custom'}
                    onChange={() => setTermDelimiter('custom')}
                  />
                  <span>Custom</span>
                  <input
                    className="input"
                    value={customTerm}
                    onFocus={() => setTermDelimiter('custom')}
                    onChange={(event) => setCustomTerm(event.target.value)}
                    aria-label="Custom term delimiter"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="h3" style={{ marginBottom: 10 }}>
                Between cards
              </h3>
              <div className="radio-group">
                <label className="radio">
                  <input
                    type="radio"
                    name="card-delimiter"
                    checked={cardDelimiter === 'newline'}
                    onChange={() => setCardDelimiter('newline')}
                  />
                  New line
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="card-delimiter"
                    checked={cardDelimiter === 'semicolon'}
                    onChange={() => setCardDelimiter('semicolon')}
                  />
                  Semicolon
                </label>
                <label className="radio custom">
                  <input
                    type="radio"
                    name="card-delimiter"
                    checked={cardDelimiter === 'custom'}
                    onChange={() => setCardDelimiter('custom')}
                  />
                  <span>Custom</span>
                  <input
                    className="input"
                    value={customCard}
                    onFocus={() => setCardDelimiter('custom')}
                    onChange={(event) => setCustomCard(event.target.value)}
                    aria-label="Custom card delimiter"
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className="preview-head">
              <h3 className="h3">
                Preview{' '}
                <span style={{ color: preview.cards.length ? 'var(--good)' : 'var(--muted)' }}>
                  {preview.cards.length} {preview.cards.length === 1 ? 'card' : 'cards'}
                </span>
              </h3>
              {usingProse ? <span className="chip">Prose Q&amp;A detected</span> : null}
              {preview.skipped > 0 ? <span className="chip chip-bad">{preview.skipped} skipped</span> : null}
            </div>
            {preview.cards.length === 0 ? (
              <p className="muted small">Nothing to preview yet.</p>
            ) : (
              <div className="preview-list">
                {preview.cards.slice(0, 12).map((card, index) => (
                  <div className="preview-row" key={`${card.term}-${index}`}>
                    <span className="t">{card.term}</span>
                    <span className="d">{card.definition}</span>
                  </div>
                ))}
              </div>
            )}
            {preview.errors.length > 0 ? (
              <p className="small muted" style={{ marginTop: 8 }}>
                {usingProse
                  ? 'No tab/comma delimiters found, so questions and answers were detected from the prose text.'
                  : preview.errors[0]}
              </p>
            ) : null}
          </div>
        </div>

        <div className="modal-foot">
          <span className="small muted">Delimiters are applied live as you type.</span>
          <div className="spacer" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={submit}
            disabled={preview.cards.length === 0 || saving}
          >
            {saving ? 'Creating…' : `Create set with ${preview.cards.length} cards`}
          </button>
        </div>
      </div>
    </div>
  );
}
