import { useState, useEffect, useCallback } from "react";
import type { Message, Decoration, ExportParams } from "@chat2poster/core-schema";
import {
  useEditor,
  THEME_PRESETS,
  BACKGROUND_PRESETS,
} from "@/contexts/EditorContext";

interface EditorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type PanelTab = "messages" | "theme" | "export";

export default function EditorPanel({ isOpen, onClose }: EditorPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("messages");
  const { editor, runtime, dispatch, runtimeDispatch, actions } = useEditor();

  const handleParseConversation = useCallback(() => {
    runtimeDispatch({ type: "SET_PARSING", payload: true });
    runtimeDispatch({ type: "SET_ERROR", payload: null });

    try {
      // TODO: Use core-adapters to parse the current page DOM
      // For now, show a placeholder with mock data
      const mockConversation = {
        id: crypto.randomUUID(),
        sourceType: "extension-current" as const,
        messages: [
          {
            id: crypto.randomUUID(),
            role: "user" as const,
            contentMarkdown: "Hello, can you help me with something?",
            order: 0,
          },
          {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            contentMarkdown:
              "Of course! I'd be happy to help. What do you need assistance with?",
            order: 1,
          },
          {
            id: crypto.randomUUID(),
            role: "user" as const,
            contentMarkdown:
              "I need to understand how React hooks work, especially useEffect.",
            order: 2,
          },
          {
            id: crypto.randomUUID(),
            role: "assistant" as const,
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
    } catch (err) {
      runtimeDispatch({
        type: "SET_ERROR",
        payload:
          err instanceof Error ? err.message : "Failed to parse conversation",
      });
    } finally {
      runtimeDispatch({ type: "SET_PARSING", payload: false });
    }
  }, [dispatch, runtimeDispatch]);

  useEffect(() => {
    if (isOpen && !editor.conversation && !runtime.isParsing) {
      handleParseConversation();
    }
  }, [isOpen, editor.conversation, runtime.isParsing, handleParseConversation]);

  const handleExport = useCallback(async () => {
    runtimeDispatch({ type: "SET_EXPORTING", payload: true });
    runtimeDispatch({ type: "SET_EXPORT_PROGRESS", payload: 0 });

    try {
      // TODO: Implement export using core-export
      console.log("Export with params:", editor.exportParams);

      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 200));
        runtimeDispatch({ type: "SET_EXPORT_PROGRESS", payload: i });
      }

      alert("Export functionality coming soon!");
    } catch (err) {
      runtimeDispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Export failed",
      });
    } finally {
      runtimeDispatch({ type: "SET_EXPORTING", payload: false });
    }
  }, [editor.exportParams, runtimeDispatch]);

  if (!isOpen) return null;

  const selectedCount = editor.selection?.selectedMessageIds.length ?? 0;
  const totalCount = editor.conversation?.messages.length ?? 0;
  const pageCount = editor.selection?.pageBreaks.length
    ? editor.selection.pageBreaks.length + 1
    : 1;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-96 flex-col bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Chat2Poster</h2>
          {editor.conversation?.sourceMeta?.provider && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {editor.conversation.sourceMeta.provider}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(["messages", "theme", "export"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary-500 text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {runtime.isParsing ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
          </div>
        ) : runtime.error ? (
          <div className="p-4">
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              <p className="font-medium">Error</p>
              <p className="mt-1 text-sm">{runtime.error}</p>
              <button
                onClick={handleParseConversation}
                className="mt-3 rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
              >
                Retry
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
      <div className="border-t border-gray-200 p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
          <span>
            {selectedCount} of {totalCount} messages
          </span>
          {pageCount > 1 && <span>{pageCount} pages</span>}
        </div>
        <button
          onClick={handleExport}
          disabled={selectedCount === 0 || runtime.isExporting}
          className="w-full rounded-lg bg-primary-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {runtime.isExporting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Exporting ({runtime.exportProgress}%)
            </span>
          ) : pageCount > 1 ? (
            `Export ${pageCount} Pages (ZIP)`
          ) : (
            "Export PNG"
          )}
        </button>
      </div>
    </div>
  );
}

// Icons
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

function ScissorsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

// Sub-components

