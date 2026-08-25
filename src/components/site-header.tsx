"use client";

import Link from "next/link";
import { Flame, LogIn, Menu, UserRound } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { levelFromXp } from "@/lib/progress";
import { useProgress } from "@/components/progress-provider";
import { useAuth } from "@/components/auth-provider";

export function SiteHeader() {
  const { progress } = useProgress();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu" aria-expanded={open}>
          <Menu size={21} />
        </button>
        <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Navegação principal">
          <Link href="/jogar">Operações</Link>
          <Link href="/arquivo">Meu arquivo</Link>
          <a href="https://www.postgresql.org/docs/current/tutorial-sql.html" target="_blank" rel="noreferrer">Manual SQL</a>
        </nav>
        <div className="header-status">
          <span className="streak"><Flame size={16} /> {progress.streak}</span>
          {user ? (
            <Link className="agent-chip" href="/arquivo">
              <UserRound size={17} />
              <span>{user.email?.split("@")[0] ?? "Agente"}<strong>Nv. {levelFromXp(progress.xp)}</strong></span>
            </Link>
          ) : (
            <Link className="agent-chip" href="/entrar">
              <LogIn size={17} />
              <span>Modo visitante<strong>Entrar</strong></span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
