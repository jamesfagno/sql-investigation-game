"use client";

import Link from "next/link";
import { Award, Check, Flame, RotateCcw, Shield, Target, Zap } from "lucide-react";
import { useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { getBadges, levelFromXp, rankFromLevel } from "@/lib/progress";

export function PlayerFile() {
  const { progress, resetProgress } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const badges = getBadges(progress);
  const level = levelFromXp(progress.xp);

  return (
    <main className="profile-page shell">
      <section className="profile-heading">
        <div className="profile-avatar"><Shield size={42} /><span>{level}</span></div>
        <div><span className="eyebrow">Arquivo pessoal / visitante</span><h1>{rankFromLevel(level)}</h1><p>O progresso está protegido neste navegador. Conecte uma conta quando a sincronização em nuvem estiver disponível.</p></div>
        <Link className="button button-primary button-small" href="/jogar">Continuar investigação</Link>
      </section>

      <section className="profile-stats">
        <article><Target /><span>Casos fechados</span><strong>{progress.completedCases.length}<small>/200</small></strong></article>
        <article><Zap /><span>Experiência</span><strong>{progress.xp.toLocaleString("pt-BR")}<small> XP</small></strong></article>
        <article><Flame /><span>Sequência</span><strong>{progress.streak}<small> dias</small></strong></article>
        <article><Award /><span>Sem dicas</span><strong>{progress.solvedWithoutHints.length}<small> casos</small></strong></article>
      </section>

      <section className="badges-section">
        <div className="section-heading compact"><div><span className="eyebrow">Condecorações</span><h2>Marcas de campo</h2></div><p>{badges.filter((badge) => badge.unlocked).length} de {badges.length} desbloqueadas</p></div>
        <div className="badges-grid">
          {badges.map((badge) => <article className={badge.unlocked ? "badge-card is-earned" : "badge-card"} key={badge.id}><div>{badge.unlocked ? <Check /> : <Shield />}</div><h3>{badge.name}</h3><p>{badge.description}</p><small>{badge.unlocked ? "CONQUISTADA" : "BLOQUEADA"}</small></article>)}
        </div>
      </section>

      <section className="data-control">
        <div><h2>Dados locais</h2><p>O modo visitante salva tentativas, XP e conquistas somente neste navegador.</p></div>
        {confirmReset ? <div className="reset-confirm"><span>Tem certeza? Esta ação não pode ser desfeita.</span><button className="button button-danger button-small" onClick={() => { resetProgress(); setConfirmReset(false); }}>Confirmar limpeza</button><button className="text-button" onClick={() => setConfirmReset(false)}>Cancelar</button></div> : <button className="button button-ghost button-small" onClick={() => setConfirmReset(true)}><RotateCcw size={15} /> Limpar progresso</button>}
      </section>
    </main>
  );
}

