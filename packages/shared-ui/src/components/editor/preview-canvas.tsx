"use client";

import * as React from "react";
import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import type { MessageRole, ShadowLevel } from "@chat2poster/core-schema";
import { cn } from "~/utils/common";
import { useI18n } from "~/i18n";
import { getShadowStyle } from "~/themes";
import { MacOSBar } from "./mac-os-bar";
import { MessageBubble } from "./message-bubble";

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
        className={cn("mx-auto", className)}
        style={{
          maxWidth: width,
          borderRadius,
          padding,
          background,
          boxShadow: getShadowStyle(shadow),
        }}
      >
        {/* macOS Bar */}
        <AnimatePresence>
          {showMacOSBar && <MacOSBar className="mb-4" />}
        </AnimatePresence>

        {/* Messages */}
        <div className="space-y-4">
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
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <MessageSquare className="text-muted-foreground/30 mb-4 h-12 w-12" />
              <p className="text-muted-foreground text-sm">
                {t("preview.empty")}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  },
);

PreviewCanvas.displayName = "PreviewCanvas";
