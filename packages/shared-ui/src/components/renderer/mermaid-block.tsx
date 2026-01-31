"use client";

import { memo, useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useI18n } from "~/i18n";

// Initialize mermaid
let mermaidInitialized = false;

function initMermaid() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
  });
  mermaidInitialized = true;
}

export interface MermaidBlockProps {
  code: string;
  className?: string;
}

/**
 * Mermaid diagram block component
 * Renders mermaid code as SVG diagrams
 */
export const MermaidBlock = memo(function MermaidBlock({
  code,
  className,
}: MermaidBlockProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initMermaid();

    const renderDiagram = async () => {
      if (!code.trim()) return;

      try {
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, code);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError(err instanceof Error ? err.message : "Failed to render diagram");
        setSvg("");
      }
    };

    void renderDiagram();
  }, [code]);

  const containerStyle: React.CSSProperties = {
    margin: "16px 0",
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    overflow: "auto",
    textAlign: "center",
  };

  const errorStyle: React.CSSProperties = {
    color: "#dc3545",
    padding: "12px",
    backgroundColor: "#f8d7da",
    borderRadius: "4px",
    fontSize: "14px",
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
    textAlign: "left",
  };

  const fallbackStyle: React.CSSProperties = {
    padding: "12px",
    backgroundColor: "#f1f3f5",
    borderRadius: "4px",
    fontSize: "13px",
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    whiteSpace: "pre-wrap",
    textAlign: "left",
    color: "#495057",
  };

  if (error) {
    return (
      <div
        ref={containerRef}
        style={containerStyle}
        className={`c2p-mermaid-block c2p-mermaid-error ${className || ""}`}
      >
        <div style={errorStyle}>
          {t("mermaid.error")}: {error}
        </div>
        <details style={{ marginTop: "8px", textAlign: "left" }}>
          <summary style={{ cursor: "pointer", fontSize: "14px" }}>
            {t("mermaid.viewSource")}
          </summary>
          <pre style={fallbackStyle}>{code}</pre>
        </details>
      </div>
    );
  }

  if (!svg) {
    return (
      <div
        ref={containerRef}
        style={containerStyle}
      className={`c2p-mermaid-block c2p-mermaid-loading ${className || ""}`}
    >
      <div style={{ color: "#6c757d", fontSize: "14px" }}>
        {t("mermaid.loading")}
      </div>
    </div>
  );
  }

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className={`c2p-mermaid-block ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
});
