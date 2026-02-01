"use client";

import type { DeviceType } from "@chat2poster/core-schema";
import { DEVICE_WIDTHS } from "@chat2poster/core-schema";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  User,
  Bot,
  Smartphone,
  Tablet,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Check,
} from "lucide-react";
import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import * as React from "react";
import { MarkdownRenderer } from "../renderer";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { MacOSBar } from "./mac-os-bar";
import { useEditor } from "~/contexts/editor-context";
import { useI18n } from "~/i18n";
import { SHADOW_STYLES } from "~/themes/shadows";
import { cn } from "~/utils/common";

/** Device icons */
const DEVICE_ICONS: Record<
  DeviceType,
  React.ComponentType<{ className?: string }>
> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

export interface EditorPreviewProps {
  /** Additional CSS classes for the container */
  className?: string;
  /** Ref to the preview canvas element for export */
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  /** Export handler - called when export button is clicked */
  onExport?: () => Promise<void>;
  /** Whether export is disabled */
  exportDisabled?: boolean;
}

/**
 * EditorPreview component that renders the poster preview.
 *
 * Layer structure (like CleanShot X):
 * - c2p-desktop: Desktop/canvas surface with gradient background (width = deviceType)
 * - c2p-window: App window (width = desktop - margin*2)
 * - c2p-window-bar: macOS traffic lights (auto light/dark based on content)
 * - c2p-window-content: Message content area with theme colors
 *
 * Desktop width is determined by deviceType:
 * - mobile: 390px
 * - tablet: 768px
 * - desktop: 1200px
 *
 * Window width = Desktop width - (canvasPaddingPx × 2)
 */
