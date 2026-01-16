import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agenfy | Conseil & Intégration Technologique - Data, IA, Cloud",
  description:
    "Agenfy accompagne les entreprises dans leur transformation digitale. Expertise en Data, Intelligence Artificielle, Infrastructure Cloud et Conseil stratégique.",
  keywords: [
    "conseil",
    "intégration",
    "data",
    "intelligence artificielle",
    "IA",
    "cloud",
    "transformation digitale",
    "consulting",
    "tech",
  ],
  authors: [{ name: "Agenfy" }],
  openGraph: {
    title: "Agenfy | Conseil & Intégration Technologique",
    description:
      "Transformez vos données en avantage concurrentiel. Data, IA, Cloud et Conseil.",
    url: "https://agenfy.fr",
    siteName: "Agenfy",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agenfy | Conseil & Intégration Technologique",
    description:
      "Transformez vos données en avantage concurrentiel. Data, IA, Cloud et Conseil.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
