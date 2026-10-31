import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Links outside the console open in a new tab. */
const components: Components = {
  a: ({ href, children }) => {
    const external = !!href && /^https?:\/\//i.test(href);
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  },
  // A page has a single H1 (the article title): demote stray ones.
  h1: ({ children }) => <h2>{children}</h2>,
  img: ({ src, alt }) =>
    // eslint-disable-next-line @next/next/no-img-element -- Markdown images, unknown dimensions
    typeof src === "string" ? <img src={src} alt={alt ?? ""} loading="lazy" /> : null,
};

/**
 * Read-only rendering of Markdown written with MarkdownEditor (same
 * `.markdown-body` typography). Raw HTML is ignored (skipHtml) and unsafe
 * URLs (javascript:…) are stripped by react-markdown's default urlTransform.
 */
export function MarkdownView({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <div className={cn("markdown-body", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
