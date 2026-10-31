"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackgroundBeams, Reveal } from "@/components/effects";
import Link from "next/link";
import { Clock, User } from "lucide-react";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { formatDateFr as formatDate } from "@/lib/dates";

/** Serializable subset of a post: article bodies never ship to the client bundle. */
export interface BlogListItem {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  featured: boolean;
  readTime: string;
  date: string;
  authorName: string;
}

const categories = ["Tous", "Data", "IA", "Cloud", "Conseil", "Tech"];

export function BlogList({ posts, visual }: { posts: BlogListItem[]; visual?: React.ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "Tous") {
      return posts;
    }
    return posts.filter(post => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  const featuredArticles = filteredPosts.filter(a => a.featured);
  const otherArticles = filteredPosts.filter(a => !a.featured);

  return (
    <>
        {/* Hero Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <BackgroundBeams />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <Breadcrumbs crumbs={[{ name: "Blog", path: "/blog" }]} />
          </div>
          <Reveal className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <Badge variant="outline" className="rounded-full px-4 py-2 mb-8 border-primary/30 bg-primary/5">
              Blog
            </Badge>
            <h1 className="text-hero font-bold mb-6">
              <span className="text-foreground">Le blog </span>
              <span className="gradient-text">IA &amp; data</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Guides pratiques, retours d&apos;expérience et analyses pour adopter l&apos;IA en
              entreprise sur des fondations Data et Cloud solides.
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
            {visual && <div className="mt-14 max-w-5xl mx-auto text-left">{visual}</div>}
          </Reveal>
        </section>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <Reveal>
                <h2 className="text-h2 font-bold text-foreground mb-8">À la une</h2>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.map((article, index) => (
                  <Reveal key={article.slug} delay={index * 0.1}>
                    <Link href={`/blog/${article.slug}`} className="group block h-full">
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
                                {article.authorName}
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
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Other Articles */}
        {otherArticles.length > 0 && (
          <section className="py-16 bg-secondary/20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <Reveal>
                <h2 className="text-h2 font-bold text-foreground mb-8">Tous les articles</h2>
              </Reveal>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherArticles.map((article, index) => (
                  <Reveal key={article.slug} delay={index * 0.05}>
                    <Link href={`/blog/${article.slug}`} className="group block h-full">
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
                  </Reveal>
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
    </>
  );
}
