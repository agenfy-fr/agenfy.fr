import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Agenfy - Prenez rendez-vous",
  description: "Discutons de votre projet. Prenez rendez-vous avec nos experts Data, IA et Cloud.",
  alternates: {
    canonical: "https://www.agenfy.fr/contact",
  },
  openGraph: {
    title: "Contact | Agenfy",
    description: "Prenez rendez-vous avec nos experts Data, IA et Cloud.",
    url: "https://www.agenfy.fr/contact",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
