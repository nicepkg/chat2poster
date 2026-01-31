"use client";

import * as React from "react";
import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { cn } from "~/utils/common";
import { MacOSBar } from "./MacOSBar";
import { MessageBubble } from "./MessageBubble";

export interface PreviewMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: React.ReactNode;
}

export interface PreviewCanvasProps {
  messages: PreviewMessage[];
  width: number;
  padding: number;
  borderRadius: number;
  background: string;
  shadow: "none" | "sm" | "md" | "lg" | "xl";
  showMacOSBar?: boolean;
  className?: string;
}

const shadowStyles = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

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
          boxShadow: shadowStyles[shadow],
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
                Select messages to preview
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  },
);

PreviewCanvas.displayName = "PreviewCanvas";
