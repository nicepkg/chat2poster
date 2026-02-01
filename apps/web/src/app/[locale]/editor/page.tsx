"use client";

import {
  Card,
  EditorProvider,
  EditorTabs,
  EditorHeader,
  EditorPreview,
  ExportButton,
  useEditor,
  useIsMobile,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Button,
  useI18n,
  generateUUID,
} from "@chat2poster/shared-ui";
import "@chat2poster/shared-ui/styles/renderer.css";
import { motion } from "framer-motion";
import { Loader2, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useCallback, useState } from "react";

/**
 * Load conversation from sessionStorage
 * Supports both share link imports and manual builder
 */
function loadConversationFromStorage() {
  // Try share link conversation first
  const conversationData = sessionStorage.getItem("chat2poster:conversation");
  if (conversationData) {
    try {
      return JSON.parse(conversationData) as {
        id: string;
        messages: Array<{
          id: string;
          role: "user" | "assistant";
          contentMarkdown: string;
          order: number;
        }>;
      };
    } catch {
      // Fall through
    }
  }

  // Try manual builder messages
  const manualData = sessionStorage.getItem("chat2poster:manual-messages");
  if (manualData) {
    try {
      const parsed = JSON.parse(manualData) as Array<{
        id: string;
        role: "user" | "assistant";
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
 * Mobile drawer for settings
 */
function MobileSettingsDrawer({ title }: { title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg lg:hidden"
        >
          <Settings2 className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto">
          <EditorTabs defaultTab="messages" />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * Inner editor content that uses EditorContext
 */
function EditorContent() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const { editor, dispatch } = useEditor();
  const isMobile = useIsMobile();

  // Load conversation on mount
  useEffect(() => {
    const conversation = loadConversationFromStorage();
    if (!conversation) {
      router.push(`/${locale}/import`);
      return;
    }

    // Determine source type from storage key
    const sourceType = sessionStorage.getItem("chat2poster:conversation")
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
    // TODO: Implement actual export with core-export
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }, []);

  // Calculate page count
  const pageCount = (editor.selection?.pageBreaks.length ?? 0) + 1;
  const selectedCount = editor.selection?.selectedMessageIds.length ?? 0;

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
    <main className="bg-muted/30 flex min-h-screen flex-col">
      <EditorHeader
        backHref={`/${locale}/import`}
        backLabel={t("web.editor.back")}
        exportSlot={
          <ExportButton
            pageCount={pageCount}
            disabled={selectedCount === 0}
            onExport={handleExport}
          />
        }
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 p-4 lg:p-6">
        {/* Left Panel - Settings (Desktop only) */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden w-80 shrink-0 lg:block"
          >
            <Card className="bg-card/80 sticky top-24 h-[calc(100vh-140px)] overflow-hidden backdrop-blur-sm">
              <EditorTabs defaultTab="messages" />
            </Card>
          </motion.div>
        )}

        {/* Right Panel - Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 overflow-hidden"
        >
          <EditorPreview canvasRef={canvasRef} showCheckerboard />
        </motion.div>
      </div>

      {/* Mobile Settings Drawer */}
      {isMobile && <MobileSettingsDrawer title={t("web.editor.settings")} />}
    </main>
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
