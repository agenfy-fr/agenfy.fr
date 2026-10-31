"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { BLOG_WRITE_ROLES } from "@/lib/access-control";
import { BLOG_IMAGES_BUCKET, MAX_BLOG_IMAGE_BYTES, blogSlug, isAllowedBlogImageType } from "@/lib/blog";
import { blogCreateSchema, blogPostSchema, uuid } from "@/lib/schemas";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaffRole } from "@/lib/server/auth";
import { blogImagePublicUrl, revalidateWebsiteBlog } from "@/lib/server/blog";
import { safeFileName } from "@/lib/server/storage";

function revalidateConsole(id?: string) {
  revalidatePath("/blog");
  if (id) revalidatePath(`/blog/${id}`, "layout");
}

/** Refresh www.agenfy.fr after the response is sent (never blocks nor fails the action). */
function refreshWebsite(slugs: (string | null | undefined)[]) {
  after(() => revalidateWebsiteBlog(slugs));
}

export async function createBlogPost(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const res = await runAction(async () => {
    const { supabase } = await requireStaffRole(BLOG_WRITE_ROLES);
    const input = blogCreateSchema.parse(formToObject(formData));
    const base = blogSlug(input.title);
    const { data: taken } = await supabase.from("blog_posts").select("slug").like("slug", `${base}%`);
    const slugs = new Set((taken ?? []).map((r) => r.slug as string));
    let slug = base;
    for (let i = 2; slugs.has(slug); i++) slug = `${base}-${i}`;

    const post = check(
      await supabase.from("blog_posts").insert({ title: input.title, category: input.category, slug }).select("id").single(),
    ) as { id: string };
    revalidateConsole();
    return post.id;
  });
  if (res.ok && res.data) redirect(`/blog/${res.data}`);
  return res.ok ? { ok: true } : res;
}

export async function updateBlogPost(postId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffRole(BLOG_WRITE_ROLES);
    const id = uuid.parse(postId);
    const { intent, ...input } = blogPostSchema.parse(formToObject(formData));
    const before = check(await supabase.from("blog_posts").select("slug, status").eq("id", id).maybeSingle()) as {
      slug: string;
      status: string;
    } | null;
    if (!before) throw new ActionError("Article introuvable.");

    const status = intent === "publish" ? "published" : intent === "unpublish" ? "draft" : input.status;
    if (status === "published" && !input.title.trim()) throw new ActionError("Ajoutez un titre avant de publier.");

    const { error } = await supabase
      .from("blog_posts")
      // published_at empty + published → the database sets now() (trigger).
      .update({ ...input, status, published_at: input.published_at })
      .eq("id", id);
    if (error?.code === "23505") throw new ActionError("Cette URL (slug) est déjà utilisée par un autre article.");
    check({ data: null, error });

    revalidateConsole(id);
    if (status === "published" || before.status === "published") refreshWebsite([before.slug, input.slug]);
    return undefined;
  }, formIntent(formData) === "publish" ? "Article publié." : formIntent(formData) === "unpublish" ? "Article repassé en brouillon." : "Article enregistré.");
}

function formIntent(formData: FormData): string {
  const v = formData.get("intent");
  return typeof v === "string" ? v : "save";
}

export async function deleteBlogPost(postId: string): Promise<ActionResult> {
  const res = await runAction(async () => {
    const { supabase } = await requireStaffRole(BLOG_WRITE_ROLES);
    const id = uuid.parse(postId);
    const post = check(await supabase.from("blog_posts").select("slug, status").eq("id", id).maybeSingle()) as {
      slug: string;
      status: string;
    } | null;
    if (!post) throw new ActionError("Article introuvable.");
    check(await supabase.from("blog_posts").delete().eq("id", id));
    revalidateConsole();
    if (post.status === "published") refreshWebsite([post.slug]);
    return undefined;
  }, "Article supprimé.");
  if (res.ok) redirect("/blog");
  return res;
}

/**
 * Upload an image to the public `blog-images` bucket (staff session: storage
 * RLS applies). Used by the editor (inline images) and the cover / OG fields.
 */
export async function uploadBlogImage(formData: FormData): Promise<ActionResult<{ path: string; url: string }>> {
  return runAction(async () => {
    const { supabase } = await requireStaffRole(BLOG_WRITE_ROLES);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) throw new ActionError("Choisissez une image.");
    if (!isAllowedBlogImageType(file.type)) throw new ActionError("Format accepté : PNG, JPEG, WebP, GIF ou AVIF.");
    if (file.size > MAX_BLOG_IMAGE_BYTES) throw new ActionError("Image trop lourde (4 Mo maximum) : compressez-la (WebP conseillé).");

    const now = new Date();
    const path = `posts/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID().slice(0, 8)}-${safeFileName(file.name).toLowerCase()}`;
    const { error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      console.error("[blog] image upload failed:", error.message);
      throw new ActionError("Téléversement impossible.");
    }
    const url = blogImagePublicUrl(path);
    if (!url) throw new ActionError("Configuration Supabase manquante.");
    return { path, url };
  }, "Image téléversée.");
}