interface MessagesTabProps {
  messages: Message[];
  selectedIds: string[];
  pageBreaks: { id: string; afterMessageId: string }[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAddPageBreak: (afterMessageId: string) => void;
  onRemovePageBreak: (pageBreakId: string) => void;
}

function MessagesTab({
  messages,
  selectedIds,
  pageBreaks,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onAddPageBreak,
  onRemovePageBreak,
}: MessagesTabProps) {
  const getPageBreakAfter = (messageId: string) =>
    pageBreaks.find((pb) => pb.afterMessageId === messageId);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {selectedIds.length} of {messages.length} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Select All
          </button>
          <button
            onClick={onDeselectAll}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Deselect
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {messages.map((message, index) => {
          const pageBreak = getPageBreakAfter(message.id);
          const isLast = index === messages.length - 1;

          return (
            <div key={message.id}>
              <div className="group relative">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(message.id)}
                    onChange={() => onToggle(message.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                        message.role === "user"
                          ? "bg-blue-100 text-blue-700"
                          : message.role === "assistant"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {message.role}
                    </span>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {message.contentMarkdown}
                    </p>
                  </div>
                </label>

                {/* Page break button */}
                {!isLast && !pageBreak && (
                  <button
                    onClick={() => onAddPageBreak(message.id)}
                    className="absolute -bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-500 opacity-0 shadow-sm transition-opacity hover:border-primary-300 hover:text-primary-600 group-hover:opacity-100"
                    title="Insert page break"
                  >
                    <ScissorsIcon />
                    <span>Page break</span>
                  </button>
                )}
              </div>

              {/* Page break indicator */}
              {pageBreak && (
                <div className="my-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-orange-300" />
                  <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                    <ScissorsIcon />
                    <span>Page break</span>
                    <button
                      onClick={() => onRemovePageBreak(pageBreak.id)}
                      className="ml-1 rounded-full p-0.5 hover:bg-orange-200"
                      title="Remove page break"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="h-px flex-1 bg-orange-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ThemeTabProps {
  selectedThemeId: string;
  decoration: Decoration;
  onThemeChange: (theme: (typeof THEME_PRESETS)[0]) => void;
  onDecorationChange: (decoration: Partial<Decoration>) => void;
}

function ThemeTab({
  selectedThemeId,
  decoration,
  onThemeChange,
  onDecorationChange,
}: ThemeTabProps) {
  return (
    <div className="space-y-5 p-4">
      {/* Theme Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-2">
          {THEME_PRESETS.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme)}
              className={`rounded-lg border-2 p-2 text-center text-xs font-medium transition-colors ${
                selectedThemeId === theme.id
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <div
                className="mb-1.5 h-6 w-full rounded"
                style={{
                  background:
                    theme.decorationDefaults.backgroundType === "gradient"
                      ? theme.decorationDefaults.backgroundValue
                      : theme.decorationDefaults.backgroundValue,
                }}
              />
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      {/* Background Picker */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Background
        </label>
        <div className="grid grid-cols-3 gap-2">
          {BACKGROUND_PRESETS.map((bg) => (
            <button
              key={bg.id}
              onClick={() =>
                onDecorationChange({
                  backgroundType: bg.type,
                  backgroundValue: bg.value,
                })
              }
              className={`rounded-lg border-2 p-1.5 transition-colors ${
                decoration.backgroundValue === bg.value
                  ? "border-primary-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              title={bg.label}
            >
              <div
                className="h-6 w-full rounded"
                style={{ background: bg.value }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Border Radius
        </label>
        <input
          type="range"
          min="0"
          max="32"
          value={decoration.canvasRadiusPx}
          onChange={(e) =>
            onDecorationChange({ canvasRadiusPx: Number(e.target.value) })
          }
          className="w-full"
        />
        <span className="text-xs text-gray-500">
          {decoration.canvasRadiusPx}px
        </span>
      </div>

      {/* Padding */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Padding
        </label>
        <input
          type="range"
          min="0"
          max="64"
          value={decoration.canvasPaddingPx}
          onChange={(e) =>
            onDecorationChange({ canvasPaddingPx: Number(e.target.value) })
          }
          className="w-full"
        />
        <span className="text-xs text-gray-500">
          {decoration.canvasPaddingPx}px
        </span>
      </div>

      {/* Shadow */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Shadow
        </label>
        <select
          value={decoration.shadowLevel}
          onChange={(e) =>
            onDecorationChange({
              shadowLevel: e.target.value as Decoration["shadowLevel"],
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="none">None</option>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
          <option value="xl">Extra Large</option>
        </select>
      </div>

      {/* macOS Bar Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">macOS Bar</label>
        <button
          onClick={() =>
            onDecorationChange({ macosBarEnabled: !decoration.macosBarEnabled })
          }
          className={`relative h-6 w-11 rounded-full transition-colors ${
            decoration.macosBarEnabled ? "bg-primary-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              decoration.macosBarEnabled ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

interface ExportTabProps {
  exportParams: ExportParams;
  autoPagination: boolean;
  onParamsChange: (params: Partial<ExportParams>) => void;
  onAutoPaginationChange: (enabled: boolean) => void;
}

function ExportTab({
  exportParams,
  autoPagination,
  onParamsChange,
  onAutoPaginationChange,
}: ExportTabProps) {
  return (
    <div className="space-y-5 p-4">
      {/* Scale */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Scale
        </label>
        <div className="flex gap-2">
          {([1, 2, 3] as const).map((scale) => (
            <button
              key={scale}
              onClick={() => onParamsChange({ scale })}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                exportParams.scale === scale
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {scale}x
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Higher scale = better quality, larger file
        </p>
      </div>

      {/* Canvas Width */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Canvas Width
        </label>
        <select
          value={exportParams.canvasWidthPx}
          onChange={(e) =>
            onParamsChange({ canvasWidthPx: Number(e.target.value) })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="600">Narrow (600px)</option>
          <option value="800">Standard (800px)</option>
          <option value="1080">Wide (1080px)</option>
        </select>
      </div>

      {/* Auto Pagination Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Auto Pagination
          </label>
          <p className="text-xs text-gray-500">
            Split long conversations into pages
          </p>
        </div>
        <button
          onClick={() => onAutoPaginationChange(!autoPagination)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            autoPagination ? "bg-primary-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              autoPagination ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {/* Max Page Height (shown when auto pagination is on) */}
      {autoPagination && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Max Page Height
          </label>
          <input
            type="number"
            min="2000"
            max="10000"
            step="100"
            value={exportParams.maxPageHeightPx}
            onChange={(e) =>
              onParamsChange({ maxPageHeightPx: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <span className="text-xs text-gray-500">
            {exportParams.maxPageHeightPx}px per page
          </span>
        </div>
      )}

      {/* Output Mode */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Output Mode
        </label>
        <select
          value={exportParams.outputMode}
          onChange={(e) =>
            onParamsChange({
              outputMode: e.target.value as ExportParams["outputMode"],
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="single">Single PNG</option>
          <option value="multi-zip">Multi-page ZIP</option>
        </select>
      </div>
    </div>
  );
}
