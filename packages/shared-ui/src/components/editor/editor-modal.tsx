"use client";

import type { Conversation } from "@chat2poster/core-schema";
import { useEditor } from "@ui/contexts/editor-context";
import type { ExportScope } from "@ui/contexts/editor-data-context";
import { useEditorData } from "@ui/contexts/editor-data-context";
import { useI18n } from "@ui/i18n";
import { cn } from "@ui/utils/common";
import { useCallback, useEffect, useMemo, type RefObject } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { EditorWorkspace } from "./editor-workspace";

export interface EditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onParse?: () => Promise<Conversation>;
  onExport?: (scope?: ExportScope) => Promise<void>;
  title?: string;
  canvasRef?: RefObject<HTMLDivElement | null>;
  className?: string;
}

export function EditorModal({
  open,
  onOpenChange,
  onParse,
  onExport,
  title = "Chat2Poster",
  canvasRef,
  className,
}: EditorModalProps) {
  const { t } = useI18n();
  const { editor, runtime, dispatch, runtimeDispatch } = useEditor();
  const editorData = useEditorData();
  const parseHandler = onParse ?? editorData?.parseConversation;
  const exportHandler = onExport ?? editorData?.exportConversation;

  const handleParseConversation = useCallback(async () => {
    if (!parseHandler) {
      runtimeDispatch({
        type: "SET_ERROR",
        payload: "No parse handler provided",
      });
      return;
    }

    runtimeDispatch({ type: "SET_PARSING", payload: true });
    runtimeDispatch({ type: "SET_ERROR", payload: null });

    try {
      const conversation = await parseHandler();
      const messageIds = conversation.messages.map((m) => m.id);

      dispatch({ type: "SET_CONVERSATION", payload: conversation });
      dispatch({
        type: "SET_SELECTION",
        payload: {
          conversationId: conversation.id,
          selectedMessageIds: messageIds,
          pageBreaks: [],
        },
      });
    } catch (err) {
      runtimeDispatch({
        type: "SET_ERROR",
        payload:
          err instanceof Error ? err.message : t("editor.panel.parseError"),
      });
    } finally {
      runtimeDispatch({ type: "SET_PARSING", payload: false });
    }
  }, [dispatch, parseHandler, runtimeDispatch, t]);

  useEffect(() => {
    if (open && !editor.conversation && !runtime.isParsing) {
      void handleParseConversation();
    }
  }, [open, editor.conversation, runtime.isParsing, handleParseConversation]);

  const content = useMemo(() => {
    if (runtime.isParsing || (!editor.conversation && !runtime.error)) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <span>{t("web.editor.loading")}</span>
          </div>
        </div>
      );
    }

    if (runtime.error) {
      return (
        <div className="flex h-full items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-destructive">
            <p className="font-medium">{t("editor.panel.errorTitle")}</p>
            <p className="mt-2 text-sm">{runtime.error}</p>
            <button
              onClick={() => void handleParseConversation()}
              className="mt-4 rounded-lg bg-destructive/20 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/30"
            >
              {t("editor.panel.retry")}
            </button>
          </div>
        </div>
      );
    }

    return (
      <EditorWorkspace
        canvasRef={canvasRef}
        onExport={exportHandler}
        className="h-full bg-transparent"
        containerClassName="h-full max-w-none"
        settingsTitle={t("web.editor.settings")}
        showMobileDrawer
      />
    );
  }, [
    canvasRef,
    editor.conversation,
    exportHandler,
    handleParseConversation,
    runtime.error,
    runtime.isParsing,
    t,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "c2p-editor-modal bg-background/95 backdrop-blur-xl border-border/60 h-[min(92vh,960px)] w-[min(96vw,1280px)] !max-w-none overflow-hidden border p-0 shadow-2xl flex flex-col min-h-0",
          className,
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="h-full w-full">{content}</div>
      </DialogContent>
    </Dialog>
  );
}
