import Link from "next/link";
import { SearchX } from "lucide-react";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return <main className="not-found"><Brand /><SearchX size={48} /><span>ERRO 404 / ARQUIVO NÃO LOCALIZADO</span><h1>Este rastro termina aqui.</h1><p>O arquivo solicitado não existe ou foi removido da rede.</p><Link className="button button-primary" href="/jogar">Voltar ao mapa</Link></main>;
}