export function EditorPreview({
  className,
  canvasRef: externalCanvasRef,
  onExport,
  exportDisabled = false,
}: EditorPreviewProps) {
  const { t } = useI18n();
  const internalCanvasRef = useRef<HTMLDivElement>(null);
  const canvasRef = externalCanvasRef ?? internalCanvasRef;
  const { editor, actions } = useEditor();

  // Export button state
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = useCallback(async () => {
    if (isExporting || exportDisabled || !onExport) return;

    setIsExporting(true);
    try {
      await onExport();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, exportDisabled, onExport]);

  const messages = editor.conversation?.messages ?? [];
  const selectedIds = editor.selection?.selectedMessageIds ?? [];
  const pageBreaks = editor.selection?.pageBreaks ?? [];
  const selectedMessages = messages.filter((m) => selectedIds.includes(m.id));

  const { decoration, exportParams, selectedTheme, currentPage } = editor;

  // Calculate desktop width from device type
  const desktopWidth = DEVICE_WIDTHS[exportParams.deviceType];

  // Split messages into pages based on page breaks
  const pages = useMemo(() => {
    if (pageBreaks.length === 0) {
      return [selectedMessages];
    }

    const result: (typeof selectedMessages)[] = [];
    let currentPageMessages: typeof selectedMessages = [];

    for (const message of selectedMessages) {
      currentPageMessages.push(message);

      // Check if there's a page break after this message
      const hasBreakAfter = pageBreaks.some(
        (pb) => pb.afterMessageId === message.id,
      );
      if (hasBreakAfter) {
        result.push(currentPageMessages);
        currentPageMessages = [];
      }
    }

    // Add remaining messages as last page
    if (currentPageMessages.length > 0) {
      result.push(currentPageMessages);
    }

    return result;
  }, [selectedMessages, pageBreaks]);

  const totalPages = pages.length;
  const currentPageMessages = pages[currentPage] ?? [];

  // Ensure currentPage is within bounds
  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      actions.setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage, actions]);

  // Window theme is determined by content theme (selectedTheme.mode)
  const isWindowDark = selectedTheme.mode === "dark";

  // Content colors from selected theme
  const contentBg = selectedTheme.tokens.colors.background;
  const contentFg = selectedTheme.tokens.colors.foreground;
  const userBubbleBg = selectedTheme.tokens.colors.userBubble;
  const userBubbleFg = selectedTheme.tokens.colors.userBubbleForeground;
  const assistantBubbleBg = selectedTheme.tokens.colors.assistantBubble;
  const assistantBubbleFg =
    selectedTheme.tokens.colors.assistantBubbleForeground;

  // Get shadow style for window
  const shadowStyle =
    SHADOW_STYLES[decoration.shadowLevel] ?? SHADOW_STYLES.none;

  return (
    <Card
      className={cn(
        "c2p-preview-container bg-card/50 h-full overflow-hidden py-0",
        className,
      )}
    >
      <CardContent className="flex h-full flex-col p-0">
        {/* Preview Header with controls */}
        <div className="c2p-preview-header flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
          {/* Left: Device type selector */}
          <div className="c2p-device-selector flex items-center gap-1">
            {(["mobile", "tablet", "desktop"] as const).map((device) => {
              const Icon = DEVICE_ICONS[device];
              const isSelected = exportParams.deviceType === device;
              return (
                <Button
                  key={device}
                  variant={isSelected ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={() =>
                    actions.setExportParams({ deviceType: device })
                  }
                  className={cn(
                    "c2p-device-btn h-8 w-8",
                    isSelected && "c2p-device-selected",
                  )}
                  title={`${DEVICE_WIDTHS[device]}px`}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
            <span className="text-muted-foreground ml-1 text-xs tabular-nums">
              {desktopWidth}px
            </span>
          </div>

          {/* Center: Page navigation (only when multiple pages) */}
          {totalPages > 1 && (
            <div className="c2p-page-nav flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => actions.setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="c2p-page-prev h-7 w-7"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="c2p-page-dots flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => actions.setCurrentPage(index)}
                    className={cn(
                      "c2p-page-dot h-1.5 rounded-full transition-all",
                      index === currentPage
                        ? "bg-primary w-4"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-1.5",
                    )}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => actions.setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="c2p-page-next h-7 w-7"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-muted-foreground ml-1 text-xs">
                {currentPage + 1}/{totalPages}
              </span>
            </div>
          )}

          {/* Right: Export button */}
          {onExport && (
            <Button
              onClick={handleExport}
              disabled={exportDisabled || isExporting}
              size="sm"
              className={cn(
                "c2p-export-btn h-8 gap-1.5 px-3 text-xs",
                exportSuccess && "c2p-export-btn-success",
              )}
            >
              <AnimatePresence mode="wait">
                {isExporting ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="hidden sm:inline">
                      {t("exportButton.exporting")}
                    </span>
                  </motion.span>
                ) : exportSuccess ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-green-500"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {t("exportButton.done")}
                    </span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {totalPages > 1
                        ? t("exportButton.exportPages", { count: totalPages })
                        : t("exportButton.exportPng")}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          )}
        </div>

        {/* Preview scroll area - fills space with desktop, overflow auto */}
        <div className="c2p-preview-scroll relative min-h-0 flex-1 overflow-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNoZWNrZXIiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjY2hlY2tlcikiLz48L3N2Zz4=')] p-4">
          {/* c2p-desktop: Desktop/Canvas surface - gradient background + margin */}
          <motion.div
            ref={canvasRef as React.RefObject<HTMLDivElement>}
            layout
            className="c2p-desktop mx-auto"
            style={{
              width: desktopWidth,
              background: decoration.backgroundValue,
              padding: decoration.canvasPaddingPx,
            }}
          >
            {/* c2p-window: App window - full width minus padding */}
            <div
              className={cn(
                "c2p-window w-full overflow-hidden",
                isWindowDark ? "bg-zinc-900" : "bg-white",
              )}
              style={{
                borderRadius: decoration.canvasRadiusPx,
                boxShadow: shadowStyle,
              }}
            >
              {/* c2p-window-bar: macOS traffic lights */}
              <AnimatePresence>
                {decoration.macosBarEnabled && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "c2p-window-bar px-4 pt-4",
                      isWindowDark ? "bg-zinc-900" : "bg-white",
                    )}
                  >
                    <MacOSBar />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* c2p-window-content: Message content area with theme colors */}
              <div
                className="c2p-window-content space-y-4 p-4"
                style={{ backgroundColor: contentBg, color: contentFg }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {currentPageMessages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="c2p-message rounded-xl p-4"
                        style={{
                          backgroundColor:
                            message.role === "user"
                              ? userBubbleBg
                              : assistantBubbleBg,
                          color:
                            message.role === "user"
                              ? userBubbleFg
                              : assistantBubbleFg,
                        }}
                      >
                        {/* Role indicator */}
                        <div className="c2p-message-header mb-2 flex items-center gap-2">
                          {message.role === "user" ? (
                            <User className="h-3.5 w-3.5 opacity-60" />
                          ) : (
                            <Bot className="h-3.5 w-3.5 opacity-60" />
                          )}
                          <span className="text-xs font-medium uppercase tracking-wide opacity-60">
                            {message.role === "user"
                              ? t("role.user")
                              : message.role === "assistant"
                                ? t("role.assistant")
                                : t("role.system")}
                          </span>
                        </div>

                        {/* Message content */}
                        <div className="c2p-message-body prose prose-sm max-w-none dark:prose-invert">
                          <MarkdownRenderer content={message.contentMarkdown} />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Empty State */}
                {selectedMessages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="c2p-empty-state flex flex-col items-center justify-center py-12 text-center"
                  >
                    <MessageSquare className="mb-4 h-12 w-12 opacity-30" />
                    <p className="text-sm opacity-60">{t("preview.empty")}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
