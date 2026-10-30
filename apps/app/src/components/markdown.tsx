import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Renders lesson Markdown (GFM). Raw HTML is not rendered (react-markdown
 * default), so content cannot inject scripts.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("lesson-prose prose prose-neutral dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: linkChildren, ...props }) => {
            const external = typeof href === "string" && /^https?:\/\//.test(href);
            return (
              <a
                href={href}
                {...props}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {linkChildren}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
