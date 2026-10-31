import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { BLOG_CACHE_TAG } from "@/lib/blog";
import { isAuthorizedBearer, parseSlugs } from "@/lib/revalidate-auth";

/**
 * On-demand refresh of the blog, called by console.agenfy.fr after a publish
 * / unpublish / edit of a published article:
 *   POST /api/revalidate  Authorization: Bearer <REVALIDATE_SECRET>  {"slugs": ["…"]}
 * Without REVALIDATE_SECRET the route is disabled (pages still refresh every 5 min).
 */
export async function POST(request: NextRequest) {
  const secret = process.env["REVALIDATE_SECRET"];
  if (!secret) return NextResponse.json({ error: "Revalidation désactivée" }, { status: 404 });
  if (!isAuthorizedBearer(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const slugs = parseSlugs(await request.json().catch(() => null));

  // Fresh data on the very next request (no stale-while-revalidate window).
  revalidateTag(BLOG_CACHE_TAG, { expire: 0 });
  for (const path of ["/", "/blog", "/sitemap.xml", "/llms.txt", "/auteurs/evan-masse"]) revalidatePath(path);
  for (const slug of slugs) revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ revalidated: true, slugs });
}
