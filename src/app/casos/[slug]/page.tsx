import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASES, getCaseBySlug } from "@/data/cases";
import { CaseWorkspace } from "@/components/case-workspace";

type CasePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CASES.map((gameCase) => ({ slug: gameCase.slug }));
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const gameCase = getCaseBySlug(slug);
  return gameCase ? { title: `${gameCase.code} — ${gameCase.title}` } : {};
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params;
  const gameCase = getCaseBySlug(slug);
  if (!gameCase) notFound();
  return <CaseWorkspace gameCase={gameCase} />;
}

