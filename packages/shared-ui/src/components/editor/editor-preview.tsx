"use client";

import * as React from "react";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, User, Bot } from "lucide-react";
import { cn } from "~/utils/common";
import { useEditor } from "~/contexts/editor-context";
import { useI18n } from "~/i18n";
import { SHADOW_STYLES } from "~/themes/shadows";
import { MarkdownRenderer } from "../renderer";
import { Card, CardContent } from "../ui/card";
import { MacOSBar } from "./mac-os-bar";

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
    SHADOW_STYLES[decoration.shadowLevel as keyof typeof SHADOW_STYLES] ??
    SHADOW_STYLES.none;

  // Checkerboard pattern classes
  const checkerboardClasses = showCheckerboard
    ? cn(
        "bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)]",
        "bg-[length:20px_20px]",
        "bg-[position:0_0,0_10px,10px_-10px,-10px_0px]",
        "dark:bg-[linear-gradient(45deg,#1a1a1a_25%,transparent_25%),linear-gradient(-45deg,#1a1a1a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1a1a1a_75%),linear-gradient(-45deg,transparent_75%,#1a1a1a_75%)]"
      )
    : "";

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

        {/* Preview Area */}
        <div
          className={cn("flex-1 overflow-auto p-8", checkerboardClasses)}
        >
          <motion.div
            ref={canvasRef as React.RefObject<HTMLDivElement>}
            layout
            className="mx-auto"
            style={{
              maxWidth: exportParams.canvasWidthPx,
              borderRadius: decoration.canvasRadiusPx,
              padding: decoration.canvasPaddingPx,
              background: decoration.backgroundValue,
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
                  className="mb-4"
                >
                  <MacOSBar />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="space-y-4">
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
                          : "bg-muted/50 text-foreground"
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
                        : "text-muted-foreground/30"
                    )}
                  />
                  <p
                    className={cn(
                      "text-sm",
                      isDarkBackground
                        ? "text-white/60"
                        : "text-muted-foreground"
                    )}
                  >
                    {t("preview.empty")}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
