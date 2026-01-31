"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import type { Conversation } from "@chat2poster/core-schema";
import { cn } from "~/utils/common";
import { useEditor } from "~/contexts/editor-context";
import { useI18n } from "~/i18n";
import { MessagesTab } from "./messages-tab";
import { ThemeTab } from "./theme-tab";
import { ExportTab } from "./export-tab";

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

type PanelTab = "messages" | "theme" | "export";

export interface EditorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onParse?: () => Promise<Conversation>;
  onExport?: () => Promise<void>;
  className?: string;
}

export function EditorPanel({
  isOpen,
  onClose,
  onParse,
  onExport,
  className,
}: EditorPanelProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<PanelTab>("messages");
  const { editor, runtime, dispatch, runtimeDispatch, actions } = useEditor();

  const handleParseConversation = useCallback(async () => {
    runtimeDispatch({ type: "SET_PARSING", payload: true });
    runtimeDispatch({ type: "SET_ERROR", payload: null });

    try {
      if (onParse) {
        const conversation = await onParse();
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
      } else {
        // Use mock data if no onParse provided
        const mockConversation: Conversation = {
          id: crypto.randomUUID(),
          sourceType: "extension-current",
          messages: [
            {
              id: crypto.randomUUID(),
              role: "user",
              contentMarkdown: "Hello, can you help me with something?",
              order: 0,
            },
            {
              id: crypto.randomUUID(),
              role: "assistant",
              contentMarkdown:
                "Of course! I'd be happy to help. What do you need assistance with?",
              order: 1,
            },
            {
              id: crypto.randomUUID(),
              role: "user",
              contentMarkdown:
                "I need to understand how React hooks work, especially useEffect.",
              order: 2,
            },
            {
              id: crypto.randomUUID(),
              role: "assistant",
              contentMarkdown: `Great question! \`useEffect\` is one of the most commonly used React hooks. Here's a quick overview:\n\n**Basic Usage:**\n\`\`\`javascript\nuseEffect(() => {\n  // Side effect code here\n  return () => {\n    // Cleanup function\n  };\n}, [dependencies]);\n\`\`\`\n\n**Key Points:**\n- Runs after every render by default\n- Add a dependency array to control when it runs\n- Return a cleanup function for subscriptions/timers`,
              order: 3,
            },
          ],
        };

        const messageIds = mockConversation.messages.map((m) => m.id);

        dispatch({ type: "SET_CONVERSATION", payload: mockConversation });
        dispatch({
          type: "SET_SELECTION",
          payload: {
            conversationId: mockConversation.id,
            selectedMessageIds: messageIds,
            pageBreaks: [],
          },
        });
      }
    } catch (err) {
      runtimeDispatch({
        type: "SET_ERROR",
        payload:
          err instanceof Error ? err.message : t("editor.panel.parseError"),
      });
    } finally {
      runtimeDispatch({ type: "SET_PARSING", payload: false });
    }
  }, [dispatch, runtimeDispatch, onParse, t]);

  useEffect(() => {
    if (isOpen && !editor.conversation && !runtime.isParsing) {
      void handleParseConversation();
    }
  }, [isOpen, editor.conversation, runtime.isParsing, handleParseConversation]);

  const handleExport = useCallback(async () => {
    runtimeDispatch({ type: "SET_EXPORTING", payload: true });
    runtimeDispatch({ type: "SET_EXPORT_PROGRESS", payload: 0 });

    try {
      if (onExport) {
        await onExport();
      } else {
        // Simulate progress
        for (let i = 0; i <= 100; i += 20) {
          await new Promise((r) => setTimeout(r, 200));
          runtimeDispatch({ type: "SET_EXPORT_PROGRESS", payload: i });
        }
        alert(t("editor.panel.exportSoon"));
      }
    } catch (err) {
      runtimeDispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : t("editor.panel.exportError"),
      });
    } finally {
      runtimeDispatch({ type: "SET_EXPORTING", payload: false });
    }
  }, [onExport, runtimeDispatch, t]);

  if (!isOpen) return null;

  const selectedCount = editor.selection?.selectedMessageIds.length ?? 0;
  const totalCount = editor.conversation?.messages.length ?? 0;
  const pageCount = editor.selection?.pageBreaks.length
    ? editor.selection.pageBreaks.length + 1
    : 1;

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-96 flex-col bg-background shadow-2xl",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Chat2Poster</h2>
          {editor.conversation?.sourceMeta?.provider && (
            <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {editor.conversation.sourceMeta.provider}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["messages", "theme", "export"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium capitalize transition-colors",
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "messages"
              ? t("editor.tabs.messages")
              : tab === "theme"
                ? t("editor.tabs.theme")
                : t("editor.tabs.export")}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {runtime.isParsing ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : runtime.error ? (
          <div className="p-4">
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
              <p className="font-medium">{t("editor.panel.errorTitle")}</p>
              <p className="mt-1 text-sm">{runtime.error}</p>
              <button
                onClick={() => void handleParseConversation()}
                className="mt-3 rounded bg-destructive/20 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/30"
              >
                {t("editor.panel.retry")}
              </button>
            </div>
          </div>
        ) : activeTab === "messages" ? (
          <MessagesTab
            messages={editor.conversation?.messages ?? []}
            selectedIds={editor.selection?.selectedMessageIds ?? []}
            pageBreaks={editor.selection?.pageBreaks ?? []}
            onToggle={actions.toggleMessage}
            onSelectAll={actions.selectAllMessages}
            onDeselectAll={actions.deselectAllMessages}
            onAddPageBreak={actions.addPageBreak}
            onRemovePageBreak={actions.removePageBreak}
          />
        ) : activeTab === "theme" ? (
          <ThemeTab
            selectedThemeId={editor.selectedTheme.id}
            decoration={editor.decoration}
            onThemeChange={actions.setTheme}
            onDecorationChange={actions.setDecoration}
          />
        ) : (
          <ExportTab
            exportParams={editor.exportParams}
            autoPagination={editor.autoPagination}
            onParamsChange={actions.setExportParams}
            onAutoPaginationChange={actions.setAutoPagination}
          />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {t("editor.panel.selectedCount", {
              selected: selectedCount,
              total: totalCount,
            })}
          </span>
          {pageCount > 1 && (
            <span>{t("editor.panel.pagesCount", { count: pageCount })}</span>
          )}
        </div>
        <button
          onClick={() => void handleExport()}
          disabled={selectedCount === 0 || runtime.isExporting}
          className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {runtime.isExporting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              {t("editor.panel.exportingProgress", {
                progress: runtime.exportProgress,
              })}
            </span>
          ) : pageCount > 1 ? (
            t("editor.panel.exportPages", { count: pageCount })
          ) : (
            t("editor.panel.exportPng")
          )}
        </button>
      </div>
    </div>
  );
}
