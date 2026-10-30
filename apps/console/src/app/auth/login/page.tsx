import type { Metadata } from "next";
import { AuthCard } from "../auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };

const ERRORS: Record<string, string> = {
  link: "Ce lien de connexion est invalide ou a expiré. Demandez-en un nouveau.",
  config: "La console n'est pas configurée (variables Supabase manquantes).",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "";
  const errorKey = typeof params.error === "string" ? params.error : "";
  return (
    <AuthCard title="Agenfy Console" description="Équipe Agenfy et clients : connectez-vous à votre espace.">
      <LoginForm next={next} initialError={ERRORS[errorKey] ?? null} />
    </AuthCard>
  );
}
