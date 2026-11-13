'use client';

import type { StudyMode, View } from '@/lib/types';
import { Logo } from './Logo';
import {
  BlastIcon,
  BlocksIcon,
  CardsIcon,
  CharmsIcon,
  HomeIcon,
  LearnIcon,
  MatchIcon,
  SearchIcon,
  SettingsIcon,
  TestIcon,
} from './icons';

interface SidebarProps {
  view: View;
  onNavigate: (view: View) => void;
  onMode: (mode: StudyMode) => void;
  onOpenSettings: () => void;
  setTitle?: string;
}

const LIBRARY: { mode: StudyMode; label: string; icon: typeof CardsIcon }[] = [
  { mode: 'flashcards', label: 'Flashcards', icon: CardsIcon },
  { mode: 'learn', label: 'Learn', icon: LearnIcon },
  { mode: 'test', label: 'Test', icon: TestIcon },
  { mode: 'blocks', label: 'Blocks', icon: BlocksIcon },
  { mode: 'blast', label: 'Blast', icon: BlastIcon },
  { mode: 'match', label: 'Match', icon: MatchIcon },
  { mode: 'charms', label: 'Charms', icon: CharmsIcon },
];

export default function Sidebar({ view, onNavigate, onMode, onOpenSettings, setTitle }: SidebarProps) {
  const activeMode = view.kind === 'mode' ? view.mode : null;

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-inner">
        <button className="brand" type="button" onClick={() => onNavigate({ kind: 'home' })} aria-label="Examify home">
          <Logo size={36} />
        </button>

        <button
          type="button"
          className={`nav-item${view.kind === 'home' ? ' active' : ''}`}
          onClick={() => onNavigate({ kind: 'home' })}
          aria-current={view.kind === 'home' ? 'page' : undefined}
        >
          <HomeIcon className="ico" />
          <span className="nav-text">Home</span>
        </button>
        <button
          type="button"
          className={`nav-item${view.kind === 'search' ? ' active' : ''}`}
          onClick={() => onNavigate({ kind: 'search' })}
          aria-current={view.kind === 'search' ? 'page' : undefined}
        >
          <SearchIcon className="ico" />
          <span className="nav-text">Search</span>
        </button>

        <div className="nav-label">Your library</div>
        {LIBRARY.map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            type="button"
            className={`nav-item${activeMode === mode ? ' active' : ''}`}
            onClick={() => onMode(mode)}
            aria-current={activeMode === mode ? 'page' : undefined}
            title={label}
          >
            <Icon className="ico" />
            <span className="nav-text">{label}</span>
          </button>
        ))}

        <div className="spacer" />
        <p className="sidebar-note">{setTitle ? `Studying: ${setTitle}` : 'Pick a set to start studying.'}</p>
        <div className="nav-label">Account</div>
        <button type="button" className="nav-item" onClick={onOpenSettings} title="Settings">
          <SettingsIcon className="ico" />
          <span className="nav-text">Settings</span>
        </button>
      </div>
      <div className="sidebar-foot">
        <span className="avatar" aria-hidden="true">
          E
        </span>
        <div className="nav-text" style={{ fontSize: 13 }}>
          <div style={{ fontWeight: 700 }}>Local learner</div>
          <div style={{ color: 'var(--muted)', fontSize: 11.5 }}>Progress saved to your library</div>
        </div>
      </div>
    </aside>
  );
}
