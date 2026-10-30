import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact : parlons de votre projet IA",
  description:
    "Prenez rendez-vous avec Agenfy : 30 minutes, sans engagement, pour parler formation IA, agents IA, automatisation ou développement IA sur mesure.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
