"use client";

import type { Conversation } from "@chat2poster/core-schema";
import { useEditor } from "@ui/contexts/editor-context";
import type { ExportScope } from "@ui/contexts/editor-data-context";
import { useEditorData } from "@ui/contexts/editor-data-context";
import { useI18n } from "@ui/i18n";
import { cn } from "@ui/utils/common";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { VisuallyHidden } from "../ui/visually-hidden";
import { EditorWorkspace } from "./editor-workspace";

export interface EditorModalProps extends React.ComponentProps<typeof Dialog> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onParse?: () => Promise<Conversation>;
  onExport?: (scope?: ExportScope) => Promise<void>;
  title?: string;
  forceParseOnOpen?: boolean;
  canvasRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  mountedTo?: Element | DocumentFragment | null | undefined;
}

export function EditorModal({
  open,
  onOpenChange,
  onParse,
  onExport,
  title = "Chat2Poster",
  forceParseOnOpen = false,
  canvasRef,
  className,
  mountedTo,
  ...props
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

  const lastOpenRef = useRef(open);

  useEffect(() => {
    const justOpened = open && !lastOpenRef.current;
    lastOpenRef.current = open;
    if (!open || runtime.isParsing) return;

    if (!editor.conversation) {
      void handleParseConversation();
      return;
    }

    if (forceParseOnOpen && justOpened) {
      void handleParseConversation();
    }
  }, [
    open,
    editor.conversation,
    runtime.isParsing,
    forceParseOnOpen,
    handleParseConversation,
  ]);

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
        mountedTo={mountedTo}
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
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent
        showCloseButton={false}
        mountedTo={mountedTo}
        overlayProps={{
          onPointerDown: () => onOpenChange(false),
        }}
        onPointerDownOutside={(event) => {
          const original = event.detail.originalEvent;
          const isRightClick =
            original instanceof PointerEvent
              ? original.button === 2 ||
                (original.button === 0 && original.ctrlKey === true)
              : false;
          if (isRightClick) return;
          onOpenChange(false);
        }}
        className={cn(
          "c2p-editor-modal bg-background/95 backdrop-blur-xl border-border/60 h-[min(92vh,960px)] w-[min(96vw,1280px)] !max-w-none overflow-hidden border p-0 shadow-2xl flex flex-col min-h-0",
          className,
        )}
      >
        <DialogClose
          className="absolute right-0 top-0 z-10 inline-flex size-6 items-center justify-center rounded-full text-foreground/7 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
          aria-label={t("editor.panel.close")}
        >
          <X className="h-4 w-4" />
        </DialogClose>
        <DialogHeader className="sr-only">
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="h-full w-full">{content}</div>
      </DialogContent>
    </Dialog>
  );
}
