import type { Metadata } from "next";
import { headers } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Agenfy Console", template: "%s · Agenfy Console" },
  description: "Console Agenfy — gestion des clients, projets et facturation, et espace client.",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/agenfy-logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Per-request CSP nonce set by src/proxy.ts (see src/lib/csp.ts). Reading
  // headers() also keeps every page dynamic: a prerendered page has no nonce.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <Providers nonce={nonce}>{children}</Providers>
      </body>
    </html>
  );
}
