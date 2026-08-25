export type Difficulty = "recruta" | "investigador" | "especialista" | "comandante";

export type SqlValue = string | number | boolean | null;

export type CaseColumn = {
  name: string;
  type: "INTEGER" | "STRING" | "NUMBER";
  description: string;
};

export type CaseTable = {
  name: string;
  label: string;
  description: string;
  columns: CaseColumn[];
  rows: Record<string, SqlValue>[];
};

export type Operation = {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  accent: string;
  docsUrl: string;
  skills: string[];
};

export type GameCase = {
  id: number;
  slug: string;
  code: string;
  title: string;
  district: string;
  difficulty: Difficulty;
  xp: number;
  operationId: string;
  brief: string;
  objective: string;
  clue: string;
  hints: string[];
  tables: CaseTable[];
  solution: string;
  starterQuery: string;
  requiresOrder?: boolean;
};

export type QueryResult = {
  columns: string[];
  rows: Record<string, SqlValue>[];
  elapsedMs: number;
};

export type PlayerProgress = {
  version: 1;
  xp: number;
  completedCases: number[];
  attemptsByCase: Record<number, number>;
  solvedWithoutHints: number[];
  revealedHintsByCase: Record<number, number>;
  streak: number;
  lastActiveDate: string | null;
};

