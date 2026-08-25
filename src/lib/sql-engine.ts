import alasql from "alasql";
import type { GameCase, QueryResult, SqlValue } from "@/lib/types";

const blockedKeywords = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|REPLACE|MERGE|GRANT|REVOKE|ATTACH|DETACH|USE|INTO)\b/i;

export class SqlSafetyError extends Error {}

export function validateReadOnlyQuery(query: string) {
  const withoutComments = query
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();

  if (!withoutComments) throw new SqlSafetyError("Escreva uma consulta antes de executar.");
  if (!/^(SELECT|WITH)\b/i.test(withoutComments)) {
    throw new SqlSafetyError("O laboratório aceita apenas consultas SELECT.");
  }
  if (blockedKeywords.test(withoutComments)) {
    throw new SqlSafetyError("Comandos que alteram dados são bloqueados neste laboratório.");
  }

  const statements = withoutComments.split(";").filter((part) => part.trim().length > 0);
  if (statements.length > 1) {
    throw new SqlSafetyError("Execute uma consulta por vez.");
  }

  return withoutComments;
}

function createDatabase(gameCase: GameCase) {
  const database = new alasql.Database();

  for (const table of gameCase.tables) {
    const columns = table.columns.map((column) => `${column.name} ${column.type}`).join(", ");
    database.exec(`CREATE TABLE ${table.name} (${columns})`);
    const databaseTable = database.tables[table.name] as { data: Record<string, SqlValue>[] };
    databaseTable.data = table.rows.map((row) => ({ ...row }));
  }

  return database;
}

export function executeQuery(gameCase: GameCase, query: string): QueryResult {
  const safeQuery = validateReadOnlyQuery(query);
  const database = createDatabase(gameCase);
  const startedAt = performance.now();
  const rawResult = database.exec(safeQuery) as Record<string, SqlValue>[];
  const elapsedMs = performance.now() - startedAt;
  const rows = Array.isArray(rawResult) ? rawResult : [];
  const columns = rows[0] ? Object.keys(rows[0]) : [];

  return { columns, rows, elapsedMs };
}

const normalizeValue = (value: SqlValue) => {
  if (typeof value === "number") return Number(value.toFixed(6));
  return value;
};

const normalizeRows = (result: QueryResult, preserveOrder: boolean) => {
  const rows = result.rows.map((row) =>
    result.columns.map((column) => normalizeValue(row[column])),
  );
  return preserveOrder ? rows : rows.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
};

export function isCorrectResult(gameCase: GameCase, candidate: QueryResult) {
  const expected = executeQuery(gameCase, gameCase.solution);
  if (candidate.columns.length !== expected.columns.length) return false;
  if (!candidate.columns.every((column, index) => column === expected.columns[index])) return false;
  return JSON.stringify(normalizeRows(candidate, Boolean(gameCase.requiresOrder))) ===
    JSON.stringify(normalizeRows(expected, Boolean(gameCase.requiresOrder)));
}
