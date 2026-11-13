'use client';

import type { ReactNode } from 'react';
import { CloseIcon, SettingsIcon } from './icons';

interface ModeHeaderProps {
  label: string;
  icon: ReactNode;
  setTitle: string;
  onClose: () => void;
  onSettings?: () => void;
  right?: ReactNode;
}

export default function ModeHeader({ label, icon, setTitle, onClose, onSettings, right }: ModeHeaderProps) {
  return (
    <div className="mode-head">
      <div className="mode-title">
        <span className="mode-dot" aria-hidden="true">
          {icon}
        </span>
        {label}
      </div>
      <span className="set-label">{setTitle}</span>
      <div className="spacer" />
      {right}
      {onSettings ? (
        <button type="button" className="icon-btn" onClick={onSettings} aria-label="Study settings" title="Study settings">
          <SettingsIcon size={18} />
        </button>
      ) : null}
      <button type="button" className="icon-btn" onClick={onClose} aria-label="Exit study mode" title="Exit">
        <CloseIcon size={18} />
      </button>
    </div>
  );
}
