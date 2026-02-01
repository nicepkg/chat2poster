/**
 * Multi-page export with progress tracking
 */

import { exportToPng, type ExportOptions, type ExportResult } from "./exporter";

/**
 * Progress callback for multi-page export
 */
export type ProgressCallback = (progress: {
  current: number;
  total: number;
  percentage: number;
  currentPageResult?: ExportResult;
}) => void;

/**
 * Multi-page export options
 */
export interface MultiPageExportOptions extends Partial<ExportOptions> {
  /** Callback for progress updates */
  onProgress?: ProgressCallback;
  /** Abort signal for cancellation */
  abortSignal?: AbortSignal;
}

/**
 * Multi-page export result
 */
export interface MultiPageExportResult {
  /** Results for each page */
  pages: ExportResult[];
  /** Total number of pages exported */
  totalPages: number;
  /** Whether the export was cancelled */
  cancelled: boolean;
  /** Timestamp when export completed */
  completedAt: string;
}

/**
 * A function that renders a specific page and returns the element to export
 */
export type PageRenderer = (
  pageIndex: number,
) => Promise<HTMLElement> | HTMLElement;

/**
 * Export multiple pages
 *
 * @param pageCount - Total number of pages to export
 * @param renderPage - Function that renders each page and returns the element
 * @param options - Export options
 */
export async function exportPages(
  pageCount: number,
  renderPage: PageRenderer,
  options: MultiPageExportOptions = {},
): Promise<MultiPageExportResult> {
  const pages: ExportResult[] = [];
  const { onProgress, abortSignal, ...exportOptions } = options;

  for (let i = 0; i < pageCount; i++) {
    // Check for cancellation
    if (abortSignal?.aborted) {
      return {
        pages,
        totalPages: pages.length,
        cancelled: true,
        completedAt: new Date().toISOString(),
      };
    }

    // Render the page
    const element = await renderPage(i);

    // Export the page
    const result = await exportToPng(element, exportOptions);
    pages.push(result);

    // Report progress
    onProgress?.({
      current: i + 1,
      total: pageCount,
      percentage: Math.round(((i + 1) / pageCount) * 100),
      currentPageResult: result,
    });
  }

  return {
    pages,
    totalPages: pages.length,
    cancelled: false,
    completedAt: new Date().toISOString(),
  };
}

/**
 * Export multiple elements (pre-rendered pages)
 */
export async function exportElements(
  elements: HTMLElement[],
  options: MultiPageExportOptions = {},
): Promise<MultiPageExportResult> {
  return exportPages(elements.length, (index) => elements[index]!, options);
}

/**
 * Get blobs from multi-page result
 */
export function getBlobs(result: MultiPageExportResult): Blob[] {
  return result.pages.map((page) => page.blob);
}

/**
 * Calculate total size of all exported pages
 */
export function getTotalSize(result: MultiPageExportResult): number {
  return result.pages.reduce((total, page) => total + page.blob.size, 0);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
