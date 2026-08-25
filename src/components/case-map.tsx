"use client";

import Link from "next/link";
import { Check, LockKeyhole, Play, RadioTower } from "lucide-react";
import { CASES, getCasesByOperation } from "@/data/cases";
import { OPERATIONS } from "@/data/operations";
import { isCaseUnlocked, levelFromXp, rankFromLevel, xpForNextLevel } from "@/lib/progress";
import { useProgress } from "@/components/progress-provider";

export function CaseMap() {
  const { progress } = useProgress();
  const level = levelFromXp(progress.xp);
  const nextXp = xpForNextLevel(level);
  const levelBase = xpForNextLevel(Math.max(0, level - 1));
  const percent = Math.min(100, ((progress.xp - levelBase) / Math.max(1, nextXp - levelBase)) * 100);
  const nextCase = CASES.find((gameCase) => isCaseUnlocked(gameCase.id, progress) && !progress.completedCases.includes(gameCase.id)) ?? CASES[0];

  return (
    <main className="map-page">
      <section className="map-hero shell">
        <div>
          <span className="eyebrow"><RadioTower size={14} /> Central operacional</span>
          <h1>Mapa de <em>investigações</em></h1>
          <p>Siga o rastro em ordem. Cada caso libera novas técnicas e aproxima você do comando da Central.</p>
        </div>
        <div className="mission-card">
          <div><span>PRÓXIMA MISSÃO</span><small>{nextCase.code}</small></div>
          <strong>{nextCase.title}</strong>
          <p>{nextCase.objective}</p>
          <Link className="button button-primary button-small" href={`/casos/${nextCase.slug}`}><Play size={15} fill="currentColor" /> Investigar</Link>
        </div>
      </section>

      <section className="agent-strip">
        <div className="shell agent-strip-inner">
          <div className="agent-level"><span>{level}</span><div><small>NÍVEL ATUAL</small><strong>{rankFromLevel(level)}</strong></div></div>
          <div className="xp-track-wrap"><div><span>{progress.xp.toLocaleString("pt-BR")} XP</span><span>{nextXp.toLocaleString("pt-BR")} XP</span></div><div className="xp-track"><i style={{ width: `${percent}%` }} /></div></div>
          <div className="map-stat"><strong>{progress.completedCases.length}</strong><span>/ 200<br />CASOS</span></div>
          <div className="map-stat"><strong>{progress.streak}</strong><span>DIAS<br />EM SEQUÊNCIA</span></div>
        </div>
      </section>

      <section className="operation-map shell">
        {OPERATIONS.map((operation) => {
          const operationCases = getCasesByOperation(operation.id);
          const completed = operationCases.filter((gameCase) => progress.completedCases.includes(gameCase.id)).length;
          const first = operationCases[0];
          const available = isCaseUnlocked(first.id, progress);

          return (
            <article className={available ? "map-operation" : "map-operation is-locked"} key={operation.id} style={{ "--operation-accent": operation.accent } as React.CSSProperties}>
              <div className="map-operation-copy">
                <div className="operation-kicker"><span>OPERAÇÃO {String(operation.number).padStart(2, "0")}</span><span>{completed}/25</span></div>
                <h2>{operation.shortTitle}</h2>
                <p>{operation.description}</p>
                <div className="skill-list">{operation.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                <a className="docs-link" href={operation.docsUrl} target="_blank" rel="noreferrer">Referência oficial ↗</a>
              </div>
              <div className="case-nodes" aria-label={`Casos da ${operation.title}`}>
                {operationCases.map((gameCase) => {
                  const done = progress.completedCases.includes(gameCase.id);
                  const unlocked = isCaseUnlocked(gameCase.id, progress);
                  const content = done ? <Check size={15} /> : unlocked ? String(gameCase.id).padStart(3, "0") : <LockKeyhole size={13} />;
                  return unlocked ? (
                    <Link className={done ? "case-node is-done" : "case-node is-open"} href={`/casos/${gameCase.slug}`} key={gameCase.id} aria-label={`${gameCase.code}: ${gameCase.title}`}>{content}</Link>
                  ) : (
                    <span className="case-node is-locked" key={gameCase.id} aria-label={`${gameCase.code} bloqueado`}>{content}</span>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

