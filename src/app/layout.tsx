import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  OrganizationSchema,
  WebsiteSchema,
  LocalBusinessSchema,
} from "@/components/schemas";
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
  metadataBase: new URL("https://www.agenfy.fr"),
  title: {
    default: "Agenfy | Conseil Data, IA & Cloud à Paris",
    template: "%s | Agenfy",
  },
  description:
    "Cabinet de conseil tech spécialisé en Data Engineering, Intelligence Artificielle et Cloud. Nous accompagnons les PME et scale-ups dans leur transformation digitale.",
  keywords: [
    "conseil data",
    "data engineering",
    "intelligence artificielle",
    "IA",
    "machine learning",
    "cloud computing",
    "AWS",
    "GCP",
    "Azure",
    "transformation digitale",
    "consulting tech",
    "architecture data",
    "RAG",
    "LLM",
    "MLOps",
    "FinOps",
    "cabinet conseil Paris",
  ],
  authors: [{ name: "Agenfy", url: "https://www.agenfy.fr" }],
  creator: "Agenfy",
  publisher: "Agenfy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.agenfy.fr",
    siteName: "Agenfy",
    title: "Agenfy | Conseil Data, IA & Cloud à Paris",
    description:
      "Cabinet de conseil tech. Expertise en Data Engineering, Intelligence Artificielle et Infrastructure Cloud.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Agenfy - Conseil Data, IA & Cloud",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Agenfy_",
    creator: "@Agenfy_",
    title: "Agenfy | Conseil Data, IA & Cloud",
    description:
      "Cabinet de conseil tech. Data, IA, Cloud.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.agenfy.fr",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <WebsiteSchema />
        <LocalBusinessSchema />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3200F8" />
      </head>
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
