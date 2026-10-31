import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbLabel } from "@/components/nav/breadcrumb-label";
import { BLOG_WRITE_ROLES, canWriteDomain } from "@/lib/access-control";
import { BLOG_POST_COLUMNS, type BlogPostRecord } from "@/lib/blog";
import { UUID_RE } from "@/lib/schemas";
import { requireStaffPage } from "@/lib/server/auth";
import { blogImagePublicUrl } from "@/lib/server/blog";
import { BlogPostEditor } from "../blog-post-editor";

export const metadata: Metadata = { title: "Article" };

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase, role } = await requireStaffPage("/blog");
  const { data } = await supabase.from("blog_posts").select(BLOG_POST_COLUMNS).eq("id", id).maybeSingle();
  if (!data) notFound();
  const post = data as unknown as BlogPostRecord;

  return (
    <>
      <BreadcrumbLabel label={post.title} />
      <BlogPostEditor
        post={post}
        coverUrl={blogImagePublicUrl(post.cover_image_path)}
        ogUrl={blogImagePublicUrl(post.og_image_path)}
        canEdit={canWriteDomain(role, BLOG_WRITE_ROLES)}
        now={new Date().toISOString()}
      />
    </>
  );
}
