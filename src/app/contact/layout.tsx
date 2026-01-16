import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Agenfy - Prenez rendez-vous",
  description: "Discutons de votre projet. Prenez rendez-vous avec nos experts Data, IA et Cloud.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
