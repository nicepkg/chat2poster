"use client";

import { memo, useState, useEffect, useCallback } from "react";
import type { BundledTheme } from "shiki";
import { cssVar } from "~/themes";
import { highlightCode } from "~/utils/shiki";

export interface CodeBlockProps {
  code: string;
  language?: string;
  codeTheme?: BundledTheme;
}

/**
 * Code block component with syntax highlighting
 */
export const CodeBlock = memo(function CodeBlock({
  code,
  language = "text",
  codeTheme = "github-dark",
}: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    highlightCode(code, language, codeTheme).then((result) => {
      if (!cancelled) {
        setHtml(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [code, language, codeTheme]);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "8px 0",
  };

  const codeContainerStyle: React.CSSProperties = {
    padding: "12px",
    margin: 0,
    overflow: "auto",
    backgroundColor: cssVar("codeBlockBackground"),
    color: cssVar("codeBlockForeground"),
  };

  // Fallback pre style for when shiki hasn't loaded yet
  const fallbackPreStyle: React.CSSProperties = {
    ...codeContainerStyle,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  };

  return (
    <div style={containerStyle} className="c2p-code-block">
      {html ? (
        <div
          style={codeContainerStyle}
          className="c2p-code-block-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre style={fallbackPreStyle} className="c2p-code-block-content">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
});

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
