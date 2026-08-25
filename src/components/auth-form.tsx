"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, KeyRound, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthForm() {
  const router = useRouter();
  const { configured, user, signOut } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setLoading(true);
    setMessage(null);
    const response = mode === "signin"
      ? await client.auth.signInWithPassword({ email, password })
      : await client.auth.signUp({ email, password });
    setLoading(false);
    if (response.error) {
      setMessage({ type: "error", text: response.error.message });
      return;
    }
    if (mode === "signup" && !response.data.session) {
      setMessage({ type: "success", text: "Cadastro recebido. Confirme o acesso no e-mail enviado pela Central." });
      return;
    }
    router.push("/jogar");
  };

  if (user) {
    return (
      <main className="auth-page">
        <div className="auth-brand"><Brand /></div>
        <section className="auth-card signed-card"><ShieldCheck /><span>SESSÃO AUTORIZADA</span><h1>Acesso confirmado.</h1><p>Você está conectado como <strong>{user.email}</strong>.</p><Link className="button button-primary" href="/jogar">Abrir Central</Link><button className="text-button" onClick={async () => { await signOut(); }}>Encerrar sessão</button></section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-brand"><Brand /></div>
      <Link className="auth-back" href="/"><ArrowLeft size={15} /> Voltar ao início</Link>
      <section className="auth-intro"><span>PROTOCOLO DE IDENTIFICAÇÃO</span><h1>Seu arquivo.<br /><em>Em qualquer lugar.</em></h1><p>Entre para sincronizar seu progresso, sequência e conquistas entre dispositivos.</p><div><ShieldCheck /><span><strong>Dados protegidos</strong>O acesso é gerenciado pelo Supabase Auth.</span></div></section>
      <section className="auth-card">
        <div className="auth-tabs"><button className={mode === "signin" ? "is-active" : ""} onClick={() => { setMode("signin"); setMessage(null); }}>Entrar</button><button className={mode === "signup" ? "is-active" : ""} onClick={() => { setMode("signup"); setMessage(null); }}>Criar conta</button></div>
        {!configured ? (
          <div className="auth-unavailable"><KeyRound /><h2>Autenticação preparada</h2><p>O formulário será ativado após configurar as variáveis públicas do Supabase na Vercel.</p><code>NEXT_PUBLIC_SUPABASE_URL</code><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code><Link className="button button-primary" href="/jogar">Continuar como visitante</Link></div>
        ) : (
          <form onSubmit={submit}>
            <div className="auth-form-heading"><span>{mode === "signin" ? "BEM-VINDO DE VOLTA" : "NOVO CREDENCIAMENTO"}</span><h2>{mode === "signin" ? "Identifique-se, agente." : "Abra seu arquivo."}</h2></div>
            <label><span>E-mail</span><div><Mail size={16} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="agente@exemplo.com" required autoComplete="email" /></div></label>
            <label><span>Senha</span><div><KeyRound size={16} /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required autoComplete={mode === "signin" ? "current-password" : "new-password"} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>
            {message && <div className={`auth-message is-${message.type}`}>{message.text}</div>}
            <button className="button button-primary auth-submit" disabled={loading}>{loading ? <LoaderCircle className="spin" size={17} /> : null}{mode === "signin" ? "Autorizar acesso" : "Criar credencial"}</button>
            <p className="auth-terms">Ao continuar, você concorda com o armazenamento dos dados necessários ao progresso do jogo.</p>
          </form>
        )}
      </section>
    </main>
  );
}

