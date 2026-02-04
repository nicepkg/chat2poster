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
  ArrowUpDown,
  ArrowLeftRight,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import * as React from "react";
import { MarkdownRenderer } from "../renderer";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Slider } from "../ui/slider";
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

const PREVIEW_PADDING_PX = 0;
const PREVIEW_FIT_EPSILON_PX = 2;
const PREVIEW_ZOOM_MIN = 0.3;
const PREVIEW_ZOOM_MAX = 3;

type PreviewZoomMode = "fit-height" | "fit-width" | "custom";

function clampZoom(value: number) {
  return Math.min(Math.max(value, PREVIEW_ZOOM_MIN), PREVIEW_ZOOM_MAX);
}

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
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const { editor, runtime, dispatch } = useEditor();

  // Export button state
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [zoomMode, setZoomMode] = useState<PreviewZoomMode>("fit-height");
  const [customZoom, setCustomZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

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

  const { decoration, exportParams, selectedTheme, currentPage } = editor;

  // Pre-build Set for O(1) lookups
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const pageBreakAfterIdSet = useMemo(
    () => new Set(pageBreaks.map((pb) => pb.afterMessageId)),
    [pageBreaks],
  );

  // Filter selected messages with O(n) instead of O(n*m)
  const selectedMessages = useMemo(
    () => messages.filter((m) => selectedIdSet.has(m.id)),
    [messages, selectedIdSet],
  );

  // Calculate desktop width from device type
  const desktopWidth = DEVICE_WIDTHS[exportParams.deviceType];

  // Split messages into pages based on page breaks
  const pages = useMemo(() => {
    if (pageBreakAfterIdSet.size === 0) {
      return [selectedMessages];
    }

    const result: (typeof selectedMessages)[] = [];
    let currentPageMessages: typeof selectedMessages = [];

    for (const message of selectedMessages) {
      currentPageMessages.push(message);

      // O(1) lookup instead of O(p)
      if (pageBreakAfterIdSet.has(message.id)) {
        result.push(currentPageMessages);
        currentPageMessages = [];
      }
    }

    if (currentPageMessages.length > 0) {
      result.push(currentPageMessages);
    }

    return result;
  }, [selectedMessages, pageBreakAfterIdSet]);

  const totalPages = pages.length;
  const currentPageMessages = pages[currentPage] ?? [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      setCanvasSize({
        width: canvas.offsetWidth,
        height: canvas.offsetHeight,
      });
    };

    updateCanvasSize();
    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [canvasRef]);

  useEffect(() => {
    const viewport = previewViewportRef.current;
    if (!viewport) return;

    const updateViewportSize = () => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };

    updateViewportSize();
    const observer = new ResizeObserver(updateViewportSize);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      dispatch({ type: "SET_CURRENT_PAGE", payload: totalPages - 1 });
    }
  }, [totalPages, currentPage, dispatch]);

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
  const shouldAnimatePreview = !runtime.isExporting;

  const previewScale = useMemo(() => {
    if (
      canvasSize.width <= 0 ||
      canvasSize.height <= 0 ||
      viewportSize.width <= 0 ||
      viewportSize.height <= 0
    ) {
      return 1;
    }

    const availableWidth = Math.max(
      viewportSize.width - PREVIEW_PADDING_PX * 2 - PREVIEW_FIT_EPSILON_PX,
      1,
    );
    const availableHeight = Math.max(
      viewportSize.height - PREVIEW_PADDING_PX * 2 - PREVIEW_FIT_EPSILON_PX,
      1,
    );
    const fitHeightScale = availableHeight / canvasSize.height;
    const fitWidthScale = availableWidth / canvasSize.width;

    if (zoomMode === "fit-width") return clampZoom(fitWidthScale);
    if (zoomMode === "fit-height") return clampZoom(fitHeightScale);

    return clampZoom(customZoom);
  }, [canvasSize, viewportSize, zoomMode, customZoom]);

  const displayZoomPercent = Math.round(previewScale * 100);
  const scaledCanvasWidth =
    (canvasSize.width > 0 ? canvasSize.width : desktopWidth) * previewScale;
  const scaledCanvasHeight =
    canvasSize.height > 0 ? canvasSize.height * previewScale : undefined;

  const handleZoomModeChange = useCallback(
    (mode: PreviewZoomMode) => {
      if (mode === "custom" && zoomMode !== "custom") {
        setCustomZoom(previewScale);
      }
      setZoomMode(mode);
    },
    [zoomMode, previewScale],
  );

  const handleCustomZoomChange = useCallback((value: number[]) => {
    const next = value[0];
    if (typeof next !== "number") return;
    setZoomMode("custom");
    setCustomZoom(clampZoom(next / 100));
  }, []);

  const nudgeZoom = useCallback((delta: number) => {
    setZoomMode("custom");
    setCustomZoom((prev) => clampZoom(prev + delta));
  }, []);

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
                    dispatch({
                      type: "SET_EXPORT_PARAMS",
                      payload: { deviceType: device },
                    })
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
                onClick={() =>
                  dispatch({
                    type: "SET_CURRENT_PAGE",
                    payload: currentPage - 1,
                  })
                }
                disabled={currentPage === 0}
                className="c2p-page-prev h-7 w-7"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="c2p-page-dots flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      dispatch({ type: "SET_CURRENT_PAGE", payload: index })
                    }
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
                onClick={() =>
                  dispatch({
                    type: "SET_CURRENT_PAGE",
                    payload: currentPage + 1,
                  })
                }
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
        <div className="relative min-h-0 flex-1">
          <div
            ref={previewViewportRef}
            className="c2p-preview-scroll h-full overflow-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNoZWNrZXIiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjY2hlY2tlcikiLz48L3N2Zz4=')]"
          >
            <div className="c2p-preview-stage flex min-h-full items-start justify-center">
              <div
                className="c2p-preview-transform shrink-0 overflow-hidden transition-[width,height] duration-200 ease-out"
                style={{
                  width: scaledCanvasWidth,
                  height: scaledCanvasHeight,
                }}
              >
                <div
                  style={{
                    width: desktopWidth,
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top left",
                  }}
                  className="transition-transform duration-200 ease-out"
                >
                  {/* Desktop Canvas */}
                  <motion.div
                    ref={canvasRef as React.RefObject<HTMLDivElement>}
                    layout
                    className="c2p-desktop mx-auto"
                    style={{
                      width: desktopWidth,
                      background: decoration.backgroundValue,
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover",
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
                          fontFamily: selectedTheme.tokens.fontFamily,
                          display: "flex",
                          flexDirection: "column",
                          gap: messageGap,
                        }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentPage}
                            initial={
                              shouldAnimatePreview
                                ? { opacity: 0, x: 20 }
                                : false
                            }
                            animate={{ opacity: 1, x: 0 }}
                            exit={
                              shouldAnimatePreview
                                ? { opacity: 0, x: -20 }
                                : { opacity: 1, x: 0 }
                            }
                            transition={{
                              duration: shouldAnimatePreview ? 0.2 : 0,
                            }}
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
                                  initial={
                                    shouldAnimatePreview
                                      ? { opacity: 0, y: 10 }
                                      : false
                                  }
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={
                                    shouldAnimatePreview
                                      ? { delay: index * 0.03 }
                                      : { duration: 0 }
                                  }
                                  className={cn(
                                    "c2p-message flex",
                                    isUser
                                      ? "c2p-message-user justify-end"
                                      : "c2p-message-assistant justify-start",
                                  )}
                                >
                                  {/* Message Bubble */}
                                  <div
                                    className={cn(
                                      "c2p-message-wrapper min-w-0",
                                      isUser ? "text-right" : "text-left",
                                    )}
                                  >
                                    {/* Role Label with Avatar */}
                                    <div
                                      className={cn(
                                        "c2p-message-role mb-1.5 flex items-center gap-1.5 text-xs font-medium mb-2",
                                        isUser
                                          ? "flex-row-reverse justify-start"
                                          : "flex-row justify-start",
                                      )}
                                      style={{ color: mutedFg }}
                                    >
                                      {/* Avatar - inline with role label */}
                                      <div
                                        className="c2p-message-avatar flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                                        style={{
                                          backgroundColor: bubbleBg,
                                          color: mutedFg,
                                        }}
                                      >
                                        {isUser ? (
                                          <User className="h-3 w-3" />
                                        ) : (
                                          <Sparkles className="h-3 w-3" />
                                        )}
                                      </div>
                                      <span>
                                        {isUser
                                          ? t("role.user")
                                          : message.role === "assistant"
                                            ? t("role.assistant")
                                            : t("role.system")}
                                      </span>
                                    </div>

                                    {/* Bubble - same style for both */}
                                    <div
                                      className="c2p-message-bubble inline-block max-w-full overflow-hidden align-top"
                                      style={
                                        {
                                          backgroundColor: bubbleBg,
                                          color: bubbleFg,
                                          width: "fit-content",
                                          maxWidth: "100%",
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
                                          isWindowDark && "c2p-markdown-dark",
                                        )}
                                        style={{
                                          lineHeight:
                                            selectedTheme.tokens.lineHeight,
                                          fontSize:
                                            selectedTheme.tokens.baseFontSize,
                                          textAlign: "left",
                                          color: bubbleFg,
                                          maxWidth: "100%",
                                          overflowWrap: "anywhere",
                                        }}
                                      >
                                        <MarkdownRenderer
                                          content={
                                            message.contentMarkdown?.trim() ||
                                            ""
                                          }
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
                            <p className="text-sm opacity-60">
                              {t("preview.empty")}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex flex-col items-end gap-2">
            <div className="pointer-events-auto flex items-center gap-1 rounded-xl border bg-card/85 p-1 shadow-sm backdrop-blur">
              <Button
                variant={zoomMode === "fit-height" ? "default" : "ghost"}
                size="icon-sm"
                className="h-7 w-7"
                onClick={() => handleZoomModeChange("fit-height")}
                title={t("preview.zoom.fitHeight")}
                aria-label={t("preview.zoom.fitHeight")}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={zoomMode === "fit-width" ? "default" : "ghost"}
                size="icon-sm"
                className="h-7 w-7"
                onClick={() => handleZoomModeChange("fit-width")}
                title={t("preview.zoom.fitWidth")}
                aria-label={t("preview.zoom.fitWidth")}
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={zoomMode === "custom" ? "default" : "ghost"}
                size="icon-sm"
                className="h-7 w-7"
                onClick={() => handleZoomModeChange("custom")}
                title={t("preview.zoom.custom")}
                aria-label={t("preview.zoom.custom")}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </Button>
              <span className="text-muted-foreground min-w-12 rounded-md px-1.5 text-center text-[11px] font-medium tabular-nums">
                {displayZoomPercent}%
              </span>
            </div>

            {zoomMode === "custom" && (
              <div className="pointer-events-auto flex w-56 items-center gap-2 rounded-xl border bg-card/90 px-3 py-2 shadow-sm backdrop-blur">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 shrink-0"
                  onClick={() => nudgeZoom(-0.05)}
                  title={t("preview.zoom.decrease")}
                  aria-label={t("preview.zoom.decrease")}
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Slider
                  value={[Math.round(customZoom * 100)]}
                  min={Math.round(PREVIEW_ZOOM_MIN * 100)}
                  max={Math.round(PREVIEW_ZOOM_MAX * 100)}
                  step={1}
                  onValueChange={handleCustomZoomChange}
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 shrink-0"
                  onClick={() => nudgeZoom(0.05)}
                  title={t("preview.zoom.increase")}
                  aria-label={t("preview.zoom.increase")}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
