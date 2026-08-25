import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { CaseMap } from "@/components/case-map";

export const metadata: Metadata = { title: "Mapa de operações" };

export default function PlayPage() {
  return <><SiteHeader /><CaseMap /></>;
}

