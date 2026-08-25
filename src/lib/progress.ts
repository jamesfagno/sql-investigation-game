import type { GameCase, PlayerProgress } from "@/lib/types";

export const PROGRESS_KEY = "rastro-sql:progress:v1";

export const DEFAULT_PROGRESS: PlayerProgress = {
  version: 1,
  xp: 0,
  completedCases: [],
  attemptsByCase: {},
  solvedWithoutHints: [],
  revealedHintsByCase: {},
  streak: 0,
  lastActiveDate: null,
};

export const levelFromXp = (xp: number) => Math.floor(Math.sqrt(xp / 180)) + 1;

export const rankFromLevel = (level: number) => {
  if (level >= 12) return "Comandante de Dados";
  if (level >= 8) return "Especialista Forense";
  if (level >= 4) return "Investigador";
  return "Agente Recruta";
};

export const xpForNextLevel = (level: number) => level * level * 180;

const localDate = () => new Date().toLocaleDateString("en-CA");

const differenceInDays = (left: string, right: string) => {
  const leftDate = new Date(`${left}T12:00:00`);
  const rightDate = new Date(`${right}T12:00:00`);
  return Math.round((leftDate.getTime() - rightDate.getTime()) / 86_400_000);
};

export function registerAttempt(progress: PlayerProgress, caseId: number): PlayerProgress {
  return {
    ...progress,
    attemptsByCase: {
      ...progress.attemptsByCase,
      [caseId]: (progress.attemptsByCase[caseId] ?? 0) + 1,
    },
  };
}

export function revealHint(progress: PlayerProgress, caseId: number): PlayerProgress {
  return {
    ...progress,
    revealedHintsByCase: {
      ...progress.revealedHintsByCase,
      [caseId]: Math.min(3, (progress.revealedHintsByCase[caseId] ?? 0) + 1),
    },
  };
}

export function completeCase(progress: PlayerProgress, gameCase: GameCase): PlayerProgress {
  if (progress.completedCases.includes(gameCase.id)) return progress;

  const today = localDate();
  const dayGap = progress.lastActiveDate ? differenceInDays(today, progress.lastActiveDate) : null;
  const streak = dayGap === 0 ? progress.streak : dayGap === 1 ? progress.streak + 1 : 1;
  const revealedHints = progress.revealedHintsByCase[gameCase.id] ?? 0;
  const noHints = revealedHints === 0;
  const earnedXp = Math.max(20, gameCase.xp - revealedHints * 10);

  return {
    ...progress,
    xp: progress.xp + earnedXp,
    completedCases: [...progress.completedCases, gameCase.id],
    solvedWithoutHints: noHints
      ? [...progress.solvedWithoutHints, gameCase.id]
      : progress.solvedWithoutHints,
    streak,
    lastActiveDate: today,
  };
}

export const isCaseUnlocked = (caseId: number, progress: PlayerProgress) =>
  caseId <= 5 || progress.completedCases.includes(caseId - 1) || progress.completedCases.includes(caseId);

export type Badge = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
};

export function getBadges(progress: PlayerProgress): Badge[] {
  const completed = new Set(progress.completedCases);
  const completedOperation = Array.from({ length: 8 }, (_, operationIndex) =>
    Array.from({ length: 25 }, (_, caseIndex) => operationIndex * 25 + caseIndex + 1),
  ).some((caseIds) => caseIds.every((caseId) => completed.has(caseId)));

  return [
    { id: "primeira-pista", name: "Primeira pista", description: "Resolva seu primeiro caso.", unlocked: progress.completedCases.length >= 1 },
    { id: "sem-ajuda", name: "Olho clínico", description: "Resolva 5 casos sem revelar dicas.", unlocked: progress.solvedWithoutHints.length >= 5 },
    { id: "sequencia", name: "Plantão contínuo", description: "Mantenha uma sequência de 3 dias.", unlocked: progress.streak >= 3 },
    { id: "operacao", name: "Arquivo fechado", description: "Conclua uma operação inteira.", unlocked: completedOperation },
    { id: "centenario", name: "Centenário", description: "Resolva 100 casos.", unlocked: progress.completedCases.length >= 100 },
    { id: "todos", name: "Rastro completo", description: "Solucione os 200 casos gratuitos.", unlocked: progress.completedCases.length >= 200 },
  ];
}
