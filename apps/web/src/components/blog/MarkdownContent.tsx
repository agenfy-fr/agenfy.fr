import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Divider, H2, H3, P, Strong, Table, Tbody, Td, Th, Thead, Tr } from "@/lib/blog-posts";
import { SITE } from "@/lib/site";

const isExternal = (href: string) => /^https?:\/\//i.test(href) && !href.startsWith(SITE.url);

/**
 * Markdown → the same building blocks as the hand-written articles
 * (`blog-posts.tsx`), so console articles look identical.
 *
 * Safe by construction: raw HTML in the Markdown is dropped (`skipHtml`, no
 * rehype-raw) and react-markdown's default `urlTransform` strips unsafe URLs
 * (javascript:, data:, vbscript:…).
 */
const components: Components = {
  // The article title is the page's only H1.
  h1: ({ children }) => <H2>{children}</H2>,
  h2: ({ children }) => <H2>{children}</H2>,
  h3: ({ children }) => <H3>{children}</H3>,
  h4: ({ children }) => <H3>{children}</H3>,
  h5: ({ children }) => <H3>{children}</H3>,
  h6: ({ children }) => <H3>{children}</H3>,
  p: ({ children }) => <P>{children}</P>,
  strong: ({ children }) => <Strong>{children}</Strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="opacity-80">{children}</del>,
  a: ({ href, children }) => {
    if (!href) return <>{children}</>;
    return isExternal(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:text-primary/80">
        {children}
      </a>
    ) : (
      <a href={href} className="text-primary underline underline-offset-4 hover:text-primary/80">
        {children}
      </a>
    );
  },
  ul: ({ children }) => (
    <ul className="list-none space-y-2 mb-6 ml-0 [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-1 [&>li]:before:content-['•'] [&_ul]:mt-2 [&_ul]:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-2 mb-6 pl-6 marker:text-muted-foreground [&_ol]:mt-2 [&_ol]:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="text-muted-foreground [&>p]:mb-0">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="bg-primary/5 border border-primary/20 rounded-xl p-6 my-6 text-foreground [&_p]:text-foreground [&>p:last-child]:mb-0">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="bg-secondary/50 border border-border/50 rounded-xl p-4 overflow-x-auto mb-6 text-sm [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-sm">
      {children}
    </pre>
  ),
  code: ({ children, className }) => (
    <code className={`text-foreground font-mono bg-secondary/50 rounded px-1.5 py-0.5 text-[0.9em] ${className ?? ""}`}>{children}</code>
  ),
  hr: () => <Divider />,
  table: ({ children }) => <Table>{children}</Table>,
  thead: ({ children }) => <Thead>{children}</Thead>,
  tbody: ({ children }) => <Tbody>{children}</Tbody>,
  tr: ({ children }) => <Tr>{children}</Tr>,
  th: ({ children }) => <Th>{children}</Th>,
  td: ({ children }) => <Td>{children}</Td>,
  img: ({ src, alt }) =>
    typeof src === "string" && src ? (
      // eslint-disable-next-line @next/next/no-img-element -- Markdown images: unknown dimensions, already sized for the web
      <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" className="block w-full h-auto rounded-xl border border-border/50 my-6" />
    ) : null,
};

export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
      {markdown}
    </ReactMarkdown>
  );
}
