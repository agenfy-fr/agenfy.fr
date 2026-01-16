"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X, ChevronDown } from "lucide-react";

const navLinks = [
  { 
    href: "/services", 
    label: "Services",
    submenu: [
      { href: "/services/data", label: "Data" },
      { href: "/services/intelligence-artificielle", label: "Intelligence Artificielle" },
      { href: "/services/cloud", label: "Infrastructure & Cloud" },
      { href: "/services/conseil", label: "Conseil" },
    ]
  },
  { href: "/a-propos", label: "À propos" },
  { href: "/etudes-de-cas", label: "Études de cas" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.svg" 
              alt="Agenfy" 
              width={160} 
              height={50}
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.href} className="relative group">
                {link.submenu ? (
                  <>
                    <button
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                      onMouseEnter={() => setOpenSubmenu(link.href)}
                      onMouseLeave={() => setOpenSubmenu(null)}
                    >
                      {link.label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div 
                      className={`absolute top-full left-0 pt-2 ${openSubmenu === link.href ? 'block' : 'hidden'} group-hover:block`}
                      onMouseEnter={() => setOpenSubmenu(link.href)}
                      onMouseLeave={() => setOpenSubmenu(null)}
                    >
                      <div className="bg-card border border-border rounded-xl p-2 min-w-[220px] shadow-xl">
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.href}
                            href={sublink.href}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                          >
                            {sublink.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Theme Toggle & CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button asChild className="rounded-full px-6 gradient-btn border-0">
              <Link href="/contact">Prendre rendez-vous</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <div key={link.href}>
                  {link.submenu ? (
                    <>
                      <button
                        className="flex items-center justify-between w-full text-muted-foreground hover:text-foreground transition-colors text-lg font-medium py-2"
                        onClick={() => setOpenSubmenu(openSubmenu === link.href ? null : link.href)}
                      >
                        {link.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${openSubmenu === link.href ? 'rotate-180' : ''}`} />
                      </button>
                      {openSubmenu === link.href && (
                        <div className="pl-4 flex flex-col gap-2 mt-2">
                          {link.submenu.map((sublink) => (
                            <Link
                              key={sublink.href}
                              href={sublink.href}
                              className="text-muted-foreground hover:text-foreground transition-colors py-2"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {sublink.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium py-2 block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
              <Button asChild className="rounded-full mt-4 gradient-btn border-0">
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                  Prendre rendez-vous
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
