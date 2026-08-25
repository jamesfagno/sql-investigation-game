import { describe, expect, it } from "vitest";
import { CASES } from "@/data/cases";
import { OPERATIONS } from "@/data/operations";
import { executeQuery, isCorrectResult, SqlSafetyError, validateReadOnlyQuery } from "@/lib/sql-engine";

describe("catálogo de casos", () => {
  it("oferece exatamente 200 casos gratuitos e únicos", () => {
    expect(CASES).toHaveLength(200);
    expect(new Set(CASES.map((gameCase) => gameCase.id)).size).toBe(200);
    expect(new Set(CASES.map((gameCase) => gameCase.slug)).size).toBe(200);
  });

  it("distribui 25 casos em cada operação", () => {
    for (const operation of OPERATIONS) {
      expect(CASES.filter((gameCase) => gameCase.operationId === operation.id)).toHaveLength(25);
    }
  });

  it("executa e valida a solução oficial de todos os casos", () => {
    const failures: string[] = [];
    for (const gameCase of CASES) {
      try {
        const result = executeQuery(gameCase, gameCase.solution);
        if (!isCorrectResult(gameCase, result)) failures.push(`${gameCase.code}: resultado divergente`);
      } catch (error) {
        failures.push(`${gameCase.code}: ${error instanceof Error ? error.message : "erro desconhecido"}`);
      }
    }
    expect(failures).toEqual([]);
  });
});

describe("segurança do laboratório", () => {
  it("aceita uma consulta SELECT", () => {
    expect(validateReadOnlyQuery("SELECT nome FROM agentes;")).toContain("SELECT");
  });

  it.each(["DELETE FROM agentes", "DROP TABLE agentes", "UPDATE agentes SET ativo = 'nao'", "SELECT * INTO copia FROM agentes"])("bloqueia o comando %s", (query) => {
    expect(() => validateReadOnlyQuery(query)).toThrow(SqlSafetyError);
  });

  it("bloqueia múltiplas instruções", () => {
    expect(() => validateReadOnlyQuery("SELECT * FROM agentes; SELECT * FROM registros;"))
      .toThrow("Execute uma consulta por vez.");
  });
});

