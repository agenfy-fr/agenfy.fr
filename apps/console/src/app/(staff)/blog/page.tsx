import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { BLOG_WRITE_ROLES, canWriteDomain } from "@/lib/access-control";
import { PUBLIC_SITE_URL } from "@/lib/blog";
import { requireStaffPage } from "@/lib/server/auth";
import { NewBlogPostButton } from "./blog-forms";
import { BlogList, type BlogListRow } from "./blog-list";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const { supabase, role } = await requireStaffPage("/blog");
  const { data } = await supabase
    .from("blog_posts")
    .select("id, slug, title, category, status, published_at, featured, noindex, updated_at")
    .order("updated_at", { ascending: false })
    .limit(500);
  const rows = (data ?? []) as BlogListRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog"
        description={
          <>
            Articles publiés sur{" "}
            <a href={`${PUBLIC_SITE_URL}/blog`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              www.agenfy.fr/blog
            </a>{" "}
            (mise à jour du site sous 5 minutes). Les articles historiques écrits dans le code du site restent affichés en plus de ceux-ci.
          </>
        }
        actions={canWriteDomain(role, BLOG_WRITE_ROLES) ? <NewBlogPostButton /> : null}
      />
      <Card>
        <CardContent className="p-4">
          <BlogList rows={rows} now={new Date().toISOString()} />
        </CardContent>
      </Card>
    </div>
  );
}
