'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ProgressState,
  SetProgress,
  SetSummary,
  Settings,
  StudyMode,
  StudySet,
  TermProgress,
  View,
} from '@/lib/types';
import { DEFAULT_SETTINGS, loadSettings, resolveAccent, saveSettings } from '@/lib/settings';
import { createSet, ensureSeed, getProgress, getSet, listSets, recordProgress } from '@/lib/store';
import Sidebar from './Sidebar';
import HomeView from './HomeView';
import SearchView from './SearchView';
import SetView from './SetView';
import LearnView from './LearnView';
import FlashcardsView from './FlashcardsView';
import TestView from './TestView';
import MatchView from './MatchView';
import BlastView from './BlastView';
import MemoryView from './MemoryView';
import ImportModal, { type ImportPayload } from './ImportModal';
import SettingsModal from './SettingsModal';
import { SearchIcon, SettingsIcon, PlusIcon, SparkIcon } from './icons';

interface PendingPatch {
  terms: Record<string, TermProgress>;
  answered: number;
  correct: number;
  missed: number;
}

export default function AppShell() {
  const [sets, setSets] = useState<SetSummary[]>([]);
  const [progress, setProgress] = useState<ProgressState>({
    sets: {},
    totalAnswered: 0,
    totalCorrect: 0,
  });
  const progressRef = useRef<ProgressState>(progress);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>({ kind: 'home' });
  const [activeSet, setActiveSet] = useState<StudySet | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const pending = useRef<Record<string, PendingPatch>>({});
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  /* Sets and progress live in browser storage, so load them after mount. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureSeed();
      const [nextSets, nextProgress] = await Promise.all([listSets(), getProgress()]);
      if (cancelled) return;
      setSets(nextSets);
      setProgress(nextProgress);
      progressRef.current = nextProgress;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(timer);
  }, [toast]);

  /* keep summaries in sync with mastery */
  useEffect(() => {
    setSets((prev) =>
      prev.map((set) => {
        const setProgress = progress.sets[set.id];
        if (!setProgress) return set;
        const mastered = Object.values(setProgress.terms).filter((term) => term.learned).length;
        if (mastered === set.masteredCount) return set;
        return { ...set, masteredCount: Math.min(mastered, set.termCount) };
      }),
    );
  }, [progress]);

  /* load the set being studied */
  useEffect(() => {
    const id = view.kind === 'set' ? view.setId : view.kind === 'mode' ? view.setId : null;
    if (!id) return;
    if (activeSet?.id === id) return;
    let cancelled = false;
    (async () => {
      try {
        const set = await getSet(id);
        if (!cancelled && set) setActiveSet(set);
      } catch {
        if (!cancelled) setToast('Could not load that study set.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [view, activeSet?.id]);

  const flush = useCallback(async () => {
    const batch = pending.current;
    pending.current = {};
    await Promise.all(
      Object.entries(batch).map(([setId, patch]) =>
        recordProgress({
          setId,
          terms: patch.terms,
          answeredDelta: patch.answered,
          correctDelta: patch.correct,
          missedDelta: patch.missed,
        }).catch(() => undefined),
      ),
    );
  }, []);

  useEffect(
    () => () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
      void flush();
    },
    [flush],
  );

  const recordAnswer = useCallback(
    (setId: string, termId: string, correct: boolean, streak: number) => {
      const prev = progressRef.current;
      const currentSet: SetProgress =
        prev.sets[setId] ?? { terms: {}, totalAnswered: 0, totalCorrect: 0, totalMissed: 0 };
      const previousTerm: TermProgress =
        currentSet.terms[termId] ?? { streak: 0, learned: false, correct: 0, missed: 0 };
      const nextTerm: TermProgress = {
        streak,
        learned: previousTerm.learned || streak >= 2,
        correct: previousTerm.correct + 1,
        missed: previousTerm.missed + (correct ? 0 : 1),
        lastSeen: new Date().toISOString(),
      };
      const nextSet: SetProgress = {
        ...currentSet,
        terms: { ...currentSet.terms, [termId]: nextTerm },
        totalAnswered: currentSet.totalAnswered + 1,
        totalCorrect: currentSet.totalCorrect + (correct ? 1 : 0),
        totalMissed: currentSet.totalMissed + (correct ? 0 : 1),
        lastStudied: nextTerm.lastSeen,
      };
      const next: ProgressState = {
        ...prev,
        sets: { ...prev.sets, [setId]: nextSet },
        totalAnswered: prev.totalAnswered + 1,
        totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
      };
      progressRef.current = next;
      setProgress(next);

      const patch: PendingPatch =
        pending.current[setId] ?? { terms: {}, answered: 0, correct: 0, missed: 0 };
      pending.current[setId] = patch;
      patch.terms[termId] = nextTerm;
      patch.answered += 1;
      if (correct) patch.correct += 1;
      else patch.missed += 1;

      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(() => {
        flushTimer.current = null;
        void flush();
      }, 700);
    },
    [flush],
  );

  const openSet = useCallback((setId: string) => {
    setView({ kind: 'set', setId });
  }, []);

  const openMode = useCallback(
    (setId: string, mode: StudyMode) => {
      setView({ kind: 'mode', setId, mode });
    },
    [],
  );

  const handleCreate = useCallback(
    async (payload: ImportPayload) => {
      try {
        const created = await createSet(payload);
        if (!created || created.terms.length === 0) {
          setToast('Could not create that set.');
          return;
        }
        const summary: SetSummary = {
          id: created.id,
          title: created.title,
          description: created.description,
          subject: created.subject,
          termCount: created.terms.length,
          masteredCount: 0,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        };
        setSets((prev) => [summary, ...prev]);
        setActiveSet(created);
        setImportOpen(false);
        setView({ kind: 'mode', setId: created.id, mode: 'flashcards' });
        setToast(`Imported ${created.terms.length} cards into “${created.title}”.`);
      } catch {
        setToast('Something went wrong while saving that set.');
      }
    },
    [],
  );

  const navigate = useCallback((next: View) => setView(next), []);

  const targetSetId = activeSet?.id ?? sets[0]?.id ?? null;

  const handleSidebarMode = useCallback(
    (mode: StudyMode) => {
      if (!targetSetId) {
        setImportOpen(true);
        setToast('Import a set first to start studying.');
        return;
      }
      setView({ kind: 'mode', setId: targetSetId, mode });
    },
    [targetSetId],
  );

  const accent = resolveAccent(settings);
  const activeProgress = activeSet ? progress.sets[activeSet.id] : undefined;

  const modeContent = useMemo(() => {
    if (view.kind !== 'mode') return null;
    if (!activeSet || activeSet.id !== view.setId) return null;

    const exit = () => setView({ kind: 'set', setId: view.setId });
    switch (view.mode) {
      case 'learn':
        return (
          <LearnView
            set={activeSet}
            settings={settings}
            progress={activeProgress}
            onAnswer={(termId, correct, streak) => recordAnswer(activeSet.id, termId, correct, streak)}
            onExit={exit}
            onSettings={() => setSettingsOpen(true)}
          />
        );
      case 'flashcards':
        return <FlashcardsView set={activeSet} settings={settings} onExit={exit} />;
      case 'test':
        return <TestView set={activeSet} onExit={exit} />;
      case 'match':
        return <MatchView set={activeSet} onExit={exit} />;
      case 'blast':
        return <BlastView set={activeSet} onExit={exit} />;
      case 'blocks':
        return <MemoryView set={activeSet} variant="blocks" onExit={exit} />;
      case 'charms':
        return <MemoryView set={activeSet} variant="charms" onExit={exit} />;
      default:
        return null;
    }
  }, [view, activeSet, settings, activeProgress, recordAnswer]);

  if (!ready) {
    return (
      <div className="app" style={{ ['--accent' as string]: accent }}>
        <div className="main-col">
          <main className="content">
            <LoadingPanel label="Loading your sets…" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app" style={{ ['--accent' as string]: accent }}>
      <Sidebar
        view={view}
        onNavigate={navigate}
        onMode={handleSidebarMode}
        onOpenSettings={() => setSettingsOpen(true)}
        setTitle={activeSet?.title}
      />

      <div className="main-col">
        <header className="topbar">
          <button
            type="button"
            className="topsearch"
            onClick={() => setView({ kind: 'search' })}
            aria-label="Search for flashcard sets"
          >
            <SearchIcon size={18} />
            <span>Search for flashcard sets</span>
          </button>
          <div className="topbar-actions">
            <button type="button" className="btn btn-secondary btn-sm trial" onClick={() => setImportOpen(true)}>
              <PlusIcon size={16} />
              Import
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
              title="Settings"
            >
              <SettingsIcon size={18} />
            </button>
            <span className="avatar" aria-hidden="true">
              E
            </span>
          </div>
        </header>

        <main className={`content${view.kind === 'mode' ? ' wide' : ''}`}>
          {view.kind === 'home' ? (
            <HomeView
              sets={sets}
              progress={progress}
              onOpenSet={openSet}
              onMode={openMode}
              onImport={() => setImportOpen(true)}
            />
          ) : null}

          {view.kind === 'search' ? <SearchView sets={sets} onOpenSet={openSet} /> : null}

          {view.kind === 'set' ? (
            activeSet && activeSet.id === view.setId ? (
              <SetView
                set={activeSet}
                progress={activeProgress}
                onMode={(mode) => openMode(activeSet.id, mode)}
                onImport={() => setImportOpen(true)}
                onHome={() => setView({ kind: 'home' })}
              />
            ) : (
              <LoadingPanel label="Loading set…" />
            )
          ) : null}

          {view.kind === 'mode' ? (
            modeContent ?? <LoadingPanel label="Shuffling your cards…" />
          ) : null}
        </main>
      </div>

      {importOpen ? (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onCreate={handleCreate}
          defaultTitle="Imported study set"
        />
      ) : null}

      {settingsOpen ? (
        <SettingsModal
          settings={settings}
          onChange={(patch) => setSettings((prev) => ({ ...prev, ...patch }))}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}

      {toast ? (
        <div className="toast" role="status">
          <SparkIcon size={16} />
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="empty" style={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
      <div>
        <div className="badge-dot" style={{ margin: '0 auto 12px', animation: 'pulse 1s infinite' }} />
        <p className="muted">{label}</p>
      </div>
    </div>
  );
}
