import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { OrganizationSchema, WebsiteSchema } from "@/components/schemas";
import { SITE, DEFAULT_AUTHOR } from "@/lib/site";
import "./globals.css";
import { RouteTransition } from "@/components/effects/RouteTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Agenfy | Agence IA pour PME et ETI : formation, agents IA, automatisation",
    template: "%s | Agenfy",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: DEFAULT_AUTHOR.name, url: `${SITE.url}/auteurs/${DEFAULT_AUTHOR.slug}` }],
  creator: SITE.name,
  publisher: SITE.legalName,
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: "Agenfy | Agence IA pour PME et ETI",
    description: SITE.description,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Agenfy, agence IA", type: "image/jpeg" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Agenfy_",
    creator: "@Agenfy_",
    title: "Agenfy | Agence IA pour PME et ETI",
    description: SITE.description,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // No root canonical: it would be inherited by every page lacking its own and mark them as duplicates of "/".
  alternates: {
    types: { "text/plain": `${SITE.url}/llms.txt` },
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
          <RouteTransition />
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
