"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronRight, CircleHelp, Clock3, Database, Lightbulb, LockKeyhole, Play, RotateCcw, Table2, Trophy, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { getOperation } from "@/data/operations";
import { isCaseUnlocked } from "@/lib/progress";
import { executeQuery, isCorrectResult, SqlSafetyError } from "@/lib/sql-engine";
import type { CaseTable, GameCase, QueryResult } from "@/lib/types";

function ResultTable({ result }: { result: QueryResult }) {
  if (result.rows.length === 0) return <div className="empty-result"><Database /><strong>Nenhum registro encontrado</strong><span>A consulta foi executada, mas não retornou linhas.</span></div>;
  return (
    <div className="result-table-wrap">
      <table className="result-table">
        <thead><tr>{result.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>{result.rows.map((row, rowIndex) => <tr key={rowIndex}>{result.columns.map((column) => <td key={column}>{String(row[column] ?? "NULL")}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function SchemaPanel({ tables }: { tables: CaseTable[] }) {
  const [activeTable, setActiveTable] = useState(tables[0].name);
  const table = tables.find((item) => item.name === activeTable) ?? tables[0];
  return (
    <div className="schema-panel">
      <div className="table-tabs">{tables.map((item) => <button className={item.name === table.name ? "is-active" : ""} key={item.name} onClick={() => setActiveTable(item.name)}><Table2 size={14} />{item.name}</button>)}</div>
      <p className="table-description">{table.description}</p>
      <div className="schema-columns">{table.columns.map((column) => <div key={column.name}><code>{column.name}</code><span>{column.type}</span><small>{column.description}</small></div>)}</div>
      <div className="sample-title"><span>AMOSTRA DE DADOS</span><small>{table.rows.length} linhas disponíveis</small></div>
      <div className="mini-table-wrap"><table className="mini-table"><thead><tr>{table.columns.map((column) => <th key={column.name}>{column.name}</th>)}</tr></thead><tbody>{table.rows.slice(0, 4).map((row, index) => <tr key={index}>{table.columns.map((column) => <td key={column.name}>{String(row[column.name])}</td>)}</tr>)}</tbody></table></div>
    </div>
  );
}

export function CaseWorkspace({ gameCase }: { gameCase: GameCase }) {
  const { progress, hydrated, recordAttempt, recordHint, recordCompletion } = useProgress();
  const [query, setQuery] = useState(gameCase.starterQuery);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"correct" | "incorrect" | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const operation = getOperation(gameCase.operationId);
  const hintCount = progress.revealedHintsByCase[gameCase.id] ?? 0;
  const unlocked = isCaseUnlocked(gameCase.id, progress);
  const alreadySolved = progress.completedCases.includes(gameCase.id);
  const earnedXp = Math.max(20, gameCase.xp - hintCount * 10);
  const nextSlug = gameCase.id < 200 ? `caso-${String(gameCase.id + 1).padStart(3, "0")}` : null;

  const statusText = useMemo(() => {
    if (verdict === "correct") return "Pista validada";
    if (verdict === "incorrect") return "Resultado não confere";
    return "Aguardando consulta";
  }, [verdict]);

  if (hydrated && !unlocked) {
    return <main className="locked-case shell"><LockKeyhole size={42} /><span>{gameCase.code}</span><h1>Arquivo sob restrição</h1><p>Conclua o caso anterior para liberar esta investigação.</p><Link className="button button-primary" href="/jogar"><ArrowLeft size={17} /> Voltar ao mapa</Link></main>;
  }

  const runQuery = () => {
    recordAttempt(gameCase.id);
    setError(null);
    try {
      const execution = executeQuery(gameCase, query);
      setResult(execution);
      const correct = isCorrectResult(gameCase, execution);
      setVerdict(correct ? "correct" : "incorrect");
      if (correct) {
        const isNew = recordCompletion(gameCase);
        if (isNew) setShowSuccess(true);
      }
    } catch (caught) {
      setResult(null);
      setVerdict(null);
      if (caught instanceof SqlSafetyError) setError(caught.message);
      else setError("A consulta contém um erro de sintaxe. Revise nomes, aspas e palavras-chave.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runQuery();
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const target = event.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const next = `${query.slice(0, start)}  ${query.slice(end)}`;
      setQuery(next);
      requestAnimationFrame(() => { target.selectionStart = target.selectionEnd = start + 2; });
    }
  };

  return (
    <main className="case-page">
      <div className="case-command-bar">
        <Link href="/jogar"><ArrowLeft size={16} /> Mapa</Link>
        <div><span>{operation.title}</span><ChevronRight size={14} /><strong>{gameCase.code}</strong></div>
        <span className={verdict ? `case-status is-${verdict}` : "case-status"}><i />{statusText}</span>
      </div>

      <div className="workspace-grid">
        <aside className="brief-panel">
          <div className="brief-top"><span className="case-code">{gameCase.code}</span>{alreadySolved && <span className="solved-chip"><CheckCircle2 size={13} /> RESOLVIDO</span>}</div>
          <h1>{gameCase.title}</h1>
          <div className="case-meta"><span>{gameCase.district}</span><span>{gameCase.difficulty}</span><span>{gameCase.xp} XP</span></div>
          <div className="brief-rule" />
          <span className="panel-label">RESUMO DO ARQUIVO</span>
          <p>{gameCase.brief}</p>
          <div className="objective-card"><span><TargetIcon /> OBJETIVO</span><strong>{gameCase.objective}</strong></div>
          <div className="field-clue"><CircleHelp size={17} /><div><span>NOTA DE CAMPO</span><p>{gameCase.clue}</p></div></div>
          <a className="manual-link" href={operation.docsUrl} target="_blank" rel="noreferrer"><BookOpen size={16} /><span>Consultar manual oficial<small>{operation.skills.join(" · ")}</small></span><ArrowRight size={15} /></a>
        </aside>

        <section className="lab-panel">
          <div className="lab-top"><div><span className="panel-label">LABORATÓRIO SQL</span><small>Somente leitura · Ctrl + Enter para executar</small></div><button className="icon-text-button" onClick={() => { setQuery(gameCase.starterQuery); setResult(null); setError(null); setVerdict(null); }}><RotateCcw size={14} /> Restaurar</button></div>
          <div className="editor-shell">
            <div className="editor-file"><span>consulta.sql</span><i>POSTGRESQL</i></div>
            <div className="editor-area"><div className="editor-gutter">{Array.from({ length: Math.max(7, query.split("\n").length) }, (_, index) => <span key={index}>{index + 1}</span>)}</div><textarea value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeyDown} spellCheck={false} aria-label="Editor de consulta SQL" /></div>
            <div className="editor-actions"><span>SQL · UTF-8</span><button className="run-button" onClick={runQuery}><Play size={15} fill="currentColor" /> Executar consulta <kbd>Ctrl ↵</kbd></button></div>
          </div>

          <div className={error ? "result-panel has-error" : verdict ? `result-panel is-${verdict}` : "result-panel"}>
            <div className="result-toolbar"><span>{error ? <XCircle size={15} /> : verdict === "correct" ? <CheckCircle2 size={15} /> : <Database size={15} />} RESULTADO</span>{result && <small><Clock3 size={13} /> {result.rows.length} registros · {result.elapsedMs.toFixed(1)} ms</small>}</div>
            {error ? <div className="query-error"><strong>Não foi possível executar</strong><p>{error}</p></div> : result ? <ResultTable result={result} /> : <div className="empty-result"><Play /><strong>Execute sua investigação</strong><span>Os registros encontrados aparecerão aqui.</span></div>}
            {verdict === "incorrect" && <div className="verdict-message"><XCircle /><div><strong>A consulta rodou, mas a pista não confere.</strong><span>Compare as colunas e os filtros com o objetivo do arquivo.</span></div></div>}
            {verdict === "correct" && <div className="verdict-message success"><CheckCircle2 /><div><strong>Consulta confirmada pela Central.</strong><span>O conjunto de resultados corresponde à evidência esperada.</span></div></div>}
          </div>
        </section>

        <aside className="intel-panel">
          <span className="panel-label">BANCO DE EVIDÊNCIAS</span>
          <SchemaPanel tables={gameCase.tables} />
          <div className="hints-block">
            <div><span className="panel-label">SUPORTE TÁTICO</span><small>{hintCount}/3 dicas reveladas</small></div>
            {gameCase.hints.slice(0, hintCount).map((hint, index) => <div className="hint-item" key={hint}><span>{index + 1}</span><p>{hint}</p></div>)}
            {hintCount < 3 ? <button className="hint-button" onClick={() => recordHint(gameCase.id)}><Lightbulb size={16} /> Revelar dica {hintCount + 1}<small>-10 XP simbólicos</small></button> : <div className="all-hints"><Lightbulb size={15} /> Todas as dicas foram abertas.</div>}
          </div>
        </aside>
      </div>

      {showSuccess && <div className="success-overlay" role="dialog" aria-modal="true" aria-labelledby="success-title"><div className="success-dialog"><button className="dialog-close" onClick={() => setShowSuccess(false)} aria-label="Fechar">×</button><div className="success-emblem"><Trophy /></div><span>ARQUIVO ENCERRADO</span><h2 id="success-title">Pista validada,<br />agente.</h2><p>O relatório foi aceito pela Central e seu progresso foi salvo neste navegador.</p><div className="reward-row"><div><strong>+{earnedXp}</strong><span>XP</span></div><div><strong>{hintCount === 0 ? "PERFEITO" : `${3 - hintCount}/3`}</strong><span>PRECISÃO</span></div></div>{nextSlug ? <Link className="button button-primary" href={`/casos/${nextSlug}`}>Próximo arquivo <ArrowRight size={17} /></Link> : <Link className="button button-primary" href="/arquivo">Ver arquivo completo <ArrowRight size={17} /></Link>}<button className="text-button" onClick={() => setShowSuccess(false)}>Revisar resultado</button></div></div>}
    </main>
  );
}

function TargetIcon() {
  return <span className="target-icon" aria-hidden="true"><i /></span>;
}
