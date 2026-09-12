"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/effects";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

const latestPosts = [...blogPosts]
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .slice(0, 3);

export function Insights() {
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Insights
          </p>
          <h2 className="text-h1 font-bold text-foreground mb-6">
            Nos derniers articles
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Data, IA, Cloud : nos experts partagent leurs retours d&apos;expérience et leurs analyses.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {latestPosts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 0.1}>
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <Badge className="rounded-full mb-4 w-fit">{post.category}</Badge>
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/blog">
              Voir tous les articles
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
