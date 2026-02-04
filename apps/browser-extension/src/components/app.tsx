import {
  parseWithAdapters,
  registerBuiltinAdapters,
} from "@chat2poster/core-adapters";
import {
  downloadImage,
  downloadZip,
  exportToPng,
  generateZipFilename,
  packageAsZip,
} from "@chat2poster/core-export";
import {
  EditorDataProvider,
  EditorModal,
  EditorProvider,
  FloatingButton,
  I18nProvider,
  useEditor,
} from "@chat2poster/shared-ui";
import { getLocaleFromNavigator } from "@chat2poster/shared-ui/i18n/core";
import { useCallback, useRef, useState } from "react";

registerBuiltinAdapters();

export default function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const locale =
    typeof navigator !== "undefined"
      ? getLocaleFromNavigator(
          navigator.languages.length > 0
            ? navigator.languages
            : navigator.language,
        )
      : "en";

  const handleOpenPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  return (
    <I18nProvider locale={locale}>
      <EditorProvider>
        <ExtensionShell
          isPanelOpen={isPanelOpen}
          onOpenPanel={handleOpenPanel}
          onOpenChange={setIsPanelOpen}
        />
      </EditorProvider>
    </I18nProvider>
  );
}

function ExtensionShell({
  isPanelOpen,
  onOpenPanel,
  onOpenChange,
}: {
  isPanelOpen: boolean;
  onOpenPanel: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { editor, dispatch, runtimeDispatch } = useEditor();

  const handleParseConversation = useCallback(async () => {
    const result = await parseWithAdapters({
      type: "ext",
      document,
      url: window.location.href,
    });
    return result.conversation;
  }, []);

  const waitForPreviewReady = useCallback(async () => {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    await new Promise((resolve) => setTimeout(resolve, 30));
  }, []);

  const handleExportConversation = useCallback(async () => {
    if (!canvasRef.current) {
      throw new Error("Preview not ready");
    }

    runtimeDispatch({ type: "SET_ERROR", payload: null });
    runtimeDispatch({ type: "SET_EXPORTING", payload: true });
    runtimeDispatch({ type: "SET_EXPORT_PROGRESS", payload: 0 });

    const pageBreaks = editor.selection?.pageBreaks ?? [];
    const totalPages = pageBreaks.length + 1;
    const scale = editor.exportParams.scale ?? 2;
    const conversationId = editor.conversation?.id ?? "export";

    try {
      if (totalPages === 1) {
        const result = await exportToPng(canvasRef.current, { scale });
        downloadImage(result.blob, `chat2poster-${conversationId}.png`);
        runtimeDispatch({ type: "SET_EXPORT_PROGRESS", payload: 100 });
        return;
      }

      const originalPage = editor.currentPage;
      const pageResults: Awaited<ReturnType<typeof exportToPng>>[] = [];

      try {
        for (let i = 0; i < totalPages; i += 1) {
          dispatch({ type: "SET_CURRENT_PAGE", payload: i });
          await waitForPreviewReady();

          if (!canvasRef.current) {
            throw new Error("Preview not ready");
          }

          const result = await exportToPng(canvasRef.current, { scale });
          pageResults.push(result);
          runtimeDispatch({
            type: "SET_EXPORT_PROGRESS",
            payload: Math.round(((i + 1) / totalPages) * 100),
          });
        }
      } finally {
        dispatch({ type: "SET_CURRENT_PAGE", payload: originalPage });
      }

      const zipResult = await packageAsZip(
        {
          pages: pageResults,
          totalPages: pageResults.length,
          cancelled: false,
          completedAt: new Date().toISOString(),
        },
        { baseFilename: "page", includeMetadata: true },
      );

      downloadZip(
        zipResult,
        generateZipFilename(`chat2poster-${conversationId}`),
      );
    } finally {
      runtimeDispatch({ type: "SET_EXPORTING", payload: false });
    }
  }, [
    canvasRef,
    waitForPreviewReady,
    dispatch,
    editor.conversation?.id,
    editor.currentPage,
    editor.exportParams.scale,
    editor.selection?.pageBreaks,
    runtimeDispatch,
  ]);

  return (
    <EditorDataProvider
      parseConversation={handleParseConversation}
      exportConversation={handleExportConversation}
    >
      <FloatingButton onClick={onOpenPanel} visible={!isPanelOpen} />
      <EditorModal
        open={isPanelOpen}
        onOpenChange={onOpenChange}
        canvasRef={canvasRef}
      />
    </EditorDataProvider>
  );
}
