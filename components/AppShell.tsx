'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ProgressState,
  SetProgress,
  SetSection,
  SetSummary,
  Settings,
  StudyMode,
  StudySet,
  TermProgress,
  View,
} from '@/lib/types';
import { DEFAULT_SETTINGS, loadSettings, resolveAccent, saveSettings } from '@/lib/settings';
import { clearSessionsForSet, readSession, writeSession } from '@/lib/session';
import {
  createSet,
  deleteSet,
  ensureSeed,
  getProgress,
  getSet,
  listSets,
  recordProgress,
  updateSet,
} from '@/lib/store';
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
import EditSetModal, { type EditPayload } from './EditSetModal';
import CombineModal from './CombineModal';
import SettingsModal from './SettingsModal';
import SectionModal from './SectionModal';
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
  const [editOpen, setEditOpen] = useState(false);
  const [combineOpen, setCombineOpen] = useState(false);
  const [sectionDraft, setSectionDraft] = useState<SetSection | null | undefined>(undefined);
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
          if (cancelled) return;
          if (set) setActiveSet(set);
          else setView({ kind: 'home' });
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
    (setId: string, mode: StudyMode, section?: { termIds: string[]; name: string }) => {
      setView({
        kind: 'mode',
        setId,
        mode,
        termIds: section?.termIds,
        scopeName: section?.name,
      });
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

  const addSet = useCallback((set: StudySet) => {
    const summary: SetSummary = {
      id: set.id,
      title: set.title,
      description: set.description,
      subject: set.subject,
      termCount: set.terms.length,
      masteredCount: 0,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
    };
    setSets((prev) => [summary, ...prev]);
  }, []);

  const handleSaveEdit = useCallback(
    async (payload: EditPayload) => {
      if (!activeSet) return;
      try {
        const updated = await updateSet(activeSet.id, payload);
        if (!updated) {
          setToast('Could not update that set.');
          return;
        }
        setActiveSet(updated);
        setSets((prev) =>
          prev.map((item) =>
            item.id === updated.id
              ? {
                  ...item,
                  title: updated.title,
                  description: updated.description,
                  termCount: updated.terms.length,
                  updatedAt: updated.updatedAt,
                }
              : item,
          ),
        );
        setEditOpen(false);
        setToast('Set updated.');
      } catch {
        setToast('Could not update that set.');
      }
    },
    [activeSet],
  );

  const handleCopySet = useCallback(async () => {
    if (!activeSet) return;
    const copy = await createSet({
      title: `${activeSet.title} (copy)`,
      description: activeSet.description,
      subject: activeSet.subject,
      terms: activeSet.terms.map((term) => ({ term: term.term, definition: term.definition })),
    });
    addSet(copy);
    setActiveSet(copy);
    setView({ kind: 'set', setId: copy.id });
    setToast(`Copied “${activeSet.title}”.`);
  }, [activeSet, addSet]);

  const handleDeleteSet = useCallback(async () => {
    if (!activeSet) return;
    const { id, title } = activeSet;
    const removed = await deleteSet(id);
    if (!removed) {
      setToast('Could not delete that set.');
      return;
    }
    setSets((prev) => prev.filter((item) => item.id !== id));
    clearSessionsForSet(id);
    setActiveSet(null);
    setView({ kind: 'home' });
    setToast(`Deleted “${title}”.`);
  }, [activeSet]);

  const handleCombine = useCallback(
    async (ids: string[]) => {
      if (!activeSet || ids.length === 0) return;
      const others = (await Promise.all(ids.map((id) => getSet(id)))).filter(
        (item): item is StudySet => Boolean(item),
      );
      if (others.length === 0) {
        setToast('Could not load those sets.');
        return;
      }
      const seen = new Set<string>();
      const terms = [...activeSet.terms, ...others.flatMap((item) => item.terms)]
        .filter((term) => {
          const key = `${term.term}\u0000${term.definition}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((term) => ({ term: term.term, definition: term.definition }));
      const merged = await createSet({
        title: `${activeSet.title} + ${others.length} more`,
        description: `Combined with ${others.map((item) => item.title).join(', ')}`,
        subject: activeSet.subject,
        terms,
      });
      addSet(merged);
      setCombineOpen(false);
      setActiveSet(merged);
      setView({ kind: 'set', setId: merged.id });
      setToast(`Combined into ${merged.terms.length} cards.`);
    },
    [activeSet, addSet],
  );

  const handleSaveSection = useCallback(
    async (section: SetSection) => {
      if (!activeSet) return;
      const existing = activeSet.sections ?? [];
      const sections = existing.some((item) => item.id === section.id)
        ? existing.map((item) => (item.id === section.id ? section : item))
        : [...existing, section];
      try {
        const updated = await updateSet(activeSet.id, { sections });
        if (!updated) {
          setToast('Could not save that section.');
          return;
        }
        setActiveSet(updated);
        setSectionDraft(undefined);
        setToast(`Saved section “${section.name}”.`);
      } catch {
        setToast('Could not save that section.');
      }
    },
    [activeSet],
  );

  const handleDeleteSection = useCallback(
    async (section: SetSection) => {
      if (!activeSet) return;
      const sections = (activeSet.sections ?? []).filter((item) => item.id !== section.id);
      try {
        const updated = await updateSet(activeSet.id, { sections });
        if (!updated) {
          setToast('Could not delete that section.');
          return;
        }
        setActiveSet(updated);
        setToast(`Deleted section “${section.name}”.`);
      } catch {
        setToast('Could not delete that section.');
      }
    },
    [activeSet],
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

  /* Coming back after a refresh should land on the same screen. */
  const [viewRestored, setViewRestored] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const saved = readSession<View>('ui:last-view');
    if (saved && (saved.kind === 'set' || saved.kind === 'mode')) {
      setView((current) => (current.kind === 'home' ? saved : current));
    }
    setViewRestored(true);
  }, [ready]);

  useEffect(() => {
    // Home is remembered too, so reopening after going home does not jump back into a mode.
    if (!viewRestored) return;
    writeSession('ui:last-view', view);
  }, [view, viewRestored]);

  const accent = resolveAccent(settings);
  const activeProgress = activeSet ? progress.sets[activeSet.id] : undefined;

  /* A mode can be scoped to a subsection, which is just a filtered term list. */
  const studySet = useMemo<StudySet | null>(() => {
    if (!activeSet) return null;
    if (view.kind !== 'mode' || !view.termIds || view.termIds.length === 0) return activeSet;
    const ids = new Set(view.termIds);
    const terms = activeSet.terms.filter((term) => ids.has(term.id));
    if (terms.length === 0) return activeSet;
    return {
      ...activeSet,
      terms,
      title: view.scopeName ? `${activeSet.title} · ${view.scopeName}` : activeSet.title,
    };
  }, [activeSet, view]);

  const sessionKey = useMemo(() => {
    if (view.kind !== 'mode') return '';
    const scope = view.termIds && view.termIds.length ? hashScope(view.termIds) : 'all';
    return `${view.setId}:${view.mode}:${scope}`;
  }, [view]);

  const modeContent = useMemo(() => {
    if (view.kind !== 'mode') return null;
    if (!studySet || studySet.id !== view.setId) return null;

    const exit = () => setView({ kind: 'set', setId: view.setId });
    switch (view.mode) {
      case 'learn':
        return (
          <LearnView
            key={sessionKey}
            set={studySet}
            settings={settings}
            progress={activeProgress}
            sessionKey={sessionKey}
            scopeName={view.scopeName}
            onAnswer={(termId, correct, streak) => recordAnswer(studySet.id, termId, correct, streak)}
            onExit={exit}
            onSettings={() => setSettingsOpen(true)}
          />
        );
      case 'flashcards':
        return (
          <FlashcardsView key={sessionKey} set={studySet} settings={settings} sessionKey={sessionKey} onExit={exit} />
        );
      case 'test':
        return (
          <TestView
            key={sessionKey}
            set={studySet}
            sound={settings.sound}
            direction={settings.direction}
            sessionKey={sessionKey}
            onExit={exit}
          />
        );
      case 'match':
        return <MatchView key={sessionKey} set={studySet} sound={settings.sound} sessionKey={sessionKey} onExit={exit} />;
      case 'blast':
        return <BlastView key={sessionKey} set={studySet} sound={settings.sound} sessionKey={sessionKey} onExit={exit} />;
      case 'blocks':
        return <MemoryView key={sessionKey} set={studySet} variant="blocks" sessionKey={sessionKey} onExit={exit} />;
      case 'charms':
        return <MemoryView key={sessionKey} set={studySet} variant="charms" sessionKey={sessionKey} onExit={exit} />;
      default:
        return null;
    }
  }, [view, studySet, settings, activeProgress, recordAnswer, sessionKey]);

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
                onMode={(mode, section) => openMode(activeSet.id, mode, section)}
                onNewSection={(section) => setSectionDraft(section)}
                onDeleteSection={handleDeleteSection}
                onImport={() => setImportOpen(true)}
                onHome={() => setView({ kind: 'home' })}
                onEdit={() => setEditOpen(true)}
                onCopy={handleCopySet}
                onDelete={handleDeleteSet}
                onCombine={() => setCombineOpen(true)}
                onNotify={setToast}
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

      {editOpen && activeSet ? (
        <EditSetModal set={activeSet} onClose={() => setEditOpen(false)} onSave={handleSaveEdit} />
      ) : null}

      {combineOpen && activeSet ? (
        <CombineModal
          sets={sets}
          currentSetId={activeSet.id}
          onClose={() => setCombineOpen(false)}
          onCombine={handleCombine}
        />
      ) : null}

      {sectionDraft !== undefined && activeSet ? (
        <SectionModal
          set={activeSet}
          section={sectionDraft}
          onClose={() => setSectionDraft(undefined)}
          onSave={handleSaveSection}
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

function hashScope(ids: string[]): string {
  const joined = [...ids].sort().join('|');
  let hash = 5381;
  for (let index = 0; index < joined.length; index += 1) {
    hash = ((hash << 5) + hash + joined.charCodeAt(index)) | 0;
  }
  return `s${(hash >>> 0).toString(36)}`;
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
