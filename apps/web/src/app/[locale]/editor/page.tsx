"use client";

import {
  exportToPng,
  downloadImage,
  packageAsZip,
  downloadZip,
  generateZipFilename,
} from "@chat2poster/core-export";
import type { MessageRole } from "@chat2poster/core-schema";
import {
  EditorProvider,
  EditorWorkspace,
  useEditor,
  useI18n,
  generateUUID,
  STORAGE_KEYS,
} from "@chat2poster/shared-ui";
import "@chat2poster/shared-ui/styles/renderer.css";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useCallback } from "react";

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

  // Export handler
  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;

    const pageBreaks = editor.selection?.pageBreaks ?? [];
    const totalPages = pageBreaks.length + 1;
    const scale = editor.exportParams.scale ?? 2;
    const conversationId = editor.conversation?.id ?? "export";

    if (totalPages === 1) {
      // Single page export
      const result = await exportToPng(canvasRef.current, { scale });
      downloadImage(result.blob, `chat2poster-${conversationId}.png`);
    } else {
      // Multi-page export: iterate through pages
      const originalPage = editor.currentPage;
      const pageResults: Awaited<ReturnType<typeof exportToPng>>[] = [];

      for (let i = 0; i < totalPages; i++) {
        // Set current page and wait for React to re-render
        dispatch({ type: "SET_CURRENT_PAGE", payload: i });
        // Wait for DOM update
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Export current page
        if (canvasRef.current) {
          const result = await exportToPng(canvasRef.current, { scale });
          pageResults.push(result);
        }
      }

      // Restore original page
      dispatch({ type: "SET_CURRENT_PAGE", payload: originalPage });

      // Package as ZIP
      const multiPageResult = {
        pages: pageResults,
        totalPages: pageResults.length,
        cancelled: false,
        completedAt: new Date().toISOString(),
      };

      const zipResult = await packageAsZip(multiPageResult, {
        baseFilename: "page",
        includeMetadata: true,
      });

      downloadZip(
        zipResult,
        generateZipFilename(`chat2poster-${conversationId}`),
      );
    }
  }, [
    canvasRef,
    editor.selection?.pageBreaks,
    editor.exportParams.scale,
    editor.conversation?.id,
    editor.currentPage,
    dispatch,
  ]);

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
      onExport={handleExport}
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
