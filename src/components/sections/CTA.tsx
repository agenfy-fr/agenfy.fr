"use client";

import { useEffect } from "react";

export function CTA() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section id="contact" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Calendly inline widget */}
        <div 
          className="calendly-inline-widget" 
          data-url="https://calendly.com/contact-agenfy/30min?primary_color=6b4eff"
          style={{ minWidth: "320px", height: "700px" }}
        />
      </div>
    </section>
  );
}
