"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Selection {
  selectedIds: string[];
  pageBreaks: { id: string; afterMessageId: string }[];
}

interface Decoration {
  canvasPaddingPx: number;
  canvasRadiusPx: number;
  shadowLevel: "none" | "sm" | "md" | "lg" | "xl";
  backgroundValue: string;
  macosBarEnabled: boolean;
}

interface ExportParams {
  scale: 1 | 2 | 3;
  canvasWidthPx: number;
  maxPageHeightPx: number;
}

const defaultDecoration: Decoration = {
  canvasPaddingPx: 24,
  canvasRadiusPx: 12,
  shadowLevel: "md",
  backgroundValue: "#ffffff",
  macosBarEnabled: true,
};

const defaultExportParams: ExportParams = {
  scale: 2,
  canvasWidthPx: 800,
  maxPageHeightPx: 4096,
};

type Tab = "messages" | "theme" | "export";

export default function EditorPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selection, setSelection] = useState<Selection>({
    selectedIds: [],
    pageBreaks: [],
  });
  const [decoration, setDecoration] = useState<Decoration>(defaultDecoration);
  const [exportParams, setExportParams] =
    useState<ExportParams>(defaultExportParams);
  const [activeTab, setActiveTab] = useState<Tab>("messages");
  const [isExporting, setIsExporting] = useState(false);

  // Load messages from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("chat2poster:manual-messages");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Message[];
        setMessages(parsed);
        setSelection({
          selectedIds: parsed.map((m) => m.id),
          pageBreaks: [],
        });
      } catch {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const toggleMessage = useCallback((id: string) => {
    setSelection((prev) => ({
      ...prev,
      selectedIds: prev.selectedIds.includes(id)
        ? prev.selectedIds.filter((i) => i !== id)
        : [...prev.selectedIds, id],
    }));
  }, []);

  const selectAll = useCallback(() => {
    setSelection((prev) => ({
      ...prev,
      selectedIds: messages.map((m) => m.id),
    }));
  }, [messages]);

  const deselectAll = useCallback(() => {
    setSelection((prev) => ({ ...prev, selectedIds: [] }));
  }, []);

  const addPageBreak = useCallback((afterMessageId: string) => {
    setSelection((prev) => ({
      ...prev,
      pageBreaks: [
        ...prev.pageBreaks,
        { id: crypto.randomUUID(), afterMessageId },
      ],
    }));
  }, []);

  const removePageBreak = useCallback((id: string) => {
    setSelection((prev) => ({
      ...prev,
      pageBreaks: prev.pageBreaks.filter((pb) => pb.id !== id),
    }));
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // TODO: Implement actual export
      await new Promise((r) => setTimeout(r, 1500));
      alert("Export functionality coming soon!");
    } finally {
      setIsExporting(false);
    }
  }, []);

  const pageCount = selection.pageBreaks.length + 1;

  if (messages.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Editor</h1>
          </div>
          <button
            onClick={handleExport}
            disabled={selection.selectedIds.length === 0 || isExporting}
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isExporting
              ? "Exporting..."
              : pageCount > 1
                ? `Export ${pageCount} Pages (ZIP)`
                : "Export PNG"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Panel - Settings */}
          <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-1">
            {/* Tabs */}
            <div className="mb-4 flex border-b border-gray-200">
              {(["messages", "theme", "export"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? "border-b-2 border-primary-500 text-primary-600"
                      : "text-gray-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "messages" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {selection.selectedIds.length}/{messages.length} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      All
                    </button>
                    <button
                      onClick={deselectAll}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      None
                    </button>
                  </div>
                </div>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {messages.map((msg, idx) => {
                    const pb = selection.pageBreaks.find(
                      (p) => p.afterMessageId === msg.id,
                    );
                    return (
                      <div key={msg.id}>
                        <label className="group flex cursor-pointer items-start gap-2 rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selection.selectedIds.includes(msg.id)}
                            onChange={() => toggleMessage(msg.id)}
                            className="mt-1"
                          />
                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-xs font-medium ${msg.role === "user" ? "text-blue-600" : "text-green-600"}`}
                            >
                              {msg.role}
                            </span>
                            <p className="line-clamp-2 text-xs text-gray-600">
                              {msg.content}
                            </p>
                          </div>
                          {idx < messages.length - 1 && !pb && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                addPageBreak(msg.id);
                              }}
                              className="rounded px-1 py-0.5 text-xs text-gray-400 opacity-0 hover:bg-gray-100 group-hover:opacity-100"
                            >
                              ✂️
                            </button>
                          )}
                        </label>
                        {pb && (
                          <div className="my-1 flex items-center gap-1 text-xs text-orange-600">
                            <span className="flex-1 border-t border-orange-300" />
                            <span>Page break</span>
                            <button
                              onClick={() => removePageBreak(pb.id)}
                              className="hover:text-red-600"
                            >
                              ×
                            </button>
                            <span className="flex-1 border-t border-orange-300" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "theme" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Border Radius
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={decoration.canvasRadiusPx}
                    onChange={(e) =>
                      setDecoration((d) => ({
                        ...d,
                        canvasRadiusPx: +e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">
                    {decoration.canvasRadiusPx}px
                  </span>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Padding
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="64"
                    value={decoration.canvasPaddingPx}
                    onChange={(e) =>
                      setDecoration((d) => ({
                        ...d,
                        canvasPaddingPx: +e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">
                    {decoration.canvasPaddingPx}px
                  </span>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Shadow
                  </label>
                  <select
                    value={decoration.shadowLevel}
                    onChange={(e) =>
                      setDecoration((d) => ({
                        ...d,
                        shadowLevel: e.target
                          .value as Decoration["shadowLevel"],
                      }))
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">Extra Large</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    macOS Bar
                  </span>
                  <button
                    onClick={() =>
                      setDecoration((d) => ({
                        ...d,
                        macosBarEnabled: !d.macosBarEnabled,
                      }))
                    }
                    className={`relative h-5 w-9 rounded-full transition-colors ${decoration.macosBarEnabled ? "bg-primary-500" : "bg-gray-300"}`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${decoration.macosBarEnabled ? "left-4" : "left-0.5"}`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "export" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Scale
                  </label>
                  <div className="flex gap-2">
                    {([1, 2, 3] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          setExportParams((p) => ({ ...p, scale: s }))
                        }
                        className={`flex-1 rounded border py-1 text-sm ${exportParams.scale === s ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-300"}`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Canvas Width
                  </label>
                  <select
                    value={exportParams.canvasWidthPx}
                    onChange={(e) =>
                      setExportParams((p) => ({
                        ...p,
                        canvasWidthPx: +e.target.value,
                      }))
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="600">600px</option>
                    <option value="800">800px</option>
                    <option value="1080">1080px</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Max Page Height
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="10000"
                    step="100"
                    value={exportParams.maxPageHeightPx}
                    onChange={(e) =>
                      setExportParams((p) => ({
                        ...p,
                        maxPageHeightPx: +e.target.value,
                      }))
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-sm font-medium text-gray-700">Preview</h2>
            <div
              className="mx-auto overflow-hidden"
              style={{
                maxWidth: exportParams.canvasWidthPx,
                borderRadius: decoration.canvasRadiusPx,
                padding: decoration.canvasPaddingPx,
                background: decoration.backgroundValue,
                boxShadow:
                  decoration.shadowLevel === "none"
                    ? "none"
                    : decoration.shadowLevel === "sm"
                      ? "0 1px 2px rgba(0,0,0,0.05)"
                      : decoration.shadowLevel === "md"
                        ? "0 4px 6px rgba(0,0,0,0.1)"
                        : decoration.shadowLevel === "lg"
                          ? "0 10px 15px rgba(0,0,0,0.1)"
                          : "0 20px 25px rgba(0,0,0,0.15)",
              }}
            >
              {/* macOS Bar */}
              {decoration.macosBarEnabled && (
                <div className="mb-4 flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
              )}

              {/* Messages */}
              <div className="space-y-4">
                {messages
                  .filter((m) => selection.selectedIds.includes(m.id))
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-3 ${
                        msg.role === "user"
                          ? "bg-blue-50 text-blue-900"
                          : "bg-green-50 text-green-900"
                      }`}
                    >
                      <div className="mb-1 text-xs font-medium opacity-60">
                        {msg.role}
                      </div>
                      <div className="whitespace-pre-wrap text-sm">
                        {msg.content}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
