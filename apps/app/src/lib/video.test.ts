import { describe, expect, it } from "vitest";
import { resolveVideoUrl } from "./video";

describe("resolveVideoUrl", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?t=42", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=42"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"],
    ["https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"],
    ["https://vimeo.com/123456", "https://player.vimeo.com/video/123456?dnt=1"],
    ["https://vimeo.com/123456/abcdef12", "https://player.vimeo.com/video/123456?h=abcdef12&dnt=1"],
    ["https://player.vimeo.com/video/123456", "https://player.vimeo.com/video/123456?dnt=1"],
    ["https://www.loom.com/share/0123abcd", "https://www.loom.com/embed/0123abcd"],
  ])("%s → embed %s", (url, src) => {
    expect(resolveVideoUrl(url)).toMatchObject({ kind: "embed", src });
  });

  it("plays direct video files and links to other pages", () => {
    expect(resolveVideoUrl("https://cdn.example.test/cours/intro.mp4")).toEqual({ kind: "file", src: "https://cdn.example.test/cours/intro.mp4" });
    expect(resolveVideoUrl("https://example.test/video-page")).toEqual({ kind: "link", href: "https://example.test/video-page" });
  });

  it("refuses non-https and garbage", () => {
    expect(resolveVideoUrl("http://youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(resolveVideoUrl("javascript:alert(1)")).toBeNull();
    expect(resolveVideoUrl("pas une url")).toBeNull();
    expect(resolveVideoUrl(null)).toBeNull();
  });

  it("never embeds an unknown YouTube id shape", () => {
    expect(resolveVideoUrl("https://www.youtube.com/watch?v=<script>")).toMatchObject({ kind: "link" });
  });
});
