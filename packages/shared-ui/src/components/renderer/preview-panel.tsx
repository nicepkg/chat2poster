"use client";

import type { Message, Selection, Decoration } from "@chat2poster/core-schema";
import { memo, useRef, useEffect, useState } from "react";
import { CanvasContainer } from "./canvas-container";
import { ConversationView } from "./conversation-view";
import { PageIndicator } from "./page-indicator";
import type { Theme } from "~/themes";
import { cssVar } from "~/themes";

export interface PreviewPanelProps {
  /** Messages to display */
  messages: Message[];
  /** Current theme */
  theme: Theme;
  /** Decoration settings */
  decoration: Decoration;
  /** Selection state */
  selection?: Selection;
  /** Canvas width in pixels */
  canvasWidthPx: number;
  /** Maximum allowed height before showing warning */
  maxHeightWarningPx?: number;
  /** Current page being previewed (for multi-page) */
  currentPage?: number;
  /** Total pages (for multi-page) */
  totalPages?: number;
  /** Zoom level (0.1 to 2) */
  zoom?: number;
  /** Title for the conversation */
  title?: string;
  /** Show height estimation */
  showHeightEstimate?: boolean;
  /** Show page breaks */
  showPageBreaks?: boolean;
  /** Callback when height exceeds max */
  onHeightExceeded?: (heightPx: number) => void;
}

/**
 * Preview panel component combining decoration and conversation view
 * Includes zoom, height estimation, and pagination warning
 */
export const PreviewPanel = memo(function PreviewPanel({
  messages,
  theme,
  decoration,
  selection,
  canvasWidthPx,
  maxHeightWarningPx = 6000,
  currentPage = 1,
  totalPages = 1,
  zoom = 1,
  title,
  showHeightEstimate = true,
  showPageBreaks = true,
  onHeightExceeded,
}: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [estimatedHeight, setEstimatedHeight] = useState(0);
  const [isHeightExceeded, setIsHeightExceeded] = useState(false);

  // Measure actual height of rendered content
  useEffect(() => {
    if (!canvasRef.current) return;

    const measureHeight = () => {
      const height = canvasRef.current?.scrollHeight ?? 0;
      setEstimatedHeight(height);

      const exceeded = height > maxHeightWarningPx;
      setIsHeightExceeded(exceeded);

      if (exceeded && onHeightExceeded) {
        onHeightExceeded(height);
      }
    };

    // Measure after render
    measureHeight();

    // Re-measure on resize
    const observer = new ResizeObserver(measureHeight);
    observer.observe(canvasRef.current);

    return () => observer.disconnect();
  }, [messages, selection, decoration, maxHeightWarningPx, onHeightExceeded]);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    overflow: "auto",
    backgroundColor: "#e5e5e5",
    padding: "24px",
    minHeight: "200px",
  };

  const zoomWrapperStyle: React.CSSProperties = {
    transform: `scale(${zoom})`,
    transformOrigin: "top left",
    width: `${100 / zoom}%`,
  };

  const warningStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    marginBottom: "16px",
    backgroundColor: "#fef3c7",
    border: "1px solid #f59e0b",
    borderRadius: "8px",
    color: "#92400e",
    fontSize: "14px",
    fontFamily: cssVar("fontFamily"),
  };

  const heightInfoStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "8px",
    left: "8px",
    padding: "4px 8px",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    fontSize: "11px",
    borderRadius: "4px",
    fontFamily: "monospace",
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className="c2p-preview-panel"
    >
      {isHeightExceeded && (
        <div style={warningStyle} className="c2p-preview-warning">
          <WarningIcon />
          <span>
            Content height ({Math.round(estimatedHeight)}px) exceeds recommended
            maximum ({maxHeightWarningPx}px). Consider using auto-pagination or
            adding page breaks.
          </span>
        </div>
      )}

      <div style={zoomWrapperStyle} className="c2p-preview-zoom-wrapper">
        <CanvasContainer
          ref={canvasRef}
          theme={theme}
          decoration={decoration}
          widthPx={canvasWidthPx}
          macosBarTitle={title}
        >
          <ConversationView
            messages={messages}
            theme={theme}
            selection={selection}
            showAvatars={true}
            showPageBreaks={showPageBreaks}
          />

          {totalPages > 1 && (
            <PageIndicator
              currentPage={currentPage}
              totalPages={totalPages}
              position="bottom-right"
            />
          )}
        </CanvasContainer>
      </div>

      {showHeightEstimate && (
        <div style={heightInfoStyle} className="c2p-preview-height-info">
          {Math.round(estimatedHeight)}px × {canvasWidthPx}px
          {zoom !== 1 && ` (${Math.round(zoom * 100)}%)`}
        </div>
      )}
    </div>
  );
});

function WarningIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
