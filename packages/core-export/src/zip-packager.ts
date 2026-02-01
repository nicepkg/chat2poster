/**
 * ZIP packaging for multi-page exports
 */

import { createAppError } from "@chat2poster/core-schema";
import { zipSync, strToU8 } from "fflate";
import type { MultiPageExportResult } from "./multi-page-exporter";

/**
 * ZIP packaging options
 */
export interface ZipOptions {
  /** Base filename for images (without extension) */
  baseFilename?: string;
  /** Whether to include a metadata.json file */
  includeMetadata?: boolean;
  /** Custom metadata to include */
  customMetadata?: Record<string, unknown>;
  /** Compression level (0-9, higher = more compression but slower) */
  compressionLevel?: number;
}

/**
 * Default ZIP options
 */
export const DEFAULT_ZIP_OPTIONS: ZipOptions = {
  baseFilename: "page",
  includeMetadata: true,
  compressionLevel: 6,
};

/**
 * ZIP packaging result
 */
export interface ZipResult {
  /** The ZIP file as a Blob */
  blob: Blob;
  /** Size of the ZIP file in bytes */
  size: number;
  /** List of files in the ZIP */
  files: string[];
  /** Metadata about the packaging */
  meta: {
    totalPages: number;
    packagedAt: string;
    compressionRatio: number;
  };
}

/**
 * Generate padded page number for consistent sorting
 */
function padPageNumber(index: number, total: number): string {
  const digits = String(total).length;
  return String(index + 1).padStart(digits, "0");
}

/**
 * Generate filename for a page
 */
export function generatePageFilename(
  index: number,
  totalPages: number,
  baseName = "page",
  extension = "png",
): string {
  const paddedNumber = padPageNumber(index, totalPages);
  return `${baseName}_${paddedNumber}.${extension}`;
}

/**
 * Convert Blob to Uint8Array
 */
async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Create metadata JSON content
 */
function createMetadataContent(
  exportResult: MultiPageExportResult,
  filenames: string[],
  options: ZipOptions,
): string {
  const metadata = {
    version: "1.0",
    createdAt: new Date().toISOString(),
    totalPages: exportResult.totalPages,
    files: filenames,
    pages: exportResult.pages.map((page, index) => ({
      filename: filenames[index],
      width: page.width,
      height: page.height,
      scale: page.meta.scale,
      format: page.meta.format,
      exportedAt: page.meta.exportedAt,
    })),
    ...options.customMetadata,
  };

  return JSON.stringify(metadata, null, 2);
}

/**
 * Package export result as a ZIP file
 */
export async function packageAsZip(
  exportResult: MultiPageExportResult,
  options: Partial<ZipOptions> = {},
): Promise<ZipResult> {
  const opts: ZipOptions = { ...DEFAULT_ZIP_OPTIONS, ...options };

  if (exportResult.pages.length === 0) {
    throw createAppError("E-EXPORT-005", "No pages to package");
  }

  try {
    // Prepare files for ZIP
    const files: Record<string, Uint8Array> = {};
    const filenames: string[] = [];
    let totalUncompressedSize = 0;

    // Add page images
    for (let i = 0; i < exportResult.pages.length; i++) {
      const page = exportResult.pages[i]!;
      const filename = generatePageFilename(
        i,
        exportResult.totalPages,
        opts.baseFilename,
        page.meta.format,
      );
      filenames.push(filename);

      const data = await blobToUint8Array(page.blob);
      files[filename] = data;
      totalUncompressedSize += data.length;
    }

    // Add metadata if requested
    if (opts.includeMetadata) {
      const metadataContent = createMetadataContent(
        exportResult,
        filenames,
        opts,
      );
      const metadataFilename = "metadata.json";
      files[metadataFilename] = strToU8(metadataContent);
      filenames.push(metadataFilename);
      totalUncompressedSize += metadataContent.length;
    }

    // Create ZIP with fflate
    // Cast compressionLevel to valid range (0-9)
    const level = (opts.compressionLevel ?? 6) as
      | 0
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6
      | 7
      | 8
      | 9;
    const zipped = zipSync(files, {
      level,
    });

    // Create Blob - create a new ArrayBuffer from the Uint8Array for type safety
    const buffer = new ArrayBuffer(zipped.byteLength);
    new Uint8Array(buffer).set(zipped);
    const blob = new Blob([buffer], { type: "application/zip" });

    return {
      blob,
      size: blob.size,
      files: filenames,
      meta: {
        totalPages: exportResult.totalPages,
        packagedAt: new Date().toISOString(),
        compressionRatio:
          totalUncompressedSize > 0
            ? Number((blob.size / totalUncompressedSize).toFixed(2))
            : 1,
      },
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    throw createAppError("E-EXPORT-005", `ZIP packaging failed: ${detail}`);
  }
}

/**
 * Generate a suggested filename for the ZIP file
 */
export function generateZipFilename(title?: string, date?: Date): string {
  const dateStr = (date || new Date()).toISOString().split("T")[0];
  const sanitizedTitle = title
    ? title
        .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_") // Keep alphanumeric and Chinese
        .replace(/_+/g, "_") // Collapse multiple underscores
        .substring(0, 50) // Limit length
    : "conversation";

  return `${sanitizedTitle}_${dateStr}.zip`;
}

/**
 * Trigger browser download for a Blob
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL after a delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Download a ZIP file
 */
export function downloadZip(zipResult: ZipResult, filename: string): void {
  triggerDownload(zipResult.blob, filename);
}

/**
 * Download a single image
 */
export function downloadImage(blob: Blob, filename = "export.png"): void {
  triggerDownload(blob, filename);
}
