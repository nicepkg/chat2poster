"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { highlightCode } from "~/utils/shiki";
import { cssVar } from "~/themes";
import { useI18n } from "~/i18n";
import type { BundledTheme } from "shiki";

export interface CodeBlockProps {
  code: string;
  language?: string;
  codeTheme?: BundledTheme;
  showCopyButton?: boolean;
  showLanguageLabel?: boolean;
}

/**
 * Code block component with syntax highlighting
 */
export const CodeBlock = memo(function CodeBlock({
  code,
  language = "text",
  codeTheme = "github-dark",
  showCopyButton = true,
  showLanguageLabel = true,
}: CodeBlockProps) {
  const { t } = useI18n();
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);

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

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "8px 0",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: cssVar("codeBlockBackground"),
    borderBottom: `1px solid ${cssVar("border")}`,
    color: cssVar("mutedForeground"),
    fontSize: "12px",
  };

  const copyButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: cssVar("mutedForeground"),
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "background-color 0.2s",
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
      {(showLanguageLabel || showCopyButton) && (
        <div style={headerStyle} className="c2p-code-block-header">
          {showLanguageLabel && (
            <span className="c2p-code-block-language">{language || "text"}</span>
          )}
          {showCopyButton && (
            <button
              onClick={handleCopy}
              style={copyButtonStyle}
              className="c2p-code-block-copy"
              title={copied ? t("code.copiedTitle") : t("code.copyCode")}
            >
              {copied ? (
                <>
                  <CheckIcon />
                  <span>{t("code.copied")}</span>
                </>
              ) : (
                <>
                  <CopyIcon />
                  <span>{t("code.copy")}</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
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
