import { describe, expect, it } from "vitest";
import { createCase } from "@/data/cases";
import { completeCase, DEFAULT_PROGRESS, getBadges, isCaseUnlocked, levelFromXp, registerAttempt, revealHint } from "@/lib/progress";

describe("progressão do jogador", () => {
  it("registra tentativas e dicas sem mutar o estado anterior", () => {
    const attempted = registerAttempt(DEFAULT_PROGRESS, 1);
    const hinted = revealHint(attempted, 1);
    expect(DEFAULT_PROGRESS.attemptsByCase[1]).toBeUndefined();
    expect(hinted.attemptsByCase[1]).toBe(1);
    expect(hinted.revealedHintsByCase[1]).toBe(1);
  });

  it("concede XP uma única vez por caso", () => {
    const gameCase = createCase(1);
    const first = completeCase(DEFAULT_PROGRESS, gameCase);
    const repeated = completeCase(first, gameCase);
    expect(first.xp).toBe(gameCase.xp);
    expect(repeated.xp).toBe(gameCase.xp);
    expect(repeated.completedCases).toEqual([1]);
  });

  it("reduz 10 XP por dica revelada", () => {
    const gameCase = createCase(1);
    const withTwoHints = { ...DEFAULT_PROGRESS, revealedHintsByCase: { 1: 2 } };
    expect(completeCase(withTwoHints, gameCase).xp).toBe(gameCase.xp - 20);
  });

  it("libera os cinco primeiros casos e depois exige sequência", () => {
    expect(isCaseUnlocked(5, DEFAULT_PROGRESS)).toBe(true);
    expect(isCaseUnlocked(6, DEFAULT_PROGRESS)).toBe(false);
    expect(isCaseUnlocked(6, { ...DEFAULT_PROGRESS, completedCases: [5] })).toBe(true);
  });

  it("calcula níveis e condecorações", () => {
    expect(levelFromXp(0)).toBe(1);
    const progress = { ...DEFAULT_PROGRESS, completedCases: [1], solvedWithoutHints: [1, 2, 3, 4, 5] };
    const badges = getBadges(progress);
    expect(badges.find((badge) => badge.id === "primeira-pista")?.unlocked).toBe(true);
    expect(badges.find((badge) => badge.id === "sem-ajuda")?.unlocked).toBe(true);
  });
});
