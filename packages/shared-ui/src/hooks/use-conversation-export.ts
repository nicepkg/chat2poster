"use client";

import {
  downloadImage,
  downloadZip,
  exportToPng,
  generateZipFilename,
  packageAsZip,
} from "@chat2poster/core-export";
import { useEditor } from "@ui/contexts/editor-context";
import type { ExportScope } from "@ui/contexts/editor-data-context";
import { useCallback, type RefObject } from "react";

export interface UseConversationExportOptions {
  canvasRef: RefObject<HTMLDivElement | null>;
  filenamePrefix?: string;
  settleDelayMs?: number;
}

export interface UseConversationExportResult {
  exportConversation: (scope?: ExportScope) => Promise<void>;
}

export function useConversationExport({
  canvasRef,
  filenamePrefix = "chat2poster",
  settleDelayMs = 30,
}: UseConversationExportOptions): UseConversationExportResult {
  const { editor, dispatch, runtimeDispatch } = useEditor();

  const waitForPreviewReady = useCallback(async () => {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    await new Promise((resolve) => setTimeout(resolve, settleDelayMs));
  }, [settleDelayMs]);

  const exportConversation = useCallback(
    async (scope: ExportScope = "all-pages") => {
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
      const currentPage = editor.currentPage;
      const baseFilename = `${filenamePrefix}-${conversationId}`;

      try {
        const shouldExportCurrentPage =
          scope === "current-page" || totalPages === 1;

        if (shouldExportCurrentPage) {
          const result = await exportToPng(canvasRef.current, { scale });
          const filename =
            totalPages > 1
              ? `${baseFilename}-page-${currentPage + 1}.png`
              : `${baseFilename}.png`;
          downloadImage(result.blob, filename);
          runtimeDispatch({ type: "SET_EXPORT_PROGRESS", payload: 100 });
          return;
        }

        const originalPage = currentPage;
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

        downloadZip(zipResult, generateZipFilename(baseFilename));
      } finally {
        runtimeDispatch({ type: "SET_EXPORTING", payload: false });
      }
    },
    [
      canvasRef,
      dispatch,
      editor,
      filenamePrefix,
      runtimeDispatch,
      waitForPreviewReady,
    ],
  );

  return { exportConversation };
}
