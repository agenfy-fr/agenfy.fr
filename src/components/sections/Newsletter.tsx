"use client";

import { Button } from "@/components/ui/button";
import { Mail, Sparkles } from "lucide-react";
import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue');
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setEmail("");
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
      
      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Restez à la pointe de la tech
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Recevez nos derniers insights sur la Data, l&apos;IA et le Cloud directement dans votre boîte mail. 
          Pas de spam, que du contenu de qualité.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-card border border-border focus:border-primary outline-none transition-colors disabled:opacity-50"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="rounded-full px-8 gradient-btn border-0"
            >
              {loading ? "Inscription..." : "S'abonner"}
            </Button>
            {error && (
              <p className="w-full text-center text-red-500 text-sm">{error}</p>
            )}
          </form>
        ) : (
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 max-w-md mx-auto">
            <p className="text-primary font-medium mb-1">Merci de votre inscription ! 🎉</p>
            <p className="text-muted-foreground text-sm">
              Vous recevrez bientôt nos meilleurs contenus.
            </p>
          </div>
        )}

        <p className="text-muted-foreground text-sm mt-4">
          En vous inscrivant, vous acceptez notre{" "}
          <a href="/politique-confidentialite" className="text-primary hover:underline">
            politique de confidentialité
          </a>.
        </p>
      </div>
    </section>
  );
}
