'use client';

import { ACCENTS, ACCENT_LABELS } from '@/lib/settings';
import type { AccentName, Settings } from '@/lib/types';
import { CloseIcon } from './icons';

interface SettingsModalProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

function Switch({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`switch${checked ? ' on' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
    />
  );
}

export default function SettingsModal({ settings, onChange, onClose }: SettingsModalProps) {
  const accentNames: AccentName[] = ['indigo', 'green', 'coral'];

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal narrow">
        <div className="modal-head">
          <div>
            <h2 id="settings-title">Settings</h2>
            <p className="muted small" style={{ marginTop: 4 }}>
              Theme, question types and round size.
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close settings">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          <section>
            <h3 className="h3" style={{ marginBottom: 4 }}>
              Accent colour
            </h3>
            <p className="muted small" style={{ marginBottom: 12 }}>
              Used for progress rings, buttons, active states and correct answers.
            </p>
            <div className="swatches">
              {accentNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`swatch${settings.accent === name && !settings.customAccent ? ' active' : ''}`}
                  style={{ background: ACCENTS[name] }}
                  aria-label={ACCENT_LABELS[name]}
                  aria-pressed={settings.accent === name}
                  title={ACCENT_LABELS[name]}
                  onClick={() => onChange({ accent: name, customAccent: null })}
                />
              ))}
              <label
                className="swatch"
                title="Custom colour"
                style={{
                  background: 'conic-gradient(#ff725b,#ffcd1f,#23b26d,#4255ff,#c96bff,#ff725b)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="color"
                  value={settings.customAccent ?? '#4255ff'}
                  onChange={(event) => onChange({ customAccent: event.target.value })}
                  style={{ opacity: 0, position: 'absolute', width: 1, height: 1 }}
                  aria-label="Pick a custom accent colour"
                />
                <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(0,0,0,.45)', padding: '2px 5px', borderRadius: 6 }}>
                  +
                </span>
              </label>
            </div>
            {settings.customAccent ? (
              <p className="small muted" style={{ marginTop: 10 }}>
                Custom accent active ·{' '}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange({ customAccent: null })}>
                  Reset
                </button>
              </p>
            ) : null}
          </section>

          <hr className="divider" />

          <section>
            <h3 className="h3" style={{ marginBottom: 4 }}>
              Learn question types
            </h3>
            <p className="muted small" style={{ marginBottom: 6 }}>
              Learn never asks you to type — every question is answered by selecting.
            </p>
            <div className="settings-row">
              <div>
                <div className="label">Multiple choice</div>
                <div className="desc">Four plausible options, one correct answer.</div>
              </div>
              <Switch
                checked={settings.allowMultipleChoice}
                label="Multiple choice questions"
                onToggle={() => onChange({ allowMultipleChoice: !settings.allowMultipleChoice })}
              />
            </div>
            <div className="settings-row">
              <div>
                <div className="label">True / false</div>
                <div className="desc">Judge whether a term is paired with the right definition.</div>
              </div>
              <Switch
                checked={settings.allowTrueFalse}
                label="True or false questions"
                onToggle={() => onChange({ allowTrueFalse: !settings.allowTrueFalse })}
              />
            </div>
            <div className="settings-row">
              <div>
                <div className="label">Select all that apply</div>
                <div className="desc">Pick every correct term–definition pairing.</div>
              </div>
              <Switch
                checked={settings.allowSelectAll}
                label="Select all that apply questions"
                onToggle={() => onChange({ allowSelectAll: !settings.allowSelectAll })}
              />
            </div>
          </section>

          <hr className="divider" />

          <section>
            <div className="settings-row">
              <div>
                <div className="label">Cards per round</div>
                <div className="desc">Each round is a batch of 7–10 new cards.</div>
              </div>
              <div className="seg-picker">
                {[7, 8, 9, 10].map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={settings.sectionSize === size ? 'active' : ''}
                    onClick={() => onChange({ sectionSize: size })}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-row">
              <div>
                <div className="label">Sound</div>
                <div className="desc">Correct/incorrect tones and spoken cards.</div>
              </div>
              <Switch
                checked={settings.sound}
                label="Sound"
                onToggle={() => onChange({ sound: !settings.sound })}
              />
            </div>
            <div className="settings-row">
              <div>
                <div className="label">Speak automatically in Learn</div>
                <div className="desc">Start each new Learn question with audio.</div>
              </div>
              <Switch
                checked={settings.autoSpeak}
                label="Automatically speak questions"
                onToggle={() => onChange({ autoSpeak: !settings.autoSpeak })}
              />
            </div>
          </section>
        </div>

        <div className="modal-foot">
          <span className="small muted">Settings are saved on this device.</span>
          <div className="spacer" />
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
