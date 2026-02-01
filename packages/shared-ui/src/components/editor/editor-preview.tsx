"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, User, Bot } from "lucide-react";
import { useRef } from "react";
import * as React from "react";
import { MarkdownRenderer } from "../renderer";
import { Card, CardContent } from "../ui/card";
import { MacOSBar } from "./mac-os-bar";
import { useEditor } from "~/contexts/editor-context";
import { useI18n } from "~/i18n";
import { SHADOW_STYLES } from "~/themes/shadows";
import { cn } from "~/utils/common";

export interface EditorPreviewProps {
  /** Additional CSS classes for the container */
  className?: string;
  /** Ref to the preview canvas element for export */
  canvasRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * EditorPreview component that renders the poster preview.
 *
 * Layer structure (like CleanShot X):
 * - c2p-desktop: Desktop/canvas surface with gradient background
 * - c2p-window: App window with rounded corners and shadow
 * - c2p-window-bar: macOS traffic lights (auto light/dark based on content)
 * - c2p-window-content: Message content area with theme colors
 */
export function EditorPreview({
  className,
  canvasRef: externalCanvasRef,
}: EditorPreviewProps) {
  const { t } = useI18n();
  const internalCanvasRef = useRef<HTMLDivElement>(null);
  const canvasRef = externalCanvasRef ?? internalCanvasRef;
  const { editor } = useEditor();

  const messages = editor.conversation?.messages ?? [];
  const selectedIds = editor.selection?.selectedMessageIds ?? [];
  const selectedMessages = messages.filter((m) => selectedIds.includes(m.id));

  const { decoration, exportParams, selectedTheme } = editor;

  // Window theme is determined by content theme (selectedTheme.mode)
  // This affects c2p-window and c2p-window-bar background
  const isWindowDark = selectedTheme.mode === "dark";

  // Content colors from selected theme
  const contentBg = selectedTheme.tokens.colors.background;
  const contentFg = selectedTheme.tokens.colors.foreground;
  const userBubbleBg = selectedTheme.tokens.colors.userBubble;
  const userBubbleFg = selectedTheme.tokens.colors.userBubbleForeground;
  const assistantBubbleBg = selectedTheme.tokens.colors.assistantBubble;
  const assistantBubbleFg = selectedTheme.tokens.colors.assistantBubbleForeground;

  // Get shadow style for window
  const shadowStyle =
    SHADOW_STYLES[decoration.shadowLevel] ?? SHADOW_STYLES.none;

  return (
    <Card className={cn("c2p-preview-container bg-card/50 h-full overflow-hidden", className)}>
      <CardContent className="flex h-full flex-col p-0">
        {/* Preview Header */}
        <div className="c2p-preview-header border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              {t("preview.title")}
            </span>
            <span className="text-muted-foreground text-xs">
              {exportParams.canvasWidthPx}px × auto
            </span>
          </div>
        </div>

        {/* c2p-desktop: Desktop/Canvas surface - gradient background + margin */}
        <motion.div
          ref={canvasRef as React.RefObject<HTMLDivElement>}
          layout
          className="c2p-desktop flex-1 overflow-auto"
          style={{
            background: decoration.backgroundValue,
            padding: decoration.canvasPaddingPx,
          }}
        >
          {/* c2p-window: App window - rounded corners + shadow + auto light/dark bg */}
          <div
            className={cn(
              "c2p-window mx-auto overflow-hidden",
              isWindowDark ? "bg-zinc-900" : "bg-white"
            )}
            style={{
              maxWidth: exportParams.canvasWidthPx,
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
                    isWindowDark ? "bg-zinc-900" : "bg-white"
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
              <AnimatePresence>
                {selectedMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="c2p-message rounded-xl p-4"
                    style={{
                      backgroundColor:
                        message.role === "user" ? userBubbleBg : assistantBubbleBg,
                      color:
                        message.role === "user" ? userBubbleFg : assistantBubbleFg,
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
              </AnimatePresence>

              {/* Empty State */}
              {selectedMessages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="c2p-empty-state flex flex-col items-center justify-center py-12 text-center"
                >
                  <MessageSquare
                    className="mb-4 h-12 w-12 opacity-30"
                  />
                  <p className="text-sm opacity-60">
                    {t("preview.empty")}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
