"use client";

import type { DeviceType } from "@chat2poster/core-schema";
import { DEVICE_WIDTHS } from "@chat2poster/core-schema";
import { useEditor } from "@ui/contexts/editor-context";
import { useI18n } from "@ui/i18n";
import { SHADOW_STYLES } from "@ui/themes/shadows";
import { cn } from "@ui/utils/common";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  User,
  Sparkles,
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
 * EditorPreview component - Chat-style message layout
 *
 * User messages: Right-aligned with accent color
 * Assistant messages: Left-aligned with neutral color
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

      const hasBreakAfter = pageBreaks.some(
        (pb) => pb.afterMessageId === message.id,
      );
      if (hasBreakAfter) {
        result.push(currentPageMessages);
        currentPageMessages = [];
      }
    }

    if (currentPageMessages.length > 0) {
      result.push(currentPageMessages);
    }

    return result;
  }, [selectedMessages, pageBreaks]);

  const totalPages = pages.length;
  const currentPageMessages = pages[currentPage] ?? [];

  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      actions.setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage, actions]);

  // Theme colors - use same colors for user and assistant (unified look)
  const isWindowDark = selectedTheme.mode === "dark";
  const contentBg = selectedTheme.tokens.colors.background;
  const contentFg = selectedTheme.tokens.colors.foreground;
  const bubbleBg = selectedTheme.tokens.colors.userBubble; // Same for both
  const bubbleFg = selectedTheme.tokens.colors.userBubbleForeground; // Same for both
  const mutedFg = selectedTheme.tokens.colors.mutedForeground;
  const codeBlockBg = selectedTheme.tokens.colors.codeBlockBackground;
  const codeBlockFg = selectedTheme.tokens.colors.codeBlockForeground;
  const borderColor = selectedTheme.tokens.colors.border;

  // Theme tokens
  const bubbleRadius = selectedTheme.tokens.bubbleRadius;
  const messagePadding = selectedTheme.tokens.messagePadding;
  const messageGap = selectedTheme.tokens.messageGap;

  // Shadow
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
        {/* Preview Header */}
        <div className="c2p-preview-header flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
          {/* Left: Device selector */}
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
                    isSelected && "c2p-device-selected shadow-sm",
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

          {/* Center: Page navigation */}
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

        {/* Preview Area */}
        <div className="c2p-preview-scroll relative min-h-0 flex-1 overflow-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNoZWNrZXIiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjY2hlY2tlcikiLz48L3N2Zz4=')] p-4">
          {/* Desktop Canvas */}
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
            {/* Window */}
            <div
              className="c2p-window w-full overflow-hidden"
              style={{
                backgroundColor: contentBg,
                borderRadius: decoration.canvasRadiusPx,
                boxShadow: shadowStyle,
              }}
            >
              {/* macOS Bar */}
              <AnimatePresence>
                {decoration.macosBarEnabled && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="c2p-window-bar px-4 pt-4"
                    style={{ backgroundColor: contentBg }}
                  >
                    <MacOSBar />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div
                className="c2p-window-content p-5"
                style={{
                  backgroundColor: contentBg,
                  color: contentFg,
                  display: "flex",
                  flexDirection: "column",
                  gap: messageGap,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: messageGap,
                    }}
                  >
                    {currentPageMessages.map((message, index) => {
                      const isUser = message.role === "user";

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            "c2p-message flex gap-3",
                            isUser
                              ? "c2p-message-user flex-row-reverse"
                              : "c2p-message-assistant flex-row",
                          )}
                        >
                          {/* Avatar - same style for both */}
                          <div
                            className="c2p-message-avatar flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: bubbleBg,
                              color: mutedFg,
                            }}
                          >
                            {isUser ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div
                            className={cn(
                              "c2p-message-wrapper max-w-[80%]",
                              isUser ? "text-right" : "text-left",
                            )}
                          >
                            {/* Role Label */}
                            <div
                              className={cn(
                                "c2p-message-role mb-1.5 text-xs font-medium",
                                isUser ? "pr-1" : "pl-1",
                              )}
                              style={{ color: mutedFg }}
                            >
                              {isUser
                                ? t("role.user")
                                : message.role === "assistant"
                                  ? t("role.assistant")
                                  : t("role.system")}
                            </div>

                            {/* Bubble - same style for both */}
                            <div
                              className="c2p-message-bubble"
                              style={
                                {
                                  backgroundColor: bubbleBg,
                                  color: bubbleFg,
                                  borderRadius: bubbleRadius,
                                  padding: messagePadding,
                                  // Chat bubble tail effect via border-radius
                                  borderTopLeftRadius: isUser
                                    ? bubbleRadius
                                    : bubbleRadius / 3,
                                  borderTopRightRadius: isUser
                                    ? bubbleRadius / 3
                                    : bubbleRadius,
                                  // CSS variables for code blocks
                                  "--c2p-code-bg": codeBlockBg,
                                  "--c2p-code-fg": codeBlockFg,
                                  "--c2p-border": borderColor,
                                  "--c2p-muted-fg": mutedFg,
                                } as React.CSSProperties
                              }
                            >
                              <div
                                className={cn(
                                  "c2p-message-body",
                                  isWindowDark && "c2p-dark",
                                )}
                                style={{
                                  lineHeight: selectedTheme.tokens.lineHeight,
                                  fontSize: selectedTheme.tokens.baseFontSize,
                                  textAlign: "left",
                                  color: bubbleFg,
                                }}
                              >
                                <MarkdownRenderer
                                  content={message.contentMarkdown}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
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
