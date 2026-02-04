"use client";

import type { MessageRole } from "@chat2poster/core-schema";
import {
  EditorProvider,
  EditorWorkspace,
  useConversationExport,
  useEditor,
  useI18n,
  generateUUID,
  STORAGE_KEYS,
} from "@chat2poster/shared-ui";
import "@chat2poster/shared-ui/styles/renderer.css";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";

/** Message role for editor (excludes system messages) */
type EditorMessageRole = Exclude<MessageRole, "system">;

/**
 * Load conversation from sessionStorage
 * Supports both share link imports and manual builder
 */
function loadConversationFromStorage() {
  // Try share link conversation first
  const conversationData = sessionStorage.getItem(STORAGE_KEYS.CONVERSATION);
  if (conversationData) {
    try {
      return JSON.parse(conversationData) as {
        id: string;
        messages: Array<{
          id: string;
          role: EditorMessageRole;
          contentMarkdown: string;
          order: number;
        }>;
      };
    } catch {
      // Fall through
    }
  }

  // Try manual builder messages
  const manualData = sessionStorage.getItem(STORAGE_KEYS.MANUAL_MESSAGES);
  if (manualData) {
    try {
      const parsed = JSON.parse(manualData) as Array<{
        id: string;
        role: EditorMessageRole;
        content: string;
      }>;
      return {
        id: generateUUID(),
        messages: parsed.map((m, idx) => ({
          id: m.id,
          role: m.role,
          contentMarkdown: m.content,
          order: idx,
        })),
      };
    } catch {
      // Fall through
    }
  }

  return null;
}

/**
 * Inner editor content that uses EditorContext
 */
function EditorContent() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const { editor, dispatch } = useEditor();
  const { exportConversation } = useConversationExport({ canvasRef });

  // Load conversation on mount
  useEffect(() => {
    const conversation = loadConversationFromStorage();
    if (!conversation) {
      router.push(`/${locale}/import`);
      return;
    }

    // Determine source type from storage key
    const sourceType = sessionStorage.getItem(STORAGE_KEYS.CONVERSATION)
      ? "web-share-link"
      : "web-manual";

    // Set conversation in context
    dispatch({
      type: "SET_CONVERSATION",
      payload: {
        id: conversation.id,
        sourceType: sourceType,
        messages: conversation.messages,
      },
    });

    // Select all messages by default
    dispatch({
      type: "SET_SELECTION",
      payload: {
        conversationId: conversation.id,
        selectedMessageIds: conversation.messages.map((m) => m.id),
        pageBreaks: [],
      },
    });
  }, [router, dispatch, locale]);

  // Loading state
  if (!editor.conversation) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <span className="text-muted-foreground text-sm">
            {t("web.editor.loading")}
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <EditorWorkspace
      canvasRef={canvasRef}
      onExport={exportConversation}
      className="bg-muted/30"
      containerClassName="h-[calc(100vh-64px)] max-w-7xl"
      settingsTitle={t("web.editor.settings")}
    />
  );
}

/**
 * Editor page wrapped with EditorProvider
 */
export default function EditorPage() {
  return (
    <EditorProvider>
      <EditorContent />
    </EditorProvider>
  );
}
