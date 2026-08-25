import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PlayerFile } from "@/components/player-file";

export const metadata: Metadata = { title: "Meu arquivo" };

export default function ProfilePage() {
  return <><SiteHeader /><PlayerFile /></>;
}
