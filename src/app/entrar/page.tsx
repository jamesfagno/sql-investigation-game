import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Identificação do agente" };

export default function LoginPage() {
  return <AuthForm />;
}

