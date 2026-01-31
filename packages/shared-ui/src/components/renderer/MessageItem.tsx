"use client";

import { memo, useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Message } from "@chat2poster/core-schema";
import type { Theme } from "@chat2poster/themes";
import { cssVar } from "@chat2poster/themes";
import { MessageAvatar } from "./MessageAvatar";
import { CodeBlock } from "./CodeBlock";
import type { BundledTheme } from "shiki";

export interface MessageItemProps {
  message: Message;
  theme?: Theme;
  showAvatar?: boolean;
  showRoleBadge?: boolean;
}

/**
 * Single message item component
 * Renders markdown content with code highlighting
 */
export const MessageItem = memo(function MessageItem({
  message,
  theme,
  showAvatar = true,
  showRoleBadge = false,
}: MessageItemProps) {
  const { role, contentMarkdown } = message;

  const containerStyle: React.CSSProperties = {
    display: "flex",
    gap: cssVar("messagePadding"),
    padding: cssVar("messagePadding"),
    backgroundColor: getBubbleBackground(role),
    borderRadius: cssVar("bubbleRadius"),
    color: getBubbleForeground(role),
    fontFamily: cssVar("fontFamily"),
    fontSize: cssVar("fontSize"),
    lineHeight: cssVar("lineHeight"),
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0, // Allow text to wrap
    overflow: "hidden",
  };

  const roleBadgeStyle: React.CSSProperties = {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "capitalize",
    color: cssVar("mutedForeground"),
    marginBottom: "4px",
  };

  const codeTheme = (theme?.tokens.codeTheme ?? "github-dark") as BundledTheme;

  // Custom markdown components
  const markdownComponents: Components = useMemo(
    () => ({
      code: ({ className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || "");
        const language = match ? match[1] : "";
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const codeString = String(children).replace(/\n$/, "");

        // Check if it's a code block (has newlines) or inline code
        const isBlock = codeString.includes("\n") || language;

        if (isBlock) {
          return (
            <CodeBlock
              code={codeString}
              language={language}
              codeTheme={codeTheme}
            />
          );
        }

        // Inline code
        return (
          <code
            {...props}
            style={{
              backgroundColor: cssVar("muted"),
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.9em",
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            }}
          >
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
          style={{
            color: "inherit",
            textDecoration: "underline",
          }}
        >
          {children}
        </a>
      ),
      img: ({ src, alt, ...props }) => (
        <img
          {...props}
          src={src}
          alt={alt || ""}
          style={{
            maxWidth: "100%",
            height: "auto",
            borderRadius: "8px",
            margin: "8px 0",
          }}
          loading="lazy"
        />
      ),
      p: ({ children }) => (
        <p style={{ margin: "0 0 12px 0" }}>{children}</p>
      ),
      ul: ({ children }) => (
        <ul style={{ margin: "0 0 12px 0", paddingLeft: "24px" }}>
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol style={{ margin: "0 0 12px 0", paddingLeft: "24px" }}>
          {children}
        </ol>
      ),
      li: ({ children }) => <li style={{ marginBottom: "4px" }}>{children}</li>,
      blockquote: ({ children }) => (
        <blockquote
          style={{
            margin: "0 0 12px 0",
            padding: "8px 16px",
            borderLeft: `4px solid ${cssVar("border")}`,
            backgroundColor: cssVar("muted"),
            borderRadius: "4px",
          }}
        >
          {children}
        </blockquote>
      ),
      h1: ({ children }) => (
        <h1 style={{ margin: "0 0 12px 0", fontSize: "1.5em" }}>{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 style={{ margin: "0 0 12px 0", fontSize: "1.3em" }}>{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1em" }}>{children}</h3>
      ),
      hr: () => (
        <hr
          style={{
            border: "none",
            borderTop: `1px solid ${cssVar("border")}`,
            margin: "16px 0",
          }}
        />
      ),
      table: ({ children }) => (
        <div style={{ overflowX: "auto", margin: "0 0 12px 0" }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              fontSize: "0.9em",
            }}
          >
            {children}
          </table>
        </div>
      ),
      th: ({ children }) => (
        <th
          style={{
            padding: "8px 12px",
            borderBottom: `2px solid ${cssVar("border")}`,
            textAlign: "left",
            fontWeight: 600,
          }}
        >
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td
          style={{
            padding: "8px 12px",
            borderBottom: `1px solid ${cssVar("border")}`,
          }}
        >
          {children}
        </td>
      ),
    }),
    [codeTheme]
  );

  return (
    <div
      style={containerStyle}
      className={`c2p-message c2p-message-${role}`}
      data-role={role}
    >
      {showAvatar && <MessageAvatar role={role} />}
      <div style={contentStyle} className="c2p-message-content">
        {showRoleBadge && (
          <div style={roleBadgeStyle} className="c2p-message-role">
            {role}
          </div>
        )}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={markdownComponents}
        >
          {contentMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
});

function getBubbleBackground(role: Message["role"]): string {
  switch (role) {
    case "user":
      return cssVar("userBubble");
    case "assistant":
      return cssVar("assistantBubble");
    case "system":
      return cssVar("systemBubble");
    default:
      return cssVar("muted");
  }
}

function getBubbleForeground(role: Message["role"]): string {
  switch (role) {
    case "user":
      return cssVar("userBubbleForeground");
    case "assistant":
      return cssVar("assistantBubbleForeground");
    case "system":
      return cssVar("systemBubbleForeground");
    default:
      return cssVar("foreground");
  }
}
