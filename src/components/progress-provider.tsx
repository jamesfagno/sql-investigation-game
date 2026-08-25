"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { DEFAULT_PROGRESS, PROGRESS_KEY } from "@/lib/progress";
import type { GameCase, PlayerProgress } from "@/lib/types";
import { completeCase, registerAttempt, revealHint } from "@/lib/progress";

type ProgressContextValue = {
  progress: PlayerProgress;
  hydrated: boolean;
  recordAttempt: (caseId: number) => void;
  recordHint: (caseId: number) => void;
  recordCompletion: (gameCase: GameCase) => boolean;
  resetProgress: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);
const listeners = new Set<() => void>();
let clientSnapshot: PlayerProgress | null = null;

function readClientSnapshot(): PlayerProgress {
  if (clientSnapshot !== null) return clientSnapshot;
  let nextSnapshot: PlayerProgress;
  try {
    const stored = window.localStorage.getItem(PROGRESS_KEY);
    nextSnapshot = stored ? { ...DEFAULT_PROGRESS, ...JSON.parse(stored) } : DEFAULT_PROGRESS;
  } catch {
    nextSnapshot = DEFAULT_PROGRESS;
  }
  clientSnapshot = nextSnapshot;
  return nextSnapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function saveSnapshot(next: PlayerProgress) {
  clientSnapshot = next;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  } catch {
    // Mantém o jogo funcional durante a sessão quando o armazenamento está indisponível.
  }
  listeners.forEach((listener) => listener());
}

function mutateSnapshot(recipe: (current: PlayerProgress) => PlayerProgress) {
  saveSnapshot(recipe(readClientSnapshot()));
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const progress = useSyncExternalStore(subscribe, readClientSnapshot, () => DEFAULT_PROGRESS);
  const hydrated = useSyncExternalStore(() => () => undefined, () => true, () => false);

  const value = useMemo<ProgressContextValue>(() => ({
    progress,
    hydrated,
    recordAttempt: (caseId) => mutateSnapshot((current) => registerAttempt(current, caseId)),
    recordHint: (caseId) => mutateSnapshot((current) => revealHint(current, caseId)),
    recordCompletion: (gameCase) => {
      const isNew = !readClientSnapshot().completedCases.includes(gameCase.id);
      if (isNew) mutateSnapshot((current) => completeCase(current, gameCase));
      return isNew;
    },
    resetProgress: () => saveSnapshot(DEFAULT_PROGRESS),
  }), [hydrated, progress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress deve ser usado dentro de ProgressProvider.");
  return context;
}
