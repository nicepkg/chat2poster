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

const TYPOGRAPHY_LOCK_SELECTORS = [
  ".c2p-window-content",
  ".c2p-message-body",
  ".c2p-markdown-markdown",
  ".c2p-markdown-paragraph",
  ".c2p-markdown-list-item",
  ".c2p-markdown-heading",
] as const;

const TYPOGRAPHY_LOCK_PROPERTIES = [
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "font-kerning",
  "font-feature-settings",
] as const;

function lockTypographyStyles(container: HTMLElement): () => void {
  const targets = new Set<HTMLElement>([container]);
  for (const selector of TYPOGRAPHY_LOCK_SELECTORS) {
    for (const node of container.querySelectorAll<HTMLElement>(selector)) {
      targets.add(node);
    }
  }

  const snapshots = Array.from(targets).map((element) => {
    const computed = getComputedStyle(element);
    const previous = new Map<string, string>();

    for (const property of TYPOGRAPHY_LOCK_PROPERTIES) {
      previous.set(property, element.style.getPropertyValue(property));
      element.style.setProperty(property, computed.getPropertyValue(property));
    }

    return { element, previous };
  });

  return () => {
    for (const { element, previous } of snapshots) {
      for (const property of TYPOGRAPHY_LOCK_PROPERTIES) {
        const value = previous.get(property);
        if (!value) {
          element.style.removeProperty(property);
        } else {
          element.style.setProperty(property, value);
        }
      }
    }
  };
}

export interface UseConversationExportOptions {
  canvasRef: RefObject<HTMLDivElement | null>;
  filenamePrefix?: string;
  settleDelayMs?: number;
  embedFonts?: boolean;
}

export interface UseConversationExportResult {
  exportConversation: (scope?: ExportScope) => Promise<void>;
}

export function useConversationExport({
  canvasRef,
  filenamePrefix = "chat2poster",
  settleDelayMs = 30,
  embedFonts = false,
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
          const restoreTypography = lockTypographyStyles(canvasRef.current);
          const result = await exportToPng(canvasRef.current, {
            scale,
            embedFonts,
          }).finally(() => restoreTypography());
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

            const restoreTypography = lockTypographyStyles(canvasRef.current);
            const result = await exportToPng(canvasRef.current, {
              scale,
              embedFonts,
            }).finally(() => restoreTypography());
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
      embedFonts,
      editor,
      filenamePrefix,
      runtimeDispatch,
      waitForPreviewReady,
    ],
  );

  return { exportConversation };
}
