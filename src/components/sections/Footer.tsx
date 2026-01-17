"use client";

import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Linkedin, Mail, Github } from "lucide-react";

// Custom X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const footerLinks = {
  services: [
    { label: "Data", href: "/services/data" },
    { label: "Intelligence Artificielle", href: "/services/intelligence-artificielle" },
    { label: "Infrastructure & Cloud", href: "/services/cloud" },
    { label: "Conseil", href: "/services/conseil" },
  ],
  company: [
    { label: "À propos", href: "/a-propos" },
    { label: "Études de cas", href: "/etudes-de-cas" },
    { label: "Blog", href: "/blog" },
  ],
  legal: [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Politique de confidentialité", href: "/politique-confidentialite" },
    { label: "CGV", href: "/cgv" },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: "https://www.linkedin.com/company/agenfy-fr/", label: "LinkedIn" },
  { icon: XIcon, href: "https://x.com/Agenfy_", label: "X (Twitter)" },
  { icon: Github, href: "https://github.com/agenfy-fr", label: "GitHub" },
  { icon: Mail, href: "mailto:contact@agenfy.fr", label: "Email" },
];

export function Footer() {
  return (
    <footer className="bg-card/30 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image 
                src="/logo.svg" 
                alt="Agenfy" 
                width={140} 
                height={45}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Conseil et intégration technologique. Nous accompagnons les entreprises 
              ambitieuses dans leur transformation Data, IA et Cloud.
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              Agenfy est une marque de <strong>Hasfy SAS</strong>
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Entreprise</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Légal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-border/30 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © 2026 Agenfy. Tous droits réservés.
          </p>
          <p className="text-muted-foreground text-sm">
            Conçu avec passion à Paris 🇫🇷
          </p>
        </div>
      </div>
    </footer>
  );
}
