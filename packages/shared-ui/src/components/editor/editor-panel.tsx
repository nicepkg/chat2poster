"use client";

import type { Conversation } from "@chat2poster/core-schema";
import { useEditor } from "@ui/contexts/editor-context";
import type { ExportScope } from "@ui/contexts/editor-data-context";
import { useEditorData } from "@ui/contexts/editor-data-context";
import { useI18n } from "@ui/i18n";
import { cn } from "@ui/utils/common";
import { useState, useCallback, useEffect } from "react";
import { ExportTab } from "./export-tab";
import { MessagesTab } from "./messages-tab";
import { ThemeTab } from "./theme-tab";

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
  onExport?: (scope?: ExportScope) => Promise<void>;
  variant?: "panel" | "modal";
  className?: string;
}

export function EditorPanel({
  isOpen,
  onClose,
  onParse,
  onExport,
  variant = "panel",
  className,
}: EditorPanelProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<PanelTab>("messages");
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
  }, [dispatch, runtimeDispatch, parseHandler, t]);

  useEffect(() => {
    if (isOpen && !editor.conversation && !runtime.isParsing) {
      void handleParseConversation();
    }
  }, [isOpen, editor.conversation, runtime.isParsing, handleParseConversation]);

  const handleExport = useCallback(async () => {
    if (!exportHandler) {
      runtimeDispatch({
        type: "SET_ERROR",
        payload: "No export handler provided",
      });
      return;
    }

    runtimeDispatch({ type: "SET_EXPORTING", payload: true });
    runtimeDispatch({ type: "SET_EXPORT_PROGRESS", payload: 0 });

    try {
      await exportHandler();
    } catch (err) {
      runtimeDispatch({
        type: "SET_ERROR",
        payload:
          err instanceof Error ? err.message : t("editor.panel.exportError"),
      });
    } finally {
      runtimeDispatch({ type: "SET_EXPORTING", payload: false });
    }
  }, [exportHandler, runtimeDispatch, t]);

  if (!isOpen) return null;

  const selectedCount = editor.selection?.selectedMessageIds.length ?? 0;
  const totalCount = editor.conversation?.messages.length ?? 0;
  const pageCount = editor.selection?.pageBreaks.length
    ? editor.selection.pageBreaks.length + 1
    : 1;

  return (
    <div
      className={cn(
        variant === "panel"
          ? "c2p-panel fixed inset-y-0 right-0 z-50 flex w-96 flex-col bg-background shadow-2xl"
          : "c2p-panel relative flex h-full w-full flex-col bg-transparent",
        className,
      )}
    >
      {/* Header */}
      <div className="c2p-panel-header flex items-center justify-between border-b border-border px-4 py-3">
        <div className="c2p-panel-title flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Chat2Poster</h2>
          {editor.conversation?.sourceMeta?.provider && (
            <span className="c2p-panel-provider rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {editor.conversation.sourceMeta.provider}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="c2p-panel-close rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Tabs */}
      <div className="c2p-panel-tabs flex border-b border-border">
        {(["messages", "theme", "export"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              `c2p-panel-tab c2p-panel-tab-${tab} flex-1 px-4 py-2 text-sm font-medium capitalize transition-colors`,
              activeTab === tab
                ? "c2p-panel-tab-active border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
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
      <div className="c2p-panel-content flex-1 overflow-y-auto">
        {runtime.isParsing ? (
          <div className="c2p-panel-loading flex h-full items-center justify-center">
            <div className="c2p-panel-spinner h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : runtime.error ? (
          <div className="c2p-panel-error p-4">
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
              <p className="font-medium">{t("editor.panel.errorTitle")}</p>
              <p className="mt-1 text-sm">{runtime.error}</p>
              <button
                onClick={() => void handleParseConversation()}
                className="c2p-panel-retry mt-3 rounded bg-destructive/20 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/30"
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
            onToggle={(id) => dispatch({ type: "TOGGLE_MESSAGE", payload: id })}
            onSelectAll={() => dispatch({ type: "SELECT_ALL_MESSAGES" })}
            onDeselectAll={() => dispatch({ type: "DESELECT_ALL_MESSAGES" })}
            onAddPageBreak={(afterMessageId) =>
              dispatch({ type: "ADD_PAGE_BREAK", payload: { afterMessageId } })
            }
            onRemovePageBreak={(id) =>
              dispatch({ type: "REMOVE_PAGE_BREAK", payload: id })
            }
          />
        ) : activeTab === "theme" ? (
          <ThemeTab
            selectedThemeId={editor.selectedTheme.id}
            decoration={editor.decoration}
            onThemeChange={(theme) =>
              dispatch({ type: "SET_THEME", payload: theme })
            }
            onDecorationChange={(decoration) =>
              dispatch({ type: "SET_DECORATION", payload: decoration })
            }
          />
        ) : (
          <ExportTab
            exportParams={editor.exportParams}
            autoPagination={editor.autoPagination}
            onParamsChange={(params) =>
              dispatch({ type: "SET_EXPORT_PARAMS", payload: params })
            }
            onAutoPaginationChange={(enabled) =>
              dispatch({ type: "SET_AUTO_PAGINATION", payload: enabled })
            }
          />
        )}
      </div>

      {/* Footer */}
      <div className="c2p-panel-footer border-t border-border p-4">
        <div className="c2p-panel-stats mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="c2p-panel-selected-count">
            {t("editor.panel.selectedCount", {
              selected: selectedCount,
              total: totalCount,
            })}
          </span>
          {pageCount > 1 && (
            <span className="c2p-panel-page-count">
              {t("editor.panel.pagesCount", { count: pageCount })}
            </span>
          )}
        </div>
        <button
          onClick={() => void handleExport()}
          disabled={selectedCount === 0 || runtime.isExporting}
          className="c2p-panel-export-btn w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
