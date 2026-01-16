"use client";

import { useState, useMemo } from "react";
import { Header, Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, User, ArrowRight, Mail } from "lucide-react";
import { blogPosts } from "@/lib/blog-posts";

const categories = ["Tous", "Data", "IA", "Cloud", "Conseil", "Tech"];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [email, setEmail] = useState("");

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "Tous") {
      return blogPosts;
    }
    return blogPosts.filter(post => post.category === selectedCategory);
  }, [selectedCategory]);

  const featuredArticles = filteredPosts.filter(a => a.featured);
  const otherArticles = filteredPosts.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <Badge variant="outline" className="rounded-full px-4 py-2 mb-8 border-primary/30 bg-primary/5">
              Blog
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Insights </span>
              <span className="gradient-text">tech</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Nos experts partagent leurs connaissances sur la Data, l&apos;IA, le Cloud 
              et la transformation digitale.
            </p>
            
            {/* Categories Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === selectedCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full transition-all ${
                    category === selectedCategory 
                      ? "gradient-btn border-0" 
                      : "hover:border-primary/50"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-foreground mb-8">À la une</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.map((article) => (
                  <Link key={article.slug} href={`/blog/${article.slug}`} className="group">
                    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all overflow-hidden h-full">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className="rounded-full">{article.category}</Badge>
                          {article.featured && (
                            <Badge variant="outline" className="rounded-full border-accent text-accent">
                              À la une
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {article.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {article.readTime}
                            </span>
                          </div>
                          <span>{formatDate(article.date)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Other Articles */}
        {otherArticles.length > 0 && (
          <section className="py-16 bg-secondary/20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-foreground mb-8">Tous les articles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherArticles.map((article) => (
                  <Link key={article.slug} href={`/blog/${article.slug}`} className="group">
                    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all h-full">
                      <CardContent className="p-6">
                        <Badge className="rounded-full mb-4">{article.category}</Badge>
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.readTime}
                          </span>
                          <span>{formatDate(article.date)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* No articles message */}
        {filteredPosts.length === 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
              <p className="text-muted-foreground">
                Aucun article dans cette catégorie pour le moment.
              </p>
            </div>
          </section>
        )}

        {/* Newsletter */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-8 md:p-12 text-center">
                <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Restez informé
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Recevez nos derniers articles et insights tech directement dans votre boîte mail.
                </p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-full bg-background border border-border/50 focus:border-primary focus:outline-none"
                  />
                  <Button type="submit" className="rounded-full gradient-btn">
                    S&apos;abonner
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
