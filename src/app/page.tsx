import Link from "next/link";
import { ArrowRight, BookOpen, Database, ShieldCheck, Sparkles, TerminalSquare } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SectionLabel } from "@/components/section-label";
import { OPERATIONS } from "@/data/operations";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orbit orbit-one" aria-hidden="true" />
          <div className="hero-orbit orbit-two" aria-hidden="true" />
          <div className="shell hero-layout">
            <div className="hero-copy">
              <SectionLabel>Transmissão aberta / turma 01</SectionLabel>
              <h1>Dados mentem.<br /><em>Consultas, não.</em></h1>
              <p className="hero-lead">
                Entre para a Central, investigue arquivos comprometidos e domine SQL resolvendo casos — uma pista por vez.
              </p>
              <div className="hero-actions">
                <Link className="button button-primary" href="/jogar">Iniciar investigação <ArrowRight size={18} /></Link>
                <a className="button button-ghost" href="#como-funciona">Como funciona</a>
              </div>
              <div className="hero-proof">
                <div><strong>200</strong><span>casos gratuitos</span></div>
                <div><strong>8</strong><span>operações</span></div>
                <div><strong>0→SQL</strong><span>do básico ao avançado</span></div>
              </div>
            </div>

            <div className="evidence-console" aria-label="Prévia do laboratório SQL">
              <div className="console-topbar">
                <span className="console-lights"><i /><i /><i /></span>
                <span>ARQUIVO_RS-001.SQL</span>
                <span className="live-indicator"><i /> ONLINE</span>
              </div>
              <div className="console-case-label">CASO 001 / A CREDENCIAL FANTASMA</div>
              <div className="console-editor">
                <span className="line-number">1</span><code><b>SELECT</b> nome, cargo</code>
                <span className="line-number">2</span><code><b>FROM</b> agentes</code>
                <span className="line-number">3</span><code><b>WHERE</b> nivel_acesso <i>&gt;=</i> <u>4</u>;</code>
              </div>
              <div className="console-result">
                <div className="result-title"><span>RESULTADO / 2 REGISTROS</span><ShieldCheck size={16} /></div>
                <div className="fake-table">
                  <div><b>nome</b><b>cargo</b></div>
                  <div><span>Mara Viana</span><span>Analista</span></div>
                  <div><span>Nina Prado</span><span>Técnica</span></div>
                </div>
              </div>
              <div className="case-stamp">PISTA<br />VALIDADA</div>
            </div>
          </div>
          <div className="ticker" aria-label="Recursos do jogo">
            <div>CONSULTAS REAIS <i /> PROGRESSO SALVO <i /> 200 CASOS GRATUITOS <i /> CONQUISTAS E XP <i /> DOCUMENTAÇÃO OFICIAL <i /> CONSULTAS REAIS <i /> PROGRESSO SALVO</div>
          </div>
        </section>

        <section className="how-section" id="como-funciona">
          <div className="shell">
            <SectionLabel>Protocolo de campo</SectionLabel>
            <div className="section-heading">
              <h2>Você aprende fazendo.<br /><em>O caso ensina o comando.</em></h2>
              <p>Nada de aulas intermináveis antes da prática. Cada conceito aparece quando a investigação precisa dele.</p>
            </div>
            <div className="steps-grid">
              <article><span className="step-index">01</span><Database /><h3>Leia o arquivo</h3><p>Entenda o objetivo, explore o esquema e examine amostras das tabelas.</p></article>
              <article><span className="step-index">02</span><TerminalSquare /><h3>Escreva a consulta</h3><p>Use SQL no laboratório protegido e veja o resultado imediatamente.</p></article>
              <article><span className="step-index">03</span><Sparkles /><h3>Feche o caso</h3><p>Valide a pista, ganhe XP, conquistas e acesso ao próximo arquivo.</p></article>
            </div>
          </div>
        </section>

        <section className="operations-preview">
          <div className="shell">
            <div className="operations-head">
              <div><SectionLabel>Mapa de operações</SectionLabel><h2>Oito operações.<br />Duzentas histórias.</h2></div>
              <Link href="/jogar" className="text-link">Ver mapa completo <ArrowRight size={16} /></Link>
            </div>
            <div className="operations-track">
              {OPERATIONS.map((operation, index) => (
                <article className="operation-tile" key={operation.id} style={{ "--operation-accent": operation.accent } as React.CSSProperties}>
                  <span className="operation-number">OP / {String(index + 1).padStart(2, "0")}</span>
                  <div className="operation-line" />
                  <h3>{operation.shortTitle}</h3>
                  <p>{operation.description}</p>
                  <div className="skill-list">{operation.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                  <small>25 CASOS</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="learning-proof">
          <div className="shell proof-layout">
            <div className="proof-mark"><BookOpen size={54} /><span>SQL</span></div>
            <div><SectionLabel>Conteúdo confiável</SectionLabel><h2>Prática com fundamento.</h2><p>As trilhas seguem conceitos e terminologia da documentação oficial do PostgreSQL. Cada operação inclui acesso direto à referência usada.</p></div>
            <a className="button button-ghost" href="https://www.postgresql.org/docs/current/tutorial-sql.html" target="_blank" rel="noreferrer">Abrir documentação <ArrowRight size={17} /></a>
          </div>
        </section>

        <section className="final-cta">
          <div className="shell final-cta-inner">
            <div><span>SEU ACESSO FOI LIBERADO</span><h2>Há uma pista esperando.</h2><p>Comece como recruta. Termine pensando como quem domina os dados.</p></div>
            <Link className="button button-dark" href="/jogar">Abrir primeiro caso <ArrowRight size={18} /></Link>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="shell"><span>RASTRO SQL © 2026</span><span>PROJETO EDUCACIONAL INDEPENDENTE</span><span>FEITO PARA QUEM INVESTIGA</span></div>
      </footer>
    </>
  );
}

