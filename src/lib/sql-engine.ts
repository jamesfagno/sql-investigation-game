import alasql from "alasql";
import type { GameCase, QueryResult, SqlValue } from "@/lib/types";

const blockedKeywords = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|REPLACE|MERGE|GRANT|REVOKE|ATTACH|DETACH|USE|INTO)\b/i;

export class SqlSafetyError extends Error {}

function analyzeQuery(query: string) {
  let searchable = "";
  const semicolons: number[] = [];
  let state: "normal" | "single-quote" | "double-quote" | "line-comment" | "block-comment" = "normal";

  for (let index = 0; index < query.length; index += 1) {
    const character = query[index];
    const next = query[index + 1];

    if (state === "line-comment") {
      if (character === "\n") {
        state = "normal";
        searchable += "\n";
      } else searchable += " ";
      continue;
    }

    if (state === "block-comment") {
      if (character === "*" && next === "/") {
        searchable += "  ";
        state = "normal";
        index += 1;
      } else searchable += character === "\n" ? "\n" : " ";
      continue;
    }

    if (state === "single-quote" || state === "double-quote") {
      const quote = state === "single-quote" ? "'" : '"';
      searchable += " ";
      if (character === quote && next === quote) {
        searchable += " ";
        index += 1;
      } else if (character === quote) state = "normal";
      continue;
    }

    if (character === "-" && next === "-") {
      searchable += "  ";
      state = "line-comment";
      index += 1;
    } else if (character === "/" && next === "*") {
      searchable += "  ";
      state = "block-comment";
      index += 1;
    } else if (character === "'") {
      searchable += " ";
      state = "single-quote";
    } else if (character === '"') {
      searchable += " ";
      state = "double-quote";
    } else {
      searchable += character;
      if (character === ";") semicolons.push(index);
    }
  }

  if (state === "single-quote" || state === "double-quote" || state === "block-comment") {
    throw new SqlSafetyError("A consulta contém texto, identificador ou comentário não finalizado.");
  }

  return { searchable, semicolons };
}

export function validateReadOnlyQuery(query: string) {
  const trimmedQuery = query.trim();
  const { searchable, semicolons } = analyzeQuery(trimmedQuery);
  const searchableQuery = searchable.trim();

  if (!searchableQuery) throw new SqlSafetyError("Escreva uma consulta antes de executar.");
  if (!/^(SELECT|WITH)\b/i.test(searchableQuery)) {
    throw new SqlSafetyError("O laboratório aceita apenas consultas SELECT.");
  }
  if (blockedKeywords.test(searchableQuery)) {
    throw new SqlSafetyError("Comandos que alteram dados são bloqueados neste laboratório.");
  }

  const hasNonTrailingSemicolon = semicolons.some((index) => searchable.slice(index + 1).trim().length > 0);
  if (semicolons.length > 1 || hasNonTrailingSemicolon) {
    throw new SqlSafetyError("Execute uma consulta por vez.");
  }

  return trimmedQuery;
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
  // AlaSQL não fornece metadados das colunas quando uma consulta retorna zero linhas.
  // Casos oficiais vazios seriam impossíveis de validar com segurança.
  if (expected.rows.length === 0) return false;
  if (candidate.columns.length !== expected.columns.length) return false;
  if (!candidate.columns.every((column, index) => column === expected.columns[index])) return false;
  return JSON.stringify(normalizeRows(candidate, Boolean(gameCase.requiresOrder))) ===
    JSON.stringify(normalizeRows(expected, Boolean(gameCase.requiresOrder)));
}
