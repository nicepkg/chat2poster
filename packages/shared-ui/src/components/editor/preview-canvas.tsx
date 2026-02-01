"use client";

import type { MessageRole, ShadowLevel } from "@chat2poster/core-schema";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import * as React from "react";
import { forwardRef } from "react";
import { MacOSBar } from "./mac-os-bar";
import { MessageBubble } from "./message-bubble";
import { useI18n } from "~/i18n";
import { getShadowStyle } from "~/themes";
import { cn } from "~/utils/common";

export interface PreviewMessage {
  id: string;
  role: MessageRole;
  content: React.ReactNode;
}

export interface PreviewCanvasProps {
  messages: PreviewMessage[];
  width: number;
  padding: number;
  borderRadius: number;
  background: string;
  shadow: ShadowLevel;
  showMacOSBar?: boolean;
  className?: string;
}

export const PreviewCanvas = forwardRef<HTMLDivElement, PreviewCanvasProps>(
  (
    {
      messages,
      width,
      padding,
      borderRadius,
      background,
      shadow,
      showMacOSBar = true,
      className,
    },
    ref,
  ) => {
    const { t } = useI18n();
    const isDarkBackground =
      background.startsWith("linear") ||
      background === "#1e1e2e" ||
      background === "#18181b" ||
      background === "#09090b";

    return (
      <motion.div
        ref={ref}
        layout
        className={cn("c2p-canvas mx-auto", className)}
        style={{
          maxWidth: width,
          borderRadius,
          padding,
          background,
        }}
      >
        {/* Paper - the actual content card */}
        <div
          className={cn(
            "c2p-paper overflow-hidden",
            isDarkBackground ? "bg-zinc-900" : "bg-white",
          )}
          style={{
            borderRadius: Math.max(0, borderRadius - 4),
            boxShadow: getShadowStyle(shadow),
          }}
        >
          {/* macOS Bar */}
          <AnimatePresence>
            {showMacOSBar && (
              <div
                className={cn(
                  "c2p-paper-bar px-4 pt-4",
                  isDarkBackground ? "bg-zinc-900" : "bg-white",
                )}
              >
                <MacOSBar />
              </div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="c2p-paper-content space-y-4 p-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  isDarkBackground={isDarkBackground}
                >
                  {msg.content}
                </MessageBubble>
              ))}
            </AnimatePresence>

            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="c2p-paper-empty flex flex-col items-center justify-center py-12 text-center"
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
    );
  },
);

PreviewCanvas.displayName = "PreviewCanvas";
