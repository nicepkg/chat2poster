"use client";

import { memo, useMemo, useEffect, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import type { BundledTheme } from "shiki";
import { MermaidBlock } from "./mermaid-block";
import { highlightCode } from "~/utils/shiki";

export interface MarkdownRendererProps {
  content: string;
  className?: string;
  /**
   * Shiki theme for code highlighting
   * @default "github-dark"
   */
  codeTheme?: BundledTheme;
  /**
   * Default language for code blocks without language specified
   * @default "bash"
   */
  defaultLanguage?: string;
}

/**
 * Standalone Markdown Renderer component with Shiki syntax highlighting
 * and Mermaid diagram support. Uses plain CSS (no Tailwind).
 */
export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className,
  codeTheme = "github-dark",
  defaultLanguage = "bash",
}: MarkdownRendererProps) {
  const markdownComponents: Components = useMemo(
    () => ({
      code: ({ className: codeClassName, children, ...props }) => {
        const match = /language-(\w+)/.exec(codeClassName || "");
        const language = match ? match[1] : "";
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const codeString = String(children).replace(/\n$/, "");

        // Check if it's a code block (has newlines or language)
        const isBlock = codeString.includes("\n") || language || codeClassName;

        if (isBlock) {
          // Handle mermaid diagrams
          if (language === "mermaid") {
            return <MermaidBlock code={codeString} />;
          }

          return (
            <ShikiCodeBlock
              code={codeString}
              language={language || defaultLanguage}
              theme={codeTheme}
            />
          );
        }

        // Inline code
        return (
          <code {...props} className="c2p-inline-code">
            {children}
          </code>
        );
      },
      pre: ({ children }) => {
        // The pre tag is handled by the code component
        return <>{children}</>;
      },
      a: ({ href, children, ...props }) => (
        <a
          {...props}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="c2p-link"
        >
          {children}
        </a>
      ),
      img: ({ src, alt, ...props }) =>
        src && typeof src === "string" ? (
          <img
            {...props}
            src={src}
            alt={alt || ""}
            className="c2p-image"
            loading="lazy"
          />
        ) : null,
      p: ({ children }) => <p className="c2p-paragraph">{children}</p>,
      ul: ({ children }) => <ul className="c2p-list c2p-ul">{children}</ul>,
      ol: ({ children }) => <ol className="c2p-list c2p-ol">{children}</ol>,
      li: ({ children }) => <li className="c2p-list-item">{children}</li>,
      blockquote: ({ children }) => (
        <blockquote className="c2p-blockquote">{children}</blockquote>
      ),
      h1: ({ children }) => <h1 className="c2p-heading c2p-h1">{children}</h1>,
      h2: ({ children }) => <h2 className="c2p-heading c2p-h2">{children}</h2>,
      h3: ({ children }) => <h3 className="c2p-heading c2p-h3">{children}</h3>,
      h4: ({ children }) => <h4 className="c2p-heading c2p-h4">{children}</h4>,
      h5: ({ children }) => <h5 className="c2p-heading c2p-h5">{children}</h5>,
      h6: ({ children }) => <h6 className="c2p-heading c2p-h6">{children}</h6>,
      hr: () => <hr className="c2p-hr" />,
      table: ({ children }) => (
        <div className="c2p-table-wrapper">
          <table className="c2p-table">{children}</table>
        </div>
      ),
      thead: ({ children }) => <thead className="c2p-thead">{children}</thead>,
      tbody: ({ children }) => <tbody className="c2p-tbody">{children}</tbody>,
      tr: ({ children }) => <tr className="c2p-tr">{children}</tr>,
      th: ({ children }) => <th className="c2p-th">{children}</th>,
      td: ({ children }) => <td className="c2p-td">{children}</td>,
      strong: ({ children }) => (
        <strong className="c2p-strong">{children}</strong>
      ),
      em: ({ children }) => <em className="c2p-em">{children}</em>,
      del: ({ children }) => <del className="c2p-del">{children}</del>,
    }),
    [codeTheme, defaultLanguage],
  );

  return (
    <div className={`c2p-markdown ${className || ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

// ============================================================================
// ShikiCodeBlock - Internal component for code highlighting
// ============================================================================

interface ShikiCodeBlockProps {
  code: string;
  language: string;
  theme: BundledTheme;
}

const ShikiCodeBlock = memo(function ShikiCodeBlock({
  code,
  language,
  theme,
}: ShikiCodeBlockProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    highlightCode(code, language, theme).then((result) => {
      if (!cancelled) {
        setHtml(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [code, language, theme]);

  return (
    <div className="c2p-code-block">
      {html ? (
        <div
          className="c2p-code-block-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="c2p-code-block-content c2p-code-block-fallback">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
});
