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
  /** Show checkerboard background pattern */
  showCheckerboard?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Ref to the preview canvas element for export */
  canvasRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * EditorPreview component that renders the poster preview.
 * Reads decoration and theme settings from EditorContext.
 */
export function EditorPreview({
  showCheckerboard = true,
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

  const { decoration, exportParams } = editor;

  // Determine if background is dark for text color
  const isDarkBackground =
    decoration.backgroundValue.includes("linear") ||
    decoration.backgroundValue === "#1e1e2e" ||
    decoration.backgroundValue === "#18181b" ||
    decoration.backgroundValue === "#09090b";

  // Get shadow style
  const shadowStyle =
    SHADOW_STYLES[decoration.shadowLevel] ?? SHADOW_STYLES.none;

  return (
    <Card className={cn("bg-card/50 h-full overflow-hidden", className)}>
      <CardContent className="flex h-full flex-col p-0">
        {/* Header */}
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              {t("preview.title")}
            </span>
            <span className="text-muted-foreground text-xs">
              {exportParams.canvasWidthPx}px × auto
            </span>
          </div>
        </div>

        {/* Paper - the actual content card  Desktop/Canvas surface with background*/}
        <motion.div
          ref={canvasRef as React.RefObject<HTMLDivElement>}
          layout
          className={cn(
            "overflow-scroll",
            isDarkBackground ? "bg-zinc-900" : "bg-white",
          )}
          style={{
            background: decoration.backgroundValue,
            padding: decoration.canvasPaddingPx,
          }}
        >
          <div
            className={cn(
              "mx-auto overflow-hidden",
              isDarkBackground ? "bg-zinc-900" : "bg-white",
            )}
            style={{
              maxWidth: exportParams.canvasWidthPx,
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
                  className={cn(
                    "px-4 pt-4",
                    isDarkBackground ? "bg-zinc-900" : "bg-white",
                  )}
                >
                  <MacOSBar />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="space-y-4 p-4">
              <AnimatePresence>
                {selectedMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "rounded-xl p-4",
                      isDarkBackground
                        ? message.role === "user"
                          ? "bg-white/10 text-white"
                          : "bg-white/5 text-white/90"
                        : message.role === "user"
                          ? "bg-primary/10 text-foreground"
                          : "bg-muted/50 text-foreground",
                    )}
                  >
                    {/* Role indicator */}
                    <div className="mb-2 flex items-center gap-2">
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

                    {/* Content */}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
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
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <MessageSquare
                    className={cn(
                      "mb-4 h-12 w-12",
                      isDarkBackground
                        ? "text-white/30"
                        : "text-muted-foreground/30",
                    )}
                  />
                  <p
                    className={cn(
                      "text-sm",
                      isDarkBackground
                        ? "text-white/60"
                        : "text-muted-foreground",
                    )}
                  >
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
