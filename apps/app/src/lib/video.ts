/**
 * Lesson video resolution for app.agenfy.fr.
 *
 *  - lessons.video_path: file in the private Storage bucket `training-videos`
 *    (migration 0304), played through a short-lived signed URL created with
 *    the learner's session (Storage RLS: enrolled learners + staff only).
 *  - lessons.video_url: https link. YouTube / Vimeo / Loom links become
 *    privacy-friendly embeds; direct video files play in <video>; anything
 *    else is offered as an external link (never framed).
 */

export const TRAINING_VIDEO_BUCKET = "training-videos";
/** Lifetime of a signed video URL (seconds): enough for a long lesson. */
export const SIGNED_VIDEO_TTL = 60 * 60 * 3;

export type ResolvedVideo =
  | { kind: "embed"; src: string; provider: "youtube" | "vimeo" | "loom" }
  | { kind: "file"; src: string }
  | { kind: "link"; href: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,20}$/;

export function resolveVideoUrl(url: string | null | undefined): ResolvedVideo | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "youtu.be") {
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.split("/")[1] ?? null;
    else if (u.pathname === "/watch") id = u.searchParams.get("v");
    else {
      const m = /^\/(embed|shorts|live)\/([^/?#]+)/.exec(u.pathname);
      id = m?.[2] ?? null;
    }
    if (!id || !YOUTUBE_ID.test(id)) return { kind: "link", href: u.toString() };
    const start = Number.parseInt(u.searchParams.get("t") ?? u.searchParams.get("start") ?? "", 10);
    const src = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
    if (Number.isFinite(start) && start > 0) src.searchParams.set("start", String(start));
    return { kind: "embed", provider: "youtube", src: src.toString() };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = host === "player.vimeo.com" ? /^\/video\/(\d+)/.exec(u.pathname) : /^\/(\d+)(?:\/([0-9a-f]+))?/.exec(u.pathname);
    if (!m) return { kind: "link", href: u.toString() };
    const src = new URL(`https://player.vimeo.com/video/${m[1]}`);
    const hash = u.searchParams.get("h") ?? (host === "vimeo.com" ? m[2] : undefined);
    if (hash && /^[0-9a-f]+$/.test(hash)) src.searchParams.set("h", hash);
    src.searchParams.set("dnt", "1");
    return { kind: "embed", provider: "vimeo", src: src.toString() };
  }

  if (host === "loom.com") {
    const m = /^\/(share|embed)\/([0-9a-f]+)/.exec(u.pathname);
    if (!m) return { kind: "link", href: u.toString() };
    return { kind: "embed", provider: "loom", src: `https://www.loom.com/embed/${m[2]}` };
  }

  if (/\.(mp4|webm|ogg|ogv|mov|m4v)$/i.test(u.pathname)) return { kind: "file", src: u.toString() };
  return { kind: "link", href: u.toString() };
}
